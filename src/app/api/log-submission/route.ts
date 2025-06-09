import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Rate limiting for production
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // Max 10 submissions per minute per IP

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(key);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  record.count++;
  return true;
}

function validateSubmissionData(data: unknown): boolean {
  // Basic validation for required fields
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  
  const submission = data as Record<string, unknown>;
  
  return (
    typeof submission.mode === 'string' &&
    typeof submission.country === 'string' &&
    typeof submission.foreignPrice === 'number' &&
    typeof submission.localPrice === 'number' &&
    typeof submission.totalAbroad === 'number' &&
    typeof submission.savings === 'number' &&
    typeof submission.isCheaperAbroad === 'boolean' &&
    submission.foreignPrice >= 0 &&
    submission.localPrice >= 0 &&
    submission.totalAbroad >= 0 &&
    submission.savings >= 0
  );
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request);
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const data = await request.json();
    
    // Validate input data
    if (!validateSubmissionData(data)) {
      return NextResponse.json(
        { error: 'Invalid submission data' },
        { status: 400 }
      );
    }
    
    // Add timestamp and basic info
    const logEntry = {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      referer: request.headers.get('referer') || 'unknown',
      ...data
    };

    // In production (Vercel), use structured console logging
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      // Use structured logging for better parsing in Vercel
      console.log('SUBMISSION_LOG:', JSON.stringify({
        type: 'submission',
        timestamp: logEntry.timestamp,
        data: logEntry
      }));
      
      // Also try to send to external logging service if configured
      await sendToExternalLogger(logEntry);
      
      return NextResponse.json({ 
        success: true, 
        method: 'console',
        timestamp: logEntry.timestamp 
      });
    }

    // For local development, use file system
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

    return NextResponse.json({ 
      success: true, 
      method: 'file',
      timestamp: logEntry.timestamp 
    });
  } catch (error) {
    console.error('Error logging submission:', error);
    return NextResponse.json(
      { error: 'Failed to log submission' }, 
      { status: 500 }
    );
  }
}

// Optional: Send to external logging service (e.g., LogRocket, Sentry, etc.)
async function sendToExternalLogger(logEntry: Record<string, unknown>): Promise<void> {
  try {
    // Example: Send to a webhook or external logging service
    const webhookUrl = process.env.LOGGING_WEBHOOK_URL;
    
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LOGGING_WEBHOOK_TOKEN || ''}`,
        },
        body: JSON.stringify({
          source: 'ageebmneen',
          environment: process.env.NODE_ENV || 'production',
          log: logEntry
        }),
        // Don't wait too long for external service
        signal: AbortSignal.timeout(5000)
      });
    }
  } catch (error) {
    // Don't fail the main request if external logging fails
    console.warn('Failed to send to external logger:', error);
  }
} 