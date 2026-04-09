export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-black via-slate-900 to-slate-800 items-center justify-center p-12">
        <div className="max-w-md text-white">
          <h1 className="text-5xl font-bold mb-6">TeamChat</h1>
          <p className="text-xl text-slate-300 mb-8">
            Where teams come together to collaborate, communicate, and build amazing things.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-lg">💬</div>
              <div>
                <p className="font-semibold">Real-time messaging</p>
                <p className="text-sm text-slate-400">Instant messages with threads and reactions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-lg">📹</div>
              <div>
                <p className="font-semibold">Voice & Video calls</p>
                <p className="text-sm text-slate-400">Crystal clear communication</p> 
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-lg">🔒</div>
              <div>
                <p className="font-semibold">Secure workspaces</p>
                <p className="text-sm text-slate-400">Role-based access control</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <h1 className="text-3xl font-bold text-indigo-600">TeamChat</h1>
            <p className="text-slate-500 mt-2">Connect with your team</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
