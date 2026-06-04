import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";

export default function AddAgent({ addAgent }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    addAgent(formData);
    toast.success("Agent added successfully");
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-blue-600 px-6 py-5">
          <h2 className="text-xl font-bold text-white">Add New Agent</h2>
          <p className="mt-1 text-blue-100 text-xs">
            Enter the details of the new agent below to add them to your team.
          </p>
        </div>

        <div className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Agent Full Name</label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                  placeholder="e.g. Agent Sarah"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Add Agent
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
