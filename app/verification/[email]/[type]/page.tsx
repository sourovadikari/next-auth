'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/providers/AuthProvider'; // Ensure this path is correct
import { Eye, EyeOff } from 'lucide-react';

const RESEND_COOLDOWN = 60; // Cooldown period for resending OTP in seconds

// Define expected API response types for clarity and type safety
interface OtpVerificationResponse {
  status?: 'already_verified'; // Specific status for already verified emails
  user?: {
    email: string;
    id: string;
    name: string | null;
    role: string;
    emailVerified: boolean;
  };
  message?: string;
  error?: string;
  redirect?: boolean;
  url?: string;
}

export default function VerificationPage() {
  const params = useParams();
  const router = useRouter();
  const { setUser } = useAuth();

  // --- ALL REACT HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP LEVEL ---
  // State for OTP input and general form submission
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string>(''); // For displaying API/validation errors
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // State for OTP resend timer
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);

  // State for new password input (used in password reset flow)
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // State to manage the current step of the verification process (OTP entry or password reset form)
  const [currentStep, setCurrentStep] = useState<'otp_entry' | 'password_reset_form'>('otp_entry');

  // Refs for input focus and error message accessibility
  const inputRef = useRef<HTMLInputElement | null>(null);
  const errorRef = useRef<HTMLParagraphElement | null>(null);

  // Effect to focus input and clear error when step changes
  useEffect(() => {
    inputRef.current?.focus();
    setError('');
  }, [currentStep]);

  // Effect for the resend OTP timer
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      setIsTimerActive(false); // Deactivate timer when it reaches 0
    }
    return () => clearInterval(timerId); // Cleanup interval on component unmount or dependency change
  }, [isTimerActive, timeLeft]);
  // --- END OF REACT HOOKS ---


  // Extract and normalize parameters after all hooks are declared
  const rawEmail = params.email;
  const rawType = params.type;

  const email =
    Array.isArray(rawEmail) && rawEmail.length > 0
      ? decodeURIComponent(rawEmail[0])
      : typeof rawEmail === 'string'
      ? decodeURIComponent(rawEmail)
      : '';

  const verificationType =
    Array.isArray(rawType) && rawType.length > 0
      ? rawType[0]
      : typeof rawType === 'string'
      ? rawType
      : '';

  // Conditional return for invalid parameters (now safe as all hooks are above)
  if (!email || !verificationType) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <p className="text-red-600 text-center text-lg" role="alert">
          Invalid verification link. Missing email or type.
        </p>
      </div>
    );
  }

  // Helper function to determine page title and instruction based on current step and type
  const getPageContent = () => {
    if (currentStep === 'password_reset_form') {
      return {
        title: 'Set New Password',
        instruction: `Enter your new password for ${email}.`,
      };
    }
    return {
      title: verificationType === 'password-reset' ? 'Reset Your Password' : 'Verify Your Email',
      instruction:
        verificationType === 'password-reset'
          ? `Enter the 6-digit code sent to ${email} to reset your password.`
          : `Enter the 6-digit code sent to ${email}.`,
    };
  };

  const { title, instruction } = getPageContent();

  // Generic handler to clear error message when any input changes
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(''); // Clear any existing error message
    setter(e.target.value);
  };

  // Specific handler for OTP input change, ensuring only digits and max length
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setError(''); // Clear error on OTP input change
    setCode(val);
  };

  // Handles resending the OTP
  const handleResendCode = async () => {
    if (isTimerActive) return; // Prevent resending if timer is active

    setIsTimerActive(true);
    setTimeLeft(RESEND_COOLDOWN);
    setError(''); // Clear any existing error before resending

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: verificationType }),
      });

      const data: OtpVerificationResponse = await res.json(); // Type the response

      if (!res.ok) {
        setError(data.error || 'Failed to generate new OTP. Please try again.');
        errorRef.current?.focus(); // Focus on error message for accessibility
      }
      // Success message is generic from backend, no specific message needed here
    } catch (error: unknown) { // Use 'unknown' for caught errors
      console.error('Resend OTP error:', error instanceof Error ? error.message : error);
      setError('An unexpected error occurred while generating new OTP. Please try again.');
      errorRef.current?.focus();
    }
  };

  // Handles OTP submission
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      errorRef.current?.focus();
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/auth/verification/${encodeURIComponent(email)}/${verificationType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: code }),
      });

      const data: OtpVerificationResponse = await res.json(); // Type the response

      if (res.ok) {
        if (verificationType === 'signup') {
          if (data.user) setUser(data.user); // Update user in AuthProvider context
          setTimeout(() => router.push('/'), 3000); // Redirect to home after signup verification
        } else if (verificationType === 'password-reset') {
          setCurrentStep('password_reset_form'); // Move to password reset form
          setCode(''); // Clear OTP field
        } else {
          setTimeout(() => router.push('/'), 3000); // Fallback redirect
        }
      } else {
        setError(data.error || 'OTP verification failed. Please check the code and try again.');
        errorRef.current?.focus();
      }
    } catch (error: unknown) { // Use 'unknown' for caught errors
      console.error('OTP verification error:', error instanceof Error ? error.message : error);
      setError('An unexpected error occurred during OTP verification. Please try again.');
      errorRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handles new password submission after OTP verification
  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      errorRef.current?.focus();
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      errorRef.current?.focus();
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      errorRef.current?.focus();
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/auth/verification/${encodeURIComponent(email)}/${verificationType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data: OtpVerificationResponse = await res.json(); // Type the response

      if (res.ok) {
        if (data.user) setUser(data.user); // Update user in AuthProvider context
        setTimeout(() => router.push('/'), 3000); // Redirect to home after password reset
      } else {
        setError(data.error || 'Password reset failed. Please try again.');
        errorRef.current?.focus();
      }
    } catch (error: unknown) { // Use 'unknown' for caught errors
      console.error('Password reset error:', error instanceof Error ? error.message : error);
      setError('An unexpected error occurred during password reset. Please try again.');
      errorRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggles password input visibility
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 pt-20 pb-8">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">{title}</h2>
        <p className="mb-4 text-center text-gray-600">{instruction}</p>

        {error && (
          <p
            className="mb-4 text-center text-sm text-red-600"
            role="alert"
            tabIndex={-1}
            ref={errorRef}
          >
            {error}
          </p>
        )}

        {currentStep === 'otp_entry' && (
          <form onSubmit={handleOtpSubmit} className="space-y-6" noValidate>
            <label htmlFor="otpCode" className="sr-only">
              Verification Code
            </label>
            <input
              id="otpCode"
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={handleOtpChange}
              placeholder="Enter 6-digit code"
              className="w-full rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-center text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
              autoComplete="one-time-code"
              aria-label="Verification code input"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying...' : 'Verify'}
            </button>
            <div className="mt-4 text-center flex items-center justify-center gap-1">
              <p className="text-center text-gray-600">Didn&apos;t get a code?</p>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isTimerActive || isSubmitting}
                className={`text-sm text-blue-600 hover:underline ${
                  isTimerActive ? 'cursor-not-allowed opacity-50' : ''
                }`}
                aria-disabled={isTimerActive || isSubmitting}
              >
                Resend OTP {isTimerActive && `(${timeLeft}s)`}
              </button>
            </div>
          </form>
        )}

        {currentStep === 'password_reset_form' && (
          <form onSubmit={handlePasswordResetSubmit} className="space-y-6" noValidate>
            <PasswordInput
              id="new-password"
              placeholder="New Password"
              value={password}
              onChange={handleInputChange(setPassword)}
              showPassword={showPassword}
              toggleShowPassword={togglePasswordVisibility} // Corrected prop name
              disabled={isSubmitting}
            />
            <PasswordInput
              id="confirm-password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={handleInputChange(setConfirmPassword)}
              showPassword={showPassword}
              toggleShowPassword={togglePasswordVisibility} // Corrected prop name
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-green-600 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          <Link href="/" className="hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

interface PasswordInputProps {
  id: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  toggleShowPassword: () => void; // This is the prop name
  disabled?: boolean;
}

function PasswordInput({
  id,
  placeholder,
  value,
  onChange,
  showPassword,
  toggleShowPassword, // Use this prop
  disabled = false,
}: PasswordInputProps) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-md border border-gray-300 bg-gray-100 px-4 py-2 pr-10 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        autoComplete="new-password"
        minLength={6}
        required
      />
      <button
        type="button"
        onClick={toggleShowPassword} // Call the prop function
        className="absolute right-3 top-1/2 -translate-y-1/2/2 rounded p-1 text-gray-600 hover:text-green-700 focus:outline-none"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        tabIndex={0}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}
