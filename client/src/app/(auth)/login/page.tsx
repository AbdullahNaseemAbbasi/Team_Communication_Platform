"use client";

// ============================================
// LOGIN PAGE — User authentication form
// ============================================
// URL: /login
// User email + password daalte hain → backend verify karta hai → tokens milte hain
//
// "use client" kyun?
// - useState chahiye (form data store karne ke liye)
// - onClick/onSubmit chahiye (form submit handle karne ke liye)
// - useRouter chahiye (programmatic navigation ke liye)
// - Zustand store access chahiye (browser-only)

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

// shadcn/ui components import
// Yeh sab components humne Step 4 mein install kiye the
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

export default function LoginPage() {
  // ---- STATE ----
  // useState = React hook jo component-level state manage karta hai
  // [value, setValue] = current value + update function
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // ---- HOOKS ----
  // useRouter = Next.js ka hook for programmatic navigation
  // router.push("/dashboard") = user ko doosre page pe bhejo
  const router = useRouter();

  // Zustand store se login function aur isLoading state uthao
  // Yeh destructuring hai — object se specific properties nikaal rahe hain
  const { login, isLoading } = useAuthStore();

  // ---- FORM SUBMIT HANDLER ----
  // async function kyunki API call await karna hai
  const handleSubmit = async (e: React.FormEvent) => {
    // e.preventDefault() = form ka default behavior roko
    // Default behavior = page reload (hum nahi chahte — SPA hai)
    e.preventDefault();

    // Pehle se error dikh raha ho toh hata do
    setError("");

    try {
      // Zustand store ka login function call karo
      // Yeh internally:
      // 1. POST /auth/login → tokens milte hain
      // 2. Tokens localStorage mein save hote hain
      // 3. GET /auth/me → user data fetch hota hai
      // 4. Store update hota hai (user + isAuthenticated = true)
      await login({ email, password });

      // Login successful → redirect to home page
      // router.push() = client-side navigation (page reload nahi hota)
      router.push("/");
    } catch (err: unknown) {
      // Login fail hua — error message dikhao
      // Backend se error message extract karte hain
      // Axios errors mein response.data.message mein message hota hai
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || "Login failed. Please try again.");
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  return (
    <Card>
      {/* ---- CARD HEADER ---- */}
      <CardHeader>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Enter your credentials to sign in</CardDescription>
      </CardHeader>

      {/* ---- CARD CONTENT (Form) ---- */}
      <CardContent>
        {/* onSubmit = jab form submit ho (Enter key ya button click) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ---- Error Message ---- */}
          {/* Conditional rendering: error string empty nahi hai toh dikhao */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          {/* ---- Email Field ---- */}
          <div className="space-y-2">
            {/* htmlFor = label click karne pe associated input focus hota hai (accessibility) */}
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required // HTML5 validation — empty submit nahi hoga
              disabled={isLoading}
            />
          </div>

          {/* ---- Password Field ---- */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password" // Dots dikhata hai (masked input)
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>

          {/* ---- Submit Button ---- */}
          {/* w-full = poori width, disabled jab loading ho */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>

      {/* ---- CARD FOOTER ---- */}
      <CardFooter className="flex flex-col gap-4">
        {/* ---- Separator ---- */}
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* ---- Google OAuth Button ---- */}
        {/* Backend pe redirect karta hai: GET /api/auth/google */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/auth/google`;
          }}
          disabled={isLoading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </Button>

        {/* ---- Register Link ---- */}
        {/* Link component = Next.js ka <a> tag — client-side navigation karta hai */}
        <p className="text-sm text-center text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
