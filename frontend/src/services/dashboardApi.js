
const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

async function getDashboardData(endpoint, signal) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
      `Request failed: ${response.status}`
    );
  }

  return data;
}

export async function fetchDashboardStats(signal) {
  const [projectsResponse, messagesResponse, contentResponse] =
    await Promise.allSettled([
      getDashboardData("/projects", signal),
      getDashboardData("/messages/stats", signal),
      getDashboardData("/content", signal),
    ]);

  const projectsData =
    projectsResponse.status === "fulfilled"
      ? projectsResponse.value
      : null;

  const messageData =
    messagesResponse.status === "fulfilled"
      ? messagesResponse.value
      : null;

  const contentData =
    contentResponse.status === "fulfilled"
      ? contentResponse.value
      : null;

  return {
    totalProjects: projectsData
      ? typeof projectsData.count === "number"
        ? projectsData.count
        : Array.isArray(projectsData.projects)
          ? projectsData.projects.length
          : null
      : null,

    totalMessages:
      messageData?.stats?.totalMessages ?? null,

    unreadMessages:
      messageData?.stats?.unreadMessages ?? null,

    contentAvailable: contentData !== null &&
      contentData.content != null,

    errors: [
      projectsResponse,
      messagesResponse,
      contentResponse,
    ]
      .filter((result) => result.status === "rejected")
      .map((result) => result.reason?.message || "Request failed"),
  };
}
