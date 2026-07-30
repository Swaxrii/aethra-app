"use client";

import { useState } from "react";
import Select from "@/components/Select";
import Slider from "@/components/Slider";
import SegmentedControl from "@/components/SegmentedControl";

function Card({ title, children, className }) {
  return (
    <div className={`rounded-[10px] bg-[rgba(69,69,69,0.25)] border border-[rgba(69,69,69,0.8)] shadow-[inset_0px_-5px_4px_rgba(0,0,0,0.25)] p-5 ${className || ""}`}>
      <h3 className="text-sm font-semibold text-white/90 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function InputField({ label, type, placeholder, value, onChange, className }) {
  return (
    <div className={className || ""}>
      {label && (
        <label className="block text-xs font-normal text-white/60 mb-1.5">{label}</label>
      )}
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

export default function SettingsPage() {
  const [aiModel, setAiModel] = useState("GPT-5.5");
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

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdatePassword = () => {
    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password updated successfully", "success");
    }, 1500);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast("Settings saved successfully", "success");
    }, 1000);
  };

  const handleCancel = () => {
    setAiModel("GPT-5.5");
    setSystemPrompt("");
    setTemperature(0.7);
    setMemoryContext("Short-term");
    setResponseLength("Balanced");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="w-full h-full overflow-y-auto px-6 py-8">
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right-4 duration-300">
          <div className="rounded-[8px] bg-[#A64D79] text-white text-sm px-5 py-3 shadow-lg flex items-center gap-2.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13.3337 4.66663L6.00033 12L2.66699 8.66663" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {toast.message}
          </div>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Settings</h1>
          <p className="mt-1.5 text-sm font-extralight text-white/60">
            Configure your account preferences and personalize how AETHRA AI behaves.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <Card title="Account Profile">
              <div className="flex items-center gap-4">
                <div className="w-[48px] h-[48px] rounded-full bg-[#A64D79] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  Z
                </div>
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
              <button
                onClick={handleUpdatePassword}
                disabled={updating || !currentPassword || !newPassword || !confirmPassword}
                className="w-full h-[40px] rounded-[8px] bg-[#A64D79] text-white text-sm font-medium transition-all duration-300 hover:bg-[#A64D79]/90 hover:shadow-[0_0_14px_rgba(166,77,121,0.25)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updating ? (
                  <>
                    <svg className="animate-spin w-[16px] h-[16px]" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                      <path d="M15 8A7 7 0 0 0 1 8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </Card>
          </div>

          <div className="space-y-5">
            <Card title="AI Model">
              <Select type="AI Model" value={aiModel} onChange={setAiModel} />
            </Card>

            <Card title="System Prompt">
              <textarea
                placeholder="Define how your AI assistant should behave..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={5}
                className="w-full rounded-[8px] bg-[rgba(69,69,69,0.25)] border border-[rgba(69,69,69,0.8)] px-3.5 py-3 text-sm text-white/75 placeholder:text-white/40 outline-none transition-all duration-300 focus:border-[#A64D79] resize-none"
              />
            </Card>

            <Card title="Creativity (Temperature)">
              <Slider
                value={temperature}
                onChange={setTemperature}
                min={0}
                max={2}
                step={0.1}
              />
            </Card>

            <Card title="Memory Context">
              <Select type="Memory Context" value={memoryContext} onChange={setMemoryContext} />
            </Card>

            <Card title="Response Length">
              <SegmentedControl
                options={["Short", "Balanced", "Detailed"]}
                value={responseLength}
                onChange={setResponseLength}
              />
            </Card>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-end gap-3 border-t border-[rgba(69,69,69,0.3)] pt-6">
          <button
            onClick={handleCancel}
            className="h-[42px] px-6 rounded-[8px] border border-[rgba(69,69,69,0.8)] text-sm text-white/60 font-normal transition-all duration-300 hover:border-white/20 hover:text-white/80"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-[42px] px-6 rounded-[8px] bg-[#A64D79] text-white text-sm font-medium transition-all duration-300 hover:bg-[#A64D79]/90 hover:shadow-[0_0_14px_rgba(166,77,121,0.25)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-[16px] h-[16px]" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                  <path d="M15 8A7 7 0 0 0 1 8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
