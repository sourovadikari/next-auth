"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { StatusMessage } from "@/components/Model";

// Actual verification logic
export function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("Verifying your email...");
  const [countdown, setCountdown] = useState<number>(5);

  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      setMessage("Missing verification token or email.");
      return;
    }

    async function verifyEmail(email: string, token: string) {
      try {
        const res = await axios.get(
          `/api/auth/verify?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`
        );

        setStatus("success");
        setMessage(res.data.message || "🎉 Email verified successfully!");
        setCountdown(5);
      } catch (error: unknown) {
        setStatus("error");

        if (axios.isAxiosError(error)) {
          setMessage(error.response?.data?.error || "Verification failed.");
        } else if (error instanceof Error) {
          setMessage(error.message);
        } else {
          setMessage("Verification failed.");
        }
      }
    }

    verifyEmail(email, token);
  }, [token, email]);

  useEffect(() => {
    if (status !== "success") return;

    if (countdown === 0) {
      router.push("/signin");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, status, router]);

  return (
    <StatusMessage
      status={status}
      message={message}
      countdown={status === "success" ? countdown : undefined}
      actionLabel={status === "error" ? "Back to Sign In" : undefined}
      onActionClick={status === "error" ? () => router.push("/signin") : undefined}
    />
  );
}

// ✅ Wrap in Suspense to fix useSearchParams() warning
export default function VerifyPage() {
  return (
    <Suspense fallback={<p className="text-center py-10">Loading...</p>}>
      <VerifyContent />
    </Suspense>
  );
}
