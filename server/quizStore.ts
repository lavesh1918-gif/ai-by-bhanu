import crypto from 'node:crypto';
import type { DifficultyLevel } from '../shared/types.ts';
import { getAdminFirestore } from './auth.ts';

export interface StoredQuizQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export interface StoredQuizRecord {
  quizId: string;
  uid: string;
  topicSlug: string;
  difficulty: DifficultyLevel;
  questionCount: 5 | 10;
  questions: StoredQuizQuestion[];
  submitted: boolean;
  createdAt: number;
  expiresAt: number;
}

const MEMORY_TTL_MS = 45 * 60 * 1000;
const memoryStore = new Map<string, StoredQuizRecord>();
let firestoreWritesDisabled = false;

function pruneExpiredMemoryRecords(): void {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    if (now > value.expiresAt + 5 * 60 * 1000) {
      memoryStore.delete(key);
    }
  }
}

export async function savePrivateQuizRecord(params: {
  uid: string;
  topicSlug: string;
  difficulty: DifficultyLevel;
  questionCount: 5 | 10;
  questions: StoredQuizQuestion[];
}): Promise<StoredQuizRecord> {
  pruneExpiredMemoryRecords();
  const now = Date.now();
  const quizId = `quiz_${crypto.randomUUID().replace(/-/g, '')}`;
  const record: StoredQuizRecord = {
    quizId,
    uid: params.uid,
    topicSlug: params.topicSlug,
    difficulty: params.difficulty,
    questionCount: params.questionCount,
    questions: params.questions,
    submitted: false,
    createdAt: now,
    expiresAt: now + MEMORY_TTL_MS,
  };

  memoryStore.set(quizId, record);

  if (!firestoreWritesDisabled) {
    const db = getAdminFirestore();
    if (db) {
      try {
        await db.collection('quizAnswerKeys').doc(quizId).set({
          uid: record.uid,
          topicSlug: record.topicSlug,
          difficulty: record.difficulty,
          questionCount: record.questionCount,
          questions: record.questions,
          submitted: record.submitted,
          createdAt: new Date(record.createdAt),
          expiresAt: new Date(record.expiresAt),
        });
      } catch {
        // In local preview without Application Default Credentials, keep server memory store active
        firestoreWritesDisabled = true;
      }
    }
  }

  return record;
}

export async function getPrivateQuizRecord(quizId: string): Promise<StoredQuizRecord | null> {
  const mem = memoryStore.get(quizId);
  if (mem) return mem;

  if (!firestoreWritesDisabled) {
    const db = getAdminFirestore();
    if (db) {
      try {
        const snap = await db.collection('quizAnswerKeys').doc(quizId).get();
        if (!snap.exists) return null;
        const data = snap.data() as Record<string, unknown>;
        const record: StoredQuizRecord = {
          quizId,
          uid: String(data.uid ?? ''),
          topicSlug: String(data.topicSlug ?? ''),
          difficulty: (data.difficulty as DifficultyLevel) ?? 'beginner',
          questionCount: (data.questionCount === 10 ? 10 : 5),
          questions: (data.questions as StoredQuizQuestion[]) ?? [],
          submitted: Boolean(data.submitted),
          createdAt: data.createdAt instanceof Date ? data.createdAt.getTime() : Date.now(),
          expiresAt: data.expiresAt instanceof Date ? data.expiresAt.getTime() : Date.now() + MEMORY_TTL_MS,
        };
        memoryStore.set(quizId, record);
        return record;
      } catch {
        firestoreWritesDisabled = true;
      }
    }
  }

  return null;
}

export async function markPrivateQuizSubmitted(quizId: string): Promise<void> {
  const mem = memoryStore.get(quizId);
  if (mem) {
    mem.submitted = true;
  }

  if (!firestoreWritesDisabled) {
    const db = getAdminFirestore();
    if (db) {
      try {
        await db.collection('quizAnswerKeys').doc(quizId).update({
          submitted: true,
        });
      } catch {
        firestoreWritesDisabled = true;
      }
    }
  }
}
