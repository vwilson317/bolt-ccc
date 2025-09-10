import { LingoDotDevEngine } from 'lingo.dev/sdk';

let lingoEngine: LingoDotDevEngine | null = null;

const apiKey = (import.meta as any).env?.VITE_LINGO_API_KEY as string | undefined;

if (apiKey && typeof apiKey === 'string' && apiKey.trim().length > 0) {
	lingoEngine = new LingoDotDevEngine({ apiKey });
} else {
	// No API key provided; Lingo translations will be disabled and we will fall back.
	lingoEngine = null;
}

export function getLingoEngine(): LingoDotDevEngine | null {
	return lingoEngine;
}

export function getDefaultContentLocale(): string {
	const value = (import.meta as any).env?.VITE_DEFAULT_CONTENT_LOCALE as string | undefined;
	return (value && value.trim().length > 0) ? value : 'pt';
}

