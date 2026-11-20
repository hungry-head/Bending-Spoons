import { router } from 'expo-router';
import { Plus, UsersRound } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, Button, Chip, Screen, TripArtwork } from '@/design-system/components';
import { palette, radius, space } from '@/design-system/theme/tokens';
import { trips } from '@/data/mock-trips';

export default function TripsScreen() {
  return <Screen>
    <View style={styles.header}><View><AppText variant="caption" color={palette.inkSoft}>YOUR WORLD</AppText><AppText variant="display">Trips</AppText></View><Button label="New" icon={Plus} tone="coral" /></View>
    <View style={styles.filters}><Chip label="Upcoming" selected /><Chip label="Past" /><Chip label="Invites" /></View>
    <View style={styles.list}>{trips.map((trip) => <Pressable key={trip.id} onPress={() => router.push(`/trip/${trip.id}`)} style={({ pressed }) => [styles.tripCard, pressed && { opacity: .88, transform: [{ scale: .99 }] }]}>
      <TripArtwork city={trip.city} color={trip.color} accent={trip.accent} compact />
      <View style={styles.meta}><View><AppText variant="heading">{trip.city}, {trip.country}</AppText><AppText variant="caption" color={palette.inkSoft}>{trip.dates} · {trip.days} days</AppText></View><View style={styles.members}><UsersRound size={15} color={palette.inkSoft} /><AppText variant="caption" color={palette.inkSoft}>{trip.members.length}</AppText></View></View>
    </Pressable>)}</View>
  </Screen>;
}
const styles = StyleSheet.create({ header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.lg }, filters: { flexDirection: 'row', gap: space.xs, marginBottom: space.lg }, list: { gap: space.md }, tripCard: { backgroundColor: palette.surface, borderRadius: radius.lg, padding: space.xs, borderWidth: 1, borderColor: palette.line }, meta: { padding: space.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, members: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: palette.surfaceMuted, paddingHorizontal: 10, height: 32, borderRadius: radius.pill } });
