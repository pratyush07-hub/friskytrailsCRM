import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import toast, { Toaster } from "react-hot-toast";
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AddLead from './pages/AddLead';
import AddAgent from './pages/AddAgent';
import './index.css';

// Mock agents data (array of length 5)
const initialAgents = [
  { id: '1', name: 'Agent Alice' },
  { id: '2', name: 'Agent Bob' },
  { id: '3', name: 'Agent Charlie' },
  { id: '4', name: 'Agent Dave' },
  { id: '5', name: 'Agent Eve' },
];

function App() {
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState(initialAgents);

  const addLead = (newLead) => {
    const lead = {
      ...newLead,
      id: Date.now().toString(),
      agentId: null, // Initially unassigned
      notes: [], // List of comments/agent logs
    };
    setLeads([...leads, lead]);
  };

  const addAgent = (newAgent) => {
    const agent = {
      ...newAgent,
      id: Date.now().toString(),
    };
    setAgents([...agents, agent]);
  };

  const assignAgent = (leadId, agentId) => {
    setLeads(leads.map(lead =>
      lead.id === leadId ? { ...lead, agentId } : lead
    ));
    toast.success("Lead assigned to agent successfully.");
  };

  const addNote = (leadId, noteText) => {
    setLeads(leads.map(lead => {
      if (lead.id === leadId) {
        const assignedAgent = agents.find(a => a.id === lead.agentId);
        const authorName = assignedAgent ? assignedAgent.name : 'System/Admin';
        const newNote = {
          id: Date.now().toString(),
          text: noteText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          author: authorName,
        };
        return {
          ...lead,
          notes: [...(lead.notes || []), newNote],
        };
      }
      return lead;
    }));
  };

  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <Toaster position='top-center' />
        <main>
          <Routes>
            <Route
              path="/"
              element={<Dashboard leads={leads} agents={agents} assignAgent={assignAgent} addNote={addNote} />}
            />
            <Route
              path="/add-lead"
              element={<AddLead addLead={addLead} />}
            />
            <Route
              path="/add-agent"
              element={<AddAgent addAgent={addAgent} />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
