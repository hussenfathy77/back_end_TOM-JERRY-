const express = require('express');
const router = express.Router();
const {
  getLandingPageData,
  applyForAdmission,
  submitContactMessage
} = require('../controllers/landingController');

// ─── Public Landing Page Endpoints ──────────────────────────────────────────
// GET /api/landing (Fetch all hero, stats, pillars, curriculum, facilities, cta)
router.get('/', getLandingPageData);

// POST /api/landing/apply (Apply for Admission button form)
router.post('/apply', applyForAdmission);

// POST /api/landing/contact (Contact Us Form)
router.post('/contact', submitContactMessage);

module.exports = router;
