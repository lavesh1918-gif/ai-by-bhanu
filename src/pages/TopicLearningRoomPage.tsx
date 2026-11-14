import React, { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Code2 } from 'lucide-react';
import { CURRICULUM_BY_SLUG, CURRICULUM_TOPICS } from '../../shared/curriculum';
import { useAuth } from '../context/AuthContext';
import { markLessonViewed, recordLearningSession } from '../lib/firestoreService';
import { Card, CodeBlock } from '../components/ui/Primitives';
import { TutorChatPanel } from '../components/TutorChatPanel';

export function TopicLearningRoomPage() {
  const { topicSlug } = useParams<{ topicSlug: string }>();
  const { user, profile } = useAuth();
  const recordedSlugRef = useRef<string | null>(null);

  const topic = topicSlug ? CURRICULUM_BY_SLUG[topicSlug] : undefined;

  useEffect(() => {
    if (!topic || !user || !profile?.onboardingCompleted) return;
    if (recordedSlugRef.current === topic.slug) return;
    recordedSlugRef.current = topic.slug;

    void markLessonViewed(user.uid, topic.slug).catch(() => {
      // Non-blocking progress tracking
    });
    void recordLearningSession({
      uid: user.uid,
      topicSlug: topic.slug,
      mode: 'learn',
    }).catch(() => {
      // Non-blocking session tracking
    });
  }, [topic, user, profile?.onboardingCompleted]);

  if (!topic) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-4">
        <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
          Topic Not Found
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          The requested curriculum topic does not exist. Choose one of the nine topics from the curriculum catalog.
        </p>
        <Link
          to="/learn"
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-400 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Curriculum</span>
        </Link>
      </div>
    );
  }

  const prevTopic = CURRICULUM_TOPICS.find((t) => t.order === topic.order - 1);
  const nextTopic = CURRICULUM_TOPICS.find((t) => t.order === topic.order + 1);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Breadcrumb & Mode Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1.5">
          <Link
            to="/learn"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>All 9 Topics</span>
          </Link>
          <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400 tabular-nums">
            Topic 0{topic.order} of 09 · {topic.category} · {topic.difficulty} · ~{topic.estimatedMinutes} min
          </p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            {topic.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to={`/practice?topic=${topic.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Code2 className="h-4 w-4" aria-hidden="true" />
            <span>Practice</span>
          </Link>
          <Link
            to={`/quiz?topic=${topic.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            <span>Take Quiz</span>
          </Link>
        </div>
      </div>

      {/* Main Split: Lesson Content (7 cols) + AI Tutor Panel (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-8">
          {/* Learning Objectives */}
          <Card className="p-6 space-y-3">
            <h2 className="font-display font-semibold text-base text-slate-900 dark:text-white">
              Learning Objectives
            </h2>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              {topic.objectives.map((obj) => (
                <li key={obj} className="flex items-start gap-2.5">
                  <CheckCircle2
                    className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Beginner Lesson Sections */}
          <div className="space-y-6">
            {topic.lessonSections.map((section) => (
              <section key={section.heading} className="space-y-2.5">
                <h2 className="font-display font-semibold text-xl text-slate-900 dark:text-white">
                  {section.heading}
                </h2>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                  {section.body}
                </p>
                {section.analogy && (
                  <div className="rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 p-4 text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                    <span className="font-semibold text-indigo-800 dark:text-indigo-300">
                      Analogy:{' '}
                    </span>
                    {section.analogy}
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Practical Examples with Line-by-Line Walkthrough */}
          <div className="space-y-6">
            <h2 className="font-display font-semibold text-xl text-slate-900 dark:text-white">
              Practical Examples
            </h2>

            {topic.examples.map((ex) => (
              <div key={ex.title} className="space-y-3">
                <CodeBlock
                  title={ex.title}
                  language={ex.language}
                  code={ex.code}
                  previewHtml={ex.previewHtml}
                />
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Line-by-Line Breakdown
                  </p>
                  <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
                    {ex.lineByLine.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Common Mistakes */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <h2 className="font-display font-semibold text-base text-slate-900 dark:text-white">
                Common Beginner Mistakes
              </h2>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {topic.commonMistakes.map((item) => (
                <div key={item.mistake} className="py-3 first:pt-0 last:pb-0 space-y-1 text-sm">
                  <p className="font-semibold text-slate-900 dark:text-white">{item.mistake}</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Why it happens: {item.whyItHappens}
                  </p>
                  <p className="text-emerald-700 dark:text-emerald-400">
                    Fix: {item.fix}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Recap & Suggested Next */}
          <Card className="p-6 space-y-4">
            <h2 className="font-display font-semibold text-base text-slate-900 dark:text-white">
              Quick Recap
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {topic.recap}
            </p>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Suggested Practice Idea
              </p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {topic.suggestedPracticeTask.title}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {topic.suggestedPracticeTask.prompt}
              </p>
              <div className="pt-1 flex flex-wrap gap-3">
                <Link
                  to={`/practice?topic=${topic.slug}`}
                  className="text-sm font-semibold text-indigo-700 dark:text-indigo-400 hover:underline"
                >
                  Open Practice Mode →
                </Link>
                <Link
                  to={`/quiz?topic=${topic.slug}`}
                  className="text-sm font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                >
                  Start {topic.title} Quiz →
                </Link>
              </div>
            </div>
          </Card>

          {/* Topic Navigation */}
          <div className="flex items-center justify-between gap-4 pt-2">
            {prevTopic ? (
              <Link
                to={`/learn/${prevTopic.slug}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-400"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>0{prevTopic.order}. {prevTopic.title}</span>
              </Link>
            ) : (
              <span />
            )}

            {nextTopic && (
              <Link
                to={`/learn/${nextTopic.slug}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-indigo-700 dark:text-indigo-400 hover:underline ml-auto"
              >
                <span>0{nextTopic.order}. {nextTopic.title}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>

        {/* Sticky Topic AI Tutor Panel */}
        <aside className="lg:col-span-5 lg:sticky lg:top-24">
          <TutorChatPanel
            topicSlug={topic.slug}
            topicTitle={topic.title}
            lessonContext={topic.objectives.join(' ')}
          />
        </aside>
      </div>
    </div>
  );
}
