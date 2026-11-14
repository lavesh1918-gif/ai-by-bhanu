/**
 * Security Rules Structural Verification & Dirty Dozen Specification Tests
 * Matches security_spec.md and firestore.rules for SmartLearn AI by bhanu.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
const rulesText = fs.readFileSync(rulesPath, 'utf8');

// Verify foundational security invariants in firestore.rules
assert.match(rulesText, /rules_version\s*=\s*'2';/, 'Must use Firestore rules v2');
assert.match(
  rulesText,
  /match \/\{document=\*\*\} \{\s*allow read, write: if false;\s*\}/,
  'Must begin with global default-deny safety net'
);
assert.match(
  rulesText,
  /match \/quizAnswerKeys\/\{quizId\} \{\s*allow read, write: if false;\s*\}/,
  'quizAnswerKeys must be completely inaccessible to browser clients'
);
assert.match(
  rulesText,
  /request\.auth\.token\.email_verified == true/,
  'All writes must require verified email'
);
assert.match(
  rulesText,
  /match \/users\/\{uid\}[\s\S]*allow list: if false;/,
  'Users collection must prohibit listing PII'
);
assert.match(
  rulesText,
  /allow list: if isOwner\(uid\) && resource\.data\.uid == request\.auth\.uid;/,
  'Subcollection list rules must enforce resource.data.uid == request.auth.uid'
);

console.log('All static Firestore security rule invariants verified.');
