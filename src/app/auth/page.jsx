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

  const isRegister = mode === "register";

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const payload = isRegister
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

  const inputClass =
    "w-full h-[46px] rounded-[10px] bg-[rgba(69,69,69,0.25)] border border-[rgba(69,69,69,0.8)] px-4 text-sm text-white font-light placeholder:text-white/70 outline-none transition-all duration-500 focus:border-[#A64D79]";

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[400px] px-4">
      <div className="animate-fade-up">
        <Image src="/logo.svg" alt="AethraCore" width={64} height={64} className="mb-6 animate-pop" />
      </div>
      <h1 className="text-2xl sm:text-3xl tracking-tight text-white font-bold text-center animate-fade-up">
        AETHRA AI
      </h1>
      <p className="mt-1 mb-8 text-sm font-extralight text-white/60 text-center animate-fade-up">
        {isRegister ? "Create an account to get started." : "Welcome back. Sign in to continue."}
      </p>

      <div className="w-full relative flex items-center rounded-[10px] bg-[rgba(69,69,69,0.25)] border border-[rgba(69,69,69,0.8)] p-1 mb-6 animate-fade-up">
        <div
          className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-[8px] bg-[#A64D79] shadow-[0_0_12px_rgba(166,77,121,0.4)] transition-all duration-300 ease-out"
          style={{ left: isRegister ? "calc(50% + 4px)" : "4px" }}
        />
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`relative flex-1 cursor-pointer rounded-[8px] py-2 text-sm transition-colors duration-300 ${!isRegister ? "text-white font-medium" : "text-white/60 hover:text-white"}`}>
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`relative flex-1 cursor-pointer rounded-[8px] py-2 text-sm transition-colors duration-300 ${isRegister ? "text-white font-medium" : "text-white/60 hover:text-white"}`}>
          Register
        </button>
      </div>

      <form key={mode} onSubmit={submit} className="w-full flex flex-col gap-3 animate-fade-up">
        {isRegister && (
          <>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className={`${inputClass} animate-fade-up-stagger`}
              />
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className={`${inputClass} animate-fade-up-stagger`}
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`${inputClass} animate-fade-up-stagger`}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`${inputClass} animate-fade-up-stagger`}
            />
          </>
        )}

        {!isRegister && (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`${inputClass} animate-fade-up-stagger`}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`${inputClass} animate-fade-up-stagger`}
            />
          </>
        )}

        {error && (
          <p className="text-sm font-light text-red-400 text-center animate-fade-up">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 w-full cursor-pointer rounded-[10px] bg-[#A64D79] py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-[#A64D79]/90 hover:shadow-[0_0_14px_rgba(166,77,121,0.3)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
          {loading
            ? isRegister
              ? "Creating account..."
              : "Signing in..."
            : isRegister
              ? "Create account"
              : "Sign in"}
        </button>
      </form>
    </div>
  );
}