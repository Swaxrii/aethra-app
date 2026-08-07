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
