'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react'; // Import Eye and EyeOff icons

// Validation schema for signup form
const signupSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name must contain only letters and spaces'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Infer the TypeScript type from the Zod schema
type SignupData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  // serverError will hold a general error message from the backend.
  // It will clear when *any* input field is typed into.
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Initialize react-hook-form with Zod resolver for validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset, // Used to clear form fields after successful submission
  } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
  });

  // Function to clear the general serverError message.
  // This will be attached to the onChange of each input field.
  const clearGeneralServerError = () => {
    if (serverError) {
      setServerError(null);
    }
  };

  // Handle form submission
  const onSubmit = async (data: SignupData) => {
    setServerError(null); // Clear any previous server errors before new submission

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        // Display server-side error message if signup fails.
        // Since the backend sends a single string error, it's treated as a general error.
        setServerError(result.error || 'Signup failed. Please try again.');
        return;
      }

      // On successful signup, clear the form and redirect to verification page
      reset(); // Clear form fields
      router.push(`/verification/${encodeURIComponent(data.email)}/signup`);
    } catch (error: unknown) { // Use 'unknown' for caught errors
      // Catch network errors or unexpected issues
      console.error('Signup network error or unexpected issue:', error instanceof Error ? error.message : error);
      setServerError('Something went wrong. Please check your network and try again.');
    }
  };

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50 pt-24 pb-8">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Create your account
          </h2>
        </div>

        <div className="mt-10">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate // Disable default browser validation to rely on react-hook-form
          >
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                Name
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  {...register('name', { onChange: clearGeneralServerError })}
                  type="text"
                  required
                  autoComplete="name"
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                  placeholder="Your full name"
                />
              </div>
              {/* Client-side Zod error for name. This clears automatically when valid input is typed. */}
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  {...register('email', { onChange: clearGeneralServerError })}
                  type="email"
                  required
                  autoComplete="email"
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
              {/* Client-side Zod error for email. This clears automatically when valid input is typed. */}
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                Password
              </label>
              <div className="mt-2 relative">
                <input
                  id="password"
                  {...register('password', { onChange: clearGeneralServerError })}
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {/* Client-side Zod error for password. This clears automatically when valid input is typed. */}
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Display the general server error message */}
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
                {isSubmitting ? 'Signing up...' : 'Sign up'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              href="/signin"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
