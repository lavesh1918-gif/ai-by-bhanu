import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Moon, Save, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { AlertBanner, Button, Card } from '../components/ui/Primitives';
import type { ExperienceLevel, PreferredLanguage } from '../../shared/types';

export function SettingsPage() {
  const { user, profile, saveProfilePreferences, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Beginner');
  const [preferredLanguage, setPreferredLanguage] = useState<PreferredLanguage>('English');
  const [learningGoal, setLearningGoal] = useState('');
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setExperienceLevel(profile.experienceLevel || 'Beginner');
      setPreferredLanguage(profile.preferredLanguage || 'English');
      setLearningGoal(profile.learningGoal || '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Display name cannot be empty.');
      return;
    }

    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      await saveProfilePreferences({
        displayName: displayName.trim(),
        experienceLevel,
        preferredLanguage,
        learningGoal: learningGoal.trim(),
        onboardingCompleted: true,
      });
      setSuccess('Your learner preferences have been updated in Cloud Firestore.');
    } catch {
      setError('Failed to update settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await logout();
      navigate('/auth', { replace: true });
    } catch {
      setError('Unable to sign out right now.');
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400">
          Account & Tutor Preferences
        </p>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
          Learner Settings
        </h1>
        {user?.email && (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Signed in as {user.email}
          </p>
        )}
      </div>

      {error && <AlertBanner tone="error" message={error} />}
      {success && <AlertBanner tone="success" message={success} />}

      <Card className="p-6 space-y-6">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="settings-name" className="block text-sm font-medium text-slate-900 dark:text-white">
              Display Name
            </label>
            <input
              id="settings-name"
              type="text"
              required
              maxLength={80}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="settings-level" className="block text-sm font-medium text-slate-900 dark:text-white">
              Experience Level
            </label>
            <select
              id="settings-level"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="Beginner">Beginner</option>
              <option value="Some Basics">Some Basics</option>
              <option value="Intermediate">Intermediate</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="settings-language" className="block text-sm font-medium text-slate-900 dark:text-white">
              Preferred Explanation Language
            </label>
            <select
              id="settings-language"
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value as PreferredLanguage)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Hinglish">Hinglish</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="settings-goal" className="block text-sm font-medium text-slate-900 dark:text-white">
              Learning Goal
            </label>
            <textarea
              id="settings-goal"
              rows={3}
              maxLength={300}
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              <Save className="h-4 w-4" aria-hidden="true" />
              <span>Save Preferences</span>
            </Button>
          </div>
        </form>
      </Card>

      {/* Appearance & Session */}
      <Card className="p-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-semibold text-base text-slate-900 dark:text-white">
              Appearance
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Light mode is the default study theme.
            </p>
          </div>
          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer ${
                theme === 'light'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Sun className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Moon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-semibold text-base text-slate-900 dark:text-white">
              Session
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign out of your Google session on this browser.
            </p>
          </div>
          <Button variant="secondary" loading={signingOut} onClick={() => void handleSignOut()}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span>Sign Out</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
