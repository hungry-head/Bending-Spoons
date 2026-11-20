import { router } from 'expo-router';
import { BarChart3, Bell, ChevronRight, CircleHelp, Component, FileText, Globe2, Info, Luggage, MessageSquareText, Moon, Shield, Star, UserRound, WalletCards, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, Screen } from '@/design-system/components';
import { palette, radius } from '@/design-system/theme/tokens';

type Route = '/profile' | '/design-system' | '/trip/lisbon';
type MenuItem = { label: string; icon: LucideIcon; detail?: string; route?: Route };
const groups: { title: string; items: MenuItem[] }[] = [
  { title: 'TRIPS', items: [
    { label: 'Your trips', icon: Luggage, route: '/trip/lisbon' },
    { label: 'Document wallet', icon: FileText },
    { label: 'Statistics', icon: BarChart3 },
    { label: 'Balances', icon: WalletCards, detail: 'None' },
    { label: 'My reviews', icon: MessageSquareText },
  ] },
  { title: 'SETTINGS', items: [
    { label: 'Profile and account', icon: UserRound, route: '/profile' },
    { label: 'Notifications', icon: Bell, detail: 'Off' },
    { label: 'Language', icon: Globe2, detail: 'English' },
    { label: 'Currency', icon: WalletCards, detail: 'EUR' },
    { label: 'Appearance', icon: Moon, detail: 'Light' },
  ] },
  { title: 'SUPPORT', items: [
    { label: 'Help and feedback', icon: CircleHelp },
    { label: 'Rate TripUp', icon: Star },
    { label: 'Privacy', icon: Shield },
    { label: 'About', icon: Info },
    { label: 'Design system', icon: Component, route: '/design-system' },
  ] },
];

export default function MoreScreen() {
  return <Screen>
    <View style={styles.profileCard}><View style={styles.profileIdentity}><View style={styles.avatar}><AppText variant="display" color={palette.navy}>A</AppText></View><View style={styles.profileCopy}><View style={styles.profileNameRow}><AppText variant="title">Ari</AppText><View style={styles.membershipChip}><AppText variant="caption">Free</AppText></View></View><AppText variant="body" color={palette.inkSoft}>ariari@gmail.com</AppText></View></View><View style={styles.profileSeparator} /><Pressable accessibilityRole="button" accessibilityLabel="Update to Premium" style={({ pressed }) => [styles.premiumRow, pressed && styles.rowPressed]}><AppText variant="body" style={styles.premiumCopy}>Update to Premium</AppText><ChevronRight size={19} color={palette.inkSoft} strokeWidth={1.7} /></Pressable></View>
    {groups.map((group) => <View key={group.title} style={styles.group}><AppText variant="overline" color={palette.inkSoft} style={styles.groupTitle}>{group.title}</AppText>{group.items.map((item) => <MenuRow key={item.label} {...item} />)}</View>)}
    <Pressable style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}><AppText variant="action">Sign Out</AppText></Pressable>
    <AppText variant="caption" color={palette.inkSoft} style={styles.version}>TripUp 2.3.6+270</AppText>
  </Screen>;
}

function MenuRow({ label, icon: Icon, detail, route }: MenuItem) {
  return <Pressable accessibilityRole="button" onPress={() => route && router.push(route)} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}><View style={styles.rowIcon}><Icon size={20} color={palette.navy} strokeWidth={1.8} /></View><AppText variant="listItem" style={styles.rowLabel}>{label}</AppText>{detail ? <View style={detail === 'Off' ? styles.offPill : undefined}><AppText variant="supporting" color={detail === 'Off' ? palette.ink : palette.inkSoft}>{detail}</AppText></View> : null}<ChevronRight size={19} color={palette.inkSoft} strokeWidth={1.7} /></Pressable>;
}

const styles = StyleSheet.create({
  profileCard: { marginTop: 8, borderRadius: radius.xl, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, overflow: 'hidden' }, profileIdentity: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }, avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: palette.navySoft, alignItems: 'center', justifyContent: 'center' }, profileCopy: { flex: 1, minWidth: 0 }, profileNameRow: { flexDirection: 'row', alignItems: 'center', gap: 10 }, membershipChip: { minHeight: 28, paddingHorizontal: 12, borderRadius: 14, backgroundColor: palette.navySoft, justifyContent: 'center' }, profileSeparator: { height: 1, marginHorizontal: 16, backgroundColor: palette.line }, premiumRow: { minHeight: 64, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }, premiumCopy: { flex: 1 },
  group: { marginTop: 34 }, groupTitle: { marginBottom: 8 }, row: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 14, borderBottomWidth: 1, borderBottomColor: palette.line }, rowPressed: { backgroundColor: palette.surfaceMuted }, rowIcon: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: palette.canvas, alignItems: 'center', justifyContent: 'center' }, rowLabel: { flex: 1 }, offPill: { backgroundColor: palette.sunSoft, borderRadius: 15, paddingHorizontal: 10, minHeight: 29, justifyContent: 'center' }, signOut: { height: 60, borderRadius: 20, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center', marginTop: 34 }, version: { textAlign: 'center', marginTop: 16, marginBottom: 10 }, pressed: { opacity: .78, transform: [{ scale: .985 }] },
});
