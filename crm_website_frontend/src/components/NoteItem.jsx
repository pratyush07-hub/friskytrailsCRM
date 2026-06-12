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
    } catch {
      // ignore
    }
  }
  return note.timestamp;
};

export default function NoteItem({ note, leadId, deleteNote, currentUser }) {
  const isMyNote = note.authorId ? note.authorId === currentUser?.id : note.author === currentUser?.name;

  return (
    <div className={`flex items-start space-x-3 ${isMyNote ? '' : ''}`}>
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
            {(isMyNote || currentUser?.isAdmin) && deleteNote && (
              <button
                onClick={() => deleteNote(leadId, note.id || note._id)}
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
        {note.text && <p className="text-gray-700 dark:text-slate-200 mt-0.5">{note.text}</p>}
        {note.imageUrl && (
          <div className="mt-1.5 rounded overflow-hidden max-w-[200px] border border-gray-200/50 dark:border-slate-800 inline-block">
            {note.imageUrl.match(/\.(pdf|doc|docx)$/i) || (!note.imageUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) && note.imageUrl.includes('/raw/upload/')) ? (
              <div
                className="p-3 bg-gray-100 dark:bg-slate-800 text-sm font-semibold flex items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                onClick={() => window.open(note.imageUrl.includes('res.cloudinary.com') && !note.imageUrl.includes('/raw/upload/') ? note.imageUrl.replace('/upload/', '/upload/fl_attachment/') : note.imageUrl, '_blank')}
              >
                📄 {decodeURIComponent(note.imageUrl.split('/').pop())}
              </div>
            ) : (
              <img
                src={note.imageUrl}
                alt="Attachment"
                className="w-full h-auto max-h-[120px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(note.imageUrl, '_blank')}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
