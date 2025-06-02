import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const logFile = path.join(process.cwd(), 'logs', 'submissions.json');
    
    if (!fs.existsSync(logFile)) {
      return NextResponse.json({ logs: [] });
    }

    const fileContent = fs.readFileSync(logFile, 'utf8');
    let logs = [];
    
    try {
      logs = JSON.parse(fileContent);
    } catch {
      logs = [];
    }

    // Sort by timestamp (newest first)
    logs.sort((a: { timestamp: string }, b: { timestamp: string }) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
} 