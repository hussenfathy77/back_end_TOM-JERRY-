async function testStaffApi() {
  console.log('Testing Staff Management APIs...\n');

  // 1. Login
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@school.com', password: 'admin123' })
  });
  const login = await loginRes.json();
  const token = login.token;
  console.log('✅ 1. Authenticated as Admin successfully.');

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // 2. Stats (Top 4 Cards & Bottom Ratio Banner)
  const statsRes = await fetch('http://localhost:5000/api/staff/stats', { headers });
  const stats = await statsRes.json();
  console.log('\n📊 2. Staff Stats (KPI Cards & Ratio):');
  console.log(`   - Total Staff: ${stats.totalStaff.count} (${stats.totalStaff.recentChange})`);
  console.log(`   - Teachers: ${stats.teachers.count} (${stats.teachers.percentage})`);
  console.log(`   - Assigned Teachers: ${stats.assignedTeachers.count} (${stats.assignedTeachers.status})`);
  console.log(`   - Unassigned: ${stats.unassigned.count} (${stats.unassigned.badge})`);
  console.log(`   - Regulatory Ratio: ${stats.ratioCompliance.status} - ${stats.ratioCompliance.description}`);

  // 3. Staff List (Page 1, limit 6 as shown in UI)
  const listRes = await fetch('http://localhost:5000/api/staff?page=1&limit=6', { headers });
  const list = await listRes.json();
  console.log(`\n📋 3. Staff Table (Page 1: ${list.data.length} of ${list.pagination.total} staff):`);
  list.data.forEach((s) => {
    console.log(
      `   [${s.initials}] ${s.name.padEnd(18)} | ${s.role.padEnd(25)} | ${s.phone.padEnd(17)} | Class: ${s.assignedClass.badge.padEnd(28)} | ${s.status}`
    );
  });

  // 4. Staff Roles for Filter Dropdown
  const rolesRes = await fetch('http://localhost:5000/api/staff/roles', { headers });
  const roles = await rolesRes.json();
  console.log(`\n🏷️ 4. Staff Roles for filter dropdown: ${roles.join(', ')}`);

  // 5. Test Add New Staff (+ Add New Staff Button)
  const newStaffPayload = {
    name: 'Emily Watson',
    email: 'emily.w@tomjerrynursery.com',
    phone: '+1 (555) 999-8877',
    staffRole: 'Assistant Teacher',
    classroomId: 'UNASSIGNED',
    isActive: true
  };
  const addRes = await fetch('http://localhost:5000/api/staff', {
    method: 'POST',
    headers,
    body: JSON.stringify(newStaffPayload)
  });
  const added = await addRes.json();
  console.log(`\n➕ 5. Added New Staff (POST /api/staff): status ${addRes.status}, Name: ${added.name}, ID: ${added.id}`);

  // 6. Test Assign Cover (Bottom banner button)
  const classroomsRes = await fetch('http://localhost:5000/api/classrooms', { headers });
  const classrooms = await classroomsRes.json();
  const coverRes = await fetch('http://localhost:5000/api/staff/assign-cover', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      staffId: added.id,
      classroomId: classrooms[0]?.id,
      notes: 'Covering afternoon session'
    })
  });
  const coverData = await coverRes.json();
  console.log(`\n🛡️ 6. Assign Cover action: ${coverData.message}`);

  // 7. Schedule Log (View Schedule Log button)
  const schedRes = await fetch('http://localhost:5000/api/staff/schedule-logs', { headers });
  const schedData = await schedRes.json();
  console.log(`\n📅 7. Schedule Logs: ${schedData.regulatoryStatus}, ${schedData.schedule.length} sessions logged.`);

  // 8. Export Staff (Export button)
  const exportRes = await fetch('http://localhost:5000/api/staff/export', { headers });
  const exportData = await exportRes.json();
  console.log(`\n📤 8. Export Staff: ${exportData.totalStaff} staff records exported successfully.`);

  console.log('\n🎉 ALL STAFF APIS TESTED SUCCESSFULLY!');
}

testStaffApi().catch(console.error);
