# Assignments Module

## Overview

The Assignments module provides a comprehensive system for managing course assignments, student submissions, and grading within the SimplyLearn platform. This module supports multiple submission types (text entry and file uploads), deadline tracking, late submission handling, and role-based access for students and tutors.

## Features

### For Students
- View all assignments for enrolled courses
- Submit assignments with text entries and/or file attachments
- Track submission status (pending, submitted, late, graded)
- View grades and feedback from tutors
- Resubmit assignments before grading
- Download submitted files

### For Tutors
- Create assignments for courses they teach
- Set deadlines and point values
- View all student submissions
- Track submission statistics (pending grades, total submissions)
- Grade submissions with numeric scores and written feedback
- Download student-submitted files
- Monitor late submissions

### For Admins
- Full access to all tutor capabilities
- Create assignments for any course
- Override authorization restrictions

## Architecture

### Server-Side Structure

```
server/modules/assignments/
├── Assignment.js              # Assignment schema/model
├── Submission.js              # Submission schema/model
├── assignmentController.js    # Assignment business logic
├── submissionController.js    # Submission handling & file uploads
├── assignmentRoutes.js        # Assignment API routes
├── submissionRoutes.js        # Submission API routes
├── SECURITY.md                # Detailed security documentation
└── README.md                  # This file
```

### Client-Side Structure

```
client/src/modules/assignments/
├── Assignments.jsx            # Assignment list view (student/tutor)
├── AssignmentDetails.jsx      # Assignment details & submission interface
└── CreateAssignment.jsx       # Assignment creation form (tutor/admin)
```

## API Endpoints

### Assignment Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/assignments/student/my` | Student | Get all assignments for enrolled courses |
| GET | `/api/assignments/tutor/my` | Tutor/Admin | Get all assignments for courses taught |
| GET | `/api/assignments/course/:courseId` | Authenticated | Get assignments for specific course |
| GET | `/api/assignments/:id` | Authenticated | Get single assignment details |
| POST | `/api/assignments` | Tutor/Admin | Create new assignment |

### Submission Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/submissions` | Student | Submit assignment (with file upload) |
| GET | `/api/submissions/assignment/:assignmentId` | Tutor/Admin | Get all submissions for assignment |
| GET | `/api/submissions/my/:assignmentId` | Student | Get own submission for assignment |
| PUT | `/api/submissions/:id/grade` | Tutor/Admin | Grade a submission |

## Data Models

### Assignment Schema

```javascript
{
  course_id: ObjectId,      // Reference to Course
  title: String,            // Assignment title (required)
  instructions: String,     // Assignment instructions
  deadline: Date,           // Submission deadline (required)
  max_points: Number,       // Maximum points (default: 100)
  createdAt: Date,          // Auto-generated
  updatedAt: Date           // Auto-generated
}
```

### Submission Schema

```javascript
{
  assignment_id: ObjectId,   // Reference to Assignment (required)
  student_id: ObjectId,      // Reference to User (required)
  file_url: String,          // Path to uploaded file
  text_entry: String,        // Text submission content
  submission_date: Date,     // Submission timestamp (default: now)
  grade: Number,             // Numeric grade
  feedback: String,          // Tutor feedback
  createdAt: Date,           // Auto-generated
  updatedAt: Date            // Auto-generated
}
```

## Usage Examples

### Creating an Assignment (Tutor)

```javascript
POST /api/assignments
Authorization: Bearer <token>
Content-Type: application/json

{
  "course_id": "507f1f77bcf86cd799439011",
  "title": "Week 5 Programming Assignment",
  "instructions": "Implement a binary search tree with insert and delete operations",
  "deadline": "2026-03-01T23:59:00Z",
  "max_points": 100
}
```

### Submitting an Assignment (Student)

```javascript
POST /api/submissions
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "assignment_id": "507f1f77bcf86cd799439011",
  "text_entry": "I implemented the BST with all required methods...",
  "file": <binary file data>
}
```

### Grading a Submission (Tutor)

```javascript
PUT /api/submissions/507f1f77bcf86cd799439012/grade
Authorization: Bearer <token>
Content-Type: application/json

{
  "grade": 85,
  "feedback": "Great implementation! Consider edge cases for deletion."
}
```

## File Upload Configuration

### Supported File Types
- PDF (`.pdf`)
- Microsoft Word (`.doc`, `.docx`)
- PowerPoint (`.pptx`)
- ZIP archives (`.zip`)

### Upload Settings
- **Storage:** Files saved to `/uploads/` directory
- **Naming:** Timestamp-based (`{timestamp}.{extension}`)
- **Validation:** Extension whitelist + case-insensitive checking
- **Size Limit:** 10MB (configurable)

### File Security
- Type validation prevents executable uploads
- Server-side filename generation prevents path traversal
- Files stored in dedicated directory outside application code

## Security Features

The Assignments module implements comprehensive security measures. For detailed information, see [SECURITY.md](./SECURITY.md).

### Key Security Controls

1. **NoSQL Injection Prevention** - All MongoDB ObjectIds validated
2. **XSS Protection** - HTML sanitization on all text inputs
3. **File Upload Security** - Strict file type whitelisting
4. **Authorization** - Role-based access control (Student/Tutor/Admin)
5. **Input Validation** - Type checking and sanitization on all inputs
6. **Authentication** - JWT-based authentication on all endpoints
7. **Data Integrity** - Server-controlled timestamps
8. **Secure Data Exposure** - Selective field population

## Frontend Components

### Assignments List (`Assignments.jsx`)

Displays different views based on user role:

**Student View:**
- List of assignments from enrolled courses
- Submission status indicators (Submitted, Late, Overdue, Pending)
- Deadline information
- Grade display (if graded)

**Tutor View:**
- List of assignments for courses taught
- Submission statistics (total submissions, pending grades)
- Quick access to grading interface

### Assignment Details (`AssignmentDetails.jsx`)

**Components:**
- `AssignmentHeader` - Displays assignment metadata
- `StudentSubmissionView` - Submission form and status
- `TutorSubmissionView` - Grading interface and submission list

**Student Features:**
- Text entry textarea
- File upload with drag-and-drop
- Submission status display
- Grade and feedback viewing
- Resubmission capability (before grading)

**Tutor Features:**
- View all student submissions
- Inline grading interface
- Download student files
- Late submission indicators
- Bulk grading support

### Create Assignment (`CreateAssignment.jsx`)

Form for tutors/admins to create assignments:
- Title input
- Instructions textarea
- Deadline picker (datetime-local)
- Max points input (default: 100)
- Course context from URL parameter

## Business Logic

### Late Submission Handling

1. **Deadline Comparison:**
   - Compare `submission_date` with assignment `deadline`
   - Mark as late if `submission_date > deadline`

2. **UI Indicators:**
   - Red badge for late submissions
   - Yellow badge for pending submissions
   - Green badge for on-time submissions

3. **Grading:**
   - Late submissions can still be graded
   - No automatic penalty (tutor discretion)
   - Late status visible to tutor

### Resubmission Policy

1. **Allowed:** Before assignment is graded
2. **Updates:** File, text entry, and submission timestamp
3. **Restricted:** After grading is complete
4. **Preservation:** Previous submission data overwritten

### Authorization Flow

```
Student submits assignment
    ↓
1. Verify student is authenticated
    ↓
2. Validate assignment exists
    ↓
3. Check student is enrolled in course
    ↓
4. Check for existing submission
    ↓
5. Update or create submission
    ↓
6. Return submission data
```

```
Tutor grades submission
    ↓
1. Verify tutor is authenticated
    ↓
2. Validate submission exists
    ↓
3. Get assignment from submission
    ↓
4. Verify tutor teaches the course (or is admin)
    ↓
5. Update grade and feedback
    ↓
6. Return updated submission
```

## Error Handling

### Common Errors

| Error Code | Message | Cause |
|------------|---------|-------|
| 400 | Invalid assignment id | Malformed ObjectId |
| 400 | Title is required | Missing assignment title |
| 400 | Invalid course id | Malformed course ObjectId |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Not authorized to add assignments | User doesn't teach the course |
| 404 | Assignment not found | Assignment doesn't exist |
| 404 | Course not found | Course doesn't exist |
| 500 | Internal server error | Database or server error |

## Dependencies

### Server-Side
- `mongoose` - MongoDB ODM with ObjectId validation
- `multer` - File upload handling
- `sanitize-html` - XSS prevention
- `express` - Web framework

### Client-Side
- `react` - UI framework
- `react-router-dom` - Routing
- `axios` - HTTP client
- `lucide-react` - Icons

## Testing

### Manual Testing Checklist

**Assignment Creation:**
- [ ] Tutor can create assignment for their course
- [ ] Tutor cannot create assignment for other's course
- [ ] Admin can create assignment for any course
- [ ] Required fields are validated

**Submission:**
- [ ] Student can submit with text only
- [ ] Student can submit with file only
- [ ] Student can submit with both text and file
- [ ] File type validation works
- [ ] Resubmission updates timestamp

**Grading:**
- [ ] Tutor can grade submissions for their courses
- [ ] Grade and feedback are saved correctly
- [ ] Student can view grade and feedback
- [ ] Resubmission disabled after grading

**Authorization:**
- [ ] Unauthenticated users get 401
- [ ] Students can't access tutor endpoints
- [ ] Cross-course access is blocked

## Troubleshooting

### Common Issues

**Issue:** File upload fails with "File type not allowed"
- **Solution:** Ensure file extension is in whitelist (pdf, doc, docx, pptx, zip)
- **Check:** File extension is lowercase in validation

**Issue:** "Invalid assignment id" error
- **Solution:** Verify ObjectId format (24 hex characters)
- **Check:** Frontend is sending string, not object

**Issue:** Student can't see assignments
- **Solution:** Verify student is enrolled in course
- **Check:** Enrollment collection has student_id and course_id

**Issue:** Tutor can't grade submission
- **Solution:** Verify tutor teaches the course
- **Check:** Course.tutor_id matches authenticated user

## Performance Considerations

1. **Indexes:** Ensure indexes on:
   - `Assignment.course_id`
   - `Submission.assignment_id`
   - `Submission.student_id`

2. **Pagination:** For courses with many assignments, implement pagination

3. **File Storage:** Consider cloud storage (S3, GCS) for production

4. **Caching:** Cache assignment lists for frequently accessed courses

## Future Enhancements

1. **Rubric Support** - Define grading criteria with point distributions
2. **Peer Review** - Allow students to review each other's work
3. **Draft Submissions** - Save work-in-progress without submitting
4. **Plagiarism Detection** - Integrate with plagiarism checking services
5. **Bulk Operations** - Export grades, bulk download submissions
6. **Rich Text Editor** - Support formatted text in submissions
7. **Assignment Templates** - Reuse assignment structures
8. **Anonymous Grading** - Hide student identity during grading
9. **Group Assignments** - Support collaborative submissions
10. **Analytics Dashboard** - Visualize submission and grading trends

## Contributing

When contributing to this module:

1. Review [SECURITY.md](./SECURITY.md) for security guidelines
2. Maintain consistent error handling patterns
3. Add validation for all user inputs
4. Update tests for new functionality
5. Document API changes in this README

## License

This module is part of the SimplyLearn platform.

---

**Last Updated:** February 17, 2026
**Version:** 1.0.0
**Maintainers:** SimplyLearn Development Team
