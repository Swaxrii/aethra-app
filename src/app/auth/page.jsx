"use client";

import { useState } from "react";
import AethraMark from "@/components/AethraMark";
import { useRouter } from "next/navigation";
import { registerDemo, loginDemo } from "@/lib/localAuth";

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
      const user = isRegister ? await registerDemo({ firstName, lastName, email, password }) : await loginDemo(email, password);
      localStorage.setItem("aethra_user", JSON.stringify(user));
      router.push("/");
    } catch (err) {
      setError(err.message || "Could not access local demo storage.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full h-[46px] rounded-[10px] bg-[rgba(69,69,69,0.25)] border border-[rgba(69,69,69,0.8)] px-4 text-sm text-white font-light placeholder:text-white/70 outline-none transition-all duration-500 focus:border-[#c6c9d2]";

  return (
    <div className="flex flex-col items-center justify-center auth-panel w-full max-w-[400px] px-4">
      <div className="animate-fade-up">
        <AethraMark size={56} className="mb-6" />
      </div>
      <h1 className="text-2xl sm:text-3xl tracking-tight text-white font-bold text-center animate-fade-up">
        AETHRA AI
      </h1>
      <p className="mt-1 mb-8 text-sm font-extralight text-white/60 text-center animate-fade-up">
        {isRegister ? "Create a local demo account." : "Sign in to your local demo account."} Demo only: not secure. Do not use a real password.
      </p>

      <div className="w-full relative flex items-center rounded-[10px] bg-[rgba(69,69,69,0.25)] border border-[rgba(69,69,69,0.8)] p-1 mb-6 animate-fade-up">
        <div
          className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-[8px] bg-[#c6c9d2] shadow-[0_0_12px_rgba(198,201,210,0.4)] transition-all duration-300 ease-out"
          style={{ left: isRegister ? "calc(50% + 4px)" : "4px" }}
        />
        <button
          type="button"
          onClick={() => { setMode("login"); setError(""); }}
          className={`relative flex-1 cursor-pointer rounded-[8px] py-2 text-sm transition-colors duration-300 ${!isRegister ? "text-white font-medium" : "text-white/60 hover:text-white"}`}>
          Login
        </button>
        <button
          type="button"
          onClick={() => { setMode("register"); setError(""); }}
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
                aria-label="First name" placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className={`${inputClass} animate-fade-up-stagger`}
              />
              <input
                type="text"
                aria-label="Last name" placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className={`${inputClass} animate-fade-up-stagger`}
              />
            </div>
            <input
              type="email"
              aria-label="Email" placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`${inputClass} animate-fade-up-stagger`}
            />
            <input
              type="password"
              aria-label="Demo password" placeholder="Password"
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
              aria-label="Email" placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`${inputClass} animate-fade-up-stagger`}
            />
            <input
              type="password"
              aria-label="Demo password" placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`${inputClass} animate-fade-up-stagger`}
            />
          </>
        )}

        {error && (
          <p role="alert" className="text-sm font-light text-red-400 text-center animate-fade-up">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 w-full cursor-pointer rounded-[10px] bg-[#c6c9d2] py-3 text-sm font-medium text-[#10231a] transition-all duration-300 hover:bg-[#c6c9d2]/90 hover:shadow-[0_0_14px_rgba(198,201,210,0.3)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
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