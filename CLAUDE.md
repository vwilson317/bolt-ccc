# Project Context for Claude

## Viewing Environment

This site is frequently accessed from **Instagram's in-app browser** (WebView). Always consider compatibility with the Instagram browser when building or fixing UI features, especially anything involving navigation, link opening, or new tab behavior.

### Key Instagram WebView Constraints

- `window.open()` is blocked or does not work reliably inside the Instagram in-app browser — pages fail to load silently.
- Use `window.location.href` for navigation when inside the Instagram WebView.
- Detect the Instagram WebView via the user agent string, which contains `"Instagram"`.
- The Instagram browser differs from standard Chrome/Safari in how it handles external navigation, `target="_blank"`, and `noopener`/`noreferrer` flags.

### Detection Pattern

```ts
const isInstagramBrowser = /Instagram/.test(navigator.userAgent);
```

When opening external URLs (e.g., the Follow on Instagram button), check for this and fall back to `window.location.href` instead of `window.open()`.

## PII / Identifier Priority

**Phone number is always the preferred identifier** for loyalty badge claims and promo claims (`promo_claims` table).

Priority order (first match wins):
1. **Phone** — any input that is not explicitly email or formatted CPF
2. **CPF** — only when the input matches the strict `XXX.XXX.XXX-XX` format
3. **Email** — only when the input contains `@`

Ambiguous 11-digit numbers (which could be a Brazilian mobile without country code OR a CPF) are treated as **phone** by default.

This policy is enforced in:
- `src/services/promoClaimService.ts` — `normalizeIdentifier()`
- `netlify/functions/claim-event-badge.ts` — `getIdentifier()`
- `netlify/functions/lookup-event-ticket.ts` — format detection for ticket lookup
