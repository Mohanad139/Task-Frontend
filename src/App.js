import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './endpoint/Login';
import Register from './endpoint/Register';
import Dashboard from './endpoint/Dashboard';
import Teams from './endpoint/Teams';
import Projects from './endpoint/Projects';
import Tasks from './endpoint/Tasks'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/teams/:teamId/projects" element={<Projects />} />
        <Route path="/projects/:projectId/tasks" element={<Tasks />} />
      </Routes>
    </BrowserRouter>
  )}
  
  export default App;