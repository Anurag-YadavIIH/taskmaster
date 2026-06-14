import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Avatar } from "../../components/ui/Avatar";
import { useToast } from "../../context/ToastContext";
import { addTeamMember } from "../../api/teams";
import { searchUsers } from "../../api/users";
import { ApiException } from "../../lib/api";
import type { UserSearchResult } from "../../lib/types";

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  teamId: number;
  existingMemberIds: number[];
}

export function AddMemberModal({ open, onClose, teamId, existingMemberIds }: AddMemberModalProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

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

  const addMutation = useMutation({
    mutationFn: (userId: number) => addTeamMember(teamId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", teamId] });
      showToast("Member added", "success");
      setQuery("");
      setResults([]);
    },
    onError: (err) => {
      showToast(err instanceof ApiException ? err.message : "Failed to add member", "error");
    },
  });

  return (
    <Modal open={open} onClose={onClose} title="Add team member" size="sm">
      <div className="flex flex-col gap-3">
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, username or email..."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500"
        />

        {query.trim() && results.length === 0 && (
          <p className="px-1 text-sm text-gray-500">No users found.</p>
        )}

        <ul className="flex flex-col gap-1 max-h-72 overflow-y-auto">
          {results.map((u) => {
            const alreadyMember = existingMemberIds.includes(u.id);
            return (
              <li key={u.id} className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 hover:bg-gray-50">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar name={u.fullName || u.username} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{u.fullName || u.username}</p>
                    <p className="truncate text-xs text-gray-500">
                      @{u.username} &middot; {u.email}
                    </p>
                  </div>
                </div>
                {alreadyMember ? (
                  <span className="text-xs font-medium text-gray-400">Member</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => addMutation.mutate(u.id)}
                    disabled={addMutation.isPending}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Add
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </Modal>
  );
}
