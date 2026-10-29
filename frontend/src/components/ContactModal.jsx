import { useEffect, useState } from "react";
import { X, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { sendContactMessage } from "../services/contactApi";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};

export default function ContactModal({ isOpen, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, loading]);

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");
    setStatus("");

    try {
      await sendContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        website: form.website,
      });

      setStatus("Message sent successfully!");
      setForm(initialForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;

    setError("");
    setStatus("");
    onClose();
  };

  return (
    <div
      className="contact-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <section
        className="contact-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
      >
        <div className="contact-modal-header">
          <div>
            <span className="contact-modal-eyebrow">LET'S CONNECT</span>

            <h2 id="contact-modal-title">Send a Message</h2>

            <p>Have a project in mind? I'd love to hear about it.</p>
          </div>

          <button
            type="button"
            className="contact-modal-close"
            onClick={handleClose}
            disabled={loading}
            aria-label="Close contact form"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Honeypot spam protection */}
          <div className="contact-honeypot" aria-hidden="true">
            <label htmlFor="contact-website">Website</label>

            <input
              id="contact-website"
              type="text"
              name="website"
              value={form.website}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="contact-modal-grid">
            <div className="contact-modal-field">
              <label htmlFor="contact-name">Your Name</label>

              <input
                id="contact-name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                maxLength={80}
                required
              />
            </div>

            <div className="contact-modal-field">
              <label htmlFor="contact-email">Email Address</label>

              <input
                id="contact-email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={handleChange}
                maxLength={150}
                required
              />
            </div>
          </div>

          <div className="contact-modal-field">
            <label htmlFor="contact-subject">Subject</label>

            <input
              id="contact-subject"
              name="subject"
              type="text"
              placeholder="Project collaboration"
              value={form.subject}
              onChange={handleChange}
              maxLength={150}
            />
          </div>

          <div className="contact-modal-field">
            <label htmlFor="contact-message">Message</label>

            <textarea
              id="contact-message"
              name="message"
              placeholder="Tell me about your project..."
              rows={5}
              value={form.message}
              onChange={handleChange}
              maxLength={3000}
              required
            />
          </div>

          {error && (
            <div className="contact-modal-feedback error" role="alert">
              <AlertCircle size={17} />
              {error}
            </div>
          )}

          {status && (
            <div className="contact-modal-feedback success" role="status">
              <CheckCircle2 size={17} />
              {status}
            </div>
          )}

          <button
            type="submit"
            className="contact-modal-submit"
            disabled={loading}
          >
            {loading ? (
              "Sending..."
            ) : (
              <>
                <Send size={17} />
                Send Message
              </>
            )}
          </button>
        </form>
      </section>
    </div>
  );
}
