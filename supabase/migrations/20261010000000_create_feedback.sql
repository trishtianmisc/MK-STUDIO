-- =============================================================================
-- MK Studio — Customer Feedback
-- =============================================================================
-- Creates the feedback table for ratings and comments submitted from the
-- public /feedback page. Reviewed in the admin dashboard.

CREATE TABLE feedback (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  message     TEXT,
  status      TEXT NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'reviewed', 'archived')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE feedback IS 'Customer feedback submitted from the /feedback page';
COMMENT ON COLUMN feedback.rating IS 'Star rating from 1 to 5';
COMMENT ON COLUMN feedback.message IS 'Optional free-text comment';
COMMENT ON COLUMN feedback.status IS 'new = unread, reviewed = seen by admin, archived = dismissed';

CREATE INDEX idx_feedback_created_at ON feedback (created_at DESC);
CREATE INDEX idx_feedback_status ON feedback (status);

-- RLS enabled with no public policies: all reads/writes go through the API
-- server's service-role client (bypasses RLS) — same model as rental_dates.
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
