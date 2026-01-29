import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppLayout from '../layout/AppLayout';
import TeamMembers from './TeamMembers';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { useConfirm } from '../components/feedback/ConfirmDialog';

const API_BASE = 'https://task-management-api-production-a18c.up.railway.app';

function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [showMembersForTeam, setShowMembersForTeam] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const token = localStorage.getItem('token');
  const { confirm } = useConfirm();

  const fetchTeams = async () => {
    try {
      const res = await fetch(`${API_BASE}/teams`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTeams(data || []);
    } catch {
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const createTeam = async () => {
    if (!teamName.trim()) {
      toast.error('Please enter a team name');
      return;
    }

    try {
      await fetch(`${API_BASE}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: teamName, description: teamDesc })
      });
      toast.success('Team created');
      setTeamName('');
      setTeamDesc('');
      setIsCreating(false);
      fetchTeams();
    } catch {
      toast.error('Failed to create team');
    }
  };

  const deleteTeam = async (teamId, teamName) => {
    const confirmed = await confirm({
      title: 'Delete Team',
      message: `Are you sure you want to delete "${teamName}"? This will remove all projects and tasks.`,
      confirmText: 'Delete',
      variant: 'danger'
    });

    if (confirmed) {
      try {
        await fetch(`${API_BASE}/teams/${teamId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Team deleted');
        setTeams(prev => prev.filter(t => t[0] !== teamId));
      } catch {
        toast.error('Failed to delete team');
      }
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Teams</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your teams and collaborate with members</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? 'Cancel' : '+ Create Team'}
        </Button>
      </div>

      {isCreating && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6 animate-fade-in">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Team</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Team Name</label>
              <Input
                placeholder="e.g., Engineering Team"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <Textarea
                placeholder="Describe the team's purpose..."
                value={teamDesc}
                onChange={(e) => setTeamDesc(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={createTeam}>Create Team</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsCreating(false);
                  setTeamName('');
                  setTeamDesc('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-100 rounded-lg h-48 animate-pulse" />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UsersIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h3>
          <p className="text-sm text-gray-500 mb-4">Get started by creating your first team</p>
          <Button onClick={() => setIsCreating(true)}>Create Your First Team</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map(team => (
            <div
              key={team[0]}
              className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-card transition-shadow group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate group-hover:text-accent-600 transition-colors">
                    {team[1]}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {team[2] || 'No description'}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 ml-3">
                  <UsersIcon className="h-5 w-5 text-gray-500" />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                  Team
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  to={`/teams/${team[0]}/projects`}
                  className="flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  <FolderIcon className="h-4 w-4" />
                  Projects
                </Link>
                <button
                  onClick={() => setShowMembersForTeam(team[0])}
                  className="flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  <UsersIcon className="h-4 w-4" />
                  Members
                </button>
              </div>

              <button
                onClick={() => deleteTeam(team[0], team[1])}
                className="w-full mt-2 text-sm text-gray-500 hover:text-red-600 py-2 transition-colors"
              >
                Delete Team
              </button>
            </div>
          ))}
        </div>
      )}

      {showMembersForTeam && (
        <TeamMembers
          teamId={showMembersForTeam}
          onClose={() => setShowMembersForTeam(null)}
        />
      )}
    </AppLayout>
  );
}

function UsersIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function FolderIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}

export default Teams;
