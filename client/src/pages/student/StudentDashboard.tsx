import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { sampleData } from "../../data/sampleData";
import StudentChatbot from "../../components/StudentChatbot";
import StreakWidget from "../../components/StreakWidget";
import SuggestedActions from "../../components/SuggestedActions";
import CalendarHeatmapComponent from "../../components/CalendarHeatmap";
import axiosInstance from "../../api/axiosInstance";
import {
  BookOpen,
  Award,
  TrendingUp,
  Wallet,
  PlayCircle,
  ChevronRight,
  GraduationCap,
  Flame,
} from "lucide-react";
import ChartsAndUnitsGrid from "../../components/ChartsAndUnitsGrid";
import RecentCoursesCarousel from "../../components/RecentCoursesCarousel";

import { studentApi } from "../../api";

const StudentDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // State for dashboard data
  const [student, setStudent] = useState<any>(
    sampleData.students.find((s) => s.email === user.email) ||
      sampleData.students[0],
  );
  const [enrollments, setEnrollments] = useState<any[]>(
    sampleData.enrollments.filter((e) => e.student_id === student.id),
  );
  const [currentStreak, setCurrentStreak] = useState(
    student.currentStreak || 0,
  );
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dashboardRes, coursesRes, progressRes] = await Promise.all([
          studentApi.getDashboard(),
          studentApi.getCourses(),
          axiosInstance.get("/students/progress"),
        ]);

        if (dashboardRes.data?.profile) {
          setStudent((prev: any) => ({
            ...prev,
            ...dashboardRes.data.profile,
          }));
          setCurrentStreak(dashboardRes.data.profile.currentStreak || 0);
        }

        if (coursesRes.data?.courses) {
          setEnrollments(coursesRes.data.courses);
        }

        if (progressRes.data) {
          setProgressData(progressRes.data);
        }
      } catch (error: any) {
        console.error("Dashboard data fetch error:", error);
        if (error.response?.status === 404 || error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("role");
          window.location.href = "/student/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const avgCompletion =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) /
            enrollments.length,
        )
      : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-12 h-12 border-2 border-gray-100 border-t-blue-900 rounded-full animate-spin"></div>
        <p className="text-[14px] font-bold text-gray-400 uppercase tracking-widest">
          Synchronizing Academic Workspace...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header Section - Industrial Academic Refinement */}
      <div className="border-b border-gray-100  pb-8 px-6 sm:px-10 relative overflow-hidden">
        <div className="w-full mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-blue-900 font-bold tracking-widest text-[14px] uppercase">
                  Institutional Student Hub
                </span>
                <div className=" ">
                  <GraduationCap className="w-5 h-5 text-blue-900" />
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl underline decoration-gray-200 underline-offset-8 font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                {getTimeGreeting()},{" "}
                <span className="text-gray-400 underline decoration-gray-200 underline-offset-8">
                  {student.name.split(" ")[0]}
                </span>
              </h1>
              <p className="text-gray-500 text-sm font-medium max-w-xl leading-relaxed ">
                Strategic objective monitoring and curriculum synchronization.
                Your current academic trajectory shows consistent performance
                across active modules.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/student/courses"
                  className="bg-blue-900 text-white px-8 py-3.5 rounded-sm  text-[14px] uppercase tracking-widest hover:bg-blue-900 transition shadow-sm flex items-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" /> Resume Learning
                </Link>
                <Link
                  to="/student/progress"
                  className="bg-white text-gray-700 border border-gray-300 px-8 py-3.5 rounded-sm  text-[14px] uppercase tracking-widest hover:bg-gray-50 transition flex items-center gap-2"
                >
                  Full Analytics <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            {/* {recentCourse && (
              <div className="w-full lg:w-96 bg-white p-8 rounded-md border border-gray-300 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-blue-900 text-[14px] tracking-widest mb-4 flex items-center gap-2">
                    <Star size={12} className="fill-blue-900" /> Current
                    Academic Objective
                  </p>
                  <h3 className="text-xl  text-gray-900 mb-8 line-clamp-2 tracking-tight">
                    {recentCourse.title}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-[14px]  uppercase tracking-widest">
                      <span className="text-gray-700">
                        Synchronization Level
                      </span>
                      <span className="text-blue-900">
                        {recentCourse.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-50 rounded-full h-1.5 overflow-hidden border border-gray-100">
                      <div
                        className="bg-blue-900 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                        style={{ width: `${recentCourse.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gray-50 rounded-full -z-0"></div>
              </div>
            )} */}

            <div className="flex justify-end items-center gap-6">
              <div>
                <div className="flex items-baseline justify-end gap-2">
                  <h3 className="text-6xl font-bold text-gray-900 tracking-tighter">
                    {currentStreak}
                  </h3>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Days
                  </span>
                </div>
                <p className="text-[13px] text-blue-900 animate-pulse uppercase tracking-widest mt-1 flex items-end gap-1">
                  <Flame className="w-7 h-7 text-blue-900 " /> Active Sync
                  Streak
                </p>
              </div>
            </div>
          </div>
          {/* Heatmap Section - Premium GitHub-Style Standalone Row */}
          <div className="animate-in pt-10 fade-in duration-1000">
            {progressData ? (
              <CalendarHeatmapComponent data={progressData.heatmapData} />
            ) : (
              <div className="bg-white rounded-sm p-10 border border-gray-300 shadow-sm animate-pulse flex flex-col items-center justify-center min-h-[160px]">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-900 rounded-full animate-spin mb-4"></div>
                <p className="text-[14px] text-gray-500 uppercase tracking-widest font-bold">
                  Compiling Academic Heatmap...
                </p>
              </div>
            )}
          </div>
          <div className="w-full pt-10 pb-2">
            <StreakWidget currentStreak={currentStreak} />
          </div>
        </div>
      </div>
      {/* Stats Grid - Enhanced Professional Look */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-10 pb-10">
        {[
          {
            label: "Curriculum Units",
            val: enrollments.length,
            icon: BookOpen,
            color: "blue",
            link: "/student/courses",
            suffix: null,
          },
          {
            label: "Average Stand",
            val: `${avgCompletion}`,
            icon: TrendingUp,
            color: "blue",
            link: "/student/progress",
            suffix: "%",
          },
          {
            label: "Academic Credits",
            val: `${student.credits || 0}`,
            icon: Wallet,
            color: "blue",
            link: "/student/wallet",
            suffix: "Cr",
          },
          {
            label: "Mastery Badges",
            val: Array.isArray(student.badges)
              ? student.badges.length
              : student.badges || 0,
            icon: Award,
            color: "blue",
            suffix: null,
            link: "/student/badges",
          },
        ].map((stat, i) => (
          <Link
            key={i}
            to={stat.link}
            className="group bg-white rounded-md p-8 border border-gray-300 shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-300"
          >
            <div className="flex justify-between items-center">
              <div className="border border-blue-900 p-3 text-gray-500 rounded-[100%] flex items-center justify-start mb-6 group-hover:text-blue-900 transition-all duration-300 lucide-icon-container">
                <stat.icon
                  size={22}
                  className="group-hover:scale-110 transition-transform"
                />
              </div>
              <p className="text-5xl font-bold text-gray-900 tracking-tighter">
                {stat.val} <span className="text-[14px]">{stat.suffix}</span>
              </p>
            </div>
            <p className="text-[14px]  text-gray-600 uppercase tracking-widest mb-3 group-hover:text-blue-900 transition-colors">
              {stat.label}
            </p>
          </Link>
        ))}
      </div>

      <div className="container px-10 pb-24 relative z-20 space-y-12">
        {/* Recently Enrolled Courses Carousel */}
        <div className="animate-in fade-in duration-700 delay-100">
          <RecentCoursesCarousel courses={enrollments} isLoading={loading} />
        </div>

        {/* Suggested Actions Placeholder */}
        <div className="animate-in fade-in duration-700">
          <SuggestedActions />
        </div>

        {/* Main Analytics Row - Modularized Charts */}
        <div className="animate-in fade-in duration-700">
          {progressData ? (
            <ChartsAndUnitsGrid data={progressData} />
          ) : (
            <div className="bg-white rounded-md p-10 border border-gray-300 shadow-sm animate-pulse flex items-center justify-center min-h-[300px]">
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                Synchronizing Dashboard Analytics...
              </p>
            </div>
          )}
        </div>

        {/* Secondary Grid: Streak and Milestone */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-md p-10 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center border border-yellow-100 shadow-sm shrink-0">
                <Award size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-tight">
                  Institutional Milestone
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium max-w-sm">
                  Strategic performance noted. You are 2 active days away from
                  the{" "}
                  <span className="text-blue-900 font-bold">
                    Academic Pro Distinction
                  </span>
                  .
                </p>
              </div>
            </div>
            <Link
              to="/student/badges"
              className="px-10 py-4 bg-gray-900 text-white rounded-md font-bold text-[14px] uppercase tracking-widest hover:bg-blue-900 transition shadow-sm whitespace-nowrap"
            >
              Curriculum Recognition
            </Link>
          </div>
        </div>
      </div>

      <StudentChatbot
        studentId={student.id || student._id}
        studentName={student.name}
      />
    </div>
  );
};

export default StudentDashboard;
