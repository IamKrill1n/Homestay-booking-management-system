import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '../components/ui/avatar';

export function V_ProfileView() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate(); // Added for routing

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm font-medium text-gray-500">Loading profile data...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const getRoleBadgeStyles = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'owner': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow-sm border border-gray-100">
        
        {/* Header Block */}
        <div className="flex flex-col items-center border-b border-gray-100 pb-8 sm:flex-row sm:items-start sm:gap-6">
          <Avatar className="h-20 w-20 border-2 border-primary/10 shadow-sm">
            <AvatarFallback className="bg-primary text-2xl font-semibold text-primary-foreground">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="mt-4 text-center sm:mt-0 sm:text-left space-y-1 flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="pt-2">
              <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold uppercase tracking-wider ${getRoleBadgeStyles(user.role)}`}>
                {user.role === 'common' ? 'Guest / Customer' : `${user.role} account`}
              </span>
            </div>
          </div>

          {/* Navigates to the Edit Route */}
          <button
            type="button"
            onClick={() => navigate('/profile/edit')}
            className="mt-4 sm:mt-0 px-4 py-2 text-sm font-semibold text-indigo-600 border border-indigo-200 rounded-md hover:bg-indigo-50 transition"
          >
            Edit Profile
          </button>
        </div>

        {/* Read-Only Display Grid */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Details</h3>
          
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">First Name</span>
              <div className="w-full rounded-md bg-gray-50 p-3 text-sm text-gray-700 border border-gray-100 font-medium">{user.firstName}</div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Last Name</span>
              <div className="w-full rounded-md bg-gray-50 p-3 text-sm text-gray-700 border border-gray-100 font-medium">{user.lastName}</div>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Email Address</span>
              <div className="w-full rounded-md bg-gray-50 p-3 text-sm text-gray-700 border border-gray-100 font-medium">{user.email}</div>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Phone Number</span>
              <div className="w-full rounded-md bg-gray-50 p-3 text-sm text-gray-700 border border-gray-100 font-medium">{user.phoneNumber || 'Not provided'}</div>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Account Reference Key</span>
              <div className="w-full rounded-md bg-gray-100 p-3 text-xs font-mono text-gray-500 border border-gray-200 select-all">
                SYS-ID-{user.userID || 'UNASSIGNED'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}