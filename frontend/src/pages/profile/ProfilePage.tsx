import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateMe } from "../../api/users";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { Input, TextArea } from "../../components/ui/Field";
import { ApiException } from "../../lib/api";

export function ProfilePage() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName ?? "");
      setBio(user.bio ?? "");
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: updateMe,
    onSuccess: (updated) => {
      setUser(updated);
      setError(null);
      setFieldErrors(null);
      showToast("Profile updated", "success");
    },
    onError: (err) => {
      if (err instanceof ApiException) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError("Failed to update profile. Please try again.");
      }
    },
  });

  if (!user) return null;

  const isDirty = fullName !== (user.fullName ?? "") || bio !== (user.bio ?? "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors(null);
    updateMutation.mutate({ fullName, bio });
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500">Manage your personal information</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-4">
          <Avatar name={user.fullName || user.username} size="md" />
          <div>
            <p className="font-semibold text-gray-900">{user.username}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}

          <Input
            id="profile-fullname"
            label="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={fieldErrors?.fullName}
            placeholder="Your name"
          />

          <TextArea
            id="profile-bio"
            label="Bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            error={fieldErrors?.bio}
            placeholder="Tell your team a bit about yourself"
          />

          <div className="flex justify-end">
            <Button type="submit" isLoading={updateMutation.isPending} disabled={!isDirty}>
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
