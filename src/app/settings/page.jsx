"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { User, SlidersHorizontal, Save, RotateCcw } from "lucide-react";
import { api } from "@/lib/api";
import Select from "@/components/Select";

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function SettingsPage() {
  const [tab, setTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [model, setModel] = useState("Aethra 1.0");
  const [temperature, setTemperature] = useState(0.7);
  const [length, setLength] = useState("Balanced");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let active = true;
    Promise.all([api("/api/auth/session"), api("/api/preferences")])
      .then(([session, result]) => {
        if (!active) return;
        const u = session.user;
        setUser(u);
        setName([u.firstName, u.lastName].filter(Boolean).join(" "));
        setEmail(u.email);
        setModel(result.preferences.model);
        setTemperature(result.preferences.temperature);
        setLength(result.preferences.responseLength);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const save = async () => {
    setFeedback("");
    setError("");
    setSaving(true);
    try {
      if (tab === "profile") {
        if (!user) throw new Error("Sign in first.");
        const [firstName, ...rest] = name.trim().split(/\s+/);
        const result = await api("/api/profile", {
          method: "PATCH",
          body: JSON.stringify({
            firstName,
            lastName: rest.join(" "),
            email,
            currentPassword,
            ...(newPassword ? { password: newPassword } : {}),
          }),
        });
        setUser(result.user);
        setCurrentPassword("");
        setNewPassword("");
        window.dispatchEvent(new CustomEvent("aethra-session"));
      }
      if (tab === "model") {
        await api("/api/preferences", {
          method: "PUT",
          body: JSON.stringify({ model, temperature: Number(temperature), responseLength: length }),
        });
      }
      setFeedback("Changes saved.");
    } catch (err) {
      setError(err.message || "Could not save preferences.");
    } finally {
      setSaving(false);
    }
  };
  const reset = () => {
    setFeedback("");
    setError("");
    if (tab === "profile") {
      setName([user?.firstName, user?.lastName].filter(Boolean).join(" "));
      setEmail(user?.email || "");
    }
    if (tab === "model") {
      setModel("Aethra 1.0");
      setTemperature(0.7);
      setLength("Balanced");
    }
  };
  return (
    <section className="page-shell">
      <div className="page-width">
        <header className="page-header">
          <div>
            <span className="eyebrow">Make it yours</span>
            <h1>Settings</h1>
            <p>A quieter workspace, tailored to the way you think.</p>
          </div>
        </header>
        <div className="settings-layout">
          <nav aria-label="Settings sections">
            {[
              ["profile", "Profile", User],
              ["model", "Assistant", SlidersHorizontal],
            ].map(([id, label, Icon]) => (
              <button
                key={id}
                aria-pressed={tab === id}
                onClick={() => {
                  setTab(id);
                  setFeedback("");
                  setError("");
                }}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </nav>
          <div className="surface settings-panel" aria-busy={loading}>
            {loading && (
              <p role="status" className="feedback">
                Loading your account…
              </p>
            )}
            {tab === "profile" ? (
              <>
                <h2>Your profile</h2>
                <p>Manage your account details.</p>
                {!user && (
                  <Link href="/auth" className="ui-button secondary">
                    Sign in or register
                  </Link>
                )}
                {user && (
                  <dl className="account-meta">
                    <div>
                      <dt>Member since</dt>
                      <dd>{formatDate(user.createdAt)}</dd>
                    </div>
                    <div>
                      <dt>Last sign-in</dt>
                      <dd>{user.lastLoginAt ? formatDate(user.lastLoginAt) : "This session"}</dd>
                    </div>
                  </dl>
                )}
                <label className="ui-field">
                  <span>Display name</span>
                  <input
                    className="ui-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </label>
                <label className="ui-field">
                  <span>Email</span>
                  <input
                    className="ui-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </label>
                <label className="ui-field">
                  <span>Current password (required to change email or password)</span>
                  <input
                    className="ui-input"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </label>
                <label className="ui-field">
                  <span>New password</span>
                  <input
                    className="ui-input"
                    type="password"
                    minLength={12}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Leave blank to keep current password"
                  />
                </label>
              </>
            ) : (
              <>
                <h2>Assistant preferences</h2>
                <p>Choose how demonstration responses are presented.</p>
                <div className="ui-field">
                  <span>Model style</span>
                  <Select
                    label="Model style"
                    value={model}
                    options={["Aethra 1.0", "Aethra 1.1"]}
                    onChange={setModel}
                  />
                </div>
                <label className="ui-field creativity-field">
                  <span className="creativity-label">
                    Creativity
                    <output>{Number(temperature).toFixed(1)}</output>
                  </span>
                  <input
                    className="creativity-range"
                    type="range"
                    min="0"
                    max="2"
                    step=".1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    aria-label="Assistant creativity"
                  />
                </label>
                <div className="ui-field">
                  <span>Response length</span>
                  <Select
                    label="Response length"
                    value={length}
                    options={["Short", "Balanced", "Detailed"]}
                    onChange={setLength}
                  />
                </div>
              </>
            )}
            {feedback && (
              <p role="status" className="feedback">
                {feedback}
              </p>
            )}
            {error && (
              <p role="alert" className="feedback error">
                {error}
              </p>
            )}
            <footer className="settings-footer">
              <button className="ui-button secondary" onClick={reset}>
                <RotateCcw size={15} />
                Reset
              </button>
              <button className="ui-button" onClick={save} disabled={saving || loading}>
                <Save size={15} />
                {saving ? "Saving…" : "Save changes"}
              </button>
            </footer>
          </div>
        </div>
      </div>
    </section>
  );
}
