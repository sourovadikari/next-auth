'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BadgeCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/providers/AuthProvider'; // Import UserData
import Image from 'next/image'; // Import Next.js Image component

// Define the expected structure of the profile data (from /api/profile GET endpoint)
interface UserProfile {
  name: string | null; // Must match backend: string | null
  email: string;
  role: string;
  createdAt?: string | null; // ISO string or null
  lastLogin?: string | null; // ISO string or null
  emailVerified: boolean; // This is now mandatory from the backend
}

// --- Profile Page Skeleton Component ---
const ProfilePageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-100 pt-20 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-inter">
    <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
      {/* Cover Photo Placeholder */}
      <div className="relative h-40 bg-gray-300">
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
          <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-md"></div>
        </div>
      </div>

      {/* User Info Placeholder */}
      <div className="pt-20 pb-8 px-6 text-center">
        <div className="flex items-center justify-center mb-1">
          <div className="h-8 w-48 bg-gray-200 rounded mr-2"></div> {/* Name placeholder */}
          <div className="h-6 w-6 bg-gray-200 rounded-full"></div> {/* Verified icon placeholder */}
        </div>
        <div className="h-4 w-32 bg-gray-200 rounded mx-auto mb-4"></div> {/* Role placeholder */}
      </div>

      {/* Detailed Information Cards Placeholder */}
      <div className="px-6 pb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200 flex flex-col items-center justify-center h-24">
          <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200 flex flex-col items-center justify-center h-24">
          <div className="h-4 w-28 bg-gray-200 rounded mb-2"></div>
          <div className="h-6 w-40 bg-gray-200 rounded"></div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200 flex flex-col items-center justify-center md:col-span-2 h-24">
          <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
          <div className="h-6 w-56 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Action Buttons Placeholder */}
      <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1 h-12 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  </div>
);
// --- End Profile Page Skeleton Component ---


export default function ProfilePage() {
  const router = useRouter();
  // Use UserData from AuthProvider for the user object
  const { user: authUser, setUser, signOut, deleteAccount } = useAuth();

  // No need for a separate userState if authUser is the source of truth
  // const [user, setUserState] = useState<UserData | null>(authUser);
  const [loadingAuth, setLoadingAuth] = useState(true); // Tracks initial auth loading
  const [profileData, setProfileData] = useState<UserProfile | null>(null); // Stores fetched profile data
  const [error, setError] = useState<string | null>(null); // For general page errors
  const [pageLoading, setPageLoading] = useState(false); // Tracks profile data fetching
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // State for delete modal
  const [deleteError, setDeleteError] = useState<string | null>(null); // Error specific to delete operation

  // useCallback to memoize fetchAuthUser
  const fetchAuthUser = useCallback(async () => {
    setLoadingAuth(true);
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.user) {
        setUser(data.user); // Update context with fetched user
      } else {
        setUser(null); // Clear user in context if not authenticated
      }
    } catch (error: unknown) { // Use 'unknown' for caught errors
      console.error("Error fetching authenticated user:", error instanceof Error ? error.message : error);
      setUser(null); // Clear user on network/unexpected error
    } finally {
      setLoadingAuth(false);
    }
  }, [setUser]); // Depend on setUser from context

  // useCallback to memoize fetchProfileData
  const fetchProfileData = useCallback(async () => {
    if (!authUser) return; // Only fetch if authUser is available

    setPageLoading(true);
    setError(null); // Clear previous errors
    try {
      const res = await fetch('/api/profile', { // Corrected API path
        method: 'GET', // IMPORTANT: Changed to GET method
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Send cookies with the request
        // REMOVED: No body for GET requests
      });

      const data = await res.json();

      if (res.ok && data.profile) {
        setProfileData(data.profile);
      } else {
        setError(data.error || 'Failed to load profile data.');
        // If profile fetch fails due to auth issues (401, 403, 404), redirect to signin
        if (res.status === 401 || res.status === 403 || res.status === 404) {
          setUser(null); // Clear user in context
          router.push('/signin');
        }
      }
    } catch (error: unknown) { // Use 'unknown' for caught errors
      console.error('An unexpected error occurred while fetching profile:', error instanceof Error ? error.message : error);
      setError('An unexpected error occurred while fetching profile. Please try again.');
    } finally {
      setPageLoading(false);
    }
  }, [authUser, router, setUser]); // Depend on authUser, router, setUser

  // Effect to manage initial authentication and subsequent profile data fetching
  useEffect(() => {
    if (authUser === undefined) { // authUser is undefined on initial render before fetchAuthUser runs
      fetchAuthUser();
    } else if (authUser) { // authUser is not null, so we have a logged-in user
      setLoadingAuth(false); // Auth is confirmed
      fetchProfileData(); // Fetch profile specific data
    } else { // authUser is explicitly null, meaning not logged in
      setLoadingAuth(false); // Auth is confirmed not logged in
      router.push('/signin'); // Redirect to signin if not authenticated
    }
  }, [authUser, fetchAuthUser, fetchProfileData, router]);


  const handleSignOut = async () => {
    await signOut(); // Call signOut from AuthProvider
    setProfileData(null); // Clear profile data locally
    router.push('/signin'); // Redirect to signin after sign out
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null); // Clear previous delete errors
    // deleteAccount handles its own loading state within AuthProvider if implemented
    const success = await deleteAccount(); // Call deleteAccount from AuthProvider
    if (success) {
      router.push('/signup?deleted=true'); // Redirect on successful deletion
    } else {
      setDeleteError("Failed to delete account. Please try again."); // Set error if deletion fails
    }
    setShowDeleteConfirm(false); // Close the confirmation modal
  };

  // --- Conditional Rendering for UI states ---

  // Render skeleton if initial auth check or profile data is loading
  if (loadingAuth || pageLoading) {
    return <ProfilePageSkeleton />;
  }

  // Show error state if there was an error fetching profile data
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8 flex-col font-inter pt-20">
        <p className="text-red-600 text-center text-lg">{error}</p>
        <div className="mt-4">
          <Link href="/signin" className="text-blue-600 hover:underline">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  // If initial authentication check is complete (`loadingAuth` is false)
  // and `authUser` is null (meaning the token was invalid or missing after the check)
  // OR if `profileData` is still null (meaning profile data fetch failed or didn't run properly)
  // this block serves as a final fallback to prompt the user to sign in.
  if (!authUser || !profileData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8 flex-col font-inter pt-20">
        <p className="text-gray-600 text-center text-lg">No profile data available or session expired. Please sign in.</p>
        <div className="mt-4">
          <Link href="/signin" className="text-blue-600 hover:underline">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  // --- Render actual profile content if all checks pass ---
  return (
    <div className="min-h-screen pt-20 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-inter">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Profile Header Section */}
        <div className="relative h-40 bg-gradient-to-r from-indigo-500 to-purple-600">
          {/* Cover Photo Placeholder */}
          <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: "url('https://placehold.co/800x200/4F46E5/FFFFFF?text=Cover+Photo')" }}></div>
          {/* Profile Picture */}
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            {/* Using Next.js Image component */}
            <Image
              className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
              src={`https://placehold.co/128x128/6366F1/FFFFFF?text=${profileData.name ? profileData.name.charAt(0).toUpperCase() : profileData.email.charAt(0).toUpperCase()}`}
              alt={`${profileData.name || 'User'}'s profile picture`}
              width={128} // Specify width
              height={128} // Specify height
            />
          </div>
        </div>

        {/* User Info Section */}
        <div className="pt-20 pb-8 px-6 text-center">
          <div className="flex items-center justify-center mb-1">
            <h2 className="text-3xl font-bold text-gray-900 mr-2 leading-none">{profileData.name || 'N/A'}</h2>
            {profileData.emailVerified && ( // Conditionally render verified icon
              <BadgeCheck className="h-6 w-6 text-blue-500 pt-0.5" aria-label="Email Verified" />
            )}
          </div>
          <p className="text-md text-gray-600 mb-4">{profileData.role}</p>
        </div>

        {/* Detailed Information Cards */}
        <div className="px-6 pb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200 flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-gray-500">Email Address</p>
            <p className="text-lg text-gray-800 font-semibold">{profileData.email}</p>
          </div>

          {profileData.createdAt && (
            <div className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200 flex flex-col items-center justify-center">
              <p className="text-sm font-medium text-gray-500">Member Since</p>
              <p className="text-lg text-gray-800 font-semibold">
                {new Date(profileData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          )}

          {profileData.lastLogin && (
            <div className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200 flex flex-col items-center justify-center md:col-span-2">
              <p className="text-sm font-medium text-gray-500">Last Login</p>
              <p className="text-lg text-gray-800 font-semibold">
                {new Date(profileData.lastLogin).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSignOut}
            className="flex-1 rounded-full bg-blue-500 py-3 font-semibold text-white hover:bg-blue-600 transition duration-300 shadow-md transform hover:scale-105"
          >
            Sign Out
          </button>
          <Link href="/" className="flex-1 text-center rounded-full border bg-green-700 text-white py-3 font-semibold hover:bg-green-800 transition duration-300 shadow-md transform hover:scale-105">
            Back to Home
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 rounded-full bg-red-600 py-3 font-semibold text-white hover:bg-red-700 transition duration-300 shadow-md transform hover:scale-105"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-8 shadow-xl max-w-md w-full mx-4">
            <div className="flex flex-col items-center mb-6">
              <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirm Account Deletion</h3>
              <p className="text-gray-700 text-center">
                Are you sure you want to delete your account? This action cannot be undone.
                All your data will be permanently removed.
              </p>
            </div>
            {deleteError && (
              <p className="text-red-500 text-center mb-4">{deleteError}</p>
            )}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-6 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition duration-300"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
