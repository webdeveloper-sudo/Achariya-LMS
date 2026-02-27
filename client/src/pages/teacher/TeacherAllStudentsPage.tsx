import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Activity,
  ChevronRight,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { teacherApi } from "../../api";

const TeacherAllStudentsPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await teacherApi.getTeacherStudents();
        setStudents(res.data.students);
      } catch (err: any) {
        console.error("Error fetching students:", err);
        setError("Failed to synchronize cohort data.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(
    (student) =>
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.class?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2
          className="w-12 h-12 animate-spin"
          style={{ color: "#c72323" }}
        />
        <p className="text-[12px] text-gray-500 animate-pulse capitalize">
          Synchronizing Institutional Cohort...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
        <div className="bg-red-50 p-4 rounded-full">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-xl text-gray-900 capitalize">Sync Error</h2>
        <p className="text-[#c72323] text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-gray-900 text-white px-8 py-3.5 rounded-md text-[13px] hover:bg-[#c72323] transition capitalize"
        >
          Retry Connection
        </button>
      </div>
    );
  }

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
            <Users className="w-5 h-5" style={{ color: "#c72323" }} />
          </div>
          <span className="text-[13px] capitalize" style={{ color: "#c72323" }}>
            Institutional Cohort
          </span>
        </div>
        <h1 className="text-4xl text-gray-900 leading-tight capitalize">
          Student <span className="text-gray-400">Directory</span>
        </h1>
        <p className="text-gray-600 text-[15px] mt-6 max-w-2xl leading-relaxed">
          Comprehensive audit of all student participants currently enrolled in
          managed instructional modules. Total of {students.length} validated
          enrollees.
        </p>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by name, class or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-6 pr-6 py-4 bg-white border border-gray-100 rounded-md text-[14px] text-gray-700 capitalize focus:outline-none focus:border-red-200 transition shadow-sm"
          />
        </div>
        <div className="bg-gray-900 text-white px-6 py-4 rounded-md text-[13px] capitalize">
          {filteredStudents.length} Results
        </div>
      </div>

      <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden text-center sm:text-left">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gray-50 p-2.5 rounded border border-gray-100">
              <Activity size={20} style={{ color: "#c72323" }} />
            </div>
            <div>
              <h2 className="text-xl text-gray-900 capitalize">
                Active Cluster
              </h2>
              <p className="text-gray-600 text-[11px] capitalize">
                Validated Enrollees
              </p>
            </div>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-gray-400 text-[13px] capitalize">
              No matching enrollees found in the current cohort.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-5 px-8 text-[12px] text-gray-600 capitalize">
                    Synchronized Identity
                  </th>
                  <th className="py-5 px-8 text-[12px] text-gray-600 capitalize">
                    Stratum
                  </th>
                  <th className="py-5 px-8 text-[12px] text-gray-600 capitalize text-center">
                    Units
                  </th>
                  <th className="py-5 px-8 text-[12px] text-gray-600 capitalize text-center">
                    Sync Level
                  </th>
                  <th className="py-5 px-8 text-[12px] text-gray-600 capitalize text-center">
                    Status
                  </th>
                  <th className="py-5 px-8 text-[12px] text-gray-600 capitalize text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStudents.map((student) => {
                  return (
                    <tr
                      key={student.id}
                      className="group hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/teacher/student/${student.id}`)}
                    >
                      <td className="py-5 px-8">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center p-1.5 border border-gray-100 mr-4 group-hover:bg-red-50 transition-all">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-gray-900 text-sm capitalize group-hover:text-[#c72323] transition-colors block">
                              {student.name}
                            </span>
                            <span className="text-[11px] text-gray-500 capitalize">
                              {student.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-8 text-[12px] text-gray-600 capitalize">
                        {student.class} {student.section}
                      </td>
                      <td className="py-5 px-8 text-center text-[12px] text-gray-900 capitalize">
                        {student.courses?.length || 0} Units
                      </td>
                      <td className="py-5 px-8 text-center">
                        <span
                          className="text-sm"
                          style={{
                            color:
                              student.progress >= 85
                                ? "#008000"
                                : student.progress >= 70
                                  ? "#d97706"
                                  : "#c72323",
                          }}
                        >
                          {student.progress}%
                        </span>
                      </td>
                      <td className="py-5 px-8 text-center">
                        <span
                          className={`px-2 py-1 rounded-[4px] text-[11px] border capitalize ${
                            student.status === "Active"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-gray-50 text-gray-500 border-gray-100"
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="py-5 px-8 text-right">
                        <button
                          className="text-[12px] capitalize hover:underline flex items-center justify-end ml-auto gap-1"
                          style={{ color: "#c72323" }}
                        >
                          Audit Profile <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAllStudentsPage;
