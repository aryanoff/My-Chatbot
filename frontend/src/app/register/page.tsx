"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ZaaraMascot } from "@/components/mascot/zaara-mascot";
import { FadeIn } from "@/components/animations/fade-in";
import { api } from "@/services/api";
import { useAuthStore } from "@/store";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const tokens = await api.auth.register(email, password, name);
      const user = await api.auth.me(tokens.access_token);
      setAuth(user, tokens.access_token, tokens.refresh_token);
      router.push("/");
    } catch {
      setError("Registration failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <FadeIn className="glass-card w-full max-w-md p-8">
        <div className="flex flex-col items-center">
          <ZaaraMascot size={64} />
          <h1 className="mt-4 text-2xl font-bold gradient-text">Create Account</h1>
        </div>
        <form onSubmit={handleRegister} className="mt-8 space-y-4">
          <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password (min 8 chars)" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </FadeIn>
    </div>
  );
}
