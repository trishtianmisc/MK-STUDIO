-- =============================================================================
-- MK Studio — Profiles & Admin Authorization
-- =============================================================================
-- Creates a profiles table linked to Supabase Auth users.
-- The is_admin flag controls access to the admin area.
--
-- Profile rows are created lazily on first login (server-side only).
-- The first admin account must be created manually:
--   1. Create user in Supabase Dashboard → Authentication → Users
--   2. INSERT INTO profiles (id, is_admin) VALUES ('<user-uuid>', true);
-- =============================================================================

-- =============================================================================
-- PROFILES
-- =============================================================================
CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin   BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE profiles IS 'Application user profiles linked to Supabase Auth';
COMMENT ON COLUMN profiles.id IS 'References auth.users(id)';
COMMENT ON COLUMN profiles.is_admin IS 'Whether the user has administrator privileges';

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read their own profile (needed for client-side admin check)
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- =============================================================================
-- UPDATED_AT TRIGGER
-- =============================================================================
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
