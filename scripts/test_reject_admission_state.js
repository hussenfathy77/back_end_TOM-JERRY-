require('dotenv').config();
const jwt = require('jsonwebtoken');

const API_BASE = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Tokens
const parentToken = jwt.sign(
  { id: 'test-parent-id-reject', fullName: 'Sara Ahmed', email: 'sara.ahmed@tomjerrynursery.ae', role: 'PARENT' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const adminToken = jwt.sign(
  { id: 'test-admin-id', fullName: 'System Admin', email: 'admin@tomjerrynursery.ae', role: 'ADMIN' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const runTests = async () => {
  console.log('===============================================================');
  console.log('🧪 TESTING ADMISSION REJECTED STATE & SUMMARY PDF ENDPOINTS');
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
    // ─── TEST 1: Direct Status check for Screenshot ID (TJ-2026-ADM-01824) ────
    console.log('--- Test 1: GET /api/admissions/status/TJ-2026-ADM-01824 ---');
    const res1 = await fetch(`${API_BASE}/admissions/status/TJ-2026-ADM-01824`);
    const data1 = await res1.json();

    assert(res1.status === 200, 'Status endpoint returns 200 OK');
    assert(data1.statusBanner && data1.statusBanner.status === 'Rejected', 'Status banner status is "Rejected"');
    assert(data1.statusBanner.title === 'Admission Application Update', 'Status banner title is "Admission Application Update"');
    assert(
      data1.statusBanner.description.includes('unable to approve this admission request'),
      'Status banner description matches rejection message'
    );
    assert(
      data1.statusBanner.advisoryBox && data1.statusBanner.advisoryBox.title === 'Understanding Admissions',
      'Notice box "Understanding Admissions" present'
    );
    assert(
      data1.statusBanner.formalNotice && data1.statusBanner.formalNotice.label === 'Formal Decision Recorded',
      'Formal notice date card present'
    );

    // Milestones check
    assert(
      Array.isArray(data1.journeyMilestones) && data1.journeyMilestones.length === 3,
      'Journey milestones has 3 steps'
    );
    const step3 = data1.journeyMilestones[2];
    assert(
      step3.title === 'Decision Made' && step3.status === 'rejected' && step3.badge === 'Rejected',
      'Step 3 is Decision Made with status=rejected and badge=Rejected'
    );

    // Decision details check
    assert(data1.decisionDetails && data1.decisionDetails.title === 'Decision Details', 'Decision details panel present');
    assert(
      data1.decisionDetails.reasonAlert && data1.decisionDetails.reasonAlert.title === 'Cohort Capacity Limit Reached',
      'Reason alert is "Cohort Capacity Limit Reached"'
    );
    assert(
      data1.decisionDetails.applicant && data1.decisionDetails.applicant.name === 'Adam Ahmed',
      'Applicant name is Adam Ahmed'
    );
    assert(
      data1.decisionDetails.guardian && data1.decisionDetails.guardian.name === 'Sara Ahmed',
      'Guardian name is Sara Ahmed'
    );
    assert(
      Array.isArray(data1.decisionDetails.metadataCards) && data1.decisionDetails.metadataCards.length === 4,
      'Decision metadata cards has 4 grid items'
    );

    // Guidance & Next inquiries check
    assert(
      data1.admissionsGuidance && Array.isArray(data1.admissionsGuidance.items) && data1.admissionsGuidance.items.length === 3,
      'Admissions Guidance & Next Inquiries has 3 items'
    );
    assert(
      data1.admissionsGuidance.items[0].title.includes('Admissions Record Archive'),
      'Guidance item 1 is Admissions Record Archive'
    );

    // Quick actions check
    const actionsList = Array.isArray(data1.quickActions) ? data1.quickActions : data1.quickActions?.actions;
    assert(
      Array.isArray(actionsList) && actionsList.length > 0,
      'Quick actions list present'
    );
    const downloadAction = actionsList.find(a => a.id === 'download_summary');
    assert(Boolean(downloadAction), 'Quick actions includes "Download Summary (PDF)"');

    // ─── TEST 2: GET /api/admissions/TJ-2026-ADM-01824/summary-pdf ───────────
    console.log('\n--- Test 2: GET /api/admissions/TJ-2026-ADM-01824/summary-pdf ---');
    const resPdf = await fetch(`${API_BASE}/admissions/TJ-2026-ADM-01824/summary-pdf`);
    const dataPdf = await resPdf.json();

    assert(resPdf.status === 200, 'Summary PDF endpoint returns 200 OK');
    assert(dataPdf.success === true, 'PDF response success is true');
    assert(
      dataPdf.documentType === 'Official Admissions Resolution Summary',
      'Document type is Official Admissions Resolution Summary'
    );
    assert(
      dataPdf.resolution && dataPdf.resolution.status === 'REJECTED',
      'Document resolution status is REJECTED'
    );
    assert(
      dataPdf.resolution.officialFinding === 'Cohort Capacity Limit Reached',
      'Document official finding is Cohort Capacity Limit Reached'
    );
    assert(
      dataPdf.verification && Boolean(dataPdf.verification.digitalSealHash),
      'Digital seal encryption hash present'
    );

    // ─── TEST 3: Admin rejects another application via PATCH /reject ─────────
    console.log('\n--- Test 3: Admin Rejects an Application (PATCH /reject) ---');
    // Submit a new application first
    const submitRes = await fetch(`${API_BASE}/admissions/portal-apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${parentToken}`
      },
      body: JSON.stringify({
        childName: 'Layla Mahmoud',
        childDob: '2024-08-10',
        requestedClass: 'Toddlers (12-24 mo)',
        desiredTerm: 'Spring Term (Jan 2027)'
      })
    });
    const submitData = await submitRes.json();
    assert(submitRes.status === 201, 'New application created for rejection test');

    const appId = submitData.admission.id;
    const appNum = submitData.applicationNumber;

    // Admin rejects it
    const rejectRes = await fetch(`${API_BASE}/admissions/${appId}/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        rejectionReason: 'Cohort Capacity Limit Reached',
        notes: 'Spring term toddler cohort reached maximum licensed capacity.'
      })
    });
    const rejectData = await rejectRes.json();

    assert(rejectRes.status === 200, 'PATCH /reject returns 200 OK');
    assert(rejectData.admission.status === 'REJECTED', 'Status updated to REJECTED');
    assert(rejectData.admission.stage === 3, 'Stage automatically advanced to 3');
    assert(
      rejectData.admission.rejectionReason === 'Cohort Capacity Limit Reached',
      'Rejection reason recorded in database'
    );

    // Now query status endpoint for this newly rejected application
    const newStatusRes = await fetch(`${API_BASE}/admissions/status/${encodeURIComponent(appNum)}`);
    const newStatusData = await newStatusRes.json();

    assert(newStatusRes.status === 200, 'Query newly rejected app returns 200 OK');
    assert(newStatusData.statusBanner.status === 'Rejected', 'Newly rejected app status banner is "Rejected"');
    assert(
      newStatusData.decisionDetails.applicant.name === 'Layla Mahmoud',
      'Applicant name dynamically rendered as Layla Mahmoud'
    );
    assert(
      newStatusData.decisionDetails.reasonAlert.title === 'Cohort Capacity Limit Reached',
      'Dynamic reason alert rendered'
    );

    // ─── Summary ─────────────────────────────────────────────────────────────
    console.log('\n===============================================================');
    console.log(`🏁 TEST RESULTS: ${passed} / ${total} assertions PASSED`);
    console.log('===============================================================');

    if (passed === total) {
      console.log('🎉 ALL REJECTED STATE TESTS PASSED FLAWLESSLY!\n');
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
