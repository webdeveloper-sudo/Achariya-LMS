import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { teacherAuthApi } from "../../api";
import { useTeacherStore } from "../../store/useTeacherStore";

const TeacherLogin = () => {
  const navigate = useNavigate();
  const { login } = useTeacherStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await teacherAuthApi.login(email, password);

      const token = response.data?.token;
      if (token && response.data?.user) {
        const user = response.data.user;
        login(user, token);

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        navigate("/teacher/dashboard");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Invalid email or password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex flex-col items-center justify-center p-4 teacher-context">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/achariya-logo.jpg"
            alt="Achariya Logo"
            className="w-20 h-20 mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl font-bold text-gray-900">Teacher Login</h1>
          <p className="text-gray-500 mt-2">Educator Portal Access</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-[#C72323]">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm font-medium">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C72323]/20 focus:border-[#C72323] transition-all placeholder:text-gray-400"
                  placeholder="name@achariya.org"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  to="/teacher/activate?mode=forgot"
                  className="text-sm text-[#C72323] hover:text-[#A01D1D] font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C72323]/20 focus:border-[#C72323] transition-all placeholder:text-gray-400"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C72323] text-white py-3.5 rounded-xl font-semibold hover:bg-[#A01D1D] active:bg-[#801717] transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  Sign In <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-600 text-sm">
              Not activated your account yet?{" "}
              <Link
                to="/teacher/activate"
                className="text-[#C72323] font-semibold hover:text-[#A01D1D] hover:underline"
              >
                Activate your account here
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Role Selection
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;
