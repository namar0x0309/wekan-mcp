// made by namar0x0309 with ❤️ at GoAIX
import { spawn } from 'child_process';
import { createInterface } from 'readline';

// Spawn the MCP server process
const server = spawn('node', ['dist/server.js'], {
  env: {
    ...process.env,
    WEKAN_BASE_URL: 'http://localhost:3000', // Test URL
    WEKAN_API_TOKEN: 'test-token' // Test token
  }
});

console.log('MCP Server Test Started');

// Handle server stdout
server.stdout.on('data', (data) => {
  console.log('Server stdout:', data.toString());
});

// Handle server stderr
server.stderr.on('data', (data) => {
  console.log('Server stderr:', data.toString());
});

// Handle server exit
server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Handle server errors
server.on('error', (error) => {
  console.log('Server error:', error);
});

// Keep the process alive for testing
setTimeout(() => {
  console.log('Test completed');
  server.kill();
}, 5000);
