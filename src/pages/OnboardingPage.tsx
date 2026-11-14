import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertBanner, Button, Card } from '../components/ui/Primitives';
import type { ExperienceLevel, PreferredLanguage } from '../../shared/types';

export function OnboardingPage() {
  const { user, profile, saveProfilePreferences } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Beginner');
  const [preferredLanguage, setPreferredLanguage] = useState<PreferredLanguage>('English');
  const [learningGoal, setLearningGoal] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || user?.displayName || '');
      setExperienceLevel(profile.experienceLevel || 'Beginner');
      setPreferredLanguage(profile.preferredLanguage || 'English');
      setLearningGoal(profile.learningGoal || '');
    } else if (user) {
      setDisplayName(user.displayName || user.email?.split('@')[0] || '');
    }
  }, [profile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setError('Please enter a display name.');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await saveProfilePreferences({
        displayName: trimmedName,
        experienceLevel,
        preferredLanguage,
        learningGoal: learningGoal.trim(),
        onboardingCompleted: true,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? 'Could not save your preferences to Firestore. Please retry.'
          : 'Unexpected error saving onboarding.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400">
          Learner Setup
        </p>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
          Personalize Your AI Tutor
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Tell SmartLearn AI how you prefer explanations. You can update these settings anytime.
        </p>
      </div>

      {error && <AlertBanner tone="error" message={error} />}

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="onboarding-name"
              className="block text-sm font-medium text-slate-900 dark:text-white"
            >
              Display Name
            </label>
            <input
              id="onboarding-name"
              type="text"
              required
              maxLength={80}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="onboarding-level"
              className="block text-sm font-medium text-slate-900 dark:text-white"
            >
              Experience Level
            </label>
            <select
              id="onboarding-level"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="Beginner">Beginner — completely new to HTML, CSS & JS</option>
              <option value="Some Basics">Some Basics — know a few tags or CSS rules</option>
              <option value="Intermediate">Intermediate — comfortable with basics, refining skills</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="onboarding-language"
              className="block text-sm font-medium text-slate-900 dark:text-white"
            >
              Preferred Explanation Language
            </label>
            <select
              id="onboarding-language"
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value as PreferredLanguage)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi (सरल हिंदी)</option>
              <option value="Hinglish">Hinglish (Conversational Hindi + English terms)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="onboarding-goal"
              className="block text-sm font-medium text-slate-900 dark:text-white"
            >
              Learning Goal
            </label>
            <textarea
              id="onboarding-goal"
              rows={3}
              maxLength={300}
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              placeholder="e.g. Build my first personal portfolio page and understand JavaScript DOM events."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {learningGoal.length}/300 characters
            </p>
          </div>

          <Button type="submit" size="lg" loading={saving} className="w-full">
            Save & Open Dashboard
          </Button>
        </form>
      </Card>
    </div>
  );
}
