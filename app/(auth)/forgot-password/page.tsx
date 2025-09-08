"use client";

import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { useForm } from "react-hook-form";

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

type FormValues = {
  identifier: string;
};

export default function ForgotPasswordPage() {
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      identifier: "",
    },
  });

  async function sendResetLink(identifier: string) {
    setPopupOpen(false);
    setPopupMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post("/api/auth/forgot-password", {
        identifier,
      });

      setPopupMessage(response.data.message || "Verification link sent successfully. Please check your email.");
      setPopupOpen(true);
      form.reset();
    } catch (error: unknown) {
      const err = error as AxiosError<{ error: string }>;
      setPopupMessage(err.response?.data?.error || err.message || "An error occurred.");
      setPopupOpen(true);
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(data: FormValues) {
    await sendResetLink(data.identifier);
  }

  return (
    <>
      <div className="max-w-md mx-auto p-6">
        <h1 className="mb-6 text-center text-3xl font-semibold">Forgot Password</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FormField
              control={form.control}
              name="identifier"
              rules={{ required: "Email or username is required" }}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Email or Username</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter your email or username"
                      autoComplete="username"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <Button type="submit" className="mt-6 w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Verification Link"}
            </Button>
          </form>
        </Form>
      </div>

      {/* Manual popup */}
      {popupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 max-w-sm w-full shadow-lg">
            <p>{popupMessage}</p>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setPopupOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
