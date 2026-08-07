"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const payload =
        mode === "register"
          ? { firstName, lastName, email, password }
          : { email, password };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      localStorage.setItem("aethra_user", JSON.stringify(data.user));
      router.push("/");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setError("");
  };

  const inputClass =
    "w-full h-[46px] rounded-[10px] bg-[rgba(69,69,69,0.25)] border border-[rgba(69,69,69,0.8)] px-4 text-sm text-white font-light placeholder:text-white/70 outline-none transition-all duration-500 focus:border-[#A64D79]";

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[400px] px-4">
      <Image src="/logo.svg" alt="AethraCore" width={64} height={64} className="mb-6" />
      <h1 className="text-2xl sm:text-3xl tracking-tight text-white font-bold text-center">
        AETHRA AI
      </h1>
      <p className="mt-1 mb-8 text-sm font-extralight text-white/60 text-center">
        {mode === "login" ? "Welcome back. Sign in to continue." : "Create an account to get started."}
      </p>

      <div className="w-full flex items-center rounded-[10px] bg-[rgba(69,69,69,0.25)] border border-[rgba(69,69,69,0.8)] p-1 mb-6">
        <button
          type="button"
          onClick={() => switchMode("login")}
          className={`flex-1 cursor-pointer rounded-[8px] py-2 text-sm transition-all duration-300 ${mode === "login" ? "bg-[#A64D79] text-white font-medium" : "text-white/60 hover:text-white"}`}>
          Login
        </button>
        <button
          type="button"
          onClick={() => switchMode("register")}
          className={`flex-1 cursor-pointer rounded-[8px] py-2 text-sm transition-all duration-300 ${mode === "register" ? "bg-[#A64D79] text-white font-medium" : "text-white/60 hover:text-white"}`}>
          Register
        </button>
      </div>

      <form onSubmit={submit} className="w-full flex flex-col gap-3">
        {mode === "register" && (
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className={inputClass}
            />
          </div>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={inputClass}
        />

        {error && (
          <p className="text-sm font-light text-red-400 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 w-full cursor-pointer rounded-[10px] bg-[#A64D79] py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-[#A64D79]/90 hover:shadow-[0_0_14px_rgba(166,77,121,0.3)] disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? (mode === "register" ? "Creating account..." : "Signing in...") : mode === "register" ? "Create account" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
