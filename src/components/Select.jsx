"use client";

import { useState, useRef, useEffect } from "react";

const options = {
  "AI Model": ["GPT-5.5", "GPT-5 Mini", "Claude", "Gemini", "Local Model"],
  "Memory Context": [
    { value: "Disabled", desc: "No memory retention between sessions" },
    { value: "Short-term", desc: "Remembers context within the current session" },
    { value: "Long-term", desc: "Persists memory across multiple sessions" },
  ],
};

export default function Select({ label, type, value, onChange, className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const items = options[type] || [];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isObject = typeof items[0] === "object";

  return (
    <div ref={ref} className={`relative ${className || ""}`}>
      {label && (
        <label className="block text-sm font-normal text-white/75 mb-2">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-[44px] rounded-[8px] bg-[rgba(69,69,69,0.25)] border border-[rgba(69,69,69,0.8)] px-3.5 flex items-center justify-between text-sm text-white/75 transition-all duration-300 hover:border-[#A64D79]"
      >
        <span>{value}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-[8px] bg-[#2A2A2D] border border-[rgba(69,69,69,0.8)] shadow-lg overflow-hidden animate-in fade-in duration-200">
          {items.map((item, i) => {
            const val = isObject ? item.value : item;
            const desc = isObject ? item.desc : null;
            return (
              <button
                key={i}
                type="button"
                onClick={() => { onChange(val); setOpen(false); }}
                className={`w-full text-left px-3.5 py-2.5 text-sm transition-all duration-200 hover:bg-[rgba(166,77,121,0.15)] ${
                  value === val ? "text-[#A64D79] font-medium" : "text-white/75"
                }`}
              >
                <div>{val}</div>
                {desc && (
                  <div className="text-[11px] text-white/40 font-extralight mt-0.5">{desc}</div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
