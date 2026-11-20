import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { palette, radius } from '../theme/tokens';

export function TripArtwork({ city, color, accent, compact }: { city: string; color: string; accent: string; compact?: boolean }) {
  return <View style={[styles.canvas, { backgroundColor: color }, compact && styles.compact]}>
    <View style={[styles.sun, { backgroundColor: accent }]} />
    <View style={styles.mountainBack} />
    <View style={styles.mountainFront} />
    <View style={styles.road} />
    <AppText variant={compact ? 'label' : 'title'} color={palette.white} style={styles.city}>{city}</AppText>
  </View>;
}
const styles = StyleSheet.create({
  canvas: { height: 224, borderRadius: radius.xl, overflow: 'hidden' }, compact: { height: 128, borderRadius: radius.lg },
  sun: { position: 'absolute', width: 92, height: 92, borderRadius: 46, top: 22, right: 26, opacity: .95 },
  mountainBack: { position: 'absolute', width: 260, height: 190, borderRadius: 110, backgroundColor: 'rgba(20,43,59,.22)', left: -80, bottom: -98, transform: [{ rotate: '-14deg' }] },
  mountainFront: { position: 'absolute', width: 280, height: 180, borderRadius: 110, backgroundColor: 'rgba(20,43,59,.48)', right: -95, bottom: -104, transform: [{ rotate: '12deg' }] },
  road: { position: 'absolute', width: 28, height: 150, borderRadius: 20, backgroundColor: 'rgba(255,255,255,.6)', bottom: -30, left: '50%', transform: [{ rotate: '18deg' }] },
  city: { position: 'absolute', left: 22, bottom: 20, letterSpacing: -.5 },
});
