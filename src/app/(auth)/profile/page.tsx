"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { colors } from "@/lib/colors";
import { useUserData } from "../layout";
import Link from "next/link";

export default function ProfilePage() {
  const { logout } = useAuth();
  const { userData, isLoadingUserData, error, refreshUserData } = useUserData();

  return (
    <div className="min-h-screen bg-gray-50">
      <header
        className="bg-white shadow-sm"
        style={{ borderBottom: `1px solid ${colors.divider}` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center mr-3">
              <span className="text-white text-lg font-bold">RTX</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-800">
              User Profile
            </h1>
          </div>
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 mr-4 hover:text-gray-900"
            >
              Dashboard
            </Link>
            <button
              onClick={logout}
              className="px-3 py-2 text-sm font-medium rounded-md text-white"
              style={{ backgroundColor: colors.primary.main }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-800">
              Profile Details
            </h2>
          </div>

          {isLoadingUserData && (
            <div className="flex justify-center py-6">
              <div className="animate-spin h-8 w-8 border-4 border-red-500 rounded-full border-t-transparent"></div>
            </div>
          )}

          {error && (
            <div className="p-4 mb-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
              {error}
            </div>
          )}

          {!isLoadingUserData && !error && userData && (
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center mb-4">
                <span className="text-white text-3xl font-bold">
                  {userData.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-1">
                {userData.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{userData.email}</p>
              <span
                className="px-3 py-1 text-xs font-medium rounded-full mb-6"
                style={{
                  backgroundColor: colors.primary.light,
                  color: colors.primary.dark,
                }}
              >
                {userData.role}
              </span>

              <div className="w-full max-w-md border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Account Information
                </h4>
                <dl className="divide-y divide-gray-200">
                  <div className="py-2 flex justify-between">
                    <dt className="text-sm text-gray-500">Account ID</dt>
                    <dd className="text-sm text-gray-900">{userData.id}</dd>
                  </div>
                  <div className="py-2 flex justify-between">
                    <dt className="text-sm text-gray-500">Created</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(userData.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="py-2 flex justify-between">
                    <dt className="text-sm text-gray-500">Last Updated</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(userData.updatedAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>

              <button
                onClick={refreshUserData}
                className="mt-6 px-4 py-2 text-sm font-medium rounded-md text-white"
                style={{ backgroundColor: colors.primary.main }}
                disabled={isLoadingUserData}
              >
                Refresh Profile
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
