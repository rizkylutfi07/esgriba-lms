CBT System Migration Plan
Migrating CBT system from Laravel + React + MySQL to NestJS + Next.js + Prisma + PostgreSQL.

User Review Required
IMPORTANT

Breaking Changes

New database schema in PostgreSQL (migrating from MySQL)
All existing CBT data will need to be migrated
API endpoints will change from Laravel routes to NestJS routes
Frontend will be integrated into existing Next.js app
WARNING

Data Migration

Existing CBT data in 
old-cbt/cbt_database.sql
 needs to be migrated
Should we create a migration script to transfer existing data?
Or start fresh with new CBT system?
Proposed Changes
Database Layer (Prisma Schema)
[MODIFY] 
schema.prisma
Add new models for CBT system:

QuestionBank - Reusable question repository

Fields: id, createdBy, subjectId, category, questionText, questionType (MULTIPLE_CHOICE, ESSAY, TRUE_FALSE), difficultyLevel (1-3), points, explanation, options (JSON), correctAnswer (JSON), usageCount
Relations: creator (User), subject (Mapel)
QuestionPackage - Grouped questions for reuse

Fields: id, name, description, subjectId, createdBy, difficultyLevel, totalQuestions, totalPoints
Relations: creator (User), subject (Mapel), questions (many-to-many with QuestionBank)
Test - Exam/quiz instance

Fields: id, title, description, duration, totalQuestions, passingScore, isActive, cheatDetectionEnabled, startTime, endTime, createdBy, subjectId, classId, session
Relations: creator (User), subject (Mapel), class (Kelas), questions, attempts, allowedStudents
Question - Questions in a specific test

Fields: id, testId, questionText, questionType, expectedAnswer, points, order, imageUrl
Relations: test (Test), options
QuestionOption - Answer choices for multiple choice

Fields: id, questionId, optionText, isCorrect, order
Relations: question (Question)
TestAttempt - Student's test session

Fields: id, testId, userId, startedAt, finishedAt, score, isPassed, status (IN_PROGRESS, COMPLETED, ABANDONED, BLOCKED), isBlocked, blockedAt, blockedReason, cheatCount, lastActivityAt
Relations: test (Test), user (User), answers, events
UserAnswer - Student's answer to a question

Fields: id, attemptId, questionId, answerText, isCorrect, pointsEarned
Relations: attempt (TestAttempt), question (Question)
TestAttemptEvent - Cheat detection events

Fields: id, attemptId, eventType, triggeredBy, description, metadata (JSON)
Relations: attempt (TestAttempt)
Backend Layer (NestJS)
[NEW] 
question-bank.module.ts
Question Bank CRUD module with:

Create/Read/Update/Delete questions
Filter by subject, category, difficulty, type
Search questions
Duplicate questions
Bulk add to test
[NEW] 
question-package.module.ts
Question Package management:

Create/manage packages
Add/remove questions from package
Auto-calculate statistics
[NEW] 
test.module.ts
Test management module:

CRUD operations for tests
Add/update/delete questions in test
Publish/unpublish tests
Duplicate tests
Filter by subject, class, status
Auto-deactivate expired tests
[NEW] 
test-attempt.module.ts
Student test session management:

Start test (create attempt)
Submit answers
Finish test
Auto-grading for multiple choice
Timer management
Cheat detection tracking
[NEW] 
report.module.ts
Statistics and reporting:

Teacher dashboard stats
Student dashboard stats
Test statistics (score distribution, question analysis)
Attempt analysis
Export results to Excel
[NEW] 
cbt.module.ts
Main CBT module that imports all sub-modules.

Frontend Layer (Next.js)
Admin Pages
[NEW] 
page.tsx
Question Bank management page:

Table with search, filter, pagination
Create/edit/delete questions
Duplicate questions
Filter by subject, category, difficulty
Bulk select for adding to tests
[NEW] 
page.tsx
Question Package management:

Create/edit packages
Add questions to package
View package statistics
[NEW] 
page.tsx
Test management page:

Create/edit/delete tests
Add questions (from bank or create new)
Publish/unpublish
Duplicate tests
View test statistics
[NEW] 
page.tsx
Results and statistics page:

View all test results
Filter by test, class, student
Export to Excel
Detailed analytics
Teacher Pages
[NEW] 
page.tsx
Teacher's question bank (same as admin but filtered to own questions).

[NEW] 
page.tsx
Teacher's test management (same as admin but filtered to own tests).

[NEW] 
page.tsx
Teacher's results view (filtered to own tests).

Student Pages
[NEW] 
page.tsx
Student CBT dashboard:

List available tests
View test details
Start test button
View past results
[NEW] 
page.tsx
Test taking interface:

Timer display
Question navigation
Answer submission
Cheat detection (tab switch, window blur)
Auto-submit on time up
Confirmation before finish
[NEW] 
page.tsx
Test result view:

Score display
Pass/fail status
Correct/incorrect answers
Explanations (if available)
Verification Plan
Automated Tests
# Backend tests
cd apps/backend
npm run test:e2e -- cbt
# Test scenarios:
# 1. Question bank CRUD
# 2. Test creation with questions
# 3. Student takes test
# 4. Auto-grading
# 5. Cheat detection
# 6. Export results
Manual Verification
Admin Flow:

Create question bank
Create question package
Create test using questions from bank
Publish test
View results and statistics
Teacher Flow:

Create questions
Create test
Monitor student progress
View analytics
Student Flow:

View available tests
Start test
Answer questions
Submit test
View results
Cheat Detection:

Switch tabs during test
Minimize window
Verify blocking after threshold
Export:

Export test results to Excel
Verify data accuracy