import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TeamMembers from './TeamMembers';

function Teams() {
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [showMembersForTeam, setShowMembersForTeam] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const token = localStorage.getItem('token');

  const fetchTeams = () => {
    return fetch('http://18.217.29.216:8000/teams', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setTeams(data || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchTeams();
  }, [token]);

  const createTeam = () => {
    if (!teamName.trim()) {
      alert('Please enter a team name');
      return;
    }

    fetch('http://18.217.29.216:8000/teams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: teamName, description: teamDesc })
    })
      .then(() => fetchTeams())
      .then(() => {
        setTeamName('');
        setTeamDesc('');
        setIsCreating(false);
      })
      .catch(err => console.error(err));
  };

  const deleteTeam = (teamID) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;

    fetch(`http://18.217.29.216:8000/teams/${teamID}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => setTeams(prev => prev.filter(p => p[0] !== teamID)))
      .catch(err => console.error(err));
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Teams</h2>
            <p className="text-gray-600 mt-1">Manage your teams and collaborate with members</p>
          </div>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition transform hover:scale-105"
          >
            {isCreating ? 'Cancel' : '+ Create Team'}
          </button>
        </div>

        {/* Create Team Form */}
        {isCreating && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 animate-fadeIn">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Create New Team</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Engineering Team"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Describe the team's purpose..."
                  value={teamDesc}
                  onChange={(e) => setTeamDesc(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={createTeam}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Create Team
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setTeamName('');
                    setTeamDesc('');
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Teams Grid */}
        {teams.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No teams yet</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first team to collaborate with others.</p>
              <button
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Create Your First Team
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map(team => (
              <div
                key={team[0]}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                        {team[1]}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {team[2] || 'No description provided'}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full p-3 ml-2">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      Team
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/teams/${team[0]}/projects`}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg text-sm font-medium transition"
                    >
                      Projects
                    </Link>
                    <button
                      onClick={() => setShowMembersForTeam(team[0])}
                      className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition"
                    >
                      Members
                    </button>
                  </div>

                  <button
                    onClick={() => deleteTeam(team[0])}
                    className="w-full mt-2 bg-red-50 hover:bg-red-100 text-red-600 py-2 px-4 rounded-lg text-sm font-medium transition border border-red-200"
                  >
                    Delete Team
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Team Members Modal */}
      {showMembersForTeam && (
        <TeamMembers
          teamId={showMembersForTeam}
          onClose={() => setShowMembersForTeam(null)}
        />
      )}
    </div>
  );
}

export default Teams;