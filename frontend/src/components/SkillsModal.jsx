import { useEffect } from "react";
import { X, Code2 } from "lucide-react";
import {
  FaReact,
  FaNodeJs,
  FaGitAlt,
  FaHtml5,
  FaCss3Alt,
  FaGithub,
} from "react-icons/fa";
import {
  SiJavascript,
  SiExpress,
  SiMongodb,
  SiTailwindcss,
  SiTypescript,
  SiNextdotjs,
} from "react-icons/si";

const skillIcons = {
  react: FaReact,
  javascript: SiJavascript,
  js: SiJavascript,
  "node.js": FaNodeJs,
  nodejs: FaNodeJs,
  express: SiExpress,
  "express.js": SiExpress,
  mongodb: SiMongodb,
  mongo: SiMongodb,
  tailwind: SiTailwindcss,
  "tailwind css": SiTailwindcss,
  html: FaHtml5,
  html5: FaHtml5,
  css: FaCss3Alt,
  css3: FaCss3Alt,
  git: FaGitAlt,
  github: FaGithub,
  typescript: SiTypescript,
  "next.js": SiNextdotjs,
  nextjs: SiNextdotjs,
};

export default function SkillsModal({ isOpen, onClose, skills = [] }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const allSkills = [
    ...new Set(
      skills
        .filter((skill) => typeof skill === "string" && skill.trim())
        .map((skill) => skill.trim()),
    ),
  ];

  return (
    <div
      className="skills-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="skills-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="skills-modal-title"
      >
        <div className="skills-modal-header">
          <div>
            <span className="skills-modal-eyebrow">MY TECH ARSENAL</span>

            <h2 id="skills-modal-title">Skills & Technologies</h2>

            <p>Technologies and tools I work with.</p>
          </div>

          <button
            type="button"
            className="skills-modal-close"
            onClick={onClose}
            aria-label="Close skills"
          >
            <X size={20} />
          </button>
        </div>

        <div className="skills-modal-grid">
          {allSkills.map((skill) => {
            const Icon = skillIcons[skill.toLowerCase()] || Code2;

            return (
              <div className="skills-modal-item" key={skill}>
                <Icon size={25} aria-hidden="true" />
                <span>{skill}</span>
              </div>
            );
          })}
        </div>

        <p className="skills-modal-footer">{allSkills.length} technologies</p>
      </section>
    </div>
  );
}
