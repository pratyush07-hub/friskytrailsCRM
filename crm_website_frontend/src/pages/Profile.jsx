import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function Profile({ user, token, API_URL }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match");
    }
    if (newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters");
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password updated successfully");
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data.error || "Failed to update password");
      }
    } catch (error) {
      toast.error("Network error while updating password");
    } finally {
      setLoading(false);
    }
  };

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

          <div className="pt-6 border-t border-gray-100 dark:border-slate-800 mt-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Security</h3>
            <form onSubmit={handlePasswordUpdate} className="bg-gray-50 dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full text-sm py-2 px-3 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full text-sm py-2 px-3 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-sm py-2 px-3 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold py-2 px-5 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
