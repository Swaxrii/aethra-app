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
}

export function clearSession() {
  localStorage.removeItem("aethra_user");
}

export function getModelPref() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("aethra_model");
  } catch {
    return null;
  }
}

export function setModelPref(model) {
  localStorage.setItem("aethra_model", model);
}

export function getTemperaturePref() {
  if (typeof window === "undefined") return 0.7;
  try {
    const v = parseFloat(localStorage.getItem("aethra_temperature"));
    return Number.isNaN(v) ? 0.7 : v;
  } catch {
    return 0.7;
  }
}

export function setTemperaturePref(temperature) {
  localStorage.setItem("aethra_temperature", String(temperature));
}

export function getResponseLengthPref() {
  if (typeof window === "undefined") return "Balanced";
  try {
    return localStorage.getItem("aethra_response_length") || "Balanced";
  } catch {
    return "Balanced";
  }
}

export function setResponseLengthPref(length) {
  localStorage.setItem("aethra_response_length", length);
}
