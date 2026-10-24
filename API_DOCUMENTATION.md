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




