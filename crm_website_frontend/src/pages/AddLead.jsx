import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";

export default function AddLead({ addLead }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    origin: '',
    destination: '',
    leadSource: '',
    mailId: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    // Restrict input to digits only and maximum of 10 characters
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    setFormData({ ...formData, phone: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phone) {
      toast.error("Phone number is required");
      return;
    }

    if (formData.phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    const success = await addLead(formData);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white dark:bg-slate-800 shadow-xl rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700 transition-colors">
        <div className="bg-orange-500 px-6 py-5">
          <h2 className="text-xl font-bold text-white">Add New Lead</h2>
          <p className="mt-1 text-orange-100 text-xs">
            Enter the details of the prospective client below to add them to the CRM.
          </p>
        </div>

        <div className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Full Name & Age */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Full Name</label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-md py-2 px-3 border"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="sm:col-span-1">
                <label htmlFor="age" className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Age</label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="age"
                    id="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-md py-2 px-3 border"
                    placeholder="30"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Phone Number & Mail ID */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-md py-2 px-3 border"
                    placeholder="10 digit number"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="mailId" className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Mail ID</label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="mailId"
                    id="mailId"
                    value={formData.mailId}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-md py-2 px-3 border"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Lead Source & Origin City */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="leadSource" className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Lead Source</label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="leadSource"
                    id="leadSource"
                    value={formData.leadSource}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-md py-2 px-3 border"
                    placeholder="Instagram, Referral, Web, etc."
                  />
                </div>
              </div>

              <div>
                <label htmlFor="origin" className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Origin City</label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="origin"
                    id="origin"
                    value={formData.origin}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-md py-2 px-3 border"
                    placeholder="New Delhi"
                  />
                </div>
              </div>
            </div>

            {/* Row 4: Destination of Interest */}
            <div>
              <label htmlFor="destination" className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Destination of Interest</label>
              <div className="mt-1">
                <input
                  type="text"
                  name="destination"
                  id="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-md py-2 px-3 border"
                  placeholder="Paris, France"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors cursor-pointer"
              >
                Add Client Lead
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
