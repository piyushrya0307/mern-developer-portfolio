import { useEffect, useState } from "react";
import { fetchDashboardStats } from "../../services/dashboardApi";
import { Link, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  FolderKanban,
  FilePenLine,
  Mail,
  Settings,
  LogOut,
  ArrowUpRight,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Clock3,
} from "lucide-react";

import { logoutAdmin } from "../../services/authApi";
import "../../styles/admin.css";
import AdminProjects from "./AdminProjects";
import AdminContent from "./AdminContent";
import AdminMessages from "./AdminMessages";
import AdminSettings from "./AdminSettings";

// Sidebar navigation
const menuItems = [
  {
    id: "overview",
    label: "Overview",
    Icon: LayoutDashboard,
  },
  {
    id: "projects",
    label: "Projects",
    Icon: FolderKanban,
  },
  {
    id: "content",
    label: "Content",
    Icon: FilePenLine,
  },
  {
    id: "messages",
    label: "Messages",
    Icon: Mail,
  },
  {
    id: "settings",
    label: "Settings",
    Icon: Settings,
  },
];

// Dashboard overview cards

const overviewCards = [
  {
    title: "Total Projects",
    description: "Portfolio projects",
    Icon: FolderKanban,
    section: "projects",
    statKey: "totalProjects",
  },
  {
    title: "Total Messages",
    description: "Visitor enquiries",
    Icon: Mail,
    section: "messages",
    statKey: "totalMessages",
  },
  {
    title: "Unread Messages",
    description: "Messages needing attention",
    Icon: Mail,
    section: "messages",
    statKey: "unreadMessages",
  },
  {
    title: "Portfolio Content",
    description: "Public profile information",
    Icon: FilePenLine,
    section: "content",
    statKey: "contentAvailable",
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadStats() {
      try {
        const result = await fetchDashboardStats(controller.signal);

        if (!active) return;

        setStats(result);

        if (result.errors.length > 0) {
          setStatsError("Some dashboard statistics could not be loaded.");
        }
      } catch (err) {
        if (!active) return;

        setStatsError(err.message || "Failed to load dashboard statistics.");
      } finally {
        if (active) {
          setStatsLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const currentPage =
    menuItems.find((item) => item.id === activePage) || menuItems[0];

  const changePage = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    setError("");

    try {
      await logoutAdmin();

      navigate("/admin/login", {
        replace: true,
      });
    } catch (err) {
      setError(err.message || "Logout failed. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="admin-layout">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`admin-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}
        aria-label="Admin navigation"
      >
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo">
            <LayoutDashboard size={21} />
          </div>

          <div>
            <strong>Portfolio</strong>
            <span>ADMIN PANEL</span>
          </div>

          <button
            type="button"
            className="admin-sidebar-close"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={19} />
          </button>
        </div>

        <div className="admin-sidebar-navigation">
          <span className="admin-nav-heading">WORKSPACE</span>

          <nav aria-label="Dashboard sections">
            {menuItems.map(({ id, label, Icon }) => (
              <button
                type="button"
                key={id}
                className={`admin-sidebar-link ${
                  activePage === id ? "active" : ""
                }`}
                aria-current={activePage === id ? "page" : undefined}
                onClick={() => changePage(id)}
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{label}</span>

                {activePage === id && (
                  <ChevronRight size={16} className="admin-active-arrow" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-status">
            <ShieldCheck size={17} />
            <div>
              <strong>Admin Session</strong>
              <span>Authenticated workspace</span>
            </div>
          </div>

          <button
            type="button"
            className="admin-sidebar-logout"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut size={18} />
            <span>{loggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="admin-main">
        {/* TOP HEADER */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-menu-toggle"
              aria-label="Open navigation"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              <Menu size={21} />
            </button>

            <div>
              <span className="admin-topbar-label">ADMIN WORKSPACE</span>

              <h2>{currentPage.label}</h2>
            </div>
          </div>

          <div className="admin-topbar-actions">
            <Link
              to="/"
              className="admin-view-website"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>View Website</span>
              <ArrowUpRight size={17} />
            </Link>

            <div className="admin-avatar">A</div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="admin-page-content">
          {error && (
            <div className="admin-login-error" role="alert">
              {error}
            </div>
          )}

          {activePage === "overview" ? (
            <>
              <div className="admin-welcome">
                <div>
                  <span className="admin-section-eyebrow">
                    DASHBOARD OVERVIEW
                  </span>

                  <h1>Welcome back.</h1>

                  <p>
                    Here's your portfolio workspace. Manage everything from one
                    place.
                  </p>
                </div>

                <div className="admin-welcome-icon">
                  <LayoutDashboard size={29} strokeWidth={1.3} />
                </div>
              </div>

              {/* OVERVIEW CARDS */}

              <div className="admin-stats-grid">
                {overviewCards.map(
                  ({ title, description, Icon, section, statKey }) => {
                    const value = stats?.[statKey];

                    let displayValue = "—";

                    if (!statsLoading) {
                      if (statKey === "contentAvailable") {
                        displayValue = stats
                          ? value
                            ? "Ready"
                            : "Unavailable"
                          : "—";
                      } else if (typeof value === "number") {
                        displayValue = value;
                      }
                    }

                    return (
                      <button
                        type="button"
                        className="admin-stat-card"
                        key={title}
                        onClick={() => changePage(section)}
                      >
                        <div className="admin-stat-top">
                          <div className="admin-stat-icon">
                            <Icon size={21} strokeWidth={1.8} />
                          </div>

                          <ArrowUpRight size={17} />
                        </div>

                        <div>
                          <span className="admin-stat-label">{title}</span>

                          <strong className="admin-stat-value">
                            {statsLoading ? "..." : displayValue}
                          </strong>

                          <p>{description}</p>
                        </div>
                      </button>
                    );
                  },
                )}
              </div>

              {statsError && (
                <p className="admin-stats-error" role="alert">
                  {statsError}
                </p>
              )}

              {/* QUICK ACCESS */}
              <div className="admin-section-header">
                <div>
                  <h2>Quick Access</h2>
                  <p>Jump to your management sections.</p>
                </div>
              </div>

              <div className="admin-quick-grid">
                <button
                  type="button"
                  className="admin-quick-card"
                  onClick={() => changePage("projects")}
                >
                  <FolderKanban size={22} />

                  <div>
                    <h3>Manage Projects</h3>
                    <p>Add and update your portfolio work.</p>
                  </div>

                  <ChevronRight size={18} />
                </button>

                <button
                  type="button"
                  className="admin-quick-card"
                  onClick={() => changePage("content")}
                >
                  <FilePenLine size={22} />

                  <div>
                    <h3>Edit Portfolio</h3>
                    <p>Update your about, skills and links.</p>
                  </div>

                  <ChevronRight size={18} />
                </button>
              </div>
            </>
          ) : activePage === "projects" ? (
            <AdminProjects />
          ) : activePage === "content" ? (
            <AdminContent />
          ) : activePage === "messages" ? (
            <AdminMessages />
          ) : activePage === "settings" ? (
            <AdminSettings />
          ) : (
            <div className="admin-placeholder">
              <div className="admin-placeholder-icon">
                <currentPage.Icon size={28} />
              </div>

              <span className="admin-section-eyebrow">
                PORTFOLIO MANAGEMENT
              </span>

              <h1>{currentPage.label}</h1>

              <p>
                The {currentPage.label.toLowerCase()} management interface will
                be implemented in the next steps.
              </p>

              <div className="admin-coming-label">
                <Clock3 size={15} />
                Coming next
              </div>

              <button
                type="button"
                className="admin-back-overview"
                onClick={() => changePage("overview")}
              >
                Back to Overview
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
