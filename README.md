# SmartLearn AI by bhanu

**Tagline:** Your personal AI tutor for learning web development.  
**Capstone Context:** Independent educational capstone prototype submitted under the IIT Patna B3 Capstone Project (AI Tutor category). Not officially endorsed, certified, or operated by IIT Patna.

---

## 1. AI Studio Project Structure

```text
├── firebase-applet-config.json   # Provisioned Firebase Web SDK config
├── firebase-blueprint.json       # Firestore schema Intermediate Representation
├── firestore.rules               # Deployed Firestore Security Rules
├── eslint.config.mjs             # ESLint config for @firebase/eslint-plugin-security-rules
├── server.ts                     # Express + Vite server (port 3000) & authenticated API routes
├── server/
│   ├── auth.ts                   # Firebase Admin ID token verification
│   ├── gemini.ts                 # @google/genai server-side client, schemas, system prompt
│   ├── quizStore.ts              # Server-only private quiz answer keys & submission lock
│   └── rateLimit.ts              # Sliding-window per-UID rate limiter
├── shared/
│   ├── curriculum.ts             # Exact 9-topic curriculum in beginner sequence
│   └── types.ts                  # Shared TypeScript interfaces
└── src/
    ├── components/               # Layout, ProtectedRoute, TutorChatPanel, UI primitives
    ├── context/                  # AuthContext (Firebase Google Auth) & ThemeContext
    ├── lib/                      # Firebase client SDK, Firestore service, API client
    └── pages/                    # Landing, Auth, Onboarding, Dashboard, Learn, Practice, Quiz, Progress, Settings, About, Project Info
```

## 2. Firebase Project & Authentication Configuration

- **Provisioned Project ID:** `gen-lang-client-0837787954`
- **Firestore Database ID:** `ai-studio-67cea5fa-084d-498f-bc32-81b9bc63aef9`
- **Sign-In Method:** Firebase Authentication with Google Sign-In (`signInWithPopup`).
- **Remaining Firebase Console Check:**
  1. Open Firebase Console → **Authentication** → **Sign-in method**.
  2. Confirm the **Google** provider is enabled.
  3. Under **Authentication** → **Settings** → **Authorized domains**, confirm your AI Studio preview domain and Cloud Run publish domain are listed.

## 3. Firestore Collections & Security Rules

- `users/{uid}` — Learner profile (`displayName`, `email`, `experienceLevel`, `preferredLanguage`, `learningGoal`, `onboardingCompleted`, `createdAt`, `updatedAt`).
- `users/{uid}/learningSessions/{sessionId}` — Recent Learn / Practice / Quiz sessions.
- `users/{uid}/practiceAttempts/{attemptId}` — Evaluated practice submissions and feedback.
- `users/{uid}/quizAttempts/{attemptId}` — Completed quiz scores computed on the server.
- `users/{uid}/topicProgress/{topicSlug}` — Per-topic lesson views, practice counts, best quiz score, status.
- `quizAnswerKeys/{quizId}` — Server-only private collection (`allow read, write: if false;` in `firestore.rules`).

All user-owned paths require `request.auth != null`, `request.auth.uid == uid`, `request.auth.token.email_verified == true`, strict field allowlists (`hasOnly`), string/integer bounds, and server timestamp validation (`request.time`). Please review and audit `firestore.rules` before broad public distribution.

## 4. Gemini Server-Side Secret Configuration

- Gemini is called exclusively from `server/gemini.ts` using `@google/genai` and `process.env.GEMINI_API_KEY`.
- Never place `GEMINI_API_KEY` in `VITE_*` client environment variables or frontend bundles.
- In Google AI Studio, manage `GEMINI_API_KEY` via **Settings → Secrets**.
- Default model: `gemini-4-hydrogen` (override optionally on the server via `GEMINI_MODEL`).

## 5. Local / Preview Testing

1. Install dependencies: `npm install`
2. Lint TypeScript: `npm run lint`
3. Lint Firestore rules: `npx eslint firestore.rules`
4. Build client bundle: `npm run build`
5. Start full-stack server: `npm run dev` (or `npm start` for production build)

## 6. Cloud Run Publishing Steps

1. In Google AI Studio, click **Publish** / **Deploy to Cloud Run**.
2. Note: Google AI Studio may offer a Starter Tier to eligible accounts, or require a linked Google Cloud project with billing enabled for standard Cloud Run deployment.
3. Ensure `GEMINI_API_KEY` is attached to the Cloud Run service environment.
4. Once published, copy the live Cloud Run URL and add its hostname to Firebase Console → Authentication → Authorized Domains.

## 7. Export / GitHub Sync

Use Google AI Studio’s **Download / Export** or **GitHub Sync** option. `.gitignore` excludes `node_modules` and `dist`, and no secret keys are hardcoded in source files.

## 8. Post-Deployment Verification Checklist

1. Open the deployed URL on desktop and mobile (375px width) to verify zero horizontal overflow.
2. Sign in with Google on `/auth` and complete `/onboarding`.
3. Open Topic 1 on `/learn/introduction-to-web-development` and test **Ask AI Tutor** in English, Hindi, and Hinglish.
4. Generate and evaluate a task on `/practice`.
5. Generate and submit a 5-question quiz on `/quiz`, verifying correct answers only appear after submission.
6. Confirm `/dashboard` and `/progress` show the saved Firestore records accurately.
