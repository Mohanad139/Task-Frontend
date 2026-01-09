import { useEffect, useState } from "react";

function TeamMembers({ teamId, onClose }) {
  const token = localStorage.getItem("token");

  const [members, setMembers] = useState([]);
  const [newUsername, setNewUsername] = useState("");
  const [selectedRole, setSelectedRole] = useState("member");

  const fetchMembers = () => {
    return fetch(`http://18.217.29.216:8000/teams/${teamId}/members`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const list = data.Members || data.members || data || [];
        setMembers(list);
      });
  };

  useEffect(() => {
    if (!teamId) return;
    fetchMembers().catch(err => console.error(err));
  }, [teamId, token]);

  const addMember = () => {
    if (!newUsername.trim()) {
      alert('Please enter a username');
      return;
    }

    fetch(`http://18.217.29.216:8000/teams/${teamId}/members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ username: newUsername })
    })
      .then(() => fetchMembers())
      .then(() => setNewUsername(""))
      .catch(err => {
        console.error(err);
        alert('Failed to add member. User may not exist.');
      });
  };

  const updateRole = (userId) => {
    fetch(`http://18.217.29.216:8000/teams/${teamId}/members/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ role: selectedRole })
    })
      .then(() => fetchMembers())
      .catch(err => console.error(err));
  };

  const removeMember = (userId) => {
    if (!window.confirm('Remove this member from the team?')) return;

    fetch(`http://18.217.29.216:8000/teams/${teamId}/members/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchMembers())
      .catch(err => console.error(err));
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      'owner': 'bg-purple-100 text-purple-700 border-purple-200',
      'admin': 'bg-blue-100 text-blue-700 border-blue-200',
      'member': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[role] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Team Members</h2>
              <p className="text-blue-100 text-sm mt-1">Manage team members and roles</p>
            </div>
            <button
              onClick={onClose}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Add Member Section */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Add New Member
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
              <button 
                onClick={addMember}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap"
              >
                + Add Member
              </button>
            </div>
          </div>

          {/* Role Management Section */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Change Member Role
            </h3>
            <div className="space-y-3">
              <select 
                value={selectedRole} 
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              >
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
              </select>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Instructions:</span> Select a role above, then click "Update Role" on any member card below.
              </p>
            </div>
          </div>

          {/* Members List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Current Members ({members.length})
            </h3>

            {members.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <div className="bg-gray-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">No members yet</p>
                <p className="text-gray-500 text-sm mt-1">Add members to start collaborating</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {members.map((m, idx) => {
                  const userId = m?.[0];
                  const role = m?.[2];
                  const joined = m?.[3];
                  const username = m?.[4];
                  const email = m?.[5];

                  return (
                    <div
                      key={`${userId}-${idx}`}
                      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Avatar */}
                          <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg">
                            {username?.charAt(0).toUpperCase() || 'U'}
                          </div>

                          {/* Member Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 text-lg">{username}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(role)}`}>
                                {role}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-1">{email}</p>
                            <p className="text-gray-500 text-xs">
                              Joined: {new Date(joined).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => updateRole(userId)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap"
                          >
                            Update Role
                          </button>
                          <button
                            onClick={() => removeMember(userId)}
                            className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeamMembers;