import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = user
    ? [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/learn', label: 'Curriculum' },
        { to: '/practice', label: 'Practice' },
        { to: '/quiz', label: 'Quiz' },
        { to: '/progress', label: 'Progress' },
      ]
    : [
        { to: '/learn', label: 'Curriculum' },
        { to: '/about', label: 'About' },
        { to: '/project-info', label: 'Project Info' },
        { to: '/auth', label: 'Sign In' },
      ];

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(`${path}/`));

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-indigo-600 focus:text-white focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>

      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Wordmark */}
          <Link
            to="/"
            className="font-display font-bold text-lg tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded"
          >
            SmartLearn AI <span className="font-normal text-slate-500 dark:text-slate-400">by bhanu</span>
          </Link>

          {/* Zone 2: 4-5 Single-line Nav Links */}
          <nav aria-label="Primary" className="hidden md:flex items-center gap-6">
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm font-medium whitespace-nowrap shrink-0 transition-colors pb-0.5 ${
                  isActive(item.to)
                    ? 'text-indigo-700 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Zone 3: 1 Primary Action + Mobile Menu Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to={user ? '/settings' : '/auth'}
              className="hidden md:inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
            >
              {user ? 'Settings' : 'Start Learning'}
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-2">
            <nav aria-label="Mobile" className="flex flex-col gap-1">
              {navLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive(item.to)
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {user && (
                <Link
                  to="/settings"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                  Settings
                </Link>
              )}
              <Link
                to="/about"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                About & Capstone Info
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main id="main-content" className="flex-1 w-full">
        {children}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <p className="font-display font-bold text-base text-slate-900 dark:text-white">
              SmartLearn AI <span className="font-normal text-slate-500 dark:text-slate-400">by bhanu</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
              Your personal AI tutor for learning web development. Independent educational capstone prototype submitted under the IIT Patna B3 Capstone Project.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
            <Link to="/learn" className="hover:text-slate-900 dark:hover:text-white whitespace-nowrap">
              Curriculum
            </Link>
            <Link to="/practice" className="hover:text-slate-900 dark:hover:text-white whitespace-nowrap">
              Practice
            </Link>
            <Link to="/quiz" className="hover:text-slate-900 dark:hover:text-white whitespace-nowrap">
              Quiz
            </Link>
            <Link to="/about" className="hover:text-slate-900 dark:hover:text-white whitespace-nowrap">
              About
            </Link>
            <Link to="/project-info" className="hover:text-slate-900 dark:hover:text-white whitespace-nowrap">
              Project Info
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white cursor-pointer whitespace-nowrap"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
