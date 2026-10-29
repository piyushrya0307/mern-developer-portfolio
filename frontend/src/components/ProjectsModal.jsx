import { useEffect, useRef } from "react";
import { X, ExternalLink, FolderCode, ImageOff } from "lucide-react";

import { FaGithub } from "react-icons/fa";

function ProjectImage({ src, title }) {
  return (
    <div className="projects-gallery-image">
      {src ? (
        <img
          src={src}
          alt={`${title} screenshot`}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = "none";
            event.currentTarget.nextElementSibling.style.display = "flex";
          }}
        />
      ) : null}

      <div
        className="projects-gallery-image-fallback"
        style={{ display: src ? "none" : "flex" }}
      >
        <ImageOff size={28} />
        <span>Preview unavailable</span>
      </div>
    </div>
  );
}

export default function ProjectsModal({ isOpen, onClose, projects = [] }) {
  const closeRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "Tab" && dialogRef.current) {
        const elements = [
          ...dialogRef.current.querySelectorAll(
            'button:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])',
          ),
        ];

        if (!elements.length) return;

        const first = elements[0];
        const last = elements[elements.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const allProjects = Array.isArray(projects) ? projects : [];

  return (
    <div
      className="projects-gallery-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        ref={dialogRef}
        className="projects-gallery-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="projects-gallery-title"
      >
        <header className="projects-gallery-header">
          <div>
            <span className="projects-gallery-eyebrow">
              SELECTED & COMPLETED WORK
            </span>

            <h2 id="projects-gallery-title">
              All Projects<span>.</span>
            </h2>

            <p>Explore my work, technologies and live projects.</p>
          </div>

          <button
            ref={closeRef}
            type="button"
            className="projects-gallery-close"
            onClick={onClose}
            aria-label="Close projects gallery"
          >
            <X size={20} />
          </button>
        </header>

        <div className="projects-gallery-count">
          <FolderCode size={16} />
          <span>
            {allProjects.length}{" "}
            {allProjects.length === 1 ? "project" : "projects"}
          </span>
        </div>

        {allProjects.length === 0 ? (
          <div className="projects-gallery-empty">
            <FolderCode size={35} />
            <h3>Projects coming soon</h3>
            <p>New work will be added here.</p>
          </div>
        ) : (
          <div className="projects-gallery-grid">
            {allProjects.map((project, index) => {
              const technologies = Array.isArray(project.technologies)
                ? project.technologies
                : [];

              return (
                <article
                  className="projects-gallery-card"
                  key={project._id || index}
                >
                  <ProjectImage
                    src={project.image}
                    title={project.title || "Project"}
                  />

                  <div className="projects-gallery-content">
                    <div className="projects-gallery-card-heading">
                      <h3>{project.title || `Project ${index + 1}`}</h3>

                      {project.featured && (
                        <span className="projects-gallery-featured">
                          Featured
                        </span>
                      )}
                    </div>

                    {project.description && (
                      <p className="projects-gallery-description">
                        {project.description}
                      </p>
                    )}

                    {technologies.length > 0 && (
                      <div className="projects-gallery-tech">
                        {technologies.map((tech, i) => (
                          <span key={`${tech}-${i}`}>{tech}</span>
                        ))}
                      </div>
                    )}

                    <div className="projects-gallery-actions">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink size={15} />
                          Live Demo
                        </a>
                      )}

                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaGithub size={15} />
                          GitHub
                        </a>
                      )}

                      {!project.liveUrl && !project.githubUrl && (
                        <span className="projects-gallery-no-links">
                          Links coming soon
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
