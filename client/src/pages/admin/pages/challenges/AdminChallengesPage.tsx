import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trophy,
} from "lucide-react";
import axiosInstance from "@/api/axiosInstance";
import ConfirmationPopup from "@/components/ConfirmationPopup";

interface ChallengeCriteria {
  action:
    | "complete_module"
    | "complete_assessment"
    | "complete_course"
    | "login_streak";
  count: number;
  minScore?: number;
  maxMinutes?: number;
}

interface Challenge {
  _id: string;
  title: string;
  description: string;
  icon: string;
  type: "daily" | "weekly";
  criteria: ChallengeCriteria;
  reward: number;
  isActive: boolean;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  complete_module: "Complete Module(s)",
  complete_assessment: "Pass Assessment(s)",
  complete_course: "Complete Course(s)",
  login_streak: "Login Streak (days)",
};

const EMPTY_FORM = {
  title: "",
  description: "",
  icon: "ðŸŽ¯",
  type: "daily" as "daily" | "weekly",
  criteria: {
    action: "complete_module" as ChallengeCriteria["action"],
    count: 1,
    minScore: 0,
    maxMinutes: 0,
  },
  reward: 10,
  isActive: true,
};

const AdminChallengesPage = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(
    null,
  );
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Challenge | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [tab, setTab] = useState<"all" | "daily" | "weekly">("all");

  const fetchChallenges = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/admin/challenges");
      setChallenges(res.data.challenges || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load challenges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const openAdd = () => {
    setEditingChallenge(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (ch: Challenge) => {
    setEditingChallenge(ch);
    setForm({
      title: ch.title,
      description: ch.description,
      icon: ch.icon,
      type: ch.type,
      criteria: {
        action: ch.criteria.action,
        count: ch.criteria.count,
        minScore: ch.criteria.minScore || 0,
        maxMinutes: ch.criteria.maxMinutes || 0,
      },
      reward: ch.reward,
      isActive: ch.isActive,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setFormError("Title and description are required.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editingChallenge) {
        await axiosInstance.put(
          `/admin/challenges/${editingChallenge._id}`,
          form,
        );
      } else {
        await axiosInstance.post("/admin/challenges", form);
      }
      setModalOpen(false);
      fetchChallenges();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (ch: Challenge) => {
    try {
      await axiosInstance.put(`/admin/challenges/${ch._id}`, {
        isActive: !ch.isActive,
      });
      setChallenges((prev) =>
        prev.map((c) =>
          c._id === ch._id ? { ...c, isActive: !c.isActive } : c,
        ),
      );
    } catch {
      // silent fail â€” refresh will correct state
      fetchChallenges();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`/admin/challenges/${deleteTarget._id}`);
      setChallenges((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const displayed = challenges.filter((c) =>
    tab === "all" ? true : c.type === tab,
  );
  const dailyCount = challenges.filter((c) => c.type === "daily").length;
  const weeklyCount = challenges.filter((c) => c.type === "weekly").length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              Challenge Management
            </h1>
          </div>
          <p className="text-gray-500 text-sm ml-14">
            Create and manage daily &amp; weekly challenges for students
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchChallenges}
            className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-semibold text-sm shadow"
          >
            <Plus className="w-4 h-4" />
            Add Challenge
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total", value: challenges.length, color: "blue" },
          { label: "Daily", value: dailyCount, color: "green" },
          { label: "Weekly", value: weeklyCount, color: "purple" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border rounded-xl p-4 text-center shadow-sm"
          >
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label} Challenges</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(["all", "daily", "weekly"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg font-medium text-sm capitalize transition ${
              tab === t
                ? "bg-purple-600 text-white"
                : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t === "all" ? "All" : t === "daily" ? "ðŸ“… Daily" : "ðŸ“† Weekly"}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed rounded-xl">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            No challenges yet. Click "Add Challenge" to create one.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((ch) => (
            <div
              key={ch._id}
              className={`bg-white border rounded-xl p-4 flex items-center gap-4 shadow-sm transition ${
                !ch.isActive ? "opacity-60" : ""
              }`}
            >
              <span className="text-3xl w-10 text-center">{ch.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-800">
                    {ch.title}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      ch.type === "daily"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {ch.type}
                  </span>
                  {!ch.isActive && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5 truncate">
                  {ch.description}
                </p>
                <div className="flex gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                  <span>
                    ðŸŽ¯ {ACTION_LABELS[ch.criteria.action]}: {ch.criteria.count}
                  </span>
                  {(ch.criteria.minScore || 0) > 0 && (
                    <span>ðŸ“Š Min Score: {ch.criteria.minScore}%</span>
                  )}
                  {(ch.criteria.maxMinutes || 0) > 0 && (
                    <span>âš¡ Under {ch.criteria.maxMinutes}min</span>
                  )}
                  <span className="text-yellow-600 font-medium">
                    +{ch.reward} â­
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleToggle(ch)}
                  className="text-gray-400 hover:text-purple-600 transition"
                  title={ch.isActive ? "Deactivate" : "Activate"}
                >
                  {ch.isActive ? (
                    <ToggleRight className="w-6 h-6 text-purple-500" />
                  ) : (
                    <ToggleLeft className="w-6 h-6" />
                  )}
                </button>
                <button
                  onClick={() => openEdit(ch)}
                  className="p-1.5 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 text-blue-500 transition"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(ch)}
                  className="p-1.5 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 text-red-500 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-lg font-bold text-gray-800">
                {editingChallenge ? "Edit Challenge" : "Add New Challenge"}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Title
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-400 outline-none"
                    placeholder="e.g. Triple Threat"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Description
                  </label>
                  <input
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-400 outline-none"
                    placeholder="e.g. Complete 3 modules today"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Icon (emoji)
                  </label>
                  <input
                    value={form.icon}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, icon: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-400 outline-none"
                    placeholder="ðŸŽ¯"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        type: e.target.value as "daily" | "weekly",
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-400 outline-none"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Action (What triggers progress)
                  </label>
                  <select
                    value={form.criteria.action}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        criteria: {
                          ...f.criteria,
                          action: e.target.value as ChallengeCriteria["action"],
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-400 outline-none"
                  >
                    <option value="complete_module">Complete Module(s)</option>
                    <option value="complete_assessment">
                      Pass Assessment(s)
                    </option>
                    <option value="complete_course">Complete Course(s)</option>
                    <option value="login_streak">Login Streak (days)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Target Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.criteria.count}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        criteria: {
                          ...f.criteria,
                          count: Math.max(1, parseInt(e.target.value) || 1),
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Reward (credits)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.reward}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        reward: Math.max(1, parseInt(e.target.value) || 1),
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-400 outline-none"
                  />
                </div>
                {form.criteria.action === "complete_assessment" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                      Min Score % (0 = any)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form.criteria.minScore}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          criteria: {
                            ...f.criteria,
                            minScore: parseInt(e.target.value) || 0,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-400 outline-none"
                    />
                  </div>
                )}
                {(form.criteria.action === "complete_module" ||
                  form.criteria.action === "complete_assessment") && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                      Max Minutes (0 = no limit)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.criteria.maxMinutes}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          criteria: {
                            ...f.criteria,
                            maxMinutes: parseInt(e.target.value) || 0,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-400 outline-none"
                    />
                  </div>
                )}
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isActive: e.target.checked }))
                    }
                    className="w-4 h-4 text-purple-600"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Active (visible to students)
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-semibold disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingChallenge
                    ? "Update"
                    : "Create Challenge"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmationPopup
          isOpen={!!deleteTarget}
          title="Delete Challenge"
          message={`Are you sure you want to delete "${deleteTarget.title}"? This cannot be undone.`}
          confirmText={deleting ? "Deleting..." : "Delete"}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default AdminChallengesPage;

