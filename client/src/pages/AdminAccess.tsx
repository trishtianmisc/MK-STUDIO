import { ArrowLeft, ArrowUpRight, LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";
import { useLocation } from "wouter";
import AdminPreview from "./AdminPreview";
import {
  clearAdminPreviewSession,
  grantAdminPreviewSession,
  hasAdminPreviewSession,
  validateAdminCredentials,
} from "@/lib/adminAccess";

export default function AdminAccess() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(hasAdminPreviewSession);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!validateAdminCredentials(username, password)) {
      setError("The username or password is not recognised.");
      return;
    }
    grantAdminPreviewSession();
    setIsAuthenticated(true);
  };

  const signOut = () => {
    clearAdminPreviewSession();
    setPassword("");
    setIsAuthenticated(false);
  };

  if (isAuthenticated) return <AdminPreview onSignOut={signOut} />;

  return (
    <main className="admin-access-page">
      <button className="admin-access-return" onClick={() => setLocation("/")}>
        <ArrowLeft size={16} /> Return to MK Studio
      </button>
      <section className="admin-access-panel">
        <div className="admin-access-mark"><LockKeyhole size={19} /></div>
        <p className="eyebrow">Private studio access</p>
        <h1>Studio<br /><em>sign in.</em></h1>
        <p className="admin-access-intro">Enter the temporary studio credentials to open the MK Studio management preview.</p>
        <form onSubmit={submit}>
          <label>Username<input autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} placeholder="Studio username" required /></label>
          <label>Password<input autoComplete="current-password" type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Password" required /></label>
          {error && <p className="admin-access-error" role="alert">{error}</p>}
          <button className="editorial-button editorial-button-light" type="submit">Open studio preview <ArrowUpRight size={16} /></button>
        </form>
        <p className="admin-access-note">Temporary frontend-only access. This gate is not secure and will be replaced with proper authentication in the backend phase.</p>
      </section>
    </main>
  );
}
