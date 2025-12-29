import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';
import * as url from 'url';
import * as dotenv from 'dotenv';

dotenv.config();

const FIGMA_TOKEN = process.env.FIGMA_API_TOKEN;
const FILE_ID = 'ANcQmXcFFJNmLJQR5UOanT';
const NODE_ID = '4311-6';

console.log('Fetching Figma design data...');
console.log(`File ID: ${FILE_ID}`);
console.log(`Node ID: ${NODE_ID}`);

const apiUrl = `https://api.figma.com/v1/files/${FILE_ID}/nodes?ids=${NODE_ID}`;

const options = {
  hostname: 'api.figma.com',
  port: 443,
  path: `/v1/files/${FILE_ID}/nodes?ids=${NODE_ID}`,
  method: 'GET',
  headers: {
    'X-FIGMA-TOKEN': FIGMA_TOKEN,
  },
};

https.get(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const figmaData = JSON.parse(data);
      fs.writeFileSync(
        path.join(path.dirname(new URL(import.meta.url).pathname.substring(1)), '../figma-dashboard-design.json'),
        JSON.stringify(figmaData, null, 2)
      );
      console.log('Design data saved to figma-dashboard-design.json');
      console.log(JSON.stringify(figmaData, null, 2));
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  });
}).on('error', (error) => {
  console.error('Error fetching from Figma API:', error);
});
