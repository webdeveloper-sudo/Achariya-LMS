import { useNavigate } from "react-router-dom";
import { User, GraduationCap, Users, Settings, ArrowRight } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  const selectRole = (role: string) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    user.selectedRole = role;
    localStorage.setItem("user", JSON.stringify(user));

    if (role === "Student") {
      navigate("/student/login"); // Student specific flow
    } else {
      // Keep existing minimal flow for others for now or redirect to their specific login
      // For now, map to legacy login or direct dashboard if reusing previous logic
      // But prompt implies separate access. We'll stick to a simple mapping.
      // Actually, if they select Teacher/Principal/Admin they might need to login too.
      // The prompt says "Student Login (Returning Users)..." implying separate page.
      // I'll send others to the generic login page or their specific dashboards if "demo" mode persists.
      // Let's settle on sending non-students to the main login for now, or handle them later.
      navigate("/login");
    }
  };

  const roles = [
    {
      id: "student",
      name: "Student",
      icon: GraduationCap,
      description: "Access learning materials, quizzes, and track progress",
      color: "from-blue-500 to-blue-600",
      textColor: "text-blue-600",
      bg: "bg-blue-50",
      action: () => navigate("/student/login"),
    },
    {
      id: "teacher",
      name: "Teacher",
      icon: User,
      description: "Manage classes, students, and assessments",
      color: "from-green-500 to-green-600",
      textColor: "text-green-600",
      bg: "bg-green-50",
      action: () => navigate("/login"),
    },
    {
      id: "principal",
      name: "Principal",
      icon: Users,
      description: "Oversee school performance and analytics",
      color: "from-purple-500 to-purple-600",
      textColor: "text-purple-600",
      bg: "bg-purple-50",
      action: () => navigate("/login"),
    },
    {
      id: "admin",
      name: "Admin",
      icon: Settings,
      description: "System configuration and user management",
      color: "from-gray-700 to-gray-800",
      textColor: "text-gray-700",
      bg: "bg-gray-50",
      action: () => navigate("/login"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-12 max-w-2xl">
        <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-2xl shadow-md flex items-center justify-center p-2">
          <img
            src="/achariya-logo.jpg"
            alt="Achariya Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">
          Welcome to <span className="text-blue-600">Achariya</span>
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Select your role to access your personalized learning dashboard.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl w-full px-4">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={role.action}
            className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 md:p-8 text-left border border-slate-100 hover:border-transparent overflow-hidden"
          >
            {/* Hover Gradient Background */}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${role.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
            />

            <div className="flex items-start justify-between relative z-10">
              <div className="flex-1">
                <div
                  className={`w-14 h-14 rounded-xl ${role.bg} ${role.textColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <role.icon className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors">
                  {role.name}
                </h2>
                <p className="text-slate-500 group-hover:text-slate-600 transition-colors">
                  {role.description}
                </p>
              </div>

              <div className="mt-2 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                <ArrowRight className={`w-6 h-6 ${role.textColor}`} />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-16 text-center text-slate-400 text-sm">
        <p>© 2025 Achariya Group of Institutions. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <a href="#" className="hover:text-slate-600 transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-slate-600 transition-colors">
            Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
