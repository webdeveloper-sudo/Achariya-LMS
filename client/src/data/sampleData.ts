// Centralized sample data - shared across all views for consistency

export const sampleData = {
    // Schools
    schools: [
        { id: 1, name: 'Achariya School of Excellence', location: 'Chennai', type: 'School' },
        { id: 2, name: 'Achariya College of Engineering', location: 'Bangalore', type: 'College' }
    ],

    // Students with detailed progress + GAMIFICATION FIELDS
    students: [
        { id: 1, name: 'Pranav R', email: 'pranav.r@achariya.org', school_id: 1, class: '8-A', completion: 85, quiz_avg: 92, badges: 3, credits: 45, status: 'Active', currentStreak: 5, longestStreak: 12, lastLoginDate: '2025-12-10', streakFreezeUsed: false },
        { id: 2, name: 'Aisha Khan', email: 'aisha.k@achariya.org', school_id: 1, class: '10-A', completion: 92, quiz_avg: 95, badges: 4, credits: 55, status: 'Active', currentStreak: 8, longestStreak: 15, lastLoginDate: '2025-12-10', streakFreezeUsed: false },
        { id: 3, name: 'Arjun Srinivasan', email: 'arjun.s@achariya.org', school_id: 1, class: '10-B', completion: 78, quiz_avg: 88, badges: 2, credits: 35, status: 'Active', currentStreak: 2, longestStreak: 7, lastLoginDate: '2025-12-09', streakFreezeUsed: false },
        { id: 4, name: 'Divya Menon', email: 'divya.m@achariya.org', school_id: 1, class: '10-B', completion: 88, quiz_avg: 90, badges: 3, credits: 42, status: 'Active', currentStreak: 15, longestStreak: 15, lastLoginDate: '2025-12-10', streakFreezeUsed: false },
        { id: 5, name: 'Rahul Patel', email: 'rahul.p@achariya.org', school_id: 1, class: '12 Science', completion: 95, quiz_avg: 98, badges: 5, credits: 65, status: 'Active', currentStreak: 23, longestStreak: 30, lastLoginDate: '2025-12-10', streakFreezeUsed: false },
        { id: 6, name: 'Sneha Gupta', email: 'sneha.g@achariya.org', school_id: 2, class: 'CS Year 1', completion: 82, quiz_avg: 87, badges: 2, credits: 38, status: 'Active', currentStreak: 0, longestStreak: 5, lastLoginDate: '2025-12-05', streakFreezeUsed: false },
        { id: 7, name: 'Vikram Joshi', email: 'vikram.j@achariya.org', school_id: 2, class: 'CS Year 2', completion: 90, quiz_avg: 93, badges: 4, credits: 50, status: 'Active', currentStreak: 10, longestStreak: 18, lastLoginDate: '2025-12-10', streakFreezeUsed: false },
        { id: 8, name: 'Priya Nair', email: 'priya.n@achariya.org', school_id: 2, class: 'CS Year 2', completion: 87, quiz_avg: 91, badges: 3, credits: 44, status: 'Active', currentStreak: 3, longestStreak: 9, lastLoginDate: '2025-12-10', streakFreezeUsed: false },
        { id: 9, name: 'Karthik Balan', email: 'karthik.b@achariya.org', school_id: 2, class: 'CS Year 3', completion: 93, quiz_avg: 96, badges: 5, credits: 58, status: 'Active', currentStreak: 7, longestStreak: 14, lastLoginDate: '2025-12-10', streakFreezeUsed: false },
        { id: 10, name: 'Ananya Varma', email: 'ananya.v@achariya.org', school_id: 2, class: 'CS Year 3', completion: 75, quiz_avg: 85, badges: 1, credits: 28, status: 'Active', currentStreak: 1, longestStreak: 4, lastLoginDate: '2025-12-10', streakFreezeUsed: false }
    ],

    // Teachers with performance metrics
    teachers: [
        { id: 1, name: 'Hari Krishnan', email: 'hari@achariya.org', school_id: 1, department: 'Mathematics', courses: 2, students: 25, completion_avg: 88, badges: 2, credits: 120 },
        { id: 2, name: 'Meena Sundaram', email: 'meena@achariya.org', school_id: 1, department: 'Science', courses: 2, students: 28, completion_avg: 85, badges: 3, credits: 150 },
        { id: 3, name: 'Kumar Venkatraman', email: 'kumar@achariya.org', school_id: 2, department: 'Computer Science', courses: 3, students: 30, completion_avg: 90, badges: 4, credits: 180 },
        { id: 4, name: 'Lakshmi Narayanan', email: 'lakshmi@achariya.org', school_id: 2, department: 'Computer Science', courses: 2, students: 25, completion_avg: 87, badges: 2, credits: 135 }
    ],

    // Courses with engagement metrics
    courses: [
        { id: 1, title: 'Advanced Mathematics', subject: 'Mathematics', level: 'Advanced', school_id: 1, teacher_id: 1, enrollments: 15, completion_avg: 85, active_users: 14, traffic: 'High' },
        { id: 2, title: 'Physics Fundamentals', subject: 'Physics', level: 'Intermediate', school_id: 1, teacher_id: 1, enrollments: 12, completion_avg: 80, active_users: 11, traffic: 'Medium' },
        { id: 3, title: 'English Literature', subject: 'English', level: 'Intermediate', school_id: 1, teacher_id: 2, enrollments: 10, completion_avg: 90, active_users: 10, traffic: 'Low' },
        { id: 7, title: 'Chemistry Basics', subject: 'Chemistry', level: 'Intermediate', school_id: 1, teacher_id: 2, enrollments: 14, completion_avg: 82, active_users: 13, traffic: 'Medium' },
        { id: 4, title: 'Data Structures and Algorithms', subject: 'Computer Science', level: 'Advanced', school_id: 2, teacher_id: 3, enrollments: 18, completion_avg: 88, active_users: 17, traffic: 'High' },
        { id: 5, title: 'Database Management Systems', subject: 'Computer Science', level: 'Intermediate', school_id: 2, teacher_id: 3, enrollments: 15, completion_avg: 86, active_users: 14, traffic: 'High' },
        { id: 6, title: 'Web Development', subject: 'Computer Science', level: 'Beginner', school_id: 2, teacher_id: 4, enrollments: 20, completion_avg: 82, active_users: 19, traffic: 'High' }
    ],

    // Modules per course
    modules: [
        // Advanced Mathematics modules
        { id: 1, course_id: 1, title: 'Calculus Fundamentals', order: 1, completion_rate: 90 },
        { id: 2, course_id: 1, title: 'Linear Algebra', order: 2, completion_rate: 85 },
        { id: 3, course_id: 1, title: 'Probability & Statistics', order: 3, completion_rate: 80, explainerUrl: '/explainers/probability-statistics.mp4' }, // POC

        // Physics modules
        { id: 4, course_id: 2, title: 'Mechanics', order: 1, completion_rate: 88 },
        { id: 5, course_id: 2, title: 'Thermodynamics', order: 2, completion_rate: 82 },
        { id: 6, course_id: 2, title: 'Electromagnetism', order: 3, completion_rate: 85, explainerUrl: '/explainers/electromagnetism.mp4' }, // POC

        // English Lit modules
        { id: 13, course_id: 3, title: 'Shakespeare', order: 1, completion_rate: 92 },
        { id: 14, course_id: 3, title: 'Modern Poetry', order: 2, completion_rate: 88 },

        // Data Structures modules
        { id: 7, course_id: 4, title: 'Arrays & Linked Lists', order: 1, completion_rate: 90 },
        { id: 8, course_id: 4, title: 'Trees & Graphs', order: 2, completion_rate: 85 },
        { id: 9, course_id: 4, title: 'Dynamic Programming', order: 3, completion_rate: 80, explainerUrl: '/explainers/dynamic-programming.mp4' }, // POC

        // DBMS modules
        { id: 10, course_id: 5, title: 'Relational Databases', order: 1, completion_rate: 88 },
        { id: 11, course_id: 5, title: 'SQL Queries', order: 2, completion_rate: 85 },

        // Web Dev modules
        { id: 12, course_id: 6, title: 'HTML & CSS', order: 1, completion_rate: 90 }
    ],

    // Quizzes for modules
    quizzes: [
        {
            id: 1,
            moduleId: 1,
            courseId: 1,
            title: 'Calculus Fundamentals Quiz',
            timeLimit: 120,
            maxAttempts: 3,
            questions: [
                { id: 1, question: 'What is the derivative of x²?', options: ['x', '2x', '2', 'x²'], correctAnswer: 1, explanation: 'Using the power rule: d/dx(xⁿ) = n·xⁿ⁻¹, so d/dx(x²) = 2x' },
                { id: 2, question: 'What is the integral of 2x?', options: ['x²', 'x² + C', '2', '2x²'], correctAnswer: 1, explanation: 'The integral of 2x is x² + C, where C is the constant of integration' },
                { id: 3, question: 'What is the limit of (x² - 1)/(x - 1) as x approaches 1?', options: ['0', '1', '2', 'undefined'], correctAnswer: 2, explanation: 'Factor: (x-1)(x+1)/(x-1) = x+1. As x→1, limit = 2' },
                { id: 4, question: 'What is d/dx[sin(x)]?', options: ['cos(x)', '-cos(x)', 'sin(x)', '-sin(x)'], correctAnswer: 0, explanation: 'The derivative of sin(x) is cos(x)' },
                { id: 5, question: 'What is the derivative of a constant?', options: ['1', '0', 'The constant', 'undefined'], correctAnswer: 1, explanation: 'The derivative of any constant is 0' }
            ]
        },
        {
            id: 2,
            moduleId: 6,
            courseId: 2,
            title: 'Electromagnetism Quiz',
            timeLimit: 120,
            maxAttempts: 3,
            questions: [
                { id: 1, question: 'What is the unit of electric charge?', options: ['Ampere', 'Coulomb', 'Volt', 'Ohm'], correctAnswer: 1, explanation: 'The unit is Coulomb (C)' },
                { id: 2, question: "What does Faraday's law state?", options: ['V=IR', 'Changing magnetic field induces EMF', 'Like charges repel', 'E=mc²'], correctAnswer: 1, explanation: "Faraday's law: changing magnetic flux induces EMF" },
                { id: 3, question: 'Speed of light in vacuum?', options: ['3×10⁶ m/s', '3×10⁸ m/s', '3×10¹⁰ m/s', '3×10¹² m/s'], correctAnswer: 1, explanation: 'c = 3×10⁸ m/s' },
                { id: 4, question: 'What carries current in metals?', options: ['Protons', 'Neutrons', 'Electrons', 'Photons'], correctAnswer: 2, explanation: 'Electrons carry current in metals' },
                { id: 5, question: "What is Ohm's law?", options: ['V=IR', 'F=ma', 'E=mc²', 'P=VI'], correctAnswer: 0, explanation: "Ohm's law: V = IR" }
            ]
        }
    ],

    // Student enrollments with detailed progress (FIXED TO MATCH COURSE COUNTS)
    enrollments: [
        // Advanced Math (15 students as per course data)
        { student_id: 1, course_id: 1, progress: 85, modules_completed: 2, total_modules: 3, last_active: '2025-12-05' },
        { student_id: 2, course_id: 1, progress: 92, modules_completed: 3, total_modules: 3, last_active: '2025-12-05' },
        { student_id: 3, course_id: 1, progress: 78, modules_completed: 2, total_modules: 3, last_active: '2025-12-03' },
        { student_id: 4, course_id: 1, progress: 88, modules_completed: 3, total_modules: 3, last_active: '2025-12-05' },
        { student_id: 5, course_id: 1, progress: 95, modules_completed: 3, total_modules: 3, last_active: '2025-12-05' },
        { student_id: 6, course_id: 1, progress: 82, modules_completed: 2, total_modules: 3, last_active: '2025-12-04' },
        { student_id: 7, course_id: 1, progress: 90, modules_completed: 3, total_modules: 3, last_active: '2025-12-05' },
        { student_id: 8, course_id: 1, progress: 87, modules_completed: 2, total_modules: 3, last_active: '2025-12-04' },
        { student_id: 9, course_id: 1, progress: 93, modules_completed: 3, total_modules: 3, last_active: '2025-12-05' },
        { student_id: 10, course_id: 1, progress: 75, modules_completed: 1, total_modules: 3, last_active: '2025-12-02' },
        { student_id: 1, course_id: 1, progress: 80, modules_completed: 2, total_modules: 3, last_active: '2025-12-04' },
        { student_id: 2, course_id: 1, progress: 85, modules_completed: 2, total_modules: 3, last_active: '2025-12-05' },
        { student_id: 3, course_id: 1, progress: 90, modules_completed: 3, total_modules: 3, last_active: '2025-12-05' },
        { student_id: 4, course_id: 1, progress: 83, modules_completed: 2, total_modules: 3, last_active: '2025-12-04' },
        { student_id: 5, course_id: 1, progress: 88, modules_completed: 2, total_modules: 3, last_active: '2025-12-05' },

        // Physics (12 students)
        { student_id: 1, course_id: 2, progress: 75, modules_completed: 2, total_modules: 3, last_active: '2025-12-04' },
        { student_id: 2, course_id: 2, progress: 82, modules_completed: 2, total_modules: 3, last_active: '2025-12-05' },
        { student_id: 3, course_id: 2, progress: 78, modules_completed: 2, total_modules: 3, last_active: '2025-12-04' },
        { student_id: 4, course_id: 2, progress: 85, modules_completed: 3, total_modules: 3, last_active: '2025-12-05' },
        { student_id: 5, course_id: 2, progress: 90, modules_completed: 3, total_modules: 3, last_active: '2025-12-05' },
        { student_id: 6, course_id: 2, progress: 80, modules_completed: 2, total_modules: 3, last_active: '2025-12-04' },
        { student_id: 7, course_id: 2, progress: 77, modules_completed: 2, total_modules: 3, last_active: '2025-12-03' },
        { student_id: 8, course_id: 2, progress: 83, modules_completed: 2, total_modules: 3, last_active: '2025-12-04' },
        { student_id: 9, course_id: 2, progress: 88, modules_completed: 3, total_modules: 3, last_active: '2025-12-05' },
        { student_id: 10, course_id: 2, progress: 72, modules_completed: 1, total_modules: 3, last_active: '2025-12-02' },
        { student_id: 1, course_id: 2, progress: 80, modules_completed: 2, total_modules: 3, last_active: '2025-12-04' },
        { student_id: 2, course_id: 2, progress: 85, modules_completed: 2, total_modules: 3, last_active: '2025-12-05' },

        // English Lit (10 students)
        { student_id: 1, course_id: 3, progress: 92, modules_completed: 2, total_modules: 2, last_active: '2025-12-05' },
        { student_id: 2, course_id: 3, progress: 95, modules_completed: 2, total_modules: 2, last_active: '2025-12-05' },
        { student_id: 3, course_id: 3, progress: 88, modules_completed: 2, total_modules: 2, last_active: '2025-12-04' },
        { student_id: 4, course_id: 3, progress: 90, modules_completed: 2, total_modules: 2, last_active: '2025-12-05' },
        { student_id: 5, course_id: 3, progress: 95, modules_completed: 2, total_modules: 2, last_active: '2025-12-05' },
        { student_id: 6, course_id: 3, progress: 87, modules_completed: 1, total_modules: 2, last_active: '2025-12-04' },
        { student_id: 7, course_id: 3, progress: 93, modules_completed: 2, total_modules: 2, last_active: '2025-12-05' },
        { student_id: 8, course_id: 3, progress: 89, modules_completed: 2, total_modules: 2, last_active: '2025-12-05' },
        { student_id: 9, course_id: 3, progress: 91, modules_completed: 2, total_modules: 2, last_active: '2025-12-05' },
        { student_id: 10, course_id: 3, progress: 85, modules_completed: 1, total_modules: 2, last_active: '2025-12-03' },

        // DSA (18 students)  
        { student_id: 6, course_id: 4, progress: 82, modules_completed: 2, total_modules: 3, last_active: '2025-12-05' },
        { student_id: 7, course_id: 4, progress: 90, modules_completed: 3, total_modules: 3, last_active: '2025-12-05' },
        { student_id: 8, course_id: 4, progress: 87, modules_completed: 2, total_modules: 3, last_active: '2025-12-04' },
        { student_id: 9, course_id: 4, progress: 93, modules_completed: 3, total_modules: 3, last_active: '2025-12-05' },
        { student_id: 10, course_id: 4, progress: 85, modules_completed: 2, total_modules: 3, last_active: '2025-12-04' },
        { student_id: 1, course_id: 4, progress: 88, modules_completed: 2, total_modules: 3, last_active: '2025-12-05' },
        { student_id: 2, course_id: 4, progress: 92, modules_completed: 3, total_modules: 3, last_active: '2025-12-05' },
        { student_id: 3, course_id: 4, progress: 80, modules_completed: 2, total_modules: 3, last_active: '2025-12-03' },
        { student_id: 4, course_id: 4, progress: 87, modules_completed: 2, total_modules: 3, last_active: '2025-12-04' },
        { student_id: 5, course_id: 4, progress: 95, modules_completed: 3, total_modules: 3, last_active: '2025-12-05' },
        { student_id: 6, course_id: 4, progress: 85, modules_completed: 2, total_modules: 3, last_active: '2025-12-04' },
        { student_id: 7, course_id: 4, progress: 90, modules_completed: 3, total_modules: 3, last_active: '2025-12-05' },
        { student_id: 8, course_id: 4, progress: 86, modules_completed: 2, total_modules: 3, last_active: '2025-12-04' },
        { student_id: 9, course_id: 4, progress: 91, modules_completed: 3, total_modules: 3, last_active: '2025-12-05' },
        { student_id: 10, course_id: 4, progress: 83, modules_completed: 2, total_modules: 3, last_active: '2025-12-03' },
        { student_id: 1, course_id: 4, progress: 89, modules_completed: 2, total_modules: 3, last_active: '2025-12-05' },
        { student_id: 2, course_id: 4, progress: 94, modules_completed: 3, total_modules: 3, last_active: '2025-12-05' },
        { student_id: 3, course_id: 4, progress: 82, modules_completed: 2, total_modules: 3, last_active: '2025-12-04' },

        // DBMS (15 students)
        { student_id: 9, course_id: 5, progress: 93, modules_completed: 2, total_modules: 2, last_active: '2025-12-05' },
        { student_id: 8, course_id: 5, progress: 88, modules_completed: 2, total_modules: 2, last_active: '2025-12-05' },
        { student_id: 7, course_id: 5, progress: 85, modules_completed: 2, total_modules: 2, last_active: '2025-12-04' },
        { student_id: 6, course_id: 5, progress: 82, modules_completed: 1, total_modules: 2, last_active: '2025-12-03' },
        { student_id: 10, course_id: 5, progress: 90, modules_completed: 2, total_modules: 2, last_active: '2025-12-05' },
        { student_id: 1, course_id: 5, progress: 87, modules_completed: 2, total_modules: 2, last_active: '2025-12-05' },
        { student_id: 2, course_id: 5, progress: 91, modules_completed: 2, total_modules: 2, last_active: '2025-12-05' },
        { student_id: 3, course_id: 5, progress: 83, modules_completed: 1, total_modules: 2, last_active: '2025-12-03' },
        { student_id: 4, course_id: 5, progress: 86, modules_completed: 2, total_modules: 2, last_active: '2025-12-04' },
        { student_id: 5, course_id: 5, progress: 89, modules_completed: 2, total_modules: 2, last_active: '2025-12-05' },
        { student_id: 6, course_id: 5, progress: 84, modules_completed: 1, total_modules: 2, last_active: '2025-12-04' },
        { student_id: 7, course_id: 5, progress: 88, modules_completed: 2, total_modules: 2, last_active: '2025-12-05' },
        { student_id: 8, course_id: 5, progress: 85, modules_completed: 2, total_modules: 2, last_active: '2025-12-04' },
        { student_id: 9, course_id: 5, progress: 90, modules_completed: 2, total_modules: 2, last_active: '2025-12-05' },
        { student_id: 10, course_id: 5, progress: 82, modules_completed: 1, total_modules: 2, last_active: '2025-12-03' },

        // Web Dev (20 students - all 10 students enrolled twice for demo)
        { student_id: 1, course_id: 6, progress: 85, modules_completed: 1, total_modules: 1, last_active: '2025-12-05' },
        { student_id: 2, course_id: 6, progress: 88, modules_completed: 1, total_modules: 1, last_active: '2025-12-05' },
        { student_id: 3, course_id: 6, progress: 80, modules_completed: 1, total_modules: 1, last_active: '2025-12-04' },
        { student_id: 4, course_id: 6, progress: 83, modules_completed: 1, total_modules: 1, last_active: '2025-12-05' },
        { student_id: 5, course_id: 6, progress: 90, modules_completed: 1, total_modules: 1, last_active: '2025-12-05' },
        { student_id: 6, course_id: 6, progress: 78, modules_completed: 1, total_modules: 1, last_active: '2025-12-03' },
        { student_id: 7, course_id: 6, progress: 82, modules_completed: 1, total_modules: 1, last_active: '2025-12-04' },
        { student_id: 8, course_id: 6, progress: 85, modules_completed: 1, total_modules: 1, last_active: '2025-12-05' },
        { student_id: 9, course_id: 6, progress: 87, modules_completed: 1, total_modules: 1, last_active: '2025-12-05' },
        { student_id: 10, course_id: 6, progress: 75, modules_completed: 1, total_modules: 1, last_active: '2025-12-02' },
        { student_id: 1, course_id: 6, progress: 80, modules_completed: 1, total_modules: 1, last_active: '2025-12-04' },
        { student_id: 2, course_id: 6, progress: 83, modules_completed: 1, total_modules: 1, last_active: '2025-12-05' },
        { student_id: 3, course_id: 6, progress: 77, modules_completed: 1, total_modules: 1, last_active: '2025-12-03' },
        { student_id: 4, course_id: 6, progress: 81, modules_completed: 1, total_modules: 1, last_active: '2025-12-04' },
        { student_id: 5, course_id: 6, progress: 86, modules_completed: 1, total_modules: 1, last_active: '2025-12-05' },
        { student_id: 6, course_id: 6, progress: 79, modules_completed: 1, total_modules: 1, last_active: '2025-12-04' },
        { student_id: 7, course_id: 6, progress: 84, modules_completed: 1, total_modules: 1, last_active: '2025-12-05' },
        { student_id: 8, course_id: 6, progress: 82, modules_completed: 1, total_modules: 1, last_active: '2025-12-04' },
        { student_id: 9, course_id: 6, progress: 88, modules_completed: 1, total_modules: 1, last_active: '2025-12-05' },
        { student_id: 10, course_id: 6, progress: 76, modules_completed: 1, total_modules: 1, last_active: '2025-12-03' }
    ],

    // Badge definitions
    badges: [
        { id: 1, code: 'SPEED_MASTER', name: 'Speed Master', description: 'Complete quizzes quickly', activity: 'Quiz completion under 60 seconds' },
        { id: 2, code: 'HIGH_PERFORMER', name: 'High Performer', description: 'Achieve 95%+ scores', activity: 'Scored 95%+ on 5 quizzes' },
        { id: 3, code: 'CONSISTENT', name: 'Consistent Learner', description: 'Login 30 days straight', activity: '30-day login streak' },
        { id: 4, code: 'EXCELLENCE', name: 'Excellence Award', description: 'Top performer', activity: 'Top 3 in class ranking' },
        { id: 5, code: 'MENTOR', name: 'Mentor Badge', description: 'Help other students', activity: 'Assisted 10+ peers' }
    ],

    // Weekly activity data for charts
    weeklyActivity: [
        { week: 'Week 1', students: 42, logins: 156 },
        { week: 'Week 2', students: 48, logins: 182 },
        { week: 'Week 3', students: 45, logins: 168 },
        { week: 'Week 4', students: 52, logins: 195 }
    ],

    // Completion by grade/class
    completionByGrade: [
        { grade: '10-A', completion: 88, students: 15 },
        { grade: '10-B', completion: 83, students: 13 },
        { grade: '12 Science', completion: 95, students: 8 },
        { grade: 'CS Year 1', completion: 82, students: 12 },
        { grade: 'CS Year 2', completion: 89, students: 15 },
        { grade: 'CS Year 3', completion: 84, students: 10 }
    ]
};

// Helper functions
export const getTopPerformers = (limit = 5) => {
    return [...sampleData.students]
        .sort((a, b) => b.completion - a.completion)
        .slice(0, limit);
};

export const getTopBadgeHolders = (limit = 5) => {
    const allUsers = [
        ...sampleData.students.map(s => ({ ...s, type: 'Student' })),
        ...sampleData.teachers.map(t => ({ ...t, type: 'Teacher' }))
    ];
    return allUsers.sort((a, b) => b.badges - a.badges).slice(0, limit);
};

export const getHighTrafficCourses = () => {
    return sampleData.courses
        .filter(c => c.traffic === 'High')
        .sort((a, b) => b.active_users - a.active_users);
};

export const getCoursesBySchool = (schoolId: number) => {
    return sampleData.courses.filter(c => c.school_id === schoolId);
};

export const getStudentsByCourse = (courseId: number) => {
    const enrollments = sampleData.enrollments.filter(e => e.course_id === courseId);
    return enrollments.map(e => {
        const student = sampleData.students.find(s => s.id === e.student_id);
        return { ...student, ...e };
    });
};

export const getStudentDetails = (studentId: number) => {
    const student = sampleData.students.find(s => s.id === studentId);
    const studentEnrollments = sampleData.enrollments.filter(e => e.student_id === studentId);
    const courses = studentEnrollments.map(e => {
        const course = sampleData.courses.find(c => c.id === e.course_id);
        return { ...course, progress: e.progress };
    });
    return { ...student, courses };
};
