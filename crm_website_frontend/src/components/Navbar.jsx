import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ darkMode, setDarkMode, user, handleLogout }) {
  const location = useLocation();

  const getLinkClass = (path) => {
    const baseClass = "text-sm font-semibold px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center";
    return location.pathname === path
      ? `${baseClass} bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 shadow-sm`
      : `${baseClass} text-gray-600 dark:text-slate-300 hover:bg-gray-50/80 dark:hover:bg-slate-800/40 hover:text-orange-600 dark:hover:text-orange-400`;
  };

  return (
    <nav className="bg-white/80 dark:bg-slate-900/85 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-100 dark:border-slate-800/80 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-extrabold text-orange-600 dark:text-orange-500 tracking-tight flex items-center space-x-2.5 hover:opacity-90 transition-opacity">
                <img src="/logo.webp" alt="FriskyTrails Logo" className="h-9 w-auto dark:invert transition-transform duration-300 hover:rotate-6" />
                <span>FriskyTrails CRM</span>
              </Link>
            </div>
            {user && (
              <div className="ml-10 flex space-x-2 items-center">
                <Link to="/" className={getLinkClass('/')}>
                  Dashboard
                </Link>
                {!user.isAdmin && (
                  <Link to="/my-leads" className={getLinkClass('/my-leads')}>
                    My Leads
                  </Link>
                )}
                {user.isAdmin && (
                  <>
                    <Link to="/add-lead" className={getLinkClass('/add-lead')}>
                      Add Lead
                    </Link>
                    <Link to="/agents" className={getLinkClass('/agents')}>
                      Agents
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-800 border border-gray-100 dark:border-slate-800 transition-all cursor-pointer shadow-sm"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg style={{ width: '18px', height: '18px', display: 'block', stroke: '#fbbf24' }} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-3.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ) : (
                <svg style={{ width: '18px', height: '18px', display: 'block', stroke: '#4b5563' }} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            {user ? (
              <div className="flex items-center space-x-3.5 bg-gray-50/50 dark:bg-slate-800/30 p-1.5 pl-2.5 pr-2.5 rounded-2xl border border-gray-100/50 dark:border-slate-800/65">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-xs font-bold text-gray-800 dark:text-slate-200">
                    {user.name}
                  </span>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-500">
                    {user.isAdmin ? 'Admin' : 'Agent'}
                  </span>
                </div>
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 font-bold border border-orange-200/50 dark:border-orange-900/50 shadow-sm text-sm">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
                <div className="h-4 w-[1px] bg-gray-200 dark:bg-slate-700"></div>
                <button
                  onClick={handleLogout}
                  className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 shadow-sm border border-red-100/30 dark:border-red-950/30"
                >
                  Logout
                </button>
              </div>
            ) : (
              <span className="text-xs font-extrabold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                CRM Portal
              </span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
