#!/usr/bin/env node
/**
 * notify-merged.mjs
 *
 * Sends a "your fix is live" email to the feedback submitter when
 * a fix PR is merged into main.
 *
 * Flow:
 *  1. Extract the original issue number from the PR body
 *  2. Fetch that issue from GitHub API
 *  3. Parse the Contact email from the issue body table
 *  4. Send a notification email via Resend
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const REPO = process.env.GITHUB_REPOSITORY;
const PR_NUMBER = process.env.PR_NUMBER;
const PR_TITLE = process.env.PR_TITLE || '';
const PR_BODY = process.env.PR_BODY || '';
const PR_URL = process.env.PR_URL || '';
const PR_BRANCH = process.env.PR_BRANCH || '';
const MERGED_AT = process.env.MERGED_AT || new Date().toISOString();
const FROM_EMAIL = process.env.NOTIFY_FROM_EMAIL || 'feedback@cariocacoastalclub.com';

const GITHUB_API = 'https://api.github.com';
const RESEND_API = 'https://api.resend.com/emails';

// ---------------------------------------------------------------------------
// GitHub helper
// ---------------------------------------------------------------------------
async function fetchIssue(issueNumber) {
  const res = await fetch(`${GITHUB_API}/repos/${REPO}/issues/${issueNumber}`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!res.ok) throw new Error(`GitHub issue fetch failed: ${res.status}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Parsers
// ---------------------------------------------------------------------------

/**
 * Extract the original issue number from the PR body.
 * The triage script writes: "**Fixes:** #123"
 */
function extractIssueNumber(prBody) {
  const match = prBody.match(/\*\*Fixes:\*\*\s*#(\d+)/i);
  return match ? match[1] : null;
}

/**
 * Extract the submitter email from the GitHub issue body.
 * The issue body contains: "| **Contact** | email@example.com |"
 */
function extractEmail(issueBody) {
  if (!issueBody) return null;
  const match = issueBody.match(/\|\s*\*\*Contact\*\*\s*\|\s*([^\s|]+@[^\s|]+)\s*\|/);
  return match ? match[1].trim() : null;
}

/**
 * Extract the feedback title from the issue title.
 * Issue titles look like: "🐛 [Bug Report] My title here"
 */
function cleanIssueTitle(rawTitle) {
  return rawTitle.replace(/^[^\[]*\[[^\]]+\]\s*/, '').trim();
}

// ---------------------------------------------------------------------------
// Email builder
// ---------------------------------------------------------------------------
function buildEmailHtml({ feedbackTitle, prUrl, mergedAt, issueNumber }) {
  const mergedDate = new Date(mergedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your feedback is live!</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:36px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:36px;">🚀</p>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">
                Your fix is live!
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">
                Carioca Coastal Club
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
                Great news! The feedback you submitted has been reviewed, fixed, and merged into production.
              </p>

              <!-- Feedback card -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#f3f4f6;border-radius:12px;padding:16px;margin:0 0 24px;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;color:#6b7280;">
                      Your feedback
                    </p>
                    <p style="margin:0;color:#111827;font-size:15px;font-weight:600;">
                      ${feedbackTitle}
                    </p>
                    <p style="margin:6px 0 0;font-size:12px;color:#9ca3af;">
                      Issue #${issueNumber} · Merged ${mergedDate}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
                Thank you for taking the time to report this — your feedback directly improves the experience for everyone at Carioca Coastal Club. 🏖️
              </p>

              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background:#4f46e5;border-radius:10px;">
                    <a href="${prUrl}"
                       style="display:inline-block;padding:12px 24px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">
                      View the fix on GitHub →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.5;">
                You received this email because you provided your address when submitting feedback.
                This is a one-time notification — no further emails will be sent.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px 28px;border-top:1px solid #f3f4f6;text-align:center;">
              <p style="margin:0;color:#d1d5db;font-size:11px;">
                Carioca Coastal Club · Rio de Janeiro, Brazil
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildEmailText({ feedbackTitle, prUrl, mergedAt, issueNumber }) {
  const mergedDate = new Date(mergedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  return [
    '🚀 Your fix is live! — Carioca Coastal Club',
    '',
    `Your feedback "#${issueNumber}: ${feedbackTitle}" has been fixed and merged into production on ${mergedDate}.`,
    '',
    `View the fix: ${prUrl}`,
    '',
    'Thank you for helping improve Carioca Coastal Club! 🏖️',
    '',
    '---',
    'You received this because you provided your email when submitting feedback.',
    'This is a one-time notification.',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Send via Resend
// ---------------------------------------------------------------------------
async function sendEmail({ to, subject, html, text }) {
  if (!RESEND_API_KEY) {
    console.warn('⚠️  RESEND_API_KEY not set — skipping email send (would have sent to:', to, ')');
    return;
  }

  const res = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html, text }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Resend API error ${res.status}: ${JSON.stringify(data)}`);
  console.log(`✉️  Email sent (id: ${data.id})`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`\n📬 Checking PR #${PR_NUMBER} for submitter notification…`);
  console.log(`   Branch: ${PR_BRANCH}`);

  // 1. Find the issue number in the PR body
  const issueNumber = extractIssueNumber(PR_BODY);
  if (!issueNumber) {
    console.log('ℹ️  No "Fixes: #N" found in PR body — nothing to notify.');
    return;
  }
  console.log(`   Linked issue: #${issueNumber}`);

  // 2. Fetch the issue
  let issue;
  try {
    issue = await fetchIssue(issueNumber);
  } catch (err) {
    console.error('Failed to fetch issue:', err.message);
    return;
  }

  // 3. Extract the email
  const email = extractEmail(issue.body || '');
  if (!email) {
    console.log('ℹ️  No contact email found in issue body — submitter did not provide one.');
    return;
  }
  console.log(`   Submitter email: ${email.replace(/(.{2}).*(@.*)/, '$1***$2')}`);

  // 4. Build and send the notification
  const feedbackTitle = cleanIssueTitle(issue.title);
  const subject = `Your feedback is live on Carioca Coastal Club 🚀`;

  const emailPayload = { feedbackTitle, prUrl: PR_URL, mergedAt: MERGED_AT, issueNumber };

  await sendEmail({
    to: email,
    subject,
    html: buildEmailHtml(emailPayload),
    text: buildEmailText(emailPayload),
  });

  console.log(`\n✅ Notification sent for issue #${issueNumber} → ${email.replace(/(.{2}).*(@.*)/, '$1***$2')}`);
}

main().catch(err => {
  console.error('\n❌ notify-merged failed:', err);
  // Non-fatal — don't fail the workflow over a notification error
  process.exit(0);
});
