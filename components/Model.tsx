"use client";

import { Loader2, CheckCircle, XCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";

type StatusType = "loading" | "success" | "error" | "info";

type StatusMessageProps = {
  status: StatusType;
  message: string;
  countdown?: number;
  onActionClick?: () => void;
  actionLabel?: string;
  className?: string;
};

export function StatusMessage({
  status,
  message,
  countdown,
  onActionClick,
  actionLabel,
  className = "",
}: StatusMessageProps) {
  const getIcon = () => {
    const iconProps = { className: "w-10 h-10 mx-auto mb-3" };

    switch (status) {
      case "loading":
        return <Loader2 {...iconProps} className={`${iconProps.className} animate-spin text-blue-500`} />;
      case "success":
        return <CheckCircle {...iconProps} className={`${iconProps.className} text-green-500`} />;
      case "error":
        return <XCircle {...iconProps} className={`${iconProps.className} text-red-500`} />;
      case "info":
      default:
        return <Info {...iconProps} className={`${iconProps.className} text-gray-500`} />;
    }
  };

  const getTextColor = () => {
    switch (status) {
      case "loading":
        return "text-blue-600 dark:text-blue-400";
      case "success":
        return "text-green-600 dark:text-green-400";
      case "error":
        return "text-red-600 dark:text-red-400";
      case "info":
      default:
        return "text-gray-600 dark:text-gray-300";
    }
  };

  return (
    <div
      className={`max-w-md mx-auto p-8 text-center border rounded-lg shadow-sm
        ${
          status === "success"
            ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900"
            : status === "error"
            ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900"
            : status === "loading"
            ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900"
            : "border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900"
        }
        ${className}`}
    >
      {getIcon()}
      <p className={`mb-2 font-medium ${getTextColor()}`}>{message}</p>

      {typeof countdown === "number" && countdown > 0 && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}...
        </p>
      )}

      {onActionClick && actionLabel && (
        <div className="mt-4">
          <Button variant="outline" onClick={onActionClick}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
