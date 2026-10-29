const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function sendContactMessage(formData) {
  let response;

  try {
    response = await fetch(`${API_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
  } catch {
    throw new Error("Cannot connect to the server. Please try again.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Failed to send message.");
  }

  return data;
}
