import { Link } from "react-router-dom";
import { Users, BookOpen, FileQuestion, Settings } from "lucide-react";
import { sampleData } from "../../data/sampleData";

const AdminDashboard = () => {
  const totalUsers =
    sampleData.students.length + sampleData.teachers.length + 2; // +2 for principals
  const totalCourses = sampleData.courses.length;
  const totalModules = sampleData.modules.length;
  const totalQuestions = 120; // From seed data

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">
        Admin Dashboard
      </h1>

      {/* System Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Link
          to="/admin/users"
          className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Users</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">
                {totalUsers}
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </Link>

        <Link
          to="/admin/courses"
          className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Courses</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {totalCourses}
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </Link>

        <Link
          to="/admin/courses"
          className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Modules</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {totalModules}
              </p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </Link>

        <Link
          to="/admin/question-bank"
          className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quiz Questions</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {totalQuestions}
              </p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <FileQuestion className="w-6 h-6 text-white" />
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          to="/admin/users"
          className="bg-blue-50 border border-blue-200 rounded-xl p-6 hover:shadow-md cursor-pointer transition"
        >
          <Users className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-bold text-gray-800 mb-1">Manage Users</h3>
          <p className="text-sm text-gray-600">Add, edit, or remove users</p>
        </Link>

        <Link
          to="/admin/courses"
          className="bg-green-50 border border-green-200 rounded-xl p-6 hover:shadow-md cursor-pointer transition"
        >
          <BookOpen className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="font-bold text-gray-800 mb-1">Manage Courses</h3>
          <p className="text-sm text-gray-600">Create and edit courses</p>
        </Link>

        <Link
          to="/admin/question-bank"
          className="bg-purple-50 border border-purple-200 rounded-xl p-6 hover:shadow-md cursor-pointer transition"
        >
          <FileQuestion className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="font-bold text-gray-800 mb-1">Question Bank</h3>
          <p className="text-sm text-gray-600">Manage quiz questions</p>
        </Link>

        <Link
          to="/admin/config"
          className="bg-orange-50 border border-orange-200 rounded-xl p-6 hover:shadow-md cursor-pointer transition"
        >
          <Settings className="w-8 h-8 text-orange-600 mb-3" />
          <h3 className="font-bold text-gray-800 mb-1">System Config</h3>
          <p className="text-sm text-gray-600">Configure system settings</p>
        </Link>

        <Link
          to="/admin/teachers"
          className="bg-teal-50 border border-teal-200 rounded-xl p-6 hover:shadow-md cursor-pointer transition"
        >
          <Users className="w-8 h-8 text-teal-600 mb-3" />
          <h3 className="font-bold text-gray-800 mb-1">Manage Teachers</h3>
          <p className="text-sm text-gray-600">Add, edit, or remove teachers</p>
        </Link>
      </div>

      {/* All Schools */}
      <div className="bg-white rounded-xl shadow-sm p-6 border mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Schools Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleData.schools.map((school) => {
            const schoolStudents = sampleData.students.filter(
              (s) => s.school_id === school.id
            );
            const schoolTeachers = sampleData.teachers.filter(
              (t) => t.school_id === school.id
            );
            const schoolCourses = sampleData.courses.filter(
              (c) => c.school_id === school.id
            );

            return (
              <Link
                key={school.id}
                to={`/principal/school/${school.id}`}
                className="p-4 border rounded-lg hover:shadow-md transition cursor-pointer"
              >
                <h3 className="font-bold text-gray-800 mb-1">{school.name}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {school.location} • {school.type}
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {schoolStudents.length}
                    </p>
                    <p className="text-xs text-gray-600">Students</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {schoolTeachers.length}
                    </p>
                    <p className="text-xs text-gray-600">Teachers</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">
                      {schoolCourses.length}
                    </p>
                    <p className="text-xs text-gray-600">Courses</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Platform Metrics */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
          Platform Metrics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-gray-800">
              {sampleData.students.length}
            </p>
            <p className="text-sm text-gray-600">Students</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-gray-800">
              {sampleData.teachers.length}
            </p>
            <p className="text-sm text-gray-600">Teachers</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-gray-800">
              {sampleData.enrollments.length}
            </p>
            <p className="text-sm text-gray-600">Enrollments</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-gray-800">
              {sampleData.courses.length}
            </p>
            <p className="text-sm text-gray-600">Active Courses</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
