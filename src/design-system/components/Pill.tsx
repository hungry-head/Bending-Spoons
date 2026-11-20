import { StyleSheet, View } from 'react-native';
import { palette, radius, space } from '../theme/tokens';
import { AppText } from './AppText';

export function Pill({ label, compact = false }: { label: string; compact?: boolean }) {
  return <View style={[styles.pill, compact && styles.pillCompact]}>
    <AppText variant="pill" style={compact ? styles.labelCompact : undefined}>{label}</AppText>
  </View>;
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    minHeight: 30,
    paddingHorizontal: space.sm,
    borderRadius: radius.pill,
    backgroundColor: palette.surfaceMuted,
    justifyContent: 'center',
  },
  pillCompact: {
    minHeight: 25,
    paddingHorizontal: 10,
  },
  labelCompact: {
    fontSize: 11,
    lineHeight: 15,
  },
});
