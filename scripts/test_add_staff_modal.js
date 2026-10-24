async function testAddStaffModal() {
  console.log('Testing "Add New Staff" Modal API Endpoints...\n');

  // 1. Authenticate as Admin
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@school.com', password: 'admin123' })
  });
  const { token } = await loginRes.json();
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // 2. Test Dropdown Helper 1: Roles
  const rolesRes = await fetch('http://localhost:5000/api/staff/roles', { headers });
  const roles = await rolesRes.json();
  console.log('1. Modal Dropdown [Role *]:', roles);

  // 3. Test Dropdown Helper 2: Employment Types
  const empTypesRes = await fetch('http://localhost:5000/api/staff/employment-types', { headers });
  const empTypes = await empTypesRes.json();
  console.log('2. Modal Dropdown [Employment Type]:', empTypes);

  // 4. Test Dropdown Helper 3: Assigned Classroom (with helper info)
  const classDropdownRes = await fetch('http://localhost:5000/api/staff/classrooms-dropdown', { headers });
  const classrooms = await classDropdownRes.json();
  console.log('\n3. Modal Dropdown [Assigned Classroom]:');
  classrooms.forEach(c => console.log(`   - ${c.name} -> "${c.helperText}"`));

  // Find "Nursery C - Meadow Robins"
  const nurseryC = classrooms.find(c => c.name.includes('Nursery C')) || classrooms[0];

  // 5. Submit "Add New Staff" modal exactly as shown in screenshot
  const modalPayload = {
    fullName: 'Claire Bennett',
    role: 'Teacher (Nursery Staff)',
    employmentType: 'Full-Time Regular',
    emailAddress: 'claire.bennett@tomjerrynursery.com',
    phoneNumber: '+1 (555) 914-7720',
    assignedClassroom: nurseryC.id,
    employmentStatus: 'Active'
  };

  console.log('\n4. Submitting "Create Staff" Modal Payload:');
  console.log(JSON.stringify(modalPayload, null, 2));

  const createRes = await fetch('http://localhost:5000/api/staff', {
    method: 'POST',
    headers,
    body: JSON.stringify(modalPayload)
  });
  const created = await createRes.json();
  console.log('\n5. Response Status:', createRes.status);
  console.log('Response Body:', JSON.stringify(created, null, 2));

  // 6. Verify Claire Bennett in Staff List
  const verifyRes = await fetch('http://localhost:5000/api/staff?search=claire', { headers });
  const verify = await verifyRes.json();
  console.log('\n6. Verified in Staff Table:');
  console.log(JSON.stringify(verify.data[0], null, 2));
}

testAddStaffModal().catch(console.error);
