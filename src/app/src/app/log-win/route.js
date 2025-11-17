import fs from 'fs';
import path from 'path';

const LOGS_DIR = path.join(process.cwd(), 'logs');
const LOGS_FILE = path.join(LOGS_DIR, 'wins.json');

// Ensure folder/file exist
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}
if (!fs.existsSync(LOGS_FILE)) {
  fs.writeFileSync(LOGS_FILE, JSON.stringify([]), 'utf8');
}

export async function POST(request) {
  try {
    const data = await request.json(); // { publicKey, amount, game, username, timestamp }
    
    // Read existing logs
    const logs = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8'));
    
    // Append new win
    logs.push(data);
    
    // Write back
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf8');
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Log error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}