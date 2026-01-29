import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppLayout from '../layout/AppLayout';
import { Button } from '../components/ui/Button';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { STATUS } from '../utils/constants';

const API_BASE = 'https://task-management-api-production-a18c.up.railway.app';

function Dashboard() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [recentProjects, setRecentProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [stats, setStats] = useState({ totalTeams: 0, totalProjects: 0, totalTasks: 0 });
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const teamsRes = await fetch(`${API_BASE}/teams`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const teamsData = await teamsRes.json();
        const teamsList = teamsData || [];
        setTeams(teamsList);

        const projectsData = await Promise.all(
          teamsList.map(async (team) => {
            const res = await fetch(`${API_BASE}/teams/${team[0]}/projects`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            return {
              teamId: team[0],
              teamName: team[1],
              projects: (data.Projects || []).map(p => ({ ...p, teamName: team[1] }))
            };
          })
        );

        const allProjects = projectsData.flatMap(tp => tp.projects);
        setRecentProjects(allProjects.slice(0, 5));

        const tasksData = await Promise.all(
          allProjects.slice(0, 10).map(async (project) => {
            try {
              const res = await fetch(`${API_BASE}/projects/${project[0]}/tasks`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              const data = await res.json();
              return (data.Tasks || []).map(task => ({
                id: task[0],
                title: task[2],
                description: task[3],
                status: task[4],
                priority: task[5],
                projectName: project[2],
                projectId: project[0]
              }));
            } catch {
              return [];
            }
          })
        );

        const tasks = tasksData.flat();
        setAllTasks(tasks);

        setStats({
          totalTeams: teamsList.length,
          totalProjects: allProjects.length,
          totalTasks: tasks.length
        });
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  const tasksByStatus = allTasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  const handleQuickAction = async (type) => {
    if (type === 'teams') {
      navigate('/teams');
    } else if (type === 'projects') {
      if (teams.length > 0) {
        navigate(`/teams/${teams[0][0]}/projects`);
      } else {
        toast.error('No teams found. Create a team first.');
        navigate('/teams');
      }
    } else if (type === 'tasks') {
      if (recentProjects.length > 0) {
        navigate(`/projects/${recentProjects[0][0]}/tasks`);
      } else {
        toast.error('No projects found. Create a project first.');
      }
    }
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {loading ? (
          <>
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-5">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-12" />
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-card transition-shadow">
              <p className="text-sm text-gray-500 mb-1">Teams</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalTeams}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-card transition-shadow">
              <p className="text-sm text-gray-500 mb-1">Projects</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalProjects}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-card transition-shadow">
              <p className="text-sm text-gray-500 mb-1">Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalTasks}</p>
            </div>
          </>
        )}
      </div>

      {/* Task Distribution */}
      {!loading && allTasks.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Task Distribution</h3>
          <div className="grid grid-cols-4 gap-4">
            {['todo', 'in_progress', 'done', 'blocked'].map(status => {
              const count = tasksByStatus[status] || 0;
              const percent = allTasks.length > 0 ? Math.round((count / allTasks.length) * 100) : 0;
              const config = STATUS[status];
              return (
                <div key={status} className="text-center">
                  <div className="text-2xl font-semibold text-gray-900">{count}</div>
                  <div className="text-xs text-gray-500 mt-1">{config.label}</div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                    <div
                      className={`h-1.5 rounded-full ${
                        status === 'done' ? 'bg-emerald-500' :
                        status === 'in_progress' ? 'bg-amber-500' :
                        status === 'blocked' ? 'bg-red-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => handleQuickAction('teams')}
          className="flex items-center gap-4 bg-white rounded-lg border border-gray-200 p-4 hover:shadow-card transition-shadow text-left group"
        >
          <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
            <UsersIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Create Team</p>
            <p className="text-xs text-gray-500">Start collaborating</p>
          </div>
        </button>
        <button
          onClick={() => handleQuickAction('projects')}
          className="flex items-center gap-4 bg-white rounded-lg border border-gray-200 p-4 hover:shadow-card transition-shadow text-left group"
        >
          <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
            <FolderIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-gray-900">View Projects</p>
            <p className="text-xs text-gray-500">Browse all projects</p>
          </div>
        </button>
        <button
          onClick={() => handleQuickAction('tasks')}
          className="flex items-center gap-4 bg-white rounded-lg border border-gray-200 p-4 hover:shadow-card transition-shadow text-left group"
        >
          <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
            <ClipboardIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Task Overview</p>
            <p className="text-xs text-gray-500">See all tasks</p>
          </div>
        </button>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">Recent Projects</h3>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-3 border border-gray-100 rounded-lg">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 mb-3">No projects yet</p>
                <Button size="sm" variant="secondary" onClick={() => handleQuickAction('teams')}>
                  Create a team first
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentProjects.map(project => (
                  <Link
                    key={project[0]}
                    to={`/projects/${project[0]}/tasks`}
                    className="block p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{project[2]}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{project.teamName}</p>
                      </div>
                      <StatusBadge status={project[6] === 'active' ? 'in_progress' : project[6] === 'completed' ? 'done' : 'todo'} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">Recent Tasks</h3>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-3 border border-gray-100 rounded-lg">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : allTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No tasks yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {allTasks.slice(0, 6).map(task => (
                  <Link
                    key={task.id}
                    to={`/projects/${task.projectId}/tasks`}
                    className="block p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{task.title}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{task.projectName}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
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

function ClipboardIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

export default Dashboard;
