import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';
import { palette, radius } from '../theme/tokens';

export function IconButton({ icon: Icon, label, onPress, inverse }: { icon: LucideIcon; label: string; onPress?: () => void; inverse?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.base, inverse && styles.inverse, pressed && { opacity: .65, transform: [{ scale: .94 }] }]}><Icon size={19} color={inverse ? palette.white : palette.ink} strokeWidth={2.2} /></Pressable>;
}
const styles = StyleSheet.create({ base: { width: 44, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line }, inverse: { backgroundColor: 'rgba(20,43,59,.72)', borderColor: 'rgba(255,255,255,.25)' } });
