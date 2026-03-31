#!/usr/bin/env node
/**
 * triage-issue.mjs
 *
 * AI-powered GitHub issue triage for Carioca Coastal Club.
 *
 * Steps:
 *  1. Read issue from environment variables
 *  2. Get the source file tree
 *  3. Ask Claude: is this a real bug? Which files are relevant?
 *  4. If confirmed bug: read relevant files, ask Claude for a fix
 *  5. Apply file changes, create a branch, commit, push
 *  6. Open a PR against the dev branch
 *  7. Comment on the original issue with the PR link
 *
 * Required env:
 *   ANTHROPIC_API_KEY, GITHUB_TOKEN, GITHUB_REPOSITORY,
 *   ISSUE_NUMBER, ISSUE_TITLE, ISSUE_BODY, DEV_BRANCH
 */

import Anthropic from '@anthropic-ai/sdk';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPOSITORY; // e.g. vwilson317/bolt-ccc
const ISSUE_NUMBER = process.env.ISSUE_NUMBER;
const ISSUE_TITLE = process.env.ISSUE_TITLE || '';
const ISSUE_BODY = process.env.ISSUE_BODY || '';
const DEV_BRANCH = process.env.DEV_BRANCH || 'claude/feedback-github-automation-cvKGx';
const GITHUB_API = 'https://api.github.com';
const MODEL = 'claude-sonnet-4-6';

if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is required');
if (!GITHUB_TOKEN) throw new Error('GITHUB_TOKEN is required');
if (!REPO) throw new Error('GITHUB_REPOSITORY is required');
if (!ISSUE_NUMBER) throw new Error('ISSUE_NUMBER is required');

const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// ---------------------------------------------------------------------------
// GitHub API helpers
// ---------------------------------------------------------------------------
function ghHeaders() {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };
}

async function ghPost(path, body) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    method: 'POST',
    headers: ghHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`GitHub API error ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

async function ghPatch(path, body) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    method: 'PATCH',
    headers: ghHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`GitHub API PATCH error ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

async function commentOnIssue(body) {
  await ghPost(`/repos/${REPO}/issues/${ISSUE_NUMBER}/comments`, { body });
  console.log('💬 Commented on issue');
}

async function labelIssue(labels) {
  await ghPost(`/repos/${REPO}/issues/${ISSUE_NUMBER}/labels`, { labels });
  console.log(`🏷️  Labeled: ${labels.join(', ')}`);
}

// ---------------------------------------------------------------------------
// Git helpers
// ---------------------------------------------------------------------------
function git(cmd) {
  return execSync(`git ${cmd}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'inherit'] }).trim();
}

// ---------------------------------------------------------------------------
// File helpers
// ---------------------------------------------------------------------------
function getFileTree() {
  try {
    return execSync(
      'find src -type f \\( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \\) | grep -v node_modules | sort | head -150',
      { encoding: 'utf8' }
    ).trim();
  } catch {
    return '';
  }
}

function safeReadFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    // Limit individual files to 8 KB to avoid blowing the context
    return content.length > 8192 ? content.slice(0, 8192) + '\n...[truncated]' : content;
  } catch {
    return null;
  }
}

function applyFileChange(filePath, newContent) {
  const dir = dirname(filePath);
  mkdirSync(dir, { recursive: true });
  writeFileSync(filePath, newContent, 'utf8');
  console.log(`  📝 Updated: ${filePath}`);
}

// ---------------------------------------------------------------------------
// Claude: Step 1 — Evaluate the issue
// ---------------------------------------------------------------------------
async function evaluateIssue(fileTree) {
  console.log('🤔 Asking Claude to evaluate the issue…');

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    tools: [
      {
        name: 'evaluate_issue',
        description: 'Evaluate whether the reported issue is a genuine bug that can be automatically fixed',
        input_schema: {
          type: 'object',
          properties: {
            is_bug: {
              type: 'boolean',
              description: 'true if this is a real, actionable bug in the codebase',
            },
            classification: {
              type: 'string',
              enum: ['confirmed_bug', 'feature_request', 'unclear', 'not_a_bug', 'duplicate_likely'],
            },
            reasoning: {
              type: 'string',
              description: 'Brief explanation of your evaluation (1-3 sentences)',
            },
            relevant_files: {
              type: 'array',
              items: { type: 'string' },
              description: 'File paths most likely related to this bug (max 6)',
            },
            cannot_auto_fix_reason: {
              type: 'string',
              description: 'If is_bug is true but auto-fix is not feasible, explain why',
            },
          },
          required: ['is_bug', 'classification', 'reasoning', 'relevant_files'],
        },
      },
    ],
    tool_choice: { type: 'tool', name: 'evaluate_issue' },
    messages: [
      {
        role: 'user',
        content: `You are a senior engineer for Carioca Coastal Club — a React/TypeScript PWA for discovering beach barracas in Rio de Janeiro.

A user submitted this feedback via the in-app form:

**Title:** ${ISSUE_TITLE}

**Body:**
${ISSUE_BODY}

**Source file tree (src/):**
\`\`\`
${fileTree}
\`\`\`

Evaluate whether this is a real, actionable bug in the frontend code that can be fixed automatically. Consider:
- Is the description specific enough to act on?
- Which source files are most likely involved?
- Is this something that can be fixed with a targeted code change (vs. a design decision or missing data)?`,
      },
    ],
  });

  const toolUse = response.content.find(b => b.type === 'tool_use');
  if (!toolUse) throw new Error('Claude did not return a tool call for evaluation');
  return toolUse.input;
}

// ---------------------------------------------------------------------------
// Claude: Step 2 — Generate a fix
// ---------------------------------------------------------------------------
async function generateFix(evaluation, fileContents) {
  console.log('🔧 Asking Claude to generate a fix…');

  const fileSection = Object.entries(fileContents)
    .map(([path, content]) => `### ${path}\n\`\`\`tsx\n${content}\n\`\`\``)
    .join('\n\n');

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    tools: [
      {
        name: 'apply_fix',
        description: 'Output the complete fixed file contents for every file that needs to change',
        input_schema: {
          type: 'object',
          properties: {
            pr_title: { type: 'string', description: 'Concise PR title (< 72 chars)' },
            pr_body: { type: 'string', description: 'Markdown PR description explaining the fix' },
            commit_message: { type: 'string', description: 'Git commit message' },
            changes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  file_path: { type: 'string', description: 'Relative path from repo root' },
                  new_content: { type: 'string', description: 'Complete new file content' },
                  change_summary: { type: 'string', description: 'One line explaining this file change' },
                },
                required: ['file_path', 'new_content', 'change_summary'],
              },
            },
            confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
          },
          required: ['pr_title', 'pr_body', 'commit_message', 'changes', 'confidence'],
        },
      },
      {
        name: 'cannot_fix',
        description: 'Use this when the bug is confirmed but cannot be safely auto-fixed',
        input_schema: {
          type: 'object',
          properties: {
            reason: { type: 'string' },
            suggestions: { type: 'string', description: 'Hints for a human engineer' },
          },
          required: ['reason'],
        },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `You are fixing a confirmed bug in the Carioca Coastal Club React/TypeScript PWA.

**Issue #${ISSUE_NUMBER}:** ${ISSUE_TITLE}

**User report:**
${ISSUE_BODY}

**Evaluation notes:** ${evaluation.reasoning}

**Relevant source files:**

${fileSection}

---

Produce the minimal, targeted code changes needed to fix this bug. Only change what is necessary. Do not refactor unrelated code. Output complete file contents for every file you modify (not diffs).

If you cannot safely auto-fix this (e.g. it requires a backend change, environment config, or the fix is too ambiguous), use the \`cannot_fix\` tool instead.`,
      },
    ],
  });

  const fixCall = response.content.find(b => b.type === 'tool_use' && b.name === 'apply_fix');
  const cantFix = response.content.find(b => b.type === 'tool_use' && b.name === 'cannot_fix');

  if (fixCall) return { type: 'fix', ...fixCall.input };
  if (cantFix) return { type: 'cannot_fix', ...cantFix.input };
  return null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`\n🚀 Triaging issue #${ISSUE_NUMBER}: ${ISSUE_TITLE}\n`);

  // ── Step 1: Get file tree ─────────────────────────────────────────────────
  const fileTree = getFileTree();

  // ── Step 2: Evaluate ──────────────────────────────────────────────────────
  let evaluation;
  try {
    evaluation = await evaluateIssue(fileTree);
  } catch (err) {
    console.error('Evaluation failed:', err.message);
    await commentOnIssue(
      `🤖 **AI Triage** — evaluation step failed (${err.message}). A human engineer will review this.`,
    );
    await labelIssue(['needs-human-review']);
    return;
  }

  console.log(`\n📊 Evaluation result:`);
  console.log(`   Classification: ${evaluation.classification}`);
  console.log(`   Is bug: ${evaluation.is_bug}`);
  console.log(`   Reasoning: ${evaluation.reasoning}`);

  if (!evaluation.is_bug) {
    const classMap = {
      feature_request: 'This looks like a **feature request** rather than a bug.',
      not_a_bug: 'This does not appear to be a bug in the current codebase.',
      unclear: 'The report is unclear — could you provide more detail or steps to reproduce?',
      duplicate_likely: 'This may be a duplicate of an existing issue.',
    };
    const msg = classMap[evaluation.classification] || 'Evaluated and classified.';

    await commentOnIssue(
      `🤖 **AI Triage** — ${msg}\n\n> ${evaluation.reasoning}\n\nThank you for your feedback! 🙏`,
    );
    await labelIssue([evaluation.classification.replace(/_/g, '-')]);
    console.log('✅ Issue classified and commented. No fix needed.');
    return;
  }

  // ── Step 3: Read relevant files ───────────────────────────────────────────
  const relevantFiles = (evaluation.relevant_files || []).slice(0, 6);
  const fileContents = {};
  for (const filePath of relevantFiles) {
    const content = safeReadFile(filePath);
    if (content) fileContents[filePath] = content;
  }

  if (Object.keys(fileContents).length === 0) {
    await commentOnIssue(
      `🤖 **AI Triage** — Bug confirmed but could not identify relevant source files.\n\n> ${evaluation.reasoning}\n\nNeeds human review.`,
    );
    await labelIssue(['confirmed-bug', 'needs-human-review']);
    return;
  }

  // ── Step 4: Generate fix ──────────────────────────────────────────────────
  let fixResult;
  try {
    fixResult = await generateFix(evaluation, fileContents);
  } catch (err) {
    console.error('Fix generation failed:', err.message);
    await commentOnIssue(
      `🤖 **AI Triage** — Bug confirmed but auto-fix failed (${err.message}).\n\nNeeds human review.`,
    );
    await labelIssue(['confirmed-bug', 'needs-human-review']);
    return;
  }

  if (!fixResult || fixResult.type === 'cannot_fix') {
    const reason = fixResult?.reason || 'Could not determine a safe automatic fix.';
    const suggestions = fixResult?.suggestions ? `\n\n**Suggestions for engineers:** ${fixResult.suggestions}` : '';
    await commentOnIssue(
      `🤖 **AI Triage** — Bug confirmed but cannot be auto-fixed.\n\n**Reason:** ${reason}${suggestions}`,
    );
    await labelIssue(['confirmed-bug', 'needs-human-review']);
    return;
  }

  const { pr_title, pr_body, commit_message, changes, confidence } = fixResult;

  if (!changes || changes.length === 0) {
    await commentOnIssue(`🤖 **AI Triage** — Bug confirmed but no file changes were produced. Needs human review.`);
    await labelIssue(['confirmed-bug', 'needs-human-review']);
    return;
  }

  // ── Step 5: Create branch ─────────────────────────────────────────────────
  const branchName = `fix/issue-${ISSUE_NUMBER}-ai`;
  console.log(`\n🌿 Creating branch: ${branchName}`);

  try {
    git(`config user.email "${process.env.GIT_AUTHOR_EMAIL || 'claude-bot@users.noreply.github.com'}"`);
    git(`config user.name "${process.env.GIT_AUTHOR_NAME || 'claude-bot'}"`);
    git(`checkout -b ${branchName}`);
  } catch (err) {
    console.error('Branch creation failed:', err.message);
    await commentOnIssue(`🤖 **AI Triage** — Could not create fix branch: ${err.message}`);
    await labelIssue(['confirmed-bug', 'needs-human-review']);
    return;
  }

  // ── Step 6: Apply changes ─────────────────────────────────────────────────
  console.log(`\n✏️  Applying ${changes.length} file change(s):`);
  const changedFiles = [];
  for (const { file_path, new_content, change_summary } of changes) {
    try {
      applyFileChange(file_path, new_content);
      changedFiles.push(file_path);
      console.log(`  ✔ ${file_path}: ${change_summary}`);
    } catch (err) {
      console.error(`  ✘ Failed to write ${file_path}:`, err.message);
    }
  }

  if (changedFiles.length === 0) {
    git(`checkout ${DEV_BRANCH}`);
    git(`branch -D ${branchName}`);
    await commentOnIssue(`🤖 **AI Triage** — Bug confirmed but no files could be written. Needs human review.`);
    await labelIssue(['confirmed-bug', 'needs-human-review']);
    return;
  }

  // ── Step 7: Commit & push ─────────────────────────────────────────────────
  git(`add ${changedFiles.map(f => `"${f}"`).join(' ')}`);
  git(`commit -m "${commit_message.replace(/"/g, "'")}"`);

  const remoteUrl = `https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO}.git`;
  execSync(`git push "${remoteUrl}" HEAD:${branchName}`, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'inherit'],
  });
  console.log(`\n📤 Pushed branch: ${branchName}`);

  // ── Step 8: Create PR ─────────────────────────────────────────────────────
  const fullPrBody = [
    pr_body,
    '',
    '---',
    `**Fixes:** #${ISSUE_NUMBER}`,
    `**AI confidence:** ${confidence}`,
    `**Changed files:**`,
    ...changes.map(c => `- \`${c.file_path}\`: ${c.change_summary}`),
    '',
    '> *This PR was automatically generated by AI triage. Please review carefully before merging.*',
  ].join('\n');

  let pr;
  try {
    pr = await ghPost(`/repos/${REPO}/pulls`, {
      title: pr_title,
      body: fullPrBody,
      head: branchName,
      base: DEV_BRANCH,
      draft: false,
    });
    console.log(`\n✅ PR created: ${pr.html_url}`);
  } catch (err) {
    console.error('PR creation failed:', err.message);
    await commentOnIssue(
      `🤖 **AI Triage** — Fix committed to branch \`${branchName}\` but PR creation failed: ${err.message}`,
    );
    await labelIssue(['confirmed-bug', 'fix-in-progress']);
    return;
  }

  // ── Step 9: Request review & enable auto-merge ────────────────────────────
  try {
    // Request review from repo owner
    const [owner] = REPO.split('/');
    await ghPost(`/repos/${REPO}/pulls/${pr.number}/requested_reviewers`, {
      reviewers: [owner],
    });
    console.log('👀 Review requested');
  } catch {
    // Non-fatal — reviewer assignment may fail if the user is the PR author
  }

  try {
    // Enable auto-merge (merges once all required checks pass)
    await ghPatch(`/repos/${REPO}/pulls/${pr.number}`, { auto_merge: { merge_method: 'squash' } });
    console.log('🔀 Auto-merge enabled (squash)');
  } catch {
    // Auto-merge requires branch protection rules to be configured — non-fatal
  }

  // ── Step 10: Comment on original issue ────────────────────────────────────
  await commentOnIssue(
    [
      `🤖 **AI Triage** — Bug confirmed! A fix has been automatically generated.`,
      '',
      `**Pull Request:** ${pr.html_url}`,
      '',
      `**Changes:**`,
      ...changes.map(c => `- \`${c.file_path}\`: ${c.change_summary}`),
      '',
      `The PR has been opened against \`${DEV_BRANCH}\` and a review has been requested.`,
      `Once validated, it will be merged to production. 🚀`,
    ].join('\n'),
  );

  await labelIssue(['confirmed-bug', 'fix-in-progress']);

  console.log(`\n🎉 Done! Issue #${ISSUE_NUMBER} → PR #${pr.number}`);
}

main().catch(err => {
  console.error('\n❌ Triage script failed:', err);
  process.exit(1);
});
