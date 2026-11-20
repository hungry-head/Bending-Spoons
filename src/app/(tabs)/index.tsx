import { Image } from 'expo-image';
import { GlassView } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Banknote, Bell, Check, ChevronRight, CloudSun, MapPin, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { AppText, Button } from '@/design-system/components';
import { palette, radius, shadow, space } from '@/design-system/theme/tokens';

const mapTiles = [
  [3887, 3138], [3888, 3138], [3889, 3138],
  [3887, 3139], [3888, 3139], [3889, 3139],
  [3887, 3140], [3888, 3140], [3889, 3140],
] as const;

const members = [
  require('../../../assets/images/member-gops.jpg'),
  require('../../../assets/images/member-kat.jpg'),
  require('../../../assets/images/member-gum.jpg'),
  require('../../../assets/images/member-papi.jpg'),
] as const;

const stays = [
  { name: 'Memmo Alfama', score: '9.1', meta: '4★ · Travessa das Merceeiras', image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800' },
  { name: 'Hotel Mundial', score: '9.0', meta: '4★ · Praça Martim Moniz', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800' },
];

const webGlassStyle = Platform.OS === 'web'
  ? ({ backdropFilter: 'blur(18px) saturate(115%)' } as ViewStyle & { backdropFilter: string })
  : undefined;

export default function HomeScreen() {
  const { toast } = useLocalSearchParams<{ toast?: string }>();
  const [widgetVisible, setWidgetVisible] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(toast ?? null);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  return <View style={styles.homeScreen}><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.screenContent}>
    <View style={styles.hero}>
      <View style={styles.mapTiles} accessibilityLabel="Map of Lisbon centered near Praça do Comércio">
        {mapTiles.map(([x, y]) => <Image key={`${x}-${y}`} source={`https://tile.openstreetmap.org/13/${x}/${y}.png`} style={styles.mapTile} contentFit="cover" transition={120} />)}
      </View>
      <LinearGradient pointerEvents="none" colors={['rgba(13,49,90,.70)', 'rgba(13,49,90,.28)', 'rgba(245,248,252,.06)']} locations={[0, 0.58, 1]} style={styles.heroTint} />

      <View style={styles.heroHeader}>
        <View style={styles.heroCopy}>
          <AppText variant="body" color={palette.white}>Hi Gopika,</AppText>
          <AppText variant="h1" color={palette.white} style={styles.heroTitle}>Day 7 in Lisbon</AppText>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Notifications" style={({ pressed }) => [styles.notificationButton, pressed && styles.pressed]}>
          <GlassView glassEffectStyle="regular" colorScheme="light" tintColor="rgba(252,253,254,.44)" style={[styles.notificationGlass, webGlassStyle]}><Bell size={18} color={palette.navy} strokeWidth={1.7} /></GlassView>
        </Pressable>
      </View>

      <View style={styles.weatherPill}><LinearGradient colors={['#FFFFFF', '#D7E1EC', '#FFFFFF']} locations={[0, 0.52, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.weatherGradient}><CloudSun size={16} color={palette.navy} strokeWidth={1.5} /><AppText variant="supporting" color={palette.navy}>20° · Cloudy</AppText></LinearGradient></View>
      <View style={styles.mapPin}><MapPin size={16} color={palette.white} fill={palette.white} strokeWidth={1.8} /></View>
      <AppText variant="caption" color={palette.inkSoft} style={styles.attribution}>© OpenStreetMap contributors</AppText>
    </View>

    <GlassView glassEffectStyle="regular" colorScheme="light" tintColor="rgba(252,253,254,.72)" style={[styles.tripSummaryCard, webGlassStyle]}>
      <Pressable accessibilityRole="button" onPress={() => router.push('/trip/lisbon')} style={({ pressed }) => [styles.happeningCard, pressed && styles.pressed]}>
        <AppText variant="overline" color={palette.coral} style={styles.happeningOverline}>HAPPENING NOW · AFTERNOON</AppText>
        <AppText variant="h5">Praça do Comércio</AppText>
        <AppText variant="supporting" color={palette.inkSoft}>Lisbon’s riverfront square</AppText>
      </Pressable>
      <View style={styles.planRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Open trip group" style={({ pressed }) => [styles.memberStack, pressed && styles.pressed]}>{members.map((source, index) => <Image key={index} source={source} style={[styles.memberAvatar, index > 0 && styles.memberAvatarOverlap, { zIndex: index + 1 }]} contentFit="cover" />)}</Pressable>
        <View style={styles.planButtonWrap}><Button label="See today’s plan" onPress={() => router.push('/trip/lisbon')} style={styles.planButton} /></View>
      </View>
    </GlassView>

    <View style={styles.pageBody}>
      {widgetVisible ? <View accessibilityLabel="A TripUp widget right on your homescreen with Premium" style={styles.widgetCard}><View style={styles.widgetCopy}><AppText variant="body" color={palette.inkSoft} numberOfLines={2}>A TripUp widget right on your homescreen with Premium</AppText></View><Pressable accessibilityRole="button" accessibilityLabel="Dismiss widget suggestion" hitSlop={10} onPress={() => setWidgetVisible(false)} style={({ pressed }) => [styles.widgetDismiss, pressed && styles.pressed]}><X size={14} color={palette.inkSoft} strokeWidth={1.8} /></Pressable></View> : null}

      <AppText variant="h5" style={styles.sectionTitle}>Heads up</AppText>
      <Pressable accessibilityRole="button" style={({ pressed }) => [styles.headsUpRow, pressed && styles.pressed]}>
        <View style={styles.headsUpIcon}><Banknote size={23} color="#168F67" strokeWidth={1.8} /></View>
        <View style={styles.headsUpCopy}><AppText variant="h5">77% of budget spent</AppText><AppText variant="body" color={palette.inkSoft}>€2,300 left for 6 days</AppText></View>
        <ChevronRight size={22} color={palette.inkSoft} strokeWidth={1.8} />
      </Pressable>

      <SectionTitle title="Tonight isn’t booked yet" subtitle="Your Lisbon trip has no room booked for tonight." />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
        {stays.map((stay) => <Pressable key={stay.name} style={({ pressed }) => [styles.stayCard, pressed && styles.pressed]}><Image source={stay.image} style={styles.stayImage} contentFit="cover" transition={180} /><AppText variant="h5" numberOfLines={1}>{stay.name}</AppText><View style={styles.stayMeta}><View style={styles.score}><AppText variant="caption">{stay.score}</AppText></View><AppText variant="caption" color={palette.inkSoft} numberOfLines={1}>{stay.meta}</AppText></View></Pressable>)}
      </ScrollView>
      <Pressable accessibilityRole="button" style={({ pressed }) => [styles.booked, pressed && styles.pressed]}><AppText variant="action" color={palette.coral}>Already booked? Add it to the trip</AppText></Pressable>
    </View>

  </ScrollView>{toastMessage ? <View accessibilityRole="alert" style={styles.toast}><View style={styles.toastIcon}><Check size={16} color={palette.white} strokeWidth={2.2} /></View><AppText variant="supporting" color={palette.white}>{toastMessage}</AppText></View> : null}</View>;
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <View style={styles.sectionHeading}><AppText variant="h5">{title}</AppText><AppText variant="body" color={palette.inkSoft}>{subtitle}</AppText></View>;
}

const styles = StyleSheet.create({
  homeScreen: { flex: 1, backgroundColor: palette.canvas },
  toast: { position: 'absolute', zIndex: 20, left: 20, right: 20, bottom: 94, minHeight: 50, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 25, backgroundColor: palette.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, ...shadow.card },
  toastIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,.16)', alignItems: 'center', justifyContent: 'center' },
  screenContent: { paddingHorizontal: 0, paddingTop: 0, paddingBottom: 116 },
  hero: { position: 'relative', height: 500, overflow: 'hidden', backgroundColor: '#BAC9D6' },
  mapTiles: { position: 'absolute', width: 540, height: 540, left: '50%', top: '50%', marginLeft: -270, marginTop: -270, flexDirection: 'row', flexWrap: 'wrap', opacity: 0.78 },
  mapTile: { width: 180, height: 180 },
  heroTint: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  heroHeader: { position: 'absolute', left: 20, right: 20, top: 54, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  heroCopy: { flex: 1, gap: 0 },
  heroTitle: { marginTop: -1 },
  notificationButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  notificationGlass: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: 'rgba(255,255,255,.58)', backgroundColor: 'rgba(245,248,252,.44)', alignItems: 'center', justifyContent: 'center', ...shadow.card },
  weatherPill: { position: 'absolute', top: 128, left: 20, height: 30, borderRadius: 15, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,.74)', ...shadow.card },
  weatherGradient: { height: 30, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  mapPin: { position: 'absolute', left: '50%', top: 266, marginLeft: -15, width: 30, height: 30, borderRadius: 15, backgroundColor: palette.coral, alignItems: 'center', justifyContent: 'center', shadowColor: palette.navy, shadowOpacity: 0.18, shadowRadius: 7, shadowOffset: { width: 0, height: 3 } },
  attribution: { position: 'absolute', right: 10, bottom: 92, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, backgroundColor: 'rgba(255,255,255,.76)', fontSize: 8, lineHeight: 11 },
  tripSummaryCard: { zIndex: 4, marginTop: -78, marginHorizontal: 16, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,.72)', backgroundColor: 'rgba(252,253,254,.78)', overflow: 'hidden', ...shadow.card },
  happeningCard: { minHeight: 82, paddingHorizontal: 16, paddingVertical: 10, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(226,233,241,.72)' },
  happeningOverline: { fontSize: 10, lineHeight: 14 },
  pageBody: { paddingHorizontal: space.md, paddingTop: 12 },
  planRow: { minHeight: 66, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  memberStack: { minWidth: 102, height: 40, flexDirection: 'row', alignItems: 'center', paddingLeft: 2 },
  memberAvatar: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: palette.white, backgroundColor: palette.navySoft },
  memberAvatarOverlap: { marginLeft: -8 },
  planButtonWrap: { flex: 1, alignItems: 'flex-end' },
  planButton: { minHeight: 46, height: 46, paddingHorizontal: 22 },
  widgetCard: { position: 'relative', minHeight: 66, paddingLeft: 14, paddingRight: 42, paddingVertical: 11, borderRadius: radius.lg, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, flexDirection: 'row', alignItems: 'center', gap: 10 },
  widgetCopy: { flex: 1 },
  widgetDismiss: { position: 'absolute', top: 5, right: 5, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { marginTop: 24, marginBottom: 14 },
  headsUpRow: { minHeight: 92, paddingHorizontal: 14, paddingVertical: 12, borderRadius: radius.lg, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, flexDirection: 'row', alignItems: 'center', gap: 14, ...shadow.card },
  headsUpIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: palette.mossSoft, alignItems: 'center', justifyContent: 'center' },
  headsUpCopy: { flex: 1, gap: 2 },
  sectionHeading: { marginTop: 30, marginBottom: space.sm, gap: 2 },
  horizontalList: { gap: space.sm, paddingRight: space.md },
  stayCard: { width: 226 },
  stayImage: { width: '100%', height: 142, borderRadius: radius.xl, marginBottom: 9 },
  stayMeta: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 4 },
  score: { paddingHorizontal: 9, height: 24, borderRadius: 12, backgroundColor: palette.sun, justifyContent: 'center' },
  booked: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', marginTop: space.sm },
  pressed: { opacity: .78, transform: [{ scale: .985 }] },
});
