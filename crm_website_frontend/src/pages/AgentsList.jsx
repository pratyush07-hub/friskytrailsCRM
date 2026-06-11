import React from 'react';

export default function AgentsList({ agents = [], leads = [] }) {
  // Helper to count leads for a specific agent
  const getAssignedLeadsCount = (agentId) => {
    return leads.filter(lead => lead.agentId === agentId).length;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white shadow-xl rounded-xl p-6 border border-gray-100">
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h3 className="text-lg font-bold text-gray-900">Current Agents</h3>
          <p className="text-xs text-gray-500 mt-1">
            Overview of the active travel agents in your CRM and their current lead loads.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {agents.map((agent) => {
            const count = getAssignedLeadsCount(agent.id);
            return (
              <div key={agent.id} className="flex items-center justify-between p-4 bg-gray-50/60 hover:bg-gray-50 transition-colors rounded-xl border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                    {agent.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{agent.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${count > 0 ? 'bg-orange-50 text-orange-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {count} {count === 1 ? 'Lead' : 'Leads'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
