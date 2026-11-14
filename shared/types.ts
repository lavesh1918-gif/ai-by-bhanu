export type ExperienceLevel = 'Beginner' | 'Some Basics' | 'Intermediate';
export type PreferredLanguage = 'English' | 'Hindi' | 'Hinglish';
export type LearningMode = 'learn' | 'practice' | 'quiz';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type EvaluationResult = 'correct' | 'partially_correct' | 'incorrect' | 'needs_clarification';
export type TopicStatus = 'not_started' | 'in_progress' | 'completed';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  experienceLevel: ExperienceLevel;
  preferredLanguage: PreferredLanguage;
  learningGoal: string;
  onboardingCompleted: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface LearningSession {
  id: string;
  uid: string;
  topicSlug: string;
  mode: LearningMode;
  startedAt?: unknown;
  lastActivityAt?: unknown;
}

export interface PracticeAttempt {
  id: string;
  uid: string;
  topicSlug: string;
  difficulty: DifficultyLevel;
  taskTitle: string;
  taskInstructions: string;
  learnerAnswer: string;
  evaluationResult: EvaluationResult;
  feedback: string;
  hint: string;
  createdAt?: unknown;
}

export interface QuizAttempt {
  id: string;
  uid: string;
  quizId: string;
  topicSlug: string;
  difficulty: DifficultyLevel;
  questionCount: 5 | 10;
  correctCount: number;
  scorePercent: number;
  createdAt?: unknown;
}

export interface TopicProgressRecord {
  uid: string;
  topicSlug: string;
  lessonsViewed: number;
  practiceAttemptsCount: number;
  quizAttemptsCount: number;
  bestScore: number;
  status: TopicStatus;
  updatedAt?: unknown;
}

export interface PracticeTaskResponse {
  title: string;
  instructions: string;
  starterCode: string;
  hint: string;
  expectedOutcome: string;
  topicSlug: string;
  difficulty: DifficultyLevel;
}

export interface PracticeEvaluationResponse {
  result: EvaluationResult;
  feedback: string;
  hint: string;
  suggestedAnswer: string;
  nextStep: string;
}

export interface PublicQuizQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
}

export interface GeneratedQuizResponse {
  quizId: string;
  topicSlug: string;
  difficulty: DifficultyLevel;
  questionCount: 5 | 10;
  expiresAt: number;
  questions: PublicQuizQuestion[];
}

export interface QuizQuestionReview {
  id: string;
  question: string;
  options: [string, string, string, string];
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizSubmitResponse {
  quizId: string;
  topicSlug: string;
  difficulty: DifficultyLevel;
  questionCount: 5 | 10;
  correctCount: number;
  scorePercent: number;
  results: QuizQuestionReview[];
}

export interface RecommendationResult {
  recommendedTopicSlug: string;
  recommendedTopicTitle: string;
  recommendedMode: LearningMode;
  reason: string;
  source: 'evidence' | 'curriculum_default';
}
