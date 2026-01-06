import { Link } from "react-router-dom";
import { BookOpen, Award, TrendingUp, Wallet } from "lucide-react";
import { sampleData } from "../../data/sampleData";
import { useState, useEffect } from "react";
import StudentChatbot from "../../components/StudentChatbot";
import CreditPopup from "../../components/CreditPopup";
import StreakWidget from "../../components/StreakWidget";
import SuggestedActions from "../../components/SuggestedActions";

import { studentApi } from "../../api";

const StudentDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // State for dashboard data
  const [student, setStudent] = useState<any>(
    sampleData.students.find((s) => s.email === user.email) ||
      sampleData.students[0]
  );
  const [enrollments, setEnrollments] = useState<any[]>(
    sampleData.enrollments.filter((e) => e.student_id === student.id)
  );

  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [creditReward, setCreditReward] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(
    student.currentStreak || 0
  );

  // Fetch real data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardPromise = studentApi.getDashboard();
        const coursesPromise = studentApi.getCourses();

        const [dashboardRes, coursesRes] = await Promise.all([
          dashboardPromise,
          coursesPromise,
        ]);

        if (dashboardRes.data && dashboardRes.data.profile) {
          setStudent((prev: any) => ({
            ...prev,
            ...dashboardRes.data.profile,
            name: dashboardRes.data.profile.name || prev.name,
            credits: dashboardRes.data.profile.credits || 0,
            badges: dashboardRes.data.profile.badges || 0,
          }));
          setCurrentStreak(dashboardRes.data.profile.currentStreak || 0);
        }

        if (coursesRes.data && coursesRes.data.courses) {
          // For now, assuming all visible courses are 'enrollments' or similar
          // since we don't have a separate enrollment endpoint yet.
          setEnrollments(coursesRes.data.courses);
        }
      } catch (error) {
        console.error(
          "Failed to fetch dashboard data, using local/sample data",
          error
        );
      }
    };

    fetchData();
  }, []);

  // Daily login credit system (Logic mostly handled by backend usually, but keeping frontend check as requested/legacy)
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const localStudentData = JSON.parse(
      localStorage.getItem("studentData") || "{}"
    );
    const lastLogin =
      localStudentData[student.id]?.lastLoginDate ||
      student.lastLoginDate ||
      "";

    if (lastLogin !== today) {
      // New day! Award credit
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      const wasYesterday = lastLogin === yesterdayStr;
      const newStreak = wasYesterday ? (student.currentStreak || 0) + 1 : 1;

      // Update student data locally (and ideally send to backend via dailyCheckIn API)
      const updatedStudent = { ...student };
      updatedStudent.credits = (updatedStudent.credits || 0) + 1;
      updatedStudent.currentStreak = newStreak;
      updatedStudent.longestStreak = Math.max(
        newStreak,
        updatedStudent.longestStreak || 0
      );

      setStudent(updatedStudent);

      // Save to localStorage
      localStudentData[student.id] = {
        lastLoginDate: today,
        credits: updatedStudent.credits,
        currentStreak: newStreak,
        longestStreak: updatedStudent.longestStreak,
      };
      localStorage.setItem("studentData", JSON.stringify(localStudentData));

      // Show popup
      setCreditReward(1);
      setCurrentStreak(newStreak);
      setShowCreditPopup(true);

      // Call Backend API to record check-in
      // studentAuthApi.dailyCheckIn().catch(err => console.error("Check-in failed", err));
    }
  }, [student.id]); // Run when student ID is stable

  const avgCompletion =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) /
            enrollments.length
        )
      : 0;

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
        Welcome back, {student.name.split(" ")[0]}!
      </h1>
      <p className="text-sm sm:text-base text-gray-600 mb-6">
        Here's your learning progress
      </p>

      {/* Suggested Actions */}
      <SuggestedActions />

      {/* NOTE: Live quiz banner is now displayed by GlobalQuizListener */}

      {/* Summary Cards - ALL CLICKABLE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Link
          to="/student/courses"
          className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Active Courses</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1 sm:mt-2">
                {enrollments.length}
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </Link>

        <Link
          to="/student/courses"
          className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Completion</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {avgCompletion}%
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </Link>

        <Link
          to="/student/wallet"
          className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Wallet Balance</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {student.credits} credits
              </p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
        </Link>

        <Link
          to="/student/badges"
          className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Badges Earned</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {student.badges}
              </p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <Link
            to="/student/courses"
            className="flex items-center justify-center py-4 px-6 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition"
          >
            <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-blue-600 font-semibold">View Courses</span>
          </Link>
          <Link
            to="/student/wallet"
            className="flex items-center justify-center py-4 px-6 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition"
          >
            <Wallet className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-purple-600 font-semibold">Check Wallet</span>
          </Link>
          <Link
            to="/student/badges"
            className="flex items-center justify-center py-4 px-6 bg-yellow-50 hover:bg-yellow-100 rounded-lg border border-yellow-200 transition"
          >
            <Award className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-yellow-600 font-semibold">My Badges</span>
          </Link>
        </div>
      </div>

      {/* Streak Widget */}
      <div className="mt-6">
        <StreakWidget currentStreak={1} longestStreak={5} />
      </div>

      {/* Credit Popup */}
      {showCreditPopup && (
        <CreditPopup
          credits={creditReward}
          message="Daily login bonus"
          streak={currentStreak}
          onClose={() => setShowCreditPopup(false)}
        />
      )}

      {/* AI Chatbot - Floating */}
      <StudentChatbot studentId={student.id} studentName={student.name} />
    </div>
  );
};

export default StudentDashboard;
