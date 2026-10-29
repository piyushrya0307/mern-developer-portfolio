import { useEffect, useState } from "react";
import {
  Save,
  RotateCcw,
  Plus,
  X,
  UserRound,
  Code2,
  Link2,
  Mail,
  Image as ImageIcon,
} from "lucide-react";

import {
  getPortfolioContent,
  savePortfolioContent,
} from "../../services/contentApi";

const emptyContent = {
  name: "",
  headline: "",
  about: "",
  location: "",
  email: "",
  profileImage: "",
  resumeUrl: "",
  skills: [],
  socialLinks: {
    github: "",
    linkedin: "",
    instagram: "",
  },
};

function normalizeContent(data) {
  return {
    name: data?.name || "",
    headline: data?.headline || "",
    about: data?.about || "",
    location: data?.location || "",
    email: data?.email || "",
    profileImage: data?.profileImage || "",
    resumeUrl: data?.resumeUrl || "",
    skills: Array.isArray(data?.skills)
      ? data.skills.filter((s) => typeof s === "string")
      : [],
    socialLinks: {
      github: data?.socialLinks?.github || "",
      linkedin: data?.socialLinks?.linkedin || "",
      instagram: data?.socialLinks?.instagram || "",
    },
  };
}

export default function AdminContent() {
  const [form, setForm] = useState(emptyContent);
  const [original, setOriginal] = useState(emptyContent);
  const [skillInput, setSkillInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadContent() {
      try {
        const data = await getPortfolioContent();
        if (!active) return;

        const normalized = normalizeContent(data);
        setForm(normalized);
        setOriginal(normalized);
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadContent();

    return () => {
      active = false;
    };
  }, []);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess("");
  };

  const updateSocial = (field, value) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [field]: value,
      },
    }));
    setSuccess("");
  };

  const addSkill = () => {
    const skill = skillInput.trim();

    if (!skill) return;

    if (skill.length > 60) {
      setError("Skill name must be 60 characters or less.");
      return;
    }

    if (form.skills.length >= 50) {
      setError("Maximum 50 skills allowed.");
      return;
    }

    if (
      form.skills.some(
        (existing) => existing.toLowerCase() === skill.toLowerCase(),
      )
    ) {
      setError("This skill already exists.");
      return;
    }

    setForm((prev) => ({
      ...prev,
      skills: [...prev.skills, skill],
    }));

    setSkillInput("");
    setError("");
    setSuccess("");
  };

  const removeSkill = (index) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
    setSuccess("");
  };

  const resetChanges = () => {
    setForm(normalizeContent(original));
    setSkillInput("");
    setError("");
    setSuccess("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      name: form.name.trim(),
      headline: form.headline.trim(),
      about: form.about.trim(),
      location: form.location.trim(),
      email: form.email.trim(),
      profileImage: form.profileImage.trim(),
      resumeUrl: form.resumeUrl.trim(),
      skills: form.skills,
      socialLinks: {
        github: form.socialLinks.github.trim(),
        linkedin: form.socialLinks.linkedin.trim(),
        instagram: form.socialLinks.instagram.trim(),
      },
    };

    try {
      const updated = await savePortfolioContent(payload);
      const normalized = normalizeContent(updated);

      setForm(normalized);
      setOriginal(normalized);
      setSuccess("Portfolio content saved successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-content-loading" role="status">
        Loading portfolio content...
      </div>
    );
  }

  return (
    <section className="admin-content-page">
      <div className="admin-content-header">
        <div>
          <span className="admin-section-eyebrow">PORTFOLIO MANAGEMENT</span>
          <h1>Content Editor</h1>
          <p>Manage the information displayed on your public portfolio.</p>
        </div>
      </div>

      {error && (
        <div className="admin-project-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-project-success" role="status">
          {success}
        </div>
      )}

      <form onSubmit={handleSave} className="admin-content-form">
        {/* PERSONAL DETAILS */}
        <div className="admin-content-section">
          <div className="admin-content-section-title">
            <UserRound size={20} />
            <div>
              <h2>Personal Information</h2>
              <p>Name, headline and introduction</p>
            </div>
          </div>

          <div className="admin-form-columns">
            <div className="admin-field">
              <label htmlFor="content-name">Full Name</label>
              <input
                id="content-name"
                value={form.name}
                maxLength={100}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Your full name"
              />
            </div>

            <div className="admin-field">
              <label htmlFor="content-headline">Professional Headline</label>
              <input
                id="content-headline"
                value={form.headline}
                maxLength={200}
                onChange={(e) => updateField("headline", e.target.value)}
                placeholder="MERN Stack Developer"
              />
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="content-about">About Me</label>
            <textarea
              id="content-about"
              rows={5}
              maxLength={5000}
              value={form.about}
              onChange={(e) => updateField("about", e.target.value)}
              placeholder="Tell visitors about yourself..."
            />
          </div>

          <div className="admin-field">
            <label htmlFor="content-location">Location</label>
            <input
              id="content-location"
              value={form.location}
              maxLength={150}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="City, Country"
            />
          </div>
        </div>

        {/* SKILLS */}
        <div className="admin-content-section">
          <div className="admin-content-section-title">
            <Code2 size={20} />
            <div>
              <h2>Skills & Technologies</h2>
              <p>Add or remove technologies from your stack</p>
            </div>
          </div>

          <div className="admin-skill-input-row">
            <input
              type="text"
              value={skillInput}
              maxLength={60}
              placeholder="Enter a skill, e.g. React"
              aria-label="New skill name"
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
            <button
              type="button"
              className="admin-primary-btn"
              onClick={addSkill}
            >
              <Plus size={17} />
              Add Skill
            </button>
          </div>

          <div className="admin-skills-list">
            {form.skills.length === 0 && <p>No skills added yet.</p>}

            {form.skills.map((skill, index) => (
              <span className="admin-skill-tag" key={`${skill}-${index}`}>
                {skill}
                <button
                  type="button"
                  aria-label={`Remove ${skill}`}
                  onClick={() => removeSkill(index)}
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
          <p className="admin-field-hint">
            Public homepage currently displays the first 6 skills.
          </p>
        </div>

        {/* CONTACT */}
        <div className="admin-content-section">
          <div className="admin-content-section-title">
            <Mail size={20} />
            <div>
              <h2>Contact Information</h2>
              <p>Email and resume link</p>
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="content-email">Public Email</label>
            <input
              id="content-email"
              type="email"
              maxLength={254}
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="admin-field">
            <label htmlFor="content-resume">Resume URL</label>
            <input
              id="content-resume"
              type="url"
              maxLength={2048}
              value={form.resumeUrl}
              onChange={(e) => updateField("resumeUrl", e.target.value)}
              placeholder="https://example.com/resume.pdf"
            />
          </div>
        </div>

        {/* PROFILE PHOTO */}
        <div className="admin-content-section">
          <div className="admin-content-section-title">
            <ImageIcon size={20} />
            <div>
              <h2>Profile Image</h2>
              <p>Optional externally hosted image URL</p>
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="content-photo">Image URL</label>
            <input
              id="content-photo"
              type="url"
              maxLength={2048}
              value={form.profileImage}
              onChange={(e) => updateField("profileImage", e.target.value)}
              placeholder="https://example.com/photo.jpeg"
            />
            <small>Leave blank to use your existing /profile.jpeg image.</small>
          </div>

          {form.profileImage && (
            <img
              className="admin-profile-preview"
              src={form.profileImage}
              alt="Profile preview"
            />
          )}
        </div>

        {/* SOCIAL LINKS */}
        <div className="admin-content-section">
          <div className="admin-content-section-title">
            <Link2 size={20} />
            <div>
              <h2>Social Links</h2>
              <p>Connect your professional profiles</p>
            </div>
          </div>

          {[
            ["github", "GitHub"],
            ["linkedin", "LinkedIn"],
            ["instagram", "Instagram"],
          ].map(([key, label]) => (
            <div className="admin-field" key={key}>
              <label htmlFor={`social-${key}`}>{label} URL</label>
              <input
                id={`social-${key}`}
                type="url"
                maxLength={2048}
                value={form.socialLinks[key]}
                onChange={(e) => updateSocial(key, e.target.value)}
                placeholder={`https://${key}.com/...`}
              />
            </div>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="admin-content-actions">
          <button
            type="button"
            className="admin-cancel-btn"
            onClick={resetChanges}
            disabled={saving}
          >
            <RotateCcw size={16} />
            Reset Changes
          </button>

          <button type="submit" className="admin-primary-btn" disabled={saving}>
            <Save size={17} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  );
}
