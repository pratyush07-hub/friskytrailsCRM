import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const getLinkClass = (path) => {
    const baseClass = "text-sm font-medium transition-colors hover:text-orange-600";
    return location.pathname === path
      ? `${baseClass} text-orange-600 border-b-2 border-orange-500 pb-1`
      : `${baseClass} text-gray-600`;
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-orange-600 tracking-tight">
                FriskyTrails CRM
              </Link>
            </div>
            <div className="ml-8 flex space-x-8 items-center">
              <Link to="/" className={getLinkClass('/')}>
                Dashboard
              </Link>
              <Link to="/add-lead" className={getLinkClass('/add-lead')}>
                Add Lead
              </Link>
              <Link to="/add-agent" className={getLinkClass('/add-agent')}>
                Add Agent
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-orange-100 text-orange-600">
              <span className="text-sm font-medium leading-none">A</span>
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
