import { useState } from 'react';

const getNoteDisplayDate = (note) => {
  if (!note || !note.timestamp) return 'Unknown time';
  // If the timestamp already has a date format (contains a comma), use it
  if (note.timestamp.includes(',')) {
    return note.timestamp;
  }

  // Fallback: extract date from Mongoose ObjectId (24 hex characters)
  const idStr = note.id || note._id;
  if (idStr && idStr.length === 24) {
    try {
      const timestamp = parseInt(idStr.substring(0, 8), 16) * 1000;
      if (!isNaN(timestamp)) {
        const date = new Date(timestamp);
        const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        const timeStr = note.timestamp.trim();
        return `${dateStr}, ${timeStr}`;
      }
    } catch {
      // ignore
    }
  }

  return note.timestamp;
};

export default function MyLeads({ leads, addNote, deleteNote, user, loading }) {
  const [viewMode, setViewMode] = useState('card');
  const [noteInputs, setNoteInputs] = useState({});
  const [expandedNotes, setExpandedNotes] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Filter leads to ONLY those assigned to the current user
  const myLeads = leads.filter(lead => lead.agentId === user.id);

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

  // Metrics for My Leads
  const totalMyLeads = myLeads.length;


  // Search logic
  const filteredLeads = myLeads.filter((lead) => {
    const nameMatch = lead.name ? lead.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const phoneMatch = lead.phone.includes(searchQuery);
    const originMatch = lead.origin ? lead.origin.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const destMatch = lead.destination ? lead.destination.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const sourceMatch = lead.leadSource ? lead.leadSource.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const mailMatch = lead.mailId ? lead.mailId.toLowerCase().includes(searchQuery.toLowerCase()) : false;

    return nameMatch || phoneMatch || originMatch || destMatch || sourceMatch || mailMatch;
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
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">My Leads</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage and update the client travel requests assigned directly to you.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2 bg-gray-200/60 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('card')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${viewMode === 'card'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Grid Card
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${viewMode === 'list'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Clean List
          </button>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 mt-8">
        {/* Total Leads Card */}
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 p-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">My Active Leads</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalMyLeads}</p>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="mt-8 bg-white p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-gray-100">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, phone, origin, destination, mail, or source..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm bg-gray-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
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

      {loading ? (
        <div className="mt-8 flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm font-semibold text-gray-500 dark:text-slate-400">Loading your leads...</p>
        </div>
      ) : myLeads.length === 0 ? (
        <div className="mt-8 text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No leads assigned</h3>
          <p className="mt-2 text-sm text-gray-500">You currently have no leads assigned to you.</p>
        </div>
      ) : sortedLeads.length === 0 ? (
        <div className="mt-8 text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No matching leads</h3>
          <p className="mt-2 text-sm text-gray-500">Try adjusting your search query or filters.</p>
        </div>
      ) : viewMode === 'card' ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start">
          {sortedLeads.map((lead) => {
            const isNotesExpanded = !!expandedNotes[lead.id];

            return (
              <div
                key={lead.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between border border-gray-100 p-6 relative group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-bold text-gray-950 group-hover:text-orange-600 transition-colors">
                          {lead.name || 'Unnamed Lead'}
                        </h3>
                      </div>
                      <span className="text-xs text-gray-500 block mt-0.5">
                        {lead.phone} {lead.mailId && `• ${lead.mailId}`}
                      </span>
                      {lead.leadSource && (
                        <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100/30">
                          Source: {lead.leadSource}
                        </span>
                      )}
                    </div>
                    {lead.age && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
                        Age {lead.age}
                      </span>
                    )}
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
                  {/* Notes / Chat logs section */}
                  <div>
                    <button
                      onClick={() => toggleNotes(lead.id)}
                      className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center space-x-1 cursor-pointer"
                    >
                      <span>{isNotesExpanded ? 'Hide Chat Log' : `Chat Log (${lead.notes ? lead.notes.length : 0})`}</span>
                    </button>

                    {isNotesExpanded && (
                      <div className="mt-3 space-y-3">
                        <div className="max-h-36 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                          {(!lead.notes || lead.notes.length === 0) ? (
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 italic">No notes posted yet.</p>
                          ) : (
                            lead.notes.map((note) => {
                              const isMyNote = note.authorId ? note.authorId === user.id : note.author === user.name;
                              return (
                                <div key={note.id || note._id} className={`${isMyNote ? 'bg-blue-50/60 border border-blue-100/50 dark:bg-blue-900/30 dark:border-blue-800/50' : 'bg-gray-50 border border-transparent dark:bg-slate-800/50'} p-2 rounded-lg text-xs transition-colors`}>
                                  <div className="flex justify-between font-semibold text-[10px] text-gray-500 dark:text-gray-400">
                                    <span className={isMyNote ? 'text-blue-600 dark:text-blue-400' : 'dark:text-gray-300'}>{note.author} {isMyNote && '(You)'}</span>
                                    <div className="flex items-center space-x-1.5">
                                      <span>{getNoteDisplayDate(note)}</span>
                                      {isMyNote && (
                                        <button 
                                          onClick={() => deleteNote(lead.id, note.id || note._id)} 
                                          className="text-red-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer p-0.5 rounded transition-colors"
                                          title="Delete note"
                                        >
                                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                          </svg>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-gray-700 dark:text-slate-200 mt-0.5">{note.text}</p>
                                </div>
                              );
                            })
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <input
                            type="text"
                            placeholder="Add update..."
                            value={noteInputs[lead.id] || ''}
                            onChange={(e) => setNoteInputs({ ...noteInputs, [lead.id]: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendNote(lead.id)}
                            className="w-full text-xs py-1.5 px-3 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                          />
                          <button
                            onClick={() => handleSendNote(lead.id)}
                            className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold cursor-pointer"
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
            const isNotesExpanded = !!expandedNotes[lead.id];

            return (
              <div
                key={lead.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 p-5 flex flex-col space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="flex items-center space-x-4 min-w-[200px]">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold text-gray-950">{lead.name || 'Unnamed Lead'}</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 text-xs text-gray-500 mt-0.5">
                        {lead.age && (
                          <>
                            <span>Age: {lead.age}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>{lead.phone}</span>
                        {lead.mailId && (
                          <>
                            <span>•</span>
                            <span>{lead.mailId}</span>
                          </>
                        )}
                        {lead.leadSource && (
                          <>
                            <span>•</span>
                            <span className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-100/30">Source: {lead.leadSource}</span>
                          </>
                        )}
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
                    <div className="text-xs font-semibold text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 min-w-[120px] text-center">
                      Assigned to You
                    </div>
                    <button
                      onClick={() => toggleNotes(lead.id)}
                      className="text-xs text-orange-600 hover:text-orange-700 font-semibold px-2 py-1 bg-orange-50 rounded-lg cursor-pointer"
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
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 italic">No notes posted yet.</p>
                        ) : (
                          lead.notes.map((note) => {
                            const isMyNote = note.authorId ? note.authorId === user.id : note.author === user.name;
                            return (
                              <div key={note.id || note._id} className={`${isMyNote ? 'bg-blue-50/60 border border-blue-100/50 dark:bg-blue-900/30 dark:border-blue-800/50' : 'bg-gray-50 border border-transparent dark:bg-slate-800/50'} p-2.5 rounded-lg text-xs transition-colors`}>
                                <div className="flex justify-between font-semibold text-[10px] text-gray-500 dark:text-gray-400">
                                  <span className={isMyNote ? 'text-blue-600 dark:text-blue-400' : 'dark:text-gray-300'}>{note.author} {isMyNote && '(You)'}</span>
                                  <div className="flex items-center space-x-1.5">
                                    <span>{getNoteDisplayDate(note)}</span>
                                    {isMyNote && (
                                      <button 
                                        onClick={() => deleteNote(lead.id, note.id || note._id)} 
                                        className="text-red-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer p-0.5 rounded transition-colors"
                                        title="Delete note"
                                      >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                          <polyline points="3 6 5 6 21 6"></polyline>
                                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-gray-700 dark:text-slate-200 mt-0.5">{note.text}</p>
                              </div>
                            );
                          })
                        )}
                      </div>
                      <div className="flex items-start space-x-2">
                        <textarea
                          placeholder="Type important information..."
                          value={noteInputs[lead.id] || ''}
                          onChange={(e) => setNoteInputs({ ...noteInputs, [lead.id]: e.target.value })}
                          className="w-full text-xs p-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none h-16"
                        />
                        <button
                          onClick={() => handleSendNote(lead.id)}
                          className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-4 py-2 rounded-lg font-semibold h-10 cursor-pointer"
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
