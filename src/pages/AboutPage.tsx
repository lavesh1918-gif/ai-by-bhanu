import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Primitives';

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400">
          About SmartLearn AI by bhanu
        </p>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white text-balance">
          A Patient, Multilingual AI Tutor for Web Fundamentals
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          SmartLearn AI by bhanu is built for complete beginners, school and college students, and self-learners taking their first steps in HTML, CSS, and JavaScript.
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-4">
        <h2 className="font-display font-semibold text-xl text-slate-900 dark:text-white">
          Learning Goal & Design Philosophy
        </h2>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Generic AI chatbots often overwhelm beginners with advanced frameworks or complete solutions before the student grasps the core concept. SmartLearn AI constrains tutoring strictly to a structured nine-topic curriculum, adapts explanations to English, simple Hindi, or Hinglish, and separates reading (Learn), conceptual hints (Practice), and server-scored assessments (Quiz).
        </p>
      </Card>

      <Card className="p-6 sm:p-8 space-y-4">
        <h2 className="font-display font-semibold text-xl text-slate-900 dark:text-white">
          Capstone Context & Disclaimer
        </h2>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          This application is an independent educational capstone prototype submitted under the <strong>IIT Patna B3 Capstone Project</strong> (AI Tutor category). It is created solely as a student capstone demonstration and is not officially endorsed, certified, or operated by IIT Patna.
        </p>
        <div className="pt-2 flex flex-wrap gap-4 text-sm font-medium">
          <Link to="/project-info" className="text-indigo-700 dark:text-indigo-400 hover:underline">
            View Full Capstone Documentation & Test Report →
          </Link>
          <Link to="/learn" className="text-slate-700 dark:text-slate-300 hover:underline">
            Explore the 9-Topic Curriculum →
          </Link>
        </div>
      </Card>
    </div>
  );
}
