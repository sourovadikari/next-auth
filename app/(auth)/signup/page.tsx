"use client";

import React, { useState, useEffect, useMemo } from "react";
import { signIn } from "next-auth/react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { debounce } from "@/utils/debounce";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Github, LoaderCircle, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

const signupSchema = z.object({
  fullName: z.string().min(2, "Full Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignupFormInputs = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const form = useForm<SignupFormInputs>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      username: "",
      password: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const [isEmailChecking, setIsEmailChecking] = useState(false);
  const [isUsernameChecking, setIsUsernameChecking] = useState(false);

  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  // Manual popup state
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState<React.ReactNode>("");
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);

  // Debounced email availability check
  const checkEmailAvailability = useMemo(
    () =>
      debounce(async (email: string) => {
        if (!email || !email.includes("@")) {
          setEmailAvailable(null);
          setIsEmailChecking(false);
          return;
        }
        setIsEmailChecking(true);
        try {
          const res = await axios.get(`/api/check-email?email=${encodeURIComponent(email)}`);
          setEmailAvailable(res.data.available);
        } catch {
          setEmailAvailable(null);
        } finally {
          setIsEmailChecking(false);
        }
      }, 500),
    []
  );

  // Debounced username availability check
  const checkUsernameAvailability = useMemo(
    () =>
      debounce(async (username: string) => {
        if (!username || username.length < 3) {
          setUsernameAvailable(null);
          setIsUsernameChecking(false);
          return;
        }
        setIsUsernameChecking(true);
        try {
          const res = await axios.get(`/api/check-username?username=${encodeURIComponent(username)}`);
          setUsernameAvailable(res.data.available);
        } catch {
          setUsernameAvailable(null);
        } finally {
          setIsUsernameChecking(false);
        }
      }, 500),
    []
  );

  // Watch input values
  const emailValue = form.watch("email");
  const usernameValue = form.watch("username");

  useEffect(() => {
    checkEmailAvailability(emailValue);
  }, [emailValue, checkEmailAvailability]);

  useEffect(() => {
    checkUsernameAvailability(usernameValue);
  }, [usernameValue, checkUsernameAvailability]);

  // Form submit handler
  async function onSubmit(data: SignupFormInputs) {
    setIsLoading(true);

    try {
      await axios.post("/api/auth/signup", data);

      setPopupMessage(
        <div className="space-y-2">
          <p>✅ Signup successful!</p>
          <p>A verification link has been sent to your email.</p>
          <p>Please check your inbox to verify your account.</p>
        </div>
      );
      setPopupOpen(true);

      form.reset();
      setEmailAvailable(null);
      setUsernameAvailable(null);
    } catch (error: unknown) {
      let message = "Something went wrong";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.error || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setPopupMessage(
        <p className="text-red-600">{message}</p>
      );
      setPopupOpen(true);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGitHubSignUpButton() {
    setIsGitHubLoading(true);
    try {
      await signIn("github", { callbackUrl: "/" });
    } catch (error) {
      console.error("GitHub sign up error:", error);
      setIsGitHubLoading(false);
    }
  }


  return (
    <>
      <div className="max-w-lg mx-auto p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl transition-all duration-300">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Create an Account
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
            {/* Full Name */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="John Doe"
                      disabled={isLoading}
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel className="text-gray-700 dark:text-gray-300">Email</FormLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      type="email"
                      placeholder="you@example.com"
                      disabled={isLoading}
                      className="bg-gray-50 dark:bg-gray-800 pr-10"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      {isEmailChecking && (
                        <LoaderCircle className="w-4 h-4 animate-spin text-gray-400" />
                      )}
                      {!isEmailChecking && emailAvailable === true && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {!isEmailChecking && emailAvailable === false && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  {emailValue && !isEmailChecking && emailAvailable === false && (
                    <p className="text-sm text-red-600 mt-1">Email is already in use.</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel className="text-gray-700 dark:text-gray-300">Username</FormLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      placeholder="yourusername"
                      disabled={isLoading}
                      className="bg-gray-50 dark:bg-gray-800 pr-10"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      {isUsernameChecking && (
                        <LoaderCircle className="w-4 h-4 animate-spin text-gray-400" />
                      )}
                      {!isUsernameChecking && usernameAvailable === true && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {!isUsernameChecking && usernameAvailable === false && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  {usernameValue && !isUsernameChecking && usernameAvailable === false && (
                    <p className="text-sm text-red-600 mt-1">Username is already taken.</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="******"
                      disabled={isLoading}
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || emailAvailable === false || usernameAvailable === false}
            >
              {isLoading ? (
                <>
                  Signing up...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-300 dark:bg-gray-700" />
              <span className="text-gray-500 dark:text-gray-400 text-sm">or</span>
              <div className="h-px flex-1 bg-gray-300 dark:bg-gray-700" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGitHubSignUpButton}
              disabled={isLoading || isGitHubLoading}
            >
              <Github className="w-5 h-5" />
              {isGitHubLoading ? "Connecting..." : "Sign up with GitHub"}
            </Button>


          </form>
        </Form>

        <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link href="/signin" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      {/* Manual popup */}
      {popupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 max-w-sm w-full shadow-lg">
            <div>{popupMessage}</div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setPopupOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
