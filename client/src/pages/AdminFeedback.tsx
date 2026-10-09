import { Archive, Check, RotateCcw, Star, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getFeedback,
  updateFeedbackStatus,
  deleteFeedback,
  type Feedback,
  type FeedbackStatus,
} from "@/services/feedback";

const FILTERS: { value: "all" | FeedbackStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "reviewed", label: "Reviewed" },
  { value: "archived", label: "Archived" },
];

const chipStyle = (active: boolean): React.CSSProperties => ({
  padding: "6px 11px",
  borderRadius: 4,
  border: active ? "1px solid #285d45" : "1px solid #dfe1dc",
  background: active ? "#285d45" : "#fff",
  color: active ? "#fff" : "#4a554d",
  fontSize: 10,
  fontWeight: 600,
  cursor: "pointer",
});

const actionStyle = (tone: "green" | "red" | "gray"): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "5px 9px",
  background:
    tone === "green" ? "#e8f0ea" : tone === "red" ? "#fde8e8" : "#eef0ee",
  color: tone === "green" ? "#285d45" : tone === "red" ? "#b44" : "#4a554d",
  borderRadius: 4,
  fontSize: 10,
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
});

function RatingStars({ rating }: { rating: number }) {
  return (
    <span
      style={{ display: "inline-flex", gap: 3, alignItems: "center" }}
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map(value => (
        <Star
          key={value}
          size={15}
          color={value <= rating ? "#c9ad73" : "rgba(42,25,20,.22)"}
          fill={value <= rating ? "#c9ad73" : "none"}
        />
      ))}
    </span>
  );
}

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | FeedbackStatus>("all");
  const [deleteTarget, setDeleteTarget] = useState<Feedback | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = () => {
    setLoading(true);
    getFeedback()
      .then(setFeedback)
      .catch(() => toast.error("Failed to load feedback"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(
    () =>
      filter === "all" ? feedback : feedback.filter(f => f.status === filter),
    [feedback, filter]
  );

  const newCount = feedback.filter(f => f.status === "new").length;

  const handleStatus = async (item: Feedback, status: FeedbackStatus) => {
    try {
      await updateFeedbackStatus(item.id, status);
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update feedback");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteFeedback(deleteTarget.id);
      toast.success("Feedback deleted");
      setDeleteTarget(null);
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete feedback");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="admin-table-head">
        <div>
          <p>Customer feedback</p>
          <span>
            {feedback.length} submission{feedback.length !== 1 ? "s" : ""}
            {newCount > 0 ? ` · ${newCount} new` : ""}
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {FILTERS.map(f => (
            <button
              key={f.value}
              style={chipStyle(filter === f.value)}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "20px", color: "#728077", fontSize: 12 }}>
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#728077" }}>
          <p>No {filter === "all" ? "" : `${filter} `}feedback yet.</p>
        </div>
      ) : (
        <div className="admin-simple-grid">
          {filtered.map(item => (
            <article key={item.id}>
              <span>
                {formatDate(item.created_at)} · {item.status}
              </span>
              <strong>
                <RatingStars rating={item.rating} />
              </strong>
              <p>{item.message || "No message provided."}</p>
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginTop: 8,
                  flexWrap: "wrap",
                }}
              >
                {item.status !== "reviewed" && (
                  <button
                    style={actionStyle("green")}
                    onClick={() => handleStatus(item, "reviewed")}
                  >
                    <Check size={13} /> Mark reviewed
                  </button>
                )}
                {item.status !== "archived" ? (
                  <button
                    style={actionStyle("gray")}
                    onClick={() => handleStatus(item, "archived")}
                  >
                    <Archive size={13} /> Archive
                  </button>
                ) : (
                  <button
                    style={actionStyle("gray")}
                    onClick={() => handleStatus(item, "new")}
                  >
                    <RotateCcw size={13} /> Restore
                  </button>
                )}
                <button
                  style={actionStyle("red")}
                  onClick={() => setDeleteTarget(item)}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={open => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete feedback?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this feedback submission. This cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              style={{ background: "#b44", color: "white" }}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
