import React, { useState, useEffect } from "react";
import { Avatar } from "../components/common/Avatar";
import { Card } from "../components/common/Card";
import { GhostButton, PrimaryButton } from "../components/common/Buttons";

export function ProfileView({
  dark,
  setDark,
  showToast,
  currentUser,
  onUpdateUser,
}) {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        return {
          name: u.name || currentUser?.name || "User",
          email: u.email || currentUser?.email || "user@flowspace.io",
          role: u.role || currentUser?.role || "Senior Product Lead",
          bio:
            u.bio ||
            currentUser?.bio ||
            "Crafting calm software workflows for busy engineering teams.",
        };
      } catch {}
    }
    return {
      name: currentUser?.name || "User",
      email: currentUser?.email || "user@flowspace.io",
      role: currentUser?.role || "Senior Product Lead",
      bio:
        currentUser?.bio ||
        "Crafting calm software workflows for busy engineering teams.",
    };
  });

  useEffect(() => {
    if (currentUser?.name) {
      setProfile((prev) => ({
        ...prev,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email,
        role: currentUser.role || prev.role,
        bio: currentUser.bio || prev.bio,
      }));
    }
  }, [currentUser]);

  const [passwordForm, setPasswordForm] = useState({
    newPass: "",
    confirmPass: "",
  });
  const [prefs, setPrefs] = useState({
    assignments: true,
    reminders: true,
    desktop: false,
  });

  const handleSaveProfile = () => {
    localStorage.setItem("user", JSON.stringify(profile));
    onUpdateUser?.(profile);
    showToast?.("Personal profile updated successfully!");
  };

  const handleUpdatePassword = () => {
    if (!passwordForm.newPass) {
      showToast?.("Please enter a new password", "error");
      return;
    }
    if (passwordForm.newPass.length < 6) {
      showToast?.("Password must be at least 6 characters", "error");
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirmPass) {
      showToast?.("Passwords do not match", "error");
      return;
    }
    setPasswordForm({ newPass: "", confirmPass: "" });
    showToast?.("Password updated successfully!");
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1
          className={`text-2xl font-bold tracking-tight mb-1 ${
            dark ? "text-slate-100" : "text-slate-900"
          }`}
        >
          Account Settings
        </h1>
        <p
          className={`text-xs ${
            dark ? "text-slate-400" : "text-slate-500"
          }`}
        >
          Manage your personal profile, credentials, and notification
          preferences.
        </p>
      </div>

      <Card dark={dark} className="p-6">
        <h3
          className={`text-sm font-bold mb-4 ${
            dark ? "text-slate-100" : "text-slate-900"
          }`}
        >
          Personal Information
        </h3>
        <div className="flex items-center gap-5 pb-5 border-b border-slate-200 dark:border-slate-800">
          <Avatar name={profile.name} size={12} />
          <div>
            <div className="flex items-center gap-2">
              <GhostButton
                dark={dark}
                onClick={() =>
                  showToast?.("Photo avatar is dynamically rendered from initials")
                }
              >
                Change Photo
              </GhostButton>
              <button
                onClick={() => showToast?.("Default avatar active", "info")}
                className="text-xs text-rose-500 hover:underline px-2 cursor-pointer"
              >
                Reset
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Initials avatar dynamically computed. Modern SVG rendering.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Full Name
            </label>
            <input
              value={profile.name}
              onChange={(e) =>
                setProfile({ ...profile, name: e.target.value })
              }
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
                dark
                  ? "bg-slate-900/60 border-slate-800 text-slate-100 focus:border-indigo-500"
                  : "bg-white border-slate-200 text-slate-900 focus:border-indigo-500"
              }`}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Email Address
            </label>
            <input
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
                dark
                  ? "bg-slate-900/60 border-slate-800 text-slate-100 focus:border-indigo-500"
                  : "bg-white border-slate-200 text-slate-900 focus:border-indigo-500"
              }`}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Role
            </label>
            <input
              value={profile.role}
              onChange={(e) =>
                setProfile({ ...profile, role: e.target.value })
              }
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
                dark
                  ? "bg-slate-900/60 border-slate-800 text-slate-100 focus:border-indigo-500"
                  : "bg-white border-slate-200 text-slate-900 focus:border-indigo-500"
              }`}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Bio
            </label>
            <input
              value={profile.bio}
              onChange={(e) =>
                setProfile({ ...profile, bio: e.target.value })
              }
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
                dark
                  ? "bg-slate-900/60 border-slate-800 text-slate-100 focus:border-indigo-500"
                  : "bg-white border-slate-200 text-slate-900 focus:border-indigo-500"
              }`}
            />
          </div>
        </div>
        <div className="flex justify-end pt-5">
          <PrimaryButton onClick={handleSaveProfile}>Save Changes</PrimaryButton>
        </div>
      </Card>

      <Card dark={dark} className="p-6">
        <h3
          className={`text-sm font-bold mb-4 ${
            dark ? "text-slate-100" : "text-slate-900"
          }`}
        >
          Security & Authentication
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordForm.newPass}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPass: e.target.value })
              }
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
                dark
                  ? "bg-slate-900/60 border-slate-800 text-slate-100 focus:border-indigo-500"
                  : "bg-white border-slate-200 text-slate-900 focus:border-indigo-500"
              }`}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordForm.confirmPass}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  confirmPass: e.target.value,
                })
              }
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
                dark
                  ? "bg-slate-900/60 border-slate-800 text-slate-100 focus:border-indigo-500"
                  : "bg-white border-slate-200 text-slate-900 focus:border-indigo-500"
              }`}
            />
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <GhostButton dark={dark} onClick={handleUpdatePassword}>
            Update Password
          </GhostButton>
        </div>
      </Card>

      <Card dark={dark} className="p-6">
        <h3
          className={`text-sm font-bold mb-4 ${
            dark ? "text-slate-100" : "text-slate-900"
          }`}
        >
          Preferences & Theme
        </h3>
        <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <p
              className={`text-xs font-bold ${
                dark ? "text-slate-200" : "text-slate-800"
              }`}
            >
              Appearance
            </p>
            <p className="text-[11px] text-slate-400">
              Switch between sleek enterprise light and dark themes
            </p>
          </div>
          <button
            onClick={() => setDark((d) => !d)}
            className={`w-12 h-6 rounded-full relative transition-colors ${
              dark ? "bg-indigo-600" : "bg-slate-300"
            }`}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm"
              style={{ left: dark ? 26 : 2 }}
            />
          </button>
        </div>
        {[
          { key: "assignments", label: "Email me task assignments" },
          { key: "reminders", label: "Email me deadline reminders" },
          { key: "desktop", label: "Desktop browser notifications" },
        ].map((item, i) => (
          <div
            key={item.key}
            className={`flex items-center justify-between py-3 ${
              i < 2 ? "border-b border-slate-200 dark:border-slate-800" : ""
            }`}
          >
            <p
              className={`text-xs font-semibold ${
                dark ? "text-slate-200" : "text-slate-800"
              }`}
            >
              {item.label}
            </p>
            <button
              onClick={() => {
                setPrefs((prev) => ({
                  ...prev,
                  [item.key]: !prev[item.key],
                }));
                showToast?.(
                  `${item.label} ${!prefs[item.key] ? "enabled" : "disabled"}`
                );
              }}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                prefs[item.key]
                  ? "bg-indigo-600"
                  : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all"
                style={{ left: prefs[item.key] ? 26 : 2 }}
              />
            </button>
          </div>
        ))}
      </Card>
    </div>
  );
}

export default ProfileView;
