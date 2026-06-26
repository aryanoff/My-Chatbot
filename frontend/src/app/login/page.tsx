"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Github, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ZaaraMascot } from "@/components/mascot/zaara-mascot";
import { FadeIn } from "@/components/animations/fade-in";
import { api } from "@/services/api";
import { useAuthStore } from "@/store";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const tokens = await api.auth.login(email, password);
      const user = await api.auth.me(tokens.access_token);
      setAuth(user, tokens.access_token, tokens.refresh_token);
      router.push("/");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <FadeIn className="glass-card w-full max-w-md p-8">
        <div className="flex flex-col items-center">
          <ZaaraMascot size={64} />
          <h1 className="mt-4 text-2xl font-bold gradient-text">Welcome to Zaara AI</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to continue</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/20" />
          <span className="text-xs text-slate-400">or continue with</span>
          <div className="h-px flex-1 bg-white/20" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" type="button"><Mail className="mr-2 h-4 w-4" /> Google</Button>
          <Button variant="outline" type="button"><Github className="mr-2 h-4 w-4" /> GitHub</Button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          No account? <Link href="/register" className="text-primary hover:underline">Register</Link>
        </p>
      </FadeIn>
    </div>
  );
}
