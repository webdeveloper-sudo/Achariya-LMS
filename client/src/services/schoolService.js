// Mock School Service
// Since no backend endpoint was specified for schools, we'll provide a list here
// In a real app, this would fetch from /api/schools

export const getSchools = async () => {
  // Return promise to simulate API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: "SCH-001", name: "Achariya Bala Siksha Mandir" },
        { id: "SCH-002", name: "Achariya Siksha Mandir" },
        { id: "SCH-003", name: "Achariya College of Engineering" },
        { id: "SCH-004", name: "Achariya Arts and Science College" },
        { id: "SCH-005", name: "Aditya Vidyashram" },
        // Add more as per "35+ schools" context, but this is enough for UI
      ]);
    }, 300);
  });
};
