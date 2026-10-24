const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middlewares/auth');
const { applyForAdmission } = require('../controllers/landingController');
const {
  getAdmissionFormOptions,
  submitPortalAdmission,
  getSubmissionConfirmation,
  getMyApplications,
  getApplicationStatus,
  downloadSummaryPdf,
  rejectAdmission,
  approveAdmission,
  requestMoreInfo,
  submitAdditionalInfo,
  getAllAdmissions,
  getAdmissionStats,
  getAdmissionById,
  updateAdmissionStatus,
  deleteAdmission
} = require('../controllers/admissionController');

// ─── Public / Common Routes ────────────────────────────────────────────────
// GET /api/admissions/form-options (Dropdowns for Relationship, Class, Term, Rejection reasons)
router.get('/form-options', getAdmissionFormOptions);

// GET /api/admissions/status/:idOrAppNumber (Status Tracking Screen — ALL States: PENDING, REVIEWING, INFO_REQUIRED, APPROVED, WAITLISTED, REJECTED)
router.get('/status/:idOrAppNumber', getApplicationStatus);

// GET /api/admissions/confirmation/:idOrAppNumber (Submission Success / Confirmation Screen)
router.get('/confirmation/:idOrAppNumber', getSubmissionConfirmation);
router.get('/:idOrAppNumber/confirmation', getSubmissionConfirmation);

// GET /api/admissions/:idOrAppNumber/summary-pdf (Download official admissions summary document)
router.get('/:idOrAppNumber/summary-pdf', downloadSummaryPdf);

// POST /api/admissions/apply (Public Landing Page simple application)
router.post('/apply', applyForAdmission);

// ─── Parent Portal Authenticated Routes ─────────────────────────────────────
// POST /api/admissions/portal-apply (Apply for Admission Form with Parent Session)
// Handles: Required Fields Error (400), Invalid Data (422), Submission Success (201)
router.post('/portal-apply', authenticateToken, submitPortalAdmission);

// GET /api/admissions/my-applications (List logged-in parent's admission requests)
router.get('/my-applications', authenticateToken, getMyApplications);

// PATCH /api/admissions/:id/submit-info (Parent responds to INFO_REQUIRED)
router.patch('/:id/submit-info', authenticateToken, submitAdditionalInfo);

// ─── Admin Only: Manage Admissions ──────────────────────────────────────────
// GET /api/admissions/stats
router.get('/stats', authenticateToken, requireRole('ADMIN'), getAdmissionStats);

// GET /api/admissions?status=PENDING&search=john&page=1&limit=10
router.get('/', authenticateToken, requireRole('ADMIN'), getAllAdmissions);

// GET /api/admissions/:id
router.get('/:id', authenticateToken, requireRole('ADMIN'), getAdmissionById);

// PATCH /api/admissions/:id/reject (Admin rejects an admission request with reason)
router.patch('/:id/reject', authenticateToken, requireRole('ADMIN'), rejectAdmission);

// PATCH /api/admissions/:id/approve (Admin approves an admission request)
router.patch('/:id/approve', authenticateToken, requireRole('ADMIN'), approveAdmission);

// PATCH /api/admissions/:id/status (Update status including APPROVED, REJECTED, etc.)
router.patch('/:id/status', authenticateToken, requireRole('ADMIN'), updateAdmissionStatus);

// PATCH /api/admissions/:id/request-info (Admin requests more documents from parent)
router.patch('/:id/request-info', authenticateToken, requireRole('ADMIN'), requestMoreInfo);

// DELETE /api/admissions/:id
router.delete('/:id', authenticateToken, requireRole('ADMIN'), deleteAdmission);

module.exports = router;
