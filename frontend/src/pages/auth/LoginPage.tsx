import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { Input } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { ApiException } from "../../lib/api";

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    const redirectTo = (location.state as { from?: string } | null)?.from ?? "/tasks";
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ usernameOrEmail, password });
      navigate("/tasks", { replace: true });
    } catch (err) {
      setError(err instanceof ApiException ? err.message : "Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your TaskMaster account"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <Input
          id="usernameOrEmail"
          label="Username or email"
          type="text"
          autoComplete="username"
          required
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
          placeholder="you@example.com"
        />

        <Input
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <Button type="submit" isLoading={isSubmitting} icon={<LogIn className="h-4 w-4" />} className="mt-2">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
