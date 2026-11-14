import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { CURRICULUM_TOPICS } from '../../shared/curriculum';
import type { TopicProgressRecord } from '../../shared/types';
import { useAuth } from '../context/AuthContext';
import { fetchLearnerDashboardData } from '../lib/firestoreService';
import { Card, StatusText } from '../components/ui/Primitives';

const CATEGORIES = ['All', 'Web Basics', 'HTML', 'CSS', 'JavaScript'] as const;

export function LearnCatalogPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All');
  const [progressMap, setProgressMap] = useState<Record<string, TopicProgressRecord>>({});

  useEffect(() => {
    if (!user) {
      setProgressMap({});
      return;
    }
    let active = true;
    fetchLearnerDashboardData(user.uid)
      .then((data) => {
        if (!active) return;
        setProgressMap(Object.fromEntries(data.topicProgress.map((p) => [p.topicSlug, p])));
      })
      .catch(() => {
        // Non-blocking on public curriculum browse
      });
    return () => {
      active = false;
    };
  }, [user]);

  const filteredTopics = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CURRICULUM_TOPICS.filter((t) => {
      const matchesCategory = category === 'All' || t.category === category;
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.shortDescription.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="space-y-2 max-w-2xl">
        <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400">
          Nine-Topic Curriculum
        </p>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
          HTML, CSS & JavaScript Fundamentals
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
          Explore every topic freely in sequence or jump straight to the concept you want to learn.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div
          role="group"
          aria-label="Filter topics by category"
          className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                category === cat
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <label htmlFor="curriculum-search" className="sr-only">
            Search curriculum topics
          </label>
          <input
            id="curriculum-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>
      </div>

      {filteredTopics.length === 0 ? (
        <Card className="p-8 text-center space-y-3">
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            No matching topics found.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setCategory('All');
            }}
            className="text-sm font-medium text-indigo-700 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Reset filters
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTopics.map((topic) => {
            const prog = progressMap[topic.slug];
            const status = prog?.status || 'not_started';

            return (
              <Card key={topic.slug} className="p-6 flex flex-col justify-between gap-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    <span>
                      0{topic.order} · {topic.category} · {topic.difficulty}
                    </span>
                    {user && (
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
                    )}
                  </div>

                  <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white">
                    {topic.title}
                  </h2>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {topic.shortDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <Link
                    to={`/learn/${topic.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 dark:text-indigo-400 hover:underline"
                  >
                    <span>Open Lesson</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>

                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <Link
                      to={`/practice?topic=${topic.slug}`}
                      className="hover:text-slate-900 dark:hover:text-white"
                    >
                      Practice
                    </Link>
                    <span aria-hidden="true">·</span>
                    <Link
                      to={`/quiz?topic=${topic.slug}`}
                      className="hover:text-slate-900 dark:hover:text-white"
                    >
                      Quiz
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
