import { createFileRoute, Link, useNavigate, useSearch, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Admin sign in — RIBALI" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  beforeLoad: async ({ search }) => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: search.redirect ?? "/admin" });
  },
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Account created");
      }
      navigate({ to: search.redirect ?? "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper text-ink flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center font-display text-3xl tracking-widest mb-8 hover:text-copper transition-colors">
          RIBALI
        </Link>
        <div className="bg-white border border-ink/10 rounded-lg p-8 shadow-sm">
          <div className="mb-6">
            <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50 mb-2">Admin</div>
            <h1 className="text-2xl font-display">{mode === "login" ? "Sign in" : "Create account"}</h1>
            <p className="text-sm text-ink/60 mt-2">
              {mode === "login"
                ? "Access the RIBALI admin panel."
                : "The first account created becomes the admin."}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={8}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-ink/60">
            {mode === "login" ? (
              <button type="button" onClick={() => setMode("signup")} className="underline hover:text-copper">
                Need an account? Sign up
              </button>
            ) : (
              <button type="button" onClick={() => setMode("login")} className="underline hover:text-copper">
                Already have an account? Sign in
              </button>
            )}
          </div>
        </div>
        <div className="mt-6 text-center">
          <Link to="/" className="text-xs uppercase tracking-[0.3em] text-ink/40 hover:text-copper">
            ← Back to site
          </Link>
        </div>
      </div>
    </main>
  );
}
