const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middlewares/auth');
const {
  getAllClassrooms,
  getClassroomById,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  assignTeacher,
  unassignTeacher,
  enrollChild,
  bulkEnrollChildren,
  unenrollChild,
  getClassroomChildren,
  getClassroomStats,
  getTodaySessions,
  getClassroomSessions,
  createSession,
  updateSession,
  deleteSession,
  getAvailableTeachers,
  getUnassignedChildren,
  exportRoster
} = require('../controllers/classroomController');

// All classroom routes require authentication and ADMIN role
router.use(authenticateToken, requireRole('ADMIN'));

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
// GET /api/classrooms/stats?academicYear=2024/2027
router.get('/stats', getClassroomStats);

// ─── Today's Schedule ────────────────────────────────────────────────────────
// GET /api/classrooms/schedule/today?date=2024-10-12
router.get('/schedule/today', getTodaySessions);

// ─── Available Teachers ──────────────────────────────────────────────────────
// GET /api/classrooms/available-teachers?includeAssigned=true
router.get('/available-teachers', getAvailableTeachers);

// ─── Unassigned Children ────────────────────────────────────────────────────
// GET /api/classrooms/unassigned-children
router.get('/unassigned-children', getUnassignedChildren);

// ─── Export Roster ───────────────────────────────────────────────────────────
// GET /api/classrooms/export-roster?academicYear=2024/2027
router.get('/export-roster', exportRoster);

// ─── Classroom CRUD ──────────────────────────────────────────────────────────
// GET /api/classrooms?status=ACTIVE&academicYear=2024/2027&teacherFilter=ASSIGNED&search=nursery
router.get('/', getAllClassrooms);

// GET /api/classrooms/:id
router.get('/:id', getClassroomById);

// POST /api/classrooms
router.post('/', createClassroom);

// PUT /api/classrooms/:id
router.put('/:id', updateClassroom);

// DELETE /api/classrooms/:id
router.delete('/:id', deleteClassroom);

// ─── Teacher Assignment ─────────────────────────────────────────────────────
// POST /api/classrooms/:id/assign-teacher
router.post('/:id/assign-teacher', assignTeacher);

// POST /api/classrooms/:id/unassign-teacher
router.post('/:id/unassign-teacher', unassignTeacher);

// ─── Child Enrollment ───────────────────────────────────────────────────────
// GET /api/classrooms/:id/children
router.get('/:id/children', getClassroomChildren);

// POST /api/classrooms/:id/enroll
router.post('/:id/enroll', enrollChild);

// POST /api/classrooms/:id/bulk-enroll
router.post('/:id/bulk-enroll', bulkEnrollChildren);

// POST /api/classrooms/:id/unenroll
router.post('/:id/unenroll', unenrollChild);

// ─── Classroom Sessions (Schedule) ──────────────────────────────────────────
// GET /api/classrooms/:id/sessions?date=2024-10-12
router.get('/:id/sessions', getClassroomSessions);

// POST /api/classrooms/:id/sessions
router.post('/:id/sessions', createSession);

// PUT /api/classrooms/sessions/:sessionId
router.put('/sessions/:sessionId', updateSession);

// DELETE /api/classrooms/sessions/:sessionId
router.delete('/sessions/:sessionId', deleteSession);

module.exports = router;
