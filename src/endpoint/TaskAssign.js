import { useEffect, useState } from "react";

function TaskAssign({ taskId, teamId }) {
  const token = localStorage.getItem("token");

  const [assignees, setAssignees] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [userId, setUserId] = useState("");

  const fetchAssignees = () => {
    return fetch(`https://task-management-api-production-a18c.up.railway.app/tasks/${taskId}/assignees`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setAssignees(data.Assignees || []));
  };

  const fetchTeamMembers = () => {
    return fetch(`https://task-management-api-production-a18c.up.railway.app/teams/${teamId}/members`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setTeamMembers(data.Members || []));
  };

  useEffect(() => {
    if (!taskId || !teamId) return;
    fetchAssignees();
    fetchTeamMembers();
  }, [taskId, teamId, token]);

  const assignUser = () => {
    fetch(`https://task-management-api-production-a18c.up.railway.app/tasks/${taskId}/assignees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ user_id: Number(userId) })
    })
      .then(() => {
        setUserId("");
        fetchAssignees();
      })
      .catch(console.error);
  };

  const removeAssignee = (uid) => {
    fetch(`https://task-management-api-production-a18c.up.railway.app/tasks/${taskId}/assignees/${uid}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchAssignees())
      .catch(console.error);
  };

  return (
    <div style={{ border: "1px solid #aaa", padding: 10, marginTop: 10 }}>
      <h4>Assignees</h4>

      <div>
        <select value={userId} onChange={(e) => setUserId(e.target.value)}>
          <option value="">Select member</option>
          {teamMembers.map((m) => (
            <option key={m[0]} value={m[0]}>
              {m[4]} ({m[5]})
            </option>
          ))}
        </select>
        <button onClick={assignUser} style={{ marginLeft: 8 }}>
          Assign
        </button>
      </div>

      {assignees.length === 0 ? (
        <p>No assignees</p>
      ) : (
        assignees.map(a => (
          <div key={a[0]} style={{ marginTop: 8 }}>
            <span>{a[3] || `User ${a[2]}`}</span>
            <button
              onClick={() => removeAssignee(a[2])}
              style={{ marginLeft: 8 }}
            >
              Remove
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default TaskAssign;
