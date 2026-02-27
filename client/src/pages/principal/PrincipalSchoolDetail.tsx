import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Building,
  Users,
  TrendingUp,
  Award,
  Activity,
  Globe,
  Mail,
  Phone,
  Zap,
} from "lucide-react";
import { sampleData } from "../../data/sampleData";

const PrincipalSchoolDetail = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.selectedRole?.toLowerCase() || "principal";
  const schoolId = user.email?.includes("college") ? 2 : 1;
  const school =
    sampleData.schools.find((s) => s.id === schoolId) || sampleData.schools[0];

  const schoolStudents = sampleData.students.filter(
    (s) => s.school_id === school.id,
  );
  const avgCompletion = Math.round(
    schoolStudents.reduce((sum, s) => sum + s.completion, 0) /
      schoolStudents.length,
  );

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="border-b border-gray-100 pb-12">
        <Link
          to={`/${role}/dashboard`}
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
                <Building className="w-5 h-5" style={{ color: "#008000" }} />
              </div>
              <span
                className="text-[13px] capitalize"
                style={{ color: "#008000" }}
              >
                Institutional Asset Trace
              </span>
            </div>
            <h1 className="text-4xl text-gray-900 mb-6 leading-tight capitalize">
              {school.name} <span className="text-gray-400">Profile</span>
            </h1>
            <p className="text-gray-600 text-[15px] max-w-xl leading-relaxed mx-auto sm:mx-0">
              {school.location} • {school.type}. Strategic oversight of CBSE
              affiliated streams and foundational academic parameters.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center sm:justify-start lg:mx-0 mx-auto">
            <span className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-sm text-[11px] capitalize font-medium transition active:scale-95 shadow-lg">
              Institutional Registry Active
            </span>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-[#008000] rounded-sm text-[11px] border border-green-100">
              <Zap size={14} fill="#008000" className="opacity-20" /> Verified
              2026
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Participant Userpool",
            val: schoolStudents.length,
            icon: Users,
          },
          {
            label: "Cohort Proficiency",
            val: `${avgCompletion}%`,
            icon: TrendingUp,
          },
          {
            label: "Validated Scoring",
            val: `${Math.round(schoolStudents.reduce((sum, s) => sum + s.quiz_avg, 0) / schoolStudents.length)}%`,
            icon: Award,
          },
          {
            label: "Asset Inventory",
            val: sampleData.courses.length,
            icon: Activity,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="group bg-white rounded-md p-8 border border-gray-100 shadow-sm transition-all text-center sm:text-left"
          >
            <div className="bg-gray-50 text-gray-400 w-12 h-12 rounded flex items-center justify-center mb-6 mx-auto sm:mx-0 group-hover:bg-green-50 group-hover:text-[#008000] transition-colors">
              <stat.icon size={22} />
            </div>
            <p className="text-[11px] text-gray-400 capitalize mb-2 font-medium">
              {stat.label}
            </p>
            <p className="text-4xl text-gray-900 tracking-tight tabular-nums">
              {stat.val}
            </p>
          </div>
        ))}
      </div>

      {/* Performance Overview */}
      <div className="bg-white rounded-md border border-gray-100 shadow-sm p-8">
        <div className="flex items-center gap-4 mb-10 text-center sm:text-left">
          <div
            className="bg-gray-50 p-2.5 rounded border border-gray-100"
            style={{ color: "#008000" }}
          >
            <TrendingUp size={20} />
          </div>
          <div>
            <h2 className="text-xl text-gray-900 capitalize">
              Engagement Strata
            </h2>
            <p className="text-gray-400 text-[11px] capitalize mt-1">
              Operational Proficiency Distribution
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              label: "Optimal Performers (≥85%)",
              val: schoolStudents.filter((s) => s.completion >= 85).length,
              color: "#008000",
              bg: "bg-green-50",
            },
            {
              label: "Standard Proficiency (70-84%)",
              val: schoolStudents.filter(
                (s) => s.completion >= 70 && s.completion < 85,
              ).length,
              color: "#b45309",
              bg: "bg-amber-50",
            },
            {
              label: "Critical Attention (<70%)",
              val: schoolStudents.filter((s) => s.completion < 70).length,
              color: "#dc2626",
              bg: "bg-red-50",
            },
          ].map((strata, i) => (
            <div
              key={i}
              className="p-6 bg-gray-50 border border-gray-100 rounded-md group hover:bg-white hover:border-gray-200 transition-all"
            >
              <p className="text-[11px] text-gray-400 capitalize mb-4 group-hover:text-gray-500 transition-colors">
                {strata.label}
              </p>
              <div className="flex items-baseline gap-2">
                <p
                  className="text-4xl text-gray-900 tabular-nums leading-none tracking-tighter"
                  style={{ color: strata.color }}
                >
                  {strata.val}
                </p>
                <span className="text-[10px] text-gray-400 uppercase font-mono">
                  Participants
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* School Info & Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-white rounded-md border border-gray-100 shadow-sm p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <Building size={18} className="text-gray-400" />
            <h3 className="text-sm text-gray-900 capitalize font-medium">
              Institutional Hub Parameters
            </h3>
          </div>
          <div className="space-y-6 flex-1">
            {[
              { label: "Asset Type", val: school.type },
              { label: "Geo-Spatial Code", val: school.location },
              { label: "Regulatory Board", val: "CBSE Central" },
              { label: "Active Strata", val: "Grade 1-12 Operational" },
            ].map((info, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0 pb-3"
              >
                <span className="text-[13px] text-gray-400 capitalize">
                  {info.label}
                </span>
                <span className="text-[13px] text-gray-900 font-medium capitalize">
                  {info.val}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-md border border-gray-100 shadow-sm p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <Mail size={18} className="text-gray-400" />
            <h3 className="text-sm text-gray-900 capitalize font-medium">
              Communication Channels
            </h3>
          </div>
          <div className="space-y-6 flex-1">
            {[
              { label: "Admin Gateway", val: "admin@achariya.org", icon: Mail },
              {
                label: "Direct Terminal",
                val: "+91 80 1234 5678",
                icon: Phone,
              },
              {
                label: "Digital Instance",
                val: "www.achariya.in",
                icon: Globe,
                link: true,
              },
            ].map((contact, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0 pb-3"
              >
                <span className="text-[13px] text-gray-400 capitalize">
                  {contact.label}
                </span>
                <div className="flex items-center gap-2">
                  <contact.icon size={14} className="text-gray-300" />
                  <span
                    className={`text-[13px] font-medium ${contact.link ? "text-[#008000] hover:underline cursor-pointer" : "text-gray-900"}`}
                  >
                    {contact.val}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrincipalSchoolDetail;
