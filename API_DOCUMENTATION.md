# Nursery Management System - Backend API Documentation

Welcome to the **Nursery Management System RESTful API**.
This backend is built with **Node.js, Express.js, PostgreSQL, and Prisma ORM**, secured via **JWT** and **bcrypt**.

Base URL: `http://localhost:5000/api`

---

## 1. System Health
### `GET /health`
- **Access:** Public
- **Description:** Verifies that the server is online and healthy.
- **Response:** `200 OK`
```json
{ "status": "ok" }
```

---

## 2. Authentication & Parent Registration
### `POST /auth/register` (Create Your Parent Account)
- **Access:** Public (Parents / Guardians)
- **Body (Matching the Parent Registration page):**
```json
{
  "fullName": "Mariam Al-Mansoor",
  "emailAddress": "mariam.mansoor@example.com",
  "phoneNumber": "+1 (555) 019-8234",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123"
}
```
- **Error Scenarios & Responses (Matching UI States):**

#### 1. `Required Fields Error` (Status `400 Bad Request`):
```json
{
  "error": "Please fill in all required fields.",
  "code": "REQUIRED_FIELDS_ERROR",
  "errors": {
    "fullName": "Please enter your full name",
    "emailAddress": "Please enter your email address",
    "phoneNumber": "Please enter your phone number",
    "password": "Please enter a password",
    "confirmPassword": "Please confirm your password"
  }
}
```

#### 2. `Email Already Registered` (Status `409 Conflict`):
```json
{
  "error": "This email is already registered",
  "code": "EMAIL_ALREADY_REGISTERED",
  "alert": {
    "title": "This email is already registered",
    "message": "An account with this email already exists. Please log in or reset your password.",
    "action": { "label": "Log In here", "link": "/login" }
  },
  "errors": {
    "emailAddress": "This email address is already registered. Please log in."
  }
}
```

#### 3. `Invalid Email` (Status `400 Bad Request`):
```json
{
  "error": "Please enter a valid email address.",
  "code": "INVALID_EMAIL",
  "errors": {
    "emailAddress": "Please enter a valid email address."
  }
}
```

#### 4. `Password Mismatch` (Status `400 Bad Request`):
```json
{
  "error": "Passwords do not match.",
  "code": "PASSWORD_MISMATCH",
  "errors": {
    "confirmPassword": "Passwords do not match"
  }
}
```

#### 5. `Registration Failed / Server Error` (Status `500`):
```json
{
  "error": "Unable to create your account right now. Please try again.",
  "code": "REGISTRATION_FAILED",
  "alert": {
    "title": "Unable to create your account right now. Please try again.",
    "message": "If the issue persists, please check your network connection or contact our admissions support team."
  }
}
```
- **Response:** `201 Created`
```json
{
  "success": true,
  "message": "Parent account created successfully! Welcome to Tom & Jerry Nursery.",
  "token": "eyJhbGciOi...",
  "user": {
    "id": "uuid",
    "name": "Mariam Al-Mansoor",
    "email": "mariam.mansoor@example.com",
    "phone": "+1 (555) 019-8234",
    "role": "PARENT",
    "isActive": true,
    "createdAt": "2026-10-12T..."
  }
}
```

### `POST /auth/login` (Parent / Staff Login)
- **Access:** Public
- **Body:**
```json
{
  "emailAddress": "mariam.mansoor@example.com",
  "password": "SecurePassword123",
  "rememberMe": true
}
```

- **Login States & Error Responses (Matching UI):**

#### 1. `Required Fields Error` (Status `400 Bad Request`):
```json
{
  "error": "Please enter your email and password.",
  "code": "REQUIRED_FIELDS_ERROR",
  "errors": {
    "emailAddress": "Please enter your email address",
    "password": "Please enter your password"
  }
}
```

#### 2. `Invalid Email or Password` (Status `401 Unauthorized`):
```json
{
  "error": "Invalid Email or Password",
  "code": "INVALID_CREDENTIALS",
  "alert": {
    "title": "Invalid Email or Password",
    "message": "The credentials you entered do not match our records. Please double check and try again."
  },
  "errors": {
    "emailAddress": "Incorrect email or password"
  }
}
```

#### 3. `Login Successful!` (Status `200 OK`):
```json
{
  "success": true,
  "scenario": "Success State",
  "title": "Login Successful!",
  "message": "Welcome back to Tom & Jerry Nursery. Redirecting to your dashboard...",
  "dashboard": {
    "title": "Parent Portal Access Ready",
    "details": "You can now review your active enrollment status, daily schedule updates, and communication logs.",
    "redirectUrl": "/parent/dashboard"
  },
  "actions": {
    "continueToDashboard": { "label": "Continue to Dashboard", "href": "/parent/dashboard" },
    "switchAccount": { "label": "Switch Account", "href": "/login" }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Mariam Al-Mansoor",
    "email": "mariam.mansoor@example.com",
    "phone": "+1 (555) 019-8234",
    "role": "PARENT",
    "isActive": true
  }
}
```

### `GET /auth/me`
- **Access:** Authenticated (`Bearer <TOKEN>`)
- **Description:** Returns the logged-in user profile, role, phone, and linked children.
- **Response:** `200 OK`

---

## 3. Nursery Programs & Features (Public / Admin)
### `GET /programs`
- **Access:** Public (Anyone can explore nursery activities & programs)
- **Response:** `200 OK` (Array of programs)

### `GET /programs/:id`
- **Access:** Public

### `POST /programs`
- **Access:** Admin only (`Bearer <TOKEN>`)
- **Body:**
```json
{
  "title": "Creative Sensory Play",
  "description": "Sensory exploration, finger painting, and music.",
  "ageGroup": "1 - 3 Years",
  "schedule": "Mon - Thu, 9:00 AM - 11:30 AM"
}
```

### `PUT /programs/:id`
- **Access:** Admin only (`Bearer <TOKEN>`)

### `DELETE /programs/:id`
- **Access:** Admin only (`Bearer <TOKEN>`)

---

## 4. Announcements & Board Updates (Public / Admin)
### `GET /announcements`
- **Access:** Public / Parents

### `POST /announcements`
- **Access:** Admin only (`Bearer <TOKEN>`)
- **Body:**
```json
{
  "title": "Spring Festival Next Week",
  "content": "Join us on Sunday for fun games and costumes!",
  "category": "EVENT"
}
```

### `DELETE /announcements/:id`
- **Access:** Admin only (`Bearer <TOKEN>`)

---

## 5. Admin - User Management
*Requires `Authorization: Bearer <ADMIN_TOKEN>`*

### `GET /admin/users`
- **Query params:** `?role=TEACHER` or `?role=PARENT` (optional)
- **Description:** Returns all teachers and parents (automatically hides the Admin).

### `POST /admin/users`
- **Body:**
```json
{
  "name": "Jane Teacher",
  "email": "jane@nursery.com",
  "password": "password123",
  "role": "TEACHER"
}
```

### `PUT /admin/users/:id`
- **Body:** `{ "name": "Jane New", "role": "TEACHER" }`

### `PATCH /admin/users/:id/status`
- **Description:** Toggles active/inactive status with protection against self-deactivation.

### `DELETE /admin/users/:id`
- **Access:** Admin only (`Bearer <ADMIN_TOKEN>`)
- **Description:** Permanently deletes a user account (Teacher or Parent) along with their related records. Protected against self-deleting the admin account.
- **Response:** `204 No Content`

---

## 6. Admin - Child Management
*Requires `Authorization: Bearer <ADMIN_TOKEN>`*

### `GET /admin/children`
- Returns all enrolled children with their linked parent information.

### `GET /admin/children/:id`
- Returns a single child by ID.

### `POST /admin/children`
- **Body:**
```json
{
  "firstName": "Leo",
  "lastName": "Miller",
  "dateOfBirth": "2023-05-14",
  "gender": "Male",
  "parentId": "USER_UUID"
}
```

### `PUT /admin/children/:id`
- Updates child details or reassigns parent.

### `DELETE /admin/children/:id`
- Deletes child record with cascading dependencies.

---

## 7. Attendance Tracking
*Requires `Authorization: Bearer <TOKEN>`*

### `POST /attendance`
- **Access:** Teacher or Admin
- **Description:** Record single or batch daily attendance.
- **Body (Batch):**
```json
{
  "records": [
    { "childId": "CHILD_UUID_1", "status": "PRESENT", "notes": "Active and playful" },
    { "childId": "CHILD_UUID_2", "status": "ABSENT", "notes": "Sick note submitted" }
  ]
}
```

### `GET /attendance?date=YYYY-MM-DD`
- **Access:** Teacher or Admin
- **Description:** View roll call by date or child.

### `GET /attendance/my-children`
- **Access:** Parent only
- **Description:** View attendance history for the logged-in parent's kids.

---

## 8. Parent Portal APIs
*Requires `Authorization: Bearer <PARENT_TOKEN>`*

### `GET /parent/children`
- Returns only the children belonging to the authenticated parent.

### `GET /parent/profile`
- Returns the parent's profile details and count of enrolled children.

---

## 9. Teacher Classroom APIs
*Requires `Authorization: Bearer <TEACHER_TOKEN>`*

### `GET /teacher/children`
- Returns classroom children with parent contact information.

---

## 10. Admin - Class Management (`/api/classrooms`)
*Requires `Authorization: Bearer <ADMIN_TOKEN>`*

### `GET /classrooms/stats`
- Returns top 4 KPI cards and capacity distribution:
```json
{
  "totalClasses": 7,
  "activeClasses": 6,
  "assignedTeachers": 5,
  "withoutTeacher": 2,
  "totalChildren": 50,
  "totalCapacity": 93,
  "capacityDistribution": [...]
}
```

### `GET /classrooms`
- **Query Params:** `status=ACTIVE`, `academicYear=2026/2027`, `teacherFilter=ASSIGNED|UNASSIGNED`, `search=Nursery`
- Returns list of classrooms with computed `enrolled`, `availability`, `teacher`, and `status`.

### `GET /classrooms/:id`
- Returns classroom details with assigned teacher, children list, and sessions.

### `POST /classrooms`
- **Modal Add New Class:**
```json
{
  "name": "Nursery C - Meadow Robins",
  "description": "Morning toddler playroom focused on sensory play.",
  "capacity": 15,
  "academicYear": "2026/2027 • Term 1",
  "teacherId": "TEACHER_UUID",
  "status": "ACTIVE"
}
```

### `PUT /classrooms/:id`
- Update classroom details, capacity, or assigned teacher.

### `DELETE /classrooms/:id`
- Delete classroom (safely unassigns children first).

### `GET /classrooms/available-teachers`
- **Query Params:** `?includeAssigned=true`
- Returns list of teachers for the modal dropdown.

### `GET /classrooms/schedule/today`
- Returns today's active schedule sessions across rooms.

### `POST /classrooms/:id/enroll`
- Enroll child in classroom: `{ "childId": "UUID" }`

### `GET /classrooms/export-roster`
- Export full class roster with teachers and children.

---

## 11. Admin - Staff Management (`/api/staff`)
*Requires `Authorization: Bearer <ADMIN_TOKEN>`*

### `GET /staff/stats`
- Returns the 4 KPI cards & Regulatory Ratio:
  - `totalStaff` (Count, e.g. 14, `recentChange`: "+2 this term")
  - `teachers` (Count, e.g. 8, `percentage`: "57% of team")
  - `assignedTeachers` (Count, e.g. 6, `status`: "Optimal")
  - `unassigned` (Count, e.g. 2, `badge`: "Cover Pool")
  - `ratioCompliance` (British EYFS standard status)

### `GET /staff`
- **Query Params:**
  - `search`: Name, email, or phone
  - `role`: Filter by role ('Lead Teacher', 'Teacher', 'Early Educator', etc.)
  - `classId`: Filter by class ID, `UNASSIGNED`, or `ALL_ROOMS`
  - `status`: `ACTIVE`, `INACTIVE`, or `ALL`
  - `page`: Page number (default `1`)
  - `limit`: Rows per page (default `6`)
- Returns paginated staff list with avatar initials, phone, role, assigned class badge, and active status.

### `GET /staff/:id`
- Returns single staff details with assignments.

### `POST /staff`
- **Modal `+ Add New Staff` (Create Staff):**
```json
{
  "fullName": "Claire Bennett",
  "role": "Teacher (Nursery Staff)",
  "employmentType": "Full-Time Regular",
  "emailAddress": "claire.bennett@tomjerrynursery.com",
  "phoneNumber": "+1 (555) 914-7720",
  "assignedClassroom": "CLASS_UUID",
  "employmentStatus": "Active"
}
```
- **Response:** `201 Created`

### `GET /staff/roles`
- Returns roles for `Role *` dropdown:
```json
["Teacher (Nursery Staff)", "Lead Teacher", "Teacher", "Early Educator", "Assistant Teacher", "Nursery Nurse / First Aid", "Kindergarten Lead"]
```

### `GET /staff/employment-types`
- Returns types for `Employment Type` dropdown:
```json
["Full-Time Regular", "Part-Time Regular", "Contractor", "Temporary / Substitute"]
```

### `GET /staff/classrooms-dropdown`
- Returns classrooms for `Assigned Classroom` dropdown with `helperText`:
```json
[
  {
    "id": "uuid",
    "name": "Nursery C - Meadow Robins",
    "enrolled": 12,
    "capacity": 15,
    "helperText": "Class has 12 children enrolled"
  }
]
```

### `PUT /staff/:id`
- Update staff profile, contact, role, or class assignment.

### `PATCH /staff/:id/status`
- Toggles staff `Active` / `Inactive` status.

### `DELETE /staff/:id`
- Deletes staff member.

### `POST /staff/:id/assign-class`
- Assigns staff to specific class or `{ "scope": "ALL_ROOMS" }`.

### `POST /staff/:id/unassign`
- Unassigns staff and moves them to Cover Pool.

### `POST /staff/assign-cover`
- Assigns cover substitution (Bottom banner button).

### `GET /staff/schedule-logs`
- Schedule logs for EYFS ratio compliance (Bottom banner button).

### `GET /staff/export`
- Exports all staff members to JSON/CSV (Export button).

---

## 12. Public Nursery Landing Page (`/api/landing`)
*All endpoints here are Public and do NOT require an authentication token.*

### `GET /landing`
- **Description:** Returns all structured content for the public homepage matching the nursery design:
  - `nursery`: Name, badges, headlines, top announcement, opening hours, contact details.
  - `heroStats`: 200+ families count, 4.9/5 rating, British EYFS compliance, available seats.
  - `corePillars`: The 3 core pillars (*Warm Care*, *Early Discovery*, *Safe Community*).
  - `curriculum`: The 3 core programs (*Caring Environment*, *Learning Through Play*, *Creativity & Exploration*).
  - `facilities`: The 3 designed spaces (*Bright Play Studios*, *Outdoor Garden & Discovery*, *Cozy Rest & Quiet Zones*).
  - `ctaBanner`: CTA heading, description, and trust badges.
  - `footer`: Quick links, contact info, and legal links.

### `POST /landing/apply`
- **Description:** Public submission when parents click **`Apply for Admission`** on the landing page.
- **Body:**
```json
{
  "parentName": "Jennifer Aniston",
  "parentEmail": "jennifer.a@gmail.com",
  "parentPhone": "+1 (555) 777-1234",
  "childName": "Emma Aniston",
  "childDob": "2023-04-10",
  "childAge": "2.5 Years",
  "programInterested": "Learning Through Play (Toddler)",
  "preferredStartDate": "2026-11-01",
  "notes": "Looking for morning sessions."
}
```
- **Response:** `201 Created` (Returns confirmation and `applicationNumber`).

### `POST /landing/contact`
- **Description:** Public contact form submission for general inquiries.
- **Body:** `{ "name": "...", "email": "...", "phone": "...", "subject": "...", "message": "..." }`

---

## 13. Admin - Admission Requests Module (`/api/admissions`)
*Requires `Authorization: Bearer <ADMIN_TOKEN>`*

### `GET /admissions/stats`
- Returns admission requests overview: `{ "total": 12, "pending": 8, "approved": 3, "waitlisted": 1, "rejected": 0 }`.

### `GET /admissions`
- **Query Params:** `?status=PENDING&search=Emma&page=1&limit=10`
- Returns paginated parent applications.

### `GET /admissions/:id`
- Returns full details of a specific application.

### `PATCH /admissions/:id/status`
- Updates application status (`REVIEWING`, `APPROVED`, `WAITLISTED`, `REJECTED`).
- **Body:** `{ "status": "APPROVED", "notes": "Accepted for term 1" }`

### `DELETE /admissions/:id`
- Deletes an application.

---

## 14. Parent Portal - Admission Application & Real-time Status Tracking (`/api/admissions`)

### `GET /admissions/form-options`
- **Access:** Public / Parent Portal
- **Description:** Returns selectable dropdowns and official office guidance for the **Apply for Admission** form.
- **Response:** `200 OK`
```json
{
  "relationships": [
    { "id": "Mother", "label": "Mother" },
    { "id": "Father", "label": "Father" },
    { "id": "Legal Guardian", "label": "Legal Guardian" },
    { "id": "Other", "label": "Other" }
  ],
  "genders": [
    { "id": "Female", "label": "Female" },
    { "id": "Male", "label": "Male" }
  ],
  "requestedClasses": [
    { "id": "Toddlers (13-24 mo)", "label": "Toddlers (13-24 mo)", "ageRange": "13-24 months" },
    { "id": "Infants (0-12 mo)", "label": "Infants (0-12 mo)", "ageRange": "0-12 months" },
    { "id": "Preschool (2-3 yrs)", "label": "Preschool (2-3 yrs)", "ageRange": "2-3 years" },
    { "id": "Pre-K (3-5 yrs)", "label": "Pre-K (3-5 yrs)", "ageRange": "3-5 years" }
  ],
  "desiredTerms": [
    { "id": "Spring Term (Jan 2027)", "label": "Spring Term (Jan 2027)" },
    { "id": "Summer Term (Jun 2027)", "label": "Summer Term (Jun 2027)" },
    { "id": "Fall Term (Sep 2027)", "label": "Fall Term (Sep 2027)" },
    { "id": "Winter Term (Nov 2027)", "label": "Winter Term (Nov 2027)" }
  ],
  "officeGuidance": {
    "title": "Admissions Office Inquiries & Guidance",
    "description": "Need assistance with your application? Our Admissions Office is here to support you at admissions@tomjerrynursery.com or +1 (555) 019-8230.",
    "disclaimer": "Notice: Submitting this form records your admission request for review. It does not guarantee immediate placement or imply final enrollment."
  }
}
```

---

### `POST /admissions/portal-apply`
- **Access:** Parent Portal (`Authorization: Bearer <PARENT_TOKEN>`)
- **Description:** Submits or saves a draft admission request linked to the logged-in parent's session.
- **Request Body:**
```json
{
  "relationship": "Mother",
  "childName": "Adam Ahmed",
  "childDob": "2025-04-14",
  "gender": "Male",
  "requestedClass": "Toddlers (13-24 mo)",
  "desiredTerm": "Spring Term (Jan 2027)",
  "notes": "Enjoys music and sensory games, no known allergies.",
  "isDraft": false
}
```
- **Response:** `201 Created` (Matches "Submission Success" Screen)
```json
{
  "success": true,
  "message": "Admission Request Submitted Successfully!",
  "applicationNumber": "#TJ-ADM-2026-8492",
  "confirmationUrl": "/api/admissions/confirmation/%23TJ-ADM-2026-8492",
  "statusUrl": "/api/admissions/status/%23TJ-ADM-2026-8492",
  "trackingBreadcrumb": "Home / Admission Request / Confirmation",
  "breadcrumbs": ["Home", "Admission Request", "Confirmation"],
  "headerBadge": {
    "label": "RECEIVED & LOGGED",
    "status": "success",
    "icon": "check-circle"
  },
  "heroCard": {
    "icon": "check-circle",
    "title": "Admission Request Submitted Successfully!",
    "subtitle": "Thank you for applying to Tom & Jerry Nursery. Your child's admission request has been received and is waiting for review by our nursery team.",
    "statusBadge": { "label": "Pending Review", "color": "orange", "dot": true },
    "reassuranceNote": "Our team will review your application and update its status when a decision is made.",
    "disclaimerAlert": "Submission success confirms your request was safely received and does not imply final enrollment or immediate acceptance."
  },
  "applicationProgress": {
    "title": "Application Progress",
    "stepIndicator": "STEP 2 OF 3 ACTIVE",
    "currentStep": 2,
    "totalSteps": 3,
    "steps": [
      { "step": 1, "title": "Request Submitted", "subtitle": "Completed - Oct 14, 2026", "description": "All nursery paperwork received.", "isCompleted": true, "status": "completed" },
      { "step": 2, "title": "Under Review", "badge": "CURRENT", "subtitle": "In Progress by Admissions", "description": "Assessing roster availability.", "isCurrent": true, "status": "in_progress" },
      { "step": 3, "title": "Decision Made", "subtitle": "Upcoming Milestone", "description": "Written outcome via portal & email.", "status": "upcoming" }
    ]
  },
  "applicationSummary": {
    "title": "Application Summary",
    "referenceId": "#TJ-ADM-2026-8492",
    "grid": [
      { "id": "child_name", "label": "CHILD'S FULL LEGAL NAME", "value": "Adam Ahmed", "subtext": "Child DOB: Sept 12, 2024" },
      { "id": "parent_name", "label": "PARENT / GUARDIAN NAME", "value": "Sara Ahmed", "subtext": "Primary Contact & Billing" },
      { "id": "requested_program", "label": "REQUESTED PROGRAM / AGE GROUP", "value": "Toddlers (15-24 months)", "subtext": "Full Day • 5 Days / Week" },
      { "id": "desired_term", "label": "DESIRED START TERM", "value": "Spring Term (January 2027)", "subtext": "Submitted: October 14, 2026" }
    ],
    "noticeNote": "Provisional details are shown above for formal submission verification and parent record keeping.",
    "actions": [
      { "id": "view_status", "label": "View Application Status →", "primary": true, "url": "/admissions/status/%23TJ-ADM-2026-8492" },
      { "id": "back_portal", "label": "Back to Parent Portal", "primary": false, "url": "/parent/portal" }
    ]
  },
  "admissionsOffice": {
    "nurseryBrand": "Tom & Jerry",
    "badge": "ACCEPTING INTAKE",
    "title": "Admissions Office",
    "description": "Need assistance or have questions regarding your application? Our dedicated admissions counselors are here to help guide you through every milestone.",
    "contactItems": [
      { "type": "email", "label": "Email Admissions", "value": "admissions@tomjerrynursery.ae" },
      { "type": "phone", "label": "Direct Line", "value": "+1 (555) 019-8230" },
      { "type": "hours", "label": "Office Hours", "value": "Mon-Fri, 8:00 AM - 4:00 PM" }
    ],
    "pdfReceipt": {
      "label": "PDF Receipt Generated",
      "downloadLabel": "Download PDF",
      "downloadUrl": "/api/admissions/%23TJ-ADM-2026-8492/summary-pdf"
    }
  },
  "informationCards": [
    { "id": "confirmation_email", "icon": "mail", "title": "Confirmation Email", "description": "A detailed submission copy has been sent to your registered email address." },
    { "id": "visit_tour", "icon": "home", "title": "Nursery Visit & Tour", "description": "Our staff will coordinate an optional playdate tour once review completes." },
    { "id": "instant_updates", "icon": "bell", "title": "Instant Updates", "description": "Track decision updates 24/7 directly from your parent dashboard." }
  ]
}
```

---

### `GET /admissions/confirmation/:idOrAppNumber`
- **Access:** Public or Parent Portal
- **Description:** Returns the complete **Submission Success / Confirmation** screen data matching the confirmation UI.
- **URL Parameter:** `idOrAppNumber` (e.g. `%23TJ-ADM-2026-8492` or UUID)
- **Response:** `200 OK` (Same schema as `POST /portal-apply` response above)


---

### `GET /admissions/status/:idOrAppNumber`
- **Access:** Public or Parent Portal
- **Description:** Returns the complete rich status tracking screen data matching the **Admission Application Status** UI.
- **URL Parameter:** `idOrAppNumber` (e.g. `%23TJ-ADM-2026-8492` or UUID)
- **Response:** `200 OK`
```json
{
  "applicationNumber": "#TJ-ADM-2026-8492",
  "breadcrumbs": ["Home", "Admission Status", "#TJ-ADM-2026-8492"],
  "statusBanner": {
    "status": "Pending Review",
    "priority": "Queue Priority: Standard Intake",
    "title": "Your Application is Under Review",
    "description": "New admission request has been submitted successfully and is waiting for our nursery team to review cohort availability and developmental alignment.",
    "estimatedWindow": "3-5 Business Days",
    "stageIndicator": "Stage 2 of 3",
    "importantAdvisory": "Important Advisory: Submission confirmation does not imply final admission or enrollment acceptance. You will be notified immediately via registered email and this portal upon any status change."
  },
  "journeyMilestones": [
    {
      "step": 1,
      "title": "Request Submitted",
      "stageLabel": "Stage 1 - Completed",
      "isCompleted": true,
      "isCurrent": false,
      "date": "October 14, 2026",
      "description": "Form entries, developmental notes, and family records logged on October 14, 2026."
    },
    {
      "step": 2,
      "title": "Under Review",
      "stageLabel": "Stage 2 - In Progress",
      "isCompleted": false,
      "isCurrent": true,
      "currentBadge": "Current",
      "description": "Admissions team actively reviewing child age group cohort placement, staff-to-child ratios, and facility capacity."
    },
    {
      "step": 3,
      "title": "Decision Made",
      "stageLabel": "Stage 3 - Upcoming",
      "isCompleted": false,
      "isCurrent": false,
      "description": "Written notification dispatched to Sara Ahmed's registered email and displayed instantly on this parent portal."
    }
  ],
  "applicationDetails": {
    "applicationNumber": "#TJ-ADM-2026-8492",
    "child": { "name": "Adam Ahmed", "age": "Age: 18 months", "initials": "AA" },
    "parent": { "name": "Sara Ahmed", "role": "Primary Contact", "initials": "SA" },
    "submissionDate": "October 14, 2026",
    "targetGroup": "Toddlers (13-24 mo)",
    "cohortRoom": "Butterflies Cohort Room 2",
    "desiredIntake": "Spring Term (Jan 2027)",
    "sessionSchedule": "Full-day Session Schedule",
    "lastRegistrySync": "Today at 09:42 AM"
  },
  "quickActions": [
    { "id": "view_details", "label": "View Application Details", "primary": true },
    { "id": "back_portal", "label": "Back to Parent Portal", "url": "/parent/portal" },
    { "id": "download_pdf", "label": "Download Application (PDF)", "size": "248 KB" }
  ],
  "whatHappensNext": [
    {
      "stepNumber": 1,
      "title": "Document Verification & Eligibility Check",
      "description": "Admissions coordinators review child immunization records, birth certificates, and special dietary/allergy accommodations submitted during registration."
    },
    {
      "stepNumber": 2,
      "title": "Age-Group Cohort Space Assessment",
      "description": "The Head Nursery Educator reviews existing toddler classroom rosters to confirm balances to ensure focused 1-on-1 developmental support and safety compliance."
    },
    {
      "stepNumber": 3,
      "title": "Meet & Greet Invitation",
      "description": "Direct invitation for an informal nursery visit & grow-with-me preliminary review session, welcoming your family."
    }
  ],
  "admissionsOfficeSupport": {
    "email": "admissions@tomjerrynursery.com",
    "phone": "+1 (555) 019-8230",
    "hours": "Mon-Fri, 8:30 AM - 4:00 PM",
    "responseTime": "Response guaranteed within 24 working hours",
    "highlightBadge": {
      "title": "Prepared for Growth & Laughter",
      "subtitle": "Licensed ratio: 1:3 staff to toddler"
    }
  }
}
```

---

### `GET /admissions/my-applications`
- **Access:** Parent Portal (`Authorization: Bearer <PARENT_TOKEN>`)
- **Description:** Returns all admission requests submitted by the authenticated parent.

---

### `GET /admissions/status/:idOrAppNumber` — State: `REJECTED`
- **Access:** Public or Parent Portal
- **Description:** Returns the complete status tracking screen data for a rejected admission request (e.g. `TJ-2026-ADM-01824`).
- **Response:** `200 OK`
```json
{
  "applicationNumber": "TJ-2026-ADM-01824",
  "breadcrumbs": ["Home", "Admission Status", "TJ-2026-ADM-01824"],
  "statusTags": [
    { "label": "Check-in Finished", "type": "success", "status": "completed" },
    { "label": "Status: Resolved", "type": "info", "status": "resolved" },
    { "label": "Decision Issued", "type": "danger", "status": "rejected" }
  ],
  "headerInfo": {
    "category": "ADMISSIONS & ENROLMENT",
    "academicYear": "2026-2027 NURSERY YEAR",
    "pageTitle": "Admission Application Status",
    "subtitle": "Track your child's admission request and stay updated on its progress in real time."
  },
  "statusBanner": {
    "status": "Rejected",
    "statusType": "REJECTED",
    "badge": "Rejected",
    "termBadge": "Winter/Spring Term 2026/2027",
    "title": "Admission Application Update",
    "description": "After reviewing your application, the Nursery admissions team was unable to approve this admission request at this time.",
    "estimatedWindow": "Resolved",
    "stageIndicator": "Stage 3 of 3",
    "formalNotice": {
      "label": "Formal Decision Recorded",
      "date": "October 18, 2026",
      "channel": "Delivered to parent portal"
    },
    "advisoryBox": {
      "title": "Understanding Admissions",
      "message": "Our applications undergo thorough evaluation based on licensed capacity and school admission criteria. Enclosed documentation is archived in your personal records."
    }
  },
  "journeyMilestones": [
    {
      "step": 1,
      "title": "Request Submitted",
      "stageLabel": "Stage 1 - Completed",
      "isCompleted": true,
      "isCurrent": false,
      "status": "completed",
      "date": "October 14, 2026",
      "description": "Form details, developmental notes, and family record logged on October 14, 2026"
    },
    {
      "step": 2,
      "title": "Under Review",
      "stageLabel": "Stage 2 - Completed",
      "isCompleted": true,
      "isCurrent": false,
      "status": "completed",
      "date": "October 16, 2026",
      "description": "Cohort interview, classroom capacity, and team availability evaluated on October 16, 2026"
    },
    {
      "step": 3,
      "title": "Decision Made",
      "stageLabel": "Stage 3 - Outcome Registered",
      "badge": "Rejected",
      "isCompleted": true,
      "isCurrent": true,
      "status": "rejected",
      "date": "October 18, 2026",
      "description": "Formal decision recorded on October 18, 2026 and notified to parent portal."
    }
  ],
  "decisionDetails": {
    "title": "Decision Details",
    "subtitle": "Official resolution from our admissions committee",
    "badge": "Admissions Decision",
    "reasonAlert": {
      "title": "Cohort Capacity Limit Reached",
      "message": "This classroom / toddlers cohort has received exceptional interest and is at full capacity limit for the spring term. We have placed this application on standby for future inquiry.",
      "contactPrompt": "Please consult the nursery for further information."
    },
    "applicant": {
      "initials": "AA",
      "roleLabel": "Applicant Name",
      "name": "Adam Ahmed",
      "age": "Age: 18 Months"
    },
    "guardian": {
      "initials": "SA",
      "roleLabel": "Parent / Guardian",
      "name": "Sara Ahmed",
      "role": "Primary Guardian"
    },
    "metadataCards": [
      {
        "id": "submitted_date",
        "icon": "calendar",
        "label": "Application Submitted",
        "value": "October 14, 2026",
        "subtext": "Logged via Parent Portal"
      },
      {
        "id": "decision_date",
        "icon": "file-check",
        "label": "Decision Registered",
        "value": "October 18, 2026",
        "subtext": "Admissions Committee Review"
      },
      {
        "id": "class_cohort",
        "icon": "users",
        "label": "Class Cohort",
        "value": "Toddlers (12-24 mo)",
        "subtext": "Nursery section: Room B1"
      },
      {
        "id": "requested_term",
        "icon": "clock",
        "label": "Requested Term",
        "value": "Spring Term (Jan 2027)",
        "subtext": "Full-day session schedule"
      }
    ],
    "officialFootnote": "Certified record and officially archived evaluation document. Access this data at any time."
  },
  "admissionsGuidance": {
    "title": "Admissions Guidance & Next Inquiries",
    "subtitle": "Additional context regarding your application record and future options.",
    "items": [
      {
        "id": 1,
        "number": "1.",
        "title": "1. Admissions Record Archive",
        "description": "Your application record and verified documents will remain securely stored in your parent portal for future reference.",
        "icon": "archive"
      },
      {
        "id": 2,
        "number": "2.",
        "title": "2. Future Cohort Inquiries",
        "description": "If you would like guidance regarding upcoming terms or waiting pool availability, our admissions office is here to help.",
        "icon": "calendar"
      },
      {
        "id": 3,
        "number": "3.",
        "title": "3. Speak With Admissions",
        "description": "The admissions counselors are available Monday to Friday to discuss alternative cohort schedules and upcoming term openings.",
        "icon": "headset"
      }
    ]
  },
  "quickActions": [
    {
      "id": "go_to_portal",
      "label": "Go to Parent Portal",
      "primary": true,
      "isDropdown": true,
      "url": "/parent/portal"
    },
    {
      "id": "view_details",
      "label": "View Application Details",
      "url": "/parent/applications/TJ-2026-ADM-01824"
    },
    {
      "id": "download_summary",
      "label": "Download Summary (PDF)",
      "url": "/api/admissions/TJ-2026-ADM-01824/summary-pdf",
      "badge": "PDF",
      "size": "275 KB"
    }
  ],
  "securityNote": "Secured 256-bit encryption for all downloadable records.",
  "admissionsOfficeSupport": {
    "title": "Admissions Office Support",
    "subtitle": "General policy and admissions desk",
    "description": "Have questions on how to update contact information or inquiries regarding decisions to assist your family throughout the admissions journey.",
    "email": "admissions@tomjerrynursery.ae",
    "phone": "+ (971) 04 234 5678",
    "hours": "Mon-Fri, 8:00 AM - 4:00 PM",
    "responseTime": "Response guaranteed within 24 working hours",
    "calloutCard": {
      "title": "Preschool for Growth & Laughter",
      "subtitle": "Explore early curriculum for next intake",
      "ratioNote": "Licensed ratio: 1:3 staff to toddler"
    }
  }
}
```

---

### `GET /admissions/:idOrAppNumber/summary-pdf`
- **Access:** Public or Parent Portal
- **Description:** Returns the official signed resolution summary metadata and document for archiving and download.
- **Response:** `200 OK`
```json
{
  "success": true,
  "documentType": "Official Admissions Resolution Summary",
  "applicationNumber": "TJ-2026-ADM-01824",
  "issueDate": "October 18, 2026",
  "nursery": {
    "name": "Tom & Jerry Nursery",
    "license": "KHDA Early Learning License #9182/2026",
    "contact": "admissions@tomjerrynursery.ae | + (971) 04 234 5678"
  },
  "resolution": {
    "status": "REJECTED",
    "officialFinding": "Cohort Capacity Limit Reached",
    "officialSignOff": "Admissions Evaluation Committee, Tom & Jerry Nursery"
  },
  "verification": {
    "securityEncryption": "SHA256-AES-256",
    "digitalSealHash": "0x7f9a2b8c4d1e6f0a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9_TJ-2026-ADM-01824",
    "isArchived": true
  }
}
```

---

### `PATCH /admissions/:id/reject`
- **Access:** Admin only (`Authorization: Bearer <ADMIN_TOKEN>`)
- **Body:**
```json
{
  "rejectionReason": "Cohort Capacity Limit Reached",
  "notes": "Toddler cohort reached maximum capacity for Spring Term 2027.",
  "decisionDate": "2026-10-18T10:00:00.000Z"
}
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Admission request has been rejected and officially archived.",
  "admission": { ... },
  "statusUrl": "/api/admissions/status/TJ-2026-ADM-01824"
}
```

---

### `PATCH /admissions/:id/approve`
- **Access:** Admin only (`Authorization: Bearer <ADMIN_TOKEN>`)
- **Body:**
```json
{
  "notes": "Admission approved. Placement confirmed.",
  "decisionDate": "2026-10-18T10:00:00.000Z"
}
```
- **Response:** `200 OK`





---

## 15. Teacher Portal — Login (`/api/auth/teacher-login`)

### `POST /auth/teacher-login`
- **Access:** Public (Staff only — rejects PARENT role)
- **Description:** Teacher Portal specific login. Accepts `username` (email) field matching the UI.
- **Body:**
```json
{
  "username": "claire.bennett@tomjerrynursery.com",
  "password": "staff123",
  "rememberMe": true
}
```
- **Error States:**

#### Required Fields Error (400):
```json
{
  "error": "Please enter your username and password.",
  "code": "REQUIRED_FIELDS_ERROR",
  "errors": {
    "username": "Please enter your username",
    "password": "Please enter your password"
  }
}
```
#### Invalid Credentials (401):
```json
{
  "error": "Invalid username or password",
  "code": "INVALID_CREDENTIALS",
  "errors": { "username": "Incorrect username or password" }
}
```
#### Parent Trying to Access Staff Portal (403):
```json
{
  "error": "Access restricted to nursery staff only.",
  "code": "STAFF_ONLY"
}
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "title": "Login Successful!",
  "token": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "name": "Claire Bennett",
    "role": "TEACHER",
    "staffRole": "Lead Teacher",
    "assignedClassrooms": [
      { "id": "uuid", "name": "Nursery A", "roomNumber": "R1", "enrolled": 12, "capacity": 15 }
    ]
  },
  "trustBadges": [
    { "label": "Child Safeguarding First", "type": "primary" },
    { "label": "Early Years Foundation Stage", "type": "warning" },
    { "label": "Secure Staff Access", "type": "success" }
  ]
}
```

---

## 16. Teacher Portal — Dashboard & Classroom Console (`/api/teacher`)
*All endpoints require `Authorization: Bearer <TEACHER_TOKEN>`*

### `GET /teacher/dashboard`
- **Description:** Complete Teacher Portal Dashboard matching the UI screenshot (`Welcome Back, Ms. Claire!`).
- **Response:** `200 OK`
```json
{
  "topBar": {
    "campus": "Tom & Jerry Nursery School",
    "academicTerm": "Spring Term 2026 • Week 8",
    "sessionDate": "Friday, October 24, 2026 • Morning Session",
    "notificationCount": 3,
    "teacher": {
      "id": "uuid",
      "name": "Ms. Claire Bennett",
      "roleSubtext": "Lead Educator • KG1 & KG2",
      "avatar": null,
      "initials": "CB",
      "isOnline": true
    }
  },
  "welcome": {
    "sessionDate": "Friday, October 24, 2026 • Morning Session",
    "sessionPill": "< Friday, October 24, 2026 • Morning Session",
    "dateWeather": "Friday, October 24, 2026 • Sunny 21°C",
    "greeting": "Welcome Back, Ms. Claire!",
    "subtitle": "Ready for another wonderful day of curiosity, cheerful discoveries, and gentle milestones?",
    "quickPills": {
      "activeGroups": { "label": "ACTIVE GROUPS", "value": "2 Classes", "icon": "classes" },
      "childrenToday": { "label": "CHILDREN TODAY", "value": "34 In Care", "icon": "children" },
      "portalSync": { "label": "PORTAL SYNC", "value": "Live & Secure", "icon": "shield-check" }
    }
  },
  "importantReminder": {
    "type": "ALLERGY_ALERT",
    "title": "Important Nursery Reminder",
    "message": "Leo W. (KG1 – Butterflies) has a verified mild peanut allergy. Snack trays have been segregated. All activity materials verified nut-safe.",
    "child": "Leo W. (KG1 – Butterflies)",
    "actionButton": {
      "label": "Review Allergy Plan",
      "url": "/api/teacher/allergy-flags"
    }
  },
  "dailyClassroomEssentials": {
    "attendanceManagement": {
      "statusBadge": {
        "label": "KG2 Roll Call: Pending",
        "type": "pending",
        "color": "orange"
      },
      "title": "Attendance Management",
      "subtitle": "Record and verify morning arrival, excused absences, and guardian hand-offs in real time across your assigned classrooms.",
      "checkInCompletion": {
        "checkedIn": 32,
        "total": 34,
        "percentage": 94,
        "label": "32 / 34 Checked-in (94%)"
      },
      "actionButton": {
        "label": "Manage Attendance →",
        "url": "/teacher/attendance"
      }
    },
    "dailyActivities": {
      "statusBadge": {
        "label": "Lunch Logging Next",
        "icon": "clock",
        "type": "next"
      },
      "title": "Daily Activities",
      "subtitle": "Record healthy meal intake, quiet nap routines, joyful creative milestones, and mood check-ins for parents to view instantly.",
      "metrics": {
        "snacks": { "label": "Snacks", "value": "Logged (32/34)", "icon": "snack" },
        "napTime": { "label": "Nap Time", "value": "Starts 12:45", "icon": "moon" },
        "joyLog": { "label": "Joy Log", "value": "8 Shared", "icon": "joy" }
      },
      "actionButton": {
        "label": "Manage Activities →",
        "url": "/teacher/daily-activities"
      }
    }
  },
  "myAssignedClasses": {
    "title": "My Assigned Classes",
    "subtitle": "Current Classrooms for Academic Year 2026-2027",
    "leadTeacher": "Lead: Ms. Claire Bennett",
    "classes": [
      {
        "id": "class-k01-room102",
        "code": "KG1",
        "name": "KG1 – Class A",
        "badge": "Butterflies",
        "roomAndAge": "Room 102 • Early Years • Ages: 2 – 3 yrs",
        "enrolledCount": 16,
        "enrolledLabel": "16 | ENROLLED TODDLERS",
        "attendanceSummary": {
          "presentCount": 15,
          "presentLabel": "15 Present",
          "absentCount": 1,
          "absentLabel": "1 Absent (Sick leave)",
          "lateCount": 0
        },
        "viewRosterUrl": "/api/teacher/attendance/page?classroomId=class-k01-room102"
      },
      {
        "id": "class-k02-room102",
        "code": "KG2",
        "name": "KG2 – Class B",
        "badge": "Robins",
        "roomAndAge": "Room 105 • Foundation Stage • Ages: 4 – 5 yrs",
        "enrolledCount": 18,
        "enrolledLabel": "18 | ENROLLED STUDENTS",
        "attendanceSummary": {
          "presentCount": 17,
          "presentLabel": "17 Present",
          "lateCount": 1,
          "lateLabel": "1 Late Arrival",
          "absentCount": 0
        },
        "viewRosterUrl": "/api/teacher/attendance/page?classroomId=class-k02-room102"
      }
    ],
    "todayFocus": {
      "icon": "pin",
      "title": "Today's Focus: Spring Sensory Garden",
      "description": "Children explore outdoor soil, petals, and water textures during afternoon session.",
      "actionButton": {
        "label": "Lesson Notes",
        "action": "view_lesson_notes"
      }
    }
  },
  "dailySchedule": {
    "title": "Daily Schedule",
    "subtitle": "Key routines • Friday Flow",
    "nextActivityBadge": "Next: 11:30 AM Lunch",
    "timeline": [
      {
        "id": "routine-1",
        "time": "09:00 AM - 10:15 AM",
        "status": "Completed",
        "isCompleted": true,
        "title": "Morning Circle & Sensory Play",
        "description": "Sing-along welcome, nursery rhymes, and soft textured block building (KG1 & KG2)."
      },
      {
        "id": "routine-2",
        "time": "11:30 AM - 12:30 PM",
        "status": "Up Next",
        "isCompleted": false,
        "title": "Healthy Lunch & Handwashing",
        "description": "Steamed sweet peas, whole grain pasta with mild marinara. Foster self-feeding habits."
      },
      {
        "id": "routine-3",
        "time": "12:45 PM - 02:15 PM",
        "status": "Scheduled",
        "isCompleted": false,
        "title": "Quiet Nap & Storytime",
        "description": "Soft lulling music, fairy lights dimming, and reading 'The Little Blue House'."
      },
      {
        "id": "routine-4",
        "time": "02:30 PM - 03:30 PM",
        "status": "Scheduled",
        "isCompleted": false,
        "title": "Outdoor Garden & Creative Crafts",
        "description": "Leaf stamping, fresh air sandbox, and preparing children for guardian pickup."
      }
    ],
    "footer": {
      "syncNotice": "Real-time Schedule sync is active",
      "fullLogUrl": "/api/teacher/routines"
    }
  }
}
```

### `GET /teacher/profile`
- Returns teacher's profile with assigned classrooms.

### `GET /teacher/classroom/:classroomId`
- Returns full classroom console: roster, today's attendance, meals, naps per child.

### `GET /teacher/children`
- Returns all children in teacher's classrooms with today's attendance status.

---

## 17. Teacher Portal — Instant Roster Check-in (`/api/teacher/attendance`)

### `GET /teacher/attendance/today`
- **Description:** Today's full attendance roster for teacher's classrooms.
- **Response:**
```json
{
  "date": "2026-11-15",
  "totalChildren": 12,
  "present": 10, "absent": 1, "excused": 0, "notMarked": 1,
  "roster": [
    {
      "childId": "uuid",
      "fullName": "Emma Johnson",
      "initials": "EJ",
      "status": "PRESENT",
      "attendanceToday": { "status": "PRESENT", "markedAt": "2026-11-15T07:30:00Z" }
    }
  ]
}
```

### `POST /teacher/attendance`
- **Description:** Mark attendance — single or batch.
- **Body (single):**
```json
{ "childId": "uuid", "status": "PRESENT", "notes": "Arrived on time" }
```
- **Body (batch):**
```json
{
  "records": [
    { "childId": "uuid-1", "status": "PRESENT" },
    { "childId": "uuid-2", "status": "ABSENT", "notes": "Sick note submitted" },
    { "childId": "uuid-3", "status": "EXCUSED" }
  ]
}
```
- **Status values:** `PRESENT` | `ABSENT` | `EXCUSED`
- **Note:** If a child was already marked today, the record is updated (upsert).
- **Response:** `201 Created`
```json
{ "success": true, "message": "Attendance marked for 3 child(ren)", "marked": 3 }
```

---

## 18. Teacher Portal — Daily Activities: Food Logs (`/api/teacher/daily-activities`)

### `GET /teacher/daily-activities?date=2026-11-15&childId=UUID`
- Returns all meal logs for the day grouped by child.

### `POST /teacher/daily-activities`
- **Body:**
```json
{
  "childId": "uuid",
  "mealType": "LUNCH",
  "mealStatus": "MOST_EATEN",
  "mealNotes": "Ate most of the pasta, refused salad"
}
```
- **mealType:** `BREAKFAST` | `LUNCH` | `SNACK` | `DINNER`
- **mealStatus:** `ALL_EATEN` | `MOST_EATEN` | `SOME_EATEN` | `NOT_EATEN` | `REFUSED`
- **Response:** `201 Created`

### `PATCH /teacher/daily-activities/:id`
- Update meal status or notes.

### `DELETE /teacher/daily-activities/:id`

---

## 19. Teacher Portal — Daily Activities: Nap Logs (`/api/teacher/nap-logs`)

### `GET /teacher/nap-logs?date=2026-11-15&childId=UUID`
- Returns nap logs with `currentlySleeping` count.

### `POST /teacher/nap-logs`
- **Body:**
```json
{
  "childId": "uuid",
  "startTime": "13:00",
  "endTime": "14:30",
  "status": "COMPLETED",
  "notes": "Slept well, woke up refreshed"
}
```
- **status:** `SLEEPING` | `WOKE_UP` | `REFUSED` | `COMPLETED`
- **Response:** `201 Created` (auto-calculates `durationMin` = 90)

### `PATCH /teacher/nap-logs/:id`
- Update when child wakes up: `{ "endTime": "14:30", "status": "WOKE_UP" }`

### `DELETE /teacher/nap-logs/:id`

---

## 20. Teacher Portal — Milestones (`/api/teacher/milestones`)

### `GET /teacher/milestones?category=PHYSICAL&days=30&childId=UUID`
- **category:** `PHYSICAL` | `COGNITIVE` | `SOCIAL_EMOTIONAL` | `LANGUAGE` | `SELF_CARE`
- Returns milestones grouped by category.

### `POST /teacher/milestones`
- **Body:**
```json
{
  "childId": "uuid",
  "title": "First steps taken independently",
  "description": "Emma walked 5 steps unaided during morning play",
  "category": "PHYSICAL",
  "achievedAt": "2026-11-15"
}
```
- **Response:** `201 Created`

### `PUT /teacher/milestones/:id`
### `DELETE /teacher/milestones/:id`

---

## 21. Teacher Portal — Today's Theme (`/api/teacher/theme`)

### `GET /teacher/theme/today?classroomId=UUID`
- **Description:** Returns today's active mood/theme for classroom(s).
- **Response:**
```json
{
  "date": "2026-11-15",
  "themes": [
    {
      "id": "uuid",
      "classroomId": "uuid",
      "theme": "Happy & Energetic",
      "mood": "Positive",
      "color": "#10B981",
      "emoji": "🌟",
      "notes": "Focused on music and outdoor activities"
    }
  ]
}
```

### `POST /teacher/theme`
- **Body:**
```json
{
  "classroomId": "uuid",
  "theme": "Happy & Energetic",
  "mood": "Positive",
  "color": "#10B981",
  "emoji": "🌟",
  "notes": "Focused on music and outdoor activities"
}
```

---

## 22. Teacher Portal — Today's Class Routine (`/api/teacher/routines`)

### `GET /teacher/routines?date=2026-11-15&classroomId=UUID`
- **Description:** Returns timeline schedule matching the "Today's Class Routine" UI section.
- **Response:**
```json
{
  "date": "2026-11-15",
  "totalItems": 4,
  "completedItems": 2,
  "items": [
    {
      "id": "uuid-1",
      "title": "Morning Circle & Sensory Play",
      "description": "Daily Roll Call, Weather Chart & Song time. Toddlers had sensory bin exploration.",
      "category": "MORNING_CIRCLE",
      "categoryLabel": "Morning Circle",
      "location": "Room 101 Playroom",
      "startTime": "08:30 AM",
      "endTime": "09:30 AM",
      "isCompleted": true,
      "tags": ["Attendance", "Sensory Play"]
    },
    {
      "id": "uuid-2",
      "title": "Healthy Lunch & Handwashing Routine",
      "description": "Steam squash and protein puree with applesauce. Guided handwashing.",
      "category": "MEAL_NAP",
      "categoryLabel": "Meal & Nap",
      "location": "Main Dining Area",
      "startTime": "11:30 AM",
      "endTime": "12:30 PM",
      "isCompleted": false,
      "tags": ["Nutrition", "Self-Care"]
    }
  ]
}
```

### `POST /teacher/routines`
- **Body:**
```json
{
  "classroomId": "uuid",
  "title": "Quiet Nap & Soft Audio Storytime",
  "description": "Dimmed lighting, white noise machine, soft lullabies.",
  "category": "STORYTIME",
  "location": "Nap Studio",
  "startTime": "12:30 PM",
  "endTime": "02:00 PM",
  "tags": ["Rest", "Sound Healing"]
}
```
- **Categories:** `MORNING_CIRCLE`, `MEAL_NAP`, `STORYTIME`, `OUTDOOR_CREATIVE`, `LEARNING_PLAY`, `FREE_PLAY`, `TRANSITION`, `OTHER`

### `PATCH /teacher/routines/:id`
- Update any routine field.

### `PATCH /teacher/routines/:id/complete`
- Toggles the `isCompleted` checkmark status for the timeline item.

### `DELETE /teacher/routines/:id`

---

## 23. Teacher Portal — Teacher's Notes & Parent Reminders (`/api/teacher/notes`)

### `GET /teacher/notes?type=CLASSROOM_NOTE&pinned=true`
- **Types:** `CLASSROOM_NOTE`, `MILESTONE_ALERT`, `PARENT_REMINDER`, `GENERAL`

### `POST /teacher/notes`
- **Body:**
```json
{
  "classroomId": "uuid",
  "type": "CLASSROOM_NOTE",
  "title": "Art Smocks Reminder",
  "content": "Messy paint activity planned for tomorrow. Please remind parents to send extra smocks.",
  "isPinned": true
}
```

### `PATCH /teacher/notes/:id`
- Edit note content, title, or toggle `isPinned`.

### `DELETE /teacher/notes/:id`

### `POST /teacher/notes/:id/send-reminder`
- **Description:** Sends parent alert / notification and records `reminderSentAt`.
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Reminder sent to parent",
  "sentTo": { "name": "Sara Ahmed", "email": "sara.ahmed@example.com" },
  "sentAt": "2026-11-15T09:00:00.000Z"
}
```

---

## 24. Teacher Portal — Special Care Reminders (`/api/teacher/care-notes`)

### `GET /teacher/care-notes?classroomId=UUID`
- **Description:** Lists medical, dietary, and urgent allergy care notes displayed on the Class Cards.

### `POST /teacher/care-notes`
- **Body:**
```json
{
  "childId": "uuid",
  "note": "Severe Peanut & Dairy Allergy. Carry EpiPen in emergency kit.",
  "isAllergy": true,
  "isMedical": true,
  "isUrgent": true
}
```

### `PATCH /teacher/care-notes/:id`
### `DELETE /teacher/care-notes/:id`

---

## 25. Teacher Portal — Roll Sheet & Allergy Flags Actions

### `GET /teacher/roll-sheet`
- **Description:** Returns the printable / exportable roster sheet for the `📥 Daily Roll Sheet` button.
- **Response:**
```json
{
  "title": "Daily Roster Roll Sheet",
  "academicTerm": "2026/2027",
  "generatedAt": "2026-10-24T08:00:00Z",
  "teacherName": "Claire Bennett",
  "classes": [
    {
      "className": "K01 - Class A",
      "roomNumber": "Room 101",
      "totalEnrolled": 12,
      "children": [...]
    }
  ]
}
```

### `GET /teacher/allergy-flags`
- **Description:** Returns active allergy and urgent medical flags for the `⚠️ Allergy Flags (3)` modal.
- **Response:**
```json
{
  "title": "Allergy & Special Care Flags",
  "totalFlags": 3,
  "urgentFlags": 3,
  "flags": [
    { "childName": "Maya Taylor", "classroom": "K01 - Class A", "note": "Peanut Allergy", "isUrgent": true },
    { "childName": "Leo Brown", "classroom": "K01 - Class A", "note": "Pickup 12:15 by Grandma", "isUrgent": true },
    { "childName": "Lucy Miller", "classroom": "K02 - Class B", "note": "Asthma preventer after nap", "isUrgent": true }
  ]
}
```

---

## 26. Teacher Portal — Classroom Notices & Broadcasts (`/api/teacher/notices`)

### `GET /teacher/notices`
- **Description:** Returns active classroom notices for the right sidebar.

### `POST /teacher/notices`
- **Body:** `{ "classroomId": "uuid", "title": "Field Trip", "content": "Permission slips required", "icon": "garden" }`

### `POST /teacher/notices/broadcast`
- **Description:** Handles `Send Broadcast to Parents` button.
- **Body:** `{ "title": "Outdoor Rainy Gear", "content": "Please pack rain boots." }`
- **Response:**
```json
{
  "success": true,
  "message": "Broadcast dispatched to all registered parents!",
  "broadcastAt": "2026-10-24T08:15:00.000Z"
}
```

---

## 27. Teacher Portal — Daily Attendance Management Screen (`/api/teacher/attendance/...`)
*Matches the dedicated "Daily Attendance" screen shown in the UI (`media_1794702308933_7d7c5c90.png`)*

### `GET /teacher/attendance/page`
- **Query Params:**
  - `classroomId` (optional, default: first assigned classroom)
  - `date` (optional, default: today)
  - `page` (optional, default: 1)
  - `limit` (optional, default: 8)
  - `search` (optional, searches by child name or student ID)
- **Description:** Returns the complete payload for the Daily Attendance screen matching the UI screenshot:
  - Top Banners:
    - Success: `"Attendance saved successfully. 16 automated parent notifications queued."`
    - Audit Notice: `"Notice: Attendance has already been finalized today for this cohort. Submitting adjustments will generate an auditable revision stamp."` with `View Audit Log`
  - Active Classroom Badge: `• Room 102 • KG1 - Class A (Butterflies)`
  - Academic Session Card: `ACADEMIC SESSION | Friday, October 24, 2026`
  - 4 Top KPI Cards:
    - **ENROLLED COHORT:** `16 Children` | `100% capacity filled`
    - **PRESENT:** `14` | `87.5%` | `Checked into classrooms`
    - **ABSENT:** `1` | `Excused` | `Noah Klein (Illness)`
    - **LATE CHECK-IN:** `1` | `09:35 AM` | `Theo Robinson`
  - Filter Controls: Assigned classes dropdown, Oct 24, 2026 (Today) picker, Search input, Reset button, Print Sheet button, and `✓ Mark All Present`
  - Class Roster Header: `16 Registered` | `Sorted alphabetically by first name`
  - Confirmation Bar: `"Attendance will be recorded for KG1 – Class A on Friday, October 24, 2026. Lead Educator: Ms. Claire Bennett • Official regulatory attendance log"`
  - Roster Rows (Paginated: 8 children per page, showing age/gender, ID, status pills, note pill, and arrival time)
  - Pagination Controls: `"Showing 8 active pupils on morning shift (Total enrolled: 16)"`, `[Previous] Page 1 of 2 [Next]`
- **Response:** `200 OK`
```json
{
  "alerts": {
    "successMessage": "Attendance saved successfully. 16 automated parent notifications queued.",
    "hasAuditNotice": true,
    "auditNoticeText": "Notice: Attendance has already been finalized today for this cohort. Submitting adjustments will generate an auditable revision stamp.",
    "auditLogButtonLabel": "View Audit Log",
    "auditLogUrl": "/api/teacher/attendance/audit-log?classroomId=class-k01-room102&date=2026-10-24"
  },
  "pageHeader": {
    "title": "Daily Attendance",
    "subtitle": "Record and synchronize morning roll call for assigned nursery pupils.",
    "sessionBadge": "• Room 102 • KG1 - Class A (Butterflies)",
    "dateLabel": "Friday, October 24, 2026 • Morning Session",
    "academicSessionCard": {
      "label": "ACADEMIC SESSION",
      "dateText": "Friday, October 24, 2026"
    },
    "activeClassroom": {
      "id": "class-k01-room102",
      "name": "KG1 - Class A",
      "badge": "Butterflies",
      "roomNumber": "Room 102",
      "capacity": 18,
      "enrolled": 16,
      "displayText": "• Room 102 • KG1 - Class A (Butterflies)"
    }
  },
  "filters": {
    "classAssignedOptions": [
      {
        "id": "class-k01-room102",
        "name": "KG1 - Class A",
        "badge": "Butterflies",
        "label": "KG1 - Class A (Butterflies)",
        "isSelected": true
      }
    ],
    "selectedDate": "2026-10-24",
    "datePickerLabel": "Oct 24, 2026 (Today)",
    "searchQuery": "",
    "searchPlaceholder": "Search by child name or..."
  },
  "kpis": {
    "enrolledCohort": {
      "title": "ENROLLED COHORT",
      "count": 16,
      "unit": "Children",
      "subtext": "100% capacity filled",
      "icon": "users"
    },
    "present": {
      "title": "PRESENT",
      "count": 14,
      "percentage": "87.5%",
      "subtext": "Checked into classrooms",
      "icon": "check-walk"
    },
    "absent": {
      "title": "ABSENT",
      "count": 1,
      "status": "Excused",
      "subtext": "Noah Klein (Illness)",
      "icon": "calendar-x"
    },
    "lateCheckIn": {
      "title": "LATE CHECK-IN",
      "count": 1,
      "time": "09:35 AM",
      "subtext": "Theo Robinson",
      "icon": "clock"
    }
  },
  "rosterSection": {
    "title": "Class Roster",
    "badge": "16 Registered",
    "subtitle": "Sorted alphabetically by first name",
    "quickActions": [
      { "id": "reset", "label": "↻ Reset", "action": "reset" },
      { "id": "print_sheet", "label": "🖨️ Print Sheet", "action": "print_sheet", "url": "/api/teacher/roll-sheet" },
      { "id": "mark_all_present", "label": "✓ Mark All Present", "action": "mark_all_present", "endpoint": "/api/teacher/attendance/mark-all-present" }
    ],
    "confirmationBar": {
      "noticeText": "Attendance will be recorded for KG1 – Class A on Friday, October 24, 2026. Lead Educator: Ms. Claire Bennett • Official regulatory attendance log",
      "cancelButton": { "label": "Cancel", "action": "cancel" },
      "saveButton": {
        "label": "✓ Save Attendance",
        "action": "save_attendance",
        "endpoint": "/api/teacher/attendance/save"
      }
    },
    "pagination": {
      "currentPage": 1,
      "pageSize": 8,
      "totalPages": 2,
      "totalEnrolled": 16,
      "hasNext": true,
      "hasPrev": false,
      "showingText": "Showing 8 active pupils on morning shift (Total enrolled: 16)",
      "pageLabel": "Page 1 of 2"
    },
    "roster": [
      {
        "id": "child-1",
        "studentId": "#TJN-2024-041",
        "name": "Maya Torres",
        "subtext": "4 yrs 3 mo • Female",
        "attendanceStatus": "PRESENT",
        "arrivalTime": "08:45 AM",
        "notePill": { "text": "Pickup: Grandma Elena", "type": "pickup" }
      },
      {
        "id": "child-2",
        "studentId": "#TJN-2024-058",
        "name": "Leo Davies",
        "subtext": "4 yrs 1 mo • Male",
        "attendanceStatus": "PRESENT",
        "arrivalTime": "08:32 AM",
        "notePill": { "text": "⚠️ Peanut Allergy Alert", "type": "allergy", "subtext": "Inhaler on file" }
      },
      {
        "id": "child-3",
        "studentId": "#TJN-2024-019",
        "name": "Noah Klein",
        "subtext": "4 yrs 0 mo • Excused Absence",
        "attendanceStatus": "ABSENT",
        "arrivalTime": "Notified 07:45 AM",
        "notePill": { "text": "Doctor note verified: Mild fever", "type": "absent" }
      },
      {
        "id": "child-4",
        "studentId": "#TJN-2024-042",
        "name": "Theo Robinson",
        "subtext": "4 yrs 4 mo • Late Check-in",
        "attendanceStatus": "LATE",
        "arrivalTime": "09:35 AM",
        "notePill": { "text": "Dentist appointment: Arrived 09:35", "type": "late" }
      },
      {
        "id": "child-5",
        "studentId": "#TJN-2024-033",
        "name": "Chloe Bennett-Smith",
        "subtext": "3 yrs 11 mo • Female",
        "attendanceStatus": "PRESENT",
        "arrivalTime": "08:40 AM",
        "notePill": { "text": "Dairy intolerance (oat milk only)", "type": "dietary" }
      },
      {
        "id": "child-6",
        "studentId": "#TJN-2024-077",
        "name": "Oliver Wong",
        "subtext": "4 yrs 2 mo • Male",
        "attendanceStatus": "PRESENT",
        "arrivalTime": "08:39 AM",
        "notePill": { "text": "Carpool with Sophia Chen", "type": "carpool" }
      },
      {
        "id": "child-7",
        "studentId": "#TJN-2024-073",
        "name": "Lucas Miller",
        "subtext": "4 yrs 5 mo • Male",
        "attendanceStatus": "PRESENT",
        "arrivalTime": "08:35 AM",
        "notePill": { "text": "After-school craft club (until 4:30 PM)", "type": "activity" }
      },
      {
        "id": "child-8",
        "studentId": "#TJN-2024-381",
        "name": "Sophia Chen",
        "subtext": "4 yrs 2 mo • Female",
        "attendanceStatus": "PRESENT",
        "arrivalTime": "08:36 AM",
        "notePill": { "text": "Authorized pickup: Father (David Chen)", "type": "pickup" }
      }
    ]
  }
}
```

### `POST /teacher/attendance/save`
- **Description:** Handles the `✓ Save Attendance` button. Upserts attendance records and automatically logs an audit revision entry if any child's status or arrival time changed.
- **Body:**
```json
{
  "classroomId": "class-k01-room102",
  "date": "2026-10-24",
  "session": "Morning Session",
  "records": [
    {
      "childId": "uuid",
      "status": "PRESENT",
      "arrivalTime": "08:45 AM",
      "guardianName": "Sofia T.",
      "guardianRelation": "Mom",
      "pickupNote": "Regular 3:15 PM pickup",
      "specialCareNote": "Peanut safe snack bag"
    },
    {
      "childId": "uuid-2",
      "status": "ABSENT",
      "arrivalTime": null,
      "guardianName": "Parents",
      "pickupNote": "Parents reported flu - Excused medical absence",
      "isExcused": true
    },
    {
      "childId": "uuid-3",
      "status": "LATE",
      "arrivalTime": "09:15 AM",
      "pickupNote": "Called ahead (Road closure)"
    }
  ]
}
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Attendance saved successfully. 15 parents notified via the Parent Portal.",
  "parentsNotified": 15,
  "recordsProcessed": 16,
  "auditedRevision": true
}
```

### `POST /teacher/attendance/mark-all-present`
- **Description:** Handles the `✓ Mark All Present` quick action button.
- **Body:** `{ "classroomId": "class-k01-room102", "date": "2026-10-24" }`
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "All 16 children marked present",
  "totalMarked": 16
}
```

### `GET /teacher/attendance/audit-log?classroomId=UUID&date=2026-10-24`
- **Description:** Returns the revision history for the `AUDITED LOG` button modal.
- **Response:**
```json
{
  "title": "Audited Attendance Revisions",
  "totalLogs": 2,
  "logs": [
    {
      "childName": "Theo Robinson",
      "studentId": "#TJN-2024-042",
      "oldStatus": "ABSENT",
      "newStatus": "LATE",
      "newTime": "09:15 AM",
      "changedBy": "Ms. Claire Bennett",
      "reason": "Audited revision during attendance confirmation",
      "timestamp": "2026-10-24T09:20:00Z"
    }
  ]
}
```

---

## 28. Teacher Portal — Daily Activities Management Screen (`/api/teacher/daily-activities/...`)
*Matches the dedicated "Daily Activities Management" screen shown in the UI (`media_1794700294165_90d55a3f.png`)*

### `GET /teacher/daily-activities/page`
- **Query Params:**
  - `classroomId` (optional, default: first assigned classroom)
  - `childId` (optional, default: first child in class, e.g. Maya Torres `#TJN-2024-041`)
  - `date` (optional, default: today)
- **Description:** Returns the complete payload for the dedicated Daily Activities Management screen, including:
  - Top Bar: Academic Session ("Spring Term 2026 • Week 8", Morning Session), Teacher Profile
  - Classroom & Student Selectors (KG1 - Class A Butterflies, Maya Torres, Date)
  - Child Summary Pill (Age: "4 yrs 3 mo", Gender: "Female", Enrolled: "KG1-A", "Present (08:45 AM)", "Allergy: Peanut Safe Tray", "Pickup: Grandma Elena (ID on file)")
  - Card 1: Food & Nutrition (Breakfast, Lunch, Afternoon Snack, portions `[All, Most, Half, Little, None]`, Hydration Tracker `4/4 Cups logged`, Dietary Notes)
  - Card 2: Sleep & Rest Routine (Cot #12 Assigned, `[Took Nap, Rested Quietly, Did Not Sleep]`, Start: 12:45 PM, End: 02:15 PM, 1 hr 30 mins duration, observations)
  - Card 3: Mood & Wellbeing (Happy, Calm, Tired, Upset, overall rating "Overall: Excellent", Behavioral Highlights tags: `✓ Eager to share`, `✓ Comfortable with peers`, `✓ Enjoyed circle time`)
  - Card 4: Learning & Developmental Notes ("Synced to Parent Portal", Montessori Sensory curriculum notes, Art & Nature outdoor notes, Lead Teacher observation)
  - Real-time Parent Portal sync notice
- **Response:** `200 OK`
```json
{
  "teacher": {
    "id": "uuid",
    "name": "Ms. Claire Bennett",
    "role": "Lead Educator • KG1 & KG2",
    "avatar": null,
    "initials": "CB"
  },
  "academicSession": {
    "term": "Spring Term 2026 • Week 8",
    "sessionName": "Morning Session",
    "date": "Oct 24, 2026",
    "fullDateLabel": "Friday, Oct 24, 2026 • Morning Session"
  },
  "activeClassroom": {
    "id": "class-k01-room102",
    "name": "KG1 - Class A",
    "badge": "Butterflies",
    "roomNumber": "Room 102",
    "headerBreadcrumb": "Room 102 • KG1 - Class A (Butterflies)"
  },
  "classroomOptions": [
    {
      "id": "class-k01-room102",
      "name": "KG1 - Class A",
      "badge": "Butterflies",
      "roomNumber": "Room 102",
      "label": "KG1 - Class A (Butterflies)",
      "totalChildren": 16,
      "isSelected": true
    }
  ],
  "studentsList": [
    {
      "id": "child-maya-uuid",
      "studentId": "#TJN-2024-041",
      "firstName": "Maya",
      "lastName": "Torres",
      "fullName": "Maya Torres",
      "label": "Maya Torres (#TJN-2024-041)",
      "isSelected": true
    }
  ],
  "selectedChild": {
    "id": "child-maya-uuid",
    "studentId": "#TJN-2024-041",
    "firstName": "Maya",
    "lastName": "Torres",
    "fullName": "Maya Torres",
    "avatar": null,
    "age": "4 yrs 3 mo",
    "gender": "Female",
    "enrolledClass": "KG1-A",
    "metaSummary": "4 yrs 3 mo • Female • Enrolled: KG1-A",
    "attendanceBadge": {
      "status": "PRESENT",
      "arrivalTime": "08:45 AM",
      "label": "Present (08:45 AM)",
      "color": "green"
    },
    "allergyBadge": {
      "hasAllergy": true,
      "label": "Allergy: Peanut Safe Tray",
      "notes": "Peanut Safe Tray"
    },
    "pickupBadge": {
      "label": "Pickup: Grandma Elena (ID on file)",
      "guardianName": "Grandma Elena",
      "notes": "ID on file"
    }
  },
  "foodAndNutrition": {
    "dietaryStatusPill": "Dietary Normal",
    "hydrationTracker": {
      "totalTargetCups": 4,
      "currentCups": 4,
      "label": "4 / 4 Cups logged",
      "subtitle": "Fresh water throughout activities"
    },
    "dietaryNotes": "Drank plenty of water; asked for seconds of crisp apple slices. Finished all oatmeal happily.",
    "meals": {
      "breakfast": {
        "id": "uuid-b",
        "mealType": "BREAKFAST",
        "title": "Breakfast",
        "time": "08:45 AM",
        "status": "Logged",
        "menuDescription": "Oatmeal with sliced strawberries & whole milk",
        "portion": "All",
        "mealStatus": "ALL_EATEN",
        "availablePortions": ["All", "Most", "Half", "Little", "None"]
      },
      "lunch": {
        "id": "uuid-l",
        "mealType": "LUNCH",
        "title": "Lunch",
        "time": "11:30 AM",
        "status": "Logged",
        "menuDescription": "Warm sweet potato soup & wholewheat soft roll",
        "portion": "Most",
        "mealStatus": "SOME_EATEN",
        "availablePortions": ["All", "Most", "Half", "Little", "None"]
      },
      "afternoonSnack": {
        "id": "uuid-s",
        "mealType": "SNACK",
        "title": "Afternoon Snack",
        "time": "02:40 PM",
        "status": "Logged",
        "menuDescription": "Sliced organic honeycrisp apples & oat crackers (peanut-free)",
        "portion": "All",
        "mealStatus": "ALL_EATEN",
        "availablePortions": ["All", "Most", "Half", "Little", "None"]
      }
    }
  },
  "sleepAndRest": {
    "id": "uuid-nap",
    "cotNumber": "Cot #12 Assigned",
    "napStatus": "Took Nap",
    "startTime": "12:45 PM",
    "endTime": "02:15 PM",
    "durationMinutes": 90,
    "durationFormatted": "1 hr 30 mins",
    "observations": "Fell asleep gently after soft storytime hums. Woke up cheerful and refreshed.",
    "statusOptions": [
      { "key": "Took Nap", "label": "Took Nap", "icon": "bed", "isSelected": true },
      { "key": "Rested Quietly", "label": "Rested Quietly", "icon": "chair", "isSelected": false },
      { "key": "Did Not Sleep", "label": "Did Not Sleep", "icon": "sun", "isSelected": false }
    ]
  },
  "moodAndWellbeing": {
    "id": "uuid-mood",
    "overallMood": "HAPPY",
    "overallRating": "Overall: Excellent",
    "availableMoods": [
      { "key": "HAPPY", "title": "Happy", "subtitle": "Cheerful & Smiling", "isSelected": true },
      { "key": "CALM", "title": "Calm", "subtitle": "Quiet & Content", "isSelected": false },
      { "key": "TIRED", "title": "Tired", "subtitle": "Low Energy", "isSelected": false },
      { "key": "UPSET", "title": "Upset", "subtitle": "Needed Comfort", "isSelected": false }
    ],
    "behavioralHighlights": [
      { "label": "Eager to share", "isSelected": true },
      { "label": "Comfortable with peers", "isSelected": true },
      { "label": "Enjoyed circle time", "isSelected": true },
      { "label": "Creative in free play", "isSelected": false },
      { "label": "Followed instructions", "isSelected": false }
    ]
  },
  "developmentalNotes": {
    "id": "uuid-dev",
    "syncStatus": "Synced to Parent Portal",
    "curriculumActivity": {
      "category": "Montessori Sensory",
      "title": "Curriculum & Learning Activities",
      "notes": "Practiced recognizing letters A, B, and C with textured sandpaper cards. Counted 5 wooden acorn blocks independently."
    },
    "outdoorParticipation": {
      "category": "Art & Nature",
      "title": "Classroom & Outdoor Participation",
      "notes": "Participated enthusiastically in group coloring and outdoor autumn leaf rubbing activity with classmates in the garden classroom."
    },
    "leadTeacherObservation": {
      "author": "Ms. Claire Bennett",
      "title": "Lead Teacher's Observation",
      "notes": "Maya showed great empathy today by helping Leo share sensory clay. She was attentive during circle time story session."
    }
  },
  "parentSyncNotice": "Saved daily activities can be viewed immediately by Maya's guardians in the Tom & Jerry Parent Daily Activities Portal."
}
```

### `POST /teacher/daily-activities/save`
- **Description:** Saves the entire Daily Activities Management page and broadcasts/syncs real-time updates to the Parent Portal.
- **Body:**
```json
{
  "childId": "uuid-for-maya",
  "classroomId": "class-k01-room102",
  "date": "2026-10-24",
  "foodAndNutrition": {
    "dietaryStatus": "Dietary Normal",
    "dietaryNotes": "Drank plenty of water; asked for seconds of crisp apple slices. Finished all oatmeal happily.",
    "waterCups": 4,
    "meals": [
      {
        "mealType": "BREAKFAST",
        "time": "08:45 AM",
        "menuDescription": "Oatmeal with sliced strawberries & whole milk",
        "portion": "All",
        "mealStatus": "ALL_EATEN"
      },
      {
        "mealType": "LUNCH",
        "time": "11:30 AM",
        "menuDescription": "Warm sweet potato soup & wholewheat soft roll",
        "portion": "Most",
        "mealStatus": "SOME_EATEN"
      },
      {
        "mealType": "SNACK",
        "time": "02:40 PM",
        "menuDescription": "Sliced organic honeycrisp apples & oat crackers (peanut-free)",
        "portion": "All",
        "mealStatus": "ALL_EATEN"
      }
    ]
  },
  "sleepAndRest": {
    "cotNumber": "Cot #12 Assigned",
    "restQuality": "Took Nap",
    "startTime": "12:45 PM",
    "endTime": "02:15 PM",
    "durationMin": 90,
    "observations": "Fell asleep gently after soft storytime hums. Woke up cheerful and refreshed."
  },
  "moodAndWellbeing": {
    "mood": "HAPPY",
    "overallStatus": "Excellent",
    "behavioralHighlights": [
      "Eager to share",
      "Comfortable with peers",
      "Enjoyed circle time"
    ]
  },
  "developmentalNotes": {
    "curriculumCategory": "Montessori Sensory",
    "curriculumNotes": "Practiced recognizing letters A, B, and C with textured sandpaper cards. Counted 5 wooden acorn blocks independently.",
    "outdoorCategory": "Art & Nature",
    "outdoorNotes": "Participated enthusiastically in group coloring and outdoor autumn leaf rubbing activity with classmates in the garden classroom.",
    "teacherObservation": "Maya showed great empathy today by helping Leo share sensory clay. She was attentive during circle time story session.",
    "isSyncedToParent": true
  }
}
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Daily activities saved successfully. Update is now synchronized with the Parent Portal for Maya Torres.",
  "data": {
    "childId": "uuid-for-maya",
    "childName": "Maya Torres",
    "studentId": "#TJN-2024-041",
    "date": "2026-10-24",
    "syncedToParentPortal": true,
    "savedSections": [
      "foodAndNutrition",
      "sleepAndRest",
      "moodAndWellbeing",
      "developmentalNotes"
    ],
    "savedRecords": {
      "mealsCount": 3,
      "napLogId": "uuid-nap",
      "moodLogId": "uuid-mood",
      "devObservationId": "uuid-dev"
    },
    "updatedAt": "2026-10-24T14:45:00.000Z"
  }
}
```

---

### Teacher Portal — Database Migration Instructions
After pulling these changes, run:
```bash
npm run prisma:migrate
# or if schema is pushed directly:
npx prisma db push

# To populate exact test data matching the UI screenshot:
npm run prisma:seed:teacher
```

**New Tables Created:**
- `daily_activities` (Food logs)
- `nap_logs` (Naps & sleep logs)
- `milestones` (Developmental milestones)
- `teacher_notes` (Classroom notes, parent reminders, pinned alerts)
- `class_routines` (Today's class timeline routine items)
- `child_care_notes` (Special care alerts & medical reminders)
- `daily_themes` (Classroom daily mood and theme)
- `classroom_notices` (Classroom announcements & parent broadcasts)

**New Enums:**
- `MealType`, `MealStatus`, `NapStatus`, `MilestoneCategory`, `TeacherNoteType`, `RoutineCategory`


