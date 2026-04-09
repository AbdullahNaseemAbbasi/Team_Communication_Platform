"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function Home() {
  const { isAuthenticated, isLoading, fetchUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/workspace");
      } else {
        router.push("/login"); 
      }
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-lg text-muted-foreground">Loading...</div>
    </div>
  );
}
