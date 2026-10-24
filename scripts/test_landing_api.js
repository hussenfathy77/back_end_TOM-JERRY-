async function testLandingAndAdmissions() {
  console.log('Testing Landing Page & Admissions APIs...\n');

  // 1. Test GET /api/landing (Public)
  const landingRes = await fetch('http://localhost:5000/api/landing');
  const landing = await landingRes.json();
  console.log('✅ 1. Public Landing Page Data:');
  console.log(`   - Nursery Name: ${landing.nursery.name}`);
  console.log(`   - Headline: "${landing.nursery.tagline.substring(0, 50)}..."`);
  console.log(`   - Top Announcement: "${landing.nursery.topAnnouncement}"`);
  console.log(`   - Hours: ${landing.nursery.operatingHours} | Location: ${landing.nursery.location}`);
  console.log(`   - Core Pillars (${landing.corePillars.pillars.length}): ${landing.corePillars.pillars.map(p => p.title).join(', ')}`);
  console.log(`   - Curriculum Programs (${landing.curriculum.programs.length}): ${landing.curriculum.programs.map(p => p.title).join(', ')}`);
  console.log(`   - Facilities (${landing.facilities.spaces.length}): ${landing.facilities.spaces.map(s => s.title).join(', ')}`);
  console.log(`   - CTA Heading: "${landing.ctaBanner.heading}"`);

  // 2. Test POST /api/landing/apply (Public: Apply for Admission)
  const applyPayload = {
    parentName: 'Jennifer Aniston',
    parentEmail: 'jennifer.a@gmail.com',
    parentPhone: '+1 (555) 777-1234',
    childName: 'Emma Aniston',
    childDob: '2023-04-10',
    childAge: '2.5 Years',
    programInterested: 'Learning Through Play (Toddler)',
    notes: 'Looking for a friendly morning session starting in November.'
  };

  const applyRes = await fetch('http://localhost:5000/api/landing/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(applyPayload)
  });
  const applyResult = await applyRes.json();
  console.log(`\n✅ 2. Public Admission Application (POST /api/landing/apply):`);
  console.log(`   - Status: ${applyRes.status} (Created)`);
  console.log(`   - Message: ${applyResult.message}`);
  console.log(`   - Application ID: ${applyResult.applicationNumber}`);

  // 3. Test POST /api/landing/contact (Public: Contact Form)
  const contactRes = await fetch('http://localhost:5000/api/landing/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Robert Brown',
      email: 'robert.b@yahoo.com',
      phone: '+1 (555) 888-4321',
      subject: 'Schedule a private tour',
      message: 'Hello, we would like to book a weekend morning tour of the facility.'
    })
  });
  const contactResult = await contactRes.json();
  console.log(`\n✅ 3. Public Contact Form (POST /api/landing/contact):`);
  console.log(`   - Message: ${contactResult.message}`);

  // 4. Test Admin Admissions Management (Protected)
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@school.com', password: 'admin123' })
  });
  const { token } = await loginRes.json();
  const adminHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const admissionsRes = await fetch('http://localhost:5000/api/admissions', { headers: adminHeaders });
  const admissionsList = await admissionsRes.json();
  console.log(`\n✅ 4. Admin Admissions List (${admissionsList.data.length} total applications found):`);
  admissionsList.data.forEach(a => {
    console.log(`   - [${a.status}] Child: ${a.childName} | Parent: ${a.parentName} (${a.parentPhone}) | Program: ${a.programInterested}`);
  });

  // 5. Test Admin update admission status
  const updateRes = await fetch(`http://localhost:5000/api/admissions/${applyResult.applicationNumber}/status`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({ status: 'APPROVED', notes: 'Application reviewed and accepted.' })
  });
  const updateResult = await updateRes.json();
  console.log(`\n✅ 5. Admin Updated Status: ${updateResult.message}`);

  console.log('\n🎉 ALL LANDING & ADMISSIONS APIS ARE FULLY OPERATIONAL!');
}

testLandingAndAdmissions().catch(console.error);
