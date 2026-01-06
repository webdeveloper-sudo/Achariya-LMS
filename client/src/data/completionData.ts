import { faker } from '@faker-js/faker';

// --- Types ---

export interface TeacherCourseCompletion {
    id: number;
    campus: 'ASM' | 'ABSM' | 'SSV' | 'AASC' | 'ACET';
    grade_program: string;
    class_section: string;
    teacher_name: string;
    course_code: string;
    course_name: string;
    total_lessons_planned: number;
    lessons_completed: number;
    completion_percentage: number;
    on_time_lessons: number;
    delayed_lessons: number;
    behind_schedule_flag: boolean;
}

export interface StudentCourseProgress {
    id: number;
    student_id: string;
    student_name: string;
    campus: 'ASM' | 'ABSM' | 'SSV' | 'AASC' | 'ACET';
    grade_program: string;
    class_section: string;
    course_code: string;
    course_name: string;
    completion_percentage: number;
    last_activity_date: string;
    average_score: number;
    at_risk_flag: boolean;
}

export interface LessonDetail {
    id: number;
    teacher_completion_id: number;
    lesson_number: number;
    lesson_title: string;
    planned_date: string;
    completed_date: string | null;
    status: 'Completed' | 'In Progress' | 'Not Started' | 'Delayed';
}

// --- Generators ---

const teachers = ['Hari', 'Meera', 'Rahul', 'Anitha', 'Suresh', 'Divya', 'Priya', 'Karthik'];
const campuses: Array<'ASM' | 'ABSM' | 'SSV' | 'AASC' | 'ACET'> = ['ASM', 'ABSM', 'SSV', 'AASC', 'ACET'];

const schoolGrades = [
    { program: 'Grade 1', sections: ['A', 'B'] },
    { program: 'Grade 5', sections: ['A', 'B', 'C'] },
    { program: 'Grade 8', sections: ['A', 'B'] },
    { program: 'Grade 10', sections: ['A', 'B'] },
    { program: 'Grade 12', sections: ['Science', 'Commerce'] },
];

const collegePrograms = [
    { program: 'BSc CS', sections: ['1st Year', '2nd Year', '3rd Year'] },
    { program: 'BE CSE', sections: ['1st Year', '2nd Year', '3rd Year', '4th Year'] },
    { program: 'BCom', sections: ['1st Year', '2nd Year', '3rd Year'] },
];

const courses = [
    { grades: ['Grade 1', 'Grade 5'], code: 'ENG', name: 'English' },
    { grades: ['Grade 1', 'Grade 5'], code: 'MATH', name: 'Mathematics' },
    { grades: ['Grade 8', 'Grade 10'], code: 'MATH8', name: 'Mathematics Grade 8-10' },
    { grades: ['Grade 8', 'Grade 10'], code: 'SCI', name: 'Science' },
    { grades: ['Grade 12'], code: 'PHY12', name: 'Physics' },
    { grades: ['Grade 12'], code: 'CHEM12', name: 'Chemistry' },
    { grades: ['Grade 12'], code: 'ACC12', name: 'Accountancy' },
    { grades: ['BSc CS'], code: 'BSCCS101', name: 'Programming Fundamentals' },
    { grades: ['BSc CS'], code: 'BSCCS102', name: 'Data Structures' },
    { grades: ['BE CSE'], code: 'BECSE101', name: 'Computer Networks' },
    { grades: ['BE CSE'], code: 'BECSE102', name: 'Database Systems' },
    { grades: ['BCom'], code: 'BCOM101', name: 'Financial Accounting' },
    { grades: ['BCom'], code: 'BCOM102', name: 'Business Economics' },
];

const generateTeacherCourseCompletion = (count: number): TeacherCourseCompletion[] => {
    const data: TeacherCourseCompletion[] = [];
    let id = 1;

    for (let i = 0; i < count; i++) {
        const campus = faker.helpers.arrayElement(campuses);
        const isCollege = faker.datatype.boolean({ probability: 0.3 });
        const gradeConfig = isCollege
            ? faker.helpers.arrayElement(collegePrograms)
            : faker.helpers.arrayElement(schoolGrades);

        const grade_program = gradeConfig.program;
        const class_section = faker.helpers.arrayElement(gradeConfig.sections);

        // Find applicable courses for this grade
        const applicableCourses = courses.filter(c => c.grades.includes(grade_program));
        const course = faker.helpers.arrayElement(applicableCourses);

        const total_lessons_planned = faker.number.int({ min: 30, max: 50 });
        const completion_pct = faker.number.int({ min: 30, max: 100 });
        const lessons_completed = Math.floor((completion_pct / 100) * total_lessons_planned);

        const on_time_pct = faker.number.int({ min: 70, max: 95 });
        const on_time_lessons = Math.floor((on_time_pct / 100) * lessons_completed);
        const delayed_lessons = lessons_completed - on_time_lessons;

        const behind_schedule_flag = completion_pct < 70;

        data.push({
            id: id++,
            campus,
            grade_program,
            class_section,
            teacher_name: faker.helpers.arrayElement(teachers),
            course_code: course.code,
            course_name: course.name,
            total_lessons_planned,
            lessons_completed,
            completion_percentage: completion_pct,
            on_time_lessons,
            delayed_lessons,
            behind_schedule_flag,
        });
    }

    return data;
};

const generateStudentCourseProgress = (count: number): StudentCourseProgress[] => {
    const data: StudentCourseProgress[] = [];

    for (let i = 0; i < count; i++) {
        const campus = faker.helpers.arrayElement(campuses);
        const isCollege = faker.datatype.boolean({ probability: 0.3 });
        const gradeConfig = isCollege
            ? faker.helpers.arrayElement(collegePrograms)
            : faker.helpers.arrayElement(schoolGrades);

        const grade_program = gradeConfig.program;
        const class_section = faker.helpers.arrayElement(gradeConfig.sections);

        const applicableCourses = courses.filter((c) => c.grades.includes(grade_program));
        const course = faker.helpers.arrayElement(applicableCourses);

        const completion_percentage = faker.number.int({ min: 20, max: 100 });
        const average_score = faker.number.int({ min: 40, max: 95 });
        const at_risk_flag = completion_percentage < 50;

        data.push({
            id: i + 1,
            student_id: `STU-${String(1001 + i).padStart(4, '0')}`,
            student_name: faker.person.fullName(),
            campus,
            grade_program,
            class_section,
            course_code: course.code,
            course_name: course.name,
            completion_percentage,
            last_activity_date: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
            average_score,
            at_risk_flag,
        });
    }

    return data;
};

const generateLessonDetails = (teacherCompletionData: TeacherCourseCompletion[]): LessonDetail[] => {
    const lessons: LessonDetail[] = [];
    let lessonId = 1;

    teacherCompletionData.forEach((teacher) => {
        const baseDate = new Date('2025-09-01');

        for (let i = 1; i <= teacher.total_lessons_planned; i++) {
            const planned_date = new Date(baseDate);
            planned_date.setDate(planned_date.getDate() + (i - 1) * 2); // Every 2 days

            let status: 'Completed' | 'In Progress' | 'Not Started' | 'Delayed';
            let completed_date: string | null = null;

            if (i <= teacher.lessons_completed) {
                // Determine if on time or delayed
                if (i <= teacher.on_time_lessons) {
                    status = 'Completed';
                    const completedOn = new Date(planned_date);
                    completedOn.setDate(completedOn.getDate() + faker.number.int({ min: 0, max: 1 }));
                    completed_date = completedOn.toISOString().split('T')[0];
                } else {
                    status = 'Delayed';
                    const completedOn = new Date(planned_date);
                    completedOn.setDate(completedOn.getDate() + faker.number.int({ min: 3, max: 7 }));
                    completed_date = completedOn.toISOString().split('T')[0];
                }
            } else if (i === teacher.lessons_completed + 1) {
                status = 'In Progress';
            } else {
                status = 'Not Started';
            }

            lessons.push({
                id: lessonId++,
                teacher_completion_id: teacher.id,
                lesson_number: i,
                lesson_title: `Lesson ${i}: ${faker.lorem.words(3)}`,
                planned_date: planned_date.toISOString().split('T')[0],
                completed_date,
                status,
            });
        }
    });

    return lessons;
};

// --- Seed Data ---

export const teacherCourseCompletion = generateTeacherCourseCompletion(65);
export const studentCourseProgress = generateStudentCourseProgress(120);
export const lessonDetails = generateLessonDetails(teacherCourseCompletion);
