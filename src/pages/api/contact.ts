import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import { SlidingWindowLimiter } from '../../lib/rateLimit';

export const prerender = false;

const REQUIRED_FIELDS = ['firstName', 'lastName', 'email', 'message'] as const;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Burst protection: throttles rapid-fire requests (bots, retries) regardless of validity.
const rateLimiter = new SlidingWindowLimiter(8, 10 * 60 * 1000); // 8 requests / 10 min per IP
// Abuse cap: caps how many times an IP can actually trigger an outbound email per day,
// so a slow-and-steady spammer can't flood the inbox even while staying under the burst limit.
const formSubmissionLimiter = new SlidingWindowLimiter(5, 24 * 60 * 60 * 1000); // 5 submissions / day per IP

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let ip = 'unknown';
  try {
    ip = clientAddress ?? 'unknown'; // can throw if the adapter doesn't support it
  } catch {
    // fall through to the header-based lookup below
  }
  if (ip === 'unknown') {
    ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  }

  const rateCheck = rateLimiter.check(ip);
  if (!rateCheck.allowed) {
    return json(
      { success: false, message: 'Too many requests. Please wait a moment and try again.' },
      429,
      { 'Retry-After': String(rateCheck.retryAfterSeconds) }
    );
  }

  let data: Record<string, string>;
  try {
    data = await request.json();
  } catch {
    return json({ success: false, message: 'Invalid request body.' }, 400);
  }

  for (const field of REQUIRED_FIELDS) {
    if (!data[field]?.toString().trim()) {
      return json({ success: false, message: `${field} is required.` }, 400);
    }
  }

  if (!EMAIL_REGEX.test(data.email)) {
    return json({ success: false, message: 'Please provide a valid email address.' }, 400);
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = import.meta.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !CONTACT_TO_EMAIL) {
    console.error('Contact form: missing SMTP environment variables.');
    return json({ success: false, message: 'Email service is not configured. Please contact us directly.' }, 500);
  }

  const submissionCheck = formSubmissionLimiter.check(ip);
  if (!submissionCheck.allowed) {
    return json(
      { success: false, message: "You've reached today's submission limit. Please email us directly or try again tomorrow." },
      429,
      { 'Retry-After': String(submissionCheck.retryAfterSeconds) }
    );
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const fullName = `${data.firstName} ${data.lastName}`.trim();

  try {
    await transporter.sendMail({
      from: `"${fullName}" <${CONTACT_FROM_EMAIL || SMTP_USER}>`,
      to: CONTACT_TO_EMAIL,
      replyTo: data.email,
      subject: `New Project Inquiry from ${fullName}`,
      text: [
        `Name: ${fullName}`,
        `Email: ${data.email}`,
        `Phone: ${data.phone || 'Not provided'}`,
        `Company: ${data.company || 'Not provided'}`,
        `Service: ${data.service || 'Not specified'}`,
        `Budget: ${data.budget || 'Not specified'}`,
        '',
        'Message:',
        data.message,
      ].join('\n'),
      html: `
        <h2>New Project Inquiry</h2>
        <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(data.phone || 'Not provided')}</p>
        <p><strong>Company:</strong> ${escapeHtml(data.company || 'Not provided')}</p>
        <p><strong>Service:</strong> ${escapeHtml(data.service || 'Not specified')}</p>
        <p><strong>Budget:</strong> ${escapeHtml(data.budget || 'Not specified')}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(data.message).replace(/\n/g, '<br>')}</p>
      `,
    });

    return json({ success: true, message: "Message sent successfully! We'll get back to you within 2 hours." });
  } catch (error) {
    console.error('Contact form: failed to send email.', error);
    return json({ success: false, message: 'Failed to send message. Please try again or contact us directly.' }, 500);
  }
};

function json(body: Record<string, unknown>, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
