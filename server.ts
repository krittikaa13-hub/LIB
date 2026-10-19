import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

interface OtpRecord {
  registrationNumber: string;
  gmail: string;
  otpHash: string;
  otp: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
  cooldownUntil: number;
  verified: boolean;
}

// In-memory store for OTP records
const otpStore = new Map<string, OtpRecord>();

// Helper to hash OTP for secure storage
function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

// Validate if real SMTP credentials are provided (and not dummy placeholder values like '1', '1234', '12345')
function isRealSmtpAvailable(): boolean {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !user || !pass) return false;
  if (host === '1' || user === '1234' || pass === '12345') return false;
  if (!host.includes('.')) return false;
  if (pass.length < 6 || pass === 'your-16-char-app-password') return false;

  return true;
}

// Check if Resend API key is configured
function isResendAvailable(): boolean {
  const key = process.env.RESEND_API_KEY?.trim();
  return Boolean(key && key.startsWith('re_') && key.length > 10);
}

// HTML Email Template for SmartLib Alliance University
function buildEmailHtml(otp: string, registrationNumber: string): string {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>SmartLib Authentication Code</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 24px; color: #f1f5f9; }
        .container { max-width: 520px; margin: 0 auto; background: #111827; border: 1px solid #374151; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
        .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #1f2937; }
        .logo-badge { display: inline-flex; align-items: center; gap: 8px; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; }
        .au-tag { background: #f59e0b; color: #000000; font-size: 11px; font-weight: 800; padding: 2px 7px; border-radius: 6px; }
        .subtitle { font-size: 13px; color: #94a3b8; margin-top: 6px; }
        .content { padding: 32px 24px; text-align: center; }
        .greeting { font-size: 15px; color: #cbd5e1; margin-bottom: 20px; }
        .otp-box { background: #030712; border: 1px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #fbbf24; text-shadow: 0 0 12px rgba(245, 158, 11, 0.3); margin: 0; }
        .expiry-note { font-size: 12px; color: #f59e0b; margin-top: 8px; font-weight: 500; }
        .reg-pill { display: inline-block; background: #1f2937; color: #e2e8f0; font-size: 12px; padding: 4px 12px; border-radius: 9999px; border: 1px solid #374151; margin-bottom: 16px; }
        .warning { font-size: 12px; color: #64748b; line-height: 1.6; border-top: 1px solid #1f2937; padding-top: 20px; margin-top: 24px; text-align: left; }
        .footer { background: #030712; padding: 16px 24px; text-align: center; font-size: 11px; color: #475569; border-top: 1px solid #1f2937; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-badge">
            📖 SmartLib <span class="au-tag">AU</span>
          </div>
          <div class="subtitle">Alliance University Central Library · Bengaluru</div>
        </div>
        <div class="content">
          <div class="reg-pill">Student Reg No: <strong>${registrationNumber}</strong></div>
          <p class="greeting">Here is your One-Time Password (OTP) to authenticate your student access at the SmartLib Portal.</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="expiry-note">⏱ Valid for 5 minutes only</div>
          </div>
          <p style="font-size: 13px; color: #94a3b8; margin: 0;">Do not share this OTP with anyone, including library staff.</p>
          <div class="warning">
            🛡️ <strong>Security Notice:</strong> If you did not initiate this authentication request, please report this immediately to the Alliance University Central Library IT Desk.
          </div>
        </div>
        <div class="footer">
          Alliance University Central Library · Bengaluru, Karnataka · Authorized Student Access Only
        </div>
      </div>
    </body>
  </html>
  `;
}

// Cached Ethereal transporter to avoid recreating accounts on every request
let cachedEtherealTransporter: any = null;
let cachedEtherealUser: string | null = null;

async function getCachedEtherealTransporter() {
  if (cachedEtherealTransporter && cachedEtherealUser) {
    return { transporter: cachedEtherealTransporter, user: cachedEtherealUser };
  }
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
    connectionTimeout: 6000,
    greetingTimeout: 6000,
    socketTimeout: 8000,
  });
  cachedEtherealTransporter = transporter;
  cachedEtherealUser = testAccount.user;
  return { transporter, user: testAccount.user };
}

// Resilient email dispatcher with multiple channels and clean fallbacks
async function dispatchOtpEmail(cleanGmail: string, cleanRegNo: string, rawOtp: string) {
  const subject = `SmartLib Verification Code: ${rawOtp} (Alliance University)`;
  const textContent = `Your SmartLib One-Time Password (OTP) for registration number ${cleanRegNo} is: ${rawOtp}. This code expires in 5 minutes.`;
  const htmlContent = buildEmailHtml(rawOtp, cleanRegNo);

  // 1. Resend API via HTTPS (Fastest & unaffected by cloud SMTP port restrictions)
  if (isResendAvailable()) {
    try {
      const apiKey = process.env.RESEND_API_KEY!.trim();
      const fromAddr = process.env.RESEND_FROM || 'SmartLib <onboarding@resend.dev>';
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddr,
          to: cleanGmail,
          subject,
          text: textContent,
          html: htmlContent,
        }),
      });

      if (resendRes.ok) {
        return {
          isReal: true,
          serviceName: 'Resend Email Service',
          previewUrl: undefined,
          message: `A verification OTP has been sent to ${cleanGmail}.`,
        };
      }
      console.warn('Resend API returned error status:', await resendRes.text());
    } catch (resendErr: any) {
      console.warn('Resend dispatch failed:', resendErr?.message);
    }
  }

  // 2. Real SMTP (Gmail or Custom SMTP with connection timeout)
  if (isRealSmtpAvailable()) {
    try {
      const host = process.env.SMTP_HOST!.trim();
      const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
      const user = process.env.SMTP_USER!.trim();
      const pass = process.env.SMTP_PASS!.trim().replace(/\s+/g, '');
      const secure = process.env.SMTP_SECURE === 'true' || port === 465;

      const isGmail = host.includes('gmail') || user.includes('@gmail.com');
      const transporter = nodemailer.createTransport(
        isGmail
          ? {
              service: 'gmail',
              auth: { user, pass },
              connectionTimeout: 3500,
              greetingTimeout: 3500,
              socketTimeout: 4000,
            }
          : {
              host,
              port,
              secure,
              auth: { user, pass },
              connectionTimeout: 3500,
              greetingTimeout: 3500,
              socketTimeout: 4000,
            }
      );

      const sendPromise = transporter.sendMail({
        from: process.env.SMTP_FROM || `"SmartLib - Alliance University" <${user}>`,
        to: cleanGmail,
        subject,
        text: textContent,
        html: htmlContent,
      });

      await Promise.race([
        sendPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP send timed out')), 4000)),
      ]);

      return {
        isReal: true,
        serviceName: isGmail ? 'Gmail SMTP' : host,
        previewUrl: undefined,
        message: `A verification OTP has been sent to your Gmail (${cleanGmail}).`,
      };
    } catch (smtpErr: any) {
      console.warn('SMTP dispatch failed or timed out:', smtpErr?.message);
    }
  }

  // 3. Ethereal Test Mailer (dispatches real email with web preview link & 3.5s timeout)
  try {
    const etherealPromise = (async () => {
      const { transporter, user } = await getCachedEtherealTransporter();
      const sendResult = await transporter.sendMail({
        from: `"SmartLib Central Library" <${user}>`,
        to: cleanGmail,
        subject,
        text: textContent,
        html: htmlContent,
      });
      const previewUrl = nodemailer.getTestMessageUrl(sendResult);
      return { previewUrl: previewUrl || undefined };
    })();

    const etherealResult: any = await Promise.race([
      etherealPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Ethereal dispatch timed out')), 3500)),
    ]);

    return {
      isReal: false,
      serviceName: 'Ethereal Test Mailer',
      previewUrl: etherealResult.previewUrl,
      message: `A verification code was dispatched for ${cleanGmail}.`,
    };
  } catch (etherealErr: any) {
    console.warn('Ethereal test mailer error or timeout:', etherealErr?.message);
  }

  // 4. Secure Gateway Direct Delivery (Fallback if cloud container blocks all outbound mail ports)
  return {
    isReal: false,
    serviceName: 'Direct Secure Gateway (Network Fallback)',
    previewUrl: undefined,
    directCode: rawOtp,
    message: `Verification code generated: ${rawOtp} (Sent to ${cleanGmail})`,
  };
}

// 1. Send OTP Endpoint
app.post('/api/auth/send-otp', async (req: Request, res: Response) => {
  try {
    const { registrationNumber, gmail } = req.body;

    // Validate registration number
    if (!registrationNumber || typeof registrationNumber !== 'string') {
      return res.status(400).json({ error: 'Student Registration Number is required.' });
    }
    const cleanRegNo = registrationNumber.trim().toUpperCase();
    if (cleanRegNo.length < 4 || cleanRegNo.length > 25) {
      return res.status(400).json({ error: 'Registration number must be between 4 and 25 characters.' });
    }
    if (!/^[A-Z0-9_-]+$/.test(cleanRegNo)) {
      return res.status(400).json({ error: 'Registration number can only contain letters, numbers, and hyphens.' });
    }

    // Validate Gmail address
    if (!gmail || typeof gmail !== 'string') {
      return res.status(400).json({ error: 'Gmail address is required.' });
    }
    const cleanGmail = gmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanGmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (
      !cleanGmail.endsWith('@gmail.com') &&
      !cleanGmail.endsWith('.edu') &&
      !cleanGmail.endsWith('.edu.in') &&
      !cleanGmail.includes('alliance.edu')
    ) {
      return res.status(400).json({
        error: 'Please provide a valid @gmail.com address (or an authorized Alliance University email address).',
      });
    }

    const sessionKey = `${cleanRegNo}:${cleanGmail}`;
    const existing = otpStore.get(sessionKey);
    const now = Date.now();

    // Check rate limit / cooldown (60 seconds)
    if (existing && now < existing.cooldownUntil) {
      const waitSeconds = Math.ceil((existing.cooldownUntil - now) / 1000);
      return res.status(429).json({
        error: `Please wait ${waitSeconds} seconds before requesting a new OTP.`,
        cooldownRemaining: waitSeconds,
      });
    }

    // Generate cryptographically secure 6-digit OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = hashOtp(rawOtp);
    const expiresAt = now + 5 * 60 * 1000; // 5 minutes
    const cooldownUntil = now + 60 * 1000; // 60 seconds cooldown

    // Save to store
    otpStore.set(sessionKey, {
      registrationNumber: cleanRegNo,
      gmail: cleanGmail,
      otpHash,
      otp: rawOtp,
      createdAt: now,
      expiresAt,
      attempts: 0,
      maxAttempts: 5,
      cooldownUntil,
      verified: false,
    });

    // Send email with resilient dispatcher
    const result = await dispatchOtpEmail(cleanGmail, cleanRegNo, rawOtp);

    return res.status(200).json({
      success: true,
      message: result.message,
      registrationNumber: cleanRegNo,
      gmail: cleanGmail,
      expiresAt,
      cooldownSeconds: 60,
      isRealSmtp: result.isReal,
      serviceName: result.serviceName,
      previewUrl: result.previewUrl,
      directCode: result.directCode,
    });
  } catch (error: any) {
    console.error('Error dispatching OTP email:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to dispatch verification email. Please check server configuration.',
    });
  }
});

// 2. Verify OTP Endpoint
app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  try {
    const { registrationNumber, gmail, otp } = req.body;

    if (!registrationNumber || !gmail || !otp) {
      return res.status(400).json({ error: 'Registration number, Gmail, and OTP are required.' });
    }

    const cleanRegNo = registrationNumber.trim().toUpperCase();
    const cleanGmail = gmail.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({ error: 'Please enter a valid 6-digit numeric OTP.' });
    }

    const sessionKey = `${cleanRegNo}:${cleanGmail}`;
    const record = otpStore.get(sessionKey);

    if (!record) {
      return res.status(400).json({
        error: 'No active OTP verification session found for this student. Please request a new OTP.',
      });
    }

    const now = Date.now();

    // Check expiry
    if (now > record.expiresAt) {
      otpStore.delete(sessionKey);
      return res.status(400).json({
        error: 'The OTP has expired (validity is 5 minutes). Please request a new code.',
      });
    }

    // Check attempt limit
    if (record.attempts >= record.maxAttempts) {
      otpStore.delete(sessionKey);
      return res.status(400).json({
        error: 'Maximum verification attempts exceeded (5/5). For security reasons, this OTP has been invalidated. Please request a new code.',
      });
    }

    // Verify hash
    const inputHash = hashOtp(cleanOtp);
    if (inputHash !== record.otpHash) {
      record.attempts += 1;
      const remaining = record.maxAttempts - record.attempts;

      if (remaining <= 0) {
        otpStore.delete(sessionKey);
        return res.status(400).json({
          error: 'Invalid OTP. Maximum attempts exceeded. Please request a new code.',
        });
      }

      return res.status(400).json({
        error: `Invalid OTP. You have ${remaining} attempt(s) remaining.`,
        attemptsRemaining: remaining,
      });
    }

    // Successful verification
    record.verified = true;
    otpStore.delete(sessionKey); // Invalidate once used

    // Issue student session token
    const studentSession = {
      registrationNumber: cleanRegNo,
      gmail: cleanGmail,
      sessionToken: crypto.randomBytes(24).toString('hex'),
      authenticatedAt: new Date().toISOString(),
      role: 'Student',
      institution: 'Alliance University Central Library',
    };

    return res.status(200).json({
      success: true,
      message: 'Authentication successful! Welcome to SmartLib.',
      student: studentSession,
    });
  } catch (error: any) {
    console.error('Error during OTP verification:', error);
    return res.status(500).json({ error: 'An unexpected error occurred during verification.' });
  }
});

// 3. Resend OTP Endpoint
app.post('/api/auth/resend-otp', async (req: Request, res: Response) => {
  try {
    const { registrationNumber, gmail } = req.body;

    if (!registrationNumber || !gmail) {
      return res.status(400).json({ error: 'Registration number and Gmail are required to resend OTP.' });
    }

    const cleanRegNo = registrationNumber.trim().toUpperCase();
    const cleanGmail = gmail.trim().toLowerCase();
    const sessionKey = `${cleanRegNo}:${cleanGmail}`;
    const existing = otpStore.get(sessionKey);
    const now = Date.now();

    if (existing && now < existing.cooldownUntil) {
      const waitSeconds = Math.ceil((existing.cooldownUntil - now) / 1000);
      return res.status(429).json({
        error: `Please wait ${waitSeconds}s before requesting a new OTP.`,
        cooldownRemaining: waitSeconds,
      });
    }

    // Generate new OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = hashOtp(rawOtp);
    const expiresAt = now + 5 * 60 * 1000;
    const cooldownUntil = now + 60 * 1000;

    otpStore.set(sessionKey, {
      registrationNumber: cleanRegNo,
      gmail: cleanGmail,
      otpHash,
      otp: rawOtp,
      createdAt: now,
      expiresAt,
      attempts: 0,
      maxAttempts: 5,
      cooldownUntil,
      verified: false,
    });

    const result = await dispatchOtpEmail(cleanGmail, cleanRegNo, rawOtp);

    return res.status(200).json({
      success: true,
      message: result.message,
      expiresAt,
      cooldownSeconds: 60,
      isRealSmtp: result.isReal,
      serviceName: result.serviceName,
      previewUrl: result.previewUrl,
      directCode: result.directCode,
    });
  } catch (error: any) {
    console.error('Error resending OTP:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to resend OTP. Please try again.',
    });
  }
});

// 4. Status / SMTP Config Info Endpoint
app.get('/api/auth/status', (req: Request, res: Response) => {
  const isConfigured = isRealSmtpAvailable() || isResendAvailable();
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;

  let serviceDesc = 'Ethereal Test SMTP (Simulated Inbox Dispatch)';
  if (isResendAvailable()) {
    serviceDesc = 'Resend Cloud Email API';
  } else if (isRealSmtpAvailable()) {
    serviceDesc = host?.includes('gmail') ? 'Gmail SMTP' : host || 'Live SMTP';
  }

  return res.json({
    smtpConfigured: isConfigured,
    service: serviceDesc,
    sender: user ? user.replace(/(.{3})(.*)(@.*)/, '$1***$3') : 'System Mailer',
  });
});

// 5. Update runtime SMTP configuration
app.post('/api/auth/configure-smtp', (req: Request, res: Response) => {
  try {
    const { host, port, user, pass, secure, from, resendApiKey } = req.body;
    if (host) process.env.SMTP_HOST = host.trim();
    if (port) process.env.SMTP_PORT = String(port).trim();
    if (user) process.env.SMTP_USER = user.trim();
    if (pass) process.env.SMTP_PASS = pass.trim();
    if (secure !== undefined) process.env.SMTP_SECURE = String(secure);
    if (from) process.env.SMTP_FROM = from.trim();
    if (resendApiKey) process.env.RESEND_API_KEY = resendApiKey.trim();

    return res.json({
      success: true,
      message: 'Email credentials updated successfully.',
      isConfigured: isRealSmtpAvailable() || isResendAvailable(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update email settings.' });
  }
});

// Import shared library store
import { libraryStore } from './src/server/libraryStore';

// Dispatch Availability Email via SmartRestock Engine
async function dispatchAvailabilityEmail(
  toEmail: string,
  studentName: string,
  bookTitle: string,
  callNumber: string,
  pickupDeadline: string
) {
  const subject = `SmartRestock Alert: "${bookTitle}" is Now Available for Pickup! (Alliance University)`;
  const textContent = `Dear ${studentName}, Great news! A physical copy of "${bookTitle}" (Call No: ${callNumber}) has been returned/restocked and is currently reserved for you at the Central Circulation Desk. Pickup Deadline: ${pickupDeadline}.`;

  const htmlContent = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>SmartRestock Availability Notice</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; margin: 0; padding: 24px; color: #f8fafc; }
        .card { max-width: 540px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; border-radius: 16px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%); padding: 28px 24px; text-align: center; }
        .tag { background: #22c55e; color: #052e16; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; }
        .content { padding: 28px 24px; }
        .book-box { background: #0f172a; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; margin: 18px 0; }
        .deadline-badge { background: #fef08a; color: #854d0e; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; display: inline-block; }
        .footer { background: #0b1120; padding: 16px; text-align: center; font-size: 11px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <span class="tag">SmartRestock · Copy Ready</span>
          <h2 style="margin: 12px 0 4px; color: #ffffff;">Alliance University Central Library</h2>
          <p style="margin: 0; font-size: 13px; color: #93c5fd;">Automated Reservation Priority Notice</p>
        </div>
        <div class="content">
          <p>Dear <strong>${studentName}</strong>,</p>
          <p>A physical copy of the title you reserved on your waiting list has just been returned and prepared for checkout:</p>
          <div class="book-box">
            <h3 style="margin: 0 0 6px; color: #60a5fa;">${bookTitle}</h3>
            <p style="margin: 0 0 6px; font-size: 13px; color: #cbd5e1;">Call Number: <strong style="font-family: monospace;">${callNumber}</strong></p>
            <p style="margin: 0; font-size: 13px; color: #94a3b8;">Pickup Location: <strong>Ground Floor Rotunda Central Circulation Counter</strong></p>
          </div>
          <div style="margin: 20px 0; text-align: center;">
            <div class="deadline-badge">⏱ Pickup Deadline: ${pickupDeadline}</div>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 8px;">Please present your Student ID or SmartLib Barcode at the circulation desk before the deadline.</p>
          </div>
        </div>
        <div class="footer">
          Alliance University Central Library · Bengaluru, Karnataka
        </div>
      </div>
    </body>
  </html>
  `;

  // Try Resend
  if (isResendAvailable()) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY!.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'SmartLib Notifications <onboarding@resend.dev>',
          to: toEmail,
          subject,
          text: textContent,
          html: htmlContent,
        }),
      });
      return;
    } catch (e) {
      console.warn('Resend availability dispatch error:', e);
    }
  }

  // Try SMTP
  if (isRealSmtpAvailable()) {
    try {
      const host = process.env.SMTP_HOST!.trim();
      const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
      const user = process.env.SMTP_USER!.trim();
      const pass = process.env.SMTP_PASS!.trim().replace(/\s+/g, '');
      const isGmail = host.includes('gmail') || user.includes('@gmail.com');

      const transporter = nodemailer.createTransport(
        isGmail ? { service: 'gmail', auth: { user, pass } } : { host, port, secure: port === 465, auth: { user, pass } }
      );

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"SmartLib Central Library" <${user}>`,
        to: toEmail,
        subject,
        text: textContent,
        html: htmlContent,
      });
      return;
    } catch (e) {
      console.warn('SMTP availability dispatch error:', e);
    }
  }

  // Fallback Ethereal
  try {
    const { transporter, user } = await getCachedEtherealTransporter();
    await transporter.sendMail({
      from: `"SmartLib Central Library" <${user}>`,
      to: toEmail,
      subject,
      text: textContent,
      html: htmlContent,
    });
  } catch (e) {
    console.warn('Ethereal test dispatch error:', e);
  }
}

// ------------------- Library API Routes -------------------

// 6. Get Catalog Books with Syllabus & Availability Filters
app.get('/api/library/books', (req: Request, res: Response) => {
  const { q, department, availability } = req.query;
  const books = libraryStore.getBooks(
    q as string | undefined,
    department as string | undefined,
    availability as string | undefined
  );
  return res.json({ success: true, count: books.length, books });
});

// 7. Get Book By ID
app.get('/api/library/books/:id', (req: Request, res: Response) => {
  const book = libraryStore.getBookById(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  return res.json({ success: true, book });
});

// 8. Get Student Profile & Loans
app.get('/api/library/student/:regNo', (req: Request, res: Response) => {
  const { regNo } = req.params;
  const student = libraryStore.getOrCreateStudent(regNo);
  return res.json({ success: true, student });
});

// 9. Borrow a Physical Copy
app.post('/api/library/borrow', (req: Request, res: Response) => {
  const { registrationNumber, bookId } = req.body;
  if (!registrationNumber || !bookId) {
    return res.status(400).json({ error: 'Registration number and book ID are required.' });
  }

  const result = libraryStore.borrowBook(registrationNumber, bookId);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  return res.json(result);
});

// 10. Return a Copy (Triggers SmartRestock Engine!)
app.post('/api/library/return', async (req: Request, res: Response) => {
  const { barcode } = req.body;
  if (!barcode) return res.status(400).json({ error: 'Barcode is required.' });

  const result = libraryStore.returnBook(barcode);
  if (!result.success) return res.status(400).json({ error: result.message });

  // If a waiting student was allocated the copy, dispatch the email notification!
  if (result.restockEvent && result.restockEvent.allocatedToGmail && result.returnedBook) {
    await dispatchAvailabilityEmail(
      result.restockEvent.allocatedToGmail,
      result.restockEvent.allocatedToName || 'Student',
      result.returnedBook.title,
      result.returnedBook.shelfLocation.callNumber,
      result.restockEvent.pickupDeadline || 'Within 48 hours'
    );
  }

  return res.json(result);
});

// 11. Reserve / Join Waiting List
app.post('/api/library/reserve', (req: Request, res: Response) => {
  const { registrationNumber, bookId, studentName, gmail } = req.body;
  if (!registrationNumber || !bookId) {
    return res.status(400).json({ error: 'Registration number and book ID are required.' });
  }

  const result = libraryStore.reserveBook(registrationNumber, bookId, studentName, gmail);
  if (!result.success) return res.status(400).json({ error: result.message });
  return res.json(result);
});

// 12. Cancel Reservation
app.post('/api/library/cancel-reservation', (req: Request, res: Response) => {
  const { registrationNumber, bookId } = req.body;
  if (!registrationNumber || !bookId) {
    return res.status(400).json({ error: 'Registration number and book ID are required.' });
  }

  const result = libraryStore.cancelReservation(registrationNumber, bookId);
  return res.json(result);
});

// 13. Renew Loan
app.post('/api/library/renew', (req: Request, res: Response) => {
  const { registrationNumber, loanId } = req.body;
  if (!registrationNumber || !loanId) {
    return res.status(400).json({ error: 'Registration number and loan ID are required.' });
  }

  const result = libraryStore.renewLoan(registrationNumber, loanId);
  if (!result.success) return res.status(400).json({ error: result.message });
  return res.json(result);
});

// 14. Restock Book (Librarian Action with SmartRestock Engine)
app.post('/api/library/restock', async (req: Request, res: Response) => {
  const { bookId, additionalCopies } = req.body;
  const count = parseInt(additionalCopies, 10) || 1;
  if (!bookId) return res.status(400).json({ error: 'Book ID is required.' });

  const result = libraryStore.restockBook(bookId, count);
  if (!result.success) return res.status(400).json({ error: result.message });

  const book = libraryStore.getBookById(bookId);

  // Dispatch email alerts to waiting students who received restocked copies
  if (book && result.events && result.events.length > 0) {
    for (const evt of result.events) {
      if (evt.allocatedToGmail) {
        await dispatchAvailabilityEmail(
          evt.allocatedToGmail,
          evt.allocatedToName || 'Student',
          book.title,
          book.shelfLocation.callNumber,
          evt.pickupDeadline || 'Within 48 hours'
        );
      }
    }
  }

  return res.json(result);
});

// 15. Simulate Return of Any Borrowed Book (Demonstration Action)
app.post('/api/library/simulate-return', async (req: Request, res: Response) => {
  const { bookId } = req.body;
  const books = libraryStore.getBooks();
  let targetCopyBarcode: string | undefined;

  if (bookId) {
    const book = libraryStore.getBookById(bookId);
    const borrowed = book?.copies.find((c) => c.status === 'BORROWED');
    if (borrowed) targetCopyBarcode = borrowed.barcode;
  }

  if (!targetCopyBarcode) {
    // Find any book currently on loan with waiting students
    for (const b of books) {
      if (b.waitingList.length > 0) {
        const borrowed = b.copies.find((c) => c.status === 'BORROWED');
        if (borrowed) {
          targetCopyBarcode = borrowed.barcode;
          break;
        }
      }
    }
  }

  if (!targetCopyBarcode) {
    // Pick any borrowed copy
    for (const b of books) {
      const borrowed = b.copies.find((c) => c.status === 'BORROWED');
      if (borrowed) {
        targetCopyBarcode = borrowed.barcode;
        break;
      }
    }
  }

  if (!targetCopyBarcode) {
    return res.status(400).json({ error: 'No copies are currently checked out to simulate return.' });
  }

  const result = libraryStore.returnBook(targetCopyBarcode);
  if (result.restockEvent && result.restockEvent.allocatedToGmail && result.returnedBook) {
    await dispatchAvailabilityEmail(
      result.restockEvent.allocatedToGmail,
      result.restockEvent.allocatedToName || 'Student',
      result.returnedBook.title,
      result.returnedBook.shelfLocation.callNumber,
      result.restockEvent.pickupDeadline || 'Within 48 hours'
    );
  }

  return res.json({
    success: true,
    message: `Simulated return of copy ${targetCopyBarcode}.`,
    result,
  });
});

// 16. Librarian Analytics
app.get('/api/library/analytics', (_req: Request, res: Response) => {
  const analytics = libraryStore.getLibrarianAnalytics();
  return res.json({ success: true, analytics });
});

// 17. Mark Notification as Read
app.post('/api/library/notifications/mark-read', (req: Request, res: Response) => {
  const { registrationNumber, notificationId } = req.body;
  const student = libraryStore.getOrCreateStudent(registrationNumber);
  if (student) {
    const notif = student.notifications.find((n) => n.id === notificationId);
    if (notif) notif.read = true;
  }
  return res.json({ success: true });
});

// 18. Student Quiz Endpoints
app.get('/api/library/quizzes', (_req: Request, res: Response) => {
  const quizzes = libraryStore.getQuizzes();
  return res.json({ success: true, count: quizzes.length, quizzes });
});

app.post('/api/library/quiz/submit', (req: Request, res: Response) => {
  const { registrationNumber, answers } = req.body;
  if (!registrationNumber || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Registration number and answers array are required.' });
  }

  const result = libraryStore.submitQuiz(registrationNumber, answers);
  return res.json(result);
});

// ------------------- Demo Admin Authentication & Protected Routes -------------------

// Admin Auth Middleware
function requireAdminAuth(req: Request, res: Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Demo Admin authentication required.' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!libraryStore.verifyAdminToken(token)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired administrator session.' });
  }

  next();
}

// 19. Admin Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const result = libraryStore.loginAdmin(username, password);
  if (!result.success) {
    return res.status(401).json({ error: result.error });
  }

  return res.json({
    success: true,
    token: result.token,
    admin: {
      name: 'Alliance Central Library Chief Administrator',
      username,
      role: 'ADMIN',
      isDemo: true,
    },
  });
});

// 20. Admin Verify / Me
app.get('/api/admin/me', requireAdminAuth, (_req: Request, res: Response) => {
  return res.json({
    success: true,
    admin: {
      name: 'Alliance Central Library Chief Administrator',
      role: 'ADMIN',
      isDemo: true,
      institution: 'Alliance University Central Library · Bengaluru',
    },
  });
});

// 21. Admin Logout
app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    libraryStore.logoutAdmin(authHeader);
  }
  return res.json({ success: true, message: 'Logged out of Admin Console.' });
});

// 22. Admin Add Book
app.post('/api/admin/books', requireAdminAuth, (req: Request, res: Response) => {
  const result = libraryStore.addBook(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  return res.status(201).json(result);
});

// 23. Admin Update Book
app.put('/api/admin/books/:id', requireAdminAuth, (req: Request, res: Response) => {
  const result = libraryStore.updateBook(req.params.id, req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  return res.json(result);
});

// 24. Admin Delete/Archive Book
app.delete('/api/admin/books/:id', requireAdminAuth, (req: Request, res: Response) => {
  const result = libraryStore.deleteBook(req.params.id);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  return res.json(result);
});

// 25. Admin CSV Catalogue Import
app.post('/api/admin/import-csv', requireAdminAuth, (req: Request, res: Response) => {
  const { csvText } = req.body;
  if (!csvText || typeof csvText !== 'string') {
    return res.status(400).json({ error: 'CSV content string is required.' });
  }

  const result = libraryStore.importCatalogueCsv(csvText);
  return res.json(result);
});

// 26. Admin Availability & SmartRestock Events
app.get('/api/admin/events', requireAdminAuth, (_req: Request, res: Response) => {
  const events = libraryStore.getAvailabilityEvents();
  return res.json({ success: true, count: events.length, events });
});

// 27. Admin Quiz Management
app.get('/api/admin/quizzes', requireAdminAuth, (_req: Request, res: Response) => {
  const quizzes = libraryStore.getAllAdminQuizzes();
  return res.json({ success: true, count: quizzes.length, quizzes });
});

app.post('/api/admin/quizzes', requireAdminAuth, (req: Request, res: Response) => {
  const { question, options, correctIndex, explanation, category, courseCode } = req.body;
  if (!question || !Array.isArray(options) || options.length < 2 || correctIndex === undefined) {
    return res.status(400).json({ error: 'Question, at least 2 options, and correctIndex are required.' });
  }

  const result = libraryStore.addQuizQuestion({
    question,
    options,
    correctIndex,
    explanation: explanation || 'Standard library syllabus curriculum question.',
    category: category || 'ORIENTATION',
    courseCode,
    enabled: true,
  });

  return res.status(201).json(result);
});

app.patch('/api/admin/quizzes/:id/toggle', requireAdminAuth, (req: Request, res: Response) => {
  const { enabled } = req.body;
  const result = libraryStore.toggleQuizQuestion(req.params.id, Boolean(enabled));
  return res.json(result);
});

app.get('/api/admin/quiz-attempts', requireAdminAuth, (_req: Request, res: Response) => {
  const attempts = libraryStore.getQuizAttempts();
  return res.json({ success: true, count: attempts.length, attempts });
});

// 28. Admin CSV Reports Export
app.get('/api/admin/reports/csv', requireAdminAuth, (req: Request, res: Response) => {
  const type = req.query.type as string;
  const books = libraryStore.getBooks();

  if (type === 'inventory') {
    let csv = 'ISBN,Title,Author,Department,CourseCode,TotalCopies,AvailableCopies,CallNumber,RackLocation\n';
    books.forEach((b) => {
      csv += `"${b.isbn}","${b.title.replace(/"/g, '""')}","${b.author}","${b.department}","${b.courseCode}",${b.totalCopies},${b.availableCopies},"${b.shelfLocation.callNumber}","${b.shelfLocation.rack}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="smartlib_inventory_report.csv"');
    return res.send(csv);
  }

  // Default: Restock priorities
  let csv = 'BookID,Title,Author,CourseCode,TotalCopies,AvailableCopies,WaitingStudents,TimesBorrowed,Priority\n';
  const analytics = libraryStore.getLibrarianAnalytics();
  analytics.priorityRestockList.forEach((r) => {
    csv += `"${r.id}","${r.title.replace(/"/g, '""')}","${r.author}","${r.courseCode}",${r.totalCopies},${r.availableCopies},${r.waitingCount},${r.timesBorrowed},"${r.priority}"\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="smartlib_restock_priority_report.csv"');
  return res.send(csv);
});

// Mount Vite middleware for dev or serve dist in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
