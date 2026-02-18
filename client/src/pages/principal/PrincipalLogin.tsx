import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

type Step = "email" | "otp";

const PrincipalLogin = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null); // For dev/demo fallback

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await axiosInstance.post("/principals/auth/send-otp", {
        email,
      });
      setSuccessMsg(res.data.message || "OTP sent to your email.");
      if (res.data.devOtp) {
        setDevOtp(res.data.devOtp); // Show in dev mode
      }
      setStep("otp");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Failed to send OTP. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await axiosInstance.post("/principals/auth/verify-otp", {
        email,
        otp,
      });

      const { token, user } = res.data;

      // Persist session
      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, selectedRole: "Principal" }),
      );

      navigate("/principal/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Invalid or expired OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    setSuccessMsg(null);
    setDevOtp(null);
    setLoading(true);
    try {
      const res = await axiosInstance.post("/principals/auth/send-otp", {
        email,
      });
      setSuccessMsg("OTP resent successfully.");
      if (res.data.devOtp) setDevOtp(res.data.devOtp);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/achariya-logo.jpg"
            alt="Achariya Logo"
            className="w-20 h-20 mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl font-bold text-gray-900">Principal Login</h1>
          <p className="text-gray-500 mt-2">
            {step === "email"
              ? "Enter your registered email to receive an OTP."
              : `Enter the OTP sent to ${email}`}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Error */}
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success */}
          {successMsg && (
            <div className="mb-5 p-3 bg-green-50 border border-green-100 rounded-lg text-green-700 text-sm">
              ✅ {successMsg}
            </div>
          )}

          {/* Dev OTP hint */}
          {devOtp && (
            <div className="mb-5 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm font-mono">
              🛠 Dev OTP: <strong>{devOtp}</strong>
            </div>
          )}

          {/* Step 1: Email */}
          {step === "email" && (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400"
                    placeholder="your.email@achariya.org"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-semibold hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  "Sending OTP..."
                ) : (
                  <>
                    Send OTP <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  One-Time Password (OTP)
                </label>
                <div className="relative">
                  <ShieldCheck
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400 tracking-widest text-lg font-mono"
                    placeholder="000000"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-semibold hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  "Verifying..."
                ) : (
                  <>
                    Verify & Login <ShieldCheck size={20} />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                    setError(null);
                    setSuccessMsg(null);
                    setDevOtp(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Change email
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw size={14} />
                  Resend OTP
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrincipalLogin;
