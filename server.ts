import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';
import express, { type Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { CURRICULUM_BY_SLUG, CURRICULUM_TOPICS, isValidCurriculumSlug } from './shared/curriculum.ts';
import type {
  DifficultyLevel,
  ExperienceLevel,
  LearningMode,
  PreferredLanguage,
  QuizQuestionReview,
  RecommendationResult,
} from './shared/types.ts';
import { requireAuth, type AuthenticatedRequest } from './server/auth.ts';
import { checkUserRateLimit } from './server/rateLimit.ts';
import {
  evaluatePracticeAnswer,
  GeminiServiceError,
  generatePracticeTask,
  generateQuizQuestions,
  generateTutorChatReply,
  getGeminiModelName,
  isGeminiConfigured,
  type ChatTurn,
} from './server/gemini.ts';
import {
  getPrivateQuizRecord,
  markPrivateQuizSubmitted,
  savePrivateQuizRecord,
} from './server/quizStore.ts';

const VALID_EXPERIENCE: ExperienceLevel[] = ['Beginner', 'Some Basics', 'Intermediate'];
const VALID_LANGUAGES: PreferredLanguage[] = ['English', 'Hindi', 'Hinglish'];
const VALID_DIFFICULTIES: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced'];
const VALID_MODES: LearningMode[] = ['learn', 'practice', 'quiz'];

function sendError(res: Response, status: number, message: string, code = 'BAD_REQUEST'): void {
  res.status(status).json({ error: message, code });
}

function handleApiError(res: Response, err: unknown): void {
  if (err instanceof GeminiServiceError) {
    sendError(res, err.status, err.message, err.code);
    return;
  }
  sendError(res, 500, 'An unexpected server error occurred. Please try again.', 'INTERNAL_ERROR');
}

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      geminiConfigured: isGeminiConfigured(),
      model: getGeminiModelName(),
    });
  });

  // 1. AI Tutor Chat
  app.post('/api/tutor/chat', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const uid = req.user?.uid;
    if (!uid) {
      sendError(res, 401, 'Authentication required.', 'UNAUTHORIZED');
      return;
    }

    const rate = checkUserRateLimit(uid);
    if (!rate.allowed) {
      sendError(
        res,
        429,
        `Too many AI requests in a short window. Please retry in ${rate.retryAfterSeconds} seconds.`,
        'RATE_LIMITED'
      );
      return;
    }

    const body = req.body as Record<string, unknown>;
    const topicSlug = String(body.topicSlug ?? '').trim();
    const message = String(body.message ?? '').trim();
    const experienceLevel = String(body.experienceLevel ?? 'Beginner') as ExperienceLevel;
    const preferredLanguage = String(body.preferredLanguage ?? 'English') as PreferredLanguage;
    const mode = String(body.mode ?? 'learn') as LearningMode;
    const lessonContext = typeof body.lessonContext === 'string' ? body.lessonContext.trim().slice(0, 500) : undefined;

    if (!isValidCurriculumSlug(topicSlug)) {
      sendError(res, 400, 'Please select a valid curriculum topic.');
      return;
    }
    if (!message || message.length > 1500) {
      sendError(res, 400, 'Message must be between 1 and 1,500 characters.');
      return;
    }
    if (!VALID_EXPERIENCE.includes(experienceLevel)) {
      sendError(res, 400, 'Invalid experience level.');
      return;
    }
    if (!VALID_LANGUAGES.includes(preferredLanguage)) {
      sendError(res, 400, 'Invalid preferred language.');
      return;
    }
    if (!VALID_MODES.includes(mode)) {
      sendError(res, 400, 'Invalid learning mode.');
      return;
    }

    const rawHistory = Array.isArray(body.history) ? body.history : [];
    const history: ChatTurn[] = rawHistory
      .slice(-8)
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
      .map((item) => ({
        role: (item.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
        text: String(item.text ?? '').trim().slice(0, 1500),
      }))
      .filter((item) => item.text.length > 0);

    try {
      const reply = await generateTutorChatReply({
        topicSlug,
        experienceLevel,
        preferredLanguage,
        mode,
        message,
        history,
        lessonContext,
      });
      res.json({ reply });
    } catch (err) {
      handleApiError(res, err);
    }
  });

  // 2. Generate Practice Task
  app.post('/api/practice/generate', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const uid = req.user?.uid;
    if (!uid) {
      sendError(res, 401, 'Authentication required.', 'UNAUTHORIZED');
      return;
    }

    const rate = checkUserRateLimit(uid);
    if (!rate.allowed) {
      sendError(
        res,
        429,
        `Too many AI requests in a short window. Please retry in ${rate.retryAfterSeconds} seconds.`,
        'RATE_LIMITED'
      );
      return;
    }

    const body = req.body as Record<string, unknown>;
    const topicSlug = String(body.topicSlug ?? '').trim();
    const difficulty = String(body.difficulty ?? 'beginner') as DifficultyLevel;
    const experienceLevel = String(body.experienceLevel ?? 'Beginner') as ExperienceLevel;
    const preferredLanguage = String(body.preferredLanguage ?? 'English') as PreferredLanguage;

    if (!isValidCurriculumSlug(topicSlug)) {
      sendError(res, 400, 'Please choose a valid topic.');
      return;
    }
    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      sendError(res, 400, 'Invalid difficulty level.');
      return;
    }
    if (!VALID_EXPERIENCE.includes(experienceLevel)) {
      sendError(res, 400, 'Invalid experience level.');
      return;
    }
    if (!VALID_LANGUAGES.includes(preferredLanguage)) {
      sendError(res, 400, 'Invalid preferred language.');
      return;
    }

    try {
      const task = await generatePracticeTask({
        topicSlug,
        difficulty,
        experienceLevel,
        preferredLanguage,
      });
      res.json(task);
    } catch (err) {
      handleApiError(res, err);
    }
  });

  // 3. Evaluate Practice Submission
  app.post('/api/practice/evaluate', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const uid = req.user?.uid;
    if (!uid) {
      sendError(res, 401, 'Authentication required.', 'UNAUTHORIZED');
      return;
    }

    const rate = checkUserRateLimit(uid);
    if (!rate.allowed) {
      sendError(
        res,
        429,
        `Too many AI requests in a short window. Please retry in ${rate.retryAfterSeconds} seconds.`,
        'RATE_LIMITED'
      );
      return;
    }

    const body = req.body as Record<string, unknown>;
    const topicSlug = String(body.topicSlug ?? '').trim();
    const difficulty = String(body.difficulty ?? 'beginner') as DifficultyLevel;
    const taskTitle = String(body.taskTitle ?? '').trim();
    const taskInstructions = String(body.taskInstructions ?? '').trim();
    const learnerAnswer = String(body.learnerAnswer ?? '').trim();
    const experienceLevel = String(body.experienceLevel ?? 'Beginner') as ExperienceLevel;
    const preferredLanguage = String(body.preferredLanguage ?? 'English') as PreferredLanguage;
    const revealSolution = Boolean(body.revealSolution);

    if (!isValidCurriculumSlug(topicSlug)) {
      sendError(res, 400, 'Invalid topic slug.');
      return;
    }
    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      sendError(res, 400, 'Invalid difficulty level.');
      return;
    }
    if (!taskTitle || taskTitle.length > 200 || !taskInstructions || taskInstructions.length > 2000) {
      sendError(res, 400, 'Task details are missing or exceed allowed length.');
      return;
    }
    if (!learnerAnswer || learnerAnswer.length > 8000) {
      sendError(res, 400, 'Your submission must be between 1 and 8,000 characters.');
      return;
    }
    if (!VALID_EXPERIENCE.includes(experienceLevel) || !VALID_LANGUAGES.includes(preferredLanguage)) {
      sendError(res, 400, 'Invalid learner preferences.');
      return;
    }

    try {
      const evaluation = await evaluatePracticeAnswer({
        topicSlug,
        difficulty,
        taskTitle,
        taskInstructions,
        learnerAnswer,
        experienceLevel,
        preferredLanguage,
        revealSolution,
      });
      res.json(evaluation);
    } catch (err) {
      handleApiError(res, err);
    }
  });

  // 4. Generate Quiz (Answer key remains strictly server-side)
  app.post('/api/quiz/generate', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const uid = req.user?.uid;
    if (!uid) {
      sendError(res, 401, 'Authentication required.', 'UNAUTHORIZED');
      return;
    }

    const rate = checkUserRateLimit(uid);
    if (!rate.allowed) {
      sendError(
        res,
        429,
        `Too many AI requests in a short window. Please retry in ${rate.retryAfterSeconds} seconds.`,
        'RATE_LIMITED'
      );
      return;
    }

    const body = req.body as Record<string, unknown>;
    const topicSlug = String(body.topicSlug ?? '').trim();
    const difficulty = String(body.difficulty ?? 'beginner') as DifficultyLevel;
    const questionCount = Number(body.questionCount);
    const experienceLevel = String(body.experienceLevel ?? 'Beginner') as ExperienceLevel;
    const preferredLanguage = String(body.preferredLanguage ?? 'English') as PreferredLanguage;

    if (topicSlug !== 'mixed' && !isValidCurriculumSlug(topicSlug)) {
      sendError(res, 400, 'Please choose a valid topic or Mixed Fundamentals.');
      return;
    }
    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      sendError(res, 400, 'Invalid difficulty level.');
      return;
    }
    if (questionCount !== 5 && questionCount !== 10) {
      sendError(res, 400, 'Question count must be 5 or 10.');
      return;
    }
    if (!VALID_EXPERIENCE.includes(experienceLevel) || !VALID_LANGUAGES.includes(preferredLanguage)) {
      sendError(res, 400, 'Invalid learner preferences.');
      return;
    }

    try {
      const questions = await generateQuizQuestions({
        topicSlug,
        difficulty,
        questionCount,
        experienceLevel,
        preferredLanguage,
      });

      const stored = await savePrivateQuizRecord({
        uid,
        topicSlug,
        difficulty,
        questionCount,
        questions,
      });

      // Return ONLY public question data — NEVER send correctIndex or explanation prior to submission
      res.json({
        quizId: stored.quizId,
        topicSlug: stored.topicSlug,
        difficulty: stored.difficulty,
        questionCount: stored.questionCount,
        expiresAt: stored.expiresAt,
        questions: stored.questions.map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options,
        })),
      });
    } catch (err) {
      handleApiError(res, err);
    }
  });

  // 5. Submit Quiz & Score Server-Side
  app.post('/api/quiz/submit', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const uid = req.user?.uid;
    if (!uid) {
      sendError(res, 401, 'Authentication required.', 'UNAUTHORIZED');
      return;
    }

    const body = req.body as Record<string, unknown>;
    const quizId = String(body.quizId ?? '').trim();
    const answers = body.answers;

    if (!quizId || !/^[a-zA-Z0-9_\-]+$/.test(quizId)) {
      sendError(res, 400, 'Invalid quiz ID.');
      return;
    }
    if (!Array.isArray(answers)) {
      sendError(res, 400, 'Answers array is required.');
      return;
    }

    const record = await getPrivateQuizRecord(quizId);
    if (!record) {
      sendError(res, 404, 'Quiz session not found or expired. Please start a new quiz.', 'QUIZ_NOT_FOUND');
      return;
    }
    if (record.uid !== uid) {
      sendError(res, 403, 'You are not authorized to submit this quiz.', 'FORBIDDEN');
      return;
    }
    if (record.submitted) {
      sendError(res, 409, 'This quiz has already been submitted.', 'ALREADY_SUBMITTED');
      return;
    }
    if (Date.now() > record.expiresAt) {
      sendError(res, 410, 'This quiz session expired. Please generate a fresh quiz.', 'QUIZ_EXPIRED');
      return;
    }
    if (answers.length !== record.questionCount) {
      sendError(res, 400, `Please answer all ${record.questionCount} questions before submitting.`);
      return;
    }

    const normalizedAnswers: number[] = [];
    for (let i = 0; i < answers.length; i++) {
      const idx = Number(answers[i]);
      if (!Number.isInteger(idx) || idx < 0 || idx > 3) {
        sendError(res, 400, `Question ${i + 1} has an invalid option selection.`);
        return;
      }
      normalizedAnswers.push(idx);
    }

    await markPrivateQuizSubmitted(quizId);

    let correctCount = 0;
    const results: QuizQuestionReview[] = record.questions.map((q, idx) => {
      const selectedIndex = normalizedAnswers[idx];
      const isCorrect = selectedIndex === q.correctIndex;
      if (isCorrect) correctCount += 1;
      return {
        id: q.id,
        question: q.question,
        options: q.options,
        selectedIndex,
        correctIndex: q.correctIndex,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const scorePercent = Math.round((correctCount / record.questionCount) * 100);

    res.json({
      quizId: record.quizId,
      topicSlug: record.topicSlug,
      difficulty: record.difficulty,
      questionCount: record.questionCount,
      correctCount,
      scorePercent,
      results,
    });
  });

  // 6. Evidence-Based Progress Recommendation
  app.post('/api/progress/recommend', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const uid = req.user?.uid;
    if (!uid) {
      sendError(res, 401, 'Authentication required.', 'UNAUTHORIZED');
      return;
    }

    const body = req.body as Record<string, unknown>;
    const rawProgress = Array.isArray(body.topicProgress) ? body.topicProgress : [];
    const rawQuizzes = Array.isArray(body.recentQuizzes) ? body.recentQuizzes : [];

    // Rule-based evidence analysis directly from real saved learner records (never invented!)
    const progressBySlug = new Map<
      string,
      { lessonsViewed: number; practiceAttemptsCount: number; quizAttemptsCount: number; bestScore: number; status: string }
    >();

    for (const item of rawProgress) {
      if (!item || typeof item !== 'object') continue;
      const obj = item as Record<string, unknown>;
      const slug = String(obj.topicSlug ?? '');
      if (!isValidCurriculumSlug(slug)) continue;
      progressBySlug.set(slug, {
        lessonsViewed: Number(obj.lessonsViewed ?? 0),
        practiceAttemptsCount: Number(obj.practiceAttemptsCount ?? 0),
        quizAttemptsCount: Number(obj.quizAttemptsCount ?? 0),
        bestScore: Number(obj.bestScore ?? 0),
        status: String(obj.status ?? 'not_started'),
      });
    }

    // 1. Check if a recent quiz score (< 70%) signals a topic needing practice
    for (const q of rawQuizzes) {
      if (!q || typeof q !== 'object') continue;
      const obj = q as Record<string, unknown>;
      const slug = String(obj.topicSlug ?? '');
      const score = Number(obj.scorePercent ?? 100);
      if (isValidCurriculumSlug(slug) && score < 70) {
        const topic = CURRICULUM_BY_SLUG[slug];
        const rec: RecommendationResult = {
          recommendedTopicSlug: slug,
          recommendedTopicTitle: topic.title,
          recommendedMode: 'practice',
          reason: `Recommended because your saved ${topic.title} quiz score was ${score}%. Practicing hands-on concepts will strengthen this area before retaking the quiz.`,
          source: 'evidence',
        };
        res.json(rec);
        return;
      }
    }

    // 2. Check for an explored topic that hasn't had a practice or quiz attempt yet
    for (const topic of CURRICULUM_TOPICS) {
      const p = progressBySlug.get(topic.slug);
      if (p && p.lessonsViewed > 0 && p.quizAttemptsCount === 0) {
        const mode: LearningMode = p.practiceAttemptsCount === 0 ? 'practice' : 'quiz';
        const rec: RecommendationResult = {
          recommendedTopicSlug: topic.slug,
          recommendedTopicTitle: topic.title,
          recommendedMode: mode,
          reason: `Recommended because you viewed ${topic.title} (${p.lessonsViewed} lesson ${p.lessonsViewed === 1 ? 'view' : 'views'}) and haven't completed a ${mode} check yet.`,
          source: 'evidence',
        };
        res.json(rec);
        return;
      }
    }

    // 3. Otherwise recommend the next sequential curriculum topic with no activity yet
    const nextUnstarted = CURRICULUM_TOPICS.find((t) => {
      const p = progressBySlug.get(t.slug);
      return !p || (p.lessonsViewed === 0 && p.practiceAttemptsCount === 0 && p.quizAttemptsCount === 0);
    });

    if (nextUnstarted) {
      const rec: RecommendationResult = {
        recommendedTopicSlug: nextUnstarted.slug,
        recommendedTopicTitle: nextUnstarted.title,
        recommendedMode: 'learn',
        reason:
          progressBySlug.size === 0
            ? 'Recommended as Topic 1 of the SmartLearn AI curriculum since you have not started a lesson yet.'
            : `Recommended as the next unstarted topic in your 9-step curriculum sequence (Topic ${nextUnstarted.order} of 9).`,
        source: progressBySlug.size === 0 ? 'curriculum_default' : 'evidence',
      };
      res.json(rec);
      return;
    }

    // 4. All 9 topics explored: suggest the lowest bestScore topic for mastery review
    let lowestTopic = CURRICULUM_TOPICS[0];
    let lowestScore = 101;
    for (const topic of CURRICULUM_TOPICS) {
      const p = progressBySlug.get(topic.slug);
      if (p && p.bestScore < lowestScore) {
        lowestScore = p.bestScore;
        lowestTopic = topic;
      }
    }

    const rec: RecommendationResult = {
      recommendedTopicSlug: lowestTopic.slug,
      recommendedTopicTitle: lowestTopic.title,
      recommendedMode: 'quiz',
      reason: `You have explored all 9 topics! ${lowestTopic.title} currently has your lowest best quiz score (${lowestScore}%), making it the best candidate to review.`,
      source: 'evidence',
    };
    res.json(rec);
  });

  // Catch unknown /api routes with JSON 404
  app.use('/api', (_req, res) => {
    sendError(res, 404, 'API endpoint not found.', 'NOT_FOUND');
  });

  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexHtml = path.join(distDir, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`SmartLearn AI server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
