import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const PREDEFINED_LABELS = [
  { name: 'Hot Lead', color: 'bg-red-500', text: 'text-white', border: 'border-red-400', light: 'bg-red-50 text-red-700 border-red-200' },
  { name: 'VIP', color: 'bg-purple-500', text: 'text-white', border: 'border-purple-400', light: 'bg-purple-50 text-purple-700 border-purple-200' },
  { name: 'Follow Up', color: 'bg-yellow-500', text: 'text-white', border: 'border-yellow-400', light: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { name: 'Confirmed', color: 'bg-green-500', text: 'text-white', border: 'border-green-400', light: 'bg-green-50 text-green-700 border-green-200' },
  { name: 'Pending', color: 'bg-blue-500', text: 'text-white', border: 'border-blue-400', light: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Cancelled', color: 'bg-gray-500', text: 'text-white', border: 'border-gray-400', light: 'bg-gray-100 text-gray-700 border-gray-300' },
];

const getNoteDisplayDate = (note) => {
  if (!note || !note.timestamp) return 'Unknown time';
  if (note.timestamp.includes(',')) return note.timestamp;
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
    } catch { /* ignore */ }
  }
  return note.timestamp;
};

export default function LeadDetail({ API_URL, token, user, leads, setLeads, agents }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteInput, setNoteInput] = useState('');
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  useEffect(() => {
    fetchLead();
  }, [id]);

  const fetchLead = async () => {
    setLoading(true);
    try {
      console.log(id);
      const res = await fetch(`${API_URL}/leads/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLead(data);
      } else {
        toast.error('Lead not found');
        navigate('/');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load lead details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLabel = async (labelName) => {
    if (!lead) return;
    const currentLabels = lead.labels || [];
    const newLabels = currentLabels.includes(labelName)
      ? currentLabels.filter(l => l !== labelName)
      : [...currentLabels, labelName];

    // Optimistic update
    const previousLead = { ...lead };
    const optimisticLead = { ...lead, labels: newLabels };
    setLead(optimisticLead);
    syncLeadToParent(optimisticLead);

    try {
      const res = await fetch(`${API_URL}/leads/${id}/labels`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ labels: newLabels })
      });
      if (res.ok) {
        const updated = await res.json();
        setLead(updated);
        syncLeadToParent(updated);
      } else {
        // Revert on failure
        setLead(previousLead);
        syncLeadToParent(previousLead);
        toast.error('Failed to update labels');
      }
    } catch (error) {
      console.error(error);
      // Revert on failure
      setLead(previousLead);
      syncLeadToParent(previousLead);
      toast.error('Server connection error');
    }
  };

  const handleUpdateDate = async (field, value) => {
    try {
      const res = await fetch(`${API_URL}/leads/${id}/dates`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ [field]: value || null })
      });
      if (res.ok) {
        const updated = await res.json();
        setLead(updated);
        syncLeadToParent(updated);
      } else {
        toast.error('Failed to update dates');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server connection error');
    }
  };

  const handleSendNote = async () => {
    if (!noteInput.trim() && !selectedImage) return;
    try {
      const res = await fetch(`${API_URL}/leads/${id}/notes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          text: noteInput.trim(),
          imageUrl: selectedImage
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setLead(updated);
        syncLeadToParent(updated);
        setNoteInput('');
        setSelectedImage(null);
        toast.success('Note added');
      } else {
        toast.error('Failed to add note');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server connection error');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const res = await fetch(`${API_URL}/leads/${id}/notes/${noteId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const updated = await res.json();
        setLead(updated);
        syncLeadToParent(updated);
        toast.success('Note deleted');
      } else {
        toast.error('Failed to delete note');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server connection error');
    }
  };

  // Keep the parent leads array in sync
  const syncLeadToParent = (updatedLead) => {
    if (setLeads) {
      setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toISOString().split('T')[0]; // yyyy-mm-dd for input[type=date]
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold text-gray-500">Loading lead details...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900">Lead not found</h2>
        <Link to="/" className="text-orange-600 hover:text-orange-700 text-sm font-semibold mt-2 inline-block">← Back to Dashboard</Link>
      </div>
    );
  }

  const activeLabels = lead.labels || [];
  const assignedAgent = agents?.find(a => a.id === lead.agentId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-sm text-gray-500 hover:text-orange-600 font-medium mb-6 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-[250px]">
            <h1 className="text-2xl font-bold text-gray-900">{lead.name || 'Unnamed Lead'}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-gray-500">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                {lead.phone}
              </span>
              {lead.mailId && (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {lead.mailId}
                </span>
              )}
              {lead.age && <span>Age: {lead.age}</span>}
            </div>
            {/* Active Labels */}
            {activeLabels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {activeLabels.map(labelName => {
                  const labelDef = PREDEFINED_LABELS.find(l => l.name === labelName);
                  return (
                    <span key={labelName} className={`inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full text-xs font-semibold border ${labelDef ? labelDef.light : 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'}`}>
                      {labelName}
                      {user?.isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleLabel(labelName);
                          }}
                          className="w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-current font-normal text-[10px] cursor-pointer"
                          title={`Remove ${labelName}`}
                        >
                          &times;
                        </button>
                      )}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-gray-50 rounded-xl p-4 flex items-center space-x-6 w-full max-w-[320px] sm:max-w-[360px]">
              <div className="text-center flex-1">
                <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Origin</span>
                <span className="text-sm font-medium text-gray-800">{lead.origin || '—'}</span>
              </div>
              <div className="text-orange-500 font-bold">➔</div>
              <div className="text-center flex-1">
                <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Destination</span>
                <span className="text-sm font-medium text-gray-800">{lead.destination || '—'}</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:block flex-1"></div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {lead.leadSource && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100/30">
              Source: {lead.leadSource}
            </span>
          )}
          {assignedAgent ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[12px] font-semibold bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border border-orange-100/30">
              👤 Assigned to: {assignedAgent.name}
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400 border border-transparent">
              👤 Unassigned
            </span>
          )}
        </div>
      </div>

      {/* Two-section layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left section: Labels & Dates */}
        <div className="lg:col-span-2 space-y-6">
          {/* Labels */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                Labels
              </h2>
              {user?.isAdmin && (
                <button
                  onClick={() => setShowLabelPicker(!showLabelPicker)}
                  className="text-xs text-orange-600 hover:text-orange-700 font-semibold cursor-pointer"
                >
                  {showLabelPicker ? 'Done' : '+ Edit'}
                </button>
              )}
            </div>

            {showLabelPicker && (
              <div className="space-y-3 mb-4">
                <div className="space-y-2">
                  {/* Predefined Labels */}
                  {PREDEFINED_LABELS.map(label => {
                    const isActive = activeLabels.includes(label.name);
                    return (
                      <button
                        key={label.name}
                        onClick={() => handleToggleLabel(label.name)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border ${isActive
                          ? `${label.color} ${label.text} ${label.border} shadow-sm`
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/60'
                          }`}
                      >
                        <span>{label.name}</span>
                        {isActive && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        )}
                      </button>
                    );
                  })}

                  {/* Active Custom Labels (not predefined) */}
                  {activeLabels.filter(name => !PREDEFINED_LABELS.some(pl => pl.name === name)).map(customName => {
                    return (
                      <button
                        key={customName}
                        onClick={() => handleToggleLabel(customName)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border bg-gray-500 hover:bg-gray-600 text-white border-gray-400 dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-650 shadow-sm"
                      >
                        <span>{customName}</span>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Label Input Form */}
                <div className="pt-3 border-t border-gray-100 dark:border-slate-800">
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Or add custom label</label>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (customLabel.trim()) {
                      handleToggleLabel(customLabel.trim());
                      setCustomLabel('');
                    }
                  }} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Cold Lead"
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value)}
                      className="flex-1 text-xs py-1.5 px-3 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
                    />
                    <button
                      type="submit"
                      disabled={!customLabel.trim()}
                      className="bg-orange-600 hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors"
                    >
                      Add
                    </button>
                  </form>
                </div>
              </div>
            )}

            {!showLabelPicker && activeLabels.length === 0 && (
              <p className="text-xs text-gray-400 italic">
                {user?.isAdmin ? 'No labels assigned. Click Edit to add.' : 'No labels assigned.'}
              </p>
            )}

            {!showLabelPicker && activeLabels.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeLabels.map(labelName => {
                  const labelDef = PREDEFINED_LABELS.find(l => l.name === labelName);
                  return (
                    <span key={labelName} className={`inline-flex items-center gap-1 pl-3 pr-1.5 py-1 rounded-lg text-xs font-semibold ${labelDef ? `${labelDef.color} ${labelDef.text}` : 'bg-gray-500 dark:bg-slate-700 text-white'}`}>
                      <span>{labelName}</span>
                      {user?.isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleLabel(labelName);
                          }}
                          className="w-4 h-4 rounded-md flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-current font-normal text-xs cursor-pointer"
                          title={`Remove ${labelName}`}
                        >
                          &times;
                        </button>
                      )}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center mb-4">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Dates
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Start Date</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="date"
                    disabled={!user?.isAdmin}
                    value={formatDate(lead.dates?.startDate)}
                    onChange={(e) => handleUpdateDate('startDate', e.target.value)}
                    className="flex-1 text-sm py-2 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 bg-white cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                  {user?.isAdmin && lead.dates?.startDate && (
                    <button
                      onClick={() => handleUpdateDate('startDate', null)}
                      className="text-xs text-red-400 hover:text-red-600 cursor-pointer font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">{formatDisplayDate(lead.dates?.startDate)}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Due Date</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="date"
                    disabled={!user?.isAdmin}
                    value={formatDate(lead.dates?.dueDate)}
                    onChange={(e) => handleUpdateDate('dueDate', e.target.value)}
                    className="flex-1 text-sm py-2 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 bg-white cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                  {user?.isAdmin && lead.dates?.dueDate && (
                    <button
                      onClick={() => handleUpdateDate('dueDate', null)}
                      className="text-xs text-red-400 hover:text-red-600 cursor-pointer font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">{formatDisplayDate(lead.dates?.dueDate)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right section: Comments & Activity */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center mb-4">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              Comments & Activity
            </h2>

            {/* Note input */}
            <div className="flex items-start space-x-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-orange-600">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
              </div>
              <div className="flex-1">
                {selectedImage && (
                  <div className="relative inline-block mb-3 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
                    <img src={selectedImage} alt="Upload preview" className="h-20 w-auto object-cover" />
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors shadow-sm cursor-pointer"
                    >
                      &times;
                    </button>
                  </div>
                )}
                <textarea
                  placeholder="Write a comment..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendNote();
                    }
                  }}
                  className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none h-20 bg-gray-50/50"
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer transition-colors border border-gray-200/50 dark:border-slate-700/50">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <button
                    onClick={handleSendNote}
                    disabled={!noteInput.trim() && !selectedImage}
                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-4 py-2 rounded-lg font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* Notes list */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {(!lead.notes || lead.notes.length === 0) ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  <p className="text-sm text-gray-400 mt-2">No comments yet. Start the conversation!</p>
                </div>
              ) : (
                [...lead.notes].reverse().map((note) => {
                  const isMyNote = note.authorId ? note.authorId === user?.id : note.author === user?.name;
                  return (
                    <div key={note.id || note._id} className={`flex items-start space-x-3 ${isMyNote ? '' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isMyNote ? 'bg-blue-100 dark:bg-orange-950' : 'bg-gray-100 dark:bg-slate-800'}`}>
                        <span className={`text-xs font-bold ${isMyNote ? 'text-blue-600 dark:text-orange-400' : 'text-gray-500 dark:text-slate-400'}`}>
                          {note.author?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className={`flex-1 p-3 rounded-lg border text-sm ${isMyNote ? 'bg-blue-50/60 border-blue-100/60 dark:bg-orange-950/40 dark:border-orange-900/50' : 'bg-gray-50 border-gray-100 dark:bg-slate-800/50 dark:border-slate-700/50'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs font-semibold ${isMyNote ? 'text-blue-600 dark:text-orange-400' : 'text-gray-500 dark:text-slate-400'}`}>
                            {note.author} {isMyNote && '(You)'}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] text-gray-400">{getNoteDisplayDate(note)}</span>
                            {(isMyNote || user?.isAdmin) && (
                              <button
                                onClick={() => handleDeleteNote(note.id || note._id)}
                                className="text-red-400 hover:text-red-600 cursor-pointer p-0.5 rounded transition-colors"
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
                        {note.text && <p className="text-gray-700 dark:text-slate-200">{note.text}</p>}
                        {note.imageUrl && (
                          <div className="mt-2.5 rounded-lg overflow-hidden max-w-[280px] border border-gray-200/50 dark:border-slate-800">
                            <img
                              src={note.imageUrl}
                              alt="Attachment"
                              className="w-full h-auto max-h-[200px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(note.imageUrl, '_blank')}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
