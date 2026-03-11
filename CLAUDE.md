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
