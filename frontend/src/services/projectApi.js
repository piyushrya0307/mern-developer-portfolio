const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

export async function getProjects() {
  const data = await request("/projects");
  return data.projects || [];
}

export async function createProject(project) {
  return request("/projects", {
    method: "POST",
    body: JSON.stringify(project),
  });
}

export async function updateProject(id, project) {
  return request(`/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(project),
  });
}

export async function deleteProject(id) {
  return request(`/projects/${id}`, {
    method: "DELETE",
  });
}
