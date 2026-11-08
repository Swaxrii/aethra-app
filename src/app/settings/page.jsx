"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { User, SlidersHorizontal, Palette, Save, RotateCcw } from "lucide-react";
import { updateDemo } from "@/lib/localAuth";
import Select from "@/components/Select";
import {
  getSession,
  setSession,
  getModelPref,
  setModelPref,
  getTemperaturePref,
  setTemperaturePref,
  getResponseLengthPref,
  setResponseLengthPref,
} from "@/lib/session";
export default function SettingsPage() {
  const [tab, setTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [model, setModel] = useState("Aethra 1.0");
  const [temperature, setTemperature] = useState(0.7);
  const [length, setLength] = useState("Balanced");
  const [motion, setMotion] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      const u = getSession();
      setUser(u);
      setName([u?.firstName, u?.lastName].filter(Boolean).join(" "));
      setEmail(u?.email || "");
      setModel(getModelPref() || "Aethra 1.0");
      setTemperature(getTemperaturePref());
      setLength(getResponseLengthPref());
      try {
        setMotion(localStorage.getItem("aethra_reduced_motion") === "true");
      } catch {
        setError("Browser preferences could not be read.");
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  const save = async () => {
    setFeedback("");
    setError("");
    try {
      if (tab === "profile") {
        if (!user) throw new Error("Sign in to a local demo account first.");
        const [firstName, ...rest] = name.trim().split(/\s+/);
        const u = await updateDemo(user.id, { firstName, lastName: rest.join(" "), email });
        setSession(u);
        setUser(u);
      }
      if (tab === "model") {
        setModelPref(model);
        setTemperaturePref(Number(temperature));
        setResponseLengthPref(length);
      }
      if (tab === "appearance") {
        localStorage.setItem("aethra_reduced_motion", String(motion));
        document.documentElement.classList.toggle("reduce-motion", motion);
      }
      setFeedback("Saved in this browser.");
    } catch (err) {
      setError(err.message || "Could not save preferences.");
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
    if (tab === "appearance") setMotion(false);
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
              ["appearance", "Appearance", Palette],
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
          <div className="surface settings-panel">
            {tab === "profile" ? (
              <>
                <h2>Your profile</h2>
                <p>Local demo account. This does not provide production security.</p>
                {!user && (
                  <Link href="/auth" className="ui-button secondary">
                    Sign in or register
                  </Link>
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
              </>
            ) : tab === "model" ? (
              <>
                <h2>Assistant preferences</h2>
                <p>
                  These settings control the local demonstration, without contacting AI services.
                </p>
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
            ) : (
              <>
                <h2>Appearance</h2>
                <p>Our dark workspace is designed for comfortable reading.</p>
                <label className="motion-choice">
                  <input
                    type="checkbox"
                    checked={motion}
                    onChange={(e) => setMotion(e.target.checked)}
                  />
                  <span>
                    Reduce interface motion
                    <small>Your system motion preference is also respected.</small>
                  </span>
                </label>
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
              <button className="ui-button" onClick={save}>
                <Save size={15} />
                Save changes
              </button>
            </footer>
          </div>
        </div>
      </div>
    </section>
  );
}
