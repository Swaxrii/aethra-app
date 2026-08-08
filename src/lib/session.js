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
