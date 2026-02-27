import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Teacher {
  id: string;
  userId: string;
  userName: string;
  email: string;
  role: string;
}

interface TeacherState {
  teacher: Teacher | null;
  isAuthenticated: boolean;
  token: string | null;

  // Actions
  login: (teacher: Teacher, token: string) => void;
  logout: () => void;
  updateTeacher: (updates: Partial<Teacher>) => void;
}

export const useTeacherStore = create<TeacherState>()(
  persist(
    (set) => ({
      teacher: null,
      isAuthenticated: false,
      token: null,

      login: (teacher, token) => set({ teacher, isAuthenticated: true, token }),

      logout: () => {
        set({ teacher: null, isAuthenticated: false, token: null });
      },

      updateTeacher: (updates) =>
        set((state) => ({
          teacher: state.teacher ? { ...state.teacher, ...updates } : null,
        })),
    }),
    {
      name: "teacher-storage",
      partialize: (state) => ({
        teacher: state.teacher,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
    },
  ),
);
