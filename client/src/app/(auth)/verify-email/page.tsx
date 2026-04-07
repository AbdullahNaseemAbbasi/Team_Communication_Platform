"use client";

// ============================================
// VERIFY EMAIL PAGE — OTP verification form
// ============================================
// URL: /verify-email?email=user@example.com
// Register ke baad user yahan aata hai
// Email pe 6-digit OTP gaya hai → user yahan enter karta hai → backend verify karta hai
//
// useSearchParams() hook use karte hain URL se email extract karne ke liye
// Suspense boundary zaroori hai Next.js mein useSearchParams ke liye

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ============================================
// Verify Form Component (needs useSearchParams)
// ============================================
// useSearchParams() hook Next.js mein Suspense boundary ke andar hona chahiye
// Kyun? Yeh hook client-side pe URL read karta hai — server pe URL available nahi hota
// Suspense = "jab tak data load na ho, fallback dikhao"

function VerifyEmailForm() {
  // ---- URL se email extract karo ----
  // URL: /verify-email?email=user@example.com
  // useSearchParams() = URL ke query parameters read karta hai
  // searchParams.get("email") = "user@example.com"
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromUrl);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();
  const { verifyEmail, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // OTP exactly 6 digits hona chahiye
    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    try {
      // Backend: POST /auth/verify-email → { email, otp }
      // Backend check karega:
      // 1. Kya yeh OTP sahi hai? (user.otpCode se match)
      // 2. Kya expire nahi hua? (user.otpExpiry > Date.now())
      const data = await verifyEmail({ email, otp });

      setSuccess(data.message || "Email verified successfully!");

      // 2 second baad login page pe redirect
      // setTimeout = delay ke baad function execute karo
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || "Verification failed. Please try again.");
      } else {
        setError("Verification failed. Please try again.");
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Verify your email</CardTitle>
        <CardDescription>
          We sent a 6-digit code to <strong>{email || "your email"}</strong>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 text-sm p-3 rounded-md">
              {success}
            </div>
          )}

          {/* ---- Email (pre-filled from URL) ---- */}
          {/* Agar URL se email nahi aaya toh manually type kar sakte hain */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* ---- OTP Field ---- */}
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => {
                // Sirf numbers allow karo — letters type nahi ho sakte
                // replace(/[^0-9]/g, "") = har non-digit character hata do
                // .slice(0, 6) = max 6 characters
                const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
                setOtp(value);
              }}
              required
              maxLength={6}
              disabled={isLoading}
              className="text-center text-2xl tracking-widest"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <p className="text-sm text-center w-full text-muted-foreground">
          Back to{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

// ============================================
// PAGE EXPORT with Suspense
// ============================================
// Suspense boundary zaroori hai kyunki VerifyEmailForm useSearchParams() use karta hai
// Next.js App Router mein useSearchParams() client-side rendering trigger karta hai
// Suspense = "jab tak component ready na ho, fallback dikhao"
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center">Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
