const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function settingsRequest(endpoint, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
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

export async function getAdminProfile() {
  const data = await settingsRequest("/auth/me");
  return data.admin;
}

export async function updateAdminProfile(name, email) {
  const data = await settingsRequest("/auth/profile", {
    method: "PATCH",
    body: JSON.stringify({ name, email }),
  });

  return data.admin;
}

export async function updateAdminPassword(currentPassword, newPassword) {
  return settingsRequest("/auth/password", {
    method: "PATCH",
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  });
}
