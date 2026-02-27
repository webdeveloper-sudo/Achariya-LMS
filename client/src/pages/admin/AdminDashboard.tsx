import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  FileQuestion,
  Settings,
  Trophy,
  Shield,
  Activity,
  BarChart3,
  Database,
} from "lucide-react";
import { sampleData } from "../../data/sampleData";

const AdminDashboard = () => {
  const totalUsers =
    sampleData.students.length + sampleData.teachers.length + 2;
  const totalCourses = sampleData.courses.length;
  const totalModules = sampleData.modules.length;
  const totalQuestions = 120;

  return (
    <div className="space-y-12 pb-20">
      {/* Admin Header */}
      <div className="border-b border-black pb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-black p-2 rounded-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-[11px] uppercase tracking-widest font-medium text-black">
            System Authority
          </span>
        </div>
        <h1 className="text-4xl text-black mb-6 leading-tight capitalize">
          Administrative <span className="text-gray-400">Terminal</span>
        </h1>
        <p className="text-gray-600 text-[15px] max-w-xl leading-relaxed capitalize">
          Root-level oversight of institutional entities, curriculum assets, and
          platform telemetry.
        </p>
      </div>

      {/* System Overview Registry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Identities",
            val: totalUsers,
            icon: Users,
            path: "/admin/users",
          },
          {
            label: "Course Assets",
            val: totalCourses,
            icon: BookOpen,
            path: "/admin/courses",
          },
          {
            label: "Unit Archival",
            val: totalModules,
            icon: Database,
            path: "/admin/courses",
          },
          {
            label: "Validation Bank",
            val: totalQuestions,
            icon: FileQuestion,
            path: "/admin/question-bank",
          },
        ].map((stat, i) => (
          <Link
            key={i}
            to={stat.path}
            className="group bg-white border border-black p-8 rounded-sm hover:bg-black transition-all"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="bg-gray-50 text-black w-10 h-10 rounded-sm flex items-center justify-center group-hover:bg-white transition-colors">
                <stat.icon size={20} />
              </div>
              <span className="text-[10px] uppercase tracking-tighter text-gray-400 group-hover:text-white/40">
                Trace {i + 1}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-2 group-hover:text-white/60 transition-colors capitalize">
              {stat.label}
            </p>
            <p className="text-4xl text-black tracking-tight tabular-nums group-hover:text-white transition-colors">
              {stat.val}
            </p>
          </Link>
        ))}
      </div>

      {/* Tactical Control Units */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "User Management",
            desc: "Identity Protocol Control",
            icon: Users,
            path: "/admin/users",
          },
          {
            label: "Curriculum Registry",
            desc: "Asset Initialization",
            icon: BookOpen,
            path: "/admin/courses",
          },
          {
            label: "Validation Engine",
            desc: "Quiz Logic Bank",
            icon: FileQuestion,
            path: "/admin/question-bank",
          },
          {
            label: "System Parameters",
            desc: "Node Configuration",
            icon: Settings,
            path: "/admin/config",
          },
          {
            label: "Faculty Directory",
            desc: "Personnel Oversight",
            icon: Users,
            path: "/admin/teachers",
          },
          {
            label: "Principal Registry",
            desc: "Institutional Assignment",
            icon: Users,
            path: "/admin/principals",
          },
          {
            label: "Challenge Logic",
            desc: "Engagement Gamification",
            icon: Trophy,
            path: "/admin/challenges",
          },
          {
            label: "System Telemetry",
            desc: "Node Health Audit",
            icon: Activity,
            path: "/admin/monitoring",
          },
        ].map((unit, i) => (
          <Link
            key={i}
            to={unit.path}
            className="bg-white border border-black p-6 rounded-sm hover:invert transition-all"
          >
            <unit.icon className="w-6 h-6 text-black mb-4" />
            <h3 className="text-sm font-medium text-black capitalize mb-1">
              {unit.label}
            </h3>
            <p className="text-[11px] text-gray-400 capitalize">{unit.desc}</p>
          </Link>
        ))}
      </div>

      {/* Institutional Hierarchy */}
      <div className="bg-white border border-black p-8 rounded-sm">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-xl text-black capitalize">
              Institutional Registry
            </h2>
            <p className="text-gray-400 text-[11px] capitalize mt-1">
              Cross-Campus Operational Status
            </p>
          </div>
          <BarChart3 className="text-gray-200" size={24} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sampleData.schools.map((school) => {
            const schoolStudents = sampleData.students.filter(
              (s) => s.school_id === school.id,
            );
            const schoolTeachers = sampleData.teachers.filter(
              (t) => t.school_id === school.id,
            );
            const schoolCourses = sampleData.courses.filter(
              (c) => c.school_id === school.id,
            );

            return (
              <Link
                key={school.id}
                to={`/principal/school/${school.id}`}
                className="p-6 border border-gray-100 rounded-sm hover:border-black transition-all flex flex-col md:flex-row justify-between gap-6"
              >
                <div className="space-y-1">
                  <h3 className="text-[15px] font-medium text-black capitalize">
                    {school.name}
                  </h3>
                  <p className="text-[11px] text-gray-400 capitalize">
                    {school.location} • {school.type}
                  </p>
                </div>
                <div className="flex gap-8">
                  <div className="text-center">
                    <p className="text-xl text-black font-medium tabular-nums">
                      {schoolStudents.length}
                    </p>
                    <p className="text-[9px] uppercase tracking-tighter text-gray-400 mt-1">
                      Students
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl text-black font-medium tabular-nums">
                      {schoolTeachers.length}
                    </p>
                    <p className="text-[9px] uppercase tracking-tighter text-gray-400 mt-1">
                      Teachers
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl text-black font-medium tabular-nums">
                      {schoolCourses.length}
                    </p>
                    <p className="text-[9px] uppercase tracking-tighter text-gray-400 mt-1">
                      Courses
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Platform Telemetry Log */}
      <div className="bg-black p-8 rounded-sm text-white">
        <div className="flex items-center gap-3 mb-10">
          <Activity size={18} className="text-white" />
          <h2 className="text-lg uppercase tracking-widest font-medium">
            Platform Telemetry
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: "Active Identities", val: sampleData.students.length },
            { label: "Faculty Presence", val: sampleData.teachers.length },
            { label: "Protocol Licenses", val: sampleData.enrollments.length },
            { label: "Instructional Streams", val: sampleData.courses.length },
          ].map((metric, i) => (
            <div
              key={i}
              className="space-y-2 border-l border-white/10 pl-6 first:border-0 first:pl-0"
            >
              <p className="text-3xl font-light tracking-tighter tabular-nums">
                {metric.val}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-white/40 capitalize">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
