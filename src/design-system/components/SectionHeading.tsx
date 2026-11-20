import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { AppText } from './AppText';
import { palette, space } from '../theme/tokens';

export function SectionHeading({ title, action, onPress, style }: { title: string; action?: string; onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.row, style]}><AppText variant="heading">{title}</AppText>{action ? <Pressable onPress={onPress} style={styles.action}><AppText variant="caption" color={palette.inkSoft}>{action}</AppText><ChevronRight size={15} color={palette.inkSoft} /></Pressable> : null}</View>;
}
const styles = StyleSheet.create({ row: { marginTop: space.lg, marginBottom: space.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, action: { flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 36 } });
