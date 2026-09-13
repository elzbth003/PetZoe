// test_profile_validation.js
const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function run() {
  console.log('--- 1. Login as Pet Owner (owner@petverse.com) ---');
  const loginRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'owner@petverse.com', password: 'Password123!' });

  if (loginRes.status !== 200 || !loginRes.body.token) {
    console.error('Login failed:', loginRes);
    process.exit(1);
  }
  const token = loginRes.body.token;
  console.log('Login successful! Testing profile validation rules...');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  async function testProfile(description, payload, expectedStatus) {
    const res = await request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/users/me',
      method: 'PUT',
      headers: authHeaders
    }, payload);

    const passed = res.status === expectedStatus;
    console.log(`${passed ? '✅' : '❌'} [${res.status}] ${description}`);
    if (!passed || expectedStatus === 400) {
      console.log('   Response:', typeof res.body === 'object' ? JSON.stringify(res.body) : res.body);
    }
    return passed;
  }

  let allPassed = true;

  // Test 1: Whitespace-only address
  allPassed = await testProfile(
    'Reject whitespace-only address ("   ")',
    { name: 'Alex Rivera', address: '   ' },
    400
  ) && allPassed;

  // Test 2: Address too short ("abc")
  allPassed = await testProfile(
    'Reject address under 5 characters ("abc")',
    { name: 'Alex Rivera', address: 'abc' },
    400
  ) && allPassed;

  // Test 3: Address with script tags
  allPassed = await testProfile(
    'Reject address containing script tags ("123 Main St <script>")',
    { name: 'Alex Rivera', address: '123 Main St <script>' },
    400
  ) && allPassed;

  // Test 4: Whitespace-only bio
  allPassed = await testProfile(
    'Reject whitespace-only bio ("   ")',
    { name: 'Alex Rivera', bio: '   ' },
    400
  ) && allPassed;

  // Test 5: Bio too short ("Hello")
  allPassed = await testProfile(
    'Reject bio under 10 characters ("Hello")',
    { name: 'Alex Rivera', bio: 'Hello' },
    400
  ) && allPassed;

  // Test 6: Bio with script tags
  allPassed = await testProfile(
    'Reject bio containing HTML/script tags ("Passionate parent <script>alert(1)</script>")',
    { name: 'Alex Rivera', bio: 'Passionate parent <script>alert(1)</script>' },
    400
  ) && allPassed;

  // Test 7: Valid address and bio
  allPassed = await testProfile(
    'Accept valid address and bio ("742 Evergreen Terrace, Springfield")',
    {
      name: 'Alex Rivera',
      phone: '9876543210',
      address: '742 Evergreen Terrace, Springfield',
      bio: 'Passionate dog and cat parent dedicated to wellness, agility, and preventive care.'
    },
    200
  ) && allPassed;

  // Test 8: Empty address and bio (clearing optional fields)
  allPassed = await testProfile(
    'Accept empty address and bio ("")',
    {
      name: 'Alex Rivera',
      phone: '9876543210',
      address: '',
      bio: ''
    },
    200
  ) && allPassed;

  console.log(allPassed ? '\n🎉 ALL PROFILE VALIDATION TESTS PASSED!' : '\n❌ SOME TESTS FAILED');
}

run().catch(console.error);
