import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View, type PressableProps, type ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { buttonTokens, palette, radius, space } from '../theme/tokens';

type ButtonProps = PressableProps & { label: string; icon?: LucideIcon; tone?: 'primary' | 'secondary' | 'tertiary' | 'coral'; fullWidth?: boolean };

export function Button({ label, icon: Icon, tone = 'primary', fullWidth, onPress, style, ...props }: ButtonProps) {
  const tertiary = tone === 'tertiary';
  const primary = tone === 'primary' || tone === 'coral';
  const secondary = tone === 'secondary';
  const colors = primary
    ? [buttonTokens.primaryBackground, buttonTokens.primaryForeground]
    : secondary
      ? [buttonTokens.secondaryBackground, buttonTokens.secondaryForeground]
      : ['transparent', palette.coral];
  const borderColor = primary
    ? buttonTokens.primaryBackground
    : secondary
      ? buttonTokens.secondaryBorder
      : 'transparent';
  return <Pressable {...props} onPress={(event) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress?.(event); }} style={({ pressed }) => [styles.base, (primary || secondary) && styles.rounded, tertiary && styles.tertiary, { backgroundColor: colors[0], borderColor, opacity: pressed ? 0.82 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }, fullWidth && styles.full, style as ViewStyle]}>
    <View style={styles.content}>{Icon ? <Icon size={17} color={colors[1]} strokeWidth={2.3} /> : null}<AppText variant={tertiary ? 'body' : 'action'} color={colors[1]} numberOfLines={1} ellipsizeMode="tail" style={[styles.label, tertiary && styles.tertiaryLabel]}>{label}</AppText></View>
  </Pressable>;
}

const styles = StyleSheet.create({
  base: { minHeight: 46, paddingHorizontal: space.lg, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  rounded: { borderRadius: buttonTokens.radius },
  content: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  label: { flexShrink: 1 },
  tertiary: { paddingHorizontal: space.sm },
  tertiaryLabel: { fontWeight: '500' },
  full: { width: '100%' },
});
