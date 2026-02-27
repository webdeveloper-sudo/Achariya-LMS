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
  Zap,
  Heart,
  GraduationCap,
  Folder,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.selectedRole || user.role;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  // Robust Role Determination: Use localStorage, fallback to URL path
  let currentRole = role;
  if (!currentRole) {
    if (location.pathname.startsWith("/student")) currentRole = "Student";
    else if (location.pathname.startsWith("/teacher")) currentRole = "Teacher";
    else if (location.pathname.startsWith("/principal"))
      currentRole = "Principal";
    else if (location.pathname.startsWith("/admin")) currentRole = "Admin";
  }

  // Role-based theme configuration
  const themeColors = {
    Student: {
      primary: "blue-900",
      bg: "bg-blue-900",
      text: "text-blue-900",
      shadow: "shadow-blue-900/20",
      hover: "hover:bg-blue-50",
      border: "border-blue-100",
      decoration: "decoration-blue-200",
    },
    Teacher: {
      primary: "red-600",
      bg: "bg-red-600",
      text: "text-red-600",
      shadow: "shadow-red-600/20",
      hover: "hover:bg-red-50",
      border: "border-red-100",
      decoration: "decoration-red-200",
    },
    Principal: {
      primary: "emerald-600",
      bg: "bg-emerald-600",
      text: "text-emerald-600",
      shadow: "shadow-emerald-600/20",
      hover: "hover:bg-emerald-50",
      border: "border-emerald-100",
      decoration: "decoration-emerald-200",
    },
    Admin: {
      primary: "slate-900",
      bg: "bg-slate-900",
      text: "text-slate-900",
      shadow: "shadow-slate-900/20",
      hover: "hover:bg-slate-50",
      border: "border-slate-100",
      decoration: "decoration-slate-200",
    },
  };

  const normalizedRole = currentRole
    ? currentRole.charAt(0).toUpperCase() + currentRole.slice(1).toLowerCase()
    : "Student";

  const theme =
    themeColors[normalizedRole as keyof typeof themeColors] ||
    themeColors.Student;

  const getNavItems = () => {
    switch (normalizedRole) {
      case "Student":
        return [
          { to: "/student/dashboard", icon: Home, label: "Dashboard" },
          { to: "/student/courses", icon: BookOpen, label: "Courses" },
          { to: "/student/leaderboard", icon: Award, label: "Leaderboard" },
          { to: "/student/challenges", icon: Target, label: "Challenges" },
          // { to: "/student/rivals", icon: Swords, label: "Rivals" },
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
    <div
      className={`min-h-screen transition-colors duration-300 ${currentRole?.toLowerCase()}-context`}
    >
      {/* Top Navigation */}
      <nav className="bg-white sticky top-0 z-40 border-b border-300  shadow-[0_2px_15px_-3px_rgba(0,0,0,0.2),0_4px_6px_-2px_rgba(0,0,0,0.02)]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-slate-50 p-1.5 shadow-sm border border-slate-100">
                  <img
                    src="/achariya-logo.jpg"
                    alt="Achariya"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tighter leading-none uppercase">
                    Achariya <span className={theme.text}>Portal</span>
                  </h1>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${theme.bg} animate-pulse`}
                    ></span>
                    {normalizedRole} Environment
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6">
              <div className="hidden sm:flex items-center group">
                <Link
                  to={
                    normalizedRole === "Student"
                      ? `/student/profile/${user.id || user._id}`
                      : "#"
                  }
                  className="flex items-center gap-4 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-[0_0_15px_rgba(0,0,0,0.05)] transition-transform group-hover:scale-105">
                      <img
                        src={user.avatar || "/achariya-logo.jpg"}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-black text-slate-800 hidden md:inline leading-none uppercase tracking-tight">
                      {user.name || user.email}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 hidden md:inline mt-1.5 uppercase tracking-widest">
                      Institutional Account
                    </span>
                  </div>
                </Link>
              </div>
              <div className="h-10 w-[1px] bg-slate-200/60 hidden sm:block"></div>
              <button
                onClick={handleLogout}
                className="group flex items-center gap-2 px-5 py-2.5 text-[11px] uppercase tracking-[0.15em] font-black text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-95"
              >
                <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                <span className="hidden sm:inline">Terminate Session</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex overflow-hidden min-h-screen">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:flex flex-col bg-white fixed left-0 top-0 bottom-0 z-30 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] border-r border-gray-300 ${
            isCollapsed ? "w-[88px]" : "w-[320px]"
          }`}
        >
          {/* Sidebar Header Space */}
          <div className="h-20 flex items-center justify-center mb-6 pt-4">
            {!isCollapsed && (
              <div className="flex items-center gap-4 px-8 w-full">
                <div
                  className={`w-10 h-10 rounded-xl ${theme.bg} flex items-center justify-center shrink-0 shadow-lg ${theme.shadow}`}
                >
                  <GraduationCap className="text-white w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-900 font-black tracking-tighter text-sm uppercase leading-none">
                    Workspace
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Control Panel
                  </span>
                </div>
              </div>
            )}
            {isCollapsed && (
              <div
                className={`w-10 h-10 rounded-xl ${theme.bg} flex items-center justify-center shadow-lg ${theme.shadow}`}
              >
                <GraduationCap className="text-white w-5 h-5" />
              </div>
            )}
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar py-2">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`group relative flex items-center h-12 rounded-sm transition-all duration-300 outline-none ${
                    isActive
                      ? `${theme.bg} ${theme.shadow} text-white`
                      : `text-slate-500 hover:bg-slate-50 hover:text-slate-900`
                  } ${isCollapsed ? "justify-center" : "px-5"}`}
                  title={isCollapsed ? item.label : ""}
                >
                  <item.icon
                    className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "group-hover:scale-110 transition-transform duration-300"}`}
                  />

                  {!isCollapsed && (
                    <span
                      className={`ml-4 text-[14px] text-gray-500 ${isActive ? "text-white" : "group-hover:scale-110 transition-transform duration-300"}`}
                    >
                      {item.label}
                    </span>
                  )}

                  {isActive && isCollapsed && (
                    <div className="absolute right-0 top-3 bottom-3 w-1 bg-white rounded-l-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Toggle */}
          <div className="p-4 mt-auto">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full flex items-center justify-center h-12 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all duration-300"
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <div className="flex items-center gap-3 px-4 w-full">
                  <ChevronLeft className="w-5 h-5 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Minify Navigation
                  </span>
                </div>
              )}
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute left-0 top-0 bottom-0 w-[min(90vw,300px)] bg-white shadow-2xl flex flex-col p-6 animate-in slide-in-from-left duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
              <div className="flex items-center justify-between mb-10 px-2 h-12">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl ${theme.bg} flex items-center justify-center shadow-lg ${theme.shadow}`}
                  >
                    <GraduationCap className="text-white w-5 h-5" />
                  </div>
                  <span className="text-slate-900 font-black tracking-tighter text-lg uppercase">
                    Menu
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
                {navItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center h-13 px-5 rounded-xl transition-all duration-300 ${
                        isActive
                          ? `${theme.bg} text-white shadow-lg ${theme.shadow}`
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <item.icon className="w-5 h-5 mr-4" />
                      <span className="font-black text-[12px] uppercase tracking-widest">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-6 border-t border-slate-100 mt-auto">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full h-12 px-5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                >
                  <LogOut className="w-5 h-5 mr-4" />
                  <span className="font-black text-[12px] uppercase tracking-widest">
                    Terminate Session
                  </span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <main
          className={`flex-1 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] min-h-screen lg:ml-0 ${
            isCollapsed ? "lg:ml-[88px]" : "lg:ml-[320px]"
          } grid-pattern-overlay`}
        >
          <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12 w-full">
            <GlobalQuizListener />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
