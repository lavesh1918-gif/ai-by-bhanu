import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { CURRICULUM_BY_SLUG, CURRICULUM_TOPICS } from '../../shared/curriculum';
import type {
  PracticeAttempt,
  QuizAttempt,
  RecommendationResult,
  TopicProgressRecord,
} from '../../shared/types';
import { useAuth } from '../context/AuthContext';
import { apiPost } from '../lib/api';
import { fetchLearnerDashboardData } from '../lib/firestoreService';
import { AlertBanner, Card, SkeletonBlock, StatusText } from '../components/ui/Primitives';

function formatTimestamp(ts: unknown): string {
  if (!ts) return 'Just now';
  if (typeof ts === 'object' && ts !== null && 'toDate' in ts && typeof (ts as { toDate: () => Date }).toDate === 'function') {
    return (ts as { toDate: () => Date }).toDate().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return 'Saved';
}

export function ProgressPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topicProgress, setTopicProgress] = useState<TopicProgressRecord[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [practiceAttempts, setPracticeAttempts] = useState<PracticeAttempt[]>([]);
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);

  const loadProgress = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLearnerDashboardData(user.uid);
      setTopicProgress(data.topicProgress);
      setQuizAttempts(data.quizAttempts);
      setPracticeAttempts(data.practiceAttempts);

      try {
        const rec = await apiPost<RecommendationResult>('/api/progress/recommend', {
          topicProgress: data.topicProgress,
          recentQuizzes: data.quizAttempts.slice(0, 5),
        });
        setRecommendation(rec);
      } catch {
        setRecommendation(null);
      }
    } catch {
      setError('Unable to load your saved progress from Firestore. Please retry.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadProgress();
  }, [loadProgress]);

  const analysis = useMemo(() => {
    const strengths = topicProgress.filter((p) => p.quizAttemptsCount > 0 && p.bestScore >= 80);
    const needsPractice = topicProgress.filter(
      (p) => (p.quizAttemptsCount > 0 && p.bestScore < 70) || (p.practiceAttemptsCount > 1 && p.quizAttemptsCount === 0)
    );
    const totalLessonsViewed = topicProgress.reduce((sum, p) => sum + (p.lessonsViewed || 0), 0);
    const avgScore =
      quizAttempts.length > 0
        ? Math.round(quizAttempts.reduce((sum, q) => sum + q.scorePercent, 0) / quizAttempts.length)
        : null;

    return { strengths, needsPractice, totalLessonsViewed, avgScore };
  }, [topicProgress, quizAttempts]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <SkeletonBlock className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonBlock className="h-44" />
          <SkeletonBlock className="h-44" />
        </div>
        <SkeletonBlock className="h-64" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400">
          Progress & Recommendations
        </p>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
          Your Recorded Learning Analytics
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Every figure below comes directly from your saved Cloud Firestore lesson views, practice evaluations, and server-scored quizzes.
        </p>
      </div>

      {error && <AlertBanner tone="error" message={error} onRetry={() => void loadProgress()} />}

      {/* Recommendation Banner */}
      {recommendation && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-sky-700 dark:text-sky-400">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span>Evidence-Based Recommendation</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white">
                Next Focus: {recommendation.recommendedTopicTitle}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {recommendation.reason}
              </p>
            </div>
            <Link
              to={
                recommendation.recommendedMode === 'practice'
                  ? `/practice?topic=${recommendation.recommendedTopicSlug}`
                  : recommendation.recommendedMode === 'quiz'
                    ? `/quiz?topic=${recommendation.recommendedTopicSlug}`
                    : `/learn/${recommendation.recommendedTopicSlug}`
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0"
            >
              <span className="capitalize">Open {recommendation.recommendedMode}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Card>
      )}

      {/* Strengths & Topics Needing Practice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h2 className="font-display font-semibold text-base text-slate-900 dark:text-white">
            Topic-Wise Strengths (Best Quiz ≥ 80%)
          </h2>
          {analysis.strengths.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Insufficient quiz data yet. Score 80% or higher on a topic quiz to see confirmed strengths here.
            </p>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {analysis.strengths.map((p) => (
                <li key={p.topicSlug} className="py-2.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-900 dark:text-white">
                    {CURRICULUM_BY_SLUG[p.topicSlug]?.title || p.topicSlug}
                  </span>
                  <span className="font-mono tabular-nums text-emerald-700 dark:text-emerald-400 font-semibold">
                    {p.bestScore}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="font-display font-semibold text-base text-slate-900 dark:text-white">
            Topics Needing Practice
          </h2>
          {analysis.needsPractice.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              No weak topics flagged yet based on your saved attempts. Complete quizzes or practice exercises to surface targeted review areas.
            </p>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {analysis.needsPractice.map((p) => (
                <li key={p.topicSlug} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {CURRICULUM_BY_SLUG[p.topicSlug]?.title || p.topicSlug}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      {p.quizAttemptsCount > 0
                        ? `Best quiz score: ${p.bestScore}%`
                        : `${p.practiceAttemptsCount} practice attempts, no quiz completed yet`}
                    </p>
                  </div>
                  <Link
                    to={`/practice?topic=${p.topicSlug}`}
                    className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 hover:underline shrink-0"
                  >
                    Practice →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Recent Quiz Attempts */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-display font-semibold text-base text-slate-900 dark:text-white">
            Recent Quiz Attempts ({quizAttempts.length})
          </h2>
          {analysis.avgScore !== null && (
            <span className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
              Average: {analysis.avgScore}%
            </span>
          )}
        </div>

        {quizAttempts.length === 0 ? (
          <div className="p-6 text-sm text-slate-500 dark:text-slate-400 space-y-2">
            <p>You haven’t submitted any quizzes yet.</p>
            <Link
              to="/quiz"
              className="inline-block text-sm font-semibold text-indigo-700 dark:text-indigo-400 hover:underline"
            >
              Take your first quiz →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3 font-medium">Topic</th>
                  <th className="px-6 py-3 font-medium">Difficulty</th>
                  <th className="px-6 py-3 font-medium text-right">Correct</th>
                  <th className="px-6 py-3 font-medium text-right">Score</th>
                  <th className="px-6 py-3 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {quizAttempts.map((q) => (
                  <tr key={q.id}>
                    <td className="px-6 py-3.5 font-medium text-slate-900 dark:text-white">
                      {q.topicSlug === 'mixed'
                        ? 'Mixed Fundamentals'
                        : CURRICULUM_BY_SLUG[q.topicSlug]?.title || q.topicSlug}
                    </td>
                    <td className="px-6 py-3.5 capitalize text-slate-600 dark:text-slate-300">
                      {q.difficulty}
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                      {q.correctCount}/{q.questionCount}
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono tabular-nums font-semibold">
                      <StatusText
                        tone={q.scorePercent >= 70 ? 'success' : 'warning'}
                        label={`${q.scorePercent}%`}
                      />
                    </td>
                    <td className="px-6 py-3.5 text-right tabular-nums text-slate-500 dark:text-slate-400">
                      {formatTimestamp(q.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Recent Practice Attempts */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-display font-semibold text-base text-slate-900 dark:text-white">
            Recent Practice Evaluations ({practiceAttempts.length})
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            Total Lesson Views: {analysis.totalLessonsViewed}
          </span>
        </div>

        {practiceAttempts.length === 0 ? (
          <div className="p-6 text-sm text-slate-500 dark:text-slate-400 space-y-2">
            <p>No evaluated practice tasks saved yet.</p>
            <Link
              to="/practice"
              className="inline-block text-sm font-semibold text-indigo-700 dark:text-indigo-400 hover:underline"
            >
              Try a practice exercise →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {practiceAttempts.slice(0, 10).map((att) => (
              <div key={att.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {att.taskTitle}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {CURRICULUM_BY_SLUG[att.topicSlug]?.title || att.topicSlug} · {att.difficulty} ·{' '}
                    {formatTimestamp(att.createdAt)}
                  </p>
                </div>
                <StatusText
                  tone={
                    att.evaluationResult === 'correct'
                      ? 'success'
                      : att.evaluationResult === 'partially_correct'
                        ? 'warning'
                        : att.evaluationResult === 'incorrect'
                          ? 'error'
                          : 'info'
                  }
                  label={att.evaluationResult.replace('_', ' ')}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Curriculum Coverage Summary */}
      <Card className="p-6 space-y-3">
        <h2 className="font-display font-semibold text-base text-slate-900 dark:text-white">
          Nine-Topic Overview
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Showing real counts saved across all {CURRICULUM_TOPICS.length} curriculum modules.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {CURRICULUM_TOPICS.map((t) => {
            const p = topicProgress.find((rec) => rec.topicSlug === t.slug);
            return (
              <div
                key={t.slug}
                className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 text-xs space-y-1"
              >
                <p className="font-semibold text-slate-900 dark:text-white">
                  0{t.order}. {t.title}
                </p>
                <p className="text-slate-500 dark:text-slate-400 tabular-nums">
                  Views: {p?.lessonsViewed ?? 0} · Practice: {p?.practiceAttemptsCount ?? 0} · Best Quiz:{' '}
                  {p?.quizAttemptsCount ? `${p.bestScore}%` : '—'}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
