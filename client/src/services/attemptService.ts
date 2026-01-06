// Attempt Tracking Service - Firestore
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp,
    limit
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface QuizAttempt {
    id?: string;
    studentId: string;
    quizId: string;
    sessionId?: string; // For live quizzes
    attemptNumber: 1 | 2 | 3;
    answers: {
        questionId: string;
        questionText: string;
        selectedAnswer: string;
        correctAnswer: string;
        isCorrect: boolean;
    }[];
    score: number;
    totalQuestions: number;
    completedAt: Timestamp;
}

export interface RetakePermission {
    id?: string;
    quizId: string;
    sessionId?: string;
    retakesEnabled: boolean;
    maxAttempts: number;
    enabledBy: string;
    enabledAt: Timestamp;
}

// Get attempt count for a student on a quiz
export async function getAttemptCount(studentId: string, quizId: string): Promise<number> {
    const q = query(
        collection(db, 'quizAttemptHistory'),
        where('studentId', '==', studentId),
        where('quizId', '==', quizId)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
}

// Get all attempts for a student on a quiz
export async function getAttempts(studentId: string, quizId: string): Promise<QuizAttempt[]> {
    const q = query(
        collection(db, 'quizAttemptHistory'),
        where('studentId', '==', studentId),
        where('quizId', '==', quizId),
        orderBy('completedAt', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizAttempt));
}

// Get latest attempt
export async function getLatestAttempt(studentId: string, quizId: string): Promise<QuizAttempt | null> {
    const q = query(
        collection(db, 'quizAttemptHistory'),
        where('studentId', '==', studentId),
        where('quizId', '==', quizId),
        orderBy('completedAt', 'desc'),
        limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as QuizAttempt;
}

// Save new attempt
export async function saveAttempt(attempt: Omit<QuizAttempt, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'quizAttemptHistory'), {
        ...attempt,
        completedAt: Timestamp.now()
    });
    return docRef.id;
}

// Check if student can retake quiz
export async function canRetake(studentId: string, quizId: string): Promise<{
    canRetake: boolean;
    attemptCount: number;
    maxAttempts: number;
    reason?: string;
}> {
    // Get attempt count
    const attemptCount = await getAttemptCount(studentId, quizId);

    // Check retake permissions
    const permQuery = query(
        collection(db, 'quizRetakePermissions'),
        where('quizId', '==', quizId),
        limit(1)
    );
    const permSnapshot = await getDocs(permQuery);

    let maxAttempts = 3; // Default
    let retakesEnabled = true; // Default

    if (!permSnapshot.empty) {
        const perm = permSnapshot.docs[0].data() as RetakePermission;
        maxAttempts = perm.maxAttempts;
        retakesEnabled = perm.retakesEnabled;
    }

    if (!retakesEnabled) {
        return {
            canRetake: false,
            attemptCount,
            maxAttempts,
            reason: 'Retakes disabled by teacher'
        };
    }

    if (attemptCount >= maxAttempts) {
        return {
            canRetake: false,
            attemptCount,
            maxAttempts,
            reason: `Maximum ${maxAttempts} attempts reached`
        };
    }

    return {
        canRetake: true,
        attemptCount,
        maxAttempts
    };
}

// Set retake permissions (Teacher only)
export async function setRetakePermission(permission: Omit<RetakePermission, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'quizRetakePermissions'), {
        ...permission,
        enabledAt: Timestamp.now()
    });
    return docRef.id;
}

// Get retake permission for a quiz
export async function getRetakePermission(quizId: string): Promise<RetakePermission | null> {
    const q = query(
        collection(db, 'quizRetakePermissions'),
        where('quizId', '==', quizId),
        limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as RetakePermission;
}
