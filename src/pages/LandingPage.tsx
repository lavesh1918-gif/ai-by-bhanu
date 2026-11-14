import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, ChevronDown, Code2, HelpCircle, Layers } from 'lucide-react';
import { CURRICULUM_TOPICS } from '../../shared/curriculum';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Primitives';
import heroIllustration from '../assets/images/hero_web_architecture_1794622074706.jpg';

const FAQS = [
  {
    q: 'Do I need any prior coding experience?',
    a: 'No. SmartLearn AI by bhanu starts from Topic 1 (how websites and browsers work) and lets you choose Beginner, Some Basics, or Intermediate depth at any time.',
  },
  {
    q: 'Which explanation languages are supported?',
    a: 'You can switch between English, simple Hindi (Devanagari), and Hinglish (Hindi in Roman script mixed with standard HTML, CSS, and JavaScript syntax).',
  },
  {
    q: 'How does Practice mode check my answers?',
    a: 'Practice mode uses Gemini on the server to perform conceptual code and explanation review—returning hints, status feedback (correct, partially correct, incorrect, or needs clarification), and next steps without executing untrusted code.',
  },
  {
    q: 'How are Quiz scores calculated and saved?',
    a: 'Quiz answer keys stay strictly on the server until you submit. When you finish a 5- or 10-question quiz, the server scores your selections and saves the attempt to your private Cloud Firestore progress log.',
  },
];

export function LandingPage() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="space-y-20 pb-8">
      {/* Hero Section */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400 tracking-wide">
                SmartLearn AI by bhanu · HTML, CSS & JavaScript Tutor
              </p>
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-slate-900 dark:text-white leading-[1.15] text-balance">
                Learn Web Development, One Concept at a Time.
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Your personal AI tutor for learning web development. Study structured HTML, CSS, and JavaScript lessons, practice with guided conceptual hints, and test yourself with server-scored quizzes in English, Hindi, or Hinglish.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to={user ? '/dashboard' : '/auth'}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
                >
                  <span>Start Learning</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/learn"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
                >
                  Explore Curriculum
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 flex">
              <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center min-h-[260px]">
                {!imgError ? (
                  <img
                    src={heroIllustration}
                    alt="Architectural diagram illustrating HTML layers, CSS grid layout, and JavaScript DOM node connections"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="p-8 text-center space-y-3">
                    <Layers className="h-10 w-10 text-indigo-600 mx-auto" aria-hidden="true" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      HTML Structure · CSS Layout · JavaScript Interactivity
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Learning Modes */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="max-w-2xl space-y-2">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white text-balance">
            Three Focused Ways to Master the Fundamentals
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Every topic follows a clear rhythm from guided reading to active recall.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3">
            <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white">
              01. Learn
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Read concise beginner explanations with modern examples, line-by-line breakdowns, common mistakes, and an inline Ask AI Tutor panel.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <Code2 className="h-6 w-6 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white">
              02. Practice
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Work through one targeted task at a time. Submit code or an explanation to receive specific conceptual feedback and hints before seeing the answer.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <CheckCircle2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white">
              03. Quiz
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Take 5- or 10-question multiple-choice checks scored securely on the server, then review explanations and track real topic mastery.
            </p>
          </Card>
        </div>
      </section>

      {/* 9-Topic Curriculum Path */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white text-balance">
              The Nine-Topic Curriculum Path
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              All nine foundational topics are open to explore in sequence or whenever you need a refresher.
            </p>
          </div>
          <Link
            to="/learn"
            className="text-sm font-semibold text-indigo-700 dark:text-indigo-400 hover:underline whitespace-nowrap shrink-0"
          >
            View all topics →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CURRICULUM_TOPICS.map((topic) => (
            <Link
              key={topic.slug}
              to={`/learn/${topic.slug}`}
              className="group block rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
            >
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2 tabular-nums">
                <span>Topic 0{topic.order}</span>
                <span aria-hidden="true">·</span>
                <span>{topic.category}</span>
                <span aria-hidden="true">·</span>
                <span>{topic.difficulty}</span>
              </div>
              <h3 className="font-display font-semibold text-base text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                {topic.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                {topic.shortDescription}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Personalized Feedback & Transparent Progress */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <Card className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
              Personalized Feedback Backed by Real Records
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Every lesson view, practice evaluation, and quiz score is saved to your personal Firestore learning log. Your dashboard and progress recommendations are calculated strictly from your own recorded attempts—never invented numbers.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-slate-700 dark:text-slate-200 pt-1">
              <span>English, Hindi & Hinglish explanations</span>
              <span aria-hidden="true" className="text-slate-400">·</span>
              <span>Private per-learner data</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              How Recommendations Work
            </p>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              When a quiz score drops below 70%, SmartLearn AI explains why a topic is recommended for Practice before suggesting the next curriculum step.
            </p>
            <div className="pt-2">
              <Link
                to="/project-info"
                className="text-sm font-medium text-indigo-700 dark:text-indigo-400 hover:underline"
              >
                Read the IIT Patna B3 Capstone architecture →
              </Link>
            </div>
          </div>
        </Card>
      </section>

      {/* Concise FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-center gap-2.5">
          <HelpCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
          <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
          {FAQS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left font-medium text-sm sm:text-base text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-500 shrink-0 transition-transform duration-150 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
