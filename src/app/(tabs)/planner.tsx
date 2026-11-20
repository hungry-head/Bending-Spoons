import { router } from 'expo-router';
import { ArrowLeft, Bot, CalendarDays, MapPin, Rocket, TreePalm, UsersRound, WalletCards } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, Button, Card, Screen } from '@/design-system/components';
import { palette, radius } from '@/design-system/theme/tokens';

const days = [
  { day: 'DAY 1', date: 'Apr 20', stops: [['14:00', 'Hotel check-in'], ['17:30', 'Banh Can Nha Trang']] },
  { day: 'DAY 2', date: 'Apr 21', stops: [['08:30', 'Cầu Đá Port – Nha Trang'], ['11:30', 'Mudbath Japanese Restaurant'], ['12:49', 'Lac Canh Restaurant'], ['14:41', 'Cafe 73 Nha Trang']] },
];

export default function PlannerScreen() {
  return <Screen>
    <View style={styles.header}><Pressable onPress={() => router.back()}><ArrowLeft size={20} color={palette.ink} /></Pressable><AppText variant="label">Create Trip</AppText><View style={{ width: 20 }} /></View>
    <View style={styles.steps}><View style={styles.stepDot} /><View style={styles.stepDot} /><View style={[styles.stepDot, styles.stepWide]} /><View style={styles.stepDot} /></View>
    <View style={styles.hero}><View style={styles.heroIcon}><PlaneMark /></View><View style={{ flex: 1 }}><AppText variant="label" color={palette.white}>Nha Trang 2026</AppText><View style={styles.heroLocation}><MapPin size={11} color="#D9E8FF" /><AppText variant="caption" color="#D9E8FF">Nha Trang City</AppText></View></View><View style={styles.bubbles}><View /><View /></View></View>
    <Card style={styles.summary}>
      <Summary icon={CalendarDays} label="Duration" value="Apr 20 – Apr 30 · 11 days" color="#FFB648" />
      <Summary icon={UsersRound} label="MEMBERS" value="2 people" color="#14B87A" />
      <Summary icon={WalletCards} label="Budget" value="€4,000.00" color="#A45DE5" last />
    </Card>
    <Card style={styles.plan}>
      <View style={styles.planTitle}><View style={styles.aiBadge}><Bot size={14} color={palette.coral} /></View><AppText variant="caption">AI SUGGESTED ITINERARY</AppText><View style={styles.places}><AppText variant="caption" color={palette.coral}>24 places</AppText></View></View>
      {days.map((item, dayIndex) => <View key={item.day} style={styles.dayBlock}><View style={styles.dayTitle}><View style={styles.dayNumber}><AppText variant="caption" color={palette.coral}>{dayIndex + 1}</AppText></View><AppText variant="caption">{item.day} · <AppText variant="caption" color={palette.inkSoft}>{item.date}</AppText></AppText><AppText variant="caption" color={palette.inkSoft} style={{ marginLeft: 'auto' }}>{item.stops.length} activities</AppText></View>{item.stops.map(([time, name]) => <View key={`${time}-${name}`} style={styles.stop}><View style={styles.dot} /><AppText variant="caption" color={palette.coral} style={styles.time}>{time}</AppText><AppText variant="caption" color={palette.inkSoft}>{name}</AppText></View>)}</View>)}
    </Card>
    <Button label="Create Trip" icon={Rocket} fullWidth onPress={() => router.replace('/trips')} />
  </Screen>;
}

function PlaneMark() { return <TreePalm size={23} color={palette.white} />; }
function Summary({ icon: Icon, label, value, color, last }: { icon: typeof CalendarDays; label: string; value: string; color: string; last?: boolean }) { return <View style={[styles.summaryRow, !last && styles.summaryBorder]}><View style={[styles.summaryIcon, { backgroundColor: `${color}18` }]}><Icon size={15} color={color} /></View><AppText variant="caption" color={palette.inkSoft} style={{ flex: 1 }}>{label}</AppText><AppText variant="caption">{value}</AppText></View>; }

const styles = StyleSheet.create({
  header: { height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, steps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 12 }, stepDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#C5D8F8' }, stepWide: { width: 22, backgroundColor: palette.coral },
  hero: { minHeight: 76, padding: 12, borderRadius: radius.lg, backgroundColor: palette.coral, flexDirection: 'row', alignItems: 'center', gap: 10, overflow: 'hidden' }, heroIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,255,255,.18)', alignItems: 'center', justifyContent: 'center' }, heroLocation: { flexDirection: 'row', alignItems: 'center', gap: 3 }, bubbles: { position: 'absolute', right: -12, top: -20 },
  summary: { marginTop: 10, paddingVertical: 0 }, summaryRow: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 8 }, summaryBorder: { borderBottomWidth: 1, borderBottomColor: palette.line }, summaryIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  plan: { marginVertical: 10, paddingTop: 12 }, planTitle: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 }, aiBadge: { width: 28, height: 28, borderRadius: 8, backgroundColor: palette.coralSoft, alignItems: 'center', justifyContent: 'center' }, places: { marginLeft: 'auto', backgroundColor: palette.coralSoft, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 4 }, dayBlock: { marginBottom: 10 }, dayTitle: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 5 }, dayNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: palette.coralSoft, alignItems: 'center', justifyContent: 'center' }, stop: { minHeight: 30, marginLeft: 12, borderLeftWidth: 1, borderLeftColor: '#BFD6FA', flexDirection: 'row', alignItems: 'center', gap: 7, paddingLeft: 13 }, dot: { position: 'absolute', left: -3, width: 5, height: 5, borderRadius: 3, backgroundColor: palette.coral }, time: { width: 38 },
});
