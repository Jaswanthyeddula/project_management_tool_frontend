import React, { useState } from "react";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { InputField } from "../../components/common/InputField";
import { authApi } from "../../api/endpoints";

export function LoginScreen({ goRegister, enterApp, onLoginSuccess }) {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await authApi.login(email, password);
      if (res?.access_token || res?.token) {
        localStorage.setItem("token", res.access_token || res.token);
        let userObj = res.user;
        if (!userObj) {
          try {
            userObj = await authApi.getMe().catch(() => null);
          } catch {}
        }
        if (!userObj || !userObj.name) {
          const fallbackName = email.split("@")[0] || "User";
          userObj = { name: fallbackName, email, role: "Senior Product Lead" };
        }
        localStorage.setItem("user", JSON.stringify(userObj));
        onLoginSuccess?.(userObj);
        enterApp();
      } else {
        enterApp();
      }
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err.message;
      setError(
        msg || "Invalid credentials. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to resume work in your tranquil workspace."
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          icon={Mail}
          label="Email Address"
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
          placeholder="Enter your password"
          showToggle
          show={show}
          setShow={setShow}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
        />
        <div className="flex items-center justify-between text-xs pt-1 pb-1">
          <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Remember me</span>
          </label>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">
            Forgot password?
          </span>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg, #4F46E5, #6366F1)",
          }}
        >
          {loading ? "Signing in..." : "Sign In to Flowspace"}
        </button>
      </form>
      <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-6">
        Don&apos;t have an account?{" "}
        <span
          className="font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline"
          onClick={goRegister}
        >
          Create one now
        </span>
      </p>
    </AuthShell>
  );
}

export default LoginScreen;
