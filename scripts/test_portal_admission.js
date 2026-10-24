require('dotenv').config();
const jwt = require('jsonwebtoken');

const API_BASE = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET;

async function runTests() {
  console.log('==================================================');
  console.log('  TESTING PORTAL ADMISSION & STATUS TRACKING APIS');
  console.log('==================================================\n');

  // Generate parent token
  const parentPayload = {
    id: 'test-parent-sara-id',
    fullName: 'Sara Ahmed',
    email: 'sara.ahmed@example.com',
    phone: '+1 (555) 234-5678',
    role: 'PARENT'
  };
  const token = jwt.sign(parentPayload, JWT_SECRET, { expiresIn: '1h' });

  // 1. GET /api/admissions/form-options
  console.log('--- 1. Testing GET /api/admissions/form-options ---');
  try {
    const res = await fetch(`${API_BASE}/admissions/form-options`);
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Relationships:', data.relationships.map(r => r.label));
    console.log('Requested Classes:', data.requestedClasses.map(c => c.label));
    console.log('Desired Terms:', data.desiredTerms.map(t => t.label));
    console.log('Office Guidance:', data.officeGuidance.title);
    if (res.status === 200 && data.relationships.length > 0) {
      console.log('PASS: Form options retrieved successfully.\n');
    } else {
      console.error('FAIL: Form options failed.\n');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }

  // 2. POST /api/admissions/portal-apply without childName (Validation test)
  console.log('--- 2. Testing POST /api/admissions/portal-apply (Validation Error) ---');
  try {
    const res = await fetch(`${API_BASE}/admissions/portal-apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        relationship: 'Mother',
        childName: '',
        requestedClass: 'Toddlers (13-24 mo)'
      })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Response:', data);
    if (res.status === 400 && data.field === 'childName') {
      console.log('PASS: Correctly rejected submission without child name.\n');
    } else {
      console.error('FAIL: Expected 400 validation error.\n');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }

  // 3. POST /api/admissions/portal-apply (Successful Submission)
  let createdAppNumber = '';
  console.log('--- 3. Testing POST /api/admissions/portal-apply (Success) ---');
  try {
    const res = await fetch(`${API_BASE}/admissions/portal-apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        relationship: 'Mother',
        childName: 'Adam Ahmed',
        childDob: '2025-04-14',
        gender: 'Male',
        requestedClass: 'Toddlers (13-24 mo)',
        desiredTerm: 'Spring Term (Jan 2027)',
        notes: 'Enjoys music and sensory games, no known allergies.'
      })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Message:', data.message);
    console.log('Application Number:', data.applicationNumber);
    console.log('Tracking Breadcrumb:', data.trackingBreadcrumb);
    createdAppNumber = data.applicationNumber;
    if (res.status === 201 && data.applicationNumber) {
      console.log('PASS: Admission request successfully created with application number.\n');
    } else {
      console.error('FAIL: Failed to submit admission.\n');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }

  // 4. GET /api/admissions/status/#TJ-ADM-2026-8492 (Exact Screenshot Mockup)
  console.log('--- 4. Testing GET /api/admissions/status/#TJ-ADM-2026-8492 (UI Screen Data) ---');
  try {
    const encoded = encodeURIComponent('#TJ-ADM-2026-8492');
    const res = await fetch(`${API_BASE}/admissions/status/${encoded}`);
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('App Number:', data.applicationNumber);
    console.log('Status Banner:', data.statusBanner.title, `(${data.statusBanner.stageIndicator})`);
    console.log('Child:', data.applicationDetails.child.name, '-', data.applicationDetails.child.age);
    console.log('Parent:', data.applicationDetails.parent.name, '-', data.applicationDetails.parent.role);
    console.log('Milestones count:', data.journeyMilestones.length);
    data.journeyMilestones.forEach(m => console.log(`  Step ${m.step}: ${m.title} [${m.stageLabel}]`));
    console.log('What Happens Next steps:', data.whatHappensNext.length);
    console.log('Office Phone:', data.admissionsOfficeSupport.phone);
    if (res.status === 200 && data.applicationNumber === '#TJ-ADM-2026-8492') {
      console.log('PASS: Mockup status data perfectly matches right screen!\n');
    } else {
      console.error('FAIL: Status endpoint failed for #TJ-ADM-2026-8492\n');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }

  // 5. GET /api/admissions/status/:createdAppNumber (Live Created Record)
  if (createdAppNumber) {
    console.log(`--- 5. Testing GET /api/admissions/status/${createdAppNumber} ---`);
    try {
      const encoded = encodeURIComponent(createdAppNumber);
      const res = await fetch(`${API_BASE}/admissions/status/${encoded}`);
      const data = await res.json();
      console.log(`Status: ${res.status}`);
      console.log('Retrieved Application:', data.applicationNumber);
      console.log('Child Details:', data.applicationDetails.child);
      if (res.status === 200 && data.applicationNumber === createdAppNumber) {
        console.log('PASS: Successfully fetched live created status!\n');
      } else {
        console.error('FAIL: Live status check failed.\n');
      }
    } catch (err) {
      console.error('Error:', err.message);
    }
  }

  // 6. GET /api/admissions/my-applications
  console.log('--- 6. Testing GET /api/admissions/my-applications (Parent Portal List) ---');
  try {
    const res = await fetch(`${API_BASE}/admissions/my-applications`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Total applications for parent: ${data.total}`);
    if (res.status === 200 && Array.isArray(data.applications)) {
      console.log('PASS: Parent applications list retrieved successfully.\n');
    } else {
      console.error('FAIL: Failed to fetch parent applications list.\n');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }

  console.log('==================================================');
  console.log('  ALL TESTS FINISHED!');
  console.log('==================================================');
}

runTests();
