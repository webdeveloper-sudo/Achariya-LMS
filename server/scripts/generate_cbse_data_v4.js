const fs = require("fs");
const path = require("path");

const subjects = [
  { code: "MATH", name: "Mathematics", subjectCode: "MA08" },
  { code: "SCI", name: "Science", subjectCode: "SC08" },
  { code: "SOC", name: "Social Science", subjectCode: "SS08" },
  { code: "ENG", name: "English", subjectCode: "EN08" },
  { code: "HIN", name: "Hindi", subjectCode: "HI08" },
  { code: "CS", name: "Computer Science", subjectCode: "CS08" },
];

const gradesEligible = [
  "MONT 2",
  "MONT 1",
  "PRE MONT",
  "PRE MONT TD",
  "Grade I",
  "Grade II",
  "Grade III",
  "Grade IV",
  "Grade V",
  "Grade VI",
  "Grade VII",
  "Grade VIII",
  "Grade IX",
  "Grade X",
  "Grade XI (Science)",
  "Grade XI (Commerce)",
  "Grade XI (Humanities)",
  "Grade XII (Science)",
  "Grade XII (Commerce)",
  "Grade XII (Humanities)",
];

const eligibleSchools = [
  "ACHARIYA ARTS AND SCIENCE COLLEGE (AASC) - VILLIANUR, PUDUCHERRY",
  "ACHARIYA BALA SIKSHA MANDIR (ABSM) ADYAR - ADYAR, CHENNAI",
  "ACHARIYA BALA SIKSHA MANDIR (ABSM) ALPKM - ALAPAKKAM, CHENNAI",
  "ACHARIYA BALA SIKSHA MANDIR (ABSM) KKN - KK NAGAR, CHENNAI",
  "ACHARIYA BALA SIKSHA MANDIR (ABSM)-TT PP - THENGATHITTU, PUDUCHERRY",
  "ACHARIYA BALA SIKSHA MANDIR (ABSM) KP - KALAPET, PUDUCHERRY",
  "ACHARIYA BALA SIKSHA MANDIR (ABSM) MVL CHENNAI - MADURAVOYAL, CHENNAI",
  "ACHARIYA BALA SIKSHA MANDIR (ABSM) - NOLAMBUR",
  "ACHARIYA BALA SIKSHA MANDIR (ABSM) PBN - PADMANAB NAGAR",
  "ACHARIYA BALA SIKSHA MANDIR (ABSM) RKN - RK NAGAR",
  "ACHARIYA BALA SIKSHA MANDIR (ABSM) SGM - SALIGRAMAM, CHENNAI",
  "ACHARIYA BALA SIKSHA MANDIR (ABSM) THIRU NAGAR - THIRUNAGAR",
  "ACHARIYA BALA SIKSHA MANDIR (ABSM) TRICHY - TRICHY",
  "ACHARIYA BALA SIKSHA MANDIR (ABSM) VGM - VIRUGAMBAKKAM, CHENNAI",
  "ACHARIYA BALA SIKSHA MANDIR (ABSM) VN - VENKATA NAGAR",
  "ACHARIYA BALA SIKSHA MANDIR (ABSM) VVK - VALASARAVAKKAM, CHENNAI",
  "ACHARIYA BALA SIKSHA MANDIR (ABSM)-GM - GORIMEDU",
  "ACHARIYA BALA SIKSHA MANDIR (ABSM)-LP - LAWSPET, PUDUCHERRY",
  "ACHARIYA BALA SIKSHA MANDIR (ABSM)-MLP - MUTHIALPET, PUDUCHERRY",
  "ACHARIYA BALA SIKSHA MANDIR (ABSM)-TT - THENGATHITTU, PUDUCHERRY",
  "ACHARIYA CENTRE FOR EXCELLENCE IN TEACHING (ACET) - VILLIANUR, PUDUCHERRY",
  "AKLAVYA INTERNATIONAL SCHOOL - THENGAITITTU, PUDUCHERRY",
  "ANUGRAHA TOWNSHIP MANDIR (TKM) - THAVALAKUPPAM, PUDUCHERRY",
  "ACHARIYA SIKSHA MANDIR (ASM) - ALAPAKKAM, CHENNAI",
  "ACHARIYA SIKSHA MANDIR (ASM) - KKL - KARAIKAL",
  "ACHARIYA SIKSHA MANDIR (ASM) - TRICHY - TRICHY",
  "ACHARIYA SIKSHA MANDIR (ASM) - WESTERN GHATS INTERNATIONAL - ETTIMADAI, COIMBATORE",
  "ACHARIYA SIKSHA MANDIR (ASM) ERODE - ERODE",
  "ACHARIYA SIKSHA MANDIR (ASM) ERODE - FEEDER CENTER - ERODE",
  "ACHARIYA SIKSHA MANDIR (ASM) ERODE - PERUNDURAI CENTER - ERODE",
  "ACHARIYA SIKSHA MANDIR (ASM)-HSC",
  "ACHARIYA SIKSHA MANDIR (ASM)-MKM - MOOLAKULAM, PUDUCHERRY",
  "ACHARIYA SIKSHA MANDIR (ASM)-MP - MUTHIRAYARPALAYAM, PUDUCHERRY",
  "AKLAVYA RP - REDDIARPALAYAM, PUDUCHERRY",
  "ACHARIYA SIKSHA MANDIR (ASM)-TKM - THAVALAKUPPAM, PUDUCHERRY",
  "ACHARIYA SIKSHA MANDIR (ASM)-VL (9 to 12) - VILLIANUR, PUDUCHERRY",
  "ACHARIYA SIKSHA MANDIR (ASM)-VL (1 to 8) - VILLIANUR, PUDUCHERRY",
  "ACHARIYA SIKHA THIRUMANDIRAM (ASTHM) - PATHUKANNU",
  "SRI SAMPOORNA VIDYALAYAM (SSV)-VL - VILLIANUR, PUDUCHERRY",
  "ACHARIYA BALA SIKSHA MANDIR (ABSM) - TINDIVANAM",
  "ACHARIYA SIKSHA MANDIR (ASM) - VILLUPURAM",
];

const moduleMetadata = {
  MATH: [
    "Rational Numbers",
    "Linear Equations in One Variable",
    "Understanding Quadrilaterals",
    "Practical Geometry",
    "Data Handling",
  ],
  SCI: [
    "Crop Production and Management",
    "Microorganisms: Friend and Foe",
    "Synthetic Fibres and Plastics",
    "Materials: Metals and Non-Metals",
    "Coal and Petroleum",
  ],
  SOC: [
    "How, When and Where",
    "Resources",
    "The Indian Constitution",
    "From Trade to Territory",
    "Understanding Secularism",
  ],
  ENG: [
    "The Best Christmas Present in the World",
    "Grammar: Tenses & Modals",
    "The Tsunami",
    "Writing: Notice & Letter Writing",
    "How the Camel Got His Hump",
  ],
  HIN: [
    "Dhwani",
    "Hindi Vyakaran: Sangya & Sarvanam",
    "Lakh ki Chudiyan",
    "Ahamnagar ka Qila",
    "Hindi Vyakaran: Visheshan",
  ],
  CS: [
    "Networking Concepts",
    "Log on to MS Access",
    "Working with Queries & Forms",
    "Introduction to HTML-5",
    "Basic Python Programming",
  ],
};

// Map of topics to generate specific hints
const topicHints = {
  "Rational Numbers": "Think about p/q form where q is not zero.",
  "Linear Equations in One Variable": "Isolated the variable x on one side.",
  "Understanding Quadrilaterals":
    "Sum of interior angles of a quadrilateral is 360 degrees.",
  "Crop Production and Management":
    "Consider practices like irrigation and manuring.",
  "Microorganisms: Friend and Foe":
    "Some microbes help in fermentation while others cause diseases.",
  "Networking Concepts": "Consider how devices communicate in a LAN or WAN.",
  "Introduction to HTML-5":
    "Semantic tags help define the structure of the web page.",
  "Basic Python Programming":
    "Indentation is key for defining blocks in Python.",
  "The Indian Constitution":
    "Focus on the fundamental rights and duties of citizens.",
};

const postedById = { $oid: "694932a9d8d3a75733ef4f61" };
const teacherId = { $oid: "694a46e81be3f313ecd1d95e" };

const courses = [];
const modules = [];
const assessments = [];

subjects.forEach((subject) => {
  const courseId = `CRS-2026-${subject.code}-08`;
  const courseModuleIds = [];

  for (let m = 1; m <= 5; m++) {
    const moduleId = `MOD-${subject.code}-08-0${m}`;
    const moduleName = moduleMetadata[subject.code][m - 1];
    courseModuleIds.push(moduleId);

    const moduleAssessmentIds = [];

    for (let a = 1; a <= m; a++) {
      const assessmentId = `ASS-${subject.code}-08-${m}-${a}`;
      moduleAssessmentIds.push(assessmentId);

      assessments.push({
        assessmentId: assessmentId,
        moduleId: moduleId,
        courseId: courseId,
        title: `${subject.name} Assessment ${a} - ${moduleName}`,
        description: `Comprehensive quiz designed to test knowledge of ${moduleName}.`,
        totalMarks: 30,
        duration: 1800,
        attempts: 3,
        totalCredits: 0,
        isActive: true,
        postedBy: postedById,
        accessedStudents: [],
        totalStudentsAttempted: [],
        questions: [
          {
            questionNo: 1,
            questionText: `Identify the fundamental property of ${moduleName} listed below.`,
            questionType: "multiple-choice",
            options: ["Property A", "Property B", "Property C", "Property D"],
            answer: "A",
            mark: 5,
            hint:
              topicHints[moduleName] ||
              `Recall the key concepts introduced in ${moduleName}.`,
            explanation:
              "This property is essential for defining the core logic of the topic.",
            pairs: [],
            tableRows: [],
            images: [],
          },
          {
            questionNo: 2,
            questionText: `True or False: The concepts of ${moduleName} are universally applicable in academic contexts.`,
            questionType: "true-false",
            options: [],
            answer: true,
            mark: 5,
            hint: "Refer to the textbook summary section.",
            explanation:
              "Most curriculum concepts are designed for broad applicability.",
            pairs: [],
            tableRows: [],
            images: [],
          },
          {
            questionNo: 3,
            questionText: `Fill in the blank: The primary goal of studying ${moduleName} is to understand ____.`,
            questionType: "fill-ups",
            options: [],
            answer: "Fundamentals",
            mark: 5,
            hint: `Starts with the letter 'F'.`,
            explanation:
              "Foundational knowledge is the basis of advanced studies.",
            pairs: [],
            tableRows: [],
            images: [],
          },
          {
            questionNo: 4,
            questionText: `Analyze the characteristics in the table below relating to ${moduleName}:`,
            questionType: "table-mcq",
            options: [
              "Row I matches",
              "Row II matches",
              "Both match",
              "None match",
            ],
            answer: "C",
            mark: 5,
            hint: "Check the alignment of both columns for consistency.",
            explanation: "Both rows display accurate data for the given topic.",
            pairs: [],
            tableRows: ["I:Feature-Active", "II:Feature-Static"],
            images: [],
          },
          {
            questionNo: 5,
            questionText: `Identify the highlighted component in the diagram of ${moduleName}.`,
            questionType: "diagram-mcq",
            options: ["Component X", "Component Y", "Component Z"],
            answer: "X",
            mark: 5,
            hint: "It is the central point of the illustration.",
            explanation:
              "Component X represents the core element in this diagrammatic model.",
            pairs: [],
            tableRows: [],
            image: "placeholder-image-url",
            images: ["placeholder-image-url"],
          },
          {
            questionNo: 6,
            questionText: `Match the terms with their definitions for ${moduleName}:`,
            questionType: "match",
            options: [],
            answer: "Match the pairs",
            mark: 5,
            hint: "Use the process of elimination for logical pairing.",
            explanation:
              "The terms are mapped to their technical definitions standard in CBSE VIII.",
            pairs: [
              { left: "Term 1", right: "Definition 1" },
              { left: "Term 2", right: "Definition 2" },
            ],
            tableRows: [],
            images: [],
          },
        ],
        createdAt: { $date: "2026-02-17T06:00:58.265Z" },
        updatedAt: { $date: "2026-02-17T06:00:58.265Z" },
        __v: 0,
      });
    }

    modules.push({
      moduleId: moduleId,
      courseId: courseId,
      title: moduleName,
      description: `Detailed module exploring ${moduleName} in depth for VIII Grade students.`,
      sequenceOrder: m,
      moduleNotes: {
        fileName: `${moduleId}_notes.pdf`,
        filePath: `http://localhost:8000/assets/documents/2026/02/${moduleId}_notes.pdf`,
        fileSize: 350000,
        mimeType: "application/pdf",
        uploadedOn: { $date: "2026-02-17T03:51:21.136Z" },
      },
      videoTutorial: {
        url: "https://www.youtube.com/embed/placeholder",
        title: `Tutorial: ${moduleName}`,
        duration: "12:30",
        thumbnail: "",
      },
      audioContent: {
        url: `http://localhost:8000/assets/audio/2026/02/${moduleId}_audio.mp3`,
        title: `Lecture Audio - ${moduleName}`,
        duration: null,
        fileSize: 4500000,
        mimeType: "audio/mpeg",
      },
      pptEmbedUrl:
        '<iframe src="https://docs.google.com/presentation/embed" frameborder="0" width="960" height="749"></iframe>',
      infographics: [
        {
          url: "http://localhost:8000/assets/images/placeholder.png",
          title: "Topic Visual Summary",
          order: 1,
        },
      ],
      credits: 1,
      estimatedDuration: "6",
      prerequisites: [],
      assessments: moduleAssessmentIds,
      status: "draft",
      postedBy: postedById,
      isActive: true,
      accessedStudents: [],
      postedOn: { $date: "2026-02-17T03:51:41.851Z" },
      lastUpdatedOn: { $date: "2026-02-17T03:51:41.851Z" },
      createdAt: { $date: "2026-02-17T03:51:41.871Z" },
      updatedAt: { $date: "2026-02-17T07:14:04.992Z" },
      __v: 0,
    });
  }

  courses.push({
    courseId: courseId,
    title: subject.name,
    subjectCode: subject.subjectCode,
    description: `Complete academic curriculum for CBSE Grade VIII ${subject.name}.`,
    thumbnail: "http://localhost:8000/assets/images/course_banner.jpg",
    totalCredits: 5,
    gradesEligible: gradesEligible,
    eligibleSchools: eligibleSchools,
    assignedTeachers: [teacherId],
    modules: courseModuleIds,
    status: "published",
    postedBy: postedById,
    isActive: true,
    enrolledStudents: [],
    postedOn: { $date: "2026-01-06T05:51:10.397Z" },
    lastUpdated: { $date: "2026-02-23T11:26:48.681Z" },
    createdAt: { $date: "2026-01-06T05:51:10.417Z" },
    updatedAt: { $date: "2026-02-23T11:26:48.681Z" },
    __v: 0,
  });
});

const output = {
  courses,
  modules,
  assessments,
};

const targetPath = path.resolve(
  "c:/Users/DIGITAL MARKETING/Desktop/achariyainternalportal002-main/server/seeds/cbse_grade_8_dataset.json",
);
fs.writeFileSync(targetPath, JSON.stringify(output, null, 2));
console.log(
  "Successfully generated dataset with no _id fields and empty tracking arrays.",
);
