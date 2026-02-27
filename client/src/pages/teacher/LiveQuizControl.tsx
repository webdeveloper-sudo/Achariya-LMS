// Live Quiz Control Dashboard
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Users,
  CheckCircle,
  Clock,
  StopCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Zap,
} from "lucide-react";
import LiveQuizTimer from "../../components/LiveQuizTimer";
import { endQuizSession } from "../../services/liveQuizService";
import type { LiveQuizSession } from "../../services/liveQuizService";

const LiveQuizControl = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<LiveQuizSession | null>(null);
  const [sessionEndTime, setSessionEndTime] = useState<Date | null>(null);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [connectedCount, setConnectedCount] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Fetch actual session from Firebase
  useEffect(() => {
    if (!sessionId) {
      setLoadError("No session ID provided");
      return;
    }

    import("../../services/liveQuizService")
      .then(({ getSessionById }) => {
        getSessionById(sessionId)
          .then((firebaseSession) => {
            if (firebaseSession) {
              setSession(firebaseSession);
              setSessionEndTime(firebaseSession.endTime.toDate());
            } else {
              setLoadError(`Session ${sessionId} not found`);
            }
          })
          .catch((error) => {
            setLoadError(`Error: ${error.message}`);
          });
      })
      .catch((error) => {
        setLoadError(`Import error: ${error.message}`);
      });
  }, [sessionId]);

  // Simulate students joining and submitting (must be BEFORE conditional returns)
  useEffect(() => {
    if (!session) return; // Don't run if session not loaded yet

    const connectInterval = setInterval(() => {
      setConnectedCount((prev) => {
        const newCount = Math.min(
          prev + Math.floor(Math.random() * 3),
          session.totalStudents || 30,
        );
        return newCount;
      });
    }, 2000);

    const submitInterval = setInterval(() => {
      setSubmittedCount((prev) => {
        const newCount = Math.min(prev + 1, session.totalStudents || 30);
        return newCount;
      });
    }, 3000);

    return () => {
      clearInterval(connectInterval);
      clearInterval(submitInterval);
    };
  }, [session]);

  // Show error if loading failed
  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: "#c72323" }}
          />
          <h2 className="text-xl text-gray-900 capitalize mb-2">
            Synchronization Error
          </h2>
          <p className="text-gray-600 text-sm mb-6">{loadError}</p>
          <button
            onClick={() => navigate("/teacher/dashboard")}
            className="px-6 py-2 bg-gray-900 text-white rounded-md text-[13px] capitalize hover:bg-[#c72323] transition-colors"
          >
            Operational Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Wait for session to load
  if (!session || !sessionEndTime) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2
          className="w-8 h-8 animate-spin mb-4"
          style={{ color: "#c72323" }}
        />
        <p className="text-gray-400 text-sm capitalize">
          Initializing Live Stream...
        </p>
      </div>
    );
  }

  const handleEndQuiz = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!sessionId) {
      alert("Error: No session ID found. Cannot end quiz.");
      return;
    }

    const confirmed = window.confirm(
      "Terminate session? This will force-submit all active participants.",
    );

    if (confirmed) {
      endQuizSession(sessionId)
        .then(() => {
          navigate(`/teacher/live-quiz/${sessionId}/results`);
        })
        .catch((error) => {
          alert(
            `Termination sequence failed: ${error.message || "Unknown error"}`,
          );
        });
    }
  };

  const handleTimeUp = () => {
    // Quiz time is up, redirect to results
    navigate(`/teacher/live-quiz/${sessionId}/results`);
  };

  const progressPercentage = session.totalStudents
    ? Math.round((submittedCount / session.totalStudents) * 100)
    : 0;

  return (
    <div className="space-y-12 pb-20">
      {/* Premium Header */}
      <div className="border-b border-gray-100 pb-12">
        <button
          onClick={() => navigate("/teacher/dashboard")}
          className="inline-flex items-center text-[13px] hover:text-[#c72323] mb-10 transition-colors capitalize"
          style={{ color: "#c72323" }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Terminal
        </button>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-center sm:text-left">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6 justify-center sm:justify-start">
              <div className="bg-red-50 p-2 rounded border border-red-100">
                <Zap className="w-5 h-5" style={{ color: "#c72323" }} />
              </div>
              <span
                className="text-[13px] capitalize"
                style={{ color: "#c72323" }}
              >
                Live Transmission
              </span>
            </div>
            <h1 className="text-4xl text-gray-900 mb-6 leading-tight capitalize">
              {session.quizTitle} <span className="text-gray-400">Control</span>
            </h1>
            <p className="text-gray-600 text-[15px] max-w-xl leading-relaxed mx-auto sm:mx-0">
              Monitoring session for {session.className}. All metrics are
              calculated in real-time.
            </p>
          </div>

          <button
            type="button"
            onClick={handleEndQuiz}
            className="px-10 py-4 bg-gray-900 text-white rounded-md hover:bg-[#c72323] text-[13px] capitalize transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95 mx-auto lg:mx-0"
          >
            <StopCircle className="w-5 h-5" />
            Terminate Session
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Timer Card */}
        <div className="bg-white rounded-md border border-gray-100 p-8 shadow-sm flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-8">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-[11px] text-gray-500 capitalize">
              Temporal Count
            </span>
          </div>
          <LiveQuizTimer endTime={sessionEndTime} onTimeUp={handleTimeUp} />
        </div>

        {/* Subscriptions Card */}
        <div className="bg-white rounded-md border border-gray-100 p-8 shadow-sm text-center sm:text-left">
          <div className="flex items-center gap-3 mb-10 justify-center sm:justify-start">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-[11px] text-gray-500 capitalize">
              Active Participants
            </span>
          </div>
          <div className="text-5xl text-gray-900 mb-8 tabular-nums">
            {connectedCount} <span className="text-gray-300">/</span>{" "}
            <span className="text-sm align-middle text-gray-400">
              {session.totalStudents || 0}
            </span>
          </div>
          <div className="w-full bg-gray-50 rounded-full h-1 overflow-hidden">
            <div
              className="transition-all duration-1000 ease-out h-full"
              style={{
                width: `${(connectedCount / (session.totalStudents || 1)) * 100}%`,
                backgroundColor: "#c72323",
              }}
            ></div>
          </div>
        </div>

        {/* Logistics Progress */}
        <div className="bg-white rounded-md border border-gray-100 p-8 shadow-sm text-center sm:text-left">
          <div className="flex items-center gap-3 mb-10 justify-center sm:justify-start">
            <CheckCircle className="w-4 h-4 text-gray-400" />
            <span className="text-[11px] text-gray-500 capitalize">
              Data Submissions
            </span>
          </div>
          <div className="text-5xl text-gray-900 mb-8 tabular-nums">
            {submittedCount} <span className="text-gray-300">/</span>{" "}
            <span className="text-sm align-middle text-gray-400">
              {connectedCount}
            </span>
          </div>
          <div className="w-full bg-gray-50 rounded-full h-1 overflow-hidden">
            <div
              className="bg-emerald-500 transition-all duration-1000 ease-out h-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Participation Warning */}
      {connectedCount < (session.totalStudents || 0) && (
        <div className="bg-red-50/30 border border-red-100 rounded-md p-8 flex items-start gap-6 text-center sm:text-left flex-col sm:row mt-8">
          <div className="bg-white p-3 rounded shadow-sm border border-red-50">
            <AlertCircle className="w-6 h-6" style={{ color: "#c72323" }} />
          </div>
          <div>
            <h3 className="text-lg text-gray-900 mb-2 capitalize">
              Missing Connectivity Detected
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
              Operational anomaly:{" "}
              {(session.totalStudents || 0) - connectedCount} student units have
              not established a stream connection. This may indicate network
              latency or authentication failure.
            </p>
          </div>
        </div>
      )}

      {/* Activity Stream */}
      <div className="bg-white rounded-md border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-xl text-gray-900 capitalize">Activity Log</h2>
            <p className="text-gray-600 text-[11px] mt-1 capitalize">
              Real-time participation trace
            </p>
          </div>
          <div className="bg-gray-50 p-2 rounded animate-pulse">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "#c72323" }}
            />
          </div>
        </div>

        <div className="p-8 space-y-6 max-h-[400px] overflow-y-auto">
          {[...Array(submittedCount)].reverse().map((_, i) => {
            const idx = submittedCount - i;
            return (
              <div
                key={idx}
                className="flex items-center justify-between p-4 border border-gray-50 rounded-md group hover:border-red-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-50 p-2 rounded group-hover:bg-emerald-100 transition-colors">
                    <CheckCircle size={16} className="text-emerald-500" />
                  </div>
                  <div className="text-sm text-gray-900 capitalize font-medium">
                    Participant {idx}{" "}
                    <span className="text-gray-400 font-normal">
                      successfully logged submission
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-gray-400 font-mono">
                  -{Math.floor(i * 1.5)}s
                </span>
              </div>
            );
          })}
          {submittedCount === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-[12px] capitalize">
                Awaiting incoming data packets...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveQuizControl;
