import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import ErrorBanner from "../../components/common/ErrorBanner";

export default function Login() {
  const { login, user, isLoading: sessionLoading } = useAuth();
  const navigate = useNavigate(); const location = useLocation();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [isSubmitting, setIsSubmitting] = useState(false);
  if (!sessionLoading && user) return <Navigate to={location.state?.from?.pathname || "/" + user.role + "/dashboard"} replace />;
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setIsSubmitting(true);
    try { const u = await login(email, password); navigate("/" + u.role + "/dashboard", { replace: true }); }
    catch (err) { setError(err.response?.data?.message || "Invalid email or password."); }
    finally { setIsSubmitting(false); }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 h-1.5 w-10 rounded-full bg-accent" />
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink">DSCMS</h1>
          <p className="mt-1 text-sm font-medium text-muted">Digital Student Counseling Management System</p>
          <p className="mt-0.5 text-xs text-muted/70">Shri Vishnu Engineering College for Women (Autonomous)</p>
        </div>
        <div className="card p-6">
          <h2 className="mb-1 text-base font-semibold text-ink">Sign in</h2>
          <p className="mb-5 text-sm text-muted">Use the college email and password issued to you by the administrator.</p>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input label="College email" type="email" placeholder="you@svecw.edu.in" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <ErrorBanner message={error} />}
            <Button type="submit" isLoading={isSubmitting} className="w-full">Sign in</Button>
          </form>
          <p className="mt-5 text-center text-xs text-muted">Registration is disabled. Accounts are created by the administrator — contact the Counseling Cell if you need access.</p>
        </div>
        <p className="mt-4 text-center text-xs text-muted/50">SVECW · Counseling Cell · 2026</p>
      </div>
    </div>
  );
}