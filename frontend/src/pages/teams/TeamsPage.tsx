import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, Users } from "lucide-react";
import { listMyTeams } from "../../api/teams";
import { Button } from "../../components/ui/Button";
import { CardListSkeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { NewTeamModal } from "./NewTeamModal";

export function TeamsPage() {
  const navigate = useNavigate();
  const [isNewTeamOpen, setIsNewTeamOpen] = useState(false);

  const { data: teams, isLoading, isError } = useQuery({ queryKey: ["teams"], queryFn: listMyTeams });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="text-sm text-gray-500">Collaborate with your teammates on shared work</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setIsNewTeamOpen(true)}>
          New team
        </Button>
      </div>

      {isLoading ? (
        <CardListSkeleton />
      ) : isError ? (
        <EmptyState icon={Users} title="Failed to load teams" description="Please try again later." />
      ) : !teams || teams.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No teams yet"
          description="Create a team to start collaborating with others."
          action={
            <Button icon={<Plus className="h-4 w-4" />} onClick={() => setIsNewTeamOpen(true)}>
              New team
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => navigate(`/teams/${team.id}`)}
              className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 text-left transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Users className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-gray-900">{team.name}</h3>
              </div>
              {team.description && <p className="line-clamp-2 text-sm text-gray-500">{team.description}</p>}
              <p className="text-xs text-gray-400">Owned by {team.ownerUsername}</p>
            </button>
          ))}
        </div>
      )}

      <NewTeamModal open={isNewTeamOpen} onClose={() => setIsNewTeamOpen(false)} />
    </div>
  );
}
