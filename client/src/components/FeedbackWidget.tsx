import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useLocation } from "wouter";
import FeedbackModal from "./FeedbackModal";

const TIP_DELAY_MS = 4000;

export default function FeedbackWidget() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [touched, setTouched] = useState(false);

  const hidden = location.startsWith("/admin");

  useEffect(() => {
    if (hidden || touched) return;
    const timer = setTimeout(() => setShowTip(true), TIP_DELAY_MS);
    return () => clearTimeout(timer);
  }, [hidden, touched]);

  const handleOpen = () => {
    setTouched(true);
    setShowTip(false);
    setOpen(true);
  };

  if (hidden) return null;

  return (
    <>
      <div className="fb-widget">
        {showTip && !touched && (
          <div className="fb-widget-tip" role="status">
            <span>Share your experience</span>
            <button
              className="fb-widget-tip-close"
              aria-label="Dismiss feedback prompt"
              onClick={() => {
                setTouched(true);
                setShowTip(false);
              }}
            >
              <X size={12} />
            </button>
          </div>
        )}
        <button
          className="fb-widget-btn"
          aria-label="Open feedback form"
          onClick={handleOpen}
        >
          <MessageCircle size={24} fill="currentColor" />
        </button>
      </div>

      <FeedbackModal open={open} onOpenChange={setOpen} />
    </>
  );
}
