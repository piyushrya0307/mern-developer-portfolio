
const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

async function getData(endpoint) {
  const response = await fetch(`${API_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export const fetchContent = async () => {
  const data = await getData("/content");
  return data.content;
};

export const fetchProjects = async () => {
  const data = await getData("/projects");
  return data.projects || [];
};
