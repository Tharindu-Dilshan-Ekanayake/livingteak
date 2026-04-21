"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InputField from "@/components/InputField";

type LoginResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
};

type LoginErrorResponse = {
  error: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as LoginResponse | LoginErrorResponse;

      if (!response.ok) {
        throw new Error("Login failed");
      }

      if ("error" in data) {
        throw new Error(data.error);
      }

      if (data.user.role !== "admin") {
        throw new Error("Admin access only");
      }

      localStorage.setItem("woodmax_token", data.token);
      router.push("/admin");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900 flex items-center justify-center">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600 flex items-center gap-1 justify-center">
            Livingteak
          </p>
          <h1 className="text-2xl font-semibold">Login</h1>
          
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputField
            label="Email"
            name="email"
            type="email"
            placeholder="enter your email"
            value={email}
            onChange={setEmail}
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={setPassword}
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
          {status ? <p className="text-sm text-zinc-600">{status}</p> : null}
        </form>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-sm text-emerald-600 hover:underline self-center"
        >
          Back to Website
        </button>
      </div>
    </div>
  );
}
