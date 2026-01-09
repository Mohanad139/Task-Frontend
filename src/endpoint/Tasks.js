import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function Tasks() {
  const { projectId } = useParams();
  const token = localStorage.getItem('token');
  const myUserId = Number(localStorage.getItem('user_id'));

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [isCreating, setIsCreating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium'
  });

  const [teamMembers, setTeamMembers] = useState([]);
  const [myRole, setMyRole] = useState(null);
  const [teamId, setTeamId] = useState(null);
  const [projectName, setProjectName] = useState('');

  const [assignOpenForTask, setAssignOpenForTask] = useState(null);
  const [commentsOpenForTask, setCommentsOpenForTask] = useState(null);

  const [assignees, setAssignees] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [commentEditText, setCommentEditText] = useState('');

  const fetchTasks = () => {
    return fetch(`http://18.217.29.216:8000/projects/${projectId}/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setTasks(data.Tasks || []));
  };

  useEffect(() => {
    fetchTasks().catch(console.error);
  }, [projectId, token]);

  useEffect(() => {
    if (!projectId) return;
    
    fetch(`http://18.217.29.216:8000/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const project = data.message || data;
        const tid = project[1];
        const pname = project[2];
        setTeamId(tid);
        setProjectName(pname);
        
        return fetch(`http://18.217.29.216:8000/teams/${tid}/members`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      })
      .then(res => res.json())
      .then(data => {
        const list = data.members || [];
        setTeamMembers(list);
        
        const me = list.find(m => m[0] === myUserId);
        setMyRole(me ? me[2] : null);
      })
      .catch(console.error);
  }, [projectId, myUserId, token]);

  const canAssign = myRole === 'owner' || myRole === 'admin';

  const createTask = () => {
    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }

    fetch(`http://18.217.29.216:8000/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title, description, status, priority, due_date: null })
    })
      .then(() => fetchTasks())
      .then(() => {
        setTitle('');
        setDescription('');
        setStatus('todo');
        setPriority('medium');
        setIsCreating(false);
      })
      .catch(console.error);
  };

  const deleteTask = (taskId) => {
    if (!window.confirm('Delete this task?')) return;

    fetch(`http://18.217.29.216:8000/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchTasks())
      .catch(console.error);
  };

  const startEdit = (task) => {
    setEditingId(task[0]);
    setEditForm({
      title: task[2] || '',
      description: task[3] || '',
      status: task[4] || 'todo',
      priority: task[5] || 'medium'
    });
  };

  const saveEdit = (taskId) => {
    fetch(`http://18.217.29.216:8000/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ ...editForm, due_date: null })
    })
      .then(() => fetchTasks())
      .then(() => setEditingId(null))
      .catch(console.error);
  };

  const cancelEdit = () => setEditingId(null);

  const fetchAssignees = (taskId) => {
    return fetch(`http://18.217.29.216:8000/tasks/${taskId}/assignees`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setAssignees(data["Assigned to :"] || []));
  };

  const openAssign = (taskId) => {
    setAssignOpenForTask(taskId);
    setSelectedUserId('');
    fetchAssignees(taskId).catch(console.error);
  };

  const closeAssign = () => {
    setAssignOpenForTask(null);
    setAssignees([]);
    setSelectedUserId('');
  };

  const assignUser = (taskId) => {
    if (!selectedUserId) return;

    fetch(`http://18.217.29.216:8000/tasks/${taskId}/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ user_ids: [Number(selectedUserId)] })
    })
      .then(() => fetchAssignees(taskId))
      .then(() => setSelectedUserId(''))
      .catch(console.error);
  };

  const unassignUser = (taskId, userId) => {
    fetch(`http://18.217.29.216:8000/tasks/${taskId}/unassign/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchAssignees(taskId))
      .catch(console.error);
  };

  const fetchComments = (taskId) => {
    return fetch(`http://18.217.29.216:8000/tasks/${taskId}/comments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setComments(data.Comments || []));
  };

  const openComments = (taskId) => {
    setCommentsOpenForTask(taskId);
    setCommentText('');
    setEditingCommentId(null);
    setCommentEditText('');
    fetchComments(taskId).catch(console.error);
  };

  const closeComments = () => {
    setCommentsOpenForTask(null);
    setComments([]);
    setCommentText('');
    setEditingCommentId(null);
    setCommentEditText('');
  };

  const addComment = (taskId) => {
    if (!commentText.trim()) return;

    fetch(`http://18.217.29.216:8000/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ comment: commentText })
    })
      .then(() => fetchComments(taskId))
      .then(() => setCommentText(''))
      .catch(console.error);
  };

  const startEditComment = (c) => {
    setEditingCommentId(c[0]);
    setCommentEditText(c[2] || '');
  };

  const saveEditComment = (taskId, commentId) => {
    fetch(`http://18.217.29.216:8000/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ comment: commentEditText })
    })
      .then(() => fetchComments(taskId))
      .then(() => {
        setEditingCommentId(null);
        setCommentEditText('');
      })
      .catch(console.error);
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setCommentEditText('');
  };

  const deleteComment = (taskId, commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    fetch(`http://18.217.29.216:8000/comments/${commentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchComments(taskId))
      .catch(console.error);
  };

  const getStatusColor = (status) => {
    const colors = {
      'todo': 'bg-gray-100 text-gray-700 border-gray-200',
      'in_progress': 'bg-blue-100 text-blue-700 border-blue-200',
      'done': 'bg-green-100 text-green-700 border-green-200',
      'blocked': 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'text-gray-600',
      'medium': 'text-yellow-600',
      'high': 'text-orange-600',
      'urgent': 'text-red-600'
    };
    return colors[priority] || 'text-gray-600';
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
                  TaskFlow
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
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-2 text-sm">
          <Link to="/teams" className="text-gray-500 hover:text-blue-600 transition">Teams</Link>
          <span className="text-gray-400">/</span>
          <Link to={`/teams/${teamId}/projects`} className="text-gray-500 hover:text-blue-600 transition">Projects</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-semibold">Tasks</span>
        </div>

        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{projectName || `Project ${projectId}`}</h2>
            <p className="text-gray-600 mt-1">Manage tasks and track progress</p>
          </div>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition transform hover:scale-105"
          >
            {isCreating ? 'Cancel' : '+ New Task'}
          </button>
        </div>

        {/* Create Task Form */}
        {isCreating && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Create New Task</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Design homepage mockup"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Add task details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select 
                    value={priority} 
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={createTask}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Create Task
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setTitle('');
                    setDescription('');
                    setStatus('todo');
                    setPriority('medium');
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks yet</h3>
              <p className="text-gray-600 mb-6">Create your first task to get started.</p>
              <button
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Create First Task
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => {
              const tid = task[0];

              return (
                <div key={tid} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
                  {editingId === tid ? (
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Task</h3>
                      <div className="space-y-4">
                        <input
                          placeholder="Task Title"
                          value={editForm.title}
                          onChange={(e) => setEditForm(p => ({ ...p, title: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        <textarea
                          placeholder="Description"
                          value={editForm.description}
                          onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))}
                          rows="3"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <select
                            value={editForm.status}
                            onChange={(e) => setEditForm(p => ({ ...p, status: e.target.value }))}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          >
                            <option value="todo">Todo</option>
                            <option value="in_progress">In Progress</option>
                            <option value="done">Done</option>
                            <option value="blocked">Blocked</option>
                          </select>

                          <select
                            value={editForm.priority}
                            onChange={(e) => setEditForm(p => ({ ...p, priority: e.target.value }))}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => saveEdit(tid)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition"
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
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{task[2]}</h3>
                          <p className="text-gray-600 mb-3">{task[3] || 'No description'}</p>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task[4])}`}>
                              {task[4]}
                            </span>
                            <span className={`text-sm font-semibold ${getPriorityColor(task[5])}`}>
                              {task[5]} priority
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => startEdit(task)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
                        >
                          Edit
                        </button>

                        {canAssign && (
                          <button
                            onClick={() => openAssign(tid)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium transition"
                          >
                            Assign
                          </button>
                        )}

                        <button
                          onClick={() => openComments(tid)}
                          className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg font-medium transition"
                        >
                          Comments
                        </button>

                        <button
                          onClick={() => deleteTask(tid)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium transition"
                        >
                          Delete
                        </button>
                      </div>

                      {/* ASSIGN MODAL */}
                      {assignOpenForTask === tid && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                              <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold">Assign Users</h3>
                                <button onClick={closeAssign} className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                <div className="flex gap-3">
                                  <select
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                  >
                                    <option value="">Select user</option>
                                    {teamMembers.map(m => (
                                      <option key={m[0]} value={m[0]}>
                                        {m[4]} ({m[5]})
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => assignUser(tid)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                                  >
                                    Assign
                                  </button>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Assigned Members</h4>
                                {assignees.length === 0 ? (
                                  <p className="text-gray-500 text-center py-8">No assignees</p>
                                ) : (
                                  <div className="space-y-2">
                                    {assignees.map((a, idx) => {
                                      const uid = a[1] || a[0];
                                      const label = a[2] || `User ${uid}`;
                                      return (
                                        <div key={`asg-${uid}-${idx}`} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                          <span className="font-medium text-gray-900">{label}</span>
                                          <button
                                            onClick={() => unassignUser(tid, uid)}
                                            className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg text-sm font-medium"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="border-t p-4 bg-gray-50">
                              <button onClick={closeAssign} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold">
                                Close
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* COMMENTS MODAL */}
                      {commentsOpenForTask === tid && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                              <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold">Comments</h3>
                                <button onClick={closeComments} className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                                <div className="flex gap-3">
                                  <input
                                    placeholder="Write a comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                  />
                                  <button
                                    onClick={() => addComment(tid)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold"
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>

                              {comments.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No comments yet</p>
                              ) : (
                                comments.map(c => {
                                  const cid = c[0];
                                  const text = c[2];
                                  const authorId = c[3];
                                  const authorName = c[4] || 'Unknown';
                                  const canEditThis = authorId === myUserId;

                                  return (
                                    <div key={cid} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                      <div className="flex items-start gap-3">
                                        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
                                          {authorName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                          <p className="font-semibold text-gray-900 mb-1">{authorName}</p>
                                          {editingCommentId === cid ? (
                                            <div className="space-y-2">
                                              <input
                                                value={commentEditText}
                                                onChange={(e) => setCommentEditText(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                              />
                                              <div className="flex gap-2">
                                                <button
                                                  onClick={() => saveEditComment(tid, cid)}
                                                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                                >
                                                  Save
                                                </button>
                                                <button
                                                  onClick={cancelEditComment}
                                                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
                                                >
                                                  Cancel
                                                </button>
                                              </div>
                                            </div>
                                          ) : (
                                            <>
                                              <p className="text-gray-700 mb-2">{text}</p>
                                              <div className="flex gap-2">
                                                <button
                                                  onClick={() => deleteComment(tid, cid)}
                                                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                                                >
                                                  Delete
                                                </button>
                                                {canEditThis && (
                                                  <button
                                                    onClick={() => startEditComment(c)}
                                                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                                                  >
                                                    Edit
                                                  </button>
                                                )}
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>

                            <div className="border-t p-4 bg-gray-50">
                              <button onClick={closeComments} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold">
                                Close
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
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
            to={`/teams/${teamId}/projects`}
            className="inline-flex items-center text-gray-600 hover:text-blue-600 font-medium transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Projects
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Tasks;