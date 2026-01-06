export const faqData = {
    student: [
        {
            question: "How do I enroll in a course?",
            answer: "Navigate to the Courses page from your dashboard. Browse available courses and click 'Enroll' on any course card. Your enrollment will be confirmed immediately, and the course will appear in your Active Courses."
        },
        {
            question: "How are quiz credits calculated?",
            answer: "Credits are awarded based on your performance: 15 credits for 100% score in ≤60 seconds (Fast & Full), 10 credits for 100% score in ≤120 seconds (Normal & Full), and 2 credits for passing scores with slower times."
        },
        {
            question: "What are badges and how do I earn them?",
            answer: "Badges are achievements earned through specific activities. Examples include Speed Master (quick quiz completion), High Performer (95%+ scores), Consistent Learner (30-day login streak), and more. Check your Badges page to see earned and available badges."
        },
        {
            question: "How do I check my wallet balance?",
            answer: "Click on the 'Wallet Balance' metric on your dashboard or use the 'Check Wallet' quick action. Your wallet page shows current balance and complete transaction history with details of how each credit was earned."
        },
        {
            question: "How do I track my course progress?",
            answer: "Your dashboard shows average completion across all courses. Click 'Active Courses' to see individual course progress, modules completed, and last activity date for each enrolled course."
        },
        {
            question: "What happens if I fail a quiz?",
            answer: "You can reattempt quizzes up to 3 times. No credits are deducted for failed attempts, but you only earn credits on passing attempts. Use failed attempts as learning opportunities."
        },
        {
            question: "How many attempts do I get per quiz?",
            answer: "Each quiz allows 3 attempts. Make sure to review the content thoroughly before each attempt to maximize your learning and credit earning potential."
        },
        {
            question: "How do I view course modules?",
            answer: "Click on any course from your Active Courses page. The course detail page lists all modules, showing completion status and allowing you to access content sequentially."
        },
        {
            question: "When do modules unlock?",
            answer: "Modules unlock sequentially after completing the previous module. You must achieve 100% completion (videos watched, quizzes passed) on the current module to unlock the next one."
        },
        {
            question: "How do I contact my teacher?",
            answer: "Teacher contact information is available on each course page. You can also see your teachers listed in your enrolled courses section with their email addresses."
        }
    ],
    teacher: [
        {
            question: "How do I upload evidence?",
            answer: "Navigate to the Evidence page from the sidebar. Use the upload form to select files (images, PDFs, documents). Add a title, description, and associate it with the relevant course and module before submitting."
        },
        {
            question: "How do I view student progress?",
            answer: "Your dashboard shows a Student Progress Overview table. Click on any student's name to view their detailed profile, including course enrollments, completion rates, quiz scores, and last activity."
        },
        {
            question: "How do I assign courses?",
            answer: "Course assignments are managed by administrators. Contact your principal or admin to request course assignments. You'll see all assigned courses on your dashboard automatically."
        },
        {
            question: "How are my credits calculated?",
            answer: "Teachers earn 50 credits per evidence upload and 10 credits as bonus for each student achieving 100% scores. Your total credits are displayed on your dashboard."
        },
        {
            question: "What are at-risk students?",
            answer: "At-risk students are those with completion rates below 70%. Your dashboard highlights these students automatically so you can provide additional support and intervention."
        },
        {
            question: "How do I create  a quiz?",
            answer: "Quiz creation is managed through the admin panel. Submit your quiz questions to the administrator who will configure them in the system's question bank."
        },
        {
            question: "How do I track student engagement?",
            answer: "The Student Progress Overview shows last active dates, modules completed, and current progress for all your students. Use this to identify engagement patterns and reach out to inactive students."
        },
        {
            question: "How do I view course analytics?",
            answer: "Click on any course card from your dashboard or My Courses page. The course detail page shows enrollment numbers, average completion rate, active users, and module-wise completion statistics."
        },
        {
            question: "How do I communicate with students?",
            answer: "Student email addresses are visible in the Student Progress table and individual student profiles. Use these for direct communication regarding their progress or course matters."
        },
        {
            question: "How do I manage course modules?",
            answer: "Module management is handled by administrators. Submit requests for module additions, edits, or reordering to your principal or system admin."
        }
    ],
    principal: [
        {
            question: "How do I view school-wide performance?",
            answer: "Your dashboard provides comprehensive metrics including total students, teachers, courses, and average completion rates. The 'Completion by Class' chart shows performance breakdown by grade/section."
        },
        {
            question: "How do I generate reports?",
            answer: "Navigate to specific detail pages (All Students, All Teachers, All Courses) to view comprehensive data. Export functionality for CSV/PDF reports is coming in the next update."
        },
        {
            question: "How do I add new teachers/students?",
            answer: "Contact your system administrator to add new users. They have access to the User Management system where they can create accounts for teachers and students."
        },
        {
            question: "How do I track course enrollment?",
            answer: "Click on 'Total Courses' or navigate to the Courses page. Each course card displays current enrollment numbers, active users, and completion statistics."
        },
        {
            question: "What are high-traffic courses?",
            answer: "High-traffic courses are those with the most active users and engagement. Your dashboard displays these prominently to help identify popular courses and resource allocation needs."
        },
        {
            question: "How do I view completion by class?",
            answer: "The 'Completion by Grade' chart on your dashboard shows average completion rates for each class/section, helping identify which groups need additional support."
        },
        {
            question: "How do I monitor teacher performance?",
            answer: "Click 'Total Teachers' to view all teacher metrics including courses taught, students managed, average completion rates, badges earned, and credits accumulated."
        },
        {
            question: "How do I manage badges?",
            answer: "Badge configuration is managed through the Admin panel. Contact your system administrator to create new badge types or modify earning criteria."
        },
        {
            question: "How do I view system analytics?",
            answer: "Your dashboard provides key analytics including weekly active students, top performers, top badge holders, and high-traffic courses. More detailed analytics are available in specific detail pages."
        },
        {
            question: "How do I export data?",
            answer: "Data export functionality (CSV, PDF) is planned for the next release. Currently, you can view and share data through the detail pages for students, teachers, and courses."
        }
    ],
    admin: [
        {
            question: "How do I create a new course?",
            answer: "Navigate to Course Management and click 'Create New Course'. Fill in course details including title, subject, level, school assignment, and teacher assignment. The course will be immediately available for enrollment."
        },
        {
            question: "How do I configure quiz settings?",
            answer: "Go to System Configuration page. Under 'Quiz Configuration', you can set questions per quiz, time limits, maximum attempts, and passing score percentage. Changes apply system-wide immediately."
        },
        {
            question: "How do I manage credit slabs?",
            answer: "In System Configuration under 'Credit Slabs', adjust credit amounts for different performance levels: Fast & Full Performance, Normal & Full Performance, and Basic Performance. These affect all future quiz completions."
        },
        {
            question: "How do I add/edit users?",
            answer: "Navigate to User Management. Click 'Add New User' to create accounts, or use 'Edit' button on existing users to modify their details. You can manage both students and teachers from this interface."
        },
        {
            question: "How do I manage schools?",
            answer: "School data is configured in the system settings. Contact technical support to add new schools or modify existing school information in the database."
        },
        {
            question: "How do I configure completion thresholds?",
            answer: "In System Configuration under 'Content Completion Thresholds', set the percentage required for video/audio completion and module unlock requirements. Default is 90% for content and 100% for unlocking."
        },
        {
            question: "How do I manage question banks?",
            answer: "Question banks are managed through course-specific uploads. Navigate to System Configuration and access the Question Bank section to upload MCQ PDFs for each course."
        },
        {
            question: "How do I view system statistics?",
            answer: "Your dashboard shows comprehensive statistics including total users (students + teachers + principals), total courses, total modules, quiz questions, and school-wise breakdowns."
        },
        {
            question: "How do I backup data?",
            answer: "Database backups are automated daily. For manual backups or data exports, contact technical support. User data, course content, and system configurations are all included in backups."
        },
        {
            question: "How do I configure teacher credits?",
            answer: "In System Configuration under 'Teacher Credit Rules', set credits for evidence uploads and student achievement bonuses. These determine how teachers earn credits for their activities."
        }
    ]
};

export type UserRole = 'student' | 'teacher' | 'principal' | 'admin';
