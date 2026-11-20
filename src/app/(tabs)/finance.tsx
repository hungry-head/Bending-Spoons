import { BedDouble, Coffee, Plane, Search, Sparkles, Utensils, WalletCards } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, Card, Screen } from '@/design-system/components';
import { buttonTokens, palette, radius } from '@/design-system/theme/tokens';

const tabs = ['Plan', 'Finance', 'Debt', 'Photos'];

export default function FinanceScreen() {
  return <Screen>
    <View style={styles.tabs}>{tabs.map((item) => <View style={[styles.tab, item === 'Finance' && styles.tabActive]} key={item}><AppText variant="caption" color={item === 'Finance' ? palette.white : palette.inkSoft}>{item}</AppText></View>)}</View>
    <Card style={styles.budget}><AppText variant="caption" color="#DDEBFF">BUDGET</AppText><AppText variant="display" color={palette.white}>€800.00</AppText><AppText variant="caption" color="#DDEBFF">/ €5,000.00 budget</AppText></Card>
    <Card style={styles.categories}>
      <View style={styles.handle} />
      <View style={styles.categoryRow}><Category icon={Plane} label="Transport" color="#EAF4FF" /><Category icon={WalletCards} label="Stay" color="#F0E8FF" value="€800.00" /><Category icon={Utensils} label="Food" color="#FFF2DD" /><Category icon={Sparkles} label="Fun" color="#E4FAF3" /></View>
    </Card>
    <Section title="Member Spending" />
    <Card style={styles.members}><Member initial="A" name="Ari" value="€800.00" color="#324553" /><Member initial="J" name="Jerry" value="—" color="#F1A414" /></Card>
    <View style={styles.sectionRow}><Section title="Expenses" /><Pressable><Search size={16} color={palette.inkSoft} /></Pressable><View style={styles.seeAll}><AppText variant="caption" color={palette.coral}>See all →</AppText></View></View>
    <View style={styles.filters}><View style={styles.filterActive}><AppText variant="caption" color={palette.white}>All</AppText></View><Filter icon={Utensils} label="Food" /><Filter icon={Plane} label="Transport" /><Filter icon={BedDouble} label="Stay" /></View>
    <Card><View style={styles.expenseDate}><AppText variant="caption" color={palette.inkSoft}>TODAY · 03/04</AppText><View style={styles.count}><AppText variant="caption" color={palette.coral}>1</AppText></View></View><View style={styles.expense}><View style={styles.expenseIcon}><Coffee size={18} color="#C98228" /></View><View style={{ flex: 1 }}><AppText variant="label">Hotel check-in</AppText><AppText variant="caption" color={palette.inkSoft}>Ari</AppText></View><View><AppText variant="label">€800.00</AppText><AppText variant="caption" color={palette.inkSoft}>€400.00/person</AppText></View></View></Card>
    <Pressable style={styles.fab}><AppText variant="title" color={palette.white}>+</AppText></Pressable>
  </Screen>;
}

function Category({ icon: Icon, label, color, value = '€0.00' }: { icon: typeof Plane; label: string; color: string; value?: string }) { return <View style={styles.category}><View style={[styles.categoryIcon, { backgroundColor: color }]}><Icon size={16} color={palette.coral} /></View><AppText variant="caption">{value}</AppText><AppText variant="caption" color={palette.inkSoft}>{label}</AppText></View>; }
function Member({ initial, name, value, color }: { initial: string; name: string; value: string; color: string }) { return <View style={styles.member}><View style={[styles.memberAvatar, { backgroundColor: color }]}><AppText variant="caption" color={palette.white}>{initial}</AppText></View><AppText variant="label" style={{ flex: 1 }}>{name}</AppText><View><AppText variant="caption" color={palette.coral}>{value}</AppText><AppText variant="caption" color={palette.inkSoft}>100%</AppText></View></View>; }
function Filter({ icon: Icon, label }: { icon: typeof Plane; label: string }) { return <View style={styles.filter}><Icon size={12} color={palette.inkSoft} /><AppText variant="caption">{label}</AppText></View>; }
function Section({ title }: { title: string }) { return <View style={styles.section}><View style={styles.sectionBar} /><AppText variant="label">{title}</AppText></View>; }

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', backgroundColor: '#EEF2F8', borderRadius: radius.md, padding: 4, marginBottom: 10 }, tab: { flex: 1, height: 30, borderRadius: 7, alignItems: 'center', justifyContent: 'center' }, tabActive: { backgroundColor: palette.coral },
  budget: { height: 110, borderWidth: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, backgroundColor: palette.coral }, categories: { marginTop: -5, paddingTop: 8 }, handle: { width: 32, height: 4, borderRadius: 2, backgroundColor: palette.coral, alignSelf: 'center', marginBottom: 12 }, categoryRow: { flexDirection: 'row' }, category: { flex: 1, alignItems: 'center', gap: 2 }, categoryIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  section: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 16, marginBottom: 8 }, sectionBar: { width: 3, height: 14, borderRadius: 2, backgroundColor: '#9A63F5' }, members: { paddingVertical: 4 }, member: { height: 50, flexDirection: 'row', alignItems: 'center', gap: 9 }, memberAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }, sectionRow: { flexDirection: 'row', alignItems: 'center' }, seeAll: { marginLeft: 'auto', backgroundColor: '#F2EAFE', borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 5 }, filters: { flexDirection: 'row', gap: 6, marginBottom: 8 }, filter: { paddingHorizontal: 8, height: 28, borderRadius: radius.pill, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, justifyContent: 'center', flexDirection: 'row', alignItems: 'center', gap: 4 }, filterActive: { paddingHorizontal: 10, height: 28, borderRadius: radius.pill, backgroundColor: palette.coral, justifyContent: 'center' },
  expenseDate: { flexDirection: 'row', justifyContent: 'space-between' }, count: { width: 22, height: 22, borderRadius: 11, backgroundColor: palette.coralSoft, alignItems: 'center', justifyContent: 'center' }, expense: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 9 }, expenseIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: palette.sunSoft, alignItems: 'center', justifyContent: 'center' }, fab: { position: 'absolute', right: 20, bottom: 84, width: 48, height: 48, borderRadius: 24, backgroundColor: buttonTokens.primaryBackground, alignItems: 'center', justifyContent: 'center', shadowColor: buttonTokens.primaryBackground, shadowOpacity: .22, shadowRadius: 12 },
});
