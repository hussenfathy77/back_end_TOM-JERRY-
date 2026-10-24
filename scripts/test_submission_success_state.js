require('dotenv').config();
const jwt = require('jsonwebtoken');

const API_BASE = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const parentToken = jwt.sign(
  { id: 'test-parent-confirm', fullName: 'Sara Ahmed', email: 'sara.ahmed@example.com', role: 'PARENT' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const runTests = async () => {
  console.log('===============================================================');
  console.log('🧪 TESTING SUBMISSION SUCCESS & CONFIRMATION SCREEN (UI MATCH)');
  console.log('===============================================================\n');

  let passed = 0;
  let total = 0;

  const assert = (condition, title, details = '') => {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${title}`);
      if (details) console.error(`   Details:`, details);
    }
  };

  try {
    // ─── TEST 1: GET /api/admissions/confirmation/#TJ-ADM-2026-8492 ───────────
    console.log('--- Test 1: GET /api/admissions/confirmation/%23TJ-ADM-2026-8492 ---');
    const res1 = await fetch(`${API_BASE}/admissions/confirmation/${encodeURIComponent('#TJ-ADM-2026-8492')}`);
    const data1 = await res1.json();

    assert(res1.status === 200, 'Confirmation endpoint returns 200 OK');
    assert(data1.applicationNumber === '#TJ-ADM-2026-8492', 'Application number matches #TJ-ADM-2026-8492');
    assert(
      Array.isArray(data1.breadcrumbs) && data1.breadcrumbs.includes('Confirmation'),
      'Breadcrumbs: Home / Admission Request / Confirmation'
    );
    assert(
      data1.headerBadge && data1.headerBadge.label === 'RECEIVED & LOGGED',
      'Header badge is RECEIVED & LOGGED'
    );

    // Hero Card
    assert(
      data1.heroCard && data1.heroCard.title === 'Admission Request Submitted Successfully!',
      'Hero headline matches "Admission Request Submitted Successfully!"'
    );
    assert(
      data1.heroCard.statusBadge && data1.heroCard.statusBadge.label === 'Pending Review',
      'Hero status badge is "Pending Review"'
    );
    assert(
      data1.heroCard.disclaimerAlert && data1.heroCard.disclaimerAlert.includes('Submission success confirms your request was safely received'),
      'Disclaimer alert text matches screenshot'
    );

    // Application Progress
    assert(
      data1.applicationProgress && data1.applicationProgress.stepIndicator === 'STEP 2 OF 3 ACTIVE',
      'Progress indicator is "STEP 2 OF 3 ACTIVE"'
    );
    assert(
      Array.isArray(data1.applicationProgress.steps) && data1.applicationProgress.steps.length === 3,
      'Progress steps has 3 milestones'
    );
    assert(
      data1.applicationProgress.steps[0].title === 'Request Submitted' && data1.applicationProgress.steps[0].isCompleted,
      'Step 1: Request Submitted (Completed)'
    );
    assert(
      data1.applicationProgress.steps[1].title === 'Under Review' && data1.applicationProgress.steps[1].badge === 'CURRENT',
      'Step 2: Under Review (CURRENT)'
    );
    assert(
      data1.applicationProgress.steps[2].title === 'Decision Made',
      'Step 3: Decision Made'
    );

    // Application Summary
    assert(
      data1.applicationSummary && data1.applicationSummary.referenceId === '#TJ-ADM-2026-8492',
      'Summary reference ID is #TJ-ADM-2026-8492'
    );
    assert(
      Array.isArray(data1.applicationSummary.grid) && data1.applicationSummary.grid.length === 4,
      'Summary grid has 4 information cards'
    );
    const childCard = data1.applicationSummary.grid.find(g => g.id === 'child_name');
    assert(childCard && childCard.value === 'Adam Ahmed', 'Summary Child Name is Adam Ahmed');
    const parentCard = data1.applicationSummary.grid.find(g => g.id === 'parent_name');
    assert(parentCard && parentCard.value === 'Sara Ahmed', 'Summary Parent Name is Sara Ahmed');
    const progCard = data1.applicationSummary.grid.find(g => g.id === 'requested_program');
    assert(progCard && progCard.value.includes('Toddlers'), 'Summary Program is Toddlers');
    const termCard = data1.applicationSummary.grid.find(g => g.id === 'desired_term');
    assert(termCard && termCard.value.includes('Spring Term'), 'Summary Term is Spring Term');

    // Summary Actions
    assert(
      Array.isArray(data1.applicationSummary.actions) && data1.applicationSummary.actions.length === 2,
      'Summary actions has 2 buttons (View Status & Back to Portal)'
    );

    // Admissions Office Card
    assert(
      data1.admissionsOffice && data1.admissionsOffice.title === 'Admissions Office',
      'Admissions Office sidebar card present'
    );
    assert(
      data1.admissionsOffice.badge === 'ACCEPTING INTAKE',
      'Admissions Office badge is ACCEPTING INTAKE'
    );
    assert(
      data1.admissionsOffice.pdfReceipt && data1.admissionsOffice.pdfReceipt.downloadLabel === 'Download PDF',
      'Download PDF receipt link present'
    );

    // Three Information Cards
    assert(
      Array.isArray(data1.informationCards) && data1.informationCards.length === 3,
      'Three bottom informational cards present (Confirmation Email, Visit & Tour, Instant Updates)'
    );
    assert(
      data1.informationCards[0].title === 'Confirmation Email' &&
      data1.informationCards[1].title === 'Nursery Visit & Tour' &&
      data1.informationCards[2].title === 'Instant Updates',
      'Card titles match screenshot exactly'
    );

    // ─── TEST 2: POST /api/admissions/portal-apply returns this payload ────────
    console.log('\n--- Test 2: POST /api/admissions/portal-apply (Live Submission) ---');
    const postRes = await fetch(`${API_BASE}/admissions/portal-apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${parentToken}`
      },
      body: JSON.stringify({
        childName: 'Zainab Kareem',
        childDob: '2024-09-15',
        requestedClass: 'Toddlers (15-24 months)',
        desiredTerm: 'Spring Term (January 2027)',
        relationship: 'Mother'
      })
    });
    const postData = await postRes.json();

    assert(postRes.status === 201, 'POST /portal-apply returns 201 Created');
    assert(postData.success === true, 'Success is true');
    assert(postData.heroCard && postData.heroCard.title.includes('Successfully'), 'Hero card generated on submission');
    assert(postData.applicationSummary && postData.applicationSummary.grid[0].value === 'Zainab Kareem', 'Grid contains submitted child name');
    assert(Boolean(postData.confirmationUrl), 'Confirmation URL generated for frontend routing');

    // ─── Summary ─────────────────────────────────────────────────────────────
    console.log('\n===============================================================');
    console.log(`🏁 TEST RESULTS: ${passed} / ${total} assertions PASSED`);
    console.log('===============================================================');

    if (passed === total) {
      console.log('🎉 ALL SUBMISSION SUCCESS SCREEN TESTS PASSED FLAWLESSLY!\n');
      process.exit(0);
    } else {
      console.error(`⚠️ ${total - passed} tests failed.`);
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error running tests:', err);
    process.exit(1);
  }
};

runTests();
