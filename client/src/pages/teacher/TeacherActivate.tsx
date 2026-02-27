import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  User,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Key,
} from "lucide-react";
import { teacherAuthApi } from "../../api";
import { useTeacherStore } from "../../store/useTeacherStore";

type Step = "IDENTIFY" | "OTP" | "PASSWORD" | "SUCCESS";

const TeacherActivate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useTeacherStore();

  const [step, setStep] = useState<Step>("IDENTIFY");
  const [identifier, setIdentifier] = useState("");
  const [teacherInfo, setTeacherInfo] = useState<any>(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpTimer, setOtpTimer] = useState(0);

  const isForgotMode = searchParams.get("mode") === "forgot";

  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await teacherAuthApi.verifyAccount(identifier);
      setTeacherInfo(response.data?.teacher);
      setStep("OTP");
      handleSendOtp(identifier);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Profile not found. Please contact Admin.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (id: string) => {
    setError(null);
    try {
      const res = await teacherAuthApi.sendOtp(id);
      setOtpTimer(60);
      // In dev mode, OTP might be returned in the response
      if (res.data?.devOtp) {
        console.log("DEV OTP:", res.data.devOtp);
      }
    } catch (err: any) {
      setError("Failed to send OTP. Please try again.");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length < 6) return;

    setError(null);
    setLoading(true);

    try {
      await teacherAuthApi.verifyOtp(identifier, otpString);
      setStep("PASSWORD");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const otpString = otp.join("");
      if (isForgotMode) {
        await teacherAuthApi.resetPassword({
          email: teacherInfo?.email || identifier,
          otp: otpString,
          newPassword: password,
        });
        setStep("SUCCESS");
      } else {
        const response = await teacherAuthApi.completeActivation({
          identifier,
          otp: otpString,
          password,
        });

        if (response.data?.token) {
          login(response.data.user, response.data.token);
          setStep("SUCCESS");
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to finalize account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex flex-col items-center justify-center p-4 teacher-context">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <img
            src="/achariya-logo.jpg"
            alt="Logo"
            className="w-16 h-16 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">
            {isForgotMode ? "Reset Password" : "Account Activation"}
          </h1>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-between mb-8 px-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  (s === 1 && step === "IDENTIFY") ||
                  (s === 2 && step === "OTP") ||
                  (s === 3 && step === "PASSWORD") ||
                  step === "SUCCESS"
                    ? "bg-[#C72323] text-white ring-4 ring-red-100"
                    : s < (step === "OTP" ? 2 : step === "PASSWORD" ? 3 : 1)
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {s < (step === "OTP" ? 2 : step === "PASSWORD" ? 3 : 1) ||
                step === "SUCCESS" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  s
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-[#C72323]">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium">
              <ShieldCheck size={20} className="shrink-0" />
              {error}
            </div>
          )}

          {step === "IDENTIFY" && (
            <form
              onSubmit={handleIdentify}
              className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Step 1: Identify Yourself
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Enter your registered Email or Employee ID.
                </p>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C72323]/20 focus:border-[#C72323] outline-none transition-all"
                    placeholder="Email or Employee ID"
                  />
                </div>
              </div>
              <button
                disabled={loading}
                className="w-full bg-[#C72323] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#A01D1D] transition-all disabled:bg-gray-400 shadow-lg shadow-red-600/10"
              >
                {loading ? (
                  "Verifying..."
                ) : (
                  <>
                    Continue <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          )}

          {step === "OTP" && (
            <form
              onSubmit={handleVerifyOtp}
              className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Step 2: Verify OTP
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  We've sent a 6-digit code to{" "}
                  <span className="font-semibold text-gray-700">
                    {teacherInfo?.email?.slice(0, 3)}***@***.com
                  </span>
                </p>

                <div className="flex justify-between gap-2 mb-6">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !digit && idx > 0) {
                          document.getElementById(`otp-${idx - 1}`)?.focus();
                        }
                      }}
                      className="w-full h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-[#C72323] focus:ring-4 focus:ring-[#C72323]/10 outline-none transition-all"
                    />
                  ))}
                </div>

                <div className="text-center">
                  {otpTimer > 0 ? (
                    <p className="text-sm text-gray-500">
                      Resend in {otpTimer}s
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp(identifier)}
                      className="text-sm font-bold text-[#C72323] hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("IDENTIFY")}
                  className="px-4 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200"
                >
                  <ArrowLeft size={20} />
                </button>
                <button
                  disabled={loading || otp.join("").length < 6}
                  className="flex-1 bg-[#C72323] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#A01D1D] transition-all disabled:bg-gray-300"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            </form>
          )}

          {step === "PASSWORD" && (
            <form
              onSubmit={handleSetPassword}
              className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Step 3: Secure Your Account
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Create a strong password for your portal access.
                </p>

                <div className="space-y-4">
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:border-[#C72323] focus:ring-4 focus:ring-[#C72323]/10 outline-none transition-all"
                      placeholder="New Password"
                    />
                  </div>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:border-[#C72323] focus:ring-4 focus:ring-[#C72323]/10 outline-none transition-all"
                      placeholder="Confirm Password"
                    />
                  </div>
                </div>
              </div>

              <button
                disabled={loading}
                className="w-full bg-[#C72323] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#A01D1D] transition-all disabled:bg-gray-400"
              >
                {loading ? (
                  "Saving..."
                ) : (
                  <>
                    {isForgotMode ? "Reset Password" : "Activate Account"}{" "}
                    <Key size={20} />
                  </>
                )}
              </button>
            </form>
          )}

          {step === "SUCCESS" && (
            <div className="space-y-6 text-center animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={40} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Success!</h2>
                <p className="text-gray-600 mt-2">
                  {isForgotMode
                    ? "Your password has been updated. You can now login with your new credentials."
                    : "Your account is now active. Welcome to the Achariya Educator Portal!"}
                </p>
              </div>
              <button
                onClick={() => navigate("/teacher/dashboard")}
                className="w-full bg-[#C72323] text-white py-3.5 rounded-xl font-bold hover:bg-[#A01D1D] transition-all shadow-lg shadow-red-600/20"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/teacher/login"
            className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherActivate;
