// Deterministic quiz randomization utilities
// Ensures same student always gets same question/option order for a session

/**
 * Seeded random number generator
 * Uses Linear Congruential Generator algorithm
 */
class SeededRandom {
    private seed: number;

    constructor(seed: string | number) {
        this.seed = typeof seed === 'string' ? this.hashCode(seed) : seed;
    }

    private hashCode(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    next(): number {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
}

/**
 * Shuffle array using Fisher-Yates algorithm with seeded random
 */
function shuffleArray<T>(array: T[], seed: string): T[] {
    const rng = new SeededRandom(seed);
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rng.next() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

/**
 * Randomize questions for a student
 * @param questions Original question array
 * @param sessionSeed Session-specific seed from Firebase
 * @param studentId Student's unique ID
 * @returns Shuffled questions with metadata
 */
export function randomizeQuestions(
    questions: any[],
    sessionSeed: string,
    studentId: string
): any[] {
    const seed = `${sessionSeed}-${studentId}-questions`;
    const shuffled = shuffleArray(questions, seed);

    return shuffled.map((q, index) => ({
        ...q,
        originalPosition: questions.indexOf(q) + 1,
        studentPosition: index + 1,
        sharedLabel: `Q${questions.indexOf(q) + 1}` // Teacher says "Q3", all students see same label
    }));
}

/**
 * Randomize options within a question
 * @param options Original options array
 * @param sessionSeed Session-specific seed
 * @param studentId Student's unique ID
 * @param questionId Question ID for additional uniqueness
 * @returns Object with shuffled options and correct answer index
 */
export function randomizeOptions(
    options: string[],
    correctAnswerIndex: number,
    sessionSeed: string,
    studentId: string,
    questionId: number | string
): { shuffledOptions: string[]; newCorrectIndex: number; mapping: number[] } {
    const seed = `${sessionSeed}-${studentId}-q${questionId}-options`;

    // Create array of indexes to track original positions
    const indexedOptions = options.map((opt, idx) => ({ option: opt, originalIndex: idx }));

    // Shuffle the indexed options
    const shuffled = shuffleArray(indexedOptions, seed);

    // Extract shuffled options and find new correct answer index
    const shuffledOptions = shuffled.map(item => item.option);
    const newCorrectIndex = shuffled.findIndex(item => item.originalIndex === correctAnswerIndex);
    const mapping = shuffled.map(item => item.originalIndex);

    return {
        shuffledOptions,
        newCorrectIndex,
        mapping
    };
}

/**
 * Get question order for storing in attempt
 */
export function getQuestionOrderMapping(
    questions: any[]
): number[] {
    return questions.map(q => q.originalPosition - 1);
}

/**
 * Get option order mappings for all questions
 */
export function getOptionOrderMappings(
    questions: any[],
    sessionSeed: string,
    studentId: string
): number[][] {
    return questions.map((q, qIndex) => {
        const { mapping } = randomizeOptions(
            q.options,
            q.correctAnswer,
            sessionSeed,
            studentId,
            q.id || qIndex
        );
        return mapping;
    });
}

/**
 * Reconstruct original answer from shuffled answer
 */
export function mapShuffledAnswerToOriginal(
    shuffledAnswerIndex: number,
    optionMapping: number[]
): number {
    return optionMapping[shuffledAnswerIndex];
}
