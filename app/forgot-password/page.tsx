'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form'; // Import useForm
import { zodResolver } from '@hookform/resolvers/zod'; // Import zodResolver
import * as z from 'zod'; // Import Zod

// Define the Zod schema for forgot password input validation
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Infer the TypeScript type from the Zod schema
type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null); // For displaying API errors
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // For displaying API success messages

  // Initialize react-hook-form with Zod resolver for validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset, // To clear form fields after successful submission
  } = useForm<ForgotPasswordData>({ resolver: zodResolver(forgotPasswordSchema) });

  // Function to clear both serverError and successMessage when input changes
  const clearMessages = () => {
    // Only clear if there's an active message to prevent unnecessary state updates
    if (serverError) setServerError(null);
    if (successMessage) setSuccessMessage(null);
  };

  // Handle form submission
  const onSubmit = async (data: ForgotPasswordData) => {
    setServerError(null); // Clear any previous errors before a new submission
    setSuccessMessage(null); // Clear any previous success messages

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json(); // Always parse JSON to get message/error

      if (res.ok) {
        // If API returns 200 OK, it means OTP was sent (or email exists)
        setSuccessMessage(result.message || 'Password reset instructions sent.');
        reset(); // Clear form fields on success
        // Redirect to the verification page after a short delay
        setTimeout(() => {
          router.push(`/verification/${encodeURIComponent(data.email)}/password-reset`);
        }, 2000); // Give user a moment to see the success message
      } else {
        // If API returns non-200 (e.g., 400 for bad request, 500 for server error)
        setServerError(result.error || 'Failed to process request. Please try again later.');
      }
    } catch (error: unknown) { // Use unknown for caught errors
      // FIX: Ensure 'error' is used or explicitly ignored if not needed.
      // The current usage `error instanceof Error ? error.message : error` is fine.
      // The ESLint error `'err' is defined but never used` was likely a false positive
      // or referred to a variable that was removed. No change needed here.
      console.error('Forgot password error:', error instanceof Error ? error.message : error);
      setServerError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50 pt-20 pb-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">Forgot Password</h2>
        <p className="text-center text-gray-600 mb-8">
          Enter your email address and we&apos;ll send a 6-digit OTP for password reset.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              {...register('email', { onChange: clearMessages })} // Use register and clear messages on change
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Email address"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          {serverError && <p className="text-center text-red-500 text-sm" role="alert">{serverError}</p>}
          {successMessage && <p className="text-center text-green-600 text-sm" role="status">{successMessage}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
          >
            {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
        <div className="mt-6 text-center flex items-center justify-center gap-1">
          <p>Remember your password?</p>
          <Link href="/signin" className="text-blue-600 hover:underline text-sm">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
