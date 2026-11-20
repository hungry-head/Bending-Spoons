import { BellRing, ChevronRight, CircleDollarSign, Globe2, Heart, Settings2, ShieldCheck, UsersRound } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, Card, Screen } from '@/design-system/components';
import { palette, radius, space } from '@/design-system/theme/tokens';

const preferences = [
  { icon: Heart, label: 'Travel preferences', value: 'Food · Culture · Slow' },
  { icon: Globe2, label: 'Home currency', value: 'EUR' },
  { icon: BellRing, label: 'Notifications', value: 'On' },
  { icon: ShieldCheck, label: 'Privacy & security', value: '' },
];

export default function ProfileScreen() {
  return <Screen>
    <AppText variant="caption" color={palette.inkSoft}>YOUR TRIPUP</AppText><AppText variant="display">You</AppText>
    <View style={styles.identity}><View style={styles.avatar}><AppText variant="title" color={palette.white}>A</AppText></View><View><AppText variant="heading">Ari</AppText><AppText variant="caption" color={palette.inkSoft}>6 trips · 3 countries</AppText></View></View>
    <Card style={styles.yearCard}><View><AppText variant="caption" color={palette.inkSoft}>YOUR TRAVEL YEAR</AppText><AppText variant="title">28 days away</AppText><AppText variant="body" color={palette.inkSoft}>4,860 km of good stories.</AppText></View><View style={styles.stamp}><AppText variant="heading">2026</AppText></View></Card>
    <View style={styles.stats}><View><UsersRound size={19} color={palette.sky} /><AppText variant="heading">12</AppText><AppText variant="caption" color={palette.inkSoft}>travel mates</AppText></View><View><CircleDollarSign size={19} color={palette.coral} /><AppText variant="heading">€18k</AppText><AppText variant="caption" color={palette.inkSoft}>tracked together</AppText></View></View>
    <AppText variant="heading" style={styles.sectionTitle}>Preferences</AppText>
    <Card style={styles.settings}>{preferences.map(({ icon: Icon, label, value }, index) => <Pressable key={label} style={[styles.row, index < preferences.length - 1 && styles.rowBorder]}><View style={styles.rowIcon}><Icon size={18} color={palette.ink} /></View><AppText variant="label" style={{ flex: 1 }}>{label}</AppText>{value ? <AppText variant="caption" color={palette.inkSoft}>{value}</AppText> : null}<ChevronRight size={17} color={palette.inkSoft} /></Pressable>)}</Card>
    <Pressable style={styles.systemRow}><Settings2 size={17} color={palette.inkSoft} /><AppText variant="caption" color={palette.inkSoft}>TripUp system · v0.1 scaffold</AppText></Pressable>
  </Screen>;
}
const styles = StyleSheet.create({ identity: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginVertical: space.lg }, avatar: { width: 64, height: 64, borderRadius: 24, backgroundColor: palette.ink, alignItems: 'center', justifyContent: 'center' }, yearCard: { minHeight: 148, backgroundColor: palette.sunSoft, borderColor: '#E8D496', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, stamp: { width: 78, height: 78, borderRadius: 39, borderWidth: 1, borderStyle: 'dashed', borderColor: palette.inkSoft, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '8deg' }] }, stats: { flexDirection: 'row', gap: space.sm, marginTop: space.sm }, sectionTitle: { marginTop: space.lg, marginBottom: space.sm }, settings: { paddingVertical: 0 }, row: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: space.sm }, rowBorder: { borderBottomWidth: 1, borderBottomColor: palette.line }, rowIcon: { width: 36, height: 36, borderRadius: radius.sm, backgroundColor: palette.surfaceMuted, alignItems: 'center', justifyContent: 'center' }, systemRow: { marginTop: space.lg, flexDirection: 'row', justifyContent: 'center', gap: space.xs, alignItems: 'center' } });
