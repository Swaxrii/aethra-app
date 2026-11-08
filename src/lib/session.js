function readPreference(key, fallback = null) {
  if (typeof window === "undefined") return fallback;
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function getSession() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("aethra_user"));
  } catch {
    return null;
  }
}

export function setSession(user) {
  localStorage.setItem("aethra_user", JSON.stringify(user));
  window.dispatchEvent(new CustomEvent("aethra-session"));
}

export function clearSession() {
  localStorage.removeItem("aethra_user");
  window.dispatchEvent(new CustomEvent("aethra-session"));
}

export function getModelPref() {
  return readPreference("aethra_model");
}

export function setModelPref(model) {
  localStorage.setItem("aethra_model", model);
}

export function getTemperaturePref() {
  const temperature = parseFloat(readPreference("aethra_temperature"));
  return Number.isNaN(temperature) ? 0.7 : temperature;
}

export function setTemperaturePref(temperature) {
  localStorage.setItem("aethra_temperature", String(temperature));
}

export function getResponseLengthPref() {
  return readPreference("aethra_response_length") || "Balanced";
}

export function setResponseLengthPref(length) {
  localStorage.setItem("aethra_response_length", length);
}
