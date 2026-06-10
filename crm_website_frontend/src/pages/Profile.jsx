import React from 'react';

export default function Profile({ user }) {
  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="bg-orange-500 px-6 py-6 sm:px-8 sm:py-6 flex flex-col items-center">
           <span className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white text-orange-600 font-extrabold text-2xl shadow-md mb-3">
              {user.name.split(' ').map(n => n[0]).join('')}
           </span>
           <h1 className="text-2xl font-bold text-white">{user.name}</h1>
           <p className="text-orange-100 font-medium uppercase tracking-wider text-xs mt-1">
             {user.isAdmin ? 'Administrator' : 'Agent'}
           </p>
        </div>
        <div className="p-6 sm:p-8">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Account Information</h3>
          <div className="bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 divide-y divide-gray-100 dark:divide-slate-800">
             <div className="p-4 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Email Address</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{user.email || 'N/A'}</span>
             </div>
             <div className="p-4 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Role</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.isAdmin ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'}`}>
                  {user.isAdmin ? 'Admin' : 'Agent'}
                </span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
