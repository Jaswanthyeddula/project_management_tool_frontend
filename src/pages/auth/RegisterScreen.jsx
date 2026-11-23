import React, { useState } from "react";
import { User as UserIcon, Mail, Lock, AlertCircle } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { InputField } from "../../components/common/InputField";
import { authApi } from "../../api/endpoints";

export function RegisterScreen({ goLogin, enterApp, onLoginSuccess }) {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill out all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await authApi.register(name, email, password);
      if (res?.access_token || res?.token) {
        localStorage.setItem("token", res.access_token || res.token);
        const userObj = res.user || {
          name: name.trim(),
          email: email.trim(),
          role: "Senior Product Lead",
        };
        localStorage.setItem("user", JSON.stringify(userObj));
        onLoginSuccess?.(userObj);
      }
      enterApp();
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err.message;
      setError(msg || "Registration failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your workspace"
      subtitle="Get started with full enterprise collaboration."
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          icon={UserIcon}
          label="Full Name"
          placeholder="Maya Patel"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
        />
        <InputField
          icon={Mail}
          label="Work Email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
        />
        <InputField
          icon={Lock}
          label="Password"
          placeholder="Create a strong password"
          showToggle
          show={show}
          setShow={setShow}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
        />
        <label className="flex items-start gap-2 text-[11px] text-slate-500 pt-1 pb-1 cursor-pointer">
          <input
            type="checkbox"
            defaultChecked
            className="rounded text-indigo-600 focus:ring-indigo-500 mt-0.5"
          />
          <span>I agree to the Terms of Service and Privacy Policy</span>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg, #4F46E5, #6366F1)",
          }}
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>
      <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-6">
        Already have an account?{" "}
        <span
          className="font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline"
          onClick={goLogin}
        >
          Sign in
        </span>
      </p>
    </AuthShell>
  );
}

export default RegisterScreen;
