import { FormEvent, useEffect, useState } from "react";
import { ArrowUpRight, Star } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { submitFeedback } from "@/services/feedback";

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Great",
  5: "Excellent",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function FeedbackModal({ open, onOpenChange }: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset the form when the modal closes after a successful submission,
  // so the next visit starts fresh. Drafts are kept if nothing was sent.
  useEffect(() => {
    if (!open && sent) {
      setRating(0);
      setHovered(0);
      setMessage("");
      setSent(false);
    }
  }, [open, sent]);

  const activeRating = hovered || rating;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!rating || sent || loading) return;
    setLoading(true);
    try {
      await submitFeedback({ rating, message: message.trim() || undefined });
      setSent(true);
      toast.success("Thank you for your feedback!", {
        description: "We read every note and use it to improve.",
      });
    } catch (err: any) {
      toast.error("Failed to send", {
        description: err.message || "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <p className="fb-modal-eyebrow">MK Studio · Feedback</p>

        {sent ? (
          <>
            <DialogTitle>Thank you.</DialogTitle>
            <DialogDescription className="fb-modal-note">
              Thanks for taking the time — your feedback helps us improve the MK
              Studio experience.
            </DialogDescription>
          </>
        ) : (
          <>
            <DialogTitle>
              Tell us how
              <br />
              <em>we did.</em>
            </DialogTitle>
            <DialogDescription>
              Rate your experience — it takes less than a minute, and every note
              is read by the team.
            </DialogDescription>

            <form className="fb-modal-form" onSubmit={submit}>
              <div
                className="fb-stars"
                role="radiogroup"
                aria-label="Rating out of 5"
              >
                {[1, 2, 3, 4, 5].map(value => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={rating === value}
                    aria-label={`${value} star${value > 1 ? "s" : ""}`}
                    className={value <= activeRating ? "is-on" : ""}
                    onMouseEnter={() => setHovered(value)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(value)}
                  >
                    <Star
                      size={26}
                      fill={value <= activeRating ? "currentColor" : "none"}
                    />
                  </button>
                ))}
              </div>
              <p className="fb-stars-label" aria-live="polite">
                {activeRating ? RATING_LABELS[activeRating] : "Select a rating"}
              </p>

              <label>
                Anything you&apos;d like to tell us?
                <textarea
                  name="message"
                  rows={3}
                  maxLength={2000}
                  placeholder="What worked, what didn't, what you'd love to see…"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
              </label>

              <button
                className="fb-modal-btn"
                type="submit"
                disabled={loading || !rating}
              >
                {loading ? "Sending..." : "Send Feedback"}{" "}
                <ArrowUpRight size={15} />
              </button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
