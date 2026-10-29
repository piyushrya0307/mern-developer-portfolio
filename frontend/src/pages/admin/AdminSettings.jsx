import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserRound,
  LockKeyhole,
  Save,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";

import {
  getAdminProfile,
  updateAdminProfile,
  updateAdminPassword,
} from "../../services/settingsApi";

export default function AdminSettings() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const admin = await getAdminProfile();

        if (!active) return;

        setProfile({
          name: admin?.name || "",
          email: admin?.email || "",
        });
      } catch (error) {
        if (active) {
          setProfileError(error.message);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswords((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    if (savingProfile) return;

    setProfileError("");
    setProfileSuccess("");

    const name = profile.name.trim();
    const email = profile.email.trim().toLowerCase();

    if (name.length < 2 || name.length > 100) {
      setProfileError("Name must contain 2 to 100 characters.");
      return;
    }

    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setProfileError("Enter a valid email address.");
      return;
    }

    setSavingProfile(true);

    try {
      const updatedAdmin = await updateAdminProfile(name, email);

      setProfile({
        name: updatedAdmin.name,
        email: updatedAdmin.email,
      });

      setProfileSuccess("Profile updated successfully!");
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (event) => {
    event.preventDefault();

    if (changingPassword) return;

    setPasswordError("");

    const { currentPassword, newPassword, confirmPassword } = passwords;

    if (!currentPassword || !newPassword) {
      setPasswordError("Both passwords are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 12 || newPassword.length > 72) {
      setPasswordError("New password must contain 12 to 72 characters.");
      return;
    }

    if (
      !/[a-z]/.test(newPassword) ||
      !/[A-Z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword) ||
      !/[^a-zA-Z0-9]/.test(newPassword)
    ) {
      setPasswordError("Use uppercase, lowercase, a number and a symbol.");
      return;
    }

    setChangingPassword(true);

    try {
      await updateAdminPassword(currentPassword, newPassword);

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      navigate("/admin/login", {
        replace: true,
        state: {
          message: "Password changed. Please login with your new password.",
        },
      });
    } catch (error) {
      setPasswordError(error.message);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <section className="admin-settings-page">
      <header className="admin-settings-header">
        <span className="admin-section-eyebrow">ACCOUNT MANAGEMENT</span>
        <h1>Account Settings</h1>
        <p>Manage your admin profile and account security.</p>
      </header>

      <div className="admin-settings-layout">
        {/* PROFILE SECTION */}
        <div className="admin-settings-card">
          <div className="admin-settings-card-heading">
            <span className="admin-settings-icon">
              <UserRound size={20} />
            </span>
            <div>
              <h2>Admin Profile</h2>
              <p>Update your personal account details.</p>
            </div>
          </div>

          {profileError && (
            <p className="admin-settings-error" role="alert">
              {profileError}
            </p>
          )}

          {profileSuccess && (
            <p className="admin-settings-success" role="status">
              {profileSuccess}
            </p>
          )}

          <form className="admin-settings-form" onSubmit={handleSaveProfile}>
            <div className="admin-settings-field">
              <label htmlFor="settings-name">Display Name</label>
              <input
                id="settings-name"
                type="text"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                placeholder="Your name"
                autoComplete="name"
                maxLength={100}
                required
                disabled={loading || savingProfile}
              />
            </div>

            <div className="admin-settings-field">
              <label htmlFor="settings-email">Email Address</label>
              <input
                id="settings-email"
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                placeholder="admin@example.com"
                autoComplete="email"
                maxLength={254}
                required
                disabled={loading || savingProfile}
              />
            </div>

            <button
              type="submit"
              className="admin-settings-primary"
              disabled={loading || savingProfile}
            >
              <Save size={16} />
              {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>

        {/* PASSWORD SECTION */}
        <div className="admin-settings-card">
          <div className="admin-settings-card-heading">
            <span className="admin-settings-icon">
              <LockKeyhole size={20} />
            </span>
            <div>
              <h2>Change Password</h2>
              <p>Keep your admin account protected.</p>
            </div>
          </div>

          {passwordError && (
            <p className="admin-settings-error" role="alert">
              {passwordError}
            </p>
          )}

          <form className="admin-settings-form" onSubmit={handleUpdatePassword}>
            <div className="admin-settings-field">
              <label htmlFor="settings-current-password">
                Current Password
              </label>
              <input
                id="settings-current-password"
                type={showPasswords ? "text" : "password"}
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                autoComplete="current-password"
                required
                disabled={changingPassword}
              />
            </div>

            <div className="admin-settings-field">
              <label htmlFor="settings-new-password">New Password</label>
              <input
                id="settings-new-password"
                type={showPasswords ? "text" : "password"}
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                autoComplete="new-password"
                minLength={12}
                maxLength={72}
                required
                disabled={changingPassword}
              />
            </div>

            <div className="admin-settings-field">
              <label htmlFor="settings-confirm-password">
                Confirm New Password
              </label>
              <input
                id="settings-confirm-password"
                type={showPasswords ? "text" : "password"}
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                autoComplete="new-password"
                required
                disabled={changingPassword}
              />
            </div>

            <label className="admin-settings-show-password">
              <input
                type="checkbox"
                checked={showPasswords}
                onChange={(event) => setShowPasswords(event.target.checked)}
              />
              Show passwords
              {showPasswords ? <Eye size={16} /> : <EyeOff size={16} />}
            </label>

            <div className="admin-settings-security-note">
              <ShieldCheck size={18} />
              <p>
                Use 12–72 characters with uppercase, lowercase, number and
                symbol. Changing your password signs out existing sessions.
              </p>
            </div>

            <button
              type="submit"
              className="admin-settings-primary"
              disabled={changingPassword || loading}
            >
              <LockKeyhole size={16} />
              {changingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
