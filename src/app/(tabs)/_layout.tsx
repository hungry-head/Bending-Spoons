import { router, Tabs } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, CalendarPlus, Compass, House, ImagePlus, MapPinPlus, NotebookPen, Plus, ReceiptText, ScanLine, Sparkles, UserRound } from 'lucide-react-native';
import { useState, type ComponentProps } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { AppText, ContextActionBar, HomeNavIcon, type ContextAction } from '@/design-system/components';
import { palette } from '@/design-system/theme/tokens';

const icons = { index: House, explore: Compass, memories: BookOpen, more: UserRound } as const;
const labels = { index: 'Home', explore: 'Explore', memories: 'Memories', more: 'Account' } as const;
const visibleRoutes = ['index', 'explore', 'memories', 'more'] as const;
type FloatingTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

function FloatingTabBar({ state, emitter, navigateToTab }: FloatingTabBarProps) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiValue, setAiValue] = useState('');
  const routes = state.routes.filter((route) => visibleRoutes.includes(route.name as (typeof visibleRoutes)[number]));
  const activeRoute = state.routes[state.index]?.name;

  const closeLauncher = () => {
    setActionsOpen(false);
    setAiOpen(false);
  };

  const openTripAction = (quickAction: string) => {
    closeLauncher();
    router.push(`/trip/lisbon?quickAction=${quickAction}`);
  };

  const aiAction: ContextAction = { key: 'ai', label: 'Ask AI', icon: Sparkles, onPress: () => setAiOpen((open) => !open) };
  const actions: ContextAction[] = activeRoute === 'index'
    ? [aiAction]
    : activeRoute === 'memories'
    ? [aiAction, { key: 'photo', label: 'Add photo', icon: ImagePlus, onPress: () => openTripAction('photo') }, { key: 'memory', label: 'Memory', icon: NotebookPen, onPress: () => openTripAction('memory') }]
    : [aiAction, { key: 'activity', label: 'Activity', icon: MapPinPlus, onPress: () => openTripAction('activity') }, { key: 'day', label: 'Add day', icon: CalendarPlus, onPress: () => openTripAction('day') }, { key: 'expense', label: 'Expense', icon: ReceiptText, onPress: () => openTripAction('expense') }, { key: 'scan', label: 'Scan receipt', icon: ScanLine, onPress: () => openTripAction('scan') }];

  const renderRoute = (route: (typeof routes)[number]) => {
    const routeIndex = state.routes.indexOf(route);
    const focused = state.index === routeIndex;
    const Icon = icons[route.name as keyof typeof icons] ?? House;
    const label = labels[route.name as keyof typeof labels] ?? 'Home';
    const color = focused ? palette.navy : '#98A2B3';
    const iconSize = 22;
    const strokeWidth = focused ? 1.55 : 1.3;
    const onPress = () => {
      closeLauncher();
      const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) navigateToTab(route.key);
    };

    return <Pressable key={route.key} accessibilityRole="button" accessibilityState={{ selected: focused }} accessibilityLabel={label} onPress={onPress} onLongPress={() => emitter.emit({ type: 'tabLongPress', target: route.key })} style={({ pressed }) => [styles.tabItem, pressed && styles.tabItemPressed]}>{focused ? <LinearGradient pointerEvents="none" colors={['rgba(43,125,233,0.20)', 'rgba(43,125,233,0)']} locations={[0, 1]} style={styles.tabItemGradient} /> : null}<View style={styles.tabIcon}>{route.name === 'index' ? <HomeNavIcon active={focused} size={iconSize} color={color} strokeWidth={strokeWidth} /> : <Icon size={iconSize} color={color} strokeWidth={strokeWidth} />}</View><AppText variant="caption" color={color} style={!focused && styles.tabLabelInactive}>{label}</AppText></Pressable>;
  };

  return <View pointerEvents="box-none" style={styles.navStage}>
    <ContextActionBar open={actionsOpen} actions={actions} aiOpen={aiOpen} aiValue={aiValue} onAiChange={setAiValue} onAiSubmit={() => { if (!aiValue.trim()) return; closeLauncher(); router.push(`/assistant?prompt=${encodeURIComponent(aiValue.trim())}`); setAiValue(''); }} onDismiss={closeLauncher} bottom={84} />
    <View style={styles.tabBar}>
      {routes.slice(0, 2).map(renderRoute)}
      <Pressable accessibilityRole="button" accessibilityLabel={actionsOpen ? 'Close quick actions' : 'Open quick actions'} accessibilityState={{ expanded: actionsOpen }} onPress={() => { setActionsOpen((open) => !open); if (actionsOpen) setAiOpen(false); }} style={({ pressed }) => [styles.actionItem, pressed && styles.tabItemPressed]}><View style={styles.actionCircle}><Plus size={25} color={palette.white} strokeWidth={1.8} /></View></Pressable>
      {routes.slice(2).map(renderRoute)}
    </View>
  </View>;
}

export default function TabLayout() {
  return <Tabs tabBar={(props) => <FloatingTabBar {...props} />} screenOptions={{ headerShown: false, animation: 'fade' }}>
    <Tabs.Screen name="index" options={{ title: 'Home' }} />
    <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
    <Tabs.Screen name="memories" options={{ title: 'Memories' }} />
    <Tabs.Screen name="more" options={{ title: 'Account' }} />
    <Tabs.Screen name="trips" options={{ href: null }} />
    <Tabs.Screen name="schedule" options={{ href: null }} />
    <Tabs.Screen name="finance" options={{ href: null }} />
    <Tabs.Screen name="profile" options={{ href: null }} />
    <Tabs.Screen name="planner" options={{ href: null }} />
    <Tabs.Screen name="packing" options={{ href: null }} />
  </Tabs>;
}

const styles = StyleSheet.create({
  navStage: { position: 'absolute', zIndex: 80, top: 0, right: 0, bottom: 0, left: 0 },
  tabBar: { position: 'absolute', left: 12, right: 12, bottom: 12, height: Platform.OS === 'ios' ? 70 : 66, borderRadius: 35, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, flexDirection: 'row', overflow: 'hidden', shadowColor: palette.ink, shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  tabItem: { position: 'relative', flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabItemPressed: { opacity: 0.74 },
  tabItemGradient: { position: 'absolute', top: 2, left: 4, right: 4, bottom: 2, borderRadius: 27 },
  tabIcon: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  tabLabelInactive: { fontWeight: '400' },
  actionItem: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center' },
  actionCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: palette.navy, alignItems: 'center', justifyContent: 'center', shadowColor: palette.navy, shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
});
