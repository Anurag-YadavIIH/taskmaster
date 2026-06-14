import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Crown, UserPlus, Users } from "lucide-react";
import { getTeam, listTeamMembers } from "../../api/teams";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { AddMemberModal } from "./AddMemberModal";

export function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const teamId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  const {
    data: team,
    isLoading: isTeamLoading,
    isError: isTeamError,
  } = useQuery({
    queryKey: ["team", teamId],
    queryFn: () => getTeam(teamId),
    enabled: Number.isFinite(teamId),
  });

  const { data: members, isLoading: areMembersLoading } = useQuery({
    queryKey: ["team-members", teamId],
    queryFn: () => listTeamMembers(teamId),
    enabled: Number.isFinite(teamId),
  });

  if (isTeamLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-5 w-28" />
        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (isTeamError || !team) {
    return (
      <EmptyState
        icon={ArrowLeft}
        title="Team not found"
        description="This team may have been deleted, or you don't have access to it."
        action={
          <Button variant="secondary" onClick={() => navigate("/teams")}>
            Back to teams
          </Button>
        }
      />
    );
  }

  const isOwner = user?.id === team.ownerId;

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={() => navigate("/teams")}
        className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to teams
      </button>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{team.name}</h1>
            {team.description && <p className="mt-1 text-sm text-gray-500">{team.description}</p>}
            <p className="mt-1 text-xs text-gray-400">Owned by {team.ownerUsername}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Members</h2>
          {isOwner && (
            <Button icon={<UserPlus className="h-4 w-4" />} size="sm" onClick={() => setIsAddMemberOpen(true)}>
              Add member
            </Button>
          )}
        </div>

        {areMembersLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : !members || members.length === 0 ? (
          <p className="text-sm text-gray-500">No members yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {members.map((member) => (
              <li
                key={member.userId}
                className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={member.fullName || member.username} size="md" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{member.fullName || member.username}</p>
                    <p className="text-xs text-gray-500">@{member.username}</p>
                  </div>
                </div>
                {member.role === "OWNER" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                    <Crown className="h-3 w-3" />
                    Owner
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/15">
                    Member
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <AddMemberModal
        open={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        teamId={teamId}
        existingMemberIds={members?.map((m) => m.userId) ?? []}
      />
    </div>
  );
}
