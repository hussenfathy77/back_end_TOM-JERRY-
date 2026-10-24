require('dotenv').config();
const jwt = require('jsonwebtoken');

const API_BASE = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET;

// Generate tokens
const parentToken = jwt.sign(
  { id: 'test-parent-id', fullName: 'Sara Ahmed', email: 'sara.ahmed@example.com', phone: '+1 (555) 234-5678', role: 'PARENT' },
  JWT_SECRET, { expiresIn: '1h' }
);
const adminToken = jwt.sign(
  { id: 'test-admin-id', fullName: 'Admin User', email: 'admin@tomjerrynursery.com', role: 'ADMIN' },
  JWT_SECRET, { expiresIn: '1h' }
);

let passCount = 0;
let failCount = 0;
function pass(label) { passCount++; console.log(`  ✅ PASS: ${label}\n`); }
function fail(label, detail) { failCount++; console.error(`  ❌ FAIL: ${label} — ${detail}\n`); }

async function runTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  TESTING ALL 5 ADMISSION UI STATES');
  console.log('═══════════════════════════════════════════════════════\n');

  // ────────────────────────────────────────────────────────────────
  // STATE 1: REQUIRED FIELDS ERROR
  // ────────────────────────────────────────────────────────────────
  console.log('━━━ STATE 1: Required Fields Error ━━━');
  try {
    const res = await fetch(`${API_BASE}/admissions/portal-apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${parentToken}` },
      body: JSON.stringify({})  // All fields empty
    });
    const data = await res.json();
    console.log(`  Status: ${res.status}`);
    console.log(`  Error Type: ${data.errorType}`);
    console.log(`  Title: ${data.title}`);
    console.log(`  Fields with errors: ${data.fieldsWithErrors}`);
    console.log(`  Field errors count: ${data.fieldErrors?.length}`);
    if (res.status === 400 && data.errorType === 'REQUIRED_FIELDS_ERROR' && data.fieldErrors.length >= 3) {
      pass('Required Fields Error — returned 400 with structured field errors');
    } else {
      fail('Required Fields Error', `Expected 400 + REQUIRED_FIELDS_ERROR, got ${res.status}`);
    }
  } catch (err) { fail('Required Fields Error', err.message); }

  // ────────────────────────────────────────────────────────────────
  // STATE 2a: INVALID DATA — Date of birth in the future
  // ────────────────────────────────────────────────────────────────
  console.log('━━━ STATE 2a: Invalid Data — Future DOB ━━━');
  try {
    const res = await fetch(`${API_BASE}/admissions/portal-apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${parentToken}` },
      body: JSON.stringify({
        childName: 'Adam Ahmed',
        childDob: '2030-01-01',  // future date
        requestedClass: 'Toddlers (13-24 mo)',
        desiredTerm: 'Spring Term (Jan 2027)'
      })
    });
    const data = await res.json();
    console.log(`  Status: ${res.status}`);
    console.log(`  Error Type: ${data.errorType}`);
    console.log(`  Field: ${data.fieldErrors?.[0]?.field}`);
    console.log(`  Message: ${data.fieldErrors?.[0]?.message}`);
    if (res.status === 422 && data.errorType === 'INVALID_DATA' && data.fieldsWithErrors?.includes('childDob')) {
      pass('Invalid Data — Future DOB correctly rejected');
    } else {
      fail('Invalid Data — Future DOB', `Expected 422 + INVALID_DATA, got ${res.status}`);
    }
  } catch (err) { fail('Invalid Data — Future DOB', err.message); }

  // ────────────────────────────────────────────────────────────────
  // STATE 2b: INVALID DATA — Child too old (>5 years)
  // ────────────────────────────────────────────────────────────────
  console.log('━━━ STATE 2b: Invalid Data — Child too old ━━━');
  try {
    const res = await fetch(`${API_BASE}/admissions/portal-apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${parentToken}` },
      body: JSON.stringify({
        childName: 'Old Kid',
        childDob: '2015-01-01',  // >5 years old
        requestedClass: 'Pre-K (3-5 yrs)',
        desiredTerm: 'Spring Term (Jan 2027)'
      })
    });
    const data = await res.json();
    console.log(`  Status: ${res.status}`);
    console.log(`  Error Type: ${data.errorType}`);
    console.log(`  Message: ${data.fieldErrors?.[0]?.message}`);
    if (res.status === 422 && data.errorType === 'INVALID_DATA') {
      pass('Invalid Data — Child too old correctly rejected');
    } else {
      fail('Invalid Data — Child too old', `Expected 422 + INVALID_DATA, got ${res.status}`);
    }
  } catch (err) { fail('Invalid Data — Child too old', err.message); }

  // ────────────────────────────────────────────────────────────────
  // STATE 2c: INVALID DATA — Bad class option
  // ────────────────────────────────────────────────────────────────
  console.log('━━━ STATE 2c: Invalid Data — Unknown class ━━━');
  try {
    const res = await fetch(`${API_BASE}/admissions/portal-apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${parentToken}` },
      body: JSON.stringify({
        childName: 'Adam Ahmed',
        childDob: '2025-04-14',
        requestedClass: 'Kindergarten (5-6 yrs)',  // invalid
        desiredTerm: 'Spring Term (Jan 2027)'
      })
    });
    const data = await res.json();
    console.log(`  Status: ${res.status}`);
    console.log(`  Error Type: ${data.errorType}`);
    if (res.status === 422 && data.errorType === 'INVALID_DATA' && data.fieldsWithErrors?.includes('requestedClass')) {
      pass('Invalid Data — Unknown class correctly rejected');
    } else {
      fail('Invalid Data — Unknown class', `Expected 422 + INVALID_DATA, got ${res.status}`);
    }
  } catch (err) { fail('Invalid Data — Unknown class', err.message); }

  // ────────────────────────────────────────────────────────────────
  // STATE 3: SUBMISSION SUCCESS
  // ────────────────────────────────────────────────────────────────
  let createdAppNumber = '';
  let createdId = '';
  console.log('━━━ STATE 3: Submission Success ━━━');
  try {
    const res = await fetch(`${API_BASE}/admissions/portal-apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${parentToken}` },
      body: JSON.stringify({
        relationship: 'Mother',
        childName: 'Adam Ahmed',
        childDob: '2025-04-14',
        gender: 'Male',
        requestedClass: 'Toddlers (13-24 mo)',
        desiredTerm: 'Spring Term (Jan 2027)',
        notes: 'Enjoys music and sensory games.'
      })
    });
    const data = await res.json();
    createdAppNumber = data.applicationNumber;
    createdId = data.admission?.id;
    console.log(`  Status: ${res.status}`);
    console.log(`  Success: ${data.success}`);
    console.log(`  Message: ${data.message}`);
    console.log(`  App Number: ${data.applicationNumber}`);
    console.log(`  Success Card Title: ${data.successCard?.title}`);
    console.log(`  Next Steps count: ${data.nextSteps?.length}`);
    console.log(`  Actions count: ${data.actions?.length}`);
    if (res.status === 201 && data.success && data.applicationNumber && data.successCard && data.nextSteps?.length === 3) {
      pass('Submission Success — full success response with successCard, nextSteps, actions');
    } else {
      fail('Submission Success', `Expected 201 + success payload, got ${res.status}`);
    }
  } catch (err) { fail('Submission Success', err.message); }

  // ────────────────────────────────────────────────────────────────
  // STATE 4: MORE INFORMATION REQUIRED (Admin triggers → Status screen)
  // ────────────────────────────────────────────────────────────────
  console.log('━━━ STATE 4: More Information Required ━━━');
  if (createdId) {
    // Admin requests more info
    try {
      const res = await fetch(`${API_BASE}/admissions/${createdId}/request-info`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ notes: 'Missing birth certificate and immunization records.' })
      });
      const data = await res.json();
      console.log(`  Admin PATCH status: ${res.status}`);
      console.log(`  Message: ${data.message}`);
      console.log(`  New Status: ${data.admission?.status}`);

      if (res.status === 200 && data.admission?.status === 'INFO_REQUIRED') {
        pass('Admin request-info — status set to INFO_REQUIRED');
      } else {
        fail('Admin request-info', `Expected INFO_REQUIRED, got ${data.admission?.status}`);
      }
    } catch (err) { fail('Admin request-info', err.message); }

    // Now fetch status screen — should show "Additional Information Needed"
    try {
      const encoded = encodeURIComponent(createdAppNumber);
      const res = await fetch(`${API_BASE}/admissions/status/${encoded}`);
      const data = await res.json();
      console.log(`  Status Screen status: ${res.status}`);
      console.log(`  Banner statusType: ${data.statusBanner?.statusType}`);
      console.log(`  Banner title: ${data.statusBanner?.title}`);
      console.log(`  Required docs count: ${data.statusBanner?.requiredDocuments?.length}`);
      console.log(`  Upload deadline: ${data.statusBanner?.uploadDeadline}`);
      console.log(`  Milestone 2 badge: ${data.journeyMilestones?.[1]?.currentBadge}`);
      console.log(`  What Happens Next[0]: ${data.whatHappensNext?.[0]?.title}`);

      if (data.statusBanner?.statusType === 'INFO_REQUIRED'
        && data.statusBanner?.requiredDocuments?.length >= 3
        && data.journeyMilestones?.[1]?.currentBadge === 'Action Required'
        && data.whatHappensNext?.[0]?.title === 'Review Required Documents') {
        pass('Status Screen — INFO_REQUIRED state with required docs, deadline, and action-required badge');
      } else {
        fail('Status Screen — INFO_REQUIRED', 'Missing expected data for More Info Required state');
      }
    } catch (err) { fail('Status Screen — INFO_REQUIRED', err.message); }

    // Parent submits additional info
    try {
      const res = await fetch(`${API_BASE}/admissions/${createdId}/submit-info`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${parentToken}` },
        body: JSON.stringify({
          additionalNotes: 'Attached scanned birth certificate and vaccination card.',
          documentsSubmitted: ['birth_certificate', 'immunization_records']
        })
      });
      const data = await res.json();
      console.log(`  Parent submit-info status: ${res.status}`);
      console.log(`  New Status: ${data.admission?.status}`);

      if (res.status === 200 && data.admission?.status === 'REVIEWING') {
        pass('Parent submit-info — status reverted to REVIEWING');
      } else {
        fail('Parent submit-info', `Expected REVIEWING, got ${data.admission?.status}`);
      }
    } catch (err) { fail('Parent submit-info', err.message); }
  } else {
    fail('More Information Required', 'No application ID from previous step');
  }

  // ────────────────────────────────────────────────────────────────
  // STATE 5: APPROVED (Admin approves → Status screen)
  // ────────────────────────────────────────────────────────────────
  console.log('━━━ STATE 5: Approved ━━━');
  if (createdId) {
    // Admin approves
    try {
      const res = await fetch(`${API_BASE}/admissions/${createdId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ status: 'APPROVED', notes: 'All documents verified. Accepted for Spring Term.' })
      });
      const data = await res.json();
      console.log(`  Admin approve status: ${res.status}`);
      console.log(`  New Status: ${data.admission?.status}`);
      console.log(`  Stage: ${data.admission?.stage}`);

      if (res.status === 200 && data.admission?.status === 'APPROVED' && data.admission?.stage === 3) {
        pass('Admin approve — status APPROVED, stage auto-set to 3');
      } else {
        fail('Admin approve', `Expected APPROVED/stage=3, got ${data.admission?.status}/${data.admission?.stage}`);
      }
    } catch (err) { fail('Admin approve', err.message); }

    // Fetch status screen for APPROVED state
    try {
      const encoded = encodeURIComponent(createdAppNumber);
      const res = await fetch(`${API_BASE}/admissions/status/${encoded}`);
      const data = await res.json();
      console.log(`  Status Screen status: ${res.status}`);
      console.log(`  Banner statusType: ${data.statusBanner?.statusType}`);
      console.log(`  Banner title: ${data.statusBanner?.title}`);
      console.log(`  Celebration badge: ${data.statusBanner?.celebrationBadge?.title}`);
      console.log(`  Milestone 3 completed: ${data.journeyMilestones?.[2]?.isCompleted}`);
      console.log(`  What Happens Next[0]: ${data.whatHappensNext?.[0]?.title}`);
      console.log(`  Quick Actions[0]: ${data.quickActions?.[0]?.label}`);

      if (data.statusBanner?.statusType === 'APPROVED'
        && data.statusBanner?.celebrationBadge
        && data.journeyMilestones?.[2]?.isCompleted === true
        && data.whatHappensNext?.[0]?.title === 'Enrollment Packet'
        && data.quickActions?.[0]?.label === 'Download Welcome Letter (PDF)') {
        pass('Status Screen — APPROVED state with celebration badge, enrollment next steps, welcome letter action');
      } else {
        fail('Status Screen — APPROVED', 'Missing expected data for Approved state');
      }
    } catch (err) { fail('Status Screen — APPROVED', err.message); }
  } else {
    fail('Approved', 'No application ID from previous step');
  }

  // ─── SUMMARY ───────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  RESULTS:  ${passCount} passed / ${failCount} failed  (${passCount + failCount} total)`);
  console.log('═══════════════════════════════════════════════════════');

  if (failCount > 0) process.exit(1);
}

runTests();
