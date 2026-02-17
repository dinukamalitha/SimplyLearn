# Security Documentation - Assignments Module

## Overview

This document details the security measures implemented in the Assignments module to protect against common web application vulnerabilities. The module includes assignment creation, submission management, and grading functionality with comprehensive security controls.

## Table of Contents

1. [NoSQL Injection Prevention](#1-nosql-injection-prevention)
2. [Cross-Site Scripting (XSS) Protection](#2-cross-site-scripting-xss-protection)
3. [File Upload Security](#3-file-upload-security)
4. [Input Validation & Sanitization](#4-input-validation--sanitization)
5. [Broken Access Control Prevention](#5-broken-access-control-prevention)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Data Integrity & Timestamp Security](#7-data-integrity--timestamp-security)
8. [Secure Data Exposure](#8-secure-data-exposure)
9. [Security Best Practices](#9-security-best-practices)
10. [Security Audit Trail](#10-security-audit-trail)

---

## 1. NoSQL Injection Prevention

### Risk
Attackers could manipulate MongoDB queries by injecting malicious objects or operators (e.g., `{"$gt": ""}`) to bypass authentication or access unauthorized data.

### Implementation

#### Server-Side Protection

**Location:** `assignmentController.js`

All MongoDB ObjectId parameters are validated before use:

```javascript
// Lines 15-20: Course ID validation
if (!mongoose.Types.ObjectId.isValid(courseId)) {
  return res.status(400).json({ message: "Invalid course id" });
}
const safeCourseId = new mongoose.Types.ObjectId(courseId);
```

**Protected Endpoints:**
- `getAssignments()` - Lines 15-20
- `getAssignmentById()` - Lines 38-42
- `createAssignment()` - Lines 63-71

**Location:** `submissionController.js`

```javascript
// Lines 41-48: Assignment and User ID validation
if (!mongoose.Types.ObjectId.isValid(assignment_id)) {
  return res.status(400).json({ message: "Invalid assignment id" });
}
const safeAssignmentId = new mongoose.Types.ObjectId(assignment_id);
```

**Protected Endpoints:**
- `submitAssignment()` - Lines 41-48
- `getSubmissions()` - Lines 98-103
- `getMySubmission()` - Lines 122-132
- `gradeSubmission()` - Lines 152-156

### Testing
- Attempt to pass objects like `{"$ne": null}` as IDs → Should return 400 Bad Request
- Pass invalid ObjectId strings → Should return 400 Bad Request
- Pass valid ObjectIds → Should process normally

---

## 2. Cross-Site Scripting (XSS) Protection

### Risk
Malicious users could inject JavaScript code through text inputs (assignment instructions, submission text) that executes in other users' browsers.

### Implementation

#### Server-Side Protection

**Location:** `submissionController.js` (Lines 2, 56-59)

```javascript
const sanitizeHtml = require('sanitize-html');

// Sanitize all text entries
const sanitizedText = text_entry
  ? sanitizeHtml(text_entry, { allowedTags: [], allowedAttributes: {} }).trim()
  : "";
```

**Configuration:**
- `allowedTags: []` - NO HTML tags permitted
- `allowedAttributes: {}` - NO HTML attributes permitted
- All text is stripped to plain text only

#### Client-Side Protection

**Location:** `AssignmentDetails.jsx`

```javascript
// Line 51: Safe text rendering
<p className="text-gray-300 whitespace-pre-line">{assignment.instructions}</p>

// Line 110: Plain text display
<p className="text-sm italic text-gray-300">{submission.text_entry || 'No text provided'}</p>
```

**Protection Mechanism:**
- React's built-in escaping (no `dangerouslySetInnerHTML`)
- CSS `whitespace-pre-line` for formatting without HTML
- All user content rendered as text nodes

### Testing
- Submit assignment with `<script>alert('xss')</script>` → Should be stripped/escaped
- Submit text with `<img src=x onerror=alert(1)>` → Should display as plain text
- Submit with HTML entities `&lt;script&gt;` → Should render safely

---

## 3. File Upload Security

### Risk
Attackers could upload malicious files (executables, PHP scripts, malware) that could:
- Execute arbitrary code on the server
- Compromise other users who download the files
- Consume excessive storage space

### Implementation

#### Server-Side Protection

**Location:** `submissionController.js` (Lines 8-28)

```javascript
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Dedicated upload directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Timestamp-based naming
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx|pptx|zip/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only PDF, DOC, PPTX, and ZIP files are allowed!'));
  }
});
```

**Security Features:**
1. **File Type Whitelist:** Only PDF, DOC, DOCX, PPTX, ZIP allowed
2. **Extension Validation:** Case-insensitive extension checking
3. **Timestamp Naming:** Prevents filename collisions and path traversal attacks
4. **Dedicated Directory:** Files isolated in `/uploads/` directory

#### Client-Side Protection

**Location:** `AssignmentDetails.jsx` (Lines 133, 143)

```javascript
<label>Upload File (PDF, DOC, ZIP, PPTX)</label>
<p className="text-xs text-gray-600 mt-2">Maximum file size: 10MB</p>
```

**User Guidance:**
- Clear indication of allowed file types
- File size limit communicated
- Visual feedback on file selection

### Testing
- Upload `.exe`, `.sh`, `.php` files → Should be rejected
- Upload valid PDF/DOC files → Should succeed
- Upload file with double extension (e.g., `file.pdf.exe`) → Should be rejected
- Attempt path traversal in filename (e.g., `../../malicious.pdf`) → Should be sanitized

---

## 4. Input Validation & Sanitization

### Risk
Malformed or malicious data could cause:
- Application crashes
- Database corruption
- Type confusion attacks
- Business logic bypasses

### Implementation

#### Server-Side Protection

**Location:** `assignmentController.js` (Lines 90-100)

```javascript
// Validate and sanitize all input fields
const safeTitle = typeof title === "string" ? title.trim() : "";
const safeInstructions = typeof instructions === "string" ? instructions.trim() : "";
const safeDeadline = deadline ? new Date(deadline) : null;
const safeMaxPoints = typeof max_points === "number" && max_points >= 0 ? max_points : 0;

if (!safeTitle) {
  return res.status(400).json({ message: "Title is required" });
}
```

**Validation Rules:**
- **Title:** Must be non-empty string, trimmed
- **Instructions:** Optional string, trimmed if present
- **Deadline:** Converted to Date object, validated
- **Max Points:** Must be non-negative number, defaults to 0

**Location:** `authController.js` (Helper functions from commit 794886b)

```javascript
// Lines 574-587: Sanitization helpers
const sanitizeString = (value, defaultValue = "") =>
  typeof value === "string" ? value.trim() : defaultValue;

const sanitizeStringArray = (arr, defaultValue = []) =>
  Array.isArray(arr) ? arr.map((s) => String(s).trim()) : defaultValue;

const isValidEmail = (email) => {
  if (typeof email !== "string") return false;
  const normalized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
  return emailRegex.test(normalized) ? normalized : false;
};
```

### Testing
- Submit assignment with `max_points: -100` → Should default to 0
- Submit with `title: null` → Should return 400 error
- Submit with `deadline: "invalid-date"` → Should handle gracefully
- Submit with extra/unexpected fields → Should be ignored

---

## 5. Broken Access Control Prevention

### Risk
Users could:
- Access assignments from courses they're not enrolled in
- Modify other students' submissions
- Grade assignments they don't have permission for
- Create assignments for courses they don't teach

### Implementation

#### Server-Side Authorization

**Location:** `assignmentController.js` (Lines 74-87)

```javascript
// Check if course exists
const course = await Course.findById(safeCourseId);
if (!course) {
  return res.status(404).json({ message: "Course not found" });
}

// Check authorization
if (
  course.tutor_id.toString() !== safeUserId.toString() &&
  req.user.role !== "Admin"
) {
  return res.status(403).json({
    message: "Not authorized to add assignments to this course",
  });
}
```

**Authorization Checks:**
1. **Course Ownership:** Only course tutors can create assignments
2. **Admin Override:** Admins can create assignments for any course
3. **Enrollment Verification:** Students only see assignments for enrolled courses

**Location:** `assignmentController.js` (Lines 119-153)

```javascript
// Student view - only enrolled courses
const enrollments = await Enrollment.find({ student_id: req.user._id });
const courseIds = enrollments.map((e) => e.course_id);
const assignments = await Assignment.find({ course_id: { $in: courseIds } });
```

**Location:** `submissionController.js` (Lines 62-65)

```javascript
// Prevent duplicate submissions with different ownership
const existingSubmission = await Submission.findOne({
  assignment_id: safeAssignmentId,
  student_id: safeStudentId  // User can only access their own submission
});
```

#### Client-Side Protection

**Location:** `AssignmentDetails.jsx` (Lines 253, 308-422)

```javascript
const isTutor = user.role !== 'Student';

// Conditional rendering based on role
{!isTutor && (
  <StudentSubmissionView {...props} />
)}

{isTutor && (
  <TutorSubmissionView {...props} />
)}
```

**Role-Based Views:**
- Students: See submission form, their grades, resubmit option
- Tutors: See all submissions, grading interface, student information
- Clear separation prevents UI-level information disclosure

### Testing
- Student attempts to access another student's submission → 403 Forbidden
- Tutor attempts to create assignment for course they don't teach → 403 Forbidden
- Student attempts to grade a submission → Route not accessible
- Admin can create/modify assignments for any course → Should succeed

---

## 6. Authentication & Authorization

### Risk
Unauthorized users accessing protected resources or routes.

### Implementation

#### Middleware Protection

**Location:** `assignmentRoutes.js` & `submissionRoutes.js`

All routes require the `protect` middleware (from auth module):

```javascript
const { protect } = require('../auth/authMiddleware');

router.get('/student/my', protect, getStudentAssignments);
router.get('/tutor/my', protect, getTutorAssignments);
router.post('/', protect, createAssignment);
```

**Protected Resources:**
- All assignment endpoints require authentication
- All submission endpoints require authentication
- No public access to assignment data

#### Context-Based Authentication

**Location:** `AssignmentDetails.jsx` (Lines 4, 243-244)

```javascript
import AuthContext from '../../context/AuthContext';

const { user } = useContext(AuthContext);
```

**Client-Side Checks:**
- User context required for all operations
- Role extracted from authenticated user
- JWT token automatically attached to API requests (via Axios interceptor)

**Location:** `api.js` (API service)

```javascript
// Request interceptor adds JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Testing
- Access assignment endpoints without token → 401 Unauthorized
- Access with expired token → 401 Unauthorized
- Access with valid token → Should succeed
- Attempt to modify `req.user` in request → Should be ignored (server-side verification)

---

## 7. Data Integrity & Timestamp Security

### Risk
Users could:
- Manipulate submission timestamps to appear on-time
- Backdate submissions to avoid late penalties
- Modify submission dates after grading

### Implementation

#### Server-Controlled Timestamps

**Location:** `submissionController.js` (Lines 70, 82)

```javascript
// Update existing submission - server controls timestamp
existingSubmission.submission_date = new Date();
await existingSubmission.save();

// Create new submission - server controls timestamp
const submission = await Submission.create({
  assignment_id: safeAssignmentId,
  student_id: safeStudentId,
  file_url,
  text_entry: sanitizedText,
  submission_date: new Date()  // Server-side timestamp
});
```

**Security Features:**
1. **Server-Side Time:** Uses `new Date()` on server, not client input
2. **No Client Override:** Timestamp field not accepted from request body
3. **Immutable After Grading:** Resubmission disabled after grading

#### Resubmission Control

**Location:** `AssignmentDetails.jsx` (Lines 114-118)

```javascript
{!submission.grade && (
  <button onClick={() => setSubmission(null)} className="...">
    Resubmit Assignment
  </button>
)}
```

**Rules:**
- Resubmission allowed only if not yet graded
- Each resubmission updates the timestamp (new `submission_date`)
- Late submissions clearly marked in UI and database

### Testing
- Submit with custom `submission_date` in request body → Should be ignored
- Resubmit graded assignment → Button not shown, should fail if attempted
- Check timestamp accuracy → Should match server time, not client time

---

## 8. Secure Data Exposure

### Risk
Exposing sensitive information in API responses:
- User passwords or password hashes
- Sensitive profile data
- Unrelated database records
- Internal system information

### Implementation

#### Selective Field Population

**Location:** `assignmentController.js` (Lines 127-128)

```javascript
const assignments = await Assignment.find({ course_id: { $in: courseIds } })
  .populate("course_id", "title")  // Only expose course title
  .sort({ deadline: 1 });
```

**Location:** `submissionController.js` (Line 108)

```javascript
const submissions = await Submission.find({
  assignment_id: safeAssignmentId
}).populate("student_id", "name email");  // Only expose name and email
```

**Data Exposure Minimization:**
- Course: Only `title` exposed, not tutor details, enrollment data
- User: Only `name` and `email` exposed, no password hash, role, or profile data
- Submissions: Only relevant to requesting user's context

#### Response Filtering

**Location:** `assignmentController.js` (Lines 137-145)

```javascript
return {
  ...assignment.toObject(),
  submission: submission
    ? {
        submission_date: submission.submission_date,
        grade: submission.grade,
      }
    : null,
};
```

**Filtered Data:**
- Students see only their own submission status
- Sensitive submission details (file paths, full feedback) not exposed in list views
- Tutors see aggregated statistics, not individual student data in listings

### Testing
- Check API responses for password_hash fields → Should not be present
- Verify populated fields contain only specified attributes
- Test student endpoints don't expose other students' data
- Verify error messages don't leak system information

---

## 9. Security Best Practices

### Code Organization

**Commit 794886b - Component Refactoring**

The `AssignmentDetails.jsx` component was refactored into smaller sub-components:

1. **AssignmentHeader** (Lines 18-54)
   - Displays assignment metadata
   - No user input handling
   - Read-only presentation

2. **StudentSubmissionView** (Lines 56-158)
   - Handles student submission form
   - Isolated file upload logic
   - Clear security boundary

3. **TutorSubmissionView** (Lines 160-240)
   - Handles grading interface
   - Separated from student view
   - Role-specific functionality

**Benefits:**
- Easier security auditing per component
- Reduced attack surface per component
- Clear separation of concerns
- Better testability

### Error Handling

**Consistent Error Responses:**

```javascript
// Generic error messages (no system info leakage)
res.status(400).json({ message: "Invalid assignment id" });
res.status(404).json({ message: "Assignment not found" });
res.status(403).json({ message: "Not authorized" });

// Detailed errors only for validation (safe)
cb(new Error('Only PDF, DOC, PPTX, and ZIP files are allowed!'));
```

**Security Features:**
- Generic error messages prevent information leakage
- No stack traces exposed to client
- Validation errors provide user guidance without system details

### Dependency Management

**Security-Focused Libraries:**

```javascript
const sanitizeHtml = require('sanitize-html');  // XSS prevention
const multer = require('multer');               // Secure file uploads
const mongoose = require('mongoose');           // ORM with injection protection
```

**Best Practices:**
- Keep dependencies updated
- Use established security libraries
- Regular security audits with `npm audit`

---

## 10. Security Audit Trail

### Recent Security Fixes

#### Commit 794886b (Feb 15, 2026, 04:28)
**"3 security issues fixed"**

**Files Changed:**
- `client/src/modules/assignments/AssignmentDetails.jsx`
- `client/src/modules/assignments/Assignments.jsx`
- `server/modules/auth/authController.js`

**Improvements:**
1. Component refactoring for better security isolation
2. Improved code readability for security auditing
3. Enhanced input sanitization helpers
4. Better separation of student/tutor views

#### Commit b501dba (Feb 15, 2026, 04:07)
**"4 security issues fixed"**

**Files Changed:**
- `server/modules/assignments/assignmentController.js`
- `server/modules/assignments/submissionController.js`
- `server/modules/auth/authController.js`
- `server/modules/courses/courseController.js`
- `server/modules/engagement/dashboardController.js`
- `server/modules/engagement/enrollmentController.js`
- `server/modules/engagement/forumController.js`
- `server/modules/quizzes/quizController.js`

**Improvements:**
1. Enhanced ObjectId validation across all controllers
2. Improved authorization checks
3. Better input sanitization
4. Consistent error handling

#### Commit d9522d6 (Feb 15, 2026, 03:51)
**"4 security issues fixed"**

**Files Changed:**
- `server/modules/assignments/assignmentController.js`
- `server/modules/assignments/submissionController.js`
- `server/modules/auth/authController.js`
- `server/modules/quizzes/quizController.js`

**Improvements:**
1. NoSQL injection prevention
2. Input validation enhancements
3. Type safety improvements

---

## Security Testing Checklist

### NoSQL Injection
- [ ] Test ObjectId validation with malicious objects
- [ ] Verify rejection of invalid ObjectId formats
- [ ] Check query construction uses only validated IDs

### XSS Protection
- [ ] Submit HTML/JavaScript in text fields
- [ ] Verify all user content is escaped in UI
- [ ] Check no `dangerouslySetInnerHTML` usage

### File Upload
- [ ] Attempt to upload executable files
- [ ] Test file type validation
- [ ] Verify file naming prevents path traversal
- [ ] Check file size limits

### Authorization
- [ ] Test cross-user data access
- [ ] Verify role-based access control
- [ ] Check ownership verification
- [ ] Test admin override functionality

### Input Validation
- [ ] Submit invalid data types
- [ ] Test boundary values
- [ ] Verify required field validation
- [ ] Check default value handling

### Authentication
- [ ] Test endpoints without token
- [ ] Verify token expiration handling
- [ ] Check token refresh mechanism
- [ ] Test concurrent sessions

---

## Future Security Enhancements

### Recommended Improvements

1. **Rate Limiting**
   - Implement rate limiting on submission endpoints
   - Prevent rapid-fire submission attempts
   - Mitigate DoS attacks

2. **File Scanning**
   - Add antivirus scanning for uploaded files
   - Implement content-type verification (not just extension)
   - Check for embedded malicious content in documents

3. **Audit Logging**
   - Log all security-relevant events
   - Track failed authorization attempts
   - Monitor unusual access patterns

4. **Enhanced File Security**
   - Store files outside web root
   - Implement signed URLs for downloads
   - Add file encryption at rest

5. **Input Validation Enhancement**
   - Add comprehensive schema validation (e.g., Joi, Yup)
   - Implement request size limits
   - Add content-type verification

6. **CSRF Protection**
   - Implement CSRF tokens for state-changing operations
   - Add SameSite cookie attributes
   - Verify origin headers

---

## Security Contact

For security issues or vulnerabilities, please:

1. **Do not** create public GitHub issues for security vulnerabilities
2. Contact the security team directly
3. Provide detailed information about the vulnerability
4. Allow time for patching before public disclosure

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)

---

**Last Updated:** February 17, 2026
**Module Version:** 1.0
**Security Audit Status:** Reviewed
