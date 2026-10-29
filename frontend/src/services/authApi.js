
const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

async function authRequest(endpoint, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Cannot connect to server. Check your backend."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
      data.error ||
      "Authentication request failed."
    );
  }

  return data;
}

export function loginAdmin(email, password) {
  return authRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getCurrentAdmin() {
  return authRequest("/auth/me");
}

export function logoutAdmin() {
  return authRequest("/auth/logout", {
    method: "POST",
  });
}
