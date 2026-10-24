const http = require('http');

async function testApi() {
  // 1. Login
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@school.com', password: 'admin123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('1. Login successful. User:', loginData.user.name, 'Role:', loginData.user.role);

  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // 2. Get Stats
  const statsRes = await fetch('http://localhost:5000/api/classrooms/stats', { headers: authHeaders });
  const stats = await statsRes.json();
  console.log('2. Stats:', JSON.stringify(stats, null, 2));

  // 3. Get Available Teachers (for the modal dropdown)
  const teachersRes = await fetch('http://localhost:5000/api/classrooms/available-teachers?includeAssigned=true', { headers: authHeaders });
  const teachers = await teachersRes.json();
  console.log(`3. Available Teachers: ${teachers.length} found`);
  teachers.forEach(t => console.log(`   - ${t.name} (${t.email})`));

  // 4. Test "Add New Class" modal API (POST /api/classrooms)
  const newClassPayload = {
    name: 'Nursery C - Meadow Robins',
    description: 'Morning toddler playroom focused on sensory play and early social development.',
    capacity: 15,
    academicYear: '2026/2027 • Term 1',
    teacherId: teachers[1]?.id || null, // Sarah Ahmed
    status: 'ACTIVE'
  };

  console.log('\n4. Testing Add New Class (POST /api/classrooms) with modal data:', newClassPayload);
  const createRes = await fetch('http://localhost:5000/api/classrooms', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(newClassPayload)
  });
  const createdClass = await createRes.json();
  console.log('   Response status:', createRes.status);
  console.log('   Created class:', createdClass);

  // 5. Get All Classrooms
  const listRes = await fetch('http://localhost:5000/api/classrooms', { headers: authHeaders });
  const list = await listRes.json();
  console.log(`\n5. Total classrooms in DB now: ${list.length}`);
  list.forEach(c => {
    console.log(`   * ${c.name} | Cap: ${c.capacity} | Enrolled: ${c.enrolled} | Teacher: ${c.teacher?.name || 'Unassigned'} | Status: ${c.status}`);
  });

  // 6. Get Today Schedule
  const schedRes = await fetch('http://localhost:5000/api/classrooms/schedule/today', { headers: authHeaders });
  const sched = await schedRes.json();
  console.log(`\n6. Today sessions: ${sched.length} sessions found.`);
  sched.forEach(s => console.log(`   * [${s.startTime}-${s.endTime}] ${s.title} (${s.classroom?.name})`));
}

testApi().catch(console.error);
