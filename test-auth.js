// made by namar0x0309 with ❤️ at GoAIX
import { spawn } from 'child_process';

console.log('Testing Wekan MCP Server Authentication Options\n');

// Test 1: No authentication (should fail)
console.log('Test 1: No authentication variables set');
const test1 = spawn('node', ['dist/server.js'], {
  env: { ...process.env, WEKAN_BASE_URL: 'http://localhost:3000' }
});

test1.stderr.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Set WEKAN_BASE_URL')) {
    console.log('✅ Correctly failed with authentication error');
  }
});

test1.on('close', () => {
  // Test 2: Token authentication
  console.log('\nTest 2: Token authentication');
  const test2 = spawn('node', ['dist/server.js'], {
    env: { 
      ...process.env, 
      WEKAN_BASE_URL: 'http://localhost:3000',
      WEKAN_API_TOKEN: 'test-token'
    }
  });

  let test2Timeout = setTimeout(() => {
    console.log('✅ Token authentication started successfully');
    test2.kill();
  }, 1000);

  test2.on('close', () => {
    clearTimeout(test2Timeout);
  });

  // Test 3: Username/Password authentication
  console.log('\nTest 3: Username/Password authentication');
  const test3 = spawn('node', ['dist/server.js'], {
    env: { 
      ...process.env, 
      WEKAN_BASE_URL: 'http://localhost:3000',
      WEKAN_USERNAME: 'testuser',
      WEKAN_PASSWORD: 'testpass'
    }
  });

  let test3Timeout = setTimeout(() => {
    console.log('✅ Username/Password authentication started successfully');
    test3.kill();
  }, 1000);

  test3.on('close', () => {
    clearTimeout(test3Timeout);
    console.log('\n🎉 All authentication tests completed!');
  });
});
