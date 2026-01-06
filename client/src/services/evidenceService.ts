// Evidence Approval Service - Firebase Firestore
import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
    getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface EvidenceSubmission {
    id?: string;
    teacherId: string;
    teacherName: string;
    subject: string;
    className: string;
    topic: string;
    documentUrl: string; // Static demo file path
    documentType: 'pdf' | 'image' | 'video';
    submittedAt: Timestamp;
    status: 'pending' | 'approved' | 'rejected';
    canResubmit: boolean;
}

export interface EvidenceReview {
    id?: string;
    principalId: string;
    principalName: string;
    decision: 'approved' | 'rejected';
    comments: string;
    reviewedAt: Timestamp;
}

// Submit evidence (Teacher)
export async function submitEvidence(data: {
    teacherId: string;
    teacherName: string;
    subject: string;
    className: string;
    topic: string;
    documentUrl: string;
    documentType: 'pdf' | 'image' | 'video';
}): Promise<string> {
    const docRef = await addDoc(collection(db, 'evidenceSubmissions'), {
        ...data,
        submittedAt: Timestamp.now(),
        status: 'pending',
        canResubmit: false
    });
    return docRef.id;
}

// Get all pending evidence (Principal)
export async function getPendingEvidence(): Promise<EvidenceSubmission[]> {
    const q = query(
        collection(db, 'evidenceSubmissions'),
        where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);
    const evidence = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EvidenceSubmission));
    // Sort in JavaScript instead
    return evidence.sort((a, b) => b.submittedAt.toMillis() - a.submittedAt.toMillis());
}

// Get teacher's submissions
export async function getTeacherSubmissions(teacherId: string): Promise<EvidenceSubmission[]> {
    const q = query(
        collection(db, 'evidenceSubmissions'),
        where('teacherId', '==', teacherId)
    );
    const snapshot = await getDocs(q);
    const submissions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EvidenceSubmission));
    // Sort in JavaScript instead
    return submissions.sort((a, b) => b.submittedAt.toMillis() - a.submittedAt.toMillis());
}

// Get all reviewed evidence (approved + rejected) for log
export async function getReviewedEvidence(): Promise<EvidenceSubmission[]> {
    const approvedQuery = query(
        collection(db, 'evidenceSubmissions'),
        where('status', '==', 'approved')
    );
    const rejectedQuery = query(
        collection(db, 'evidenceSubmissions'),
        where('status', '==', 'rejected')
    );

    const [approvedSnapshot, rejectedSnapshot] = await Promise.all([
        getDocs(approvedQuery),
        getDocs(rejectedQuery)
    ]);

    const approved = approvedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EvidenceSubmission));
    const rejected = rejectedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EvidenceSubmission));

    const all = [...approved, ...rejected];
    // Sort by submission time
    return all.sort((a, b) => b.submittedAt.toMillis() - a.submittedAt.toMillis());
}

// Submit review (Principal)
export async function submitReview(
    evidenceId: string,
    principalId: string,
    principalName: string,
    decision: 'approved' | 'rejected',
    comments: string
): Promise<void> {
    // Validate comments length
    if (comments.length < 3 || comments.length > 500) {
        throw new Error('Comments must be between 3 and 500 characters');
    }

    // Add review to subcollection
    await addDoc(collection(db, `evidenceSubmissions/${evidenceId}/reviews`), {
        principalId,
        principalName,
        decision,
        comments,
        reviewedAt: Timestamp.now()
    });

    // Update evidence status
    await updateDoc(doc(db, 'evidenceSubmissions', evidenceId), {
        status: decision === 'approved' ? 'approved' : 'rejected',
        canResubmit: false
    });
}

// Get review history
export async function getReviewHistory(evidenceId: string): Promise<EvidenceReview[]> {
    const snapshot = await getDocs(
        query(
            collection(db, `evidenceSubmissions/${evidenceId}/reviews`),
            orderBy('reviewedAt', 'desc')
        )
    );
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EvidenceReview));
}

// Allow resubmission (Principal)
export async function allowResubmission(evidenceId: string): Promise<void> {
    await updateDoc(doc(db, 'evidenceSubmissions', evidenceId), {
        canResubmit: true
    });
}

// Get evidence by ID
export async function getEvidenceById(evidenceId: string): Promise<EvidenceSubmission | null> {
    const docRef = doc(db, 'evidenceSubmissions', evidenceId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as EvidenceSubmission;
    }
    return null;
}

// Clear ALL evidence submissions (for demo reset)
export async function clearAllEvidence(): Promise<number> {
    const snapshot = await getDocs(collection(db, 'evidenceSubmissions'));
    let count = 0;

    const deletePromises = snapshot.docs.map(async (docSnapshot) => {
        // Also delete reviews subcollection
        const reviewsSnapshot = await getDocs(collection(db, `evidenceSubmissions/${docSnapshot.id}/reviews`));
        const reviewDeletes = reviewsSnapshot.docs.map(reviewDoc => deleteDoc(reviewDoc.ref));
        await Promise.all(reviewDeletes);

        // Delete main document
        await deleteDoc(docSnapshot.ref);
        count++;
    });

    await Promise.all(deletePromises);
    return count;
}
