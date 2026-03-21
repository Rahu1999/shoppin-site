export const theme = {
  // Brand colors
  primaryColor: '#2563EB', // Blue 600
  secondaryColor: '#0F172A', // Slate 900
  accentColor: '#F59E0B', // Amber 500

  // Danger/Success
  dangerColor: '#EF4444', // Red 500
  successColor: '#10B981', // Emerald 500
  
  // Backgrounds
  backgroundColor: '#FFFFFF',
  surfaceColor: '#F8FAFC',
  
  // Typography
  fontFamilySans: 'var(--font-inter)',
  fontFamilyMono: 'var(--font-roboto-mono)',
  textColorBase: '#1E293B',
  textColorMuted: '#64748B',

  // Layout & UI
  borderRadius: '0.75rem',     // 12px
  buttonRadius: '0.5rem',      // 8px
  cardRadius: '1rem',          // 16px
  inputRadius: '0.375rem',     // 6px

  logo: '/logo.svg', // Assumes logo.svg exists in public/
  storeName: 'ModernShop',
} as const;
