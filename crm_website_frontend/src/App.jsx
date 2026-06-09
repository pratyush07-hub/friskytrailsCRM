import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import toast, { Toaster } from "react-hot-toast";
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import MyLeads from './pages/MyLeads';
import AddLead from './pages/AddLead';
import AddAgent from './pages/AddAgent';
import Login from './pages/Login';
import './index.css';

const API_URL = `${import.meta.env.VITE_API_URL}`;

function App() {
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // Fetch all leads and agents on component mount or token update
  useEffect(() => {
    if (!token) return;
    async function fetchData() {
      try {
        const [leadsRes, agentsRes] = await Promise.all([
          fetch(`${API_URL}/leads`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_URL}/agents`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        if (leadsRes.ok && agentsRes.ok) {
          const leadsData = await leadsRes.json();
          const agentsData = await agentsRes.json();
          setLeads(leadsData);
          setAgents(agentsData);
        } else {
          // If token expired or invalid
          if (leadsRes.status === 401 || agentsRes.status === 401) {
            handleLogout();
            toast.error("Session expired. Please log in again.");
          } else {
            toast.error("Failed to load data from server");
          }
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Could not connect to backend server");
      }
    }
    fetchData();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
  };

  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const addLead = async (newLead) => {
    try {
      const response = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newLead),
      });
      if (response.ok) {
        const savedLead = await response.json();
        setLeads((prev) => [savedLead, ...prev]);
        toast.success("Lead added successfully.");
        return true;
      } else {
        toast.error("Failed to add lead.");
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error("Server connection error.");
      return false;
    }
  };

  const assignAgent = async (leadId, agentId) => {
    try {
      const response = await fetch(`${API_URL}/leads/${leadId}/assign`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ agentId }),
      });
      if (response.ok) {
        const updatedLead = await response.json();
        setLeads((prev) => prev.map(lead => lead.id === leadId ? updatedLead : lead));
        if (agentId) {
          toast.success("Lead assigned to agent successfully.");
        } else {
          toast.success("Lead unassigned successfully.");
        }
      } else {
        toast.error("Failed to assign lead.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server connection error.");
    }
  };

  const addNote = async (leadId, noteText) => {
    try {
      const response = await fetch(`${API_URL}/leads/${leadId}/notes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ text: noteText }),
      });
      if (response.ok) {
        const updatedLead = await response.json();
        setLeads((prev) => prev.map(lead => lead.id === leadId ? updatedLead : lead));
        toast.success("Note added successfully.");
      } else {
        toast.error("Failed to add note.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server connection error.");
    }
  };

  const deleteNote = async (leadId, noteId) => {
    try {
      const response = await fetch(`${API_URL}/leads/${leadId}/notes/${noteId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const updatedLead = await response.json();
        setLeads((prev) => prev.map(lead => lead.id === leadId ? updatedLead : lead));
        toast.success("Note deleted successfully.");
      } else {
        const errData = await response.json().catch(() => ({}));
        toast.error(`Failed to delete note: ${errData.error || response.statusText}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Server connection error.");
    }
  };

  const updateLead = async (leadId, updatedLead) => {
    try {
      const response = await fetch(`${API_URL}/leads/${leadId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedLead),
      });
      if (response.ok) {
        const savedLead = await response.json();
        setLeads((prev) => prev.map(lead => lead.id === leadId ? savedLead : lead));
        toast.success("Lead updated successfully.");
        return true;
      } else {
        toast.error("Failed to update lead.");
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error("Server connection error.");
      return false;
    }
  };

  // If not logged in, intercept and show Login Page
  if (!token) {
    return (
      <Router>
        <div className="min-h-screen">
          <Navbar darkMode={darkMode} setDarkMode={setDarkMode} user={null} />
          <Toaster position='top-center' />
          <main>
            <Routes>
              <Route path="*" element={<Login setToken={setToken} setUser={setUser} API_URL={API_URL} />} />
            </Routes>
          </main>
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen">
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} user={user} handleLogout={handleLogout} />
        <Toaster position='top-center' />
        <main>
          <Routes>
            <Route
              path="/"
              element={<Dashboard leads={leads} agents={agents} assignAgent={assignAgent} addNote={addNote} deleteNote={deleteNote} updateLead={updateLead} user={user} />}
            />
            <Route
              path="/my-leads"
              element={!user.isAdmin ? <MyLeads leads={leads} addNote={addNote} deleteNote={deleteNote} user={user} /> : <Navigate to="/" replace />}
            />
            <Route
              path="/add-lead"
              element={user.isAdmin ? <AddLead addLead={addLead} /> : <Navigate to="/" replace />}
            />
            <Route
              path="/agents"
              element={user.isAdmin ? <AddAgent agents={agents} leads={leads} /> : <Navigate to="/" replace />}
            />
            {/* Redirect any other path to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
