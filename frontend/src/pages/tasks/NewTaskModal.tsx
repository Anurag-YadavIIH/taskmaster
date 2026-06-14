import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Input, Select, TextArea } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { AssigneePicker } from "../../components/shared/AssigneePicker";
import { useToast } from "../../context/ToastContext";
import { createTask } from "../../api/tasks";
import { listMyTeams } from "../../api/teams";
import { generateDescription } from "../../api/ai";
import { ApiException } from "../../lib/api";
import type { TaskPriority } from "../../lib/types";

interface NewTaskModalProps {
  open: boolean;
  onClose: () => void;
}

const initialState = {
  title: "",
  description: "",
  dueDate: "",
  priority: "MEDIUM" as TaskPriority,
  teamId: null as number | null,
  assigneeId: null as number | null,
  assigneeLabel: null as string | null,
  keywords: "",
};

export function NewTaskModal({ open, onClose }: NewTaskModalProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: teams } = useQuery({ queryKey: ["teams"], queryFn: listMyTeams, enabled: open });

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      showToast("Task created", "success");
      handleClose();
    },
    onError: (err) => {
      if (err instanceof ApiException) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError("Failed to create task. Please try again.");
      }
    },
  });

  function handleClose() {
    setForm(initialState);
    setError(null);
    setFieldErrors(null);
    onClose();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors(null);
    createMutation.mutate({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      dueDate: form.dueDate || undefined,
      priority: form.priority,
      teamId: form.teamId ?? undefined,
      assigneeId: form.assigneeId ?? undefined,
    });
  }

  async function handleGenerate() {
    if (!form.title.trim()) {
      showToast("Enter a title first so AI knows what to write about", "info");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await generateDescription(form.title.trim(), form.keywords.trim() || undefined);
      setForm((f) => ({ ...f, description: res.text }));
    } catch (err) {
      if (err instanceof ApiException && err.status === 400) {
        showToast("AI generation is disabled on this server", "info");
      } else {
        showToast("Failed to generate a description", "error");
      }
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="New task" size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <Input
          id="task-title"
          label="Title"
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          error={fieldErrors?.title}
          placeholder="e.g. Set up CI pipeline"
        />

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="task-description" className="text-sm font-medium text-gray-700">
              Description
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              isLoading={isGenerating}
              icon={<Sparkles className="h-4 w-4 text-indigo-500" />}
              onClick={handleGenerate}
            >
              Generate with AI
            </Button>
          </div>
          <Input
            id="task-keywords"
            value={form.keywords}
            onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
            placeholder="Optional keywords for AI generation (e.g. urgent, frontend)"
            className="mb-2"
          />
          <TextArea
            id="task-description"
            rows={4}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            error={fieldErrors?.description}
            placeholder="Describe the task..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="task-due-date"
            label="Due date"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            error={fieldErrors?.dueDate}
          />
          <Select
            id="task-priority"
            label="Priority"
            value={form.priority}
            onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            id="task-team"
            label="Team"
            value={form.teamId ?? ""}
            onChange={(e) => {
              const teamId = e.target.value ? Number(e.target.value) : null;
              setForm((f) => ({ ...f, teamId, assigneeId: null, assigneeLabel: null }));
            }}
          >
            <option value="">No team</option>
            {teams?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>

          <AssigneePicker
            teamId={form.teamId}
            value={form.assigneeId}
            valueLabel={form.assigneeLabel}
            onChange={(assigneeId, assigneeLabel) => setForm((f) => ({ ...f, assigneeId, assigneeLabel }))}
          />
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createMutation.isPending} disabled={!form.title.trim()}>
            Create task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
