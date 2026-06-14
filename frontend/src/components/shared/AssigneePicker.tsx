import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { listTeamMembers } from "../../api/teams";
import { searchUsers } from "../../api/users";
import { FieldWrapper, Select } from "../ui/Field";
import type { UserSearchResult } from "../../lib/types";

interface AssigneePickerProps {
  teamId?: number | null;
  value: number | null;
  valueLabel?: string | null;
  onChange: (userId: number | null, label: string | null) => void;
  label?: string;
}

/**
 * Picks an assignee. When `teamId` is set, options come from the team's member
 * list (GET /teams/:id/members); otherwise falls back to a user search
 * (GET /users/search) since there's no other roster to choose from.
 */
export function AssigneePicker({ teamId, value, valueLabel, onChange, label = "Assignee" }: AssigneePickerProps) {
  if (teamId) {
    return <TeamMemberAssigneeSelect teamId={teamId} value={value} onChange={onChange} label={label} />;
  }
  return <UserSearchAssignee value={value} valueLabel={valueLabel ?? null} onChange={onChange} label={label} />;
}

function TeamMemberAssigneeSelect({
  teamId,
  value,
  onChange,
  label,
}: {
  teamId: number;
  value: number | null;
  onChange: (userId: number | null, label: string | null) => void;
  label: string;
}) {
  const { data: members, isLoading } = useQuery({
    queryKey: ["team-members", teamId],
    queryFn: () => listTeamMembers(teamId),
  });

  return (
    <Select
      label={label}
      value={value ?? ""}
      disabled={isLoading}
      onChange={(e) => {
        const id = e.target.value ? Number(e.target.value) : null;
        const member = members?.find((m) => m.userId === id);
        onChange(id, member ? member.fullName || member.username : null);
      }}
    >
      <option value="">Unassigned</option>
      {members?.map((m) => (
        <option key={m.userId} value={m.userId}>
          {m.fullName || m.username}
        </option>
      ))}
    </Select>
  );
}

function UserSearchAssignee({
  value,
  valueLabel,
  onChange,
  label,
}: {
  value: number | null;
  valueLabel: string | null;
  onChange: (userId: number | null, label: string | null) => void;
  label: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchUsers(query, controller.signal)
        .then(setResults)
        .catch(() => {
          /* ignore aborted/failed searches */
        });
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  if (value !== null) {
    return (
      <FieldWrapper label={label}>
        <div className="flex items-center justify-between rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700">
          <span>{valueLabel ?? `User #${value}`}</span>
          <button
            type="button"
            onClick={() => onChange(null, null)}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Clear assignee"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </FieldWrapper>
    );
  }

  return (
    <FieldWrapper label={label}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, username or email..."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500"
        />
        {results.length > 0 && (
          <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
            {results.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  onChange(u.id, u.fullName || u.username);
                  setQuery("");
                  setResults([]);
                }}
                className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                <span className="font-medium text-gray-900">{u.fullName || u.username}</span>
                <span className="text-xs text-gray-500">
                  @{u.username} &middot; {u.email}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}
