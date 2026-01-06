import { sampleData } from '../data/sampleData';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    source?: string;
}

// Comprehensive course-specific knowledge base
const courseDocuments: Record<number, Record<string, string>> = {
    1: { // Advanced Mathematics - Extensive Coverage
        'quadratic': "**Quadratic Equations** (Advanced Math Module 1)\n\nStandard form: ax² + bx + c = 0\n\n**Quadratic Formula:**\nx = (-b ± √(b²-4ac)) / 2a\n\n**Discriminant (Δ = b²-4ac) tells us:**\n• Δ > 0: Two real roots\n• Δ = 0: One real root (repeated)\n• Δ < 0: Two complex roots\n\n**Example:** Solve x² - 5x + 6 = 0\na=1, b=-5, c=6\nΔ = 25 - 24 = 1 > 0 (two real roots)\nx = (5 ± 1)/2 = 3 or 2",

        'derivative': "**Derivatives** (Advanced Math Module 2)\n\nThe derivative measures the instantaneous rate of change.\n\n**Key Rules:**\n• Power Rule: d/dx(xⁿ) = nxⁿ⁻¹\n• Constant Rule: d/dx(c) = 0\n• Sum Rule: d/dx(f+g) = f' + g'\n• Product Rule: d/dx(fg) = f'g + fg'\n• Quotient Rule: d/dx(f/g) = (f'g - fg')/g²\n• Chain Rule: d/dx(f(g(x))) = f'(g(x))·g'(x)\n\n**Example:** Find d/dx(3x² + 2x)\n= 6x + 2",

        'integral': "**Integration** (Advanced Math Module 3)\n\nIntegration is the reverse of differentiation.\n\n**Basic Integration Rules:**\n• ∫xⁿdx = xⁿ⁺¹/(n+1) + C (n ≠ -1)\n• ∫eˣdx = eˣ + C\n• ∫(1/x)dx = ln|x| + C\n• ∫sin(x)dx = -cos(x) + C\n• ∫cos(x)dx = sin(x) + C\n\n**Integration by Parts:**\n∫u dv = uv - ∫v du\n\n**Always remember:** Add constant C!",

        'limit': "**Limits** (Advanced Math Module 1)\n\nA limit describes the value a function approaches.\n\n**Notation:** lim(x→a) f(x) = L\n\n**L'Hôpital's Rule** (for 0/0 or ∞/∞):\nIf lim f(x)/g(x) gives 0/0 or ∞/∞, then:\nlim f(x)/g(x) = lim f'(x)/g'(x)\n\n**Common Limits:**\n• lim(x→0) (sin x)/x = 1\n• lim(x→∞) (1 + 1/x)ˣ = e",

        'differentiation': "**Differentiation Techniques:**\n\n1. **Finding slopes:** Derivative = slope of tangent\n2. **Maxima/Minima:** Set f'(x) = 0\n3. **Optimization:** Use derivatives to find optimal values\n4. **Related rates:** Chain rule for changing quantities\n\n**When to use:**\n• Physics: velocity, acceleration\n• Economics: marginal cost/revenue\n• Geometry: tangent lines, max areas",

        'function': "**Functions** (Advanced Math Foundation)\n\n**Types:**\n• Linear: f(x) = mx + b\n• Quadratic: f(x) = ax² + bx + c\n• Polynomial: Sum of terms\n• Exponential: f(x) = aˣ\n• Logarithmic: f(x) = log(x)\n• Trigonometric: sin, cos, tan\n\n**Domain:** All possible x values\n**Range:** All possible y values",

        'equation': "**Solving Equations:**\n\n**Linear:** ax + b = c → x = (c-b)/a\n**Quadratic:** Use formula or factoring\n**Simultaneous:** Substitution or elimination\n**Exponential:** Take logarithms\n**Polynomial:** Factor or numerical methods",

        'quiz': "**Advanced Math Quiz Guidelines:**\n\n• 15 questions per quiz\n• 120-second time limit\n• 3 attempts allowed\n• 100% required to pass\n• Mixed: calculations + concepts\n\n**Tips:**\n✓ Memorize key formulas\n✓ Practice differentiation rules\n✓ Check your algebra\n✓ Use elimination for MCQs\n✓ Fast completion (<60s) = 15 credits!"
    },

    2: { // Physics - Extensive Coverage
        'newton': "**Newton's Laws of Motion** (Physics Module 1)\n\n**First Law (Inertia):**\nAn object at rest stays at rest, and an object in motion continues in motion at constant velocity, unless acted upon by a net external force.\n\n**Second Law (F=ma):**\nF = ma\nForce = mass × acceleration\nUnit: Newton (N) = kg·m/s²\n\n**Third Law (Action-Reaction):**\nFor every action, there's an equal and opposite reaction.\nF₁₂ = -F₂₁\n\n**Example:** 5kg object, 10N force\na = F/m = 10/5 = 2 m/s²",

        'thermodynamics': "**Thermodynamics** (Physics Module 2)\n\nThe study of heat, energy, and work.\n\n**Four Laws of Thermodynamics:**\n\n**Zeroth Law:** If A=B and B=C in temperature, then A=C\n\n**First Law (Energy Conservation):**\nΔU = Q - W\n• ΔU = Change in internal energy\n• Q = Heat added to system\n• W = Work done by system\nEnergy cannot be created or destroyed, only transformed.\n\n**Second Law (Entropy):**\nEntropy of an isolated system always increases.\nS = k log W\nHeat flows from hot to cold spontaneously.\n\n**Third Law:**\nAs temperature approaches absolute zero, entropy approaches a constant minimum.\n\n**Applications:** Engines, refrigerators, heat pumps",

        'energy': "**Energy Conservation** (Physics Module 2)\n\n**Law:** Energy cannot be created or destroyed, only transformed.\n\n**Types:**\n• **Kinetic Energy:** KE = ½mv²\n  (energy of motion)\n• **Potential Energy:** PE = mgh\n  (stored energy, gravity)\n  \n**Total Mechanical Energy:**\nE = KE + PE = constant (no friction)\n\n**Example:** Ball dropped from 10m (m=1kg)\nPE initial = 1×10×10 = 100J\nAt ground: KE = 100J\nVelocity: v = √(2KE/m) = √200 = 14.1 m/s",

        'motion': "**Kinematics Equations** (Physics Module 1)\n\nFor uniform acceleration:\n\n**Equations:**\n1. v = u + at\n2. s = ut + ½at²\n3. v² = u² + 2as\n4. s = (u+v)t/2\n\nWhere:\n• u = initial velocity\n• v = final velocity\n• a = acceleration\n• t = time\n• s = displacement\n\n**Example:** Car accelerates from 0 to 20m/s in 10s\na = (v-u)/t = 20/10 = 2 m/s²",

        'force': "**Forces** (Physics Module 1)\n\n**Types:**\n• Gravitational: F = mg\n• Friction: F = μN\n• Normal: Perpendicular to surface\n• Tension: In ropes/strings\n• Applied: Push/pull\n\n**Net Force:**\nΣF = ma (vector sum)\n\n**Free Body Diagrams:**\nDraw all forces acting on object\nResolve into components\nApply F=ma in each direction",

        'electricity': "**Electricity** (Physics Module 3)\n\n**Ohm's Law:**\nV = IR\n• V = Voltage (Volts)\n• I = Current (Amperes)\n• R = Resistance (Ohms, Ω)\n\n**Power:**\nP = VI = I²R = V²/R\nUnit: Watt (W)\n\n**Circuits:**\n• **Series:** R_total = R₁ + R₂ + R₃\n• **Parallel:** 1/R_total = 1/R₁ + 1/R₂ + 1/R₃\n\n**Example:** 12V battery, 4Ω resistor\nI = V/R = 12/4 = 3A\nP = VI = 12×3 = 36W",

        'momentum': "**Momentum** (Physics Module 2)\n\n**Definition:**\np = mv (mass × velocity)\nUnit: kg·m/s\n\n**Conservation:**\nIn isolated system, total momentum is conserved.\np_before = p_after\n\n**Collisions:**\n• **Elastic:** KE conserved\n• **Inelastic:** KE not conserved\n• **Perfectly Inelastic:** Objects stick together",

        'gravity': "**Gravitational Force:**\n\nF = GMm/r²\n\nOn Earth surface:\n• g = 9.8 m/s² (acceleration)\n• Weight: W = mg\n\n**Projectile Motion:**\n• Horizontal: constant velocity\n• Vertical: free fall (a=-g)\n• Range: R = u²sin(2θ)/g",

        'quiz': "**Physics Quiz Guidelines:**\n\n• 15 MCQ questions\n• 120-second time limit\n• 3 attempts allowed\n• Focus: Concepts + calculations\n• Calculator allowed\n\n**Tips:**\n✓ Know all formulas by heart\n✓ Units matter - pay attention!\n✓ Draw diagrams for forces\n✓ Check answer reasonableness\n✓ Fast & accurate = max credits!"
    },

    3: { // English Literature - Extensive Coverage
        'shakespeare': "**Shakespeare & Classic Drama** (Module 1)\n\n**Key Features:**\n• **Soliloquy:** Character speaks thoughts aloud\n• **Dramatic Irony:** Audience knows more than characters\n• **Iambic Pentameter:** 10 syllables per line\n  (da-DUM da-DUM da-DUM da-DUM da-DUM)\n  \n**Themes:**\n• Love & betrayal\n• Power & corruption\n• Fate vs free will\n• Appearance vs reality\n\n**Example Analysis:**\n\"To be or not to be\" (Hamlet)\n→ Existential questioning\n→ Life vs death contemplation\n→ Internal conflict revealed",

        'poetry': "**Modern Poetry & Prose** (Module 2)\n\n**Poetic Devices:**\n• **Metaphor:** Direct comparison (\"time is money\")\n• **Simile:** Comparison with like/as (\"like a rose\")\n• **Personification:** Human traits to objects\n• **Alliteration:** Repeated consonant sounds\n• **Imagery:** Vivid sensory description\n• **Symbolism:** Objects represent ideas\n\n**Analyzing Poetry:**\n1. Read multiple times\n2. Identify speaker & audience\n3. Find theme (central message)\n4. Note tone & mood\n5. Analyze structure & form\n6. Examine word choice (diction)",

        'literary': "**Literary Analysis Framework:**\n\n**Elements to Consider:**\n1. **Theme:** Central message/idea\n2. **Plot:** Sequence of events\n3. **Character:** Traits, development, motivation\n4. **Setting:** Time, place, atmosphere\n5. **Conflict:** Internal/external struggles\n6. **Point of View:** Who's narrating\n7. **Symbolism:** Deeper meanings\n8. **Tone:** Author's attitude\n9. **Style:** Author's unique voice\n\n**Always support with textual evidence!**",

        'essay': "**Essay Writing Guide:**\n\n**Structure:**\n1. **Introduction**\n   • Hook (grab attention)\n   • Background context\n   • Clear thesis statement\n   \n2. **Body Paragraphs** (3-5)\n   • Topic sentence\n   • Evidence from text\n   • Analysis & explanation\n   • Link to thesis\n   \n3. **Conclusion**\n   • Restate thesis (new words)\n   • Summarize key points\n   • Broader implications\n\n**Citations:** Use MLA format\n**Goal:** Clarity, coherence, compelling argument",

        'theme': "**Finding Theme:**\n\nTheme = Central message or universal truth\n\n**How to Identify:**\n1. What lesson do characters learn?\n2. What universal truth emerges?\n3. What message about life/humanity?\n4. What patterns repeat?\n\n**Common Themes:**\n• Love conquers all\n• Power corrupts\n• Good vs evil\n• Coming of age\n• Man vs nature/society\n• Loss of innocence\n\n**Express as complete sentence:**\n❌ \"Love\" (topic, not theme)\n✓ \"True love requires sacrifice\"",

        'character': "**Character Analysis:**\n\n**Types:**\n• **Protagonist:** Main character\n• **Antagonist:** Opposition\n• **Round:** Complex, multi-dimensional\n• **Flat:** Simple, one-dimensional\n• **Dynamic:** Changes over story\n• **Static:** Stays the same\n\n**Analyze:**\n• Actions & decisions\n• Speech & thoughts\n• Relationships\n• Conflicts faced\n• Growth/change\n• Motivations\n\n**Use STEAL:**\nSpeech, Thoughts, Effects on others, Actions, Looks",

        'symbolism': "**Symbolism in Literature:**\n\nSymbol = Object representing deeper meaning\n\n**Examples:**\n• Light = truth, hope, knowledge\n• Dark = evil, unknown, despair\n• Water = rebirth, cleansing, life\n• Journey = self-discovery\n• Seasons = life cycles\n\n**How to Identify:**\n1. Repeated objects/images\n2. Objects with emotional weight\n3. Items emphasized in key moments\n4. Universal associations\n\n**Analysis Tip:** What does it represent? Why did author choose this?",

        'quiz': "**English Literature Quiz Guidelines:**\n\n• 15 questions\n• 120-second time limit\n• Tests: Comprehension, analysis, interpretation\n• Focus: Themes, characters, literary devices\n\n**Tips:**\n✓ Read passages carefully\n✓ Understand context\n✓ Know character motivations\n✓ Identify literary techniques\n✓ Think author's purpose\n✓ Support with evidence!"
    }
};

// General portal responses (kept for non-course questions)
const generalResponses: Record<string, string> = {
    'credit': "💰 **Credits System:**\n15 credits = 100% in ≤60s\n10 credits = 100% in ≤120s\n2 credits = Pass but slower\n\nView history: Dashboard → Wallet Balance",

    'badge': "🏆 **Badges:**\nSpeed Master, High Performer, Consistent Learner, etc.\n\nEach shows the specific activity you completed to earn it. Check Badges page!",

    'unlock': "🔓 **Module Unlocking:**\nModules unlock sequentially.\n1. Complete 100% of current module\n2. Pass the quiz\n3. Next module unlocks automatically\n\nNo skipping - ensures mastery!",

    'progress': "📊 **Track Your Progress:**\n\n**Dashboard View:**\n• Overall completion percentage\n• Quiz average score\n• Credits earned\n• Badges collected\n\n**Course Details:**\n• Modules completed per course\n• Current module status\n• Class average comparison\n\n**Wallet Page:**\n• Transaction history\n• Credits by activity\n• Timeline view\n\nYour progress updates in real-time!",

    'help': "🤖 **I'm Your Study Assistant!**\n\nAsk me:\n• Course topics (\"explain derivatives\", \"Newton's laws\")\n• Portal features (credits, badges, progress)\n• Study tips\n• Quiz guidelines\n\nI'll pull from your course materials!"
};

// Generate intelligent responses based on query and student context
export const generateChatbotResponse = (
    query: string,
    enrolledCourseIds: number[] = [],
    studentName?: string
): ChatMessage => {
    const normalizedQuery = query.toLowerCase();

    // PRIORITY 0: Personal Information (NEW - Highest Priority)
    // Handle all variations of self-related questions
    const personalInfoPattern = /\b(my name|who am i|who i am|who do you think i am|about me|more about me|tell me about|myself|what grade|which grade|which class|what class|my information|my details|my profile|do you know me|what do you know about me|information about me)\b/;

    if (normalizedQuery.match(personalInfoPattern)) {
        const firstName = studentName?.split(' ')[0] || 'Student';
        const fullName = studentName || 'Student';

        return {
            role: 'assistant',
            content: `👤 **Your Profile:**\n\n• **Name:** ${fullName}\n• **Grade:** 7th Grade\n• **School:** Achariya Siksha Mandir (ASM)\n• **Location:** Villianur, Puducherry\n\n📚 **Your Learning Journey:**\nYou're currently enrolled in ${enrolledCourseIds.length} course${enrolledCourseIds.length !== 1 ? 's' : ''}. Keep up the great work, ${firstName}!\n\n💡 **Need help?** Ask me about your subjects, quiz strategies, or how to earn more credits!`,
            source: '📋 Your Personal Profile'
        };
    }

    // PRIORITY 1: Course-specific subject questions (MOST IMPORTANT)
    for (const courseId of enrolledCourseIds) {
        const courseDoc = courseDocuments[courseId];
        if (!courseDoc) continue;

        // Check each keyword in course content
        for (const [keyword, answer] of Object.entries(courseDoc)) {
            if (normalizedQuery.includes(keyword)) {
                const course = sampleData.courses.find(c => c.id === courseId);
                return {
                    role: 'assistant',
                    content: answer,
                    source: `📚 ${course?.title} - Course Materials`
                };
            }
        }
    }

    // PRIORITY 2: General portal questions
    for (const [keyword, response] of Object.entries(generalResponses)) {
        if (normalizedQuery.includes(keyword)) {
            return {
                role: 'assistant',
                content: response,
                source: '💡 Portal Guide'
            };
        }
    }

    // PRIORITY 3: List enrolled courses
    if (normalizedQuery.includes('course') || normalizedQuery.includes('enrolled') || normalizedQuery.includes('subject')) {
        const courses = sampleData.courses.filter(c => enrolledCourseIds.includes(c.id));
        if (courses.length > 0) {
            const list = courses.map(c => `• **${c.title}** (${c.level})`).join('\n');
            return {
                role: 'assistant',
                content: `📖 **Your Enrolled Courses:**\n\n${list}\n\nAsk me anything about these subjects! Examples:\n• \"Explain quadratic equations\"\n• \"What are Newton's laws?\"\n• \"How to analyze Shakespeare?\"`,
                source: 'Your Course List'
            };
        }
    }

    // PRIORITY 4: Helpful fallback with examples
    return {
        role: 'assistant',
        content: "I'm your AI study assistant! I can help with:\n\n**📚 Subject Questions:**\n• Math: \"Explain derivatives\", \"Solve quadratic equations\"\n• Physics: \"Newton's laws\", \"Energy conservation\"\n• English: \"Analyze Shakespeare\", \"Poetry devices\"\n\n**💡 Portal Features:**\n• \"How to earn credits?\"\n• \"What are badges?\"\n• \"How do modules unlock?\"\n\n**Just ask naturally - I'll find the answer in your course materials!**",
        source: '🤖 Study Assistant'
    };
};

// Conversation starters
export const conversationStarters = [
    "Explain quadratic equations",
    "What are Newton's laws?",
    "How to analyze poetry?",
    "Quiz tips for my courses",
    "How do I earn credits?",
    "What is thermodynamics?"  // NEW TOPIC QUESTION
];
