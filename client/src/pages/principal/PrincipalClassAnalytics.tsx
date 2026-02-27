import { Link } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Award,
  Activity,
  BarChart3,
  PieChart,
} from "lucide-react";
import { sampleData } from "../../data/sampleData";

const PrincipalClassAnalytics = () => {
  // Group enrollments by class/grade
  const classByGrade = sampleData.completionByGrade.map((grade) => {
    const gradeStudents = sampleData.students.filter(
      (s) => s.class === grade.grade,
    );
    const gradeEnrollments = sampleData.enrollments.filter((e) =>
      gradeStudents.some((s) => s.id === e.student_id),
    );

    const avgCompletion =
      gradeEnrollments.length > 0
        ? Math.round(
            gradeEnrollments.reduce((sum, e) => sum + e.progress, 0) /
              gradeEnrollments.length,
          )
        : 0;

    return {
      ...grade,
      studentCount: gradeStudents.length,
      avgCompletion,
      highPerformers: gradeEnrollments.filter((e) => e.progress >= 85).length,
      needsAttention: gradeEnrollments.filter((e) => e.progress < 70).length,
    };
  });

  // Calculate overall average safely
  const overallAvg =
    classByGrade.length > 0
      ? Math.round(
          classByGrade.reduce((sum, g) => sum + (g.completion || 0), 0) /
            classByGrade.length,
        )
      : 0;

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="border-b border-gray-100 pb-12">
        <Link
          to="/principal/dashboard"
          className="inline-flex items-center text-[13px] hover:text-[#008000] mb-10 transition-colors capitalize"
          style={{ color: "#008000" }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Executive Dashboard
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-center sm:text-left">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6 justify-center sm:justify-start">
              <div className="bg-green-50 p-2 rounded border border-green-100">
                <BarChart3 className="w-5 h-5" style={{ color: "#008000" }} />
              </div>
              <span
                className="text-[13px] capitalize"
                style={{ color: "#008000" }}
              >
                Statistical Overview
              </span>
            </div>
            <h1 className="text-4xl text-gray-900 mb-6 leading-tight capitalize">
              Cohort <span className="text-gray-400">Intelligence</span>
            </h1>
            <p className="text-gray-600 text-[15px] max-w-xl leading-relaxed mx-auto sm:mx-0">
              Comparative analysis of academic progression across institutional
              strata. Strategic monitoring of completion metrics.
            </p>
          </div>

          <div className="bg-white px-8 py-6 rounded-md border border-gray-100 shadow-sm flex items-center gap-6">
            <div className="bg-green-50 p-3 rounded-full">
              <Activity className="w-6 h-6" style={{ color: "#008000" }} />
            </div>
            <div className="text-left">
              <p className="text-[11px] text-gray-400 capitalize mb-0.5">
                Global Institutional Proficiency
              </p>
              <p className="text-3xl text-gray-900 tabular-nums">
                {overallAvg}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall School Performance - Using refined UI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {classByGrade.map((grade) => (
          <div
            key={grade.grade}
            className="group bg-white rounded-md border border-gray-100 shadow-sm p-8 hover:border-green-100 transition-all flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-gray-50 border border-gray-100 flex items-center justify-center text-sm font-medium text-gray-400 group-hover:bg-green-50 group-hover:text-[#008000] transition-colors">
                  {grade.grade.split(" ")[0][0]}
                  {grade.grade.split(" ")[1] || ""}
                </div>
                <div>
                  <h3 className="text-lg text-gray-900 capitalize font-medium">
                    {grade.grade}
                  </h3>
                  <p className="text-[11px] text-gray-400 capitalize mt-0.5">
                    Asset Registry Strata
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className="text-2xl text-gray-900 tabular-nums"
                  style={{
                    color:
                      grade.completion >= 85
                        ? "#008000"
                        : grade.completion >= 70
                          ? "#b45309"
                          : "#dc2626",
                  }}
                >
                  {grade.completion || 0}%
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-10 flex-1">
              {[
                {
                  label: "Participant Hub",
                  val: grade.studentCount,
                  icon: Users,
                  color: "text-gray-400",
                },
                {
                  label: "Proficiency Index",
                  val: `${grade.avgCompletion}%`,
                  icon: PieChart,
                  color: "text-gray-400",
                },
                {
                  label: "Exceptional Traces",
                  val: grade.highPerformers,
                  icon: Award,
                  color: "text-[#008000]",
                },
                {
                  label: "At-Risk Variables",
                  val: grade.needsAttention,
                  icon: TrendingUp,
                  color: "text-red-500",
                },
              ].map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <row.icon size={14} className={row.color} />
                    <span className="text-[13px] text-gray-600 capitalize">
                      {row.label}
                    </span>
                  </div>
                  <span
                    className={`text-[13px] font-medium ${row.color.includes("text-[#008000]") ? "text-[#008000]" : row.color.includes("text-red-500") ? "text-red-500" : "text-gray-900"}`}
                  >
                    {row.val}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] text-gray-400 capitalize">
                <span>Proficiency Trace</span>
                <span>{grade.completion || 0}%</span>
              </div>
              <div className="w-full bg-gray-50 rounded-full h-1 overflow-hidden">
                <div
                  className="h-full transition-all duration-1000"
                  style={{
                    width: `${grade.completion || 0}%`,
                    backgroundColor:
                      grade.completion >= 85
                        ? "#008000"
                        : grade.completion >= 70
                          ? "#f59e0b"
                          : "#dc2626",
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrincipalClassAnalytics;
