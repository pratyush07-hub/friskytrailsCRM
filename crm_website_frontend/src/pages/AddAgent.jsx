import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AddAgent({ agents = [], setAgents, leads = [], API_URL, token }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Precompute a map of agentId -> count
  const agentLeadCounts = leads.reduce((acc, lead) => {
    if (lead.agentId) {
      acc[lead.agentId] = (acc[lead.agentId] || 0) + 1;
    }
    return acc;
  }, {});

  const handleAddAgent = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error('All fields are required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Agent ${data.user.name} added successfully!`);
        if (setAgents) {
          setAgents((prev) => [...prev, data.user]);
        }
        setName('');
        setEmail('');
        setPassword('');
      } else {
        toast.error(data.error || 'Failed to add agent');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server connection error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form: Add Agent (1/3 column) */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 shadow-xl rounded-xl p-6 border border-gray-100 dark:border-slate-700">
            <div className="border-b border-gray-100 dark:border-slate-700 pb-4 mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Agent</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Create a new travel agent profile to assign leads.
              </p>
            </div>

            <form onSubmit={handleAddAgent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm py-2 px-3 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john@friskytrails.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm py-2 px-3 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm py-2 px-3 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm py-2.5 rounded-lg font-bold transition-all cursor-pointer shadow-md mt-2"
              >
                {submitting ? 'Creating Agent...' : 'Create Agent Account'}
              </button>
            </form>
          </div>
        </div>

        {/* List: Current Agents (2/3 column) */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 shadow-xl rounded-xl p-6 border border-gray-100 dark:border-slate-700">
            <div className="border-b border-gray-100 dark:border-slate-700 pb-4 mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Current Agents ({agents.length})</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Overview of the active travel agents in your CRM and their current lead loads.
              </p>
            </div>

            {agents.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-8">No agents registered in the system yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {agents.map((agent) => {
                  const count = agentLeadCounts[agent.id] || 0;
                  return (
                    <div key={agent.id} className="flex items-center justify-between p-4 bg-gray-50/60 dark:bg-slate-900/40 hover:bg-gray-50 dark:hover:bg-slate-900/60 transition-colors rounded-xl border border-gray-100 dark:border-slate-800">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-450 flex items-center justify-center font-bold text-sm border border-orange-200/50 dark:border-orange-900/50">
                          {agent.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{agent.name}</p>
                          <p className="text-[10px] text-gray-400 dark:text-slate-500 font-mono mt-0.5">{agent.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${count > 0 ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-450' : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                          {count} {count === 1 ? 'Lead' : 'Leads'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
