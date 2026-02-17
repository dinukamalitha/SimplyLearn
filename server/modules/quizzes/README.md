# Quizzes Module

## Overview

The Quizzes module provides functionality for creating and taking quizzes within the SimplyLearn platform. Tutors can create multiple-choice quizzes with customizable timers, and students can take quizzes with instant feedback on their performance. The module currently implements client-side scoring for immediate results.

## Features

### For Tutors/Instructors
- Create quizzes for their courses
- Add multiple questions with custom options
- Set time limits for quiz completion
- Support for multiple-choice questions
- Generate quizzes with 2+ options per question

### For Students
- Take quizzes for enrolled courses
- View time limits before starting
- Submit answers and receive immediate scores
- See percentage and raw score results
- Navigate back to course after completion

### For Admins
- Access to all tutor capabilities
- Create quizzes for any course

## Architecture

### Server-Side Structure

```
server/modules/quizzes/
├── Quiz.js                  # Quiz schema/model
├── quizController.js        # Quiz business logic
├── quizRoutes.js            # Quiz API routes
├── SECURITY.md              # Detailed security documentation
└── README.md                # This file
```

### Client-Side Structure

```
client/src/modules/quizzes/
├── CreateQuiz.jsx           # Quiz creation form (tutor)
└── TakeQuiz.jsx             # Quiz-taking interface (student)
```

## API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/quizzes/course/:courseId` | Authenticated | Get all quizzes for a course |
| GET | `/api/quizzes/:id` | Authenticated | Get single quiz details |
| POST | `/api/quizzes` | Authenticated | Create new quiz |

**Note:** Currently missing:
- `POST /api/quizzes/:id/submit` - Server-side answer validation (recommended)
- `GET /api/quizzes/:id/results` - Quiz result retrieval (recommended)

## Data Models

### Quiz Schema

```javascript
{
  course_id: ObjectId,          // Reference to Course (required)
  title: String,                // Quiz title (required)
  questions: [{                 // Array of question objects
    question_text: String,      // Question content
    options: [String],          // Answer options
    correct_option_index: Number, // Index of correct answer (0-based)
    type: String                // 'Multiple Choice' or 'True/False'
  }],
  timer_limit: Number,          // Time limit in minutes (default: 30)
  createdAt: Date,              // Auto-generated
  updatedAt: Date               // Auto-generated
}
```

### Question Structure

```javascript
{
  question_text: "What is 2 + 2?",
  options: ["2", "3", "4", "5"],
  correct_option_index: 2,      // "4" is at index 2
  type: "Multiple Choice"
}
```

## Usage Examples

### Creating a Quiz (Tutor)

```javascript
POST /api/quizzes
Authorization: Bearer <token>
Content-Type: application/json

{
  "course_id": "507f1f77bcf86cd799439011",
  "title": "Week 3 Mathematics Quiz",
  "timer_limit": 20,
  "questions": [
    {
      "question_text": "What is 5 × 6?",
      "options": ["25", "30", "35", "40"],
      "correct_option_index": 1,
      "type": "Multiple Choice"
    },
    {
      "question_text": "Is π approximately 3.14?",
      "options": ["True", "False"],
      "correct_option_index": 0,
      "type": "True/False"
    }
  ]
}
```

### Getting Quizzes for a Course

```javascript
GET /api/quizzes/course/507f1f77bcf86cd799439011
Authorization: Bearer <token>

Response:
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "course_id": "507f1f77bcf86cd799439011",
    "title": "Week 3 Mathematics Quiz",
    "questions": [...],
    "timer_limit": 20,
    "createdAt": "2026-02-15T10:00:00Z",
    "updatedAt": "2026-02-15T10:00:00Z"
  }
]
```

### Taking a Quiz (Student)

```javascript
GET /api/quizzes/507f1f77bcf86cd799439012
Authorization: Bearer <token>

Response:
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "Week 3 Mathematics Quiz",
  "timer_limit": 20,
  "questions": [
    {
      "question_text": "What is 5 × 6?",
      "options": ["25", "30", "35", "40"],
      "correct_option_index": 1,  // ⚠️ SECURITY ISSUE: Exposed to client!
      "type": "Multiple Choice"
    }
  ]
}
```

**Note:** Currently, the entire quiz including correct answers is sent to the client. See [SECURITY.md](./SECURITY.md) for details.

## Security Features

### Implemented Security Controls

1. **NoSQL Injection Prevention**
   - All ObjectId parameters validated with `mongoose.Types.ObjectId.isValid()`
   - Converted to ObjectId objects before queries
   - Invalid IDs rejected with 400 Bad Request

2. **Input Validation & Sanitization**
   - Title validated as non-empty string
   - Questions validated as non-empty array
   - Timer limit validated as number
   - All text fields trimmed
   - Options array sanitized

3. **Authentication**
   - JWT-based authentication on all endpoints
   - `protect` middleware on all routes
   - No public access to quiz data

4. **XSS Protection**
   - React's built-in escaping
   - No `dangerouslySetInnerHTML` usage
   - Text content properly escaped

5. **Array Validation**
   - Questions array type-checked
   - Options array sanitized
   - Individual elements validated

### Known Security Issues

**⚠️ CRITICAL:** For detailed security concerns and vulnerabilities, see [SECURITY.md](./SECURITY.md).

**Major Issues:**
1. **Correct Answers Exposed** - All answers sent to client (HIGH severity)
2. **Client-Side Validation** - Scoring done in browser (HIGH severity)
3. **No Result Persistence** - Scores not saved (MEDIUM severity)
4. **Missing Authorization** - No course ownership checks (MEDIUM severity)
5. **No Enrollment Verification** - Anyone can view any quiz (MEDIUM severity)

## Frontend Components

### CreateQuiz Component (`CreateQuiz.jsx`)

**Features:**
- Quiz title input field
- Timer limit input (minutes)
- Dynamic question management
- Add/remove questions
- Multiple options per question
- Radio button to mark correct answer
- Add unlimited options
- Form submission to API

**State Management:**
```javascript
const [title, setTitle] = useState('');
const [timer, setTimer] = useState(30);
const [questions, setQuestions] = useState([
  {
    question_text: '',
    options: ['', ''],
    correct_option_index: 0,
    type: 'Multiple Choice'
  }
]);
```

**Validation:**
- HTML5 `required` attributes
- Client-side form validation
- Empty field prevention

### TakeQuiz Component (`TakeQuiz.jsx`)

**Features:**
- Fetches quiz by ID
- Displays quiz title and timer limit
- Renders all questions with radio buttons
- Tracks user answers
- Client-side score calculation
- Result screen with percentage
- Navigation back to course

**Flow:**
1. Component mounts → Fetch quiz
2. Student selects answers → Update state
3. Student submits → Calculate score locally
4. Show result screen → Display score and percentage
5. Navigate back → Return to course

**State Management:**
```javascript
const [quiz, setQuiz] = useState(null);
const [answers, setAnswers] = useState({});  // { 0: 2, 1: 0, 2: 1 }
const [result, setResult] = useState(null);
```

**Scoring Logic (Client-Side):**
```javascript
let score = 0;
quiz.questions.forEach((q, index) => {
  if (answers[index] === q.correct_option_index) {
    score++;
  }
});
const percentage = (score / quiz.questions.length) * 100;
```

## Business Logic

### Quiz Creation Flow

```
1. Tutor navigates to /courses/:courseId/create-quiz
2. Fills quiz title, timer, questions, and options
3. Marks correct answer for each question
4. Submits form
   ↓
5. POST /api/quizzes with quiz data
   ↓
6. Server validates:
   - ObjectId for course_id
   - Title is non-empty string
   - Questions is non-empty array
   - Timer_limit is number (optional)
   ↓
7. Server sanitizes:
   - Trim title
   - Trim all question_text values
   - Trim all options
   - Convert options to string array
   ↓
8. Create quiz in database
9. Return quiz object
10. Redirect to course page
```

### Quiz Taking Flow

```
1. Student navigates to /quizzes/:id
2. TakeQuiz component fetches quiz data
   ↓
3. GET /api/quizzes/:id
4. Server returns FULL quiz (including correct answers) ⚠️
   ↓
5. Student views questions and selects answers
6. Student submits quiz
   ↓
7. Client-side scoring:
   - Compare answers to correct_option_index
   - Calculate score and percentage
   - NO server communication ⚠️
   ↓
8. Display result screen
9. Result NOT saved to database ⚠️
```

### Timer Implementation

**Current State:**
- Timer displayed in UI (`timer_limit` from database)
- **No enforcement** - UI only
- Students can ignore timer
- No server-side validation of submission time

**Recommended Enhancement:**
- Store quiz start timestamp
- Validate submission time server-side
- Reject submissions after timer expires
- Add countdown timer in UI

## Error Handling

### Common Errors

| Error Code | Message | Cause |
|------------|---------|-------|
| 400 | Invalid course id | Malformed course ObjectId |
| 400 | Invalid quiz id | Malformed quiz ObjectId |
| 400 | Invalid quiz title | Empty or non-string title |
| 400 | Questions must be a non-empty array | Missing or empty questions |
| 400 | Invalid timer limit | Non-number timer value |
| 401 | Unauthorized | Missing or invalid JWT token |
| 404 | Quiz not found | Quiz doesn't exist |
| 500 | Internal server error | Database or server error |

## Dependencies

### Server-Side
- `mongoose` - MongoDB ODM with ObjectId validation
- `express` - Web framework
- `jsonwebtoken` - JWT authentication (via middleware)

### Client-Side
- `react` - UI framework
- `react-router-dom` - Routing (`useParams`, `useNavigate`)
- `axios` - HTTP client (via `api.js`)
- `lucide-react` - Icons (Plus, Trash)

## Known Limitations

### Functional Limitations

1. **No Quiz Result Storage**
   - Scores not saved to database
   - No historical record of attempts
   - Cannot view past results
   - No analytics or reporting

2. **No Question Bank**
   - Cannot reuse questions
   - No question templates
   - Must manually create each question

3. **Limited Question Types**
   - Only multiple-choice supported
   - True/False is a subset of multiple-choice
   - No text input, matching, or essay questions

4. **No Random Order**
   - Questions always in same order
   - Options always in same order
   - Enables pattern memorization

5. **No Attempt Limits**
   - Students can retake infinitely
   - No restriction on attempts
   - No cooldown period

6. **No Partial Credit**
   - All-or-nothing scoring
   - No points for partial answers
   - Binary correct/incorrect

### Security Limitations

See [SECURITY.md](./SECURITY.md) for comprehensive security analysis.

**Critical Issues:**
- Correct answers visible in client
- Client-side score calculation
- Missing authorization checks
- No enrollment verification

## Testing

### Manual Testing Checklist

**Quiz Creation:**
- [ ] Create quiz with valid data
- [ ] Create quiz with empty title → Should fail
- [ ] Create quiz with no questions → Should fail
- [ ] Create quiz with invalid timer → Should fail
- [ ] Add/remove questions dynamically
- [ ] Add multiple options to questions
- [ ] Mark different options as correct

**Quiz Taking:**
- [ ] View quiz without authentication → Should fail
- [ ] Take quiz and submit all answers
- [ ] Submit quiz with some answers missing
- [ ] View correct score and percentage
- [ ] Check browser console for quiz.questions → Can see answers ⚠️
- [ ] Navigate back to course

**Security Testing:**
- [ ] Attempt NoSQL injection in courseId
- [ ] Submit XSS payloads in title/questions
- [ ] View quiz for course not enrolled in → Currently works ⚠️
- [ ] Create quiz for course not teaching → Currently works ⚠️
- [ ] Manipulate score in browser console → Currently works ⚠️

## Troubleshooting

### Common Issues

**Issue:** "Invalid course id" error when creating quiz
- **Solution:** Verify courseId is valid 24-character hex ObjectId
- **Check:** courseId from URL parameter is correct

**Issue:** Quiz not appearing after creation
- **Solution:** Check if quiz was actually created in database
- **Check:** Server logs for errors, verify courseId matches

**Issue:** Cannot submit quiz (no button reaction)
- **Solution:** Ensure all required questions are answered
- **Check:** Check browser console for JavaScript errors

**Issue:** Score shows 0% even with correct answers
- **Solution:** Verify `correct_option_index` matches option array indices
- **Check:** Indices are 0-based (first option is 0, not 1)

**Issue:** Students can see correct answers in browser
- **Solution:** This is a known security issue - see SECURITY.md
- **Fix:** Implement server-side answer validation

## Performance Considerations

1. **Quiz Size**
   - No limit on number of questions
   - Large quizzes (100+ questions) may cause slow rendering
   - Consider pagination for very long quizzes

2. **Data Transfer**
   - Entire quiz loaded at once
   - No lazy loading of questions
   - Large option arrays may increase payload size

3. **Database Queries**
   - No indexes specified on Quiz collection
   - Consider adding index on `course_id` for faster lookup
   - Add index on `createdAt` for sorting

4. **Caching**
   - No caching implemented
   - Quiz data fetched on every page load
   - Consider client-side caching for repeated access

## Future Enhancements

### High Priority (Security)

1. **Server-Side Answer Validation** ⚠️
   - Create QuizResult model
   - POST /api/quizzes/:id/submit endpoint
   - Store student answers and scores
   - Return only score, not correct answers

2. **Authorization Controls** ⚠️
   - Verify tutor owns course before quiz creation
   - Verify student enrolled before quiz access
   - Role-based access control

3. **Remove Answer Exposure** ⚠️
   - Strip correct_option_index from client response
   - Only send answers during grading on server

### Medium Priority (Features)

4. **Quiz Results Dashboard**
   - View past quiz attempts
   - Track student progress
   - Analytics and statistics

5. **Question Bank**
   - Reusable question library
   - Tag questions by topic
   - Random question selection

6. **Timer Enforcement**
   - Real-time countdown timer
   - Auto-submit on timeout
   - Server-side time validation

7. **Attempt Limits**
   - Configure max attempts per quiz
   - Cooldown between attempts
   - Lock quiz after max attempts

### Low Priority (Enhancements)

8. **Question Randomization**
   - Shuffle question order
   - Shuffle option order
   - Prevent cheating via order

9. **Additional Question Types**
   - Short answer / text input
   - Matching questions
   - Multiple select (check all that apply)
   - Fill in the blank

10. **Partial Credit**
    - Point values per question
    - Weighted scoring
    - Partial credit for close answers

11. **Quiz Preview**
    - Preview mode for tutors
    - Test quiz before publishing
    - Edit after creation

12. **Export/Import**
    - Export quizzes to JSON
    - Import from CSV/JSON
    - Bulk question upload

## API Integration

### Using the Quiz API

```javascript
import api from './API/api';

// Create a quiz
const createQuiz = async (courseId, quizData) => {
  const response = await api.post('/quizzes', {
    course_id: courseId,
    title: quizData.title,
    timer_limit: quizData.timer,
    questions: quizData.questions
  });
  return response.data;
};

// Get quizzes for a course
const getCourseQuizzes = async (courseId) => {
  const response = await api.get(`/quizzes/course/${courseId}`);
  return response.data;
};

// Get quiz by ID
const getQuiz = async (quizId) => {
  const response = await api.get(`/quizzes/${quizId}`);
  return response.data;
};

// Submit quiz (recommended - not implemented)
const submitQuiz = async (quizId, answers) => {
  const response = await api.post(`/quizzes/${quizId}/submit`, { answers });
  return response.data;
};
```

## Contributing

When contributing to this module:

1. Review [SECURITY.md](./SECURITY.md) for security guidelines
2. Address critical security issues before adding features
3. Implement server-side answer validation
4. Add authorization checks
5. Write tests for new functionality
6. Update documentation

## License

This module is part of the SimplyLearn platform.

---

**Last Updated:** February 17, 2026
**Version:** 1.0.0
**Maintainers:** SimplyLearn Development Team

**⚠️ IMPORTANT SECURITY NOTICE:**
This module has critical security vulnerabilities related to answer exposure and client-side validation. Review [SECURITY.md](./SECURITY.md) before deploying to production.
