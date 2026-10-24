const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middlewares/auth');
const {
  getStaffStats,
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  toggleStaffStatus,
  deleteStaff,
  assignClassroom,
  unassignStaff,
  assignCover,
  getScheduleLogs,
  getStaffRoles,
  getEmploymentTypes,
  getClassroomsDropdown,
  exportStaff
} = require('../controllers/staffController');

// All staff management routes require authentication and ADMIN role
router.use(authenticateToken, requireRole('ADMIN'));

// ─── Staff KPI Stats ────────────────────────────────────────────────────────
// GET /api/staff/stats
router.get('/stats', getStaffStats);

// ─── Modal & Filter Dropdown Helpers ────────────────────────────────────────
// GET /api/staff/roles
router.get('/roles', getStaffRoles);

// GET /api/staff/employment-types
router.get('/employment-types', getEmploymentTypes);

// GET /api/staff/classrooms-dropdown
router.get('/classrooms-dropdown', getClassroomsDropdown);

// ─── Schedule Logs (Ratio Banner Button) ────────────────────────────────────
// GET /api/staff/schedule-logs
router.get('/schedule-logs', getScheduleLogs);

// ─── Export Staff ───────────────────────────────────────────────────────────
// GET /api/staff/export
router.get('/export', exportStaff);

// ─── Assign Cover (Ratio Banner Button) ─────────────────────────────────────
// POST /api/staff/assign-cover
router.post('/assign-cover', assignCover);

// ─── Staff CRUD ─────────────────────────────────────────────────────────────
// GET /api/staff?search=sarah&role=Lead Teacher&classId=...&status=ACTIVE&page=1&limit=6
router.get('/', getAllStaff);

// GET /api/staff/:id
router.get('/:id', getStaffById);

// POST /api/staff (Add New Staff)
router.post('/', createStaff);

// PUT /api/staff/:id
router.put('/:id', updateStaff);

// PATCH /api/staff/:id/status (Toggle Active / Inactive)
router.patch('/:id/status', toggleStaffStatus);

// DELETE /api/staff/:id
router.delete('/:id', deleteStaff);

// ─── Classroom Assignment Actions ───────────────────────────────────────────
// POST /api/staff/:id/assign-class
router.post('/:id/assign-class', assignClassroom);

// POST /api/staff/:id/unassign (Move to Cover Pool)
router.post('/:id/unassign', unassignStaff);

module.exports = router;
