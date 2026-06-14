import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Modal } from "../../components/ui/Modal";
import { Input, TextArea } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";
import { createTeam } from "../../api/teams";
import { ApiException } from "../../lib/api";

interface NewTeamModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewTeamModal({ open, onClose }: NewTeamModalProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);

  const createMutation = useMutation({
    mutationFn: createTeam,
    onSuccess: (team) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      showToast("Team created", "success");
      handleClose();
      navigate(`/teams/${team.id}`);
    },
    onError: (err) => {
      if (err instanceof ApiException) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError("Failed to create team. Please try again.");
      }
    },
  });

  function handleClose() {
    setName("");
    setDescription("");
    setError(null);
    setFieldErrors(null);
    onClose();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors(null);
    createMutation.mutate({ name: name.trim(), description: description.trim() || undefined });
  }

  return (
    <Modal open={open} onClose={handleClose} title="New team" size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <Input
          id="team-name"
          label="Team name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors?.name}
          placeholder="e.g. Platform Engineering"
        />

        <TextArea
          id="team-description"
          label="Description (optional)"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={fieldErrors?.description}
          placeholder="What does this team work on?"
        />

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createMutation.isPending} disabled={!name.trim()}>
            Create team
          </Button>
        </div>
      </form>
    </Modal>
  );
}
