import { ArrowLeft, ArrowUp, ArrowDown, Star, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getProductImages, uploadProductImage, deleteProductImage, updateProductImage, reorderProductImages } from "@/services/images";
import type { ProductWithRelations } from "@/services/products";

interface ImageRecord {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

interface Props {
  product: ProductWithRelations;
  onDone: () => void;
  onCancel: () => void;
}

export default function AdminImageManager({ product, onDone, onCancel }: Props) {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ImageRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refresh = () => {
    setLoading(true);
    getProductImages(product.id)
      .then(setImages)
      .catch(() => toast.error("Failed to load images"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, [product.id]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5 MB limit`);
        continue;
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error(`${file.name} must be JPEG, PNG, or WebP`);
        continue;
      }
      try {
        await uploadProductImage(file, product.id, { sort_order: images.length + i });
      } catch (err: any) {
        toast.error(err.message || `Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    refresh();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSetPrimary = async (image: ImageRecord) => {
    try {
      await updateProductImage(image.id, { is_primary: true });
      toast.success("Primary image updated");
      refresh();
    } catch {
      toast.error("Failed to set primary image");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProductImage(deleteTarget.id);
      toast.success("Image deleted");
      setDeleteTarget(null);
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete image");
    } finally {
      setDeleting(false);
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const newImages = [...images];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newImages.length) return;

    const tempSort = newImages[index].sort_order;
    newImages[index].sort_order = newImages[swapIndex].sort_order;
    newImages[swapIndex].sort_order = tempSort;

    // Swap in array
    [newImages[index], newImages[swapIndex]] = [newImages[swapIndex], newImages[index]];

    setImages(newImages);

    try {
      await reorderProductImages(newImages.map(img => ({ id: img.id, sort_order: img.sort_order })));
    } catch {
      toast.error("Failed to reorder");
      refresh();
    }
  };

  const sortedImages = [...images].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <>
      <div className="admin-table-head">
        <div>
          <button onClick={onCancel} style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#657269", fontSize: 11, fontWeight: 600, marginBottom: 8, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
            <ArrowLeft size={14} /> Back to products
          </button>
          <p>Images — {product.name}</p>
          <span>{images.length}/10 images</span>
        </div>
        <div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: "none" }} onChange={e => handleUpload(e.target.files)} />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading || images.length >= 10}>
            <Upload size={16} /> {uploading ? "Uploading..." : "Upload image"}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "20px", color: "#728077", fontSize: 12 }}>Loading images...</div>
      ) : sortedImages.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#728077" }}>
          <p>No images uploaded yet. Click "Upload image" to add photos.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12, maxWidth: 700 }}>
          {sortedImages.map((image, index) => (
            <div key={image.id} style={{ display: "flex", gap: 14, alignItems: "center", padding: "12px 16px", background: "#fff", border: "1px solid #dfe1dc", borderRadius: 6 }}>
              <img src={image.url} alt={image.alt_text ?? ""} style={{ width: 56, height: 68, objectFit: "cover", borderRadius: 4 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <strong style={{ fontSize: 12, color: "#28342d" }}>#{index + 1}</strong>
                  {image.is_primary && <span style={{ fontSize: 9, fontWeight: 700, color: "#c5952a", background: "#fdf6e3", padding: "2px 6px", borderRadius: 10 }}>PRIMARY</span>}
                </div>
                <span style={{ fontSize: 10, color: "#8a928c" }}>{image.alt_text || "No alt text"}</span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => handleMove(index, "up")} disabled={index === 0} style={{ width: 27, height: 27, display: "grid", placeItems: "center", color: index === 0 ? "#ccc" : "#657269", borderRadius: 3, border: "none", background: "none", cursor: index === 0 ? "default" : "pointer" }} title="Move up">
                  <ArrowUp size={14} />
                </button>
                <button onClick={() => handleMove(index, "down")} disabled={index === sortedImages.length - 1} style={{ width: 27, height: 27, display: "grid", placeItems: "center", color: index === sortedImages.length - 1 ? "#ccc" : "#657269", borderRadius: 3, border: "none", background: "none", cursor: index === sortedImages.length - 1 ? "default" : "pointer" }} title="Move down">
                  <ArrowDown size={14} />
                </button>
                {!image.is_primary && (
                  <button onClick={() => handleSetPrimary(image)} style={{ width: 27, height: 27, display: "grid", placeItems: "center", color: "#c5952a", borderRadius: 3, border: "none", background: "none", cursor: "pointer" }} title="Set as primary">
                    <Star size={14} />
                  </button>
                )}
                <button onClick={() => setDeleteTarget(image)} style={{ width: 27, height: 27, display: "grid", placeItems: "center", color: "#b44", borderRadius: 3, border: "none", background: "none", cursor: "pointer" }} title="Delete image">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete image?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} style={{ background: "#b44", color: "white" }}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
