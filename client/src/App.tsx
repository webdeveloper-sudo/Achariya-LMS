import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./pages/Login";
import RoleSelection from "./pages/RoleSelection";
import Layout from "./components/Layout";
import RequireAdmin from "./components/RequireAdmin";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentCourses from "./pages/student/StudentCourses";
import StudentCourseDetail from "./pages/student/StudentCourseDetail";
import StudentModuleView from "./pages/student/StudentModuleView";
import StudentWalletPage from "./pages/student/StudentWalletPage";
import StudentBadgesPage from "./pages/student/StudentBadgesPage";
import StudentFAQPage from "./pages/student/StudentFAQPage";
import StudentMarketplace from "./pages/student/StudentMarketplace";
import StudentLeaderboard from "./pages/student/StudentLeaderboard";
import StudentChallenges from "./pages/student/StudentChallenges";
import StudentProgress from "./pages/student/StudentProgress";
import StudentRivals from "./pages/student/StudentRivals";
import StudentPowerUps from "./pages/student/StudentPowerUps";
import StudentSocialFeed from "./pages/student/StudentSocialFeed";
import StudentQuizPage from "./pages/student/StudentQuizPage";
import StudentLiveQuizTaking from "./pages/student/StudentLiveQuizTaking";
import StudentLiveQuizResults from "./pages/student/StudentLiveQuizResults";
import StudentChatbot from "./pages/student/StudentChatbot";

// Teacher Pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherCoursesPage from "./pages/teacher/TeacherCoursesPage";
import TeacherCourseDetail from "./pages/teacher/TeacherCourseDetail";
import TeacherStudentDetail from "./pages/teacher/TeacherStudentDetail";
import TeacherEvidencePage from "./pages/teacher/TeacherEvidencePage";
import TeacherFAQPage from "./pages/teacher/TeacherFAQPage";
import TeacherAllStudentsPage from "./pages/teacher/TeacherAllStudentsPage";
import TeacherPerformanceBreakdown from "./pages/teacher/TeacherPerformanceBreakdown";
import TeacherCreditsPage from "./pages/teacher/TeacherCreditsPage";
import LiveQuizControl from "./pages/teacher/LiveQuizControl";
import LiveQuizResults from "./pages/teacher/LiveQuizResults";
import TeacherEvidenceSubmission from "./pages/teacher/EvidenceSubmission";

// Principal Pages
import PrincipalDashboard from "./pages/principal/PrincipalDashboard";
import PrincipalCourses from "./pages/principal/PrincipalCourses";
import PrincipalCourseDetail from "./pages/principal/PrincipalCourseDetail";
import PrincipalStudentDetail from "./pages/principal/PrincipalStudentDetail";
import PrincipalAllStudents from "./pages/principal/PrincipalAllStudents";
import PrincipalAllTeachers from "./pages/principal/PrincipalAllTeachers";
import PrincipalFAQPage from "./pages/principal/PrincipalFAQPage";
import PrincipalClassAnalytics from "./pages/principal/PrincipalClassAnalytics";
import PrincipalStudentActivity from "./pages/principal/PrincipalStudentActivity";
import PrincipalSchoolDetail from "./pages/principal/PrincipalSchoolDetail";
import PrincipalSystemStats from "./pages/principal/PrincipalSystemStats";
import PrincipalEvidenceApproval from "./pages/principal/PrincipalEvidenceApproval";
import EvidenceApproval from "./pages/principal/EvidenceApproval";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
// @ts-ignore
import AdminCoursesPage from "./pages/admin/pages/courses/AdminCoursesPage";
import AdminUploadCourse from "./pages/admin/pages/courses/AdminUploadCourse";
import AdminCoursesModulePage from "./pages/admin/pages/courses/modules/AdminCoursesModulePage";

import AdminUsersPage from "./pages/admin/pages/user/AdminUsersPage";
import AdminConfigPage from "./pages/admin/AdminConfigPage";
import AdminFAQPage from "./pages/admin/AdminFAQPage";
import AdminQuestionBank from "./pages/admin/AdminQuestionBank";
import AdminSystemMonitoring from "./pages/admin/AdminSystemMonitoring";
import AdminUploadStudents from "./pages/admin/pages/user/AdminUploadStudents";
import AdminTeachersPage from "./pages/admin/pages/teacher/AdminTeachersPage";
import AdminUploadTeachers from "./pages/admin/pages/teacher/AdminUploadTeachers";
import AdminAssetsPage from "./pages/admin/pages/assets/AdminAssetsPage";

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/select-role" element={<RoleSelection />} />

        <Route element={<Layout />}>
          {/* Student Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/courses" element={<StudentCourses />} />
          <Route
            path="/student/course/:courseId"
            element={<StudentCourseDetail />}
          />
          <Route
            path="/student/module/:moduleId"
            element={<StudentModuleView />}
          />
          <Route path="/student/quiz/:moduleId" element={<StudentQuizPage />} />
          <Route path="/student/wallet" element={<StudentWalletPage />} />
          <Route path="/student/badges" element={<StudentBadgesPage />} />
          <Route path="/student/marketplace" element={<StudentMarketplace />} />
          <Route path="/student/leaderboard" element={<StudentLeaderboard />} />
          <Route path="/student/challenges" element={<StudentChallenges />} />
          <Route path="/student/progress" element={<StudentProgress />} />
          <Route path="/student/rivals" element={<StudentRivals />} />
          <Route path="/student/powerups" element={<StudentPowerUps />} />
          <Route path="/student/social" element={<StudentSocialFeed />} />
          <Route path="/student/faq" element={<StudentFAQPage />} />
          <Route
            path="/student/live-quiz/:sessionId/take"
            element={<StudentLiveQuizTaking />}
          />
          <Route
            path="/student/live-quiz/:sessionId/results"
            element={<StudentLiveQuizResults />}
          />
          <Route path="/student/chat" element={<StudentChatbot />} />
          <Route path="/student/chat/:courseId" element={<StudentChatbot />} />
          <Route
            path="/student/chat/:courseId/:moduleId"
            element={<StudentChatbot />}
          />

          {/* Teacher Routes */}
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/courses" element={<TeacherCoursesPage />} />
          <Route
            path="/teacher/course/:courseId"
            element={<TeacherCourseDetail />}
          />
          <Route
            path="/teacher/student/:studentId"
            element={<TeacherStudentDetail />}
          />
          <Route
            path="/teacher/students"
            element={<TeacherAllStudentsPage />}
          />
          <Route
            path="/teacher/performance"
            element={<TeacherPerformanceBreakdown />}
          />
          <Route path="/teacher/credits" element={<TeacherCreditsPage />} />
          <Route path="/teacher/evidence" element={<TeacherEvidencePage />} />
          <Route
            path="/teacher/evidence-submit"
            element={<TeacherEvidenceSubmission />}
          />
          <Route path="/teacher/faq" element={<TeacherFAQPage />} />
          <Route
            path="/teacher/live-quiz/:sessionId/control"
            element={<LiveQuizControl />}
          />
          <Route
            path="/teacher/live-quiz/:sessionId/results"
            element={<LiveQuizResults />}
          />

          {/* Principal Routes */}
          <Route path="/principal/dashboard" element={<PrincipalDashboard />} />
          <Route path="/principal/courses" element={<PrincipalCourses />} />
          <Route
            path="/principal/students"
            element={<PrincipalAllStudents />}
          />
          <Route
            path="/principal/teachers"
            element={<PrincipalAllTeachers />}
          />
          <Route
            path="/principal/course/:courseId"
            element={<PrincipalCourseDetail />}
          />
          <Route
            path="/principal/student/:studentId"
            element={<PrincipalStudentDetail />}
          />
          <Route
            path="/principal/class-analytics"
            element={<PrincipalClassAnalytics />}
          />
          <Route
            path="/principal/student-activity"
            element={<PrincipalStudentActivity />}
          />
          <Route
            path="/principal/school/:schoolId"
            element={<PrincipalSchoolDetail />}
          />
          <Route
            path="/principal/system-stats"
            element={<PrincipalSystemStats />}
          />
          <Route
            path="/principal/evidence"
            element={<PrincipalEvidenceApproval />}
          />
          <Route
            path="/principal/evidence-approval"
            element={<EvidenceApproval />}
          />
          <Route path="/principal/faq" element={<PrincipalFAQPage />} />

          {/* Admin Routes (protected) */}
          <Route
            path="/admin/dashboard"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <RequireAdmin>
                <AdminCoursesPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/courses/upload"
            element={
              <RequireAdmin>
                <AdminUploadCourse />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/courses/:courseId/modules"
            element={
              <RequireAdmin>
                <AdminCoursesModulePage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/courses/edit/:courseId"
            element={<Navigate to="/admin/courses" replace />} // Removing old CoursePage
          />
          <Route
            path="/admin/users"
            element={
              <RequireAdmin>
                <AdminUsersPage />
              </RequireAdmin>
            }
          />

          <Route
            path="/admin/users/upload"
            element={
              <RequireAdmin>
                <AdminUploadStudents />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/teachers"
            element={
              <RequireAdmin>
                <AdminTeachersPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/teachers/upload"
            element={
              <RequireAdmin>
                <AdminUploadTeachers />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/assets"
            element={
              <RequireAdmin>
                <AdminAssetsPage />
              </RequireAdmin>
            }
          />
          {/* Old routes redirects or removals */}
          <Route
            path="/admin/modules/edit/:moduleId"
            element={<Navigate to="/admin/courses" replace />}
          />
          <Route
            path="/admin/question-bank"
            element={
              <RequireAdmin>
                <AdminQuestionBank />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/config"
            element={
              <RequireAdmin>
                <AdminConfigPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/monitoring"
            element={
              <RequireAdmin>
                <AdminSystemMonitoring />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/faq"
            element={
              <RequireAdmin>
                <AdminFAQPage />
              </RequireAdmin>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
