import { useEffect, useState } from "react";
import {
  Inbox,
  Mail,
  MailOpen,
  Star,
  Trash2,
  RefreshCw,
  Reply,
  Send,
  ArrowLeft,
  Clock3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  fetchMessages,
  markMessageRead,
  setMessageImportant,
  removeMessage,
  sendMessageReply,
} from "../../services/messageApi";

const filters = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "important", label: "Important" },
];

function formatDate(value) {
  if (!value) return "Unknown date";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalMessages: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [reloadKey, setReloadKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [replyText, setReplyText] = useState("");

  // Server-side pagination: only request the selected page and filter.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    async function load() {
      try {
        const result = await fetchMessages(page, filter);
        if (!active) return;
        setMessages(result.messages);
        setUnreadCount(result.unreadCount);
        setPagination(result.pagination);

        // After deletion, move back if the requested page is now empty.
        if (page > 1 && page > Math.max(1, result.pagination.totalPages)) {
          setPage(Math.max(1, result.pagination.totalPages));
        }
      } catch (err) {
        if (active) {
          setError(err.message);
          setMessages([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [page, filter, reloadKey]);

  const refresh = () => {
    setSuccess("");
    setReloadKey((key) => key + 1);
  };

  const changeFilter = (nextFilter) => {
    setFilter(nextFilter);
    setPage(1);
    setSelectedMessage(null);
    setReplyText("");
    setSuccess("");
  };

  const changePage = (nextPage) => {
    setPage(nextPage);
    setSelectedMessage(null);
    setReplyText("");
    setSuccess("");
  };

  const openMessage = async (message) => {
    setSelectedMessage(message);
    setReplyText("");
    setError("");
    setSuccess("");

    if (message.isRead) return;

    setBusyId(message._id);

    try {
      const updated = await markMessageRead(message._id);

      setMessages((previous) =>
        previous.map((item) => (item._id === message._id ? updated : item)),
      );

      setSelectedMessage(updated);
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const toggleImportant = async (message) => {
    if (busyId) return;

    setBusyId(message._id);
    setError("");
    setSuccess("");

    try {
      const updated = await setMessageImportant(
        message._id,
        !message.isImportant,
      );

      setMessages((previous) =>
        previous.map((item) => (item._id === message._id ? updated : item)),
      );

      setSelectedMessage((current) =>
        current?._id === updated._id ? updated : current,
      );
      setSuccess(
        updated.isImportant
          ? "Message marked as important."
          : "Message removed from important.",
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const submitReply = async (event) => {
    event.preventDefault();
    if (!selectedMessage || busyId) return;

    const reply = replyText.trim();
    if (!reply || reply.length > 5000) {
      setError("Reply must contain 1 to 5000 characters.");
      return;
    }

    const id = selectedMessage._id;
    setBusyId(id);
    setError("");
    setSuccess("");

    try {
      const updated = await sendMessageReply(id, reply);
      setSelectedMessage(updated);
      setMessages((previous) =>
        previous.map((message) => message._id === id ? updated : message)
      );
      setReplyText("");
      setSuccess("Reply accepted by email server and saved to history.");
    } catch (err) {
      setError(`${err.message} If you're unsure whether it sent, check your Sent mail before retrying.`);
    } finally {
      setBusyId(null);
    }
  };

  const deleteSelectedMessage = async (message) => {
    if (busyId) return;

    const confirmed = window.confirm(
      `Delete message from ${message.name} permanently?`,
    );

    if (!confirmed) return;

    setBusyId(message._id);
    setError("");
    setSuccess("");

    try {
      await removeMessage(message._id);

      setMessages((previous) =>
        previous.filter((item) => item._id !== message._id),
      );

      if (selectedMessage?._id === message._id) {
        setSelectedMessage(null);
      }

      // Refresh filtered totals and page contents from the backend.
      setReloadKey((key) => key + 1);

      setSuccess("Message deleted successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="admin-messages-page">
      <header className="admin-messages-header">
        <div>
          <span className="admin-section-eyebrow">PORTFOLIO MANAGEMENT</span>

          <h1>Messages</h1>
          <p>Read and manage your visitor enquiries.</p>
        </div>

        <button
          type="button"
          className="admin-refresh-btn"
          onClick={refresh}
          disabled={loading || !!busyId}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>

      <div className="admin-message-summary">
        <div>
          <Mail size={18} />
          <span>{pagination.totalMessages} matching</span>
        </div>

        <div>
          <MailOpen size={18} />
          <span>{unreadCount} unread</span>
        </div>

        <div>
          <Star size={18} />
          <span>
            {messages.filter((m) => m.isImportant).length} important on page
          </span>
        </div>
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

      <div className="admin-message-filters">
        {filters.map((item) => (
          <button
            type="button"
            key={item.id}
            className={filter === item.id ? "active" : ""}
            onClick={() => changeFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-message-empty" role="status">
          Loading your messages...
        </div>
      ) : selectedMessage ? (
        <article className="admin-message-detail">
          <button
            type="button"
            className="admin-message-back"
            onClick={() => {
              setSelectedMessage(null);
              setReplyText("");
              refresh();
            }}
          >
            <ArrowLeft size={16} />
            Back to inbox
          </button>

          <div className="admin-message-detail-top">
            <div>
              <span className="admin-section-eyebrow">MESSAGE DETAILS</span>

              <h2>{selectedMessage.subject || "No subject"}</h2>

              <p>
                From <strong>{selectedMessage.name}</strong>
              </p>

              <a
                href={`mailto:${selectedMessage.email}`}
                className="admin-message-email"
              >
                {selectedMessage.email}
              </a>
            </div>

            <button
              type="button"
              className={`admin-message-icon-btn ${
                selectedMessage.isImportant ? "is-important" : ""
              }`}
              onClick={() => toggleImportant(selectedMessage)}
              disabled={!!busyId}
              aria-label={
                selectedMessage.isImportant
                  ? "Remove important"
                  : "Mark as important"
              }
              title="Toggle important"
            >
              <Star
                size={19}
                fill={selectedMessage.isImportant ? "currentColor" : "none"}
              />
            </button>
          </div>

          <div className="admin-message-meta">
            <Clock3 size={15} />
            Received {formatDate(selectedMessage.createdAt)}
          </div>

          <div className="admin-message-body">{selectedMessage.message}</div>

          <div className="admin-reply-section">
            <div className="admin-reply-heading">
              <Reply size={17} />
              <h3>Reply directly from dashboard</h3>
            </div>
            <p className="admin-reply-recipient">
              To: {selectedMessage.email}
            </p>

            {Array.isArray(selectedMessage.replies) &&
              selectedMessage.replies.length > 0 && (
                <div className="admin-reply-history">
                  <h4>Sent reply history</h4>
                  {selectedMessage.replies.map((item, index) => (
                    <div
                      className="admin-reply-history-item"
                      key={item._id || item.messageId || index}
                    >
                      <time>{formatDate(item.sentAt)}</time>
                      <p>{item.body}</p>
                    </div>
                  ))}
                </div>
              )}

            <form className="admin-reply-form" onSubmit={submitReply}>
              <label htmlFor="admin-reply-text">Your reply</label>
              <textarea
                id="admin-reply-text"
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                maxLength={5000}
                rows={5}
                placeholder="Type your email reply here..."
                disabled={!!busyId}
                required
              />
              <button
                type="submit"
                className="admin-primary-btn admin-reply-send"
                disabled={!!busyId || !replyText.trim()}
              >
                <Send size={17} />
                {busyId ? "Sending..." : "Send Reply via Email"}
              </button>
            </form>
          </div>

          <div className="admin-message-actions">
            <button
              type="button"
              className="admin-message-delete-btn"
              onClick={() => deleteSelectedMessage(selectedMessage)}
              disabled={!!busyId}
            >
              <Trash2 size={17} />
              Delete
            </button>
          </div>

          <p className="admin-message-retention">
            {selectedMessage.isImportant
              ? "Important: protected from automatic deletion."
              : selectedMessage.expireAt
                ? `Scheduled expiry: ${formatDate(selectedMessage.expireAt)}`
                : "No automatic expiry scheduled."}
          </p>
        </article>
      ) : error ? null : messages.length === 0 ? (
        <div className="admin-message-empty">
          <Inbox size={35} />
          <h2>No messages found</h2>
          <p>
            {filter === "all"
              ? "Visitor messages will appear here."
              : "No messages match this filter."}
          </p>
        </div>
      ) : (
        <>
          <div className="admin-message-list">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`admin-message-row ${!message.isRead ? "unread" : ""}`}
              >
                <button
                  type="button"
                  className="admin-message-open"
                  onClick={() => openMessage(message)}
                  disabled={busyId === message._id}
                >
                  <div className="admin-message-avatar">
                    {(message.name || "?").charAt(0).toUpperCase()}
                  </div>

                  <div className="admin-message-row-content">
                    <div className="admin-message-row-heading">
                      <strong>{message.name}</strong>

                      {!message.isRead && (
                        <span className="admin-unread-indicator" />
                      )}
                    </div>

                    <h3>{message.subject || "No subject"}</h3>
                    <p>{message.message}</p>

                    <time>{formatDate(message.createdAt)}</time>
                  </div>
                </button>

                <div className="admin-message-row-tools">
                  <button
                    type="button"
                    className={`admin-message-icon-btn ${
                      message.isImportant ? "is-important" : ""
                    }`}
                    onClick={() => toggleImportant(message)}
                    disabled={!!busyId}
                    title="Toggle important"
                    aria-label={`Toggle important for ${message.name}`}
                  >
                    <Star
                      size={18}
                      fill={message.isImportant ? "currentColor" : "none"}
                    />
                  </button>

                  <button
                    type="button"
                    className="admin-message-icon-btn"
                    onClick={() => deleteSelectedMessage(message)}
                    disabled={!!busyId}
                    title="Delete message"
                    aria-label={`Delete message from ${message.name}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && !selectedMessage && pagination.totalPages > 0 && (
        <nav className="admin-message-pagination" aria-label="Message pages">
          <span>
            Page {pagination.page} of {pagination.totalPages}
            {` · ${pagination.totalMessages} matching messages`}
          </span>
          <div>
            <button
              type="button"
              disabled={!pagination.hasPreviousPage || !!busyId}
              onClick={() => changePage(page - 1)}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              type="button"
              disabled={!pagination.hasNextPage || !!busyId}
              onClick={() => changePage(page + 1)}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </nav>
      )}
    </section>
  );
}
