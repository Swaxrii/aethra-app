"use client";
import { useEffect } from "react";
export default function Preferences() {
  useEffect(() => {
    try {
      document.documentElement.classList.toggle(
        "reduce-motion",
        localStorage.getItem("aethra_reduced_motion") === "true",
      );
    } catch {}
  }, []);
  return null;
}
