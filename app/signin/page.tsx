'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/providers/AuthProvider'; // Ensure this path is correct
import { Eye, EyeOff } from 'lucide-react';

// Define the Zod schema for sign-in input validation
const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Infer the TypeScript type from the Zod schema
type SigninData = z.infer<typeof signinSchema>;

export default function SigninPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninData>({ resolver: zodResolver(signinSchema) });

  const router = useRouter();
  const { setUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Function to clear the general serverError message when any input changes
  const clearServerError = () => {
    if (serverError) {
      setServerError(null);
    }
  };

  const onSubmit = async (data: SigninData) => {
    setServerError(null); // Clear any previous server errors before a new submission

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include', // Important for sending/receiving cookies
      });

      const result = await res.json();

      if (!res.ok) {
        // If status is 403 (Forbidden) and backend indicates redirect for unverified email
        if (res.status === 403 && result.redirect && result.url) {
          // No message shown on this page, directly redirect for email verification
          router.push(result.url);
          return; // Stop further execution
        }

        // For any other non-OK response (e.g., 400, 401, 500), display "Invalid credentials."
        // Or the specific error message from the backend if available.
        setServerError(result.error || 'Invalid credentials'); // Unified or specific error message
        return;
      }

      // If sign-in is successful (res.ok is true), fetch authenticated user details
      // This ensures the AuthProvider context gets the full user object.
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      const userData = await meRes.json();

      if (meRes.ok && userData.user) {
        setUser(userData.user); // Update global user state in AuthProvider
        router.push('/'); // Redirect to homepage on successful sign-in
      } else {
        // This case should ideally not happen if sign-in was successful,
        // but handles edge cases where fetching user details after sign-in fails.
        setServerError('Failed to retrieve user details after successful sign-in. Please try re-logging in.');
      }
    } catch (error: unknown) { // Use 'unknown' for caught errors
      console.error('Sign-in network error or unexpected issue:', error instanceof Error ? error.message : error);
      setServerError('Something went wrong. Please check your network and try again.');
    }
  };

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50 pt-20 pb-8">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email', { onChange: clearServerError })}
                  className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                Password
              </label>
              <div className="mt-2 relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="off"
                  {...register('password', { onChange: clearServerError })}
                  className="block w-full rounded-md bg-white px-3 py-2 pr-10 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
              <div className="mt-2 text-sm text-right">
                <Link href="/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-500">
                  Forgot password?
                </Link>
              </div>
            </div>

            {serverError && (
              <p className="text-center text-sm text-red-600" role="alert">
                {serverError}
              </p>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm transition ${
                  isSubmitting
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500'
                } focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2`}
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Not a member?{' '}
            <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
