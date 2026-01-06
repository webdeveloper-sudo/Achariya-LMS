import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Mail,
  Smartphone,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { studentAuthApi } from "../../api";
import { useStudentStore } from "../../store/useStudentStore";

// Steps enum
type Step =
  | "ADMISSION_VERIFY"
  | "CONTACT_SELECT"
  | "OTP_VERIFY"
  | "PASSWORD_CREATE"
  | "SUCCESS";

const StudentOnboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("ADMISSION_VERIFY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data State
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [studentData, setStudentData] = useState<{
    maskedEmail: string;
    maskedPhone: string;
    studentId: string;
  } | null>(null);
  const [selectedContact, setSelectedContact] = useState<"email" | "mobile">(
    "email"
  );
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Handlers
  const handleInformationVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await studentAuthApi.checkAdmission(admissionNumber);

      // The controller returns: { message: "Student found", student: { ... } }
      const data = response.data;

      if (data && data.student) {
        if (data.student.onboarded) {
          alert("Account already activated! Please log in.");
          navigate("/student/login");
          return;
        }

        setStudentData({
          maskedEmail: data.student.maskedEmail || "N/A",
          maskedPhone: data.student.maskedMobile || "N/A", // Controller returns maskedMobile
          studentId: data.student.admissionNo,
        });
        setStep("CONTACT_SELECT");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      console.error("Admission Verification Error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Admission number not found."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      await studentAuthApi.sendOtp(admissionNumber, selectedContact);
      setStep("OTP_VERIFY");
    } catch (err: any) {
      console.error("Send OTP Error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to send OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await studentAuthApi.verifyOtp(admissionNumber, otp);
      setStep("PASSWORD_CREATE");
    } catch (err: any) {
      console.error("Verify OTP Error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await studentAuthApi.completeOnboarding({
        admissionNumber,
        password,
      });

      // Save token immediately so they are logged in
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        if (response.data.student) {
          const user = {
            ...response.data.student,
            role: "Student",
            email: response.data.student.email,
          };
          // Update global store
          useStudentStore.getState().login(user, response.data.token);
        }
      }

      setStep("SUCCESS");
    } catch (err: any) {
      console.error("Onboarding Complete Error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create account."
      );
    } finally {
      setLoading(false);
    }
  };

  // Render Steps
  const renderStep = () => {
    switch (step) {
      case "ADMISSION_VERIFY":
        return (
          <form onSubmit={handleInformationVerify} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Verify Identity
              </h2>
              <p className="text-gray-500">
                Enter your admission number to begin
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admission Number
              </label>
              <input
                type="text"
                value={admissionNumber}
                onChange={(e) => setAdmissionNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="ST-2024-XXXX"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !admissionNumber}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Verify <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        );

      case "CONTACT_SELECT":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Verification Method
              </h2>
              <p className="text-gray-500">
                Select where you want to receive the OTP
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setSelectedContact("email")}
                className={`w-full p-4 border rounded-xl flex items-center justify-between transition-all ${
                  selectedContact === "email"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      selectedContact === "email"
                        ? "bg-blue-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <Mail size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Email</div>
                    <div className="text-sm opacity-75">
                      {studentData?.maskedEmail}
                    </div>
                  </div>
                </div>
                {selectedContact === "email" && (
                  <CheckCircle size={20} className="text-blue-600" />
                )}
              </button>

              <button
                onClick={() => setSelectedContact("mobile")}
                className={`w-full p-4 border rounded-xl flex items-center justify-between transition-all ${
                  selectedContact === "mobile"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      selectedContact === "mobile"
                        ? "bg-blue-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <Smartphone size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Mobile</div>
                    <div className="text-sm opacity-75">
                      {studentData?.maskedPhone}
                    </div>
                  </div>
                </div>
                {selectedContact === "mobile" && (
                  <CheckCircle size={20} className="text-blue-600" />
                )}
              </button>
            </div>

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Send OTP <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        );

      case "OTP_VERIFY":
        return (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Enter OTP</h2>
              <p className="text-gray-500">
                We sent a 6-digit code to{" "}
                {selectedContact === "email"
                  ? studentData?.maskedEmail
                  : studentData?.maskedPhone}
              </p>
            </div>
            <div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="------"
                maxLength={6}
                required
              />
              {/* Dev help text removed for production */}
            </div>
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Verify Code"}
            </button>
            <button
              type="button"
              onClick={() => setStep("CONTACT_SELECT")}
              className="w-full text-blue-600 text-sm hover:underline"
            >
              Back to contact selection
            </button>
          </form>
        );

      case "PASSWORD_CREATE":
        return (
          <form onSubmit={handleComplete} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Secure Your Account
              </h2>
              <p className="text-gray-500">Create a strong password</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Min 6 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
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
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Retype password"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password Strength/Validation Hints could go here */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Complete Setup"
              )}
            </button>
          </form>
        );

      case "SUCCESS":
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              You're All Set!
            </h2>
            <p className="text-gray-600 mb-8">
              Your account has been successfully verified and secured.
              <br />
              You've earned <strong>5 credits</strong> for onboarding!
            </p>
            <Link
              to="/student/dashboard"
              className="inline-block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200"
            >
              Go to Dashboard
            </Link>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <img
          src="/achariya-logo.jpg"
          alt="Achariya"
          className="h-16 mx-auto mb-4"
        />
        <div className="flex items-center gap-2 justify-center">
          {/* Progress Dots */}
          {[
            "ADMISSION_VERIFY",
            "CONTACT_SELECT",
            "OTP_VERIFY",
            "PASSWORD_CREATE",
            "SUCCESS",
          ].map((s, i) => {
            const steps = [
              "ADMISSION_VERIFY",
              "CONTACT_SELECT",
              "OTP_VERIFY",
              "PASSWORD_CREATE",
              "SUCCESS",
            ];
            const currentIndex = steps.indexOf(step);
            const isActive = i <= currentIndex;
            return (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isActive ? "w-8 bg-blue-600" : "w-2 bg-gray-300"
                }`}
              />
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 opacity-50 pointer-events-none" />

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 flex items-start gap-2">
            <span className="mt-0.5">⚠️</span> {error}
          </div>
        )}

        {renderStep()}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to="/student/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default StudentOnboarding;
