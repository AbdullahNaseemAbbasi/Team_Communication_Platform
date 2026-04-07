// ============================================
// AUTH LAYOUT — Login/Register pages ka common wrapper
// ============================================
// Next.js mein "layout" ek wrapper component hai jo apne child pages ke around render hota hai
// app/(auth)/layout.tsx → /login aur /register dono pages is layout ke andar render honge
//
// (auth) folder ka naam parentheses mein hai = "Route Group"
// Route Group sirf organization ke liye hai — URL mein nahi aata
// /login pe jayenge toh yeh layout wrap karega, but URL mein "auth" nahi hoga
//
// Layout ka fayda:
// - Common UI ek baar likho (background, centering, branding)
// - Page change hone pe layout re-render nahi hota (fast navigation)

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode; // children = current page (login ya register)
}) {
  return (
    // min-h-screen = minimum height poori screen jitni
    // flex items-center justify-center = content exactly center mein
    // bg-gradient = subtle gradient background for auth pages
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* ---- Branding / Logo ---- */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            TeamChat
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Connect with your team in real-time
          </p>
        </div>

        {/* ---- Page Content (Login/Register/Verify form) ---- */}
        {children}
      </div>
    </div>
  );
}
