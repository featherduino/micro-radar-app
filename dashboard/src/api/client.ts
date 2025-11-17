const API_BASE = (import.meta as any).env?.VITE_API_BASE || "/api";

function toUrl(path: string) {
  return path.startsWith("http") ? path : `${API_BASE}${path}`;
}

async function get(path: string) {
  const response = await fetch(toUrl(path));
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }
  const data = await response.json();
  return { data };
}

export const api = { get };

