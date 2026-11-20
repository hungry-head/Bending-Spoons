import { Platform } from 'react-native';

export const palette = {
  ink: '#102F55',
  inkSoft: '#708092',
  canvas: '#F5F8FC',
  surface: '#FCFDFE',
  surfaceMuted: '#EFF4FA',
  line: '#E2E9F1',
  sheetHandle: '#A9B4BF',
  coral: '#176FC1',
  coralSoft: '#EAF3FF',
  navy: '#0D315A',
  navySoft: '#E8F2FF',
  sun: '#FFC857',
  sunSoft: '#FFF2DE',
  sky: '#2B7DE9',
  skySoft: '#EAF3FF',
  moss: '#34B785',
  mossSoft: '#E6F8ED',
  violet: '#7657F6',
  violetSoft: '#F0ECFF',
  success: '#2AAE7B',
  white: '#FCFDFE',
  black: '#101820',
} as const;

export const space = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radius = { sm: 10, md: 14, lg: 18, xl: 26, pill: 999 } as const;
export const buttonTokens = {
  primaryBackground: palette.ink,
  primaryForeground: palette.white,
  secondaryBackground: palette.surface,
  secondaryForeground: palette.ink,
  secondaryBorder: palette.ink,
  radius: radius.pill,
} as const;
export const fontSize = { h1: 32, h2: 28, h3: 24, h4: 20, h5: 16, h6: 14, caption: 12, supporting: 12, overline: 11, body: 14, label: 13, listItem: 14, action: 13, pill: 13, tab: 14, heading: 17, title: 24, display: 32 } as const;
export const lineHeight = { h1: 38, h2: 34, h3: 30, h4: 26, h5: 23, h6: 20, caption: 16, supporting: 16, overline: 16, body: 20, label: 18, listItem: 20, action: 18, pill: 18, tab: 20, heading: 23, title: 30, display: 38 } as const;
export const fontWeight = { light: '300', regular: '400', medium: '500', semibold: '600', bold: '700' } as const;
export const type = {
  family: Platform.select({ ios: 'System', android: 'sans-serif', default: 'system-ui' }),
  rounded: Platform.select({ ios: 'ui-rounded', android: 'sans-serif-medium', default: 'system-ui' }),
  mono: Platform.select({ ios: 'ui-monospace', android: 'monospace', default: 'monospace' }),
  size: fontSize,
} as const;

export const typography = {
  h1: { fontSize: fontSize.h1, lineHeight: lineHeight.h1, fontWeight: fontWeight.semibold, letterSpacing: -0.8 },
  h2: { fontSize: fontSize.h2, lineHeight: lineHeight.h2, fontWeight: fontWeight.semibold, letterSpacing: -0.6 },
  h3: { fontSize: fontSize.h3, lineHeight: lineHeight.h3, fontWeight: fontWeight.semibold, letterSpacing: -0.4 },
  h4: { fontSize: fontSize.h4, lineHeight: lineHeight.h4, fontWeight: fontWeight.semibold, letterSpacing: -0.25 },
  h5: { fontSize: fontSize.h5, lineHeight: lineHeight.h5, fontWeight: fontWeight.semibold, letterSpacing: -0.15 },
  h6: { fontSize: fontSize.h6, lineHeight: lineHeight.h6, fontWeight: fontWeight.semibold },
  display: { fontSize: fontSize.display, lineHeight: lineHeight.display, fontWeight: fontWeight.bold, letterSpacing: -0.8 },
  title: { fontSize: fontSize.title, lineHeight: lineHeight.title, fontWeight: fontWeight.bold, letterSpacing: -0.35 },
  heading: { fontSize: fontSize.heading, lineHeight: lineHeight.heading, fontWeight: fontWeight.bold, letterSpacing: -0.15 },
  body: { fontSize: fontSize.body, lineHeight: lineHeight.body, fontWeight: fontWeight.light },
  supporting: { fontSize: fontSize.supporting, lineHeight: lineHeight.supporting, fontWeight: fontWeight.regular },
  overline: { fontSize: fontSize.overline, lineHeight: lineHeight.overline, fontWeight: fontWeight.medium, letterSpacing: 1.15 },
  label: { fontSize: fontSize.label, lineHeight: lineHeight.label, fontWeight: fontWeight.semibold },
  listItem: { fontSize: fontSize.listItem, lineHeight: lineHeight.listItem, fontWeight: fontWeight.medium },
  action: { fontSize: fontSize.action, lineHeight: lineHeight.action, fontWeight: fontWeight.medium },
  pill: { fontSize: fontSize.pill, lineHeight: lineHeight.pill, fontWeight: fontWeight.regular },
  tab: { fontSize: fontSize.tab, lineHeight: lineHeight.tab, fontWeight: fontWeight.regular },
  caption: { fontSize: fontSize.caption, lineHeight: lineHeight.caption, fontWeight: fontWeight.medium },
} as const;

export const grid = {
  columns: 4,
  margin: 16,
  gutter: 12,
  baseline: 4,
  maxContentWidth: 430,
} as const;

export const shadow = {
  card: {
    shadowColor: palette.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
};
