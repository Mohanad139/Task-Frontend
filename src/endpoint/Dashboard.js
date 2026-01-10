import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Dashboard() {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('user_id');
  const navigate = useNavigate();

  const [recentProjects, setRecentProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [stats, setStats] = useState({ totalTeams: 0, totalProjects: 0, totalTasks: 0 });

  useEffect(() => {
    // Redirect if no token
    if (!token) {
      window.location.href = '/login';
      return;
    }

    // Fetch teams
    fetch('https://task-management-api-production-a18c.up.railway.app/teams', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const teamsData = data || [];
        setStats(prev => ({ ...prev, totalTeams: teamsData.length }));
        
        // Fetch projects for each team
        const projectPromises = teamsData.map(team =>
          fetch(`https://task-management-api-production-a18c.up.railway.app/teams/${team[0]}/projects`, {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(res => res.json())
            .then(projects => ({ teamId: team[0], teamName: team[1], projects: projects.Projects || [] }))
        );
        
        return Promise.all(projectPromises);
      })
      .then(teamProjects => {
        // Flatten all projects
        const allProjects = teamProjects.flatMap(tp => 
          tp.projects.map(p => ({ ...p, teamName: tp.teamName }))
        );
        setRecentProjects(allProjects.slice(0, 5)); // Show 5 most recent
        setStats(prev => ({ ...prev, totalProjects: allProjects.length }));

        // Fetch tasks for recent projects
        const taskPromises = allProjects.slice(0, 10).map(project =>
          fetch(`https://task-management-api-production-a18c.up.railway.app/projects/${project[0]}/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(res => res.json())
            .then(tasks => {
              const taskList = tasks.Tasks || [];
              return taskList.map(task => ({
                ...task,
                projectName: project[2],
                projectId: project[0]
              }));
            })
        );

        return Promise.all(taskPromises);
      })
      .then(projectTasks => {
        const allTasks = projectTasks.flat();
        
        // Filter tasks assigned to current user (you'll need to check assignments)
        // For now, show all tasks
        setMyTasks(allTasks.slice(0, 8)); // Show 8 most recent
        setStats(prev => ({ ...prev, totalTasks: allTasks.length }));
      })
      .catch(console.error);
  }, [token, userId]);

  const getStatusColor = (status) => {
    const colors = {
      'todo': 'bg-gray-200 text-gray-800',
      'in_progress': 'bg-blue-200 text-blue-800',
      'done': 'bg-green-200 text-green-800',
      'blocked': 'bg-red-200 text-red-800',
      'active': 'bg-blue-200 text-blue-800',
      'completed': 'bg-green-200 text-green-800',
      'archived': 'bg-gray-200 text-gray-800'
    };
    return colors[status] || 'bg-gray-200 text-gray-800';
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MoTask
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
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
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your projects.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Teams</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalTeams}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalProjects}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalTasks}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Projects */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
            </div>
            <div className="p-6">
              {recentProjects.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No projects yet</p>
              ) : (
                <div className="space-y-3">
                  {recentProjects.map(project => (
                    <Link
                      key={project[0]}
                      to={`/projects/${project[0]}/tasks`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{project[2]}</h4>
                          <p className="text-sm text-gray-500 mt-1">{project.teamName}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project[6])}`}>
                          {project[6]}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* My Tasks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Tasks</h3>
            </div>
            <div className="p-6">
              {myTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No tasks yet</p>
              ) : (
                <div className="space-y-3">
                  {myTasks.map((task, idx) => (
                    <div
                      key={task[0] || idx}
                      className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{task[2]}</h4>
                          <p className="text-sm text-gray-500 mt-1">{task.projectName}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task[4])}`}>
                              {task[4]}
                            </span>
                            <span className={`text-xs font-medium ${getPriorityColor(task[5])}`}>
                              {task[5]} priority
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/teams"
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition backdrop-blur-sm"
            >
              <p className="font-semibold">Create New Team</p>
              <p className="text-sm opacity-90 mt-1">Start collaborating with your team</p>
            </Link>
            <button 
              onClick={() => {
                // Navigate to first team's projects if teams exist
                fetch('https://task-management-api-production-a18c.up.railway.app/teams', {
                  headers: { Authorization: `Bearer ${token}` }
                })
                  .then(res => res.json())
                  .then(data => {
                    const teams = data || [];
                    if (teams.length > 0) {
                      navigate(`/teams/${teams[0][0]}/projects`);
                    } else {
                      alert('No teams found. Please create a team first.');
                      navigate('/teams');
                    }
                  })
                  .catch(() => {
                    alert('Error loading teams');
                  });
              }}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition backdrop-blur-sm text-left"
            >
              <p className="font-semibold">View All Projects</p>
              <p className="text-sm opacity-90 mt-1">Browse through all your projects</p>
            </button>
            <button 
              onClick={() => {
                // Navigate to first project's tasks if projects exist
                fetch('https://task-management-api-production-a18c.up.railway.app/teams', {
                  headers: { Authorization: `Bearer ${token}` }
                })
                  .then(res => res.json())
                  .then(data => {
                    const teams = data || [];
                    if (teams.length === 0) {
                      alert('No teams found. Please create a team first.');
                      navigate('/teams');
                      return;
                    }
                    
                    // Get projects from first team
                    return fetch(`https://task-management-api-production-a18c.up.railway.app/teams/${teams[0][0]}/projects`, {
                      headers: { Authorization: `Bearer ${token}` }
                    })
                      .then(res => res.json())
                      .then(projectData => {
                        const projects = projectData.Projects || projectData.projects || projectData || [];
                        if (projects.length > 0) {
                          navigate(`/projects/${projects[0][0]}/tasks`);
                        } else {
                          alert('No projects found. Please create a project first.');
                          navigate(`/teams/${teams[0][0]}/projects`);
                        }
                      });
                  })
                  .catch(() => {
                    alert('Error loading data');
                  });
              }}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition backdrop-blur-sm text-left"
            >
              <p className="font-semibold">Task Overview</p>
              <p className="text-sm opacity-90 mt-1">See all your assigned tasks</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;