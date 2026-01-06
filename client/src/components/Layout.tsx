import GlobalQuizListener from "./GlobalQuizListener";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LogOut,
  Home,
  BookOpen,
  Wallet,
  Award,
  Users,
  FileText,
  Settings,
  HelpCircle,
  Menu,
  X,
  ShoppingCart,
  Target,
  TrendingUp,
  Swords,
  Zap,
  Heart,
  GraduationCap,
  Folder,
} from "lucide-react";
import { useState, useEffect } from "react";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.selectedRole || user.role;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    // Reset theme to light mode on logout
    localStorage.setItem("theme", "light");
    document.documentElement.setAttribute("data-theme", "light");

    // Clear all user data
    localStorage.clear();

    // Navigate to login
    navigate("/");
  };

  useEffect(() => {
    setSidebarOpen(false); // Close sidebar on route change
  }, [location.pathname]);

  const getNavItems = () => {
    switch (role) {
      case "Student":
        return [
          { to: "/student/dashboard", icon: Home, label: "Dashboard" },
          { to: "/student/courses", icon: BookOpen, label: "Courses" },
          { to: "/student/leaderboard", icon: Award, label: "Leaderboard" },
          { to: "/student/challenges", icon: Target, label: "Challenges" },
          { to: "/student/rivals", icon: Swords, label: "Rivals" },
          { to: "/student/social", icon: Heart, label: "Social" },
          { to: "/student/powerups", icon: Zap, label: "Power-Ups" },
          { to: "/student/progress", icon: TrendingUp, label: "Progress" },
          {
            to: "/student/marketplace",
            icon: ShoppingCart,
            label: "Marketplace",
          },
          { to: "/student/badges", icon: Award, label: "Badges" },
          { to: "/student/wallet", icon: Wallet, label: "Wallet" },
          { to: "/student/faq", icon: HelpCircle, label: "FAQ" },
        ];
      case "Teacher":
        return [
          { to: "/teacher/dashboard", icon: Home, label: "Dashboard" },
          { to: "/teacher/courses", icon: BookOpen, label: "Courses" },
          {
            to: "/teacher/evidence-submit",
            icon: FileText,
            label: "Submit Evidence",
          },
          { to: "/teacher/faq", icon: HelpCircle, label: "FAQ" },
        ];
      case "Principal":
        return [
          { to: "/principal/dashboard", icon: Home, label: "Dashboard" },
          { to: "/principal/courses", icon: BookOpen, label: "Courses" },
          {
            to: "/principal/evidence-approval",
            icon: FileText,
            label: "Evidence Approval",
          },
          { to: "/principal/faq", icon: HelpCircle, label: "FAQ" },
        ];
      case "Admin":
        return [
          { to: "/admin/dashboard", icon: Home, label: "Dashboard" },
          { to: "/admin/courses", icon: BookOpen, label: "Courses" },
          { to: "/admin/users", icon: GraduationCap, label: "Students" },
          { to: "/admin/teachers", icon: Users, label: "Teachers" },
          { to: "/admin/assets", icon: Folder, label: "Manage Assets" },
          { to: "/admin/config", icon: Settings, label: "Config" },
          { to: "/admin/faq", icon: HelpCircle, label: "FAQ" },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3 flex items-center justify-center">
                <img
                  src="/achariya-logo.jpg"
                  alt="Achariya"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-gray-800">
                  Achariya Portal
                </h1>
                <p className="text-xs text-gray-500">{role}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Hide user name on very small screens */}
              <div className="hidden sm:flex items-center">
                <div className="w-8 h-8 mr-2 rounded-full overflow-hidden border-2 border-gray-200">
                  <img
                    src="/achariya-logo.jpg"
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm text-gray-700 hidden md:inline">
                  {user.name || user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-2 sm:px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Desktop Sidebar - MADE STICKY/FIXED */}
        <aside className="hidden lg:block w-64 bg-white border-r fixed left-0 top-16 bottom-0 overflow-y-auto z-20">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Mobile Sidebar stays as overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-gray-800 opacity-75"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white overflow-y-auto">
              <div className="p-4 flex justify-end">
                <button onClick={() => setSidebarOpen(false)} className="p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="px-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content - ADD LEFT MARGIN FOR SIDEBAR */}
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
          <GlobalQuizListener />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
