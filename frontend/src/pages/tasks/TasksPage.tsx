import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Plus } from "lucide-react";
import { listTasks } from "../../api/tasks";
import { listMyTeams } from "../../api/teams";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/Field";
import { StatusBadge, PriorityChip } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { Pagination } from "../../components/ui/Pagination";
import { TaskListSkeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { NewTaskModal } from "./NewTaskModal";
import { formatDate } from "../../lib/format";
import type { TaskPriority, TaskStatus } from "../../lib/types";

const PAGE_SIZE = 20;

export function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const priority = searchParams.get("priority") ?? "";
  const teamId = searchParams.get("teamId") ?? "";
  const sort = searchParams.get("sort") ?? "createdAt,desc";
  const myTasks = searchParams.get("my") === "1";
  const page = Number(searchParams.get("page") ?? "0");

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateParams({ search: searchInput || null, page: null });
      }
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  function updateParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    setSearchParams(next);
  }

  const { data: teams } = useQuery({ queryKey: ["teams"], queryFn: listMyTeams });

  const queryParams = useMemo(
    () => ({
      status: (status || undefined) as TaskStatus | undefined,
      priority: (priority || undefined) as TaskPriority | undefined,
      teamId: teamId ? Number(teamId) : undefined,
      search: search || undefined,
      assigneeId: myTasks && user ? user.id : undefined,
      sort,
      page,
      size: PAGE_SIZE,
    }),
    [status, priority, teamId, search, myTasks, user, sort, page]
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["tasks", queryParams],
    queryFn: ({ signal }) => listTasks(queryParams, signal),
  });

  const tasks = data?.content ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500">Manage and track work across your teams</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setIsNewTaskOpen(true)}>
          New task
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-[200px] flex-1">
          <Input
            label="Search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title or description..."
          />
        </div>
        <div className="w-full sm:w-40">
          <Select
            label="Status"
            value={status}
            onChange={(e) => updateParams({ status: e.target.value || null, page: null })}
          >
            <option value="">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </div>
        <div className="w-full sm:w-36">
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => updateParams({ priority: e.target.value || null, page: null })}
          >
            <option value="">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </Select>
        </div>
        <div className="w-full sm:w-44">
          <Select
            label="Team"
            value={teamId}
            onChange={(e) => updateParams({ teamId: e.target.value || null, page: null })}
          >
            <option value="">All teams</option>
            {teams?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-44">
          <Select label="Sort by" value={sort} onChange={(e) => updateParams({ sort: e.target.value, page: null })}>
            <option value="createdAt,desc">Newest first</option>
            <option value="createdAt,asc">Oldest first</option>
            <option value="dueDate,asc">Due soon</option>
            <option value="title,asc">Title (A-Z)</option>
          </Select>
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={myTasks}
            onChange={(e) => updateParams({ my: e.target.checked ? "1" : null, page: null })}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          My tasks
        </label>
      </div>

      {isLoading ? (
        <TaskListSkeleton />
      ) : isError ? (
        <EmptyState
          icon={ClipboardList}
          title="Failed to load tasks"
          description="Something went wrong. Please try again later."
        />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No tasks found"
          description="Try adjusting your filters, or create a new task to get started."
          action={
            <Button icon={<Plus className="h-4 w-4" />} onClick={() => setIsNewTaskOpen(true)}>
              New task
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => navigate(`/tasks/${task.id}`)}
              className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-gray-900">{task.title}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                  {task.teamName && <span>{task.teamName}</span>}
                  {task.dueDate && <span>Due {formatDate(task.dueDate)}</span>}
                  {task.assigneeUsername && <span>Assigned to {task.assigneeUsername}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={task.status} />
                <PriorityChip priority={task.priority} />
                {task.assigneeUsername && <Avatar name={task.assigneeUsername} size="sm" />}
              </div>
            </button>
          ))}
        </div>
      )}

      {data && (
        <Pagination
          page={data.number}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          onPageChange={(p) => updateParams({ page: p === 0 ? null : String(p) })}
        />
      )}

      <NewTaskModal open={isNewTaskOpen} onClose={() => setIsNewTaskOpen(false)} />
    </div>
  );
}
