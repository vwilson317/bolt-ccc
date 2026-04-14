// App color palette (dark theme)
export const Colors = {
  bg: '#0f172a',          // slate-900
  card: '#1e293b',        // slate-800
  border: '#334155',      // slate-700
  textPrimary: '#f8fafc', // slate-50
  textSecondary: '#94a3b8', // slate-400
  accent: '#14b8a6',      // teal-500
  success: '#10b981',     // emerald-500
  error: '#f43f5e',       // rose-500
  warning: '#f59e0b',     // amber-500
} as const;

// Tier badge colors for event tickets
export const TIER_COLORS: Record<string, [string, string]> = {
  general: ['#3b82f6', '#6366f1'], // blue → indigo
  guest:   ['#10b981', '#14b8a6'], // emerald → teal
  vip:     ['#f43f5e', '#ec4899'], // rose → pink
  promoter:['#a855f7', '#7c3aed'], // purple → violet
};

// Mapping from Tailwind class names used in barracaPromos.ts to hex values
const TAILWIND_HEX: Record<string, string> = {
  'orange-500': '#f97316',
  'teal-500':   '#14b8a6',
  'emerald-500':'#10b981',
  'emerald-700':'#047857',
  'yellow-500': '#eab308',
  'amber-600':  '#d97706',
  'zinc-400':   '#a1a1aa',
  'zinc-600':   '#52525b',
  'slate-400':  '#94a3b8',
  'slate-600':  '#475569',
  'blue-500':   '#3b82f6',
  'indigo-600': '#4f46e5',
  'red-600':    '#dc2626',
  'purple-500': '#a855f7',
  'violet-600': '#7c3aed',
  'green-500':  '#22c55e',
  'lime-500':   '#84cc16',
  'rose-500':   '#f43f5e',
  'pink-600':   '#db2777',
};

export function resolveColor(tailwindName: string): string {
  return TAILWIND_HEX[tailwindName] ?? '#64748b';
}

export function resolveGradient(fromColor: string, toColor: string): [string, string] {
  return [resolveColor(fromColor), resolveColor(toColor)];
}
