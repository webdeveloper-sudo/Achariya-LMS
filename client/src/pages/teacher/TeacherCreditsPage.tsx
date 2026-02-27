import { Link } from "react-router-dom";
import { ArrowLeft, Coins, TrendingUp, Award } from "lucide-react";
import { sampleData } from "../../data/sampleData";

const TeacherCreditsPage = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const teacher =
    sampleData.teachers.find((t) => t.email === user.email) ||
    sampleData.teachers[0];

  const teacherCourses = sampleData.courses.filter(
    (c) => c.teacher_id === teacher.id,
  );
  const courseIds = teacherCourses.map((c) => c.id);
  const enrollments = sampleData.enrollments.filter((e) =>
    courseIds.includes(e.course_id),
  );
  const studentIds = [...new Set(enrollments.map((e) => e.student_id))];
  const students = sampleData.students.filter((s) => studentIds.includes(s.id));

  // Calculate student credits
  const studentCredits = students
    .map((student) => {
      // Estimate credits from completion (simplified)
      const studentEnrollments = enrollments.filter(
        (e) => e.student_id === student.id,
      );
      const avgCompletion =
        studentEnrollments.length > 0
          ? Math.round(
              studentEnrollments.reduce((sum, e) => sum + e.progress, 0) /
                studentEnrollments.length,
            )
          : 0;
      const estimatedCredits =
        Math.floor(avgCompletion * 1.5) + student.badges * 20;

      return {
        ...student,
        credits: estimatedCredits,
        badges: student.badges,
      };
    })
    .sort((a, b) => b.credits - a.credits);

  const totalCredits = studentCredits.reduce((sum, s) => sum + s.credits, 0);

  return (
    <div className="space-y-10 pb-20">
      <div className="border-b border-gray-100 pb-10">
        <Link
          to="/teacher/dashboard"
          className="inline-flex items-center text-[13px] hover:text-[#c72323] mb-8 transition-colors capitalize"
          style={{ color: "#c72323" }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Terminal
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-50 p-2 rounded border border-red-100">
            <Coins className="w-5 h-5" style={{ color: "#c72323" }} />
          </div>
          <span className="text-[13px] capitalize" style={{ color: "#c72323" }}>
            Credit Allocation
          </span>
        </div>
        <h1 className="text-4xl text-gray-900 leading-tight capitalize">
          Student Credits <span className="text-gray-400">Overview</span>
        </h1>
        <p className="text-gray-600 text-[15px] mt-6 max-w-2xl leading-relaxed">
          Comprehensive ledger of institutional credit distribution and academic
          proficiency benchmarks across all student cohorts.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            label: "Total Distributed",
            val: totalCredits.toLocaleString(),
            icon: Coins,
            color: "#c72323",
          },
          {
            label: "Top Performer",
            val: studentCredits[0]?.name.split(" ")[0],
            sub: `${studentCredits[0]?.credits} credits`,
            icon: Award,
            color: "#d97706",
          },
          {
            label: "Average per Student",
            val: Math.round(totalCredits / studentCredits.length).toString(),
            icon: TrendingUp,
            color: "#1e3a8a",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-md p-8 border border-gray-100 shadow-sm hover:border-red-100 transition-all"
          >
            <div className="flex items-center justify-between mb-6">
              <div
                className="w-10 h-10 rounded flex items-center justify-center border border-gray-100"
                style={{ backgroundColor: `${stat.color}08` }}
              >
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-[12px] text-gray-600 mb-2 capitalize">
              {stat.label}
            </p>
            <p className="text-3xl text-gray-900">{stat.val}</p>
            {stat.sub && (
              <p className="text-[11px] text-gray-400 mt-2 capitalize">
                {stat.sub}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Student Credits Table */}
      <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden text-center sm:text-left">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gray-50 p-2.5 rounded border border-gray-100">
              <Coins size={20} style={{ color: "#c72323" }} />
            </div>
            <div>
              <h2 className="text-xl text-gray-900 capitalize">
                Credits by Student
              </h2>
              <p className="text-gray-600 text-[11px] capitalize">
                Institutional Performance Matrix
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-4 px-8 text-[12px] text-gray-600 capitalize">
                  Rank
                </th>
                <th className="py-4 px-8 text-[12px] text-gray-600 capitalize">
                  Synchronized Identity
                </th>
                <th className="py-4 px-8 text-[12px] text-gray-600 capitalize text-center">
                  Status
                </th>
                <th className="py-4 px-8 text-[12px] text-gray-600 capitalize text-right">
                  Badges
                </th>
                <th className="py-4 px-8 text-[12px] text-gray-600 capitalize text-right">
                  Credits
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {studentCredits.map((student, index) => (
                <tr
                  key={student.id}
                  className="group hover:bg-gray-50 transition-colors"
                >
                  <td className="py-5 px-8">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] border ${
                        index === 0
                          ? "bg-yellow-50 text-yellow-700 border-yellow-100"
                          : index === 1
                            ? "bg-gray-50 text-gray-700 border-gray-200"
                            : index === 2
                              ? "bg-orange-50 text-orange-700 border-orange-100"
                              : "bg-white text-gray-400 border-gray-100"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-5 px-8">
                    <p className="text-gray-900 text-sm capitalize group-hover:text-[#c72323] transition-colors">
                      {student.name}
                    </p>
                    <p className="text-[11px] text-gray-500 capitalize">
                      {student.email}
                    </p>
                  </td>
                  <td className="py-5 px-8 text-center text-[12px]">
                    <span
                      className={`px-2 py-1 rounded-[4px] border capitalize ${
                        student.credits >= 100
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : student.credits >= 50
                            ? "bg-blue-50 text-blue-600 border-blue-100"
                            : "bg-gray-50 text-gray-500 border-gray-100"
                      }`}
                    >
                      {student.credits >= 100
                        ? "Excellent"
                        : student.credits >= 50
                          ? "Good"
                          : "Developing"}
                    </span>
                  </td>
                  <td className="py-5 px-8 text-right text-[12px] text-gray-900 capitalize">
                    {student.badges}
                  </td>
                  <td className="py-5 px-8 text-right">
                    <span
                      className="text-sm font-medium flex items-center justify-end"
                      style={{ color: "#c72323" }}
                    >
                      <Coins className="w-4 h-4 mr-1" />
                      {student.credits}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherCreditsPage;
