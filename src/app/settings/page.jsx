"use client";

import { useState, useEffect } from "react";
import { getSession, setSession, getModelPref, setModelPref, getTemperaturePref, setTemperaturePref, getResponseLengthPref, setResponseLengthPref } from "@/lib/session";

const SECTIONS = [
  { id: "profile", label: "Profile" },
  { id: "model", label: "AI Model" },
];

const MODELS = [
  { value: "Aethra 1.0", desc: "Fast & efficient", tag: "Recommended" },
  { value: "Aethra 1.1", desc: "Deeper reasoning", tag: null },
];

export default function SettingsPage() {
  const [active, setActive] = useState("profile");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState("");

  const [model, setModel] = useState("Aethra 1.0");
  const [temperature, setTemperature] = useState(0.7);
  const [responseLength, setResponseLength] = useState("Balanced");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getSession();
    if (user) {
      setUserId(user.id);
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
      setName(fullName || user.email.split("@")[0]);
      setEmail(user.email);
    }
    const pref = getModelPref();
    if (pref) setModel(pref);
    setTemperature(getTemperaturePref());
    setResponseLength(getResponseLengthPref());
  }, []);

  const temperatureLabel = temperature < 0.4 ? "Focused" : temperature < 1.1 ? "Balanced" : temperature < 1.6 ? "Creative" : "Wild";

  const save = async () => {
    if (saving) return;
    setError("");
    setSaving(true);
    try {
      const parts = name.split(" ").filter(Boolean);
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ");
      const body = { id: userId, firstName, lastName, email };
      if (password) body.password = password;

      const res = await fetch("/api/auth/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      setPassword("");
      setSession(data.user);
      setModelPref(model);
      setTemperaturePref(temperature);
      setResponseLengthPref(responseLength);
      setTimeout(() => setSaving(false), 1000);
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto px-6 py-10">
      <div className="max-w-[960px] mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Settings</h1>
          <p className="mt-1 text-sm font-light text-white/55">Customize your experience. Changes are applied instantly.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-6">
          <nav className="md:w-52 flex-shrink-0">
            <div className="flex md:flex-col gap-1">
              {SECTIONS.map((s) => {
                const on = active === s.id;
                return (
                  <button key={s.id} onClick={() => setActive(s.id)} className={`text-left px-4 py-2.5 rounded-lg text-sm transition-all duration-200 cursor-pointer ${on ? "bg-[#A64D79] text-white font-medium" : "text-white/55 hover:text-white hover:bg-white/5"}`}>
                    {s.label}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="flex-1 min-w-0 space-y-5">
            {active === "profile" && (
              <>
                <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
                  <div className="flex items-center gap-5">
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A64D79] to-[#5C1E4D] flex items-center justify-center text-white font-bold text-2xl">{name[0] || "A"}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-semibold text-white">{name}</div>
                      <div className="text-sm text-white/45 font-light">Customize how you appear</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
                  <h3 className="text-sm font-semibold text-white/90 mb-4">Personal details</h3>
                  <div className="space-y-4">
                    <Field label="Display name">
                      <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
                    </Field>
                    <Field label="Email">
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
                    </Field>
                    <Field label="New password">
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current" className="input" />
                    </Field>
                    {error && <p className="text-sm font-light text-red-400">{error}</p>}
                  </div>
                </div>

                <div className="flex justify-end">
                  <PrimaryButton onClick={save} saving={saving}>
                    Save
                  </PrimaryButton>
                </div>
              </>
            )}

            {active === "model" && (
              <>
                <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
                  <h3 className="text-sm font-semibold text-white/90 mb-4">Select model</h3>
                  <div className="space-y-2.5">
                    {MODELS.map((m) => {
                      const on = model === m.value;
                      return (
                        <button key={m.value} onClick={() => setModel(m.value)} className={`w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-200 cursor-pointer ${on ? "border-[#A64D79] bg-[#A64D79]/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" : "border-white/10 hover:border-white/20"}`}>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white">{m.value}</span>
                              {m.tag && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#A64D79] text-white font-medium">{m.tag}</span>}
                            </div>
                            <div className="text-xs text-white/45 font-light mt-0.5">{m.desc}</div>
                          </div>
                          <Radio on={on} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white/90">Creativity</h3>
                    <span className="text-xs text-[#A64D79] font-medium">{temperatureLabel}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={2}
                    step={0.1}
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="slider"
                    style={{
                      background: `linear-gradient(to right, #A64D79 ${(temperature / 2) * 100}%, rgba(255,255,255,0.12) ${(temperature / 2) * 100}%)`,
                    }}
                  />
                  <div className="flex justify-between mt-2 text-[11px] text-white/40 font-light">
                    <span>Precise</span>
                    <span>Balanced</span>
                    <span>Imaginative</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
                  <h3 className="text-sm font-semibold text-white/90 mb-4">Response preferences</h3>
                  <div className="space-y-4">
                    <Field label="Response length">
                      <Segmented options={["Short", "Balanced", "Detailed"]} value={responseLength} onChange={setResponseLength} />
                    </Field>
                  </div>
                </div>

                <div className="flex justify-end">
                  <PrimaryButton onClick={save} saving={saving}>
                    Save
                  </PrimaryButton>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          height: 44px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0 14px;
          font-size: 14px;
          color: #fff;
          outline: none;
          transition: all 0.2s;
        }
        .input::placeholder {
          color: rgba(255, 255, 255, 0.35);
        }
        .input:focus {
          border-color: #a64d79;
        }
        .slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 5px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          outline: none;
          cursor: pointer;
        }
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #a64d79;
          border: 2px solid #fff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
        }
        .slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #a64d79;
          border: 2px solid #fff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-light text-white/55 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function PrimaryButton({ onClick, children, saving }) {
  return (
    <button onClick={onClick} disabled={saving} className={`h-11 min-w-[130px] px-6 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer active:scale-[0.98] ${saving ? "bg-[#7A3A5B] text-white" : "bg-[#A64D79] text-white shadow-[0_1px_3px_rgba(0,0,0,0.35)] hover:bg-[#A64D79]/90"}`}>
      {saving ? "Saving..." : children}
    </button>
  );
}

function Radio({ on }) {
  return <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${on ? "border-[#A64D79]" : "border-white/20"}`}>{on && <div className="w-2.5 h-2.5 rounded-full bg-[#A64D79]" />}</div>;
}

function Segmented({ options, value, onChange }) {
  return (
    <div className="flex rounded-lg bg-white/[0.04] border border-white/10 p-1 gap-1">
      {options.map((opt) => (
        <button key={opt} onClick={() => onChange(opt)} className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-all duration-200 cursor-pointer ${value === opt ? "bg-[#A64D79] text-white" : "text-white/55 hover:text-white"}`}>
          {opt}
        </button>
      ))}
    </div>
  );
}
