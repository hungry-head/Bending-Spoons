import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { palette, radius, space } from '../theme/tokens';

export function Chip({ label, selected, onPress, size = 'default' }: { label: string; selected?: boolean; onPress?: () => void; size?: 'default' | 'large' }) {
  return <Pressable onPress={() => { Haptics.selectionAsync(); onPress?.(); }} style={({ pressed }) => [styles.chip, size === 'large' && styles.large, selected && styles.selected, pressed && { transform: [{ scale: 0.97 }] }]} accessibilityRole="button" accessibilityState={{ selected }}>
    <AppText variant="pill" color={selected ? palette.white : palette.ink}>{label}</AppText>
  </Pressable>;
}
const styles = StyleSheet.create({ chip: { paddingHorizontal: space.md, minHeight: 38, justifyContent: 'center', borderRadius: radius.pill, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line }, large: { minHeight: 48, paddingHorizontal: 20 }, selected: { backgroundColor: palette.ink, borderColor: palette.ink } });
