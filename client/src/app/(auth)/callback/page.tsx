"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (!accessToken || !refreshToken) {
      setError("Missing authentication tokens. Please try logging in again.");
      setTimeout(() => router.replace("/login"), 2000);
      return;
    }

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    fetchUser()
      .then(() => router.replace("/"))
      .catch(() => {
        setError("Failed to load user profile. Please try again.");
        setTimeout(() => router.replace("/login"), 2000);
      });
  }, [searchParams, router, fetchUser]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
      {error ? (
        <div className="bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-sm p-4 rounded-lg border border-red-200 dark:border-red-900 text-center max-w-sm">
          {error}
        </div>
      ) : (
        <>
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          <p className="text-sm text-muted-foreground">Signing you in...</p>
        </>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
