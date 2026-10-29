import { useCallback, useEffect, useState } from "react";

import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Star,
  X,
  Save,
  RefreshCw,
  FolderKanban,
} from "lucide-react";

import { FaGithub } from "react-icons/fa";

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../../services/projectApi";

const emptyForm = {
  title: "",
  description: "",
  image: "",
  technologies: "",
  githubUrl: "",
  liveUrl: "",
  featured: false,
  order: 0,
};

function toForm(project) {
  return {
    title: project.title || "",
    description: project.description || "",
    image: project.image || "",
    technologies: Array.isArray(project.technologies)
      ? project.technologies.join(", ")
      : "",
    githubUrl: project.githubUrl || "",
    liveUrl: project.liveUrl || "",
    featured: Boolean(project.featured),
    order: project.order ?? 0,
  };
}

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormError("");
    setSuccess("");
    setFormOpen(true);
  };

  const openEditForm = (project) => {
    setEditingId(project._id);
    setForm(toForm(project));
    setFormError("");
    setSuccess("");
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setEditingId(null);
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    setFormError("");
    setSuccess("");

    const technologies = form.technologies
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      technologies,
      githubUrl: form.githubUrl.trim(),
      liveUrl: form.liveUrl.trim(),
      featured: form.featured,
      order: Number(form.order),
    };

    if (!payload.title || !payload.description) {
      setFormError("Title and description are required.");
      return;
    }

    if (!Number.isInteger(payload.order) || payload.order < 0) {
      setFormError("Order must be a non-negative integer.");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        await updateProject(editingId, payload);
        setSuccess("Project updated successfully.");
      } else {
        await createProject(payload);
        setSuccess("Project added successfully.");
      }

      setFormOpen(false);
      setEditingId(null);
      await loadProjects();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (project) => {
    const confirmed = window.confirm(`Delete "${project.title}" permanently?`);

    if (!confirmed) return;

    setDeletingId(project._id);
    setError("");
    setSuccess("");

    try {
      await deleteProject(project._id);
      setSuccess("Project deleted successfully.");
      await loadProjects();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="admin-projects-page">
      <div className="admin-projects-header">
        <div>
          <span className="admin-section-eyebrow">PORTFOLIO MANAGEMENT</span>

          <h1>Projects</h1>

          <p>Add, edit and manage work displayed on your portfolio.</p>
        </div>

        <button
          type="button"
          className="admin-primary-btn"
          onClick={openAddForm}
        >
          <Plus size={18} />
          Add Project
        </button>
      </div>

      {error && (
        <p className="admin-project-error" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="admin-project-success" role="status">
          {success}
        </p>
      )}

      <div className="admin-projects-toolbar">
        <span>
          {loading ? "Loading projects..." : `${projects.length} projects`}
        </span>

        <button
          type="button"
          onClick={loadProjects}
          disabled={loading}
          className="admin-refresh-btn"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="admin-projects-empty">Loading your projects...</div>
      ) : projects.length === 0 && !error ? (
        <div className="admin-projects-empty">
          <FolderKanban size={36} />
          <h2>No projects yet</h2>
          <p>Add your first project to display it on your portfolio.</p>
          <button
            type="button"
            className="admin-primary-btn"
            onClick={openAddForm}
          >
            <Plus size={17} />
            Add First Project
          </button>
        </div>
      ) : (
        <div className="admin-projects-list">
          {projects.map((project) => (
            <article key={project._id} className="admin-project-row">
              <div className="admin-project-thumbnail">
                {project.image ? (
                  <img
                    src={project.image}
                    alt=""
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <FolderKanban size={26} />
                )}
              </div>

              <div className="admin-project-details">
                <div className="admin-project-title-row">
                  <h2>{project.title}</h2>

                  {project.featured && (
                    <span className="admin-featured-tag">
                      <Star size={13} />
                      Featured
                    </span>
                  )}
                </div>

                <p>{project.description}</p>

                <div className="admin-project-tech">
                  {(project.technologies || [])
                    .slice(0, 5)
                    .map((tech, index) => (
                      <span key={`${tech}-${index}`}>{tech}</span>
                    ))}
                </div>

                <div className="admin-project-external">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink size={14} />
                      Live
                    </a>
                  )}

                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaGithub size={14} />
                      GitHub
                    </a>
                  )}
                </div>
              </div>

              <div className="admin-project-actions">
                <button
                  type="button"
                  onClick={() => openEditForm(project)}
                  title="Edit project"
                  aria-label={`Edit ${project.title}`}
                >
                  <Pencil size={17} />
                </button>

                <button
                  type="button"
                  className="admin-delete-btn"
                  onClick={() => handleDelete(project)}
                  disabled={deletingId === project._id}
                  title="Delete project"
                  aria-label={`Delete ${project.title}`}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ADD / EDIT FORM */}
      {formOpen && (
        <div className="admin-project-form-area">
          <div className="admin-project-form-header">
            <h2>{editingId ? "Edit Project" : "Add Project"}</h2>

            <button
              type="button"
              onClick={closeForm}
              aria-label="Close form"
              disabled={saving}
            >
              <X size={20} />
            </button>
          </div>

          <form className="admin-project-form" onSubmit={handleSubmit}>
            <div className="admin-field">
              <label htmlFor="project-title">Project Title *</label>
              <input
                id="project-title"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                required
                maxLength={150}
                placeholder="E.g. Pashu Rakshak AI"
              />
            </div>

            <div className="admin-field">
              <label htmlFor="project-description">Description *</label>
              <textarea
                id="project-description"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                required
                maxLength={5000}
                rows={4}
                placeholder="Describe what you built..."
              />
            </div>

            <div className="admin-field">
              <label htmlFor="project-image">Project Image URL</label>
              <input
                id="project-image"
                type="url"
                value={form.image}
                onChange={(e) => updateField("image", e.target.value)}
                placeholder="https://example.com/project.png"
              />
              <small>
                Use a public HTTPS image URL. Local image uploads come later.
              </small>
            </div>

            <div className="admin-field">
              <label htmlFor="project-technologies">Technologies</label>
              <input
                id="project-technologies"
                value={form.technologies}
                onChange={(e) => updateField("technologies", e.target.value)}
                placeholder="React, Node.js, MongoDB"
              />
              <small>Separate skills with commas.</small>
            </div>

            <div className="admin-form-columns">
              <div className="admin-field">
                <label htmlFor="project-live">Live Website URL</label>
                <input
                  id="project-live"
                  type="url"
                  value={form.liveUrl}
                  onChange={(e) => updateField("liveUrl", e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="admin-field">
                <label htmlFor="project-github">GitHub URL</label>
                <input
                  id="project-github"
                  type="url"
                  value={form.githubUrl}
                  onChange={(e) => updateField("githubUrl", e.target.value)}
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            <div className="admin-form-columns">
              <div className="admin-field">
                <label htmlFor="project-order">Display Order</label>
                <input
                  id="project-order"
                  type="number"
                  min="0"
                  step="1"
                  value={form.order}
                  onChange={(e) => updateField("order", e.target.value)}
                />
              </div>

              <label className="admin-featured-check">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => updateField("featured", e.target.checked)}
                />
                <span>Featured Project</span>
              </label>
            </div>

            {formError && (
              <p className="admin-project-error" role="alert">
                {formError}
              </p>
            )}

            <div className="admin-project-form-actions">
              <button
                type="button"
                className="admin-cancel-btn"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-primary-btn"
                disabled={saving}
              >
                <Save size={17} />
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
