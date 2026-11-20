import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, Screen } from '@/design-system/components';
import { palette, radius, shadow, space } from '@/design-system/theme/tokens';

export default function MemoriesScreen() {
  return <Screen>
    <View style={styles.header}><View style={{ flex: 1 }}><AppText variant="display">Memories</AppText><AppText variant="body" color={palette.inkSoft}>1 trip · 46 places · 0 photos</AppText></View><Pressable onPress={() => router.push('/planner')} style={({ pressed }) => [styles.create, pressed && styles.pressed]}><AppText variant="action" color={palette.white}>Create a trip</AppText></Pressable></View>
    <View style={styles.yearCard}><View style={styles.latest}><AppText variant="caption">Lisbon · latest trip</AppText></View><View style={styles.yearArtwork} /><View style={styles.yearCopy}><AppText variant="caption" color={palette.coral} style={styles.yearLabel}>YOUR 2026</AppText><AppText variant="heading">12 days on the road, 1 city</AppText><AppText variant="action" color={palette.coral} style={styles.lookBack}>Look back at your year  →</AppText></View></View>
    <View style={styles.provinces}><AppText variant="heading">Places you’ve been</AppText><View style={styles.count}><AppText variant="display">0</AppText><AppText variant="title"> of 63 provinces</AppText></View><AppText variant="body" color={palette.inkSoft}>Mark the places you’ve been, even before TripUp.</AppText><Pressable style={({ pressed }) => [styles.mark, pressed && styles.pressed]}><AppText variant="action">Mark places you’ve been</AppText></Pressable></View>
    <View style={styles.sectionTitle}><AppText variant="title">Journal</AppText><AppText variant="action" color={palette.coral}>See all</AppText></View>
    <Pressable style={({ pressed }) => [styles.journal, pressed && styles.pressed]}><View style={styles.journalThumb} /><View style={{ flex: 1 }}><AppText variant="heading">Lisbon · in progress</AppText><AppText variant="body" color={palette.inkSoft}>Day 2 of 12 · 0 photos, 0 check-ins</AppText></View><AppText variant="action">Write</AppText></Pressable>
  </Screen>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: 4 }, create: { minWidth: 126, height: 54, borderRadius: 27, backgroundColor: palette.navy, alignItems: 'center', justifyContent: 'center' }, provinces: { marginTop: 42, padding: 24, borderRadius: radius.xl, backgroundColor: palette.mossSoft }, count: { flexDirection: 'row', alignItems: 'baseline', marginTop: 12, marginBottom: 10 }, mark: { alignSelf: 'flex-start', minHeight: 58, borderRadius: 20, paddingHorizontal: 22, backgroundColor: palette.surface, justifyContent: 'center', marginTop: 24 }, sectionTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 58, marginBottom: 26 }, journal: { flexDirection: 'row', alignItems: 'center', gap: 16 }, journalThumb: { width: 88, height: 88, borderRadius: radius.lg, backgroundColor: palette.navySoft }, pressed: { opacity: .78, transform: [{ scale: .985 }] },
  yearCard: { marginTop: 28, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: palette.surface, ...shadow.card }, latest: { position: 'absolute', zIndex: 2, top: 14, left: 16, right: 16, height: 34, borderRadius: 17, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center' }, yearArtwork: { height: 172, backgroundColor: palette.navySoft }, yearCopy: { padding: 20 }, yearLabel: { letterSpacing: 1.1, marginBottom: 4 }, lookBack: { marginTop: 18 },
});
