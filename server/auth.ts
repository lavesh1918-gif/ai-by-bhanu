import fs from 'node:fs';
import path from 'node:path';
import type { Request, Response, NextFunction } from 'express';
import { initializeApp, getApps, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

interface FirebaseAppletConfig {
  projectId: string;
  firestoreDatabaseId?: string;
}

export interface AuthenticatedUser {
  uid: string;
  email: string;
  emailVerified: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

let cachedConfig: FirebaseAppletConfig | null = null;
let adminApp: App | null = null;
let adminDb: Firestore | null = null;
let adminDbChecked = false;

export function getFirebaseProjectConfig(): FirebaseAppletConfig | null {
  if (cachedConfig) return cachedConfig;
  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) return null;
    const raw = fs.readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw) as FirebaseAppletConfig;
    if (!parsed.projectId || parsed.projectId === 'remixed-project-id') {
      return null;
    }
    cachedConfig = parsed;
    return parsed;
  } catch {
    return null;
  }
}

export function getAdminApp(): App | null {
  if (adminApp) return adminApp;
  const config = getFirebaseProjectConfig();
  if (!config) return null;
  const existing = getApps();
  if (existing.length > 0) {
    adminApp = existing[0];
    return adminApp;
  }
  adminApp = initializeApp({
    projectId: config.projectId,
  });
  return adminApp;
}

export function getAdminFirestore(): Firestore | null {
  if (adminDbChecked) return adminDb;
  adminDbChecked = true;
  const app = getAdminApp();
  const config = getFirebaseProjectConfig();
  if (!app || !config) return null;
  try {
    adminDb = config.firestoreDatabaseId
      ? getFirestore(app, config.firestoreDatabaseId)
      : getFirestore(app);
    return adminDb;
  } catch {
    adminDb = null;
    return null;
  }
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const app = getAdminApp();
  if (!app) {
    res.status(503).json({
      error: 'Firebase is not configured on the server yet.',
      code: 'FIREBASE_NOT_CONFIGURED',
    });
    return;
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Authentication required. Please sign in with Google.',
      code: 'UNAUTHORIZED',
    });
    return;
  }

  const idToken = header.slice('Bearer '.length).trim();
  if (!idToken || idToken.length > 4096) {
    res.status(401).json({
      error: 'Invalid authentication token.',
      code: 'INVALID_TOKEN',
    });
    return;
  }

  try {
    const decoded = await getAuth(app).verifyIdToken(idToken);
    req.user = {
      uid: decoded.uid,
      email: decoded.email ?? '',
      emailVerified: Boolean(decoded.email_verified),
    };
    next();
  } catch {
    res.status(401).json({
      error: 'Your sign-in session expired or could not be verified. Please sign in again.',
      code: 'TOKEN_VERIFICATION_FAILED',
    });
  }
}
