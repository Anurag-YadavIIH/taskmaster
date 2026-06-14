import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { Input } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { ApiException } from "../../lib/api";

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/tasks" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors(null);
    setIsSubmitting(true);
    try {
      await register({
        username,
        email,
        password,
        fullName: fullName.trim() ? fullName.trim() : undefined,
      });
      navigate("/tasks", { replace: true });
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError("Unable to create account. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start organizing your team's work with TaskMaster"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <Input
          id="username"
          label="Username"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={fieldErrors?.username}
          placeholder="janedoe"
        />

        <Input
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors?.email}
          placeholder="you@example.com"
        />

        <Input
          id="fullName"
          label="Full name (optional)"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={fieldErrors?.fullName}
          placeholder="Jane Doe"
        />

        <Input
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors?.password}
          placeholder="••••••••"
        />

        <Button type="submit" isLoading={isSubmitting} icon={<UserPlus className="h-4 w-4" />} className="mt-2">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
