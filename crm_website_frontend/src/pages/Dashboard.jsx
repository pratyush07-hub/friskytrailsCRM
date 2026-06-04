import { useState } from 'react';

export default function Dashboard({ leads, agents, assignAgent, addNote }) {
  const [pendingAssignments, setPendingAssignments] = useState({});
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
  const [noteInputs, setNoteInputs] = useState({}); // { [leadId]: 'comment text' }
  const [expandedNotes, setExpandedNotes] = useState({}); // { [leadId]: true/false }
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAgent, setFilterAgent] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const handleSelectChange = (leadId, value) => {
    setPendingAssignments({
      ...pendingAssignments,
      [leadId]: value
    });
  };

  const handleConfirm = (leadId) => {
    const selectedAgentId = pendingAssignments[leadId];
    if (selectedAgentId) {
      assignAgent(leadId, selectedAgentId);
      const newPending = { ...pendingAssignments };
      delete newPending[leadId];
      setPendingAssignments(newPending);
    }
  };

  const toggleNotes = (leadId) => {
    setExpandedNotes(prev => ({
      ...prev,
      [leadId]: !prev[leadId]
    }));
  };

  const handleSendNote = (leadId) => {
    const text = noteInputs[leadId];
    if (!text || !text.trim()) return;
    addNote(leadId, text.trim());
    setNoteInputs(prev => ({ ...prev, [leadId]: '' }));
  };

  // Metrics calculations
  const totalLeads = leads.length;
  const assignedLeads = leads.filter(lead => lead.agentId).length;
  const unassignedLeads = totalLeads - assignedLeads;

  const getTopDestination = () => {
    if (leads.length === 0) return 'N/A';
    const counts = {};
    leads.forEach(lead => {
      if (lead.destination) {
        const dest = lead.destination.trim();
        counts[dest] = (counts[dest] || 0) + 1;
      }
    });
    let topDest = 'N/A';
    let maxCount = 0;
    Object.entries(counts).forEach(([dest, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topDest = dest;
      }
    });
    return topDest;
  };
  const topDestination = getTopDestination();

  // Filter logic
  const filteredLeads = leads.filter((lead) => {
    const agentName = agents.find((a) => a.id === lead.agentId)?.name || '';
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agentName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAgent =
      filterAgent === 'all' ||
      (filterAgent === 'unassigned' && !lead.agentId) ||
      lead.agentId === filterAgent;

    return matchesSearch && matchesAgent;
  });

  // Sort logic
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return a.id.localeCompare(b.id);
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'age-asc':
        return Number(a.age) - Number(b.age);
      case 'age-desc':
        return Number(b.age) - Number(a.age);
      case 'newest':
      default:
        return b.id.localeCompare(a.id);
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="sm:flex sm:items-center justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Leads Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Monitor incoming client travel requests and assign them to your team of agents.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2 bg-gray-200/60 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('card')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'card'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Grid Card
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'list'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Clean List
          </button>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mt-8">
        {/* Total Leads Card */}
        <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 p-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Leads</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalLeads}</p>
        </div>

        {/* Assigned Leads Card */}
        <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 p-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assigned</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {assignedLeads} <span className="text-xs text-gray-400 font-normal">({totalLeads > 0 ? Math.round((assignedLeads / totalLeads) * 100) : 0}%)</span>
          </p>
        </div>

        {/* Unassigned Leads Card */}
        <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 p-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Unassigned</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {unassignedLeads} <span className="text-xs text-gray-400 font-normal">({totalLeads > 0 ? Math.round((unassignedLeads / totalLeads) * 100) : 0}%)</span>
          </p>
        </div>

        {/* Top Destination Card */}
        <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 p-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Top Destination</p>
          <p className="text-lg font-bold text-gray-900 mt-1 truncate" title={topDestination}>
            {topDestination}
          </p>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="mt-8 bg-white p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-gray-100">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, phone, origin, destination, or agent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm bg-gray-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Agent:</span>
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="pl-3 pr-8 py-2 text-xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-xl bg-white cursor-pointer text-gray-700 font-medium"
            >
              <option value="all">All Agents</option>
              <option value="unassigned">Unassigned Only</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-3 pr-8 py-2 text-xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-xl bg-white cursor-pointer text-gray-700 font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="age-asc">Age (Youngest First)</option>
              <option value="age-desc">Age (Oldest First)</option>
            </select>
          </div>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="mt-8 text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No leads active</h3>
          <p className="mt-2 text-sm text-gray-500">Get started by creating a new client lead.</p>
        </div>
      ) : sortedLeads.length === 0 ? (
        <div className="mt-8 text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No matching leads</h3>
          <p className="mt-2 text-sm text-gray-500">Try adjusting your search query or filters.</p>
        </div>
      ) : viewMode === 'card' ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start">
          {sortedLeads.map((lead) => {
            const currentValue = pendingAssignments[lead.id] !== undefined
              ? pendingAssignments[lead.id]
              : (lead.agentId || '');

            const hasPendingChange = pendingAssignments[lead.id] !== undefined && pendingAssignments[lead.id] !== (lead.agentId || '');
            const assignedAgent = agents.find(a => a.id === lead.agentId);
            const isNotesExpanded = !!expandedNotes[lead.id];

            return (
              <div
                key={lead.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between border border-gray-100 p-6 relative group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-950 group-hover:text-orange-600 transition-colors">
                        {lead.name}
                      </h3>
                      <span className="text-xs text-gray-500 block mt-0.5">{lead.phone}</span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700">
                      Age {lead.age}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                      <div className="text-center flex-1">
                        <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Origin</span>
                        <span className="text-sm font-medium text-gray-800">{lead.origin}</span>
                      </div>
                      <div className="px-2 text-orange-500 font-bold">➔</div>
                      <div className="text-center flex-1">
                        <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Destination</span>
                        <span className="text-sm font-medium text-gray-800">{lead.destination}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 space-y-4">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
                      {assignedAgent ? 'Assigned To' : 'Assign Lead'}
                    </span>

                    <div className="flex items-center space-x-2">
                      <select
                        className="block w-full pl-3 pr-10 py-2 text-sm border-gray-200 focus:outline-none focus:ring-orange-500 focus:border-orange-500 rounded-xl bg-white border cursor-pointer text-gray-700"
                        value={currentValue}
                        onChange={(e) => handleSelectChange(lead.id, e.target.value)}
                      >
                        <option value="" disabled>Select an agent...</option>
                        {agents.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name}
                          </option>
                        ))}
                      </select>
                      {hasPendingChange && (
                        <button
                          onClick={() => handleConfirm(lead.id)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-semibold rounded-xl shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                        >
                          Confirm
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notes / Chat logs section */}
                  <div className="border-t border-gray-100 pt-3">
                    <button
                      onClick={() => toggleNotes(lead.id)}
                      className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center space-x-1"
                    >
                      <span>{isNotesExpanded ? 'Hide Chat Log' : `Chat Log (${lead.notes ? lead.notes.length : 0})`}</span>
                    </button>

                    {isNotesExpanded && (
                      <div className="mt-3 space-y-3">
                        <div className="max-h-36 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                          {(!lead.notes || lead.notes.length === 0) ? (
                            <p className="text-[11px] text-gray-400 italic">No notes posted yet.</p>
                          ) : (
                            lead.notes.map((note) => (
                              <div key={note.id} className="bg-gray-50 p-2 rounded-lg text-xs">
                                <div className="flex justify-between font-semibold text-[10px] text-gray-500">
                                  <span>{note.author}</span>
                                  <span>{note.timestamp}</span>
                                </div>
                                <p className="text-gray-700 mt-0.5">{note.text}</p>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <input
                            type="text"
                            placeholder="Add update..."
                            value={noteInputs[lead.id] || ''}
                            onChange={(e) => setNoteInputs({ ...noteInputs, [lead.id]: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendNote(lead.id)}
                            className="w-full text-xs py-1.5 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                          />
                          <button
                            onClick={() => handleSendNote(lead.id)}
                            className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {sortedLeads.map((lead) => {
            const currentValue = pendingAssignments[lead.id] !== undefined
              ? pendingAssignments[lead.id]
              : (lead.agentId || '');

            const hasPendingChange = pendingAssignments[lead.id] !== undefined && pendingAssignments[lead.id] !== (lead.agentId || '');
            const assignedAgent = agents.find(a => a.id === lead.agentId);
            const isNotesExpanded = !!expandedNotes[lead.id];

            return (
              <div
                key={lead.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 p-5 flex flex-col space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="flex items-center space-x-4 min-w-[200px]">
                    <div>
                      <h3 className="text-base font-bold text-gray-950">{lead.name}</h3>
                      <div className="flex space-x-2 text-xs text-gray-500 mt-0.5">
                        <span>Age: {lead.age}</span>
                        <span>•</span>
                        <span>{lead.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 bg-gray-50 rounded-xl px-4 py-2 flex-1 max-w-md">
                    <div className="text-left flex-1">
                      <span className="block text-[9px] uppercase tracking-wider text-gray-400 font-semibold">Origin</span>
                      <span className="text-xs font-medium text-gray-800">{lead.origin}</span>
                    </div>
                    <div className="px-2 text-orange-500 font-bold text-sm">➔</div>
                    <div className="text-left flex-1">
                      <span className="block text-[9px] uppercase tracking-wider text-gray-400 font-semibold">Destination</span>
                      <span className="text-xs font-medium text-gray-800">{lead.destination}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 sm:min-w-[240px] justify-end">
                    <div className="w-full max-w-[180px]">
                      <select
                        className="block w-full pl-3 pr-10 py-1.5 text-xs border-gray-200 focus:outline-none focus:ring-orange-500 focus:border-orange-500 rounded-xl bg-white border cursor-pointer text-gray-700"
                        value={currentValue}
                        onChange={(e) => handleSelectChange(lead.id, e.target.value)}
                      >
                        <option value="" disabled>Select an agent...</option>
                        {agents.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {hasPendingChange && (
                      <button
                        onClick={() => handleConfirm(lead.id)}
                        className="inline-flex items-center px-3.5 py-1.5 border border-transparent text-xs font-semibold rounded-xl shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none"
                      >
                        Confirm
                      </button>
                    )}
                    <button
                      onClick={() => toggleNotes(lead.id)}
                      className="text-xs text-orange-600 hover:text-orange-700 font-semibold px-2 py-1 bg-orange-50 rounded-lg"
                    >
                      {isNotesExpanded ? 'Hide Chat' : `Chat (${lead.notes ? lead.notes.length : 0})`}
                    </button>
                  </div>
                </div>

                {isNotesExpanded && (
                  <div className="border-t border-gray-100 pt-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="max-h-36 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                        {(!lead.notes || lead.notes.length === 0) ? (
                          <p className="text-[11px] text-gray-400 italic">No notes posted yet.</p>
                        ) : (
                          lead.notes.map((note) => (
                            <div key={note.id} className="bg-gray-50 p-2.5 rounded-lg text-xs">
                              <div className="flex justify-between font-semibold text-[10px] text-gray-500">
                                <span>{note.author}</span>
                                <span>{note.timestamp}</span>
                              </div>
                              <p className="text-gray-700 mt-0.5">{note.text}</p>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="flex items-start space-x-2">
                        <textarea
                          placeholder="Type important information..."
                          value={noteInputs[lead.id] || ''}
                          onChange={(e) => setNoteInputs({ ...noteInputs, [lead.id]: e.target.value })}
                          className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none h-16"
                        />
                        <button
                          onClick={() => handleSendNote(lead.id)}
                          className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-4 py-2 rounded-lg font-semibold h-10"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
