"use client";

import { useState, useRef, useEffect } from "react";

function Card({ title, children }) {
  return (
    <div className="rounded-[10px] bg-[rgba(69,69,69,0.25)] border border-[rgba(69,69,69,0.8)]  p-5">
      <h3 className="text-sm font-semibold text-white/90 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function InputField({ label, type, placeholder, value, onChange, className }) {
  return (
    <div className={className || ""}>
      {label && <label className="block text-xs text-white/60 mb-1.5">{label}</label>}
      <input
        type={type || "text"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full h-[40px] rounded-[8px] bg-[rgba(69,69,69,0.25)] border border-[rgba(69,69,69,0.8)] px-3.5 text-sm text-white/75 placeholder:text-white/40 outline-none transition-all duration-300 focus:border-[#A64D79]"
      />
    </div>
  );
}

function CardRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[rgba(69,69,69,0.3)] last:border-b-0">
      <span className="text-sm text-white/60">{label}</span>
      <span className="text-sm text-white/90 font-medium">{value}</span>
    </div>
  );
}

function Select({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {label && <label className="block text-sm text-white/75 mb-2">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-[44px] rounded-[8px] bg-[rgba(69,69,69,0.25)] border border-[rgba(69,69,69,0.8)] px-3.5 flex items-center justify-between text-sm text-white/75 transition-all duration-300 hover:border-[#A64D79]"
      >
        <span>{value}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-[8px] bg-[#2A2A2D] border border-[rgba(69,69,69,0.8)] shadow-lg overflow-hidden">
          {options.map((opt, i) => {
            const val = typeof opt === "object" ? opt.value : opt;
            const desc = typeof opt === "object" ? opt.desc : null;
            return (
              <button
                key={i}
                type="button"
                onClick={() => { onChange(val); setOpen(false); }}
                className={`w-full text-left px-3.5 py-2.5 text-sm transition-all duration-200 hover:bg-[rgba(166,77,121,0.15)] ${value === val ? "text-[#A64D79] font-medium" : "text-white/75"}`}
              >
                <div>{val}</div>
                {desc && <div className="text-[11px] text-white/40 font-extralight mt-0.5">{desc}</div>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Slider({ label, value, onChange, min, max, step }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      {label && <label className="block text-sm text-white/75 mb-2">{label}</label>}
      <div className="relative h-10 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-[4px] rounded-full appearance-none cursor-pointer bg-[rgba(69,69,69,0.8)] outline-none
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px]
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#A64D79] [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-[#A64D79] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(166,77,121,0.4)]
            [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-[#A64D79] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#A64D79]
            [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(166,77,121,0.4)]"
          style={{ background: `linear-gradient(to right, #A64D79 ${pct}%, rgba(69,69,69,0.8) ${pct}%)` }}
        />
      </div>
      <div className="flex justify-between text-xs text-white/40 mt-1">
        <span>{min}</span>
        <span className="text-sm text-white/75">Temperature: <span className="text-[#A64D79] font-medium">{value.toFixed(1)}</span></span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function SegmentedControl({ label, options, value, onChange }) {
  return (
    <div>
      {label && <label className="block text-sm text-white/75 mb-2">{label}</label>}
      <div className="flex rounded-[8px] bg-[rgba(69,69,69,0.25)] border border-[rgba(69,69,69,0.8)] p-1 gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`flex-1 px-3 py-2 text-sm rounded-[6px] transition-all duration-300 ${
              value === opt ? "bg-[#A64D79] text-white shadow-sm" : "text-white/60 hover:text-white hover:bg-[rgba(166,77,121,0.15)]"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [aiModel, setAiModel] = useState("Aethra 1.0");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [memoryContext, setMemoryContext] = useState("Short-term");
  const [responseLength, setResponseLength] = useState("Balanced");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleUpdatePassword = () => {
    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      showToast("Password updated successfully");
    }, 1500);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); showToast("Settings saved successfully"); }, 1000);
  };

  const handleCancel = () => {
    setAiModel("Aethra 1.0"); setSystemPrompt(""); setTemperature(0.7);
    setMemoryContext("Short-term"); setResponseLength("Balanced");
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
  };

  return (
    <div className="w-full h-full overflow-y-auto px-6 py-8">
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right-4 duration-300">
          <div className="rounded-[8px] bg-[#A64D79] text-white text-sm px-5 py-3 shadow-lg flex items-center gap-2.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.3337 4.66663L6.00033 12L2.66699 8.66663" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {toast}
          </div>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Settings</h1>
          <p className="mt-1.5 text-sm font-extralight text-white/60">Configure your account preferences and personalize how AETHRA AI behaves.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <Card title="Account Profile">
              <div className="flex items-center gap-4">
                <div className="w-[48px] h-[48px] rounded-full bg-[#A64D79] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">Z</div>
                <div className="flex-1 min-w-0">
                  <InputField placeholder="Full Name" />
                  <InputField placeholder="Email Address" className="mt-2.5" />
                </div>
              </div>
            </Card>

            <Card title="Account Information">
              <CardRow label="Account Created" value="March 15, 2026" />
              <CardRow label="Plan" value="Pro" />
              <CardRow label="User ID" value="usr_a7f3c2b9e1" />
            </Card>

            <Card title="Security">
              <InputField label="Current Password" type="password" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mb-3" />
              <InputField label="New Password" type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mb-3" />
              <InputField label="Confirm Password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mb-4" />
              <button onClick={handleUpdatePassword} disabled={updating || !currentPassword || !newPassword || !confirmPassword}
                className="w-full h-[40px] rounded-[8px] bg-[#A64D79] text-white text-sm font-medium transition-all duration-300 hover:bg-[#A64D79]/90 hover:shadow-[0_0_14px_rgba(166,77,121,0.25)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updating ? (
                  <><svg className="animate-spin w-[16px] h-[16px]" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="rgba(255,255,255,0.3)" strokeWidth="2" /><path d="M15 8A7 7 0 0 0 1 8" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg> Updating...</>
                ) : "Update Password"}
              </button>
            </Card>
          </div>

          <div className="space-y-5">
            <Card title="AI Model">
              <Select options={["Aethra 1.0", "Aethra 1.1"]} value={aiModel} onChange={setAiModel} />
            </Card>

            <Card title="System Prompt">
              <textarea placeholder="Define how your AI assistant should behave..." value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={5}
                className="w-full rounded-[8px] bg-[rgba(69,69,69,0.25)] border border-[rgba(69,69,69,0.8)] px-3.5 py-3 text-sm text-white/75 placeholder:text-white/40 outline-none transition-all duration-300 focus:border-[#A64D79] resize-none"
              />
            </Card>

            <Card title="Creativity (Temperature)">
              <Slider value={temperature} onChange={setTemperature} min={0} max={2} step={0.1} />
            </Card>

            <Card title="Memory Context">
              <Select options={[
                { value: "Disabled", desc: "No memory retention between sessions" },
                { value: "Short-term", desc: "Remembers context within the current session" },
                { value: "Long-term", desc: "Persists memory across multiple sessions" },
              ]} value={memoryContext} onChange={setMemoryContext} />
            </Card>

            <Card title="Response Length">
              <SegmentedControl options={["Short", "Balanced", "Detailed"]} value={responseLength} onChange={setResponseLength} />
            </Card>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-end gap-3 border-t border-[rgba(69,69,69,0.3)] pt-6">
          <button onClick={handleCancel} className="h-[42px] px-6 rounded-[8px] border border-[rgba(69,69,69,0.8)] text-sm text-white/60 transition-all duration-300 hover:border-white/20 hover:text-white/80">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="h-[42px] px-6 rounded-[8px] bg-[#A64D79] text-white text-sm font-medium transition-all duration-300 hover:bg-[#A64D79]/90 hover:shadow-[0_0_14px_rgba(166,77,121,0.25)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? <><svg className="animate-spin w-[16px] h-[16px]" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="rgba(255,255,255,0.3)" strokeWidth="2" /><path d="M15 8A7 7 0 0 0 1 8" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg> Saving...</> : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
