"use client";

import React, { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

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
import { Github } from "lucide-react";

// Schema
const signinSchema = z.object({
  identifier: z.string().min(3, "Email or username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type SigninFormInputs = z.infer<typeof signinSchema>;

export default function SignInClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);

  const [inlineError, setInlineError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const form = useForm<SigninFormInputs>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  // Clear error when user types
  useEffect(() => {
    const subscription = form.watch(() => {
      if (inlineError) setInlineError("");
    });
    return () => subscription.unsubscribe();
  }, [form, inlineError]);

  useEffect(() => {
    async function checkSession() {
      const session = await getSession();
      if (session) {
        router.push(callbackUrl);
      }
    }
    checkSession();
  }, [callbackUrl, router]);

  async function onSubmit(data: SigninFormInputs) {
    setIsLoading(true);
    setInlineError("");

    try {
      const result = await signIn("credentials", {
        identifier: data.identifier,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("Please verify your email")) {
          setModalTitle("Email Not Verified");
          setModalMessage("We've sent you a new verification link. Please check your inbox.");
          setModalOpen(true);
        } else {
          setInlineError(result.error);
        }
      } else if (result?.ok) {
        setInlineError("");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      console.error("Sign in unexpected error:", error);
      setInlineError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGitHubSignIn() {
    setIsGitHubLoading(true);
    try {
      await signIn("github", { callbackUrl });
    } catch (error) {
      console.error("GitHub sign in error:", error);
      setIsGitHubLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl">
      <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-8">
        Welcome Back
      </h1>

      {/* Inline Error */}
      {inlineError && (
        <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 text-sm border border-red-200">
          {inlineError}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email or Username</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Enter your email or username"
                    disabled={isLoading || isGitHubLoading}
                    autoComplete="username"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Enter your password"
                    disabled={isLoading || isGitHubLoading}
                    autoComplete="current-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="text-right">
            <Link href="/forgot-password" className="text-sm text-primary underline">
              Forgot your password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || isGitHubLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white dark:bg-zinc-900 px-2 text-gray-500">or</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
        onClick={handleGitHubSignIn}
        disabled={isLoading || isGitHubLoading}
      >
        <Github className="w-5 h-5" />
        {isGitHubLoading ? "Connecting..." : "Continue with GitHub"}
      </Button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don’t have an account?{" "}
        <Link href="/signup" className="text-primary underline">
          Sign Up
        </Link>
      </p>

      {/* Modal for Email Verification Only */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">{modalTitle}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{modalMessage}</p>
            <Button onClick={() => setModalOpen(false)} className="w-full">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
