import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { User } from '../data/user';

export function V_EditProfileView() {
  const { user, updateUser, error, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [uiError, setUiError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm font-medium text-gray-500">Loading form data...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUiError(null);

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      setUiError("Fields cannot be left empty.");
      return;
    }

    setIsSaving(true);
    try {
      const success = await updateUser({ ...user, ...formData} as User);

      if (success) {
        navigate('/profile');
      } else {
        setUiError(error);
        setIsSaving(false);
      }
      
    } catch (err: any) {
      setUiError(err.message || "An unexpected network communication exception occurred.");
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow-sm border border-gray-100">
        
        {uiError && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-sm font-medium text-red-600 rounded-lg">{uiError}</div>}

        <div className="flex flex-col items-center border-b border-gray-100 pb-8 sm:flex-row sm:items-start sm:gap-6">
          <Avatar className="h-20 w-20 border-2 border-primary/10 shadow-sm opacity-80">
            <AvatarFallback className="bg-primary text-2xl font-semibold text-primary-foreground">
              {formData.firstName?.[0] || 'U'}{formData.lastName?.[0] || ''}
            </AvatarFallback>
          </Avatar>
          
          <div className="mt-4 text-center sm:mt-0 sm:text-left space-y-1 flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Editing Profile</h1>
            <p className="text-sm text-gray-500">Update your account settings below.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-8">
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
            <div className="space-y-1.5">
              <label htmlFor="firstName" className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 p-3 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="lastName" className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 p-3 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="email" className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 p-3 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="phoneNumber" className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Phone Number</label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 p-3 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex h-10 items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 transition shadow-sm disabled:opacity-50 min-w-[100px]"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}