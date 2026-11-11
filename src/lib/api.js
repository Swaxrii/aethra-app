export async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      ...options,
      cache: "no-store",
      credentials: "same-origin",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new Error("Could not reach Aethra. Please try again.");
  }
  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }
  if (!response.ok) {
    if (
      response.status === 401 &&
      typeof window !== "undefined" &&
      window.location.pathname !== "/auth"
    )
      window.dispatchEvent(new CustomEvent("aethra-unauthorized"));
    throw new Error(payload.error || "Request failed. Please try again.");
  }
  return payload;
}

export function changed() {
  window.dispatchEvent(new CustomEvent("aethra-projects"));
}
