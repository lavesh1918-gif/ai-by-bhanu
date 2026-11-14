import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HelpCircle, Lightbulb, RefreshCw, Send } from 'lucide-react';
import { CURRICULUM_TOPICS, isValidCurriculumSlug } from '../../shared/curriculum';
import type {
  DifficultyLevel,
  PracticeEvaluationResponse,
  PracticeTaskResponse,
} from '../../shared/types';
import { useAuth } from '../context/AuthContext';
import { apiPost, ApiClientError } from '../lib/api';
import { recordLearningSession, savePracticeAttemptRecord } from '../lib/firestoreService';
import { AlertBanner, Button, Card, CodeBlock, StatusText } from '../components/ui/Primitives';

export function PracticePage() {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTopicParam = searchParams.get('topic') || '';

  const [topicSlug, setTopicSlug] = useState(
    isValidCurriculumSlug(initialTopicParam)
      ? initialTopicParam
      : CURRICULUM_TOPICS[0].slug
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');
  const [task, setTask] = useState<PracticeTaskResponse | null>(null);
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [evaluation, setEvaluation] = useState<PracticeEvaluationResponse | null>(null);
  const [generating, setGenerating] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isValidCurriculumSlug(initialTopicParam)) {
      setTopicSlug(initialTopicParam);
    }
  }, [initialTopicParam]);

  const handleGenerateTask = async () => {
    setError(null);
    setSaveNotice(null);
    setEvaluation(null);
    setShowHint(false);
    setGenerating(true);

    try {
      const generated = await apiPost<PracticeTaskResponse>('/api/practice/generate', {
        topicSlug,
        difficulty,
        experienceLevel: profile?.experienceLevel || 'Beginner',
        preferredLanguage: profile?.preferredLanguage || 'English',
      });
      setTask(generated);
      setAnswer(generated.starterCode || '');

      if (user) {
        void recordLearningSession({
          uid: user.uid,
          topicSlug,
          mode: 'practice',
        }).catch(() => {});
      }
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : 'Could not generate a practice task. Please try again.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleEvaluate = async (revealSolution = false) => {
    if (!task || !user) return;
    const trimmed = answer.trim();
    if (!trimmed && !revealSolution) {
      setError('Please enter your code or written explanation before submitting.');
      return;
    }

    setError(null);
    setSaveNotice(null);
    setEvaluating(true);

    const submittedAnswer = trimmed || 'Please show me the step-by-step explanation.';

    try {
      const evalResult = await apiPost<PracticeEvaluationResponse>('/api/practice/evaluate', {
        topicSlug: task.topicSlug,
        difficulty: task.difficulty,
        taskTitle: task.title,
        taskInstructions: task.instructions,
        learnerAnswer: submittedAnswer,
        experienceLevel: profile?.experienceLevel || 'Beginner',
        preferredLanguage: profile?.preferredLanguage || 'English',
        revealSolution,
      });

      setEvaluation(evalResult);

      try {
        await savePracticeAttemptRecord({
          uid: user.uid,
          topicSlug: task.topicSlug,
          difficulty: task.difficulty,
          taskTitle: task.title,
          taskInstructions: task.instructions,
          learnerAnswer: submittedAnswer,
          evaluationResult: evalResult.result,
          feedback: evalResult.feedback,
          hint: evalResult.hint,
        });
        setSaveNotice('Practice attempt saved to your Firestore progress log.');
      } catch {
        setSaveNotice('Feedback received, though saving to Firestore failed.');
      }
    } catch (err) {
      // Preserve learner answer on failure
      setError(
        err instanceof ApiClientError
          ? err.message
          : 'Could not evaluate your submission right now. Your answer is preserved—please retry.'
      );
    } finally {
      setEvaluating(false);
    }
  };

  const resultLabelMap = {
    correct: { tone: 'success' as const, label: 'Correct' },
    partially_correct: { tone: 'warning' as const, label: 'Partially Correct' },
    incorrect: { tone: 'error' as const, label: 'Incorrect' },
    needs_clarification: { tone: 'info' as const, label: 'Needs Clarification' },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400">
          Conceptual Practice Mode
        </p>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
          Practice with Guided AI Feedback
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Generate one targeted challenge at a time. Submit code or a written explanation for conceptual review and hints. Note: code is reviewed conceptually by the AI tutor and is not executed in a sandboxed runtime.
        </p>
      </div>

      {/* Controls */}
      <Card className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5 sm:col-span-1">
            <label htmlFor="practice-topic" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Topic
            </label>
            <select
              id="practice-topic"
              value={topicSlug}
              onChange={(e) => setTopicSlug(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-white"
            >
              {CURRICULUM_TOPICS.map((t) => (
                <option key={t.slug} value={t.slug}>
                  0{t.order}. {t.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="practice-difficulty" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Difficulty
            </label>
            <select
              id="practice-difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-white"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <Button
            loading={generating}
            onClick={() => void handleGenerateTask()}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span>{task ? 'New Practice Task' : 'Generate Practice Task'}</span>
          </Button>
        </div>
      </Card>

      {error && <AlertBanner tone="error" message={error} />}

      {!task && !generating && (
        <Card className="p-8 text-center space-y-2">
          <p className="font-medium text-slate-900 dark:text-white">
            Ready to practice?
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
            Select a topic and difficulty above, then click <strong>Generate Practice Task</strong> to receive a custom exercise without spoilers.
          </p>
        </Card>
      )}

      {task && (
        <div className="space-y-6">
          {/* Task Prompt Card */}
          <Card className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">
                {task.difficulty} · Conceptual Exercise
              </span>
              <button
                type="button"
                onClick={() => setShowHint((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
              </button>
            </div>

            <h2 className="font-display font-semibold text-xl text-slate-900 dark:text-white">
              {task.title}
            </h2>

            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {task.instructions}
            </p>

            <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Expected learning outcome:{' '}
              </span>
              {task.expectedOutcome}
            </div>

            {showHint && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3.5 text-sm text-amber-900 dark:text-amber-100">
                <span className="font-semibold">Hint: </span>
                {task.hint}
              </div>
            )}
          </Card>

          {/* Answer Editor */}
          <Card className="p-6 space-y-4">
            <label
              htmlFor="practice-answer"
              className="block text-sm font-medium text-slate-900 dark:text-white"
            >
              Your Code or Written Explanation
            </label>
            <textarea
              id="practice-answer"
              rows={8}
              maxLength={8000}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Write your HTML, CSS, JavaScript, or explanation here..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-950 text-slate-100 font-mono text-sm p-4 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {answer.length}/8000 characters
              </span>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="secondary"
                  disabled={evaluating}
                  onClick={() => {
                    setEvaluation(null);
                    setAnswer(task.starterCode || '');
                  }}
                >
                  Try Again
                </Button>
                <Button
                  variant="secondary"
                  loading={evaluating}
                  onClick={() => void handleEvaluate(true)}
                >
                  <HelpCircle className="h-4 w-4" aria-hidden="true" />
                  <span>Show Explanation</span>
                </Button>
                <Button
                  loading={evaluating}
                  disabled={!answer.trim()}
                  onClick={() => void handleEvaluate(false)}
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span>Check Answer</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Evaluation Result */}
          {evaluation && (
            <Card className="p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white">
                  Conceptual Review Feedback
                </h3>
                <StatusText
                  tone={resultLabelMap[evaluation.result].tone}
                  label={resultLabelMap[evaluation.result].label}
                />
              </div>

              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {evaluation.feedback}
              </p>

              {evaluation.hint && (
                <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white">Hint: </span>
                  {evaluation.hint}
                </div>
              )}

              {evaluation.suggestedAnswer && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Corrected / Reference Example
                  </p>
                  <CodeBlock language="html" code={evaluation.suggestedAnswer} />
                </div>
              )}

              <p className="text-sm text-indigo-700 dark:text-indigo-400 font-medium">
                Next step: {evaluation.nextStep}
              </p>

              {saveNotice && (
                <p className="text-xs text-slate-500 dark:text-slate-400">{saveNotice}</p>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
