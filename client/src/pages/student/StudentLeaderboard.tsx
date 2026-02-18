import { Trophy, Users, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import BackButton from "../../components/BackButton";
import { studentApi } from "../../api";

const StudentLeaderboard = () => {
  const [activeTab, setActiveTab] = useState<"weekly" | "alltime" | "class">(
    "weekly",
  );
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id || user._id;
  const userClass = user.class;

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await studentApi.getLeaderboard(activeTab);
      if (res.data && res.data.leaderboard) {
        setLeaderboard(res.data.leaderboard);

        // Find user rank (only for student leaderboards, not class)
        if (activeTab !== "class") {
          const rank = res.data.leaderboard.findIndex(
            (s: any) => s._id === userId,
          );
          setUserRank(rank !== -1 ? rank + 1 : null);
        } else {
          // For class tab, find class rank
          const classRank = res.data.leaderboard.findIndex(
            (c: any) => c.name === userClass,
          );
          setUserRank(classRank !== -1 ? classRank + 1 : null);
        }
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto p-4 sm:p-6">
      <BackButton />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Leaderboards</h1>
          <p className="text-gray-600 mt-1">Compare your progress with peers</p>
        </div>

        {userRank && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg transform transition hover:scale-105">
            <p className="text-sm opacity-90">
              Your {activeTab === "class" ? "Class" : ""} Rank
            </p>
            <p className="text-3xl font-bold flex items-center gap-2">
              #{userRank}{" "}
              <span className="text-base font-normal opacity-80">
                in {activeTab}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("weekly")}
          className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all text-sm md:text-base ${
            activeTab === "weekly"
              ? "bg-white text-blue-600 shadow-md"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          📅 Weekly
        </button>
        <button
          onClick={() => setActiveTab("alltime")}
          className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all text-sm md:text-base ${
            activeTab === "alltime"
              ? "bg-white text-purple-600 shadow-md"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          🏆 All Time
        </button>
        <button
          onClick={() => setActiveTab("class")}
          className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all text-sm md:text-base ${
            activeTab === "class"
              ? "bg-white text-green-600 shadow-md"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          🎓 Class
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center items-center h-60">
          <Loader className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No records found for this period. Start earning credits!</p>
            </div>
          )}

          {leaderboard.map((item: any, index: number) => {
            const rank = index + 1;
            const isYou =
              activeTab === "class"
                ? item.name === userClass
                : item._id === userId;

            return (
              <div
                key={item._id || index}
                className={`flex items-center justify-between mx-20 p-4 rounded-xl transition transform ${
                  isYou
                    ? "bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-500 scale-[1.02] shadow-md"
                    : "bg-white border border-gray-200 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full font-bold text-lg md:text-xl shadow-sm ${
                      rank === 1
                        ? "bg-gradient-to-br from-yellow-300 to-yellow-500 text-white"
                        : rank === 2
                          ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white"
                          : rank === 3
                            ? "bg-gradient-to-br from-orange-300 to-orange-500 text-white"
                            : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {rank <= 3
                      ? rank === 1
                        ? "👑"
                        : rank === 2
                          ? "🥈"
                          : "🥉"
                      : `#${rank}`}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p
                        className={`font-bold ${isYou ? "text-blue-700" : "text-gray-800"}`}
                      >
                        {item.name}
                        {isYou && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full ml-2">
                            {activeTab === "class" ? "Your Class" : "You"}
                          </span>
                        )}
                      </p>
                    </div>
                    {activeTab === "class" && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {item.studentCount} students
                      </p>
                    )}
                    {item.class && activeTab !== "class" && (
                      <p className="text-xs text-gray-500">{item.class}</p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-xl md:text-2xl font-bold ${
                      activeTab === "weekly"
                        ? "text-green-600"
                        : activeTab === "class"
                          ? "text-orange-600"
                          : "text-purple-600"
                    }`}
                  >
                    {Math.round(item.score)}
                  </p>
                  <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider">
                    {activeTab === "weekly"
                      ? "Weekly Pts"
                      : activeTab === "class"
                        ? "Avg Credits"
                        : "Total Credits"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentLeaderboard;
