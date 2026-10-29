const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function contentRequest(method = "GET", payload) {
  let response;

  try {
    response = await fetch(`${API_URL}/content`, {
      method,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(payload ? { "Content-Type": "application/json" } : {}),
      },
      ...(payload ? { body: JSON.stringify(payload) } : {}),
    });
  } catch {
    throw new Error("Cannot connect to backend server.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

export async function getPortfolioContent() {
  const data = await contentRequest();
  return data.content;
}

export async function savePortfolioContent(payload) {
  const data = await contentRequest("PUT", payload);
  return data.content;
}
