import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppLayout from '../layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useConfirm } from '../components/feedback/ConfirmDialog';

const API_BASE = 'https://task-management-api-production-a18c.up.railway.app';

const PROJECT_STATUS = {
  active: { label: 'Active', color: 'bg-blue-50 text-blue-700' },
  completed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700' },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-600' },
};

function Projects() {
  const { teamId } = useParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [isCreating, setIsCreating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', status: 'active' });

  const token = localStorage.getItem('token');
  const { confirm } = useConfirm();

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/teams/${teamId}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setProjects(data.Projects || data.projects || data || []);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeam = async () => {
    try {
      const res = await fetch(`${API_BASE}/teams`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const team = (data || []).find(t => t[0] === Number(teamId));
      if (team) setTeamName(team[1]);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, token]);

  const createProject = async () => {
    if (!name.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    try {
      await fetch(`${API_BASE}/teams/${teamId}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, description, status })
      });
      toast.success('Project created');
      setName('');
      setDescription('');
      setStatus('active');
      setIsCreating(false);
      fetchProjects();
    } catch {
      toast.error('Failed to create project');
    }
  };

  const deleteProject = async (projectId, projectName) => {
    const confirmed = await confirm({
      title: 'Delete Project',
      message: `Are you sure you want to delete "${projectName}"? All tasks will be removed.`,
      confirmText: 'Delete',
      variant: 'danger'
    });

    if (confirmed) {
      try {
        await fetch(`${API_BASE}/projects/${projectId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Project deleted');
        fetchProjects();
      } catch {
        toast.error('Failed to delete project');
      }
    }
  };

  const startEdit = (project) => {
    const pid = project?.[0] ?? project?.id;
    setEditingId(pid);
    setEditForm({
      name: project?.[2] ?? project?.name ?? '',
      description: project?.[3] ?? project?.description ?? '',
      status: project?.[6] ?? project?.status ?? 'active'
    });
  };

  const saveEdit = async (projectId) => {
    try {
      await fetch(`${API_BASE}/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      toast.success('Project updated');
      setEditingId(null);
      fetchProjects();
    } catch {
      toast.error('Failed to update project');
    }
  };

  const breadcrumb = (
    <div className="flex items-center gap-2 text-sm mb-4">
      <Link to="/teams" className="text-gray-500 hover:text-gray-700">Teams</Link>
      <span className="text-gray-300">/</span>
      <span className="text-gray-900 font-medium">Projects</span>
    </div>
  );

  return (
    <AppLayout>
      {breadcrumb}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {teamName ? `${teamName} Projects` : 'Projects'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage projects and organize your work</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? 'Cancel' : '+ New Project'}
        </Button>
      </div>

      {isCreating && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6 animate-fade-in">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Project</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Project Name</label>
              <Input
                placeholder="e.g., Website Redesign"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <Textarea
                placeholder="Describe the project goals..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button onClick={createProject}>Create Project</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsCreating(false);
                  setName('');
                  setDescription('');
                  setStatus('active');
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
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-sm text-gray-500 mb-4">Create your first project to start organizing tasks</p>
          <Button onClick={() => setIsCreating(true)}>Create First Project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, idx) => {
            const pid = project?.[0] ?? project?.id;
            if (!pid) return null;

            const pname = project?.[2] ?? project?.name ?? '';
            const pdesc = project?.[3] ?? project?.description ?? '';
            const pstatus = project?.[6] ?? project?.status ?? 'active';
            const statusConfig = PROJECT_STATUS[pstatus] || PROJECT_STATUS.active;

            return (
              <div
                key={pid}
                className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-card transition-shadow"
              >
                {editingId === pid ? (
                  <div className="space-y-3">
                    <Input
                      placeholder="Project Name"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Textarea
                      placeholder="Description"
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                    <Select
                      value={editForm.status}
                      onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </Select>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(pid)}>Save</Button>
                      <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <h3 className="font-medium text-gray-900">{pname}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {pdesc || 'No description'}
                      </p>
                    </div>

                    <div className="mb-4">
                      <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                    </div>

                    <Link
                      to={`/projects/${pid}/tasks`}
                      className="flex items-center justify-center gap-2 w-full bg-amber-50 hover:bg-amber-100 text-amber-700 py-2.5 rounded-lg text-sm font-medium transition-colors mb-2"
                    >
                      View Tasks
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => startEdit(project)}
                        className="text-sm text-gray-600 hover:text-gray-900 py-2 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProject(pid, pname)}
                        className="text-sm text-gray-600 hover:text-red-600 py-2 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8">
        <Link
          to="/teams"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1.5" />
          Back to Teams
        </Link>
      </div>
    </AppLayout>
  );
}

function FolderIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}

function ArrowRightIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

function ArrowLeftIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

export default Projects;
