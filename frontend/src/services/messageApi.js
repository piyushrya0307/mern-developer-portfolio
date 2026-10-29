const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function messageRequest(endpoint, options = {}) {
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

// GET messages with server-side pagination and filters
export async function fetchMessages(page = 1, filter = "all") {
  const params = new URLSearchParams({
    page: String(page),
    filter,
  });

  const data = await messageRequest(`/messages?${params.toString()}`);

  return {
    messages: data.messages || [],
    unreadCount: data.unreadCount ?? 0,
    pagination: data.pagination || {
      page,
      limit: 10,
      totalMessages: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
}

// Mark a message as read
export async function markMessageRead(id) {
  const data = await messageRequest(
    `/messages/${encodeURIComponent(id)}/read`,
    {
      method: "PATCH",
    },
  );

  return data.data;
}

// Mark or unmark a message as important
export async function setMessageImportant(id, isImportant) {
  const data = await messageRequest(
    `/messages/${encodeURIComponent(id)}/important`,
    {
      method: "PATCH",
      body: JSON.stringify({ isImportant }),
    },
  );

  return data.data;
}

// Permanently delete a message
export async function removeMessage(id) {
  return messageRequest(`/messages/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}



export async function sendMessageReply(id, reply) {
  const data = await messageRequest(
    `/messages/${encodeURIComponent(id)}/reply`,
    {
      method: "POST",
      body: JSON.stringify({ reply }),
    }
  );

  return data.data;
}
