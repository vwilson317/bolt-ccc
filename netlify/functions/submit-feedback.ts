/**
 * submit-feedback — Netlify function to create GitHub issues from user feedback.
 *
 * Environment variables required (set in Netlify dashboard):
 *   GITHUB_FEEDBACK_TOKEN  — GitHub Personal Access Token with `repo` scope
 *                            (issues:write on vwilson317/bolt-ccc)
 *
 * Rate limiting: enforced on the client (localStorage). Server logs the
 * submitter IP in the issue body for abuse tracking.
 */
import { Handler } from '@netlify/functions';

const GITHUB_REPO = 'vwilson317/bolt-ccc';
const GITHUB_API = 'https://api.github.com';
const FEEDBACK_LABEL = 'user-feedback';
const DEV_BRANCH = 'claude/feedback-github-automation-cvKGx';

type FeedbackType = 'bug' | 'feature' | 'other';

interface FeedbackPayload {
  type: FeedbackType;
  title: string;
  description: string;
  email?: string;
  page?: string;
}

// Ensure the feedback label exists in the repo (idempotent).
async function ensureLabel(token: string): Promise<void> {
  const res = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/labels`, {
    method: 'POST',
    headers: githubHeaders(token),
    body: JSON.stringify({
      name: FEEDBACK_LABEL,
      color: '6366f1',
      description: 'User-submitted feedback via in-app form',
    }),
  });
  // 422 = label already exists — that's fine
  if (!res.ok && res.status !== 422) {
    console.warn('Could not create label:', res.status);
  }
}

function githubHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };
}

function typeEmoji(type: FeedbackType): string {
  return type === 'bug' ? '🐛' : type === 'feature' ? '💡' : '💬';
}

function typeLabel(type: FeedbackType): string {
  return type === 'bug' ? 'Bug Report' : type === 'feature' ? 'Feature Request' : 'General Feedback';
}

function buildIssueBody(
  payload: FeedbackPayload,
  submitterIp: string,
  userAgent: string,
): string {
  const { type, description, email, page } = payload;
  const lines: string[] = [
    `## ${typeEmoji(type)} ${typeLabel(type)}`,
    '',
    '### Description',
    description,
    '',
    '### Context',
    `| Field | Value |`,
    `|-------|-------|`,
    `| **Page** | \`${page || 'unknown'}\` |`,
    `| **Submitted** | ${new Date().toISOString()} |`,
    `| **User Agent** | ${userAgent || 'unknown'} |`,
    `| **IP Hash** | ${hashIp(submitterIp)} |`,
    email ? `| **Contact** | ${email} |` : '',
    '',
    '---',
    `> *Submitted via in-app feedback form. Target branch for fixes: \`${DEV_BRANCH}\`*`,
  ];

  return lines.filter(l => l !== null).join('\n');
}

// Simple one-way hash to avoid storing raw IPs
function hashIp(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const chr = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return `ip-${Math.abs(hash).toString(16)}`;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const token = process.env.GITHUB_FEEDBACK_TOKEN;
  if (!token) {
    console.error('GITHUB_FEEDBACK_TOKEN not set');
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Feedback service is not configured.' }),
    };
  }

  let payload: FeedbackPayload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Invalid JSON body.' }),
    };
  }

  // Validate
  const { type, title, description, email, page } = payload;

  const validTypes: FeedbackType[] = ['bug', 'feature', 'other'];
  if (!validTypes.includes(type)) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Invalid feedback type.' }),
    };
  }
  if (!title || title.trim().length < 5 || title.trim().length > 120) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Title must be 5–120 characters.' }),
    };
  }
  if (!description || description.trim().length < 10 || description.trim().length > 2000) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Description must be 10–2000 characters.' }),
    };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Invalid email address.' }),
    };
  }

  const submitterIp =
    event.headers['x-nf-client-connection-ip'] ||
    event.headers['x-forwarded-for']?.split(',')[0].trim() ||
    'unknown';
  const userAgent = event.headers['user-agent'] || 'unknown';

  try {
    await ensureLabel(token);

    const issueTitle = `${typeEmoji(type)} [${typeLabel(type)}] ${title.trim()}`;
    const issueBody = buildIssueBody(
      { type, title, description, email, page },
      submitterIp,
      userAgent,
    );

    const issueLabels = [FEEDBACK_LABEL];
    if (type === 'bug') issueLabels.push('bug');
    if (type === 'feature') issueLabels.push('enhancement');

    const createRes = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/issues`, {
      method: 'POST',
      headers: githubHeaders(token),
      body: JSON.stringify({
        title: issueTitle,
        body: issueBody,
        labels: issueLabels,
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      console.error('GitHub issue creation failed:', createRes.status, err);
      return {
        statusCode: 502,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Could not create issue. Please try again.' }),
      };
    }

    const issue = await createRes.json();
    console.log(`✅ Issue created: #${issue.number} — ${issue.html_url}`);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        issueNumber: issue.number,
        issueUrl: issue.html_url,
      }),
    };
  } catch (err) {
    console.error('submit-feedback error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Internal server error. Please try again.' }),
    };
  }
};

export { handler };
