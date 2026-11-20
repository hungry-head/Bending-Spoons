import { Text, type TextProps, type TextStyle } from 'react-native';
import { palette, type, typography } from '../theme/tokens';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'display' | 'title' | 'heading' | 'body' | 'supporting' | 'overline' | 'label' | 'listItem' | 'action' | 'pill' | 'tab' | 'caption';
const variants: Record<TextVariant, TextStyle> = {
  h1: typography.h1,
  h2: typography.h2,
  h3: typography.h3,
  h4: typography.h4,
  h5: typography.h5,
  h6: typography.h6,
  display: typography.display,
  title: typography.title,
  heading: typography.heading,
  body: typography.body,
  supporting: typography.supporting,
  overline: typography.overline,
  label: typography.label,
  listItem: typography.listItem,
  action: typography.action,
  pill: typography.pill,
  tab: typography.tab,
  caption: typography.caption,
};

export function AppText({ variant = 'body', color = palette.ink, style, numberOfLines, ellipsizeMode, ...props }: TextProps & { variant?: TextVariant; color?: string }) {
  const singleLineAction = variant === 'action';
  return <Text {...props} numberOfLines={numberOfLines ?? (singleLineAction ? 1 : undefined)} ellipsizeMode={ellipsizeMode ?? (singleLineAction ? 'tail' : undefined)} style={[{ color, fontFamily: type.family }, variants[variant], style]} />;
}
