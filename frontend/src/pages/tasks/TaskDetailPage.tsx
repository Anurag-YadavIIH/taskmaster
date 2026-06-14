import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Download, Paperclip, Send, Sparkles, Trash2 } from "lucide-react";
import { assignTask, deleteTask, getTask, updateTask, updateTaskStatus } from "../../api/tasks";
import { addComment, listComments } from "../../api/comments";
import { downloadAttachment, listAttachments, uploadAttachment } from "../../api/attachments";
import { generateDescription } from "../../api/ai";
import { AssigneePicker } from "../../components/shared/AssigneePicker";
import { PriorityChip, StatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input, Select, TextArea } from "../../components/ui/Field";
import { Avatar } from "../../components/ui/Avatar";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { useToast } from "../../context/ToastContext";
import { ApiException } from "../../lib/api";
import { formatBytes, formatDate, formatRelativeTime } from "../../lib/format";
import type { AttachmentResponse, TaskPriority, TaskStatus, UpdateTaskRequest } from "../../lib/types";

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const taskId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const {
    data: task,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["task", taskId],
    queryFn: ({ signal }) => getTask(taskId, signal),
    enabled: Number.isFinite(taskId),
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [keywords, setKeywords] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setDueDate(task.dueDate ?? "");
      setPriority(task.priority);
    }
  }, [task]);

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateTaskRequest) => updateTask(taskId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(["task", taskId], updated);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setError(null);
      setFieldErrors(null);
      showToast("Task updated", "success");
    },
    onError: (err) => {
      if (err instanceof ApiException) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError("Failed to update task. Please try again.");
      }
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status: TaskStatus) => updateTaskStatus(taskId, status),
    onSuccess: (updated) => {
      queryClient.setQueryData(["task", taskId], updated);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      showToast("Status updated", "success");
    },
    onError: (err) => {
      showToast(err instanceof ApiException ? err.message : "Failed to update status", "error");
    },
  });

  const assignMutation = useMutation({
    mutationFn: (assigneeId: number) => assignTask(taskId, assigneeId),
    onSuccess: (updated) => {
      queryClient.setQueryData(["task", taskId], updated);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      showToast("Assignee updated", "success");
    },
    onError: (err) => {
      showToast(err instanceof ApiException ? err.message : "Failed to update assignee", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      showToast("Task deleted", "success");
      navigate("/tasks");
    },
    onError: (err) => {
      showToast(err instanceof ApiException ? err.message : "Failed to delete task", "error");
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-5 w-28" />
        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    );
  }

  if (isError || !task) {
    return (
      <EmptyState
        icon={ArrowLeft}
        title="Task not found"
        description="This task may have been deleted, or you don't have access to it."
        action={
          <Button variant="secondary" onClick={() => navigate("/tasks")}>
            Back to tasks
          </Button>
        }
      />
    );
  }

  const isDirty =
    title !== task.title ||
    description !== (task.description ?? "") ||
    dueDate !== (task.dueDate ?? "") ||
    priority !== task.priority;

  function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors(null);
    const payload: UpdateTaskRequest = {
      title: title.trim(),
      description,
      priority,
    };
    if (dueDate) payload.dueDate = dueDate;
    updateMutation.mutate(payload);
  }

  async function handleGenerate() {
    if (!title.trim()) {
      showToast("Enter a title first so AI knows what to write about", "info");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await generateDescription(title.trim(), keywords.trim() || undefined);
      setDescription(res.text);
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

  function handleDelete() {
    if (window.confirm("Delete this task? This cannot be undone.")) {
      deleteMutation.mutate();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={() => navigate("/tasks")}
        className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tasks
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <Input
                id="detail-title"
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={fieldErrors?.title}
              />

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label htmlFor="detail-description" className="text-sm font-medium text-gray-700">
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
                  id="detail-keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="Optional keywords for AI generation"
                  className="mb-2"
                />
                <TextArea
                  id="detail-description"
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  error={fieldErrors?.description}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="detail-due-date"
                  label="Due date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  error={fieldErrors?.dueDate}
                />
                <Select
                  id="detail-priority"
                  label="Priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button type="submit" isLoading={updateMutation.isPending} disabled={!isDirty || !title.trim()}>
                  Save changes
                </Button>
              </div>
            </form>
          </div>

          <CommentsSection taskId={taskId} />
          <AttachmentsSection taskId={taskId} />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <StatusBadge status={task.status} />
              <PriorityChip priority={task.priority} />
            </div>

            <Select
              label="Status"
              value={task.status}
              disabled={statusMutation.isPending}
              onChange={(e) => statusMutation.mutate(e.target.value as TaskStatus)}
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>

            <AssigneePicker
              teamId={task.teamId}
              value={task.assigneeId}
              valueLabel={task.assigneeUsername}
              onChange={(assigneeId) => {
                if (assigneeId !== null) assignMutation.mutate(assigneeId);
              }}
            />

            <dl className="flex flex-col gap-2 border-t border-gray-100 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Creator</dt>
                <dd className="font-medium text-gray-900">{task.creatorUsername}</dd>
              </div>
              {task.teamName && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Team</dt>
                  <dd className="font-medium text-gray-900">{task.teamName}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Created</dt>
                <dd className="font-medium text-gray-900">{formatDate(task.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Updated</dt>
                <dd className="font-medium text-gray-900">{formatRelativeTime(task.updatedAt)}</dd>
              </div>
            </dl>

            <Button
              type="button"
              variant="danger"
              size="sm"
              icon={<Trash2 className="h-4 w-4" />}
              isLoading={deleteMutation.isPending}
              onClick={handleDelete}
            >
              Delete task
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentsSection({ taskId }: { taskId: number }) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [content, setContent] = useState("");

  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => listComments(taskId),
  });

  const addMutation = useMutation({
    mutationFn: (text: string) => addComment(taskId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", taskId] });
      setContent("");
    },
    onError: (err) => {
      showToast(err instanceof ApiException ? err.message : "Failed to add comment", "error");
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    addMutation.mutate(content.trim());
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-base font-semibold text-gray-900">Comments</h2>

      {isLoading ? (
        <div className="mb-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : comments && comments.length > 0 ? (
        <ul className="mb-4 flex flex-col gap-4">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <Avatar name={comment.authorUsername} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{comment.authorUsername}</span>
                  <span className="text-xs text-gray-400">{formatRelativeTime(comment.createdAt)}</span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-gray-700">{comment.content}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 text-sm text-gray-500">No comments yet.</p>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <TextArea
          rows={2}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1"
        />
        <Button
          type="submit"
          isLoading={addMutation.isPending}
          disabled={!content.trim()}
          icon={<Send className="h-4 w-4" />}
        >
          Post
        </Button>
      </form>
    </div>
  );
}

function AttachmentsSection({ taskId }: { taskId: number }) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: attachments, isLoading } = useQuery({
    queryKey: ["attachments", taskId],
    queryFn: () => listAttachments(taskId),
  });

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await uploadAttachment(taskId, file);
      queryClient.invalidateQueries({ queryKey: ["attachments", taskId] });
      showToast("Attachment uploaded", "success");
    } catch (err) {
      showToast(err instanceof ApiException ? err.message : "Failed to upload attachment", "error");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  async function handleDownload(attachment: AttachmentResponse) {
    try {
      const { blob, fileName } = await downloadAttachment(attachment.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || attachment.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      showToast("Failed to download attachment", "error");
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Attachments</h2>
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          isLoading={isUploading}
          icon={<Paperclip className="h-4 w-4" />}
          onClick={() => fileInputRef.current?.click()}
        >
          Upload file
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : attachments && attachments.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {attachments.map((att) => (
            <li
              key={att.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <Paperclip className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{att.fileName}</p>
                  <p className="text-xs text-gray-500">
                    {formatBytes(att.sizeBytes)} &middot; {att.uploadedByUsername} &middot;{" "}
                    {formatRelativeTime(att.createdAt)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={<Download className="h-4 w-4" />}
                onClick={() => handleDownload(att)}
              >
                Download
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">No attachments yet.</p>
      )}
    </div>
  );
}
