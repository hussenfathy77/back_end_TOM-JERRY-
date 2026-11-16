const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middlewares/auth');
const {
  // Dashboard & Console
  getTeacherDashboard,
  getClassroomConsole,
  getDailyRollSheet,
  getAllergyFlags,
  // Notices & Broadcasts
  getClassroomNotices,
  createClassroomNotice,
  broadcastNotice,
  // Attendance
  getDailyAttendancePage,
  saveDailyAttendance,
  markAllPresent,
  getAttendanceAuditLog,
  getTodayRoster,
  markAttendance,
  // Daily Activities Dedicated Screen
  getDailyActivitiesPage,
  saveDailyActivitiesPage,
  // Daily Activities (Food)
  getDailyActivities,
  logDailyActivity,
  updateDailyActivity,
  deleteDailyActivity,
  // Nap Logs
  getNapLogs,
  logNap,
  updateNapLog,
  deleteNapLog,
  // Milestones
  getMilestones,
  logMilestone,
  updateMilestone,
  deleteMilestone,
  // Today's Theme
  getTodayTheme,
  setTodayTheme,
  // Class Routine
  getRoutines,
  createRoutine,
  updateRoutine,
  completeRoutine,
  deleteRoutine,
  // Teacher Notes
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  sendParentReminder,
  // Child Care Notes
  getCareNotes,
  createCareNote,
  updateCareNote,
  deleteCareNote,
  // Children & Profile
  getMyChildren,
  getTeacherProfile
} = require('../controllers/teacherController');

// ─── All teacher routes require TEACHER role (or ADMIN) ──────────────────────
router.use(authenticateToken, requireRole('TEACHER', 'ADMIN'));

// ─── Dashboard ─────────────────────────────────────────────────────────────────
// GET /api/teacher/dashboard
// Returns full Teacher Portal home screen data matching the UI screenshot:
// - Top Bar (Ms. Claire Bennett, Lead Educator • R101 & R102, Notification Count)
// - Welcome (Weather Sunny 21°C, 2 Classes Active, 24 Children, Happy & Energetic)
// - Weekly Theme ("Autumn Forest Friends & Harvest Wonder" • Day 3 of 4)
// - Attendance Management & Daily Activities Cards
// - My Classes Cards (K01 Class A & K02 Class B with Special Care Reminders)
// - Today's Class Routine Timeline
// - Teacher's Note Pad & Classroom Notices (Broadcast)
router.get('/dashboard', getTeacherDashboard);

// ─── Profile ───────────────────────────────────────────────────────────────────
// GET /api/teacher/profile
router.get('/profile', getTeacherProfile);

// ─── Classroom Console ─────────────────────────────────────────────────────────
// GET /api/teacher/classroom/:classroomId
router.get('/classroom/:classroomId', getClassroomConsole);

// ─── Children ──────────────────────────────────────────────────────────────────
// GET /api/teacher/children
router.get('/children', getMyChildren);

// ─── Daily Roll Sheet (Export & Print Action) ──────────────────────────────────
// GET /api/teacher/roll-sheet
router.get('/roll-sheet', getDailyRollSheet);

// ─── Allergy & Medical Flags (Action Modal for Allergy Flags (3)) ──────────────
// GET /api/teacher/allergy-flags
router.get('/allergy-flags', getAllergyFlags);

// ─── Classroom Notices & Broadcasts ───────────────────────────────────────────
// GET  /api/teacher/notices
router.get('/notices', getClassroomNotices);

// POST /api/teacher/notices
router.post('/notices', createClassroomNotice);

// POST /api/teacher/notices/broadcast
// Handles "Send Broadcast to Parents" button
router.post('/notices/broadcast', broadcastNotice);

// ─── ATTENDANCE — Daily Attendance Screen & Operations ───────────────────────
// GET  /api/teacher/attendance/page
// Full screen data for the Daily Attendance UI (Alerts, KPIs, Filters, 16 Roster rows)
router.get('/attendance/page', getDailyAttendancePage);

// POST /api/teacher/attendance/save
// Handles "Save Attendance" button (records attendance & creates audited revision if changes occur)
router.post('/attendance/save', saveDailyAttendance);

// POST /api/teacher/attendance/mark-all-present
// Handles "✓ Mark All Present" quick action button
router.post('/attendance/mark-all-present', markAllPresent);

// GET  /api/teacher/attendance/audit-log
// Handles "AUDITED LOG" modal to view revision history
router.get('/attendance/audit-log', getAttendanceAuditLog);

// GET  /api/teacher/attendance/today
router.get('/attendance/today', getTodayRoster);

// POST /api/teacher/attendance
// Mark attendance — single: { childId, status, notes }
//                  batch:  { records: [{ childId, status, notes }] }
// status: PRESENT | ABSENT | EXCUSED
router.post('/attendance', markAttendance);

// ─── DAILY ACTIVITIES MANAGEMENT — Dedicated Child Screen & Sync ─────────────
// GET  /api/teacher/daily-activities/page?classroomId=UUID&childId=UUID&date=YYYY-MM-DD
// Loads full Daily Activities Management screen matching UI screenshot:
// - Top Session: Spring Term 2026 • Week 8
// - Selectors: Classroom, Student (Maya Torres #TJN-2024-041), Date
// - Child Summary Pill: Age, Gender, Attendance Status, Allergies, Pickup notes
// - 4 Activity Cards: Food & Nutrition, Sleep & Rest Routine, Mood & Wellbeing, Learning & Developmental Notes
router.get('/daily-activities/page', getDailyActivitiesPage);

// POST /api/teacher/daily-activities/save
// Saves all 4 cards (Food intake, Nap routine, Mood, Developmental observations)
// and syncs immediately to the Parent Portal
router.post('/daily-activities/save', saveDailyActivitiesPage);

// ─── DAILY ACTIVITIES — Food Logs ──────────────────────────────────────────────
// GET  /api/teacher/daily-activities?date=YYYY-MM-DD&childId=UUID
router.get('/daily-activities', getDailyActivities);

// POST /api/teacher/daily-activities
// Log a meal: { childId, mealType, mealStatus, mealNotes }
// mealType:   BREAKFAST | LUNCH | SNACK | DINNER
// mealStatus: ALL_EATEN | MOST_EATEN | SOME_EATEN | NOT_EATEN | REFUSED
router.post('/daily-activities', logDailyActivity);

// PATCH /api/teacher/daily-activities/:id
router.patch('/daily-activities/:id', updateDailyActivity);

// DELETE /api/teacher/daily-activities/:id
router.delete('/daily-activities/:id', deleteDailyActivity);

// ─── DAILY ACTIVITIES — Nap Logs ───────────────────────────────────────────────
// GET  /api/teacher/nap-logs?date=YYYY-MM-DD&childId=UUID
router.get('/nap-logs', getNapLogs);

// POST /api/teacher/nap-logs
// Log a nap: { childId, startTime, endTime?, status?, notes? }
// status: SLEEPING | WOKE_UP | REFUSED | COMPLETED
router.post('/nap-logs', logNap);

// PATCH /api/teacher/nap-logs/:id
router.patch('/nap-logs/:id', updateNapLog);

// DELETE /api/teacher/nap-logs/:id
router.delete('/nap-logs/:id', deleteNapLog);

// ─── MILESTONES ────────────────────────────────────────────────────────────────
// GET  /api/teacher/milestones?childId=UUID&category=PHYSICAL&days=30
router.get('/milestones', getMilestones);

// POST /api/teacher/milestones
// Log milestone: { childId, title, description?, category?, achievedAt? }
router.post('/milestones', logMilestone);

// PUT  /api/teacher/milestones/:id
router.put('/milestones/:id', updateMilestone);

// DELETE /api/teacher/milestones/:id
router.delete('/milestones/:id', deleteMilestone);

// ─── TODAY'S THEME ─────────────────────────────────────────────────────────────
// GET  /api/teacher/theme/today?classroomId=UUID
router.get('/theme/today', getTodayTheme);

// POST /api/teacher/theme
// Body: { classroomId, theme, weeklyTheme?, weeklyProgress?, weather?, mood?, color?, emoji?, notes? }
router.post('/theme', setTodayTheme);

// ─── CLASS ROUTINES (Today's Class Routine) ───────────────────────────────────
// GET    /api/teacher/routines?date=YYYY-MM-DD&classroomId=UUID
router.get('/routines', getRoutines);

// POST   /api/teacher/routines
// Body: { classroomId, title, description?, category?, location?, startTime, endTime?, status?, tags? }
router.post('/routines', createRoutine);

// PATCH  /api/teacher/routines/:id
router.patch('/routines/:id', updateRoutine);

// PATCH  /api/teacher/routines/:id/complete
// Toggle routine completion status
router.patch('/routines/:id/complete', completeRoutine);

// DELETE /api/teacher/routines/:id
router.delete('/routines/:id', deleteRoutine);

// ─── TEACHER'S NOTES & PARENT REMINDERS ───────────────────────────────────────
// GET    /api/teacher/notes?type=CLASSROOM_NOTE&pinned=true
// type: CLASSROOM_NOTE | MILESTONE_ALERT | PARENT_REMINDER | GENERAL
router.get('/notes', getNotes);

// POST   /api/teacher/notes
// Body: { classroomId?, childId?, type?, title, content, isPinned? }
router.post('/notes', createNote);

// PATCH  /api/teacher/notes/:id
router.patch('/notes/:id', updateNote);

// DELETE /api/teacher/notes/:id
router.delete('/notes/:id', deleteNote);

// POST   /api/teacher/notes/:id/send-reminder
// Dispatches reminder notification for the child's parent
router.post('/notes/:id/send-reminder', sendParentReminder);

// ─── CHILD SPECIAL CARE NOTES (Special Care Reminders) ─────────────────────────
// GET    /api/teacher/care-notes?childId=UUID&classroomId=UUID
router.get('/care-notes', getCareNotes);

// POST   /api/teacher/care-notes
// Body: { childId, note, isAllergy?, isMedical?, isUrgent? }
router.post('/care-notes', createCareNote);

// PATCH  /api/teacher/care-notes/:id
router.patch('/care-notes/:id', updateCareNote);

// DELETE /api/teacher/care-notes/:id
router.delete('/care-notes/:id', deleteCareNote);

module.exports = router;
