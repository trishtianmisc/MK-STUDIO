import { LockKeyhole, ArrowLeft, ArrowUpRight } from "lucide-react";
import { FormEvent, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminAccess() {
  const { user, loading, isAdmin, signIn } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Still checking session
  if (loading) {
    return (
      <main className="admin-access-page">
        <section className="admin-access-panel">
          <p className="admin-access-intro">Checking session...</p>
        </section>
      </main>
    );
  }

  // Already logged in as admin — redirect to dashboard
  if (user && isAdmin) {
    setLocation("/admin/dashboard");
    return null;
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await signIn(email, password);

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    // signIn succeeded — the AuthContext will update user/isAdmin
    // and the redirect will happen on next render via the check above
    setSubmitting(false);
  };

  return (
    <main className="admin-access-page">
      <button className="admin-access-return" onClick={() => setLocation("/")}>
        <ArrowLeft size={16} /> Return to MK Studio
      </button>
      <section className="admin-access-panel">
        <div className="admin-access-mark"><LockKeyhole size={19} /></div>
        <p className="eyebrow">Private studio access</p>
        <h1>Studio<br /><em>sign in.</em></h1>
        <p className="admin-access-intro">Enter your administrator credentials to access the MK Studio management area.</p>
        <form onSubmit={submit}>
          <label>Email<input autoComplete="email" type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="admin@mkstudio.com" required /></label>
          <label>Password<input autoComplete="current-password" type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Password" required /></label>
          {error && <p className="admin-access-error" role="alert">{error}</p>}
          <button className="editorial-button editorial-button-light" type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : <>Sign in <ArrowUpRight size={16} /></>}
          </button>
        </form>
        {user && !isAdmin && (
          <p className="admin-access-error" role="alert">
            Your account does not have administrator privileges.
          </p>
        )}
      </section>
    </main>
  );
}
