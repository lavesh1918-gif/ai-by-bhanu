import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, Code2, Sparkles } from 'lucide-react';
import { CURRICULUM_BY_SLUG, CURRICULUM_TOPICS } from '../../shared/curriculum';
import type {
  LearningSession,
  QuizAttempt,
  RecommendationResult,
  TopicProgressRecord,
} from '../../shared/types';
import { useAuth } from '../context/AuthContext';
import { apiPost } from '../lib/api';
import { fetchLearnerDashboardData } from '../lib/firestoreService';
import { AlertBanner, Card, SkeletonBlock, StatusText } from '../components/ui/Primitives';

export function DashboardPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topicProgress, setTopicProgress] = useState<TopicProgressRecord[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLearnerDashboardData(user.uid);
      setTopicProgress(data.topicProgress);
      setQuizAttempts(data.quizAttempts);
      setSessions(data.learningSessions);

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
      setError('Unable to load your dashboard progress from Firestore. Please retry.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const metrics = useMemo(() => {
    const exploredCount = topicProgress.filter(
      (p) => p.lessonsViewed > 0 || p.practiceAttemptsCount > 0 || p.quizAttemptsCount > 0
    ).length;
    const lessonsViewedTotal = topicProgress.reduce((sum, p) => sum + (p.lessonsViewed || 0), 0);
    const quizCount = quizAttempts.length;
    const avgScore =
      quizCount > 0
        ? Math.round(quizAttempts.reduce((sum, q) => sum + q.scorePercent, 0) / quizCount)
        : null;

    return { exploredCount, lessonsViewedTotal, quizCount, avgScore };
  }, [topicProgress, quizAttempts]);

  const progressMap = useMemo(() => {
    return Object.fromEntries(topicProgress.map((p) => [p.topicSlug, p]));
  }, [topicProgress]);

  const mostRecentSession = sessions[0] || null;
  const recentTopic = mostRecentSession ? CURRICULUM_BY_SLUG[mostRecentSession.topicSlug] : null;
  const isNewLearner =
    metrics.exploredCount === 0 && metrics.quizCount === 0 && sessions.length === 0;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <SkeletonBlock className="h-10 w-72" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
        </div>
        <SkeletonBlock className="h-44" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {profile?.experienceLevel || 'Beginner'} · {profile?.preferredLanguage || 'English'}
          </p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Welcome back, {profile?.displayName || 'Learner'}
          </h1>
          {profile?.learningGoal && (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Goal: {profile.learningGoal}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/learn"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>Learn</span>
          </Link>
          <Link
            to="/practice"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Code2 className="h-4 w-4" aria-hidden="true" />
            <span>Practice</span>
          </Link>
          <Link
            to="/quiz"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            <span>Quiz</span>
          </Link>
        </div>
      </div>

      {error && <AlertBanner tone="error" message={error} onRetry={() => void loadDashboard()} />}

      {/* 4 Summary Cards — Strictly Real Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Topics Explored
          </p>
          <p className="font-display font-bold text-2xl text-slate-900 dark:text-white tabular-nums">
            {metrics.exploredCount} / {CURRICULUM_TOPICS.length}
          </p>
        </Card>

        <Card className="p-5 space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Lesson Views
          </p>
          <p className="font-display font-bold text-2xl text-slate-900 dark:text-white tabular-nums">
            {metrics.lessonsViewedTotal}
          </p>
        </Card>

        <Card className="p-5 space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Quiz Attempts
          </p>
          <p className="font-display font-bold text-2xl text-slate-900 dark:text-white tabular-nums">
            {metrics.quizCount}
          </p>
        </Card>

        <Card className="p-5 space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Average Quiz Score
          </p>
          <p className="font-display font-bold text-2xl text-slate-900 dark:text-white tabular-nums">
            {metrics.avgScore !== null ? `${metrics.avgScore}%` : 'No quizzes yet'}
          </p>
        </Card>
      </div>

      {/* First-Time Empty State OR Continue + Recommendation */}
      {isNewLearner ? (
        <Card className="p-6 sm:p-8 space-y-4">
          <h2 className="font-display font-semibold text-xl text-slate-900 dark:text-white">
            Start Your First Web Development Lesson
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            You do not have any saved learning sessions yet. Begin with Topic 1 to see how browsers, HTML, CSS, and JavaScript fit together, then try a guided Practice task.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              to="/learn/introduction-to-web-development"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              <span>Open Topic 01: Introduction to Web Development</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Continue Learning */}
          <Card className="p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Continue Learning
              </p>
              {recentTopic && mostRecentSession ? (
                <>
                  <h2 className="font-display font-semibold text-xl text-slate-900 dark:text-white">
                    {recentTopic.title}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Your most recent activity was in <span className="font-medium capitalize">{mostRecentSession.mode}</span> mode.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="font-display font-semibold text-xl text-slate-900 dark:text-white">
                    Explore the Curriculum
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Pick up any of the nine foundational topics.
                  </p>
                </>
              )}
            </div>

            <div>
              <Link
                to={
                  mostRecentSession?.mode === 'practice'
                    ? `/practice?topic=${mostRecentSession.topicSlug}`
                    : mostRecentSession?.mode === 'quiz'
                      ? `/quiz?topic=${mostRecentSession.topicSlug}`
                      : recentTopic
                        ? `/learn/${recentTopic.slug}`
                        : '/learn'
                }
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-400 hover:underline"
              >
                <span>Resume session</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </Card>

          {/* Recommended Next Topic */}
          <Card className="p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-sky-700 dark:text-sky-400">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Recommended Next Step</span>
              </div>
              {recommendation ? (
                <>
                  <h2 className="font-display font-semibold text-xl text-slate-900 dark:text-white">
                    {recommendation.recommendedTopicTitle}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {recommendation.reason}
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Continue through the 9-topic path or take a short quiz to unlock targeted recommendations.
                </p>
              )}
            </div>

            {recommendation && (
              <div>
                <Link
                  to={
                    recommendation.recommendedMode === 'practice'
                      ? `/practice?topic=${recommendation.recommendedTopicSlug}`
                      : recommendation.recommendedMode === 'quiz'
                        ? `/quiz?topic=${recommendation.recommendedTopicSlug}`
                        : `/learn/${recommendation.recommendedTopicSlug}`
                  }
                  className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-400 hover:underline"
                >
                  <span className="capitalize">Start {recommendation.recommendedMode}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Topic Progress List */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-display font-semibold text-base text-slate-900 dark:text-white">
            Curriculum Progress
          </h2>
          <Link
            to="/progress"
            className="text-xs font-medium text-indigo-700 dark:text-indigo-400 hover:underline"
          >
            Detailed report →
          </Link>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {CURRICULUM_TOPICS.map((topic) => {
            const prog = progressMap[topic.slug];
            const status = prog?.status || 'not_started';
            return (
              <div
                key={topic.slug}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    <span>0{topic.order}</span>
                    <span aria-hidden="true">·</span>
                    <span>{topic.category}</span>
                  </div>
                  <Link
                    to={`/learn/${topic.slug}`}
                    className="font-medium text-sm text-slate-900 dark:text-white hover:text-indigo-700 dark:hover:text-indigo-400"
                  >
                    {topic.title}
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs tabular-nums">
                  <span className="text-slate-500 dark:text-slate-400">
                    Views: {prog?.lessonsViewed ?? 0}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    Practice: {prog?.practiceAttemptsCount ?? 0}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    Best Quiz: {prog?.quizAttemptsCount ? `${prog.bestScore}%` : '—'}
                  </span>
                  <StatusText
                    tone={
                      status === 'completed'
                        ? 'success'
                        : status === 'in_progress'
                          ? 'info'
                          : 'neutral'
                    }
                    label={
                      status === 'completed'
                        ? 'Completed'
                        : status === 'in_progress'
                          ? 'In Progress'
                          : 'Not Started'
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
