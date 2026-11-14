import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiPost, ApiClientError } from '../lib/api';
import { AlertBanner, Button, Card } from './ui/Primitives';
import type { ExperienceLevel, PreferredLanguage } from '../../shared/types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export function TutorChatPanel({
  topicSlug,
  topicTitle,
  lessonContext,
}: {
  topicSlug: string;
  topicTitle: string;
  lessonContext?: string;
}) {
  const { user, profile } = useAuth();
  const [language, setLanguage] = useState<PreferredLanguage>(
    profile?.preferredLanguage || 'English'
  );
  const [level, setLevel] = useState<ExperienceLevel>(profile?.experienceLevel || 'Beginner');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const starterPrompts = [
    `Explain ${topicTitle} with a real-life analogy.`,
    `Walk me through the first example line by line.`,
    `Give me a quick check-for-understanding question.`,
  ];

  const sendMessage = async (textToSend?: string) => {
    const trimmed = (textToSend ?? input).trim();
    if (!trimmed || sending) return;

    if (!user) {
      setError('Please sign in with Google to chat with SmartLearn AI Tutor.');
      return;
    }

    setError(null);
    setSending(true);
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    if (!textToSend) setInput('');

    try {
      const data = await apiPost<{ reply: string }>('/api/tutor/chat', {
        topicSlug,
        mode: 'learn',
        experienceLevel: level,
        preferredLanguage: language,
        message: trimmed,
        history: messages.map((m) => ({ role: m.role, text: m.text })),
        lessonContext,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          text: data.reply,
        },
      ]);
    } catch (err) {
      // Preserve learner input on failure so they never lose their question
      if (!textToSend) setInput(trimmed);
      setMessages(messages);
      const msg =
        err instanceof ApiClientError
          ? err.message
          : 'Could not reach the AI Tutor. Please try again.';
      setError(msg);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage();
  };

  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="font-display font-semibold text-base text-slate-900 dark:text-white">
              Ask AI Tutor
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Focused on {topicTitle}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="tutor-lang-select">
            Explanation language
          </label>
          <select
            id="tutor-lang-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value as PreferredLanguage)}
            className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-slate-700 dark:text-slate-200"
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Hinglish">Hinglish</option>
          </select>

          <label className="sr-only" htmlFor="tutor-level-select">
            Experience level
          </label>
          <select
            id="tutor-level-select"
            value={level}
            onChange={(e) => setLevel(e.target.value as ExperienceLevel)}
            className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-slate-700 dark:text-slate-200"
          >
            <option value="Beginner">Beginner</option>
            <option value="Some Basics">Some Basics</option>
            <option value="Intermediate">Intermediate</option>
          </select>
        </div>
      </div>

      {!user ? (
        <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Sign in with Google to ask follow-up questions and get personalized explanations in English, Hindi, or Hinglish.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Sign In to Ask Tutor
          </Link>
        </div>
      ) : (
        <>
          {messages.length === 0 && (
            <div className="space-y-2.5">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Try a quick question to get started:
              </p>
              <div className="flex flex-col gap-2">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    disabled={sending}
                    onClick={() => void sendMessage(prompt)}
                    className="text-left text-xs px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.length > 0 && (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-xl p-3.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white ml-6'
                      : 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 mr-4'
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide opacity-75 mb-1">
                    {msg.role === 'user' ? 'You' : 'SmartLearn AI'}
                  </p>
                  <div>{msg.text}</div>
                </div>
              ))}
              {sending && (
                <div className="rounded-xl p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 mr-4">
                  Thinking step by step...
                </div>
              )}
            </div>
          )}

          {error && <AlertBanner tone="error" message={error} />}

          <form onSubmit={handleSubmit} className="space-y-2">
            <label htmlFor="tutor-question-input" className="sr-only">
              Ask a question about {topicTitle}
            </label>
            <textarea
              id="tutor-question-input"
              rows={3}
              maxLength={1500}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask anything about ${topicTitle}...`}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400 tabular-nums">{input.length}/1500</span>
              <Button type="submit" size="sm" loading={sending} disabled={!input.trim()}>
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Ask Tutor</span>
              </Button>
            </div>
          </form>
        </>
      )}
    </Card>
  );
}
