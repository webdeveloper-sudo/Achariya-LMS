import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

type Step = "EMAIL" | "OTP" | "PASSWORD_CREATE" | "SUCCESS";

const PrincipalActivate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isForgotMode = searchParams.get("mode") === "forgot";

  const [step, setStep] = useState<Step>("EMAIL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const steps: Step[] = ["EMAIL", "OTP", "PASSWORD_CREATE", "SUCCESS"];
  const currentIndex = steps.indexOf(step);

  const resetError = () => setError(null);

  // Step 1 â€” Send OTP to the registered email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetError();
    setLoading(true);
    setDevOtp(null);
    try {
      const res = await axiosInstance.post("/principals/auth/send-otp", {
        email,
      });
      if (res.data.devOtp) setDevOtp(res.data.devOtp);
      setStep("OTP");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Could not send OTP. Make sure your email is registered by the admin.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 1.5 â€” Resend OTP
  const handleResendOtp = async () => {
    resetError();
    setDevOtp(null);
    setLoading(true);
    try {
      const res = await axiosInstance.post("/principals/auth/send-otp", {
        email,
      });
      if (res.data.devOtp) setDevOtp(res.data.devOtp);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 â€” Verify OTP (client-side only, backend verifies during activate)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetError();
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }
    // We don't verify OTP separately â€” it gets verified in the activate call.
    // Move to password creation step.
    setStep("PASSWORD_CREATE");
  };

  // Step 3 â€” Set password + activate account
  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    resetError();

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    try {
      if (isForgotMode) {
        await axiosInstance.post("/principals/auth/reset-password", {
          email,
          otp,
          password,
        });
      } else {
        const res = await axiosInstance.post("/principals/auth/activate", {
          email,
          otp,
          password,
        });

        const { token, user } = res.data;
        localStorage.setItem("token", token);
        localStorage.setItem(
          "user",
          JSON.stringify({ ...user, selectedRole: "Principal" }),
        );
      }

      setStep("SUCCESS");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Activation failed. Your OTP may have expired â€” please go back and request a new one.",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      // â”€â”€ Step 1: Email â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case "EMAIL":
        return (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="text-center mb-2">
              <h2 className="text-xl font-bold text-gray-800">
                {isForgotMode ? "Reset Password" : "Verify Your Email"}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Enter the email address registered by your admin.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400"
                  placeholder="your.email@achariya.org"
                  required
                  autoFocus
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Send OTP <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        );

      // â”€â”€ Step 2: OTP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case "OTP":
        return (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="text-center mb-2">
              <h2 className="text-xl font-bold text-gray-800">Enter OTP</h2>
              <p className="text-gray-500 text-sm mt-1">
                A 6-digit code was sent to{" "}
                <span className="font-medium text-gray-700">{email}</span>
              </p>
            </div>

            {devOtp && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm font-mono">
                ðŸ›  Dev OTP: <strong>{devOtp}</strong>
              </div>
            )}

            <div>
              <div className="relative">
                <ShieldCheck
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full pl-10 pr-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                  placeholder="------"
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Verify Code"
              )}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep("EMAIL");
                  setOtp("");
                  setDevOtp(null);
                  resetError();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                â† Change email
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw size={13} />
                Resend OTP
              </button>
            </div>
          </form>
        );

      // â”€â”€ Step 3: Create Password â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case "PASSWORD_CREATE":
        return (
          <form onSubmit={handleActivate} className="space-y-6">
            <div className="text-center mb-2">
              <h2 className="text-xl font-bold text-gray-800">
                {isForgotMode ? "Reset Password" : "Secure Your Account"}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {isForgotMode
                  ? "Create a new strong password."
                  : "Create a strong password to complete activation."}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400"
                    placeholder="Min 6 characters"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400"
                    placeholder="Retype password"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : isForgotMode ? (
                "Reset Password"
              ) : (
                "Activate Account"
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("OTP");
                resetError();
              }}
              className="w-full text-sm text-gray-500 hover:text-gray-700 hover:underline"
            >
              â† Back to OTP entry
            </button>
          </form>
        );

      // â”€â”€ Step 4: Success â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case "SUCCESS":
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Account Activated!
            </h2>
            <p className="text-gray-600 mb-8 text-sm">
              Your password has been set successfully.
              <br />
              You can now sign in anytime using your email and password.
            </p>
            <button
              onClick={() => navigate("/principal/dashboard")}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
            >
              Go to Dashboard
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col items-center justify-center p-4">
      {/* Header + progress */}
      <div className="mb-8 text-center">
        <img
          src="/achariya-logo.jpg"
          alt="Achariya"
          className="h-16 mx-auto mb-4 object-contain"
        />
        <h1 className="text-lg font-semibold text-gray-700">
          {isForgotMode
            ? "Principal Password Reset"
            : "Principal Account Activation"}
        </h1>

        {/* Progress dots */}
        <div className="flex items-center gap-2 justify-center mt-3">
          {steps.map((s, i) => {
            const isActive = i <= currentIndex;
            return (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isActive ? "w-8 bg-emerald-600" : "w-2 bg-gray-300"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
        {/* Decorative accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-16 -mt-16 opacity-60 pointer-events-none" />

        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {renderStep()}
      </div>

      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to="/principal/login"
            className="text-emerald-600 font-medium hover:underline"
          >
            Sign in here
          </Link>
        </p>
        <Link
          to="/"
          className="block text-sm text-gray-400 hover:text-gray-600"
        >
          â† Back to Home
        </Link>
      </div>
    </div>
  );
};

export default PrincipalActivate;
