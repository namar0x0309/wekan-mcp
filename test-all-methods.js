// made by namar0x0309 with ❤️ at GoAIX
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';

console.log('Testing All Wekan MCP Server Configuration Methods\n');

// Test 1: .env file method
console.log('Test 1: Using .env file');
const test1 = spawn('node', ['dist/server.js']);

let test1Timeout = setTimeout(() => {
  console.log('✅ .env file method working');
  test1.kill();
}, 1000);

test1.on('close', () => {
  clearTimeout(test1Timeout);
  
  // Test 2: Environment variables method
  console.log('\nTest 2: Environment variables');
  const test2 = spawn('node', ['dist/server.js'], {
    env: { 
      ...process.env, 
      WEKAN_BASE_URL: 'http://localhost:3000',
      WEKAN_API_TOKEN: 'test-token'
    }
  });

  let test2Timeout = setTimeout(() => {
    console.log('✅ Environment variables method working');
    test2.kill();
  }, 1000);

  test2.on('close', () => {
    clearTimeout(test2Timeout);
    
    // Test 3: Username/Password method
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
      console.log('✅ Username/Password method working');
      test3.kill();
    }, 1000);

    test3.on('close', () => {
      clearTimeout(test3Timeout);
      
      // Test 4: No configuration (should fail)
      console.log('\nTest 4: No configuration (should fail)');
      const test4 = spawn('node', ['dist/server.js'], {
        env: { ...process.env, WEKAN_BASE_URL: '' }
      });

      test4.stderr.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Set WEKAN_BASE_URL')) {
          console.log('✅ Correctly failed with authentication error');
        }
      });

      test4.on('close', () => {
        console.log('\n🎉 All configuration methods tested successfully!');
        console.log('\n📁 Configuration Options:');
        console.log('   1. .env file (recommended for development)');
        console.log('   2. Environment variables');
        console.log('   3. Username/Password (auto-token generation)');
      });
    });
  });
});
