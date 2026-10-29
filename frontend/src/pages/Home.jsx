import { useState } from "react";
import { Code2, ExternalLink, Mail, Sparkles } from "lucide-react";

import {
  FaGithub,
  FaLinkedin,
  FaInstagram,
  FaReact,
  FaNodeJs,
} from "react-icons/fa";

import {
  SiJavascript,
  SiExpress,
  SiMongodb,
  SiTailwindcss,
} from "react-icons/si";

import BentoCard from "../components/BentoCard";
import MobileNav from "../components/MobileNav";
import MagneticLink from "../components/MagneticLink";
import usePortfolioData from "../hooks/usePortfolioData";
import ContactModal from "../components/ContactModal";
import SkillsModal from "../components/SkillsModal";
import ProjectsModal from "../components/ProjectsModal";

// Tech Stack Icons
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
};

const defaultSkills = [
  "React",
  "JavaScript",
  "Node.js",
  "Express",
  "MongoDB",
  "Tailwind",
];

// Image Component
function ImageWithFallback({
  src,
  alt,
  className = "",
  priority = false,
  fallbackSrc,
}) {
  const [failedSources, setFailedSources] = useState([]);

  const useFallback = !!fallbackSrc && failedSources.includes(src);

  const currentSrc = useFallback ? fallbackSrc : src;

  const failed = failedSources.includes(currentSrc);

  if (failed || !currentSrc) {
    return (
      <div className={`image-fallback ${className}`}>
        <div className="fallback-art">
          <div className="fallback-orbit orbit-one" />
          <div className="fallback-orbit orbit-two" />
          <Code2 size={32} strokeWidth={1.3} />
        </div>

        <span>PREVIEW COMING SOON</span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      onError={() => {
        setFailedSources((previous) =>
          previous.includes(currentSrc) ? previous : [...previous, currentSrc],
        );
      }}
    />
  );
}

// Project Preview Component
function ProjectPreview({ project, number }) {
  const localImage =
    number === 1 ? "/projects/project-1.png" : "/projects/project-2.png";

  const image = project?.image || localImage;

  const destination = project?.liveUrl || project?.githubUrl;

  const preview = (
    <>
      <div className="project-media">
        <ImageWithFallback
          src={image}
          fallbackSrc={localImage}
          alt={project?.title || `Project ${number}`}
          className="visual-image"
        />
      </div>

      <div className="visual-overlay">
        <span>{project?.title || `PROJECT 0${number}`}</span>

        {destination && <ExternalLink size={15} />}
      </div>
    </>
  );

  return (
    <BentoCard
      className={`visual-card ${number === 1 ? "project-one" : "project-two"}`}
    >
      {destination ? (
        <a
          href={destination}
          target="_blank"
          rel="noopener noreferrer"
          className="project-card-link"
          aria-label={`Open ${project.title}`}
        >
          {preview}
        </a>
      ) : (
        preview
      )}
    </BentoCard>
  );
}

// Main Home Page
export default function Home() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const { content, projects, loading, error } = usePortfolioData();
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);

  // Portfolio Content
  const displayName = content?.name?.trim() || "Piyush";

  const displayHeadline = content?.headline?.trim() || "MERN Stack Developer";

  const displayAbout =
    content?.about?.trim() ||
    "I create modern web experiences that combine clean design with powerful functionality.";

  const displayImage = content?.profileImage?.trim() || "/profile.jpeg";

  const displaySkills =
    Array.isArray(content?.skills) && content.skills.length > 0
      ? content.skills
      : defaultSkills;

  // Projects
  const safeProjects = Array.isArray(projects) ? projects : [];

  const featuredProject =
    safeProjects.find((project) => project.featured) || safeProjects[0] || null;

  const previewProjects = safeProjects.slice(0, 2);

  const featuredDestination =
    featuredProject?.liveUrl || featuredProject?.githubUrl || "";

  // Social & Contact
  const socialLinks = content?.socialLinks || {};

  const contactEmail = content?.email?.trim() || "";

  const socialItems = [
    {
      name: "GitHub",
      href: socialLinks.github,
      Icon: FaGithub,
    },
    {
      name: "LinkedIn",
      href: socialLinks.linkedin,
      Icon: FaLinkedin,
    },
    {
      name: "Instagram",
      href: socialLinks.instagram,
      Icon: FaInstagram,
    },
    {
      name: "Email",
      href: "#contact",
      Icon: Mail,
    },
  ];

  const visibleSocials = socialItems.filter(
    (item) => item.name === "Email" || Boolean(item.href),
  );

  return (
    <main className="portfolio-shell" id="home">
      <div className="sr-only" role="status">
        {loading
          ? "Loading portfolio information"
          : error
            ? error
            : "Portfolio information loaded"}
      </div>

      <div className="bento-grid">
        {/* INTRODUCTION */}
        <BentoCard className="intro-card" id="about">
          <div className="intro-identity">
            <div className="mini-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>Hi, I'm {displayName}.</strong>

              <span>{displayHeadline}</span>
            </div>
          </div>

          <div className="intro-content">
            <h1>
              Designing with purpose,
              <br />
              building with passion.
            </h1>

            <p>{displayAbout}</p>
          </div>

          <div className="card-bottom">
            <span>AVAILABLE FOR OPPORTUNITIES</span>

            <span className="online-dot" />
          </div>
        </BentoCard>

        {/* PROJECT PREVIEW 1 */}
        <ProjectPreview project={previewProjects[0]} number={1} />

        {/* PROJECT PREVIEW 2 */}
        <ProjectPreview project={previewProjects[1]} number={2} />

        {/* SOCIALS */}
        <BentoCard className="social-card">
          <div className="social-grid">
            {visibleSocials.length > 0 ? (
              visibleSocials.map(({ name, href, Icon }) =>
                name === "Email" ? (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setIsContactOpen(true)}
                    className="social-icon-button"
                    aria-label="Open contact form"
                    title="Send me a message"
                  >
                    <Icon />
                  </button>
                ) : (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                    title={name}
                  >
                    <Icon />
                  </a>
                ),
              )
            ) : (
              <div className="social-empty">
                <span>Social links coming soon</span>
              </div>
            )}
          </div>

          <div className="social-caption">
            <span>LET'S CONNECT</span>

            <MagneticLink href="#contact" label="Go to contact" />
          </div>
        </BentoCard>

        {/* PERSONAL PHOTO */}
        <BentoCard className="photo-card">
          <div className="portrait-frame">
            <ImageWithFallback
              src={displayImage}
              fallbackSrc="/profile.jpeg"
              alt={`${displayName} — ${displayHeadline}`}
              className="portrait-image"
              priority
            />
          </div>

          <div className="portrait-light" />

          <div className="photo-tag">
            <span className="photo-tag-dot" />
            BEHIND THE CODE
          </div>
        </BentoCard>

        {/* SKILLS */}
        <BentoCard className="skills-card" id="skills">
          <div className="skills-card-heading">
            <div>
              <span className="eyebrow">TECH ARSENAL</span>
              <h2>Stack I use.</h2>
            </div>

            <button
              type="button"
              className="skills-view-all"
              onClick={() => setIsSkillsOpen(true)}
              aria-label="View all skills"
            >
              View All
              <ExternalLink size={14} />
            </button>
          </div>

          <div className="skills-grid">
            {displaySkills
              .filter((skill) => typeof skill === "string" && skill.trim())
              .slice(0, 6)
              .map((skill, index) => {
                const normalized = skill.trim().toLowerCase();
                const Icon = skillIcons[normalized];

                return (
                  <div
                    className="skill-tile"
                    key={`${skill}-${index}`}
                    title={skill}
                    role="img"
                    aria-label={skill}
                  >
                    {Icon ? (
                      <Icon size={23} aria-hidden="true" />
                    ) : (
                      <span className="skill-initials">
                        {skill.slice(0, 3)}
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        </BentoCard>

        {/* FEATURED WORK */}
        <BentoCard className="featured-card" id="projects">
          <div className="featured-heading">
            <span className="eyebrow">FEATURED WORK</span>

            <button
              type="button"
              className="projects-view-all"
              onClick={() => setIsProjectsOpen(true)}
              aria-label="View all projects"
            >
              View All Projects
              <ExternalLink size={14} />
            </button>

            {featuredDestination ? (
              <MagneticLink
                href={featuredDestination}
                label={`Open ${featuredProject.title}`}
              />
            ) : (
              <MagneticLink href="#contact" label="Discuss featured work" />
            )}
          </div>

          <div className="featured-image-wrap">
            <div className="featured-device">
              <div className="device-topbar">
                <span />
                <span />
                <span />
                <div className="device-address" />
              </div>

              <div className="device-screen">
                <ImageWithFallback
                  src={featuredProject?.image || "/projects/featured.jpg"}
                  fallbackSrc="/projects/featured.jpg"
                  alt={featuredProject?.title || "Featured MERN project"}
                  className="featured-image"
                />
              </div>
            </div>
          </div>

          <div className="featured-bottom">
            <div>
              <h2>{featuredProject?.title || "Selected Projects"}</h2>

              <p>
                {featuredProject?.technologies?.length
                  ? featuredProject.technologies.join(" · ")
                  : "Ideas transformed into working products."}
              </p>
            </div>

            {featuredDestination ? (
              <a
                href={featuredDestination}
                target="_blank"
                rel="noopener noreferrer"
                className="featured-project-link"
                aria-label={`Open ${featuredProject.title}`}
              >
                <ExternalLink size={17} />
              </a>
            ) : (
              <ExternalLink size={17} aria-hidden="true" />
            )}
          </div>
        </BentoCard>

        {/* LEARNING */}
        <BentoCard className="learning-card">
          <div>
            <span className="eyebrow">CURRENTLY EXPLORING</span>

            <h2>
              Always learning.
              <br />
              Always building.
            </h2>

            <p>
              Continuously improving my skills in development, design and modern
              web tools.
            </p>
          </div>

          <div className="learning-icon">
            <Sparkles size={30} strokeWidth={1.2} />
          </div>
        </BentoCard>

        {/* CONTACT */}
        <BentoCard className="contact-card" id="contact">
          <div>
            <span className="eyebrow">SAY HELLO 👋</span>

            <h2>Let's Work Together.</h2>

            <p>
              Have an exciting project in mind? Let's create something great
              together.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setIsContactOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-haspopup="dialog"
            >
              <Mail size={16} aria-hidden="true" />
              Send Message
            </button>

            {contactEmail && (
              <MagneticLink
                href={`mailto:${contactEmail}`}
                label={`Email ${displayName}`}
              />
            )}
          </div>
        </BentoCard>
      </div>

      {/* FOOTER */}
      <footer className="portfolio-footer">
        <span>
          © {new Date().getFullYear()} {displayName}
        </span>

        <span>Built with React & creativity.</span>
      </footer>

      {/* MOBILE BOTTOM NAVIGATION */}
      <MobileNav />

      {/* PUBLIC CONTACT FORM */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      <SkillsModal
        isOpen={isSkillsOpen}
        onClose={() => setIsSkillsOpen(false)}
        skills={displaySkills}
      />

      <ProjectsModal
        isOpen={isProjectsOpen}
        onClose={() => setIsProjectsOpen(false)}
        projects={safeProjects}
      />
    </main>
  );
}
