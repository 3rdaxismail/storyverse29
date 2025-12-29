/**
 * Fetch and parse Figma design from node-id 23-110
 * File: zuWEY4gNbhwescluD1WZAC
 */

const fs = require('fs');
const path = require('path');

async function fetchFigmaDesign() {
  const fileId = 'zuWEY4gNbhwescluD1WZAC';
  const nodeId = '23-110';

  console.log('🔍 Fetching Figma design...');
  console.log(`   File ID: ${fileId}`);
  console.log(`   Node ID: ${nodeId}\n`);

  try {
    // Connect via WebSocket
    const WebSocket = require('ws');
    const ws = new WebSocket('ws://localhost:3060');

    let designData = null;
    let connected = false;

    ws.on('open', () => {
      console.log('✅ Connected to WebSocket server');
      connected = true;

      // Join channel
      ws.send(
        JSON.stringify({
          type: 'join',
          channel: 'design-fetch',
        })
      );

      // Request file
      setTimeout(() => {
        console.log('📁 Requesting file data...');
        ws.send(
          JSON.stringify({
            type: 'message',
            channel: 'design-fetch',
            action: 'getFile',
            fileId,
            nodeId,
          })
        );
      }, 500);
    });

    ws.on('message', (data: string) => {
      try {
        const message = JSON.parse(data);
        console.log('📨 Received:', JSON.stringify(message, null, 2));

        if (message.document) {
          designData = message.document;
        }
      } catch (e) {
        console.log('📨 Raw message:', data);
      }
    });

    ws.on('error', (error: Error) => {
      console.error('❌ WebSocket error:', error.message);
      process.exit(1);
    });

    ws.on('close', () => {
      console.log('🔌 Disconnected');
      if (designData) {
        console.log('\n✨ Design data received:');
        console.log(JSON.stringify(designData, null, 2));
      }
      process.exit(0);
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      console.log('\n⏱️  Timeout - closing connection');
      ws.close();
    }, 10000);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fetchFigmaDesign();
