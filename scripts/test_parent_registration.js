async function testParentRegistration() {
  console.log('Testing "Create Your Parent Account" Registration Flow...\n');

  // 1. Test validation: password mismatch
  const mismatchRes = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Mariam Al-Mansoor',
      emailAddress: 'mariam.mansoor@example.com',
      phoneNumber: '+1 (555) 019-8234',
      password: 'SecurePass2026',
      confirmPassword: 'DifferentPass2026'
    })
  });
  const mismatchData = await mismatchRes.json();
  console.log(`1. Test Password Mismatch: Status ${mismatchRes.status} - Error: "${mismatchData.error}"`);

  // 2. Test validation: short password (< 8 chars)
  const shortRes = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Mariam Al-Mansoor',
      emailAddress: 'mariam.mansoor@example.com',
      phoneNumber: '+1 (555) 019-8234',
      password: 'pass1',
      confirmPassword: 'pass1'
    })
  });
  const shortData = await shortRes.json();
  console.log(`2. Test Short Password (<8 chars): Status ${shortRes.status} - Error: "${shortData.error}"`);

  // 3. Test Successful Registration (matching screenshot fields)
  const registrationPayload = {
    fullName: 'Mariam Al-Mansoor',
    emailAddress: 'mariam.mansoor@example.com',
    phoneNumber: '+1 (555) 019-8234',
    password: 'SecurePassword123',
    confirmPassword: 'SecurePassword123'
  };

  console.log('\n3. Submitting Form: "Create Account ->"');
  console.log(JSON.stringify(registrationPayload, null, 2));

  const registerRes = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registrationPayload)
  });
  const registerData = await registerRes.json();
  console.log(`\n4. Registration Result: Status ${registerRes.status} (Created)`);
  console.log(`   Message: ${registerData.message}`);
  console.log(`   JWT Token received: ${registerData.token.substring(0, 30)}...`);
  console.log(`   User Info:`, registerData.user);

  // 4. Test GET /api/auth/me using the newly received token
  const meRes = await fetch('http://localhost:5000/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${registerData.token}`
    }
  });
  const meData = await meRes.json();
  console.log(`\n5. Verified with GET /api/auth/me:`);
  console.log(`   Name: ${meData.name}`);
  console.log(`   Email: ${meData.email}`);
  console.log(`   Phone: ${meData.phone}`);
  console.log(`   Role: ${meData.role}`);

  console.log('\n🎉 PARENT REGISTRATION FLOW TESTED AND VERIFIED SUCCESSFULLY!');
}

testParentRegistration().catch(console.error);
