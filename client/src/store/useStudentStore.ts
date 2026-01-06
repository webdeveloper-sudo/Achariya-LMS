import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface EnrolledCourse {
  courseId: string;
  title: string;
  enrolledAt: string;
  completedModules: string[];
  currentModule?: string;
  progress: number;
}

interface Student {
  admissionNo: string;
  name: string;
  email: string;
  credits: number;
  creditHistory?: any[];
  badges: string[];
  currentStreak: number;
  longestStreak?: number;
  lastLoginAt: string;
  role: string;
  enrolledCourses: EnrolledCourse[];
}

interface StudentState {
  student: Student | null;
  isAuthenticated: boolean;
  token: string | null;

  // Actions
  login: (student: Student, token: string) => void;
  logout: () => void;
  updateStudent: (updates: Partial<Student>) => void;
  enrollInCourse: (course: EnrolledCourse) => void;
}

export const useStudentStore = create<StudentState>()(
  persist(
    (set) => ({
      student: null,
      isAuthenticated: false,
      token: null,

      login: (student, token) => set({ student, isAuthenticated: true, token }),

      logout: () => {
        localStorage.removeItem("studentToken"); // Clear legacy if any
        set({ student: null, isAuthenticated: false, token: null });
      },

      updateStudent: (updates) =>
        set((state) => ({
          student: state.student ? { ...state.student, ...updates } : null,
        })),

      enrollInCourse: (course) =>
        set((state) => ({
          student: state.student
            ? {
                ...state.student,
                enrolledCourses: [
                  ...(state.student.enrolledCourses || []),
                  course,
                ],
              }
            : null,
        })),
    }),
    {
      name: "student-storage", // unique name
      partialize: (state) => ({
        student: state.student,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
    }
  )
);
