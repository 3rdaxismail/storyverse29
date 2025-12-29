const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3060');

ws.on('open', () => {
  console.log('✅ WebSocket connection SUCCESSFUL!');
  console.log('📡 Connected to ws://localhost:3060');
  ws.close();
  process.exit(0);
});

ws.on('error', (error) => {
  console.error('❌ WebSocket connection FAILED!');
  console.error('Error code:', error.code);
  console.error('Error message:', error.message);
  console.error('Full error:', JSON.stringify(error, null, 2));
  process.exit(1);
});

ws.on('close', () => {
  console.log('Connection closed');
});

// Timeout after 5 seconds
setTimeout(() => {
  console.error('❌ Timeout: Could not connect to server');
  process.exit(1);
}, 5000);
