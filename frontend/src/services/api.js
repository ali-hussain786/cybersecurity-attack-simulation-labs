const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType =
    response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : { message: await response.text() };

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message || `Request failed: ${response.status}`
    );
  }

  return data;
}

export const api = {
  health: () => request("/health"),

  status: () => request("/status"),

  discovery: () =>
    request("/network/discovery"),

  selectedVictim: () =>
    request("/victim/selected"),

  clearVictim: () => request("/victim/clear", { method: "POST" }),
  selectVictim: (container) =>
    request("/victim/select", {
      method: "POST",
      body: JSON.stringify({ container }),
    }),

  scan: () =>
    request("/scan", {
      method: "POST",
    }),

  lastScan: () =>
    request("/scan"),

  files: () =>
    request("/files"),

  attack: () =>
    request("/attack", {
      method: "POST",
    }),

  recover: () =>
    request("/recover", {
      method: "POST",
    }),

  victimLogs: () =>
    request("/logs/victim"),

  attackerLogs: () =>
    request("/logs/attacker"),

};

export { API_BASE };
