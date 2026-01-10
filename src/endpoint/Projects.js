import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function Projects() {
  const { teamId } = useParams();
  const [projects, setProjects] = useState([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [isCreating, setIsCreating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', status: 'active' });

  const token = localStorage.getItem('token');

  const fetchProjects = () => {
    return fetch(`https://task-management-api-production-a18c.up.railway.app/teams/${teamId}/projects`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const list = data.Projects || data.projects || data || [];
        setProjects(list);
      });
  };

  useEffect(() => {
    fetchProjects().catch(err => console.error(err));
  }, [teamId, token]);

  const createProject = () => {
    if (!name.trim()) {
      alert('Please enter a project name');
      return;
    }

    fetch(`https://task-management-api-production-a18c.up.railway.app/teams/${teamId}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name, description, status })
    })
      .then(() => fetchProjects())
      .then(() => {
        setName('');
        setDescription('');
        setStatus('active');
        setIsCreating(false);
      })
      .catch(err => console.error(err));
  };

  const deleteProject = (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    fetch(`https://task-management-api-production-a18c.up.railway.app/projects/${projectId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchProjects())
      .catch(err => console.error(err));
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

  const saveEdit = (projectId) => {
    fetch(`https://task-management-api-production-a18c.up.railway.app/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(editForm)
    })
      .then(() => fetchProjects())
      .then(() => setEditingId(null))
      .catch(err => console.error(err));
  };

  const cancelEdit = () => setEditingId(null);

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-blue-100 text-blue-700 border-blue-200',
      'completed': 'bg-green-100 text-green-700 border-green-200',
      'archived': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer">
                  MoTask
                </h1>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition"
              >
                Dashboard
              </Link>
              <Link 
                to="/teams" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition"
              >
                Teams
              </Link>
              
              <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Link to="/teams" className="text-gray-500 hover:text-blue-600 transition">
              Teams
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-semibold">Projects</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Projects</h2>
              <p className="text-gray-600 mt-1">Manage projects for Team {teamId}</p>
            </div>
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition transform hover:scale-105"
            >
              {isCreating ? 'Cancel' : '+ New Project'}
            </button>
          </div>
        </div>

        {/* Create Project Form */}
        {isCreating && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Create New Project</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Website Redesign"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Describe the project goals..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={createProject}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Create Project
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setName('');
                    setDescription('');
                    setStatus('active');
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Projects List */}
        {projects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-6">Create your first project to start organizing tasks.</p>
              <button
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Create First Project
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, idx) => {
              const pid = project?.[0] ?? project?.id;

              if (!pid) {
                return (
                  <div key={idx} className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                    <p className="text-red-600 font-semibold">⚠️ Project missing ID</p>
                    <pre className="text-xs mt-2 text-gray-600">{JSON.stringify(project, null, 2)}</pre>
                  </div>
                );
              }

              const pname = project?.[2] ?? project?.name ?? '';
              const pdesc = project?.[3] ?? project?.description ?? '';
              const pstatus = project?.[6] ?? project?.status ?? '';

              return (
                <div key={pid} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden">
                  {editingId === pid ? (
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Project</h3>
                      <div className="space-y-3">
                        <input
                          placeholder="Project Name"
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        <textarea
                          placeholder="Description"
                          value={editForm.description}
                          onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                        />
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        >
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="archived">Archived</option>
                        </select>

                        <div className="flex gap-2 mt-4">
                          <button 
                            onClick={() => saveEdit(pid)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
                          >
                            Save
                          </button>
                          <button 
                            onClick={cancelEdit}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{pname}</h3>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {pdesc || 'No description provided'}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(pstatus)}`}>
                          {pstatus}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <Link
                          to={`/projects/${pid}/tasks`}
                          className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-center py-3 rounded-lg font-medium transition"
                        >
                          View Tasks →
                        </Link>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => startEdit(project)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteProject(pid)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg font-medium transition border border-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8">
          <Link
            to="/teams"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 font-medium transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Teams
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Projects;