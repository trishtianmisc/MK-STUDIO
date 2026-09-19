import { ArrowLeft, Upload, FileSpreadsheet, FolderOpen, Check, AlertTriangle, X, PackageOpen } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { createProduct, type CreateProductInput } from "@/services/products";
import { getCategories, type Category } from "@/services/categories";
import { supabase } from "@/lib/supabase";
import { optimizeImage } from "@/lib/image-optimizer";

interface Props {
  categories: Category[];
  onDone: () => void;
  onCancel: () => void;
}

interface ParsedRow {
  no: string;
  name: string;
  category: string;
  rental_price: string;
  additional_price: string;
  style: string;
  length: string;
  brand: string;
  sizes: string;
  closet: string;
  imageFile: File | null;
  imageMatched: boolean;
  status: "ready" | "warning" | "error";
  statusMessage: string;
}

function autoSlug(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function generateUniqueSlug(base: string, existingSlugs: Set<string>) {
  let slug = autoSlug(base);
  if (!slug) slug = "product";
  let candidate = slug;
  let counter = 2;
  while (existingSlugs.has(candidate)) {
    candidate = `${slug}-${counter}`;
    counter++;
  }
  existingSlugs.add(candidate);
  return candidate;
}

export default function AdminBulkUpload({ categories, onDone, onCancel }: Props) {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<{ created: number; warnings: number; errors: number } | null>(null);
  const [done, setDone] = useState(false);

  const excelInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c]));
  const existingSlugs = new Set<string>();

  const handleExcelSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFile(file);
    parseExcel(file);
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    setImageFiles(arr);
    if (rows.length > 0) matchImages(arr, rows);
  };

  const parseExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

      const parsed: ParsedRow[] = jsonData.map((row) => {
        const getValue = (keys: string[]) => {
          for (const key of keys) {
            for (const k of Object.keys(row)) {
              if (k.toLowerCase().trim() === key) return String(row[k] ?? "").trim();
            }
          }
          return "";
        };

        return {
          no: getValue(["no", "No.", "no.", "number", "#"]),
          name: getValue(["name", "Name", "product name"]),
          category: getValue(["category", "Category"]),
          rental_price: getValue(["rental_price", "rental price", "price"]),
          additional_price: getValue(["additional_price", "additional price", "additional_day_price"]),
          style: getValue(["style", "Style"]),
          length: getValue(["length", "Length"]),
          brand: getValue(["brand", "Brand"]),
          sizes: getValue(["sizes", "Sizes", "size"]),
          closet: getValue(["closet", "Closet"]) || "MK STUDIO",
          imageFile: null,
          imageMatched: false,
          status: "ready" as const,
          statusMessage: "",
        };
      });

      const updated = validateRows(parsed);
      setRows(updated);
      if (imageFiles.length > 0) matchImages(imageFiles, updated);
    };
    reader.readAsArrayBuffer(file);
  };

  const matchImages = (files: File[], currentRows: ParsedRow[]) => {
    const fileMap = new Map<string, File>();
    for (const f of files) {
      const nameWithoutExt = f.name.replace(/\.[^.]+$/, "").trim();
      fileMap.set(nameWithoutExt, f);
    }

    const updated = currentRows.map(row => {
      if (!row.no) return { ...row, imageFile: null, imageMatched: false };
      const matchedFile = fileMap.get(row.no);
      if (matchedFile) {
        return { ...row, imageFile: matchedFile, imageMatched: true };
      }
      return { ...row, imageFile: null, imageMatched: false };
    });

    setRows(validateRows(updated));
  };

  const validateRows = (parsed: ParsedRow[]) => {
    return parsed.map(row => {
      const errors: string[] = [];
      if (!row.name) errors.push("Missing name");
      if (!row.category) errors.push("Missing category");
      if (!row.rental_price || isNaN(Number(row.rental_price))) errors.push("Invalid price");
      if (row.category && !categoryMap.has(row.category.toLowerCase())) {
        errors.push(`Unknown category "${row.category}"`);
      }

      if (errors.length > 0) {
        const hasCritical = !row.name || !row.category || !row.rental_price ||
          (row.category && !categoryMap.has(row.category.toLowerCase()));
        return {
          ...row,
          status: hasCritical ? "error" as const : "warning" as const,
          statusMessage: errors.join("; "),
        };
      }

      if (!row.imageMatched && row.imageFile === null) {
        return { ...row, status: "warning" as const, statusMessage: "No matching image found" };
      }

      return { ...row, status: "ready" as const, statusMessage: "" };
    });
  };

  const handleUpload = async () => {
    const validRows = rows.filter(r => r.status !== "error");
    if (validRows.length === 0) {
      toast.error("No valid rows to upload");
      return;
    }

    setUploading(true);
    setProgress({ current: 0, total: validRows.length });
    let created = 0;
    let warnings = 0;
    let errors = 0;

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      setProgress({ current: i + 1, total: validRows.length });

      try {
        let imageUrl: string | undefined;

        if (row.imageFile) {
          const optimized = await optimizeImage(row.imageFile);
          const ext = optimized.name.split(".").pop() || "webp";
          const fileName = `${Date.now()}-${row.no.replace(/[^a-zA-Z0-9.-]/g, "_")}.${ext}`;
          const storagePath = `products/${fileName}`;
          const arrayBuffer = await optimized.arrayBuffer();
          const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(storagePath, arrayBuffer, {
              contentType: optimized.type,
              cacheControl: "31536000",
              upsert: false,
            });
          if (uploadError) throw uploadError;
          const { data } = supabase.storage.from("product-images").getPublicUrl(storagePath);
          imageUrl = data.publicUrl;
        }

        const cat = categoryMap.get(row.category.toLowerCase());
        const input: CreateProductInput = {
          category_id: cat!.id,
          name: row.name,
          slug: generateUniqueSlug(row.name, existingSlugs),
          rental_price: Number(row.rental_price),
          closet: row.closet || "MK STUDIO",
          is_public: true,
          is_featured: false,
        };

        if (imageUrl) input.image = imageUrl;
        if (row.additional_price && !isNaN(Number(row.additional_price))) {
          input.additional_day_price = Number(row.additional_price);
        }
        if (row.style) input.style = row.style;
        if (row.length) input.length = row.length;
        if (row.brand) input.brand = row.brand;
        if (row.sizes) input.sizes = row.sizes.split(",").map(s => s.trim()).filter(Boolean);

        await createProduct(input);
        created++;
        if (!row.imageMatched) warnings++;
      } catch (err: unknown) {
        errors++;
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error(`Failed to create product "${row.name}":`, message);
      }
    }

    setResults({ created, warnings, errors });
    setDone(true);
    setUploading(false);
    toast.success(`Bulk upload complete: ${created} created`);
  };

  const readyCount = rows.filter(r => r.status === "ready").length;
  const warningCount = rows.filter(r => r.status === "warning").length;
  const errorCount = rows.filter(r => r.status === "error").length;

  if (done && results) {
    return (
      <div className="admin-editor">
        <div className="admin-editor-head">
          <button className="admin-back-link" onClick={onDone}><ArrowLeft size={15} /> Back to products</button>
          <div>
            <span className="admin-section-kicker">Bulk upload</span>
            <h2>Upload complete</h2>
          </div>
        </div>
        <div style={{ padding: "40px 20px", textAlign: "center" }}>
          <Check size={48} style={{ color: "#4caf50", marginBottom: 16 }} />
          <h3 style={{ marginBottom: 8 }}>{results.created} products created</h3>
          <p style={{ color: "#666", marginBottom: 24 }}>
            {results.warnings > 0 && `${results.warnings} warnings (missing images) · `}
            {results.errors > 0 && `${results.errors} errors`}
            {!results.warnings && !results.errors && "All products uploaded successfully."}
          </p>
          <button className="admin-primary-button" onClick={onDone}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-editor">
      <div className="admin-editor-head">
        <button className="admin-back-link" onClick={onCancel}><ArrowLeft size={15} /> Back to products</button>
        <div>
          <span className="admin-section-kicker">Bulk upload</span>
          <h2>Upload products from Excel</h2>
          <p>Select an Excel file and a folder of images to bulk create products.</p>
        </div>
      </div>

      <div style={{ padding: "0 20px" }}>
        <section className="admin-form-card" style={{ marginBottom: 16 }}>
          <div className="admin-form-card-head">
            <div><span>01</span><h3>Excel file</h3></div>
            <p>Columns: No., name, category, rental_price, additional_price, style, length, brand, sizes, closet</p>
          </div>
          <div style={{ padding: "16px 20px" }}>
            <input ref={excelInputRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }} onChange={handleExcelSelect} />
            {excelFile ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <FileSpreadsheet size={20} style={{ color: "#4caf50" }} />
                <span style={{ fontWeight: 600 }}>{excelFile.name}</span>
                <span style={{ color: "#888", fontSize: 12 }}>({rows.length} rows)</span>
                <button type="button" onClick={() => { setExcelFile(null); setRows([]); if (excelInputRef.current) excelInputRef.current.value = ""; }} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#999" }}><X size={16} /></button>
              </div>
            ) : (
              <button type="button" onClick={() => excelInputRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", border: "2px dashed #dfe1dc", background: "#faf8f5", color: "#8c7669", cursor: "pointer", fontSize: 13, fontWeight: 600, width: "100%", justifyContent: "center" }}>
                <FileSpreadsheet size={18} /> Select Excel file
              </button>
            )}
          </div>
        </section>

        <section className="admin-form-card" style={{ marginBottom: 16 }}>
          <div className="admin-form-card-head">
            <div><span>02</span><h3>Image folder</h3></div>
            <p>Image filenames should match the No. column (e.g., 85.png, 86.jpg)</p>
          </div>
          <div style={{ padding: "16px 20px" }}>
            <input
              ref={folderInputRef}
              type="file"
              /* @ts-expect-error webkitdirectory is non-standard */
              webkitdirectory=""
              multiple
              style={{ display: "none" }}
              onChange={handleFolderSelect}
            />
            {imageFiles.length > 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <FolderOpen size={20} style={{ color: "#4caf50" }} />
                <span style={{ fontWeight: 600 }}>{imageFiles.length} images</span>
                <button type="button" onClick={() => {
                  setImageFiles([]);
                  if (rows.length > 0) {
                    const updated = rows.map(r => ({ ...r, imageFile: null, imageMatched: false }));
                    setRows(validateRows(updated));
                  }
                  if (folderInputRef.current) folderInputRef.current.value = "";
                }} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#999" }}>
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => folderInputRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", border: "2px dashed #dfe1dc", background: "#faf8f5", color: "#8c7669", cursor: "pointer", fontSize: 13, fontWeight: 600, width: "100%", justifyContent: "center" }}>
                <FolderOpen size={18} /> Select image folder
              </button>
            )}
          </div>
        </section>

        {rows.length > 0 && (
          <section className="admin-form-card" style={{ marginBottom: 16 }}>
            <div className="admin-form-card-head">
              <div><span>03</span><h3>Preview</h3></div>
              <p>
                <span style={{ color: "#4caf50" }}>{readyCount} ready</span> · {" "}
                {warningCount > 0 && <span style={{ color: "#ff9800" }}>{warningCount} warnings</span>}
                {warningCount > 0 && errorCount > 0 && " · "}
                {errorCount > 0 && <span style={{ color: "#f44336" }}>{errorCount} errors</span>}
              </p>
            </div>
            <div style={{ padding: "16px 20px", maxHeight: 400, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #eee", textAlign: "left" }}>
                    <th style={{ padding: "8px 6px" }}>No.</th>
                    <th style={{ padding: "8px 6px" }}>Name</th>
                    <th style={{ padding: "8px 6px" }}>Category</th>
                    <th style={{ padding: "8px 6px" }}>Price</th>
                    <th style={{ padding: "8px 6px" }}>Closet</th>
                    <th style={{ padding: "8px 6px" }}>Image</th>
                    <th style={{ padding: "8px 6px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f0f0f0", opacity: row.status === "error" ? 0.5 : 1 }}>
                      <td style={{ padding: "8px 6px" }}>{row.no || "—"}</td>
                      <td style={{ padding: "8px 6px" }}>{row.name || <span style={{ color: "#f44336" }}>Missing</span>}</td>
                      <td style={{ padding: "8px 6px" }}>{row.category || <span style={{ color: "#f44336" }}>Missing</span>}</td>
                      <td style={{ padding: "8px 6px" }}>{row.rental_price || <span style={{ color: "#f44336" }}>Missing</span>}</td>
                      <td style={{ padding: "8px 6px" }}>{row.closet || "MK STUDIO"}</td>
                      <td style={{ padding: "8px 6px" }}>
                        {row.imageMatched ? <Check size={14} style={{ color: "#4caf50" }} /> : <AlertTriangle size={14} style={{ color: "#ff9800" }} />}
                      </td>
                      <td style={{ padding: "8px 6px" }}>
                        {row.status === "ready" && <span style={{ color: "#4caf50" }}>Ready</span>}
                        {row.status === "warning" && <span style={{ color: "#ff9800" }} title={row.statusMessage}>Warning</span>}
                        {row.status === "error" && <span style={{ color: "#f44336" }} title={row.statusMessage}>Error</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {rows.length > 0 && (
          <div style={{ display: "flex", gap: 12, paddingBottom: 40 }}>
            <button
              className="admin-primary-button"
              onClick={handleUpload}
              disabled={uploading || readyCount === 0}
              style={{ opacity: uploading || readyCount === 0 ? 0.5 : 1 }}
            >
              <Upload size={16} /> {uploading ? `Uploading ${progress.current}/${progress.total}...` : `Upload ${readyCount} products`}
            </button>
            <button className="admin-secondary-button" onClick={onCancel} disabled={uploading}>Cancel</button>
          </div>
        )}

        {rows.length === 0 && !excelFile && (
          <div className="admin-empty-state" style={{ marginTop: 40 }}>
            <PackageOpen size={28} />
            <strong>Upload your product catalogue</strong>
            <span>Select an Excel file to get started. Each row becomes a product.</span>
          </div>
        )}
      </div>
    </div>
  );
}
