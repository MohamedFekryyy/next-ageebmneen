import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Add timestamp and basic info
    const logEntry = {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      ...data
    };

    // Define log file path
    const logDir = path.join(process.cwd(), 'logs');
    const logFile = path.join(logDir, 'submissions.json');

    // Ensure logs directory exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Read existing logs or create empty array
    let logs = [];
    if (fs.existsSync(logFile)) {
      const fileContent = fs.readFileSync(logFile, 'utf8');
      try {
        logs = JSON.parse(fileContent);
      } catch {
        logs = [];
      }
    }

    // Add new entry
    logs.push(logEntry);

    // Keep only last 1000 entries to prevent file from growing too large
    if (logs.length > 1000) {
      logs = logs.slice(-1000);
    }

    // Write back to file
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging submission:', error);
    return NextResponse.json({ error: 'Failed to log submission' }, { status: 500 });
  }
} 