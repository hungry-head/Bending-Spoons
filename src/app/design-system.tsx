import { router } from 'expo-router';
import { ArrowLeft, Bell, CarFront, Check, Ellipsis, Heart, MapPin, MessageSquare, Plus, Search, Settings2, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, Button, Card, Chip, IconButton, OpenStreetMap, Pill, Screen, SectionHeading, TextField, TripArtwork } from '@/design-system/components';
import { fontSize, grid, lineHeight, palette, radius, shadow, space, typography } from '@/design-system/theme/tokens';

const colorGroups = [
  ['Brand', [['Primary', palette.coral], ['Primary soft', palette.coralSoft], ['Sky', palette.sky], ['Sky soft', palette.skySoft]]],
  ['Neutral', [['Ink', palette.ink], ['Muted ink', palette.inkSoft], ['Canvas', palette.canvas], ['Surface', palette.surface], ['Line', palette.line]]],
  ['Semantic', [['Success', palette.success], ['Warning', palette.sun], ['Information', palette.sky], ['Accent', palette.moss]]],
] as const;

export default function DesignSystemScreen() {
  const [tab, setTab] = useState<'foundations' | 'components'>('foundations');
  return <Screen>
    <View style={styles.header}><IconButton icon={ArrowLeft} label="Back to More" onPress={() => router.back()} /><View><AppText variant="caption" color={palette.inkSoft}>MORE / DEVELOPER</AppText><AppText variant="title">Design system</AppText></View></View>
    <AppText variant="body" color={palette.inkSoft}>The app-local source of truth for TripUp foundations and reusable mobile components.</AppText>

    <View accessibilityRole="tablist" style={styles.tabs}>
      <CatalogTab label="Foundations" selected={tab === 'foundations'} onPress={() => setTab('foundations')} />
      <CatalogTab label="Components" selected={tab === 'components'} onPress={() => setTab('components')} />
    </View>

    {tab === 'foundations' ? <FoundationsCatalog /> : <ComponentsCatalog />}
  </Screen>;
}

function FoundationsCatalog() {
  return <View style={styles.tabPanel}>
    <Foundation title="Color" detail="Semantic roles, not feature-specific hex values">
      {colorGroups.map(([name, colors]) => <View key={name} style={styles.tokenGroup}><AppText variant="caption" color={palette.inkSoft}>{name}</AppText><View style={styles.swatchGrid}>{colors.map(([label, color]) => <View key={label} style={styles.swatchItem}><View style={[styles.swatch, { backgroundColor: color }]} /><AppText variant="caption">{label}</AppText><AppText variant="caption" color={palette.inkSoft}>{color}</AppText></View>)}</View></View>)}
    </Foundation>

    <Foundation title="Typography" detail="System font stack with semantic roles">
      {(Object.keys(typography) as (keyof typeof typography)[]).map((role) => <View key={role} style={styles.typeRow}><AppText variant={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</AppText><AppText variant="caption" color={palette.inkSoft}>{fontSize[role]} / {lineHeight[role]}</AppText></View>)}
    </Foundation>

    <Foundation title="Spacing" detail="4pt baseline, seven named steps">
      <View style={styles.spaceList}>{Object.entries(space).map(([name, value]) => <View style={styles.spaceRow} key={name}><AppText variant="caption" color={palette.inkSoft} style={{ width: 34 }}>{name}</AppText><View style={[styles.spaceBar, { width: value * 2 }]} /><AppText variant="caption">{value}px</AppText></View>)}</View>
    </Foundation>

    <Foundation title="Grid system" detail={`${grid.columns} columns · ${grid.margin}px margin · ${grid.gutter}px gutter`}>
      <View style={styles.gridPreview}>{Array.from({ length: grid.columns }, (_, index) => <View style={styles.gridColumn} key={index}><AppText variant="caption" color={palette.coral}>{index + 1}</AppText></View>)}</View>
      <AppText variant="caption" color={palette.inkSoft}>Baseline {grid.baseline}px · Max content width {grid.maxContentWidth}px</AppText>
    </Foundation>

    <Foundation title="Shape & elevation" detail="Compact radii and one restrained card shadow">
      <View style={styles.shapeRow}>{Object.entries(radius).filter(([name]) => name !== 'pill').map(([name, value]) => <View key={name} style={[styles.shape, { borderRadius: value }]}><AppText variant="caption">{name} · {value}</AppText></View>)}</View>
      <Card style={styles.elevation}><AppText variant="label">Card elevation</AppText><AppText variant="caption" color={palette.inkSoft}>Shadow opacity {shadow.card.shadowOpacity}</AppText></Card>
    </Foundation>
  </View>;
}

function ComponentsCatalog() {
  return <View style={styles.tabPanel}>
    <ComponentGroup title="Actions" components="Button · IconButton · Chip · Pill">
      <View style={styles.wrap}><Button label="Primary" icon={Plus} /><Button label="Secondary" icon={Settings2} tone="secondary" /><Button label="Tertiary action" tone="tertiary" /></View>
      <View style={styles.wrap}><IconButton icon={Bell} label="Notifications" /><IconButton icon={Search} label="Search" /><IconButton icon={Heart} label="Favorite" /></View>
      <View style={styles.wrap}><Chip label="Food" selected /><Chip label="Culture" /><Chip label="Nature" /></View>
      <View style={styles.wrap}><Pill label="Attractions" /><Pill label="Food & Drink" /><Pill label="Shopping" /></View>
    </ComponentGroup>

    <ComponentGroup title="Forms" components="TextField · Large Chip">
      <TextField accessibilityLabel="Example activity name" placeholder="Activity name" />
      <View style={styles.wrap}><Chip label="Attractions" size="large" selected /><Chip label="Food & Drink" size="large" /></View>
    </ComponentGroup>

    <ComponentGroup title="Data display" components="AppText · Card · SectionHeading">
      <Card><AppText variant="label">Trip summary</AppText><AppText variant="body" color={palette.inkSoft}>A reusable surface for itinerary and financial data.</AppText><View style={styles.status}><Check size={13} color={palette.success} /><AppText variant="caption" color={palette.success}>Ready</AppText></View></Card>
      <SectionHeading title="Nearby places" action="See all" style={styles.sectionHeadingSpecimen} />
    </ComponentGroup>

    <ComponentGroup title="Card variations" components="Itinerary · Poll-generated · Saved place · Poll result · Member">
      <AppText variant="caption" color={palette.inkSoft}>Itinerary, collaboration, and saved-place cards share the same radius, border, type roles, and 44pt action targets.</AppText>
      <View style={styles.cardSpecimen}><View style={styles.cardSpecimenTop}><View style={{ flex: 1 }}><AppText variant="h5">Praça do Comércio</AppText><AppText variant="body" color={palette.inkSoft}>Morning · Riverside square</AppText></View><Ellipsis size={18} color={palette.inkSoft} /></View><View style={styles.cardSpecimenBottom}><Pill label="Attractions" compact /><MessageSquare size={18} color={palette.inkSoft} strokeWidth={1.7} /></View></View>
      <View style={styles.cardSpecimen}><View style={styles.cardSpecimenTop}><View style={{ flex: 1 }}><AppText variant="h5">Dinner at Cervejaria Ramiro</AppText><AppText variant="body" color={palette.inkSoft}>Activity added through poll by Ari</AppText><AppText variant="body" color={palette.inkSoft}>22:30</AppText></View><Ellipsis size={18} color={palette.inkSoft} /></View><View style={styles.cardSpecimenBottom}><Pill label="Food & Drinks" compact /></View></View>
      <View style={styles.placeCardSpecimen}><View style={styles.placeImageSpecimen} /><View style={styles.placeCopySpecimen}><View style={styles.cardInline}><AppText variant="h5">Firefly</AppText><Star size={14} color={palette.ink} strokeWidth={1.7} /><AppText variant="supporting">4.9</AppText></View><AppText variant="body" color={palette.inkSoft}>Mexican · €€</AppText></View><View style={styles.placeMetaSpecimen}><AppText variant="supporting" color={palette.inkSoft}>Open now</AppText><View style={styles.cardInline}><CarFront size={14} color={palette.ink} strokeWidth={1.7} /><AppText variant="supporting" color={palette.inkSoft}>20m</AppText></View></View></View>
      <View style={[styles.placeCardSpecimen, styles.pollResultSpecimen]}><View style={styles.placeImageSpecimen} /><View style={styles.placeCopySpecimen}><View style={styles.cardInline}><AppText variant="h5">Cervejaria Ramiro</AppText><Star size={14} color={palette.ink} strokeWidth={1.7} /></View><AppText variant="body" color={palette.inkSoft}>Open now · 20m</AppText><View style={styles.resultTrack}><View style={styles.resultFill} /></View></View><AppText variant="h5" style={styles.resultPercent}>42%</AppText></View>
      <View style={styles.memberCardSpecimen}><View style={styles.memberAvatarSpecimen} /><View style={{ flex: 1 }}><AppText variant="h6">Gops</AppText><AppText variant="body" color={palette.inkSoft}>gopsgops@gmail.com</AppText><Pill label="Trip leader" compact /></View><AppText variant="h6" color={palette.success}>€123</AppText><Ellipsis size={18} color={palette.inkSoft} /></View>
    </ComponentGroup>

    <ComponentGroup title="Travel" components="TripArtwork · OpenStreetMap">
      <TripArtwork city="Nha Trang" color={palette.sky} accent={palette.sun} compact />
      <OpenStreetMap height={170} />
    </ComponentGroup>

    <ComponentGroup title="Layout & utilities" components="Screen · DevicePreview · BottomSheet">
      <View style={styles.utilityRow}><View style={styles.utilityIcon}><MapPin size={17} color={palette.coral} /></View><View style={{ flex: 1 }}><AppText variant="label">Screen</AppText><AppText variant="caption" color={palette.inkSoft}>Safe-area, scroll and content-padding primitive</AppText></View></View>
      <View style={styles.utilityRow}><View style={styles.phoneGlyph}><View /></View><View style={{ flex: 1 }}><AppText variant="label">DevicePreview</AppText><AppText variant="caption" color={palette.inkSoft}>Web-only phone frame; native output remains unwrapped</AppText></View></View>
      <View style={styles.utilityRow}><View style={styles.utilityIcon}><Plus size={17} color={palette.coral} /></View><View style={{ flex: 1 }}><AppText variant="label">BottomSheet</AppText><AppText variant="caption" color={palette.inkSoft}>Animated, dismissible action surface with configurable insets</AppText></View></View>
    </ComponentGroup>
  </View>;
}

function CatalogTab({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) { return <Pressable accessibilityRole="tab" accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [styles.tab, selected && styles.tabSelected, pressed && styles.tabPressed]}><AppText variant="tab" color={selected ? palette.white : palette.inkSoft}>{label}</AppText></Pressable>; }
function Foundation({ title, detail, children }: { title: string; detail: string; children: React.ReactNode }) { return <Card style={styles.foundation}><View style={styles.blockHeading}><AppText variant="heading">{title}</AppText><AppText variant="caption" color={palette.inkSoft}>{detail}</AppText></View>{children}</Card>; }
function ComponentGroup({ title, components, children }: { title: string; components: string; children: React.ReactNode }) { return <View style={styles.componentGroup}><View style={styles.blockHeading}><AppText variant="heading">{title}</AppText><AppText variant="caption" color={palette.inkSoft}>{components}</AppText></View><View style={styles.componentBody}>{children}</View></View>; }

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.sm }, tabs: { flexDirection: 'row', padding: 4, marginTop: space.lg, marginBottom: space.md, borderRadius: radius.pill, backgroundColor: palette.surfaceMuted }, tab: { flex: 1, minHeight: 42, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' }, tabSelected: { backgroundColor: palette.navy }, tabPressed: { opacity: .72 }, tabPanel: { gap: 0 },
  foundation: { marginBottom: space.sm, gap: space.md }, blockHeading: { gap: space.xxs }, tokenGroup: { gap: space.xs }, swatchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }, swatchItem: { width: '46%', gap: 3 }, swatch: { height: 42, borderRadius: radius.sm, borderWidth: 1, borderColor: palette.line },
  typeRow: { minHeight: 52, borderBottomWidth: 1, borderBottomColor: palette.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, spaceList: { gap: space.xs }, spaceRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs }, spaceBar: { height: 8, borderRadius: 4, backgroundColor: palette.coral }, gridPreview: { height: 84, flexDirection: 'row', gap: grid.gutter, paddingHorizontal: grid.margin, backgroundColor: palette.coralSoft, borderRadius: radius.md }, gridColumn: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(36,120,243,.14)' },
  shapeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }, shape: { width: '47%', height: 54, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surfaceMuted, alignItems: 'center', justifyContent: 'center' }, elevation: { gap: 3 },
  componentGroup: { marginBottom: space.xl, gap: space.md }, componentBody: { gap: space.md }, wrap: { flexDirection: 'row', flexWrap: 'wrap', columnGap: space.xs, rowGap: space.sm }, sectionHeadingSpecimen: { marginTop: 0, marginBottom: 0 }, status: { marginTop: space.sm, flexDirection: 'row', alignItems: 'center', gap: 5 }, utilityRow: { minHeight: 72, paddingVertical: space.sm, flexDirection: 'row', alignItems: 'center', gap: space.sm, borderBottomWidth: 1, borderBottomColor: palette.line }, utilityIcon: { width: 38, height: 38, borderRadius: radius.md, backgroundColor: palette.coralSoft, alignItems: 'center', justifyContent: 'center' }, phoneGlyph: { width: 25, height: 40, borderRadius: 7, borderWidth: 2, borderColor: palette.ink, alignItems: 'center', paddingTop: 3 },
  cardSpecimen: { minHeight: 122, padding: space.md, borderRadius: radius.lg, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface }, cardSpecimenTop: { flexDirection: 'row', gap: space.sm }, cardSpecimenBottom: { marginTop: space.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, cardInline: { flexDirection: 'row', alignItems: 'center', gap: 4 }, placeCardSpecimen: { minHeight: 104, borderRadius: radius.lg, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, flexDirection: 'row', overflow: 'hidden' }, placeImageSpecimen: { width: 92, backgroundColor: palette.surfaceMuted }, placeCopySpecimen: { flex: 1, paddingHorizontal: space.sm, justifyContent: 'center', gap: 5 }, placeMetaSpecimen: { paddingRight: space.sm, alignItems: 'flex-end', justifyContent: 'center', gap: 8 }, pollResultSpecimen: { borderWidth: 2, borderColor: palette.inkSoft }, resultTrack: { height: 4, marginTop: 5, borderRadius: 2, backgroundColor: palette.line, overflow: 'hidden' }, resultFill: { width: '42%', height: 4, borderRadius: 2, backgroundColor: palette.inkSoft }, resultPercent: { alignSelf: 'flex-end', marginRight: space.sm, marginTop: 'auto', marginBottom: space.sm }, memberCardSpecimen: { minHeight: 104, padding: space.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, flexDirection: 'row', alignItems: 'center', gap: space.sm }, memberAvatarSpecimen: { width: 54, height: 54, borderRadius: 27, backgroundColor: palette.surfaceMuted },
});
