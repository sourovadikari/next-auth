"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function UserProfile() {
  const { data: session, status } = useSession();
  const user = session?.user;

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [open, setOpen] = useState(false); // controls AlertDialog open state

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (status === "loading") {
    return <p className="text-center py-10">Loading...</p>;
  }

  if (!session) {
    return (
      <p className="text-center py-10">You must be signed in to view this page.</p>
    );
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.delete("/api/auth/delete");
      setSuccess(response.data.message || "Account deleted successfully.");
      setOpen(false); // close dialog on success

      // Sign out and redirect to home page
      signOut({ callbackUrl: "/" });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error ||
          err.message ||
          "Failed to delete account. Please try again."
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md text-gray-800">
      <div className="flex items-center gap-4 mb-6">
        {user?.image ? (
          <div className="relative w-20 h-20 rounded-full overflow-hidden border">
            <Image
              src={user.image}
              alt={user.name || "Profile image"}
              fill
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            N/A
          </div>
        )}

        <div>
          <h1 className="text-2xl font-bold">{user?.name || "N/A"}</h1>
          <p className="text-sm text-gray-600">{user?.email || "N/A"}</p>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <div>
          <strong>User ID:</strong> {user?.id || "N/A"}
        </div>
        <div>
          <strong>Role:</strong> {user?.role || "N/A"}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <button
            onClick={() => setError(null)}
            className="mt-2 underline text-sm text-red-600"
            aria-label="Dismiss error"
          >
            Dismiss
          </button>
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="mb-4">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
          <button
            onClick={() => setSuccess(null)}
            className="mt-2 underline text-sm text-green-700"
            aria-label="Dismiss success"
          >
            Dismiss
          </button>
        </Alert>
      )}

      <div className="flex gap-4">
        {/* AlertDialog Trigger */}
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={isDeleting}
              aria-busy={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete your account? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isDeleting ? "Deleting..." : "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button onClick={() => signOut({ callbackUrl: "/signin" })}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}
