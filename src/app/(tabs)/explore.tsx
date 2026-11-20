import { Image } from 'expo-image';
import { Plane, Search, ThumbsUp } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { AppText, Screen } from '@/design-system/components';
import { palette, radius, space, typography } from '@/design-system/theme/tokens';

const guides = [
  { title: '4 ngày vòng cung Hà Giang cùng nhóm bạn', meta: '4 days · 29 stops · Friends', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=900' },
  { title: '3 ngày Đà Lạt chậm rãi', meta: '3 days · 22 stops · Couple', image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=900' },
];
const howTos = [
  { title: 'Lisbon without the queues', meta: 'Food, timing and local routes', image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=900' },
  { title: 'Where locals eat after dark', meta: '8 saved places · Lisbon', image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=900' },
];

export default function ExploreScreen() {
  const [category, setCategory] = useState('All');
  return <Screen>
    <AppText variant="display" style={styles.title}>Explore</AppText>
    <View style={styles.search}><Search size={22} color={palette.inkSoft} strokeWidth={1.7} /><TextInput placeholder="Search places, food, stays" placeholderTextColor={palette.inkSoft} style={styles.input} /></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>{['All', 'Guides', 'Stays', 'Attractions', 'Food'].map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={({ pressed }) => [styles.chip, category === item && styles.chipActive, pressed && { opacity: .72 }]}><AppText variant="action" color={category === item ? palette.white : palette.ink}>{item}</AppText></Pressable>)}</ScrollView>
    <ContentSection title="Guides from travelers" subtitle="Real itineraries with the writer’s ratings and tips" items={guides} />
    <ContentSection title="How-tos from people who went" subtitle="Getting around, food, where to stay, tips from recent visitors" items={howTos} />
  </Screen>;
}

function ContentSection({ title, subtitle, items }: { title: string; subtitle: string; items: typeof guides }) {
  return <View style={styles.section}><View style={styles.sectionTitle}><AppText variant="title" style={{ flex: 1 }}>{title}</AppText><AppText variant="action" color={palette.coral}>All</AppText></View><AppText variant="body" color={palette.inkSoft}>{subtitle}</AppText><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cards}>{items.map((item) => <Pressable key={item.title} style={({ pressed }) => [styles.card, pressed && styles.pressed]}><View style={styles.photoWrap}><Image source={item.image} style={StyleSheet.absoluteFill} contentFit="cover" transition={180} /><View style={styles.featured}><AppText variant="caption">Featured</AppText></View></View><AppText variant="heading" numberOfLines={2} style={styles.cardTitle}>{item.title}</AppText><AppText variant="body" color={palette.inkSoft}>{item.meta}</AppText><View style={styles.byline}><View style={styles.tripUpMark}><Plane size={13} color={palette.white} strokeWidth={1.8} /></View><AppText variant="body" color={palette.inkSoft}>TripUp</AppText><ThumbsUp size={15} color={palette.inkSoft} strokeWidth={1.6} /><AppText variant="body" color={palette.inkSoft}>Helpful 1</AppText></View></Pressable>)}</ScrollView></View>;
}

const styles = StyleSheet.create({
  title: { marginBottom: 18 }, search: { height: 58, borderRadius: 28, borderWidth: 1.2, borderColor: palette.inkSoft, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, backgroundColor: palette.canvas }, input: { flex: 1, height: '100%', color: palette.ink, ...typography.body },
  categories: { gap: 10, paddingVertical: 16, paddingRight: space.md }, chip: { minWidth: 76, height: 48, borderRadius: 24, paddingHorizontal: 22, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center' }, chipActive: { backgroundColor: palette.navy, borderColor: palette.navy },
  section: { marginTop: 26 }, sectionTitle: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 }, cards: { gap: 14, paddingTop: 16, paddingRight: space.md }, card: { width: 274 }, photoWrap: { height: 184, borderRadius: radius.xl, backgroundColor: palette.navySoft, overflow: 'hidden' }, featured: { position: 'absolute', top: 12, left: 12, backgroundColor: palette.surface, borderRadius: 18, minHeight: 34, paddingHorizontal: 14, justifyContent: 'center' }, cardTitle: { marginTop: 10, minHeight: 46 }, byline: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12 }, tripUpMark: { width: 28, height: 28, borderRadius: 14, backgroundColor: palette.sky, alignItems: 'center', justifyContent: 'center' }, pressed: { opacity: .8, transform: [{ scale: .985 }] },
});
