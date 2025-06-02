import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // In production (Vercel), file system is read-only
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      return NextResponse.json({ 
        logs: [],
        message: 'Production logs are stored in Vercel function logs. Check Vercel dashboard for SUBMISSION_LOG entries.',
        environment: 'production'
      });
    }

    // For local development, read from file system
    const logFile = path.join(process.cwd(), 'logs', 'submissions.json');
    
    if (!fs.existsSync(logFile)) {
      return NextResponse.json({ 
        logs: [],
        message: 'No logs file found. Submit some forms to generate logs.',
        environment: 'development'
      });
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

    return NextResponse.json({ 
      logs,
      message: `Found ${logs.length} log entries`,
      environment: 'development'
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
} 