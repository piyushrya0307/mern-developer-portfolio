import { useEffect, useState } from "react";
import { fetchContent, fetchProjects } from "../services/api";

export default function usePortfolioData() {
  const [content, setContent] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      const [contentResult, projectsResult] = await Promise.allSettled([
        fetchContent(),
        fetchProjects(),
      ]);

      if (!active) return;

      if (contentResult.status === "fulfilled") {
        setContent(contentResult.value);
      }

      if (projectsResult.status === "fulfilled") {
        setProjects(projectsResult.value);
      }

      if (
        contentResult.status === "rejected" ||
        projectsResult.status === "rejected"
      ) {
        setError("Failed to load some portfolio data.");
        console.error(contentResult, projectsResult);
      }

      setLoading(false);
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  return { content, projects, loading, error };
}
