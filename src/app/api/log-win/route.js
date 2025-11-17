import fs from 'fs';
import path from 'path';

const LOGS_DIR = path.join(process.cwd(), 'logs');
const LOGS_FILE = path.join(LOGS_DIR, 'wins.json');

// Ensure folder and valid empty array exist
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}
if (!fs.existsSync(LOGS_FILE)) {
  fs.writeFileSync(LOGS_FILE, JSON.stringify([], null, 2), 'utf8');
}

export async function POST(request) {
  try {
    const data = await request.json();

    // Read safely — if file corrupted, reset to empty array
    let logs = [];
    try {
      const content = fs.readFileSync(LOGS_FILE, 'utf8').trim();
      if (content) logs = JSON.parse(content);
    } catch (e) {
      console.warn('Corrupted wins.json, resetting...');
      logs = [];
    }

    logs.push(data);
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf8');

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Win log error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}