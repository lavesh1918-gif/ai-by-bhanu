import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import type {
  DifficultyLevel,
  EvaluationResult,
  ExperienceLevel,
  LearningMode,
  LearningSession,
  PracticeAttempt,
  PreferredLanguage,
  QuizAttempt,
  TopicProgressRecord,
  TopicStatus,
  UserProfile,
} from '../../shared/types';

function clampString(val: string, maxLength: number): string {
  return val.trim().slice(0, maxLength);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createInitialUserProfile(params: {
  uid: string;
  displayName: string;
  email: string;
}): Promise<UserProfile> {
  const path = `users/${params.uid}`;
  const cleanName = clampString(params.displayName || 'Learner', 80) || 'Learner';
  const cleanEmail = clampString(params.email || 'user@example.com', 200);
  const payload = {
    uid: params.uid,
    displayName: cleanName,
    email: cleanEmail,
    experienceLevel: 'Beginner' as ExperienceLevel,
    preferredLanguage: 'English' as PreferredLanguage,
    learningGoal: '',
    onboardingCompleted: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'users', params.uid), payload);
    const created = await getDoc(doc(db, 'users', params.uid));
    return created.data() as UserProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateUserProfile(
  uid: string,
  updates: {
    displayName: string;
    experienceLevel: ExperienceLevel;
    preferredLanguage: PreferredLanguage;
    learningGoal: string;
    onboardingCompleted?: boolean;
  }
): Promise<void> {
  const path = `users/${uid}`;
  const cleanPayload: Record<string, unknown> = {
    displayName: clampString(updates.displayName || 'Learner', 80) || 'Learner',
    experienceLevel: updates.experienceLevel,
    preferredLanguage: updates.preferredLanguage,
    learningGoal: clampString(updates.learningGoal ?? '', 300),
    updatedAt: serverTimestamp(),
  };
  if (typeof updates.onboardingCompleted === 'boolean') {
    cleanPayload.onboardingCompleted = updates.onboardingCompleted;
  }

  try {
    await updateDoc(doc(db, 'users', uid), cleanPayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function recordLearningSession(params: {
  uid: string;
  topicSlug: string;
  mode: LearningMode;
}): Promise<void> {
  const sessionId = `${params.topicSlug}_${params.mode}`.replace(/[^a-zA-Z0-9_\-]/g, '-').slice(0, 128);
  const path = `users/${params.uid}/learningSessions/${sessionId}`;
  const ref = doc(db, 'users', params.uid, 'learningSessions', sessionId);
  try {
    const existing = await getDoc(ref);
    if (!existing.exists()) {
      await setDoc(ref, {
        uid: params.uid,
        topicSlug: clampString(params.topicSlug, 80),
        mode: params.mode,
        startedAt: serverTimestamp(),
        lastActivityAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        topicSlug: clampString(params.topicSlug, 80),
        mode: params.mode,
        lastActivityAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function markLessonViewed(uid: string, topicSlug: string): Promise<void> {
  const path = `users/${uid}/topicProgress/${topicSlug}`;
  const ref = doc(db, 'users', uid, 'topicProgress', topicSlug);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid,
        topicSlug: clampString(topicSlug, 80),
        lessonsViewed: 1,
        practiceAttemptsCount: 0,
        quizAttemptsCount: 0,
        bestScore: 0,
        status: 'in_progress' as TopicStatus,
        updatedAt: serverTimestamp(),
      });
    } else {
      const data = snap.data() as TopicProgressRecord;
      const nextViews = Math.min(10000, Number(data.lessonsViewed ?? 0) + 1);
      const nextStatus: TopicStatus = data.status === 'completed' ? 'completed' : 'in_progress';
      await updateDoc(ref, {
        lessonsViewed: nextViews,
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function savePracticeAttemptRecord(params: {
  uid: string;
  topicSlug: string;
  difficulty: DifficultyLevel;
  taskTitle: string;
  taskInstructions: string;
  learnerAnswer: string;
  evaluationResult: EvaluationResult;
  feedback: string;
  hint: string;
}): Promise<void> {
  const attemptId = `prac_${crypto.randomUUID().replace(/-/g, '')}`;
  const attemptPath = `users/${params.uid}/practiceAttempts/${attemptId}`;
  try {
    await setDoc(doc(db, 'users', params.uid, 'practiceAttempts', attemptId), {
      uid: params.uid,
      topicSlug: clampString(params.topicSlug, 80),
      difficulty: params.difficulty,
      taskTitle: clampString(params.taskTitle, 200) || 'Practice Task',
      taskInstructions: clampString(params.taskInstructions, 2000) || 'Practice instructions',
      learnerAnswer: clampString(params.learnerAnswer, 8000) || 'Answer',
      evaluationResult: params.evaluationResult,
      feedback: clampString(params.feedback, 4000) || 'Evaluated',
      hint: clampString(params.hint ?? '', 1000),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, attemptPath);
  }

  const progPath = `users/${params.uid}/topicProgress/${params.topicSlug}`;
  const progRef = doc(db, 'users', params.uid, 'topicProgress', params.topicSlug);
  try {
    const snap = await getDoc(progRef);
    if (!snap.exists()) {
      await setDoc(progRef, {
        uid: params.uid,
        topicSlug: clampString(params.topicSlug, 80),
        lessonsViewed: 0,
        practiceAttemptsCount: 1,
        quizAttemptsCount: 0,
        bestScore: 0,
        status: 'in_progress' as TopicStatus,
        updatedAt: serverTimestamp(),
      });
    } else {
      const data = snap.data() as TopicProgressRecord;
      const nextCount = Math.min(10000, Number(data.practiceAttemptsCount ?? 0) + 1);
      const nextStatus: TopicStatus = data.status === 'completed' ? 'completed' : 'in_progress';
      await updateDoc(progRef, {
        practiceAttemptsCount: nextCount,
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, progPath);
  }
}

export async function saveQuizAttemptRecord(params: {
  uid: string;
  quizId: string;
  topicSlug: string;
  difficulty: DifficultyLevel;
  questionCount: 5 | 10;
  correctCount: number;
  scorePercent: number;
}): Promise<void> {
  const attemptPath = `users/${params.uid}/quizAttempts/${params.quizId}`;
  try {
    await setDoc(doc(db, 'users', params.uid, 'quizAttempts', params.quizId), {
      uid: params.uid,
      quizId: clampString(params.quizId, 128),
      topicSlug: clampString(params.topicSlug, 80),
      difficulty: params.difficulty,
      questionCount: params.questionCount,
      correctCount: params.correctCount,
      scorePercent: params.scorePercent,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, attemptPath);
  }

  if (params.topicSlug !== 'mixed') {
    const progPath = `users/${params.uid}/topicProgress/${params.topicSlug}`;
    const progRef = doc(db, 'users', params.uid, 'topicProgress', params.topicSlug);
    try {
      const snap = await getDoc(progRef);
      const passed = params.scorePercent >= 70;
      if (!snap.exists()) {
        await setDoc(progRef, {
          uid: params.uid,
          topicSlug: clampString(params.topicSlug, 80),
          lessonsViewed: 0,
          practiceAttemptsCount: 0,
          quizAttemptsCount: 1,
          bestScore: params.scorePercent,
          status: (passed ? 'completed' : 'in_progress') as TopicStatus,
          updatedAt: serverTimestamp(),
        });
      } else {
        const data = snap.data() as TopicProgressRecord;
        const nextCount = Math.min(10000, Number(data.quizAttemptsCount ?? 0) + 1);
        const nextBest = Math.max(Number(data.bestScore ?? 0), params.scorePercent);
        const nextStatus: TopicStatus =
          data.status === 'completed' || passed ? 'completed' : 'in_progress';
        await updateDoc(progRef, {
          quizAttemptsCount: nextCount,
          bestScore: nextBest,
          status: nextStatus,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, progPath);
    }
  }
}

export async function fetchLearnerDashboardData(uid: string): Promise<{
  topicProgress: TopicProgressRecord[];
  quizAttempts: QuizAttempt[];
  practiceAttempts: PracticeAttempt[];
  learningSessions: LearningSession[];
}> {
  const progPath = `users/${uid}/topicProgress`;
  const quizPath = `users/${uid}/quizAttempts`;
  const pracPath = `users/${uid}/practiceAttempts`;
  const sessPath = `users/${uid}/learningSessions`;

  let topicProgress: TopicProgressRecord[] = [];
  let quizAttempts: QuizAttempt[] = [];
  let practiceAttempts: PracticeAttempt[] = [];
  let learningSessions: LearningSession[] = [];

  try {
    const progSnap = await getDocs(
      query(collection(db, 'users', uid, 'topicProgress'), where('uid', '==', uid), limit(50))
    );
    topicProgress = progSnap.docs.map((d) => d.data() as TopicProgressRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, progPath);
  }

  try {
    const quizSnap = await getDocs(
      query(
        collection(db, 'users', uid, 'quizAttempts'),
        where('uid', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(30)
      )
    );
    quizAttempts = quizSnap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<QuizAttempt, 'id'>),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, quizPath);
  }

  try {
    const pracSnap = await getDocs(
      query(
        collection(db, 'users', uid, 'practiceAttempts'),
        where('uid', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(30)
      )
    );
    practiceAttempts = pracSnap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<PracticeAttempt, 'id'>),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, pracPath);
  }

  try {
    const sessSnap = await getDocs(
      query(
        collection(db, 'users', uid, 'learningSessions'),
        where('uid', '==', uid),
        orderBy('lastActivityAt', 'desc'),
        limit(15)
      )
    );
    learningSessions = sessSnap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<LearningSession, 'id'>),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, sessPath);
  }

  return { topicProgress, quizAttempts, practiceAttempts, learningSessions };
}
