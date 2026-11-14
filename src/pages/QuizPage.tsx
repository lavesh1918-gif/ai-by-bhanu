import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Play, RotateCcw, XCircle } from 'lucide-react';
import { CURRICULUM_TOPICS, isValidCurriculumSlug } from '../../shared/curriculum';
import type {
  DifficultyLevel,
  GeneratedQuizResponse,
  QuizSubmitResponse,
} from '../../shared/types';
import { useAuth } from '../context/AuthContext';
import { apiPost, ApiClientError } from '../lib/api';
import { recordLearningSession, saveQuizAttemptRecord } from '../lib/firestoreService';
import { AlertBanner, Button, Card, StatusText } from '../components/ui/Primitives';

export function QuizPage() {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTopicParam = searchParams.get('topic') || '';

  const [topicSlug, setTopicSlug] = useState(
    initialTopicParam === 'mixed' || isValidCurriculumSlug(initialTopicParam)
      ? initialTopicParam
      : CURRICULUM_TOPICS[0].slug
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');
  const [questionCount, setQuestionCount] = useState<5 | 10>(5);

  const [quiz, setQuiz] = useState<GeneratedQuizResponse | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submission, setSubmission] = useState<QuizSubmitResponse | null>(null);

  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    if (initialTopicParam === 'mixed' || isValidCurriculumSlug(initialTopicParam)) {
      setTopicSlug(initialTopicParam);
    }
  }, [initialTopicParam]);

  const handleGenerateQuiz = async () => {
    setError(null);
    setSaveNotice(null);
    setSubmission(null);
    setAnswers({});
    setGenerating(true);

    try {
      const generated = await apiPost<GeneratedQuizResponse>('/api/quiz/generate', {
        topicSlug,
        difficulty,
        questionCount,
        experienceLevel: profile?.experienceLevel || 'Beginner',
        preferredLanguage: profile?.preferredLanguage || 'English',
      });
      setQuiz(generated);

      if (user && topicSlug !== 'mixed') {
        void recordLearningSession({
          uid: user.uid,
          topicSlug,
          mode: 'quiz',
        }).catch(() => {});
      }
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : 'Could not generate quiz questions right now. Please try again.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz || submitting || submission || !user) return;

    const orderedAnswers: number[] = [];
    for (let i = 0; i < quiz.questions.length; i++) {
      if (typeof answers[i] !== 'number') {
        setError(`Please select an answer for Question ${i + 1} before submitting.`);
        return;
      }
      orderedAnswers.push(answers[i]);
    }

    setError(null);
    setSubmitting(true);
    try {
      const result = await apiPost<QuizSubmitResponse>('/api/quiz/submit', {
        quizId: quiz.quizId,
        answers: orderedAnswers,
      });

      setSubmission(result);

      try {
        await saveQuizAttemptRecord({
          uid: user.uid,
          quizId: result.quizId,
          topicSlug: result.topicSlug,
          difficulty: result.difficulty,
          questionCount: result.questionCount,
          correctCount: result.correctCount,
          scorePercent: result.scorePercent,
        });
        setSaveNotice('Quiz score and attempt saved to Cloud Firestore.');
      } catch {
        setSaveNotice('Quiz scored on server, though saving to Firestore failed.');
      }
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : 'Could not submit your quiz. Your selections are preserved—please retry.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const allAnswered = Boolean(quiz && answeredCount === quiz.questions.length);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400">
          Server-Scored Assessment
        </p>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
          Test Your Understanding
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Choose a topic, difficulty, and 5 or 10 questions. Answer keys stay strictly on the server until you submit.
        </p>
      </div>

      {/* Quiz Config Bar */}
      <Card className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="quiz-topic" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Topic
            </label>
            <select
              id="quiz-topic"
              value={topicSlug}
              onChange={(e) => setTopicSlug(e.target.value)}
              disabled={generating || submitting}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-white"
            >
              {CURRICULUM_TOPICS.map((t) => (
                <option key={t.slug} value={t.slug}>
                  0{t.order}. {t.title}
                </option>
              ))}
              <option value="mixed">Mixed Fundamentals (All 9 Topics)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="quiz-difficulty" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Difficulty
            </label>
            <select
              id="quiz-difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
              disabled={generating || submitting}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-white"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="quiz-count" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Questions
            </label>
            <select
              id="quiz-count"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value) === 10 ? 10 : 5)}
              disabled={generating || submitting}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-white"
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
            </select>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
          <Button loading={generating} onClick={() => void handleGenerateQuiz()}>
            <Play className="h-4 w-4" aria-hidden="true" />
            <span>{quiz ? 'Generate New Quiz' : 'Start Quiz'}</span>
          </Button>
        </div>
      </Card>

      {error && <AlertBanner tone="error" message={error} />}

      {/* Active Quiz Form */}
      {quiz && !submission && (
        <form onSubmit={handleSubmitQuiz} className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            <span>
              {quiz.questionCount} Questions · {quiz.difficulty}
            </span>
            <span>
              {answeredCount} / {quiz.questions.length} answered
            </span>
          </div>

          {quiz.questions.map((q, qIdx) => (
            <Card key={q.id} className="p-6 space-y-4">
              <fieldset className="space-y-3">
                <legend className="font-display font-semibold text-base text-slate-900 dark:text-white">
                  {qIdx + 1}. {q.question}
                </legend>
                <div className="space-y-2 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const selected = answers[qIdx] === optIdx;
                    const inputId = `${q.id}_opt_${optIdx}`;
                    return (
                      <label
                        key={inputId}
                        htmlFor={inputId}
                        className={`flex items-start gap-3 p-3.5 rounded-lg border text-sm cursor-pointer transition-colors ${
                          selected
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 dark:border-indigo-500 text-slate-900 dark:text-white'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <input
                          id={inputId}
                          type="radio"
                          name={q.id}
                          checked={selected}
                          onChange={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              [qIdx]: optIdx,
                            }))
                          }
                          className="mt-0.5 h-4 w-4 text-indigo-600 focus:ring-indigo-600"
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </Card>
          ))}

          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Select one option per question to enable submission.
            </span>
            <Button type="submit" size="lg" loading={submitting} disabled={!allAnswered}>
              Submit Quiz for Scoring
            </Button>
          </div>
        </form>
      )}

      {/* Post-Submission Results & Explanations */}
      {submission && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Server-Verified Score
                </p>
                <h2 className="font-display font-bold text-3xl text-slate-900 dark:text-white tabular-nums">
                  {submission.scorePercent}% ({submission.correctCount}/{submission.questionCount} correct)
                </h2>
                {saveNotice && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{saveNotice}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button variant="secondary" onClick={() => void handleGenerateQuiz()}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  <span>Take Another Quiz</span>
                </Button>
                <Link
                  to="/progress"
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  View Progress
                </Link>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            {submission.results.map((item, idx) => (
              <Card key={item.id} className="p-6 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display font-semibold text-base text-slate-900 dark:text-white">
                    {idx + 1}. {item.question}
                  </h3>
                  <StatusText
                    tone={item.isCorrect ? 'success' : 'error'}
                    label={item.isCorrect ? 'Correct' : 'Incorrect'}
                  />
                </div>

                <div className="space-y-1.5 text-sm">
                  {item.options.map((opt, optIdx) => {
                    const isSelected = item.selectedIndex === optIdx;
                    const isCorrectOpt = item.correctIndex === optIdx;
                    return (
                      <div
                        key={optIdx}
                        className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border ${
                          isCorrectOpt
                            ? 'border-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                            : isSelected && !isCorrectOpt
                              ? 'border-red-300 bg-red-50/70 dark:bg-red-950/30 dark:border-red-800 text-red-950 dark:text-red-100'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span>{opt}</span>
                        <span className="text-xs font-medium shrink-0 inline-flex items-center gap-1">
                          {isCorrectOpt && (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Correct Answer</span>
                            </>
                          )}
                          {isSelected && !isCorrectOpt && (
                            <>
                              <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Your Selection</span>
                            </>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Explanation:{' '}
                  </span>
                  {item.explanation}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
