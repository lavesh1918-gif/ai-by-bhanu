# Firestore Security Specification — SmartLearn AI by bhanu

## 1. Data Invariants
1. **Strict Ownership**: Every document under `/users/{uid}` and its subcollections (`learningSessions`, `practiceAttempts`, `quizAttempts`, `topicProgress`) belongs exclusively to `uid`, and `data.uid` must equal `uid` and `request.auth.uid`.
2. **PII Isolation**: User profiles contain `email` and are strictly readable and writable only by the owner (`request.auth.uid == uid`). No blanket `isSignedIn()` reads or lists are allowed.
3. **Server-Only Quiz Answer Keys**: `/quizAnswerKeys/{quizId}` is completely locked down (`allow read, write: if false;`) so no browser client can ever inspect answer keys prior to quiz submission.
4. **Parent-Child Integrity**: Subcollections under `/users/{uid}` verify the existence of `/users/{uid}` on creation and update.
5. **Immutable Audit Fields & Timestamps**: `uid` and `createdAt` / `startedAt` cannot be modified on update. Timestamps (`createdAt`, `updatedAt`, `startedAt`, `lastActivityAt`) must match `request.time`.
6. **Strict Field Allowlisting & Bounds**: Every string has explicit `.size()` bounds, enums are strictly checked, integer scores are bounded (`0 <= scorePercent <= 100`, `questionCount in [5, 10]`), and ghost/shadow fields are rejected via `hasOnly()`.

## 2. The "Dirty Dozen" Attack Payloads
1. **Cross-User Profile Read**: User B (`uid_b`) attempts `get /users/uid_a`. Expected: `PERMISSION_DENIED`.
2. **Cross-User Profile Write**: User B (`uid_b`) attempts `create` or `update /users/uid_a`. Expected: `PERMISSION_DENIED`.
3. **Cross-User Subcollection List**: User B (`uid_b`) attempts `list /users/uid_a/quizAttempts`. Expected: `PERMISSION_DENIED`.
4. **UID Spoofing on Create**: User A (`uid_a`) writes `/users/uid_a/practiceAttempts/att1` with `uid: "uid_b"`. Expected: `PERMISSION_DENIED`.
5. **Shadow Field Injection**: User A writes `/users/uid_a` with extra ghost field `isAdmin: true`. Expected: `PERMISSION_DENIED`.
6. **Private Quiz Key Snooping**: User A attempts `get` or `list` on `/quizAnswerKeys/quiz_123`. Expected: `PERMISSION_DENIED`.
7. **Unverified Email Write**: Authenticated user with `email_verified: false` attempts to write `/users/uid_a`. Expected: `PERMISSION_DENIED`.
8. **Score Tampering via Invalid Bounds**: User A creates `/users/uid_a/quizAttempts/q1` with `scorePercent: 150` or `questionCount: 99`. Expected: `PERMISSION_DENIED`.
9. **Immutable Timestamp Forgery**: User A creates `/users/uid_a` with a backdated `createdAt` not equal to `request.time`. Expected: `PERMISSION_DENIED`.
10. **CreatedAt Mutation on Update**: User A updates `/users/uid_a` and alters `createdAt`. Expected: `PERMISSION_DENIED`.
11. **Oversized Payload / Resource Exhaustion**: User A creates `/users/uid_a/practiceAttempts/att2` with a 20,000-character `learnerAnswer`. Expected: `PERMISSION_DENIED`.
12. **Path ID Poisoning**: User A attempts to write `/users/uid_a/topicProgress/bad$id!with/symbols`. Expected: `PERMISSION_DENIED`.
