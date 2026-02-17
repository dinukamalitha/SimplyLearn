# Security Risk Assessment - Quizzes Module

## Executive Summary

This document provides a comprehensive analysis of security risks in the Quizzes module and details how they are addressed through the current implementation. The assessment identifies both **implemented security controls** and **critical vulnerabilities** that require immediate attention.

**Overall Security Status:** ⚠️ **MODERATE with Critical Issues**

- ✅ **Implemented:** 5 security controls
- ⚠️ **Critical Issues:** 2 vulnerabilities
- 🔶 **Medium Priority Issues:** 3 vulnerabilities
- 🔷 **Low Priority Issues:** 4 minor concerns

---

## Security Risks Addressed

### ✅ 1. NoSQL Injection Prevention

**Risk Level:** HIGH → **MITIGATED**

**Threat:**
Attackers inject malicious MongoDB operators (e.g., `{"$ne": null}`) to bypass validation and access unauthorized data.

**How It's Addressed:**

| Location | Implementation | Line Numbers |
|----------|----------------|--------------|
| `quizController.js` | ObjectId validation in `getQuizzes()` | 11-14 |
| `quizController.js` | ObjectId validation in `getQuizById()` | 28-31 |
| `quizController.js` | ObjectId validation in `createQuiz()` | 46-49 |

**Code Example:**
```javascript
// quizController.js:46-49
if (!mongoose.Types.ObjectId.isValid(course_id)) {
  return res.status(400).json({ message: "Invalid course id" });
}
const safeCourseId = new mongoose.Types.ObjectId(course_id);
```

**Protection Mechanism:**
- Validates ObjectId format before database queries
- Converts strings to ObjectId objects
- Rejects malformed IDs with 400 error
- Prevents query operator injection

**Security Commits:**
- `b501dba` - Added mongoose import for ObjectId validation
- Earlier commits added validation to all endpoints

**Test Results:**
- ✅ Malicious objects (`{"$gt": ""}`) rejected
- ✅ Invalid ObjectIds rejected
- ✅ Valid ObjectIds processed

---

### ✅ 2. Input Validation & Sanitization

**Risk Level:** MEDIUM → **MITIGATED**

**Threat:**
Malformed data causes crashes, database corruption, or type confusion attacks.

**How It's Addressed:**

| Field | Validation | Location |
|-------|------------|----------|
| `title` | Non-empty string, trimmed | quizController.js:52-54, 62 |
| `questions` | Non-empty array | quizController.js:55-57 |
| `timer_limit` | Number type validation | quizController.js:58-60 |
| `question_text` | String trimming | quizController.js:67 |
| `options` | Array sanitization | quizController.js:68 |

**Code Example:**
```javascript
// quizController.js:52-70
if (typeof title !== "string" || title.trim() === "") {
  return res.status(400).json({ message: "Invalid quiz title" });
}

if (!Array.isArray(questions) || questions.length === 0) {
  return res.status(400).json({ message: "Questions must be a non-empty array" });
}

if (timer_limit !== undefined && typeof timer_limit !== "number") {
  return res.status(400).json({ message: "Invalid timer limit" });
}

const safeTitle = title.trim();

const sanitizedQuestions = questions.map((q) => ({
  ...q,
  question_text: typeof q.question_text === "string" ? q.question_text.trim() : "",
  options: Array.isArray(q.options) ? q.options.map(opt => String(opt).trim()) : [],
  correct_answer: typeof q.correct_answer === "string" ? q.correct_answer.trim() : "",
}));
```

**Protection Layers:**

1. **Type Checking:** Verifies data types before processing
2. **Trimming:** Removes whitespace from all text fields
3. **Array Validation:** Ensures arrays exist and are non-empty
4. **Element Sanitization:** Processes each array element
5. **String Conversion:** Converts options to strings

**Security Commits:**
- `8d96a81` - Added title, questions, timer validation
- `d9522d6` - Added questions array sanitization

**Test Results:**
- ✅ Empty title rejected
- ✅ Empty questions array rejected
- ✅ Invalid timer type rejected
- ✅ Whitespace trimmed from all fields

---

### ✅ 3. Authentication

**Risk Level:** HIGH → **MITIGATED**

**Threat:**
Unauthorized users access quiz content without authentication.

**How It's Addressed:**

| Endpoint | Protection | Location |
|----------|------------|----------|
| `GET /quizzes/course/:courseId` | JWT required | quizRoutes.js:6 |
| `GET /quizzes/:id` | JWT required | quizRoutes.js:7 |
| `POST /quizzes` | JWT required | quizRoutes.js:8 |

**Code Example:**
```javascript
// quizRoutes.js:4-8
const { protect } = require('../../middleware/authMiddleware');

router.get('/course/:courseId', protect, getQuizzes);
router.get('/:id', protect, getQuizById);
router.post('/', protect, createQuiz);
```

**Protection Mechanism:**
- `protect` middleware validates JWT token
- Token must be present in Authorization header
- Token must be valid and not expired
- User object attached to `req.user`

**Client-Side Integration:**
```javascript
// Axios interceptor in api.js
const token = localStorage.getItem('token');
config.headers.Authorization = `Bearer ${token}`;
```

**Test Results:**
- ✅ Requests without token return 401
- ✅ Expired tokens rejected
- ✅ Valid tokens grant access

---

### ✅ 4. Cross-Site Scripting (XSS) Protection

**Risk Level:** MEDIUM → **PARTIALLY MITIGATED**

**Threat:**
Malicious JavaScript injected through quiz content executes in user browsers.

**How It's Addressed:**

**Server-Side (Basic):**
```javascript
// quizController.js:62-70
const safeTitle = title.trim();  // Trimming only, no HTML sanitization

const sanitizedQuestions = questions.map((q) => ({
  question_text: typeof q.question_text === "string" ? q.question_text.trim() : "",
  options: Array.isArray(q.options) ? q.options.map(opt => String(opt).trim()) : []
}));
```

**Client-Side (Primary Protection):**
```javascript
// TakeQuiz.jsx:58, 64, 75
<h1>{quiz.title}</h1>                        // React auto-escapes
<h3>{qIndex + 1}. {q.question_text}</h3>     // React auto-escapes
<span>{opt}</span>                            // React auto-escapes
```

**Protection Mechanism:**
- React automatically escapes all text content
- No use of `dangerouslySetInnerHTML`
- HTML rendered as plain text
- JavaScript cannot execute

**Limitations:**
- ⚠️ Server doesn't use `sanitize-html` library
- ⚠️ Relies solely on React for XSS protection
- 🔷 Defense-in-depth missing

**Test Results:**
- ✅ `<script>alert('xss')</script>` rendered as text
- ✅ HTML entities escaped
- ⚠️ Server should add HTML stripping

---

### ✅ 5. Array & Type Safety Validation

**Risk Level:** MEDIUM → **MITIGATED**

**Threat:**
Malformed arrays cause server crashes or undefined behavior.

**How It's Addressed:**

**Array Type Checking:**
```javascript
// quizController.js:55-57
if (!Array.isArray(questions) || questions.length === 0) {
  return res.status(400).json({ message: "Questions must be a non-empty array" });
}
```

**Element Validation:**
```javascript
// quizController.js:65-70
const sanitizedQuestions = questions.map((q) => ({
  ...q,
  question_text: typeof q.question_text === "string" ? q.question_text.trim() : "",
  options: Array.isArray(q.options) ? q.options.map(opt => String(opt).trim()) : [],
  correct_answer: typeof q.correct_answer === "string" ? q.correct_answer.trim() : "",
}));
```

**Schema Validation:**
```javascript
// Quiz.js:13-18
questions: [{
  question_text: String,
  options: [String],
  correct_option_index: Number,
  type: { type: String, enum: ['Multiple Choice', 'True/False'], default: 'Multiple Choice' }
}]
```

**Protection Layers:**
1. Array existence check
2. Array length validation
3. Individual element type checking
4. Nested array sanitization
5. Mongoose schema enforcement

**Test Results:**
- ✅ Non-array questions rejected
- ✅ Empty array rejected
- ✅ Malformed objects handled
- ✅ Type conversion applied

---

## Critical Security Vulnerabilities

### ⚠️ 1. Correct Answers Exposed to Client

**Risk Level:** 🔴 **CRITICAL**

**Vulnerability:**
The entire quiz object, including `correct_option_index` for all questions, is sent to the client when a student takes a quiz.

**Location:** `quizController.js:33-35`

```javascript
const quiz = await Quiz.findById(safeQuizId);
if (quiz) res.json(quiz);  // ⚠️ Sends entire object including answers!
```

**Exploit:**
```javascript
// Student opens browser console during quiz:
console.log(quiz.questions.map(q => q.correct_option_index));
// Output: [2, 0, 1, 3, 0] ← All correct answers revealed!
```

**Impact:**
- Students can view all correct answers before submission
- Zero effort required to cheat
- Undermines entire assessment system
- No detection possible

**Evidence:**
```javascript
// TakeQuiz.jsx:15-16
const { data } = await api.get(`/quizzes/${id}`);
setQuiz(data);  // data includes correct_option_index
```

**Recommended Fix:**
```javascript
const getQuizById = async (req, res) => {
  const quiz = await Quiz.findById(safeQuizId).lean();

  // Strip correct answers before sending to client
  const sanitizedQuiz = {
    ...quiz,
    questions: quiz.questions.map(({ correct_option_index, ...q }) => q)
  };

  res.json(sanitizedQuiz);
};
```

**Status:** ❌ **NOT IMPLEMENTED**

---

### ⚠️ 2. Client-Side Answer Validation

**Risk Level:** 🔴 **CRITICAL**

**Vulnerability:**
Quiz scoring is performed entirely client-side in the browser, with no server validation.

**Location:** `TakeQuiz.jsx:24-34`

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  let score = 0;
  quiz.questions.forEach((q, index) => {
    if (answers[index] === q.correct_option_index) {
      score++;
    }
  });
  const percentage = (score / quiz.questions.length) * 100;
  setResult({ score, total: quiz.questions.length, percentage });
  // ⚠️ No server communication! Score calculated in browser!
};
```

**Exploits:**

1. **Score Manipulation:**
   ```javascript
   // In browser console:
   setResult({ score: 100, total: 10, percentage: 100 });
   ```

2. **Answer Viewing + Perfect Score:**
   ```javascript
   const correctAnswers = quiz.questions.map(q => q.correct_option_index);
   const answers = Object.fromEntries(correctAnswers.map((a, i) => [i, a]));
   setAnswers(answers);
   ```

**Impact:**
- Students can manipulate scores arbitrarily
- No server-side validation of answers
- No audit trail of quiz attempts
- Scores not saved to database
- Cannot verify academic integrity

**Recommended Fix:**
```javascript
// Server-side: POST /api/quizzes/:id/submit
const submitQuiz = async (req, res) => {
  const { id } = req.params;
  const { answers } = req.body;  // { 0: 2, 1: 0, 2: 1 }

  const quiz = await Quiz.findById(id);
  let score = 0;

  quiz.questions.forEach((q, index) => {
    if (answers[index] === q.correct_option_index) {
      score++;
    }
  });

  const result = await QuizResult.create({
    quiz_id: id,
    student_id: req.user.id,
    answers,
    score,
    total: quiz.questions.length,
    percentage: (score / quiz.questions.length) * 100,
    submitted_at: new Date()
  });

  // Return only score, not correct answers
  res.json({
    score: result.score,
    total: result.total,
    percentage: result.percentage
  });
};
```

**Status:** ❌ **NOT IMPLEMENTED**

---

## Medium Priority Security Issues

### 🔶 3. Missing Authorization Controls

**Risk Level:** 🟠 **MEDIUM**

**Vulnerability:**
No verification that users have permission to create/view quizzes.

**Missing Checks:**

1. **Quiz Creation:**
   ```javascript
   // quizController.js:41-84
   // ⚠️ Missing: Check if user teaches the course
   const course = await Course.findById(safeCourseId);
   if (course.tutor_id.toString() !== req.user.id && req.user.role !== "Admin") {
     return res.status(403).json({ message: "Not authorized" });
   }
   ```

2. **Quiz Viewing:**
   ```javascript
   // quizController.js:23-39
   // ⚠️ Missing: Check if student is enrolled
   const enrollment = await Enrollment.findOne({
     student_id: req.user.id,
     course_id: quiz.course_id
   });
   if (!enrollment && req.user.role === "Student") {
     return res.status(403).json({ message: "Not enrolled" });
   }
   ```

**Impact:**
- Any authenticated user can create quizzes for any course
- Any authenticated user can view any quiz
- No course ownership verification

**Status:** ❌ **NOT IMPLEMENTED**

---

### 🔶 4. No Quiz Result Persistence

**Risk Level:** 🟠 **MEDIUM**

**Issue:**
Quiz results are not saved to the database.

**Current Behavior:**
```javascript
// TakeQuiz.jsx:33
setResult({ score, total: quiz.questions.length, percentage });
// Result only stored in component state, never sent to server
```

**Impact:**
- No historical record of quiz attempts
- Cannot track student progress
- No analytics or reporting
- Students can retake infinitely
- No proof of completion

**Recommended Solution:**
```javascript
// Create QuizResult model
const quizResultSchema = new mongoose.Schema({
  quiz_id: { type: ObjectId, ref: 'Quiz', required: true },
  student_id: { type: ObjectId, ref: 'User', required: true },
  answers: [Number],
  score: Number,
  percentage: Number,
  submitted_at: { type: Date, default: Date.now }
});
```

**Status:** ❌ **NOT IMPLEMENTED**

---

### 🔶 5. No Enrollment Verification

**Risk Level:** 🟠 **MEDIUM**

**Issue:**
Students can view quizzes for courses they're not enrolled in.

**Current Code:**
```javascript
// quizController.js:23-39
const getQuizById = async (req, res) => {
  const quiz = await Quiz.findById(safeQuizId);
  if (quiz) res.json(quiz);  // ⚠️ No enrollment check!
};
```

**Impact:**
- Access control bypass
- Unauthorized quiz access
- Potential information disclosure

**Test:**
```bash
# Student can access quiz from course they're not enrolled in:
curl -H "Authorization: Bearer $STUDENT_TOKEN" \
  http://localhost:8000/api/quizzes/507f1f77bcf86cd799439012
# Returns quiz data even if not enrolled ⚠️
```

**Status:** ❌ **NOT IMPLEMENTED**

---

## Low Priority Issues

### 🔷 6. No HTML Sanitization Library

**Risk Level:** 🟢 **LOW** (mitigated by React)

**Issue:**
Server doesn't use `sanitize-html` library, relying solely on React.

**Current:**
```javascript
const safeTitle = title.trim();  // Only trimming
```

**Recommendation:**
```javascript
const sanitizeHtml = require('sanitize-html');
const safeTitle = sanitizeHtml(title, {
  allowedTags: [],
  allowedAttributes: {}
}).trim();
```

**Status:** ⚠️ **RECOMMENDED**

---

### 🔷 7. No Timer Enforcement

**Risk Level:** 🟢 **LOW**

**Issue:**
Timer is UI-only, not enforced server-side.

**Current Behavior:**
- Timer displayed to student
- No countdown implementation
- No auto-submit on timeout
- No server validation of submission time

**Impact:**
- Students can ignore timer
- Take unlimited time
- Timer is purely cosmetic

**Status:** 🔷 **ENHANCEMENT RECOMMENDED**

---

### 🔷 8. No Rate Limiting

**Risk Level:** 🟢 **LOW**

**Issue:**
No limits on quiz creation or access frequency.

**Recommendation:**
```javascript
const rateLimit = require('express-rate-limit');
const quizLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50
});
router.post('/', protect, quizLimiter, createQuiz);
```

**Status:** 🔷 **ENHANCEMENT RECOMMENDED**

---

### 🔷 9. No Input Length Limits

**Risk Level:** 🟢 **LOW**

**Issue:**
Very long titles or questions could be submitted.

**Recommendation:**
```javascript
if (safeTitle.length > 200) {
  return res.status(400).json({ message: "Title too long" });
}
```

**Status:** 🔷 **ENHANCEMENT RECOMMENDED**

---

## Security Audit Summary

### Implemented Controls ✅

| # | Security Control | Status | Effectiveness |
|---|-----------------|--------|---------------|
| 1 | NoSQL Injection Prevention | ✅ Implemented | High |
| 2 | Input Validation & Sanitization | ✅ Implemented | High |
| 3 | Authentication (JWT) | ✅ Implemented | High |
| 4 | XSS Protection (React) | ✅ Partial | Medium |
| 5 | Array & Type Safety | ✅ Implemented | High |

### Critical Vulnerabilities ⚠️

| # | Vulnerability | Risk | Impact | Status |
|---|--------------|------|---------|--------|
| 1 | Correct Answers Exposed | 🔴 Critical | Students can cheat | ❌ Not Fixed |
| 2 | Client-Side Validation | 🔴 Critical | Score manipulation | ❌ Not Fixed |

### Medium Priority Issues 🔶

| # | Issue | Risk | Impact | Status |
|---|-------|------|---------|--------|
| 3 | Missing Authorization | 🟠 Medium | Unauthorized quiz creation | ❌ Not Fixed |
| 4 | No Result Persistence | 🟠 Medium | No audit trail | ❌ Not Fixed |
| 5 | No Enrollment Check | 🟠 Medium | Quiz access bypass | ❌ Not Fixed |

### Low Priority Issues 🔷

| # | Issue | Risk | Recommended |
|---|-------|------|-------------|
| 6 | No HTML Sanitization | 🟢 Low | Add sanitize-html |
| 7 | No Timer Enforcement | 🟢 Low | Server-side validation |
| 8 | No Rate Limiting | 🟢 Low | Add rate limiter |
| 9 | No Input Length Limits | 🟢 Low | Add max length |

---

## Recommendations by Priority

### 🔴 Immediate Action Required

1. **Implement Server-Side Answer Validation**
   - Remove `correct_option_index` from client response
   - Create POST `/api/quizzes/:id/submit` endpoint
   - Validate answers server-side
   - Store results in database

2. **Fix Answer Exposure**
   - Strip answers before sending quiz to client
   - Only return answers during server-side grading
   - Implement QuizResult model

### 🟠 High Priority

3. **Add Authorization Checks**
   - Verify course ownership before quiz creation
   - Check enrollment before quiz access
   - Implement role-based access control

4. **Implement Result Persistence**
   - Create QuizResult schema
   - Store all quiz attempts
   - Enable analytics and reporting

### 🟢 Medium Priority

5. **Add Server-Side HTML Sanitization**
6. **Implement Timer Enforcement**
7. **Add Rate Limiting**
8. **Add Input Length Validation**

---

## Compliance & Best Practices

### OWASP Top 10 Coverage

| OWASP Risk | Status | Implementation |
|------------|--------|----------------|
| A01:2021 - Broken Access Control | ⚠️ Partial | Auth ✅, Authz ❌ |
| A02:2021 - Cryptographic Failures | ✅ Covered | JWT tokens |
| A03:2021 - Injection | ✅ Covered | NoSQL injection prevented |
| A04:2021 - Insecure Design | ⚠️ Issue | Client-side validation |
| A05:2021 - Security Misconfiguration | ✅ Good | Proper error handling |
| A06:2021 - Vulnerable Components | ✅ Good | Dependencies updated |
| A07:2021 - Identification & Auth | ✅ Covered | JWT authentication |
| A08:2021 - Data Integrity Failures | ⚠️ Issue | No server validation |
| A09:2021 - Logging Failures | ⚠️ Partial | No audit logging |
| A10:2021 - SSRF | ✅ N/A | Not applicable |

---

## Conclusion

The Quizzes module implements strong **authentication** and **NoSQL injection prevention**, but has **critical vulnerabilities** in answer validation and authorization that must be addressed before production deployment.

**Security Score: 5/10**

- ✅ Strong: Authentication, Input Validation, Injection Prevention
- ⚠️ Critical: Answer Exposure, Client-Side Validation
- 🔶 Missing: Authorization, Result Persistence, Enrollment Check

**For detailed technical documentation, see:**
- [SECURITY.md](./SECURITY.md) - Complete security analysis
- [README.md](./README.md) - Module documentation

---

**Assessment Date:** February 17, 2026
**Assessor:** Security Analysis Tool
**Next Review:** After critical fixes implemented
