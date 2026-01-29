import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppLayout from '../layout/AppLayout';
import { KanbanBoard } from '../components/kanban';
import { Button } from '../components/ui/Button';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';
import { useConfirm } from '../components/feedback/ConfirmDialog';
import { cn } from '../utils/cn';

const API_BASE = 'https://task-management-api-production-a18c.up.railway.app';

function Tasks() {
  const { projectId } = useParams();
  const token = localStorage.getItem('token');
  const myUserId = Number(localStorage.getItem('user_id'));
  const { confirm } = useConfirm();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('taskViewMode') || 'board');

  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium'
  });

  const [teamMembers, setTeamMembers] = useState([]);
  const [myRole, setMyRole] = useState(null);
  const [teamId, setTeamId] = useState(null);
  const [projectName, setProjectName] = useState('');

  const [assigneesByTask, setAssigneesByTask] = useState({});
  const [slideOver, setSlideOver] = useState({ open: false, task: null, tab: 'details' });

  const [assignees, setAssignees] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [commentEditText, setCommentEditText] = useState('');
  const [editForm, setEditForm] = useState(null);

  const transformTask = (t) => ({
    id: t[0],
    projectId: t[1],
    title: t[2],
    description: t[3],
    status: t[4],
    priority: t[5],
  });

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const taskList = (data.Tasks || []).map(transformTask);
      setTasks(taskList);

      // Fetch assignees for all tasks
      const assigneesMap = {};
      await Promise.all(taskList.map(async (task) => {
        try {
          const aRes = await fetch(`${API_BASE}/tasks/${task.id}/assignees`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const aData = await aRes.json();
          assigneesMap[task.id] = aData["Assigned to :"] || [];
        } catch {
          assigneesMap[task.id] = [];
        }
      }));
      setAssigneesByTask(assigneesMap);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId, token]);

  useEffect(() => {
    if (!projectId) return;

    fetch(`${API_BASE}/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const project = data.message || data;
        setTeamId(project[1]);
        setProjectName(project[2]);

        return fetch(`${API_BASE}/teams/${project[1]}/members`, {
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

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('taskViewMode', mode);
  };

  const createTask = async () => {
    if (!createForm.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    try {
      await fetch(`${API_BASE}/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...createForm, due_date: null })
      });
      toast.success('Task created');
      setCreateForm({ title: '', description: '', status: 'todo', priority: 'medium' });
      setIsCreating(false);
      fetchTasks();
    } catch {
      toast.error('Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const prevTasks = [...tasks];
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      const task = tasks.find(t => t.id === taskId);
      await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          status: newStatus,
          priority: task.priority,
          due_date: null
        })
      });
      toast.success('Task updated');
    } catch {
      setTasks(prevTasks);
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (task) => {
    const confirmed = await confirm({
      title: 'Delete Task',
      message: `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger'
    });

    if (confirmed) {
      try {
        await fetch(`${API_BASE}/tasks/${task.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Task deleted');
        fetchTasks();
        if (slideOver.task?.id === task.id) {
          setSlideOver({ open: false, task: null, tab: 'details' });
        }
      } catch {
        toast.error('Failed to delete task');
      }
    }
  };

  const openSlideOver = (task, tab = 'details') => {
    setSlideOver({ open: true, task, tab });
    setEditForm({ ...task });
    fetchAssignees(task.id);
    fetchComments(task.id);
  };

  const closeSlideOver = () => {
    setSlideOver({ open: false, task: null, tab: 'details' });
    setAssignees([]);
    setComments([]);
    setEditForm(null);
  };

  const saveEdit = async () => {
    if (!editForm || !slideOver.task) return;

    try {
      await fetch(`${API_BASE}/tasks/${slideOver.task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...editForm, due_date: null })
      });
      toast.success('Task updated');
      fetchTasks();
      setSlideOver(s => ({ ...s, task: { ...s.task, ...editForm } }));
    } catch {
      toast.error('Failed to update task');
    }
  };

  const fetchAssignees = async (taskId) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/assignees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAssignees(data["Assigned to :"] || []);
    } catch {
      setAssignees([]);
    }
  };

  const assignUser = async () => {
    if (!selectedUserId || !slideOver.task) return;

    try {
      await fetch(`${API_BASE}/tasks/${slideOver.task.id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ user_ids: [Number(selectedUserId)] })
      });
      toast.success('User assigned');
      fetchAssignees(slideOver.task.id);
      setSelectedUserId('');
      fetchTasks();
    } catch {
      toast.error('Failed to assign user');
    }
  };

  const unassignUser = async (userId) => {
    if (!slideOver.task) return;

    try {
      await fetch(`${API_BASE}/tasks/${slideOver.task.id}/unassign/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User removed');
      fetchAssignees(slideOver.task.id);
      fetchTasks();
    } catch {
      toast.error('Failed to remove user');
    }
  };

  const fetchComments = async (taskId) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setComments(data.Comments || []);
    } catch {
      setComments([]);
    }
  };

  const addComment = async () => {
    if (!commentText.trim() || !slideOver.task) return;

    try {
      await fetch(`${API_BASE}/tasks/${slideOver.task.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ comment: commentText })
      });
      toast.success('Comment added');
      setCommentText('');
      fetchComments(slideOver.task.id);
    } catch {
      toast.error('Failed to add comment');
    }
  };

  const deleteComment = async (commentId) => {
    const confirmed = await confirm({
      title: 'Delete Comment',
      message: 'Are you sure you want to delete this comment?',
      confirmText: 'Delete',
      variant: 'danger'
    });

    if (confirmed) {
      try {
        await fetch(`${API_BASE}/comments/${commentId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Comment deleted');
        fetchComments(slideOver.task.id);
      } catch {
        toast.error('Failed to delete comment');
      }
    }
  };

  const saveEditComment = async (commentId) => {
    try {
      await fetch(`${API_BASE}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ comment: commentEditText })
      });
      toast.success('Comment updated');
      setEditingCommentId(null);
      setCommentEditText('');
      fetchComments(slideOver.task.id);
    } catch {
      toast.error('Failed to update comment');
    }
  };

  const breadcrumb = (
    <div className="flex items-center gap-2 text-sm mb-4">
      <Link to="/teams" className="text-gray-500 hover:text-gray-700">Teams</Link>
      <span className="text-gray-300">/</span>
      <Link to={`/teams/${teamId}/projects`} className="text-gray-500 hover:text-gray-700">Projects</Link>
      <span className="text-gray-300">/</span>
      <span className="text-gray-900 font-medium">Tasks</span>
    </div>
  );

  return (
    <AppLayout>
      {breadcrumb}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{projectName || 'Tasks'}</h1>
          <p className="text-sm text-gray-500 mt-1">Manage tasks and track progress</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleViewModeChange('board')}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                viewMode === 'board' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              )}
            >
              Board
            </button>
            <button
              onClick={() => handleViewModeChange('list')}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              )}
            >
              List
            </button>
          </div>
          <Button onClick={() => setIsCreating(!isCreating)}>
            {isCreating ? 'Cancel' : '+ New Task'}
          </Button>
        </div>
      </div>

      {isCreating && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6 animate-fade-in">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Task</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
              <Input
                placeholder="Task title"
                value={createForm.title}
                onChange={(e) => setCreateForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <Textarea
                placeholder="Add description..."
                value={createForm.description}
                onChange={(e) => setCreateForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <Select
                  value={createForm.status}
                  onChange={(e) => setCreateForm(f => ({ ...f, status: e.target.value }))}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                  <option value="blocked">Blocked</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                <Select
                  value={createForm.priority}
                  onChange={(e) => setCreateForm(f => ({ ...f, priority: e.target.value }))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </Select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={createTask}>Create Task</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsCreating(false);
                  setCreateForm({ title: '', description: '', status: 'todo', priority: 'medium' });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
          <p className="text-sm text-gray-500 mb-4">Create your first task to get started</p>
          <Button onClick={() => setIsCreating(true)}>Create Task</Button>
        </div>
      ) : viewMode === 'board' ? (
        <KanbanBoard
          tasks={tasks}
          assigneesByTask={assigneesByTask}
          onStatusChange={handleStatusChange}
          onEdit={(task) => openSlideOver(task, 'details')}
          onDelete={handleDelete}
          onAssign={(task) => openSlideOver(task, 'assign')}
          onComment={(task) => openSlideOver(task, 'comments')}
        />
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div
              key={task.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-card transition-shadow cursor-pointer"
              onClick={() => openSlideOver(task)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  {task.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{task.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-over Panel */}
      {slideOver.open && slideOver.task && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/20" onClick={closeSlideOver} />
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-modal animate-slide-in-right flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Task Details</h2>
              <button onClick={closeSlideOver} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-gray-200">
              {['details', 'assign', 'comments'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSlideOver(s => ({ ...s, tab }))}
                  className={cn(
                    'flex-1 px-4 py-2.5 text-sm font-medium transition-colors',
                    slideOver.tab === tab
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {slideOver.tab === 'details' && editForm && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                      <Select
                        value={editForm.status}
                        onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value }))}
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                        <option value="blocked">Blocked</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                      <Select
                        value={editForm.priority}
                        onChange={(e) => setEditForm(f => ({ ...f, priority: e.target.value }))}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button onClick={saveEdit}>Save Changes</Button>
                    <Button variant="danger" onClick={() => handleDelete(slideOver.task)}>
                      Delete Task
                    </Button>
                  </div>
                </div>
              )}

              {slideOver.tab === 'assign' && (
                <div className="space-y-4">
                  {canAssign && (
                    <div className="flex gap-2">
                      <Select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="flex-1"
                      >
                        <option value="">Select member</option>
                        {teamMembers.map(m => (
                          <option key={m[0]} value={m[0]}>{m[4]} ({m[5]})</option>
                        ))}
                      </Select>
                      <Button onClick={assignUser}>Assign</Button>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Assigned Members</h4>
                    {assignees.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-6">No assignees yet</p>
                    ) : (
                      <div className="space-y-2">
                        {assignees.map((a, idx) => {
                          const uid = a[1] || a[0];
                          const label = a[2] || `User ${uid}`;
                          return (
                            <div key={`${uid}-${idx}`} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center gap-3">
                                <Avatar name={label} size="sm" />
                                <span className="text-sm font-medium text-gray-900">{label}</span>
                              </div>
                              {canAssign && (
                                <button
                                  onClick={() => unassignUser(uid)}
                                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {slideOver.tab === 'comments' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addComment()}
                    />
                    <Button onClick={addComment}>Add</Button>
                  </div>

                  <div className="space-y-3">
                    {comments.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-6">No comments yet</p>
                    ) : (
                      comments.map(c => {
                        const cid = c[0];
                        const text = c[2];
                        const authorId = c[3];
                        const authorName = c[4] || 'Unknown';
                        const canEdit = authorId === myUserId;

                        return (
                          <div key={cid} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-start gap-3">
                              <Avatar name={authorName} size="sm" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">{authorName}</p>
                                {editingCommentId === cid ? (
                                  <div className="mt-2 space-y-2">
                                    <Input
                                      value={commentEditText}
                                      onChange={(e) => setCommentEditText(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                      <Button size="sm" onClick={() => saveEditComment(cid)}>Save</Button>
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => { setEditingCommentId(null); setCommentEditText(''); }}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-sm text-gray-600 mt-1">{text}</p>
                                    <div className="flex gap-3 mt-2">
                                      {canEdit && (
                                        <button
                                          onClick={() => { setEditingCommentId(cid); setCommentEditText(text); }}
                                          className="text-xs text-gray-500 hover:text-gray-700"
                                        >
                                          Edit
                                        </button>
                                      )}
                                      <button
                                        onClick={() => deleteComment(cid)}
                                        className="text-xs text-red-500 hover:text-red-700"
                                      >
                                        Delete
                                      </button>
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
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <Link
          to={`/teams/${teamId}/projects`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1.5" />
          Back to Projects
        </Link>
      </div>
    </AppLayout>
  );
}

function ClipboardIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

function XIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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

export default Tasks;
