import { router } from 'expo-router';
import { ArrowLeft, ChevronRight, Eye, Plus, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AppText, Screen } from '@/design-system/components';
import { palette, space, typography } from '@/design-system/theme/tokens';

const categories = ['Clothes', 'Documents', 'Personal items', 'Electronics', 'Medicine', 'Other'];

export default function PackingScreen() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('Personal items');
  const [draft, setDraft] = useState('');
  const [items, setItems] = useState<string[]>([]);
  const add = () => { const value = draft.trim(); if (!value) return; setItems((current) => [...current, value]); setDraft(''); setOpen(false); };
  return <Screen scroll={false}>
    <View style={styles.screen}>
      <View style={styles.actions}><Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.circle}><ArrowLeft size={24} color={palette.navy} strokeWidth={1.8} /></Pressable><Pressable style={styles.hide}><Eye size={20} color={palette.navy} strokeWidth={1.7} /><AppText variant="action">Hide packed</AppText></Pressable></View>
      <AppText variant="caption" color={palette.coral} style={styles.eyebrow}>LISBON · 12 DAYS</AppText><AppText variant="display">Packing</AppText>
      <View style={styles.tabs}><View style={styles.activeTab}><AppText variant="heading">Mine</AppText></View><View style={styles.tab}><AppText variant="heading" color={palette.inkSoft}>Shared</AppText></View></View>
      <Pressable style={({ pressed }) => [styles.suggestions, pressed && styles.rowPressed]}><Sparkles size={24} color={palette.navy} strokeWidth={1.7} /><AppText variant="action" color={palette.coral} style={{ flex: 1 }}>39 suggestions</AppText><ChevronRight size={22} color={palette.inkSoft} strokeWidth={1.7} /></Pressable>
      {items.length === 0 ? <View style={styles.empty}><AppText variant="title">Nothing here yet</AppText><AppText variant="body" color={palette.inkSoft}>Add items or open suggestions to start packing.</AppText></View> : <View style={styles.list}>{items.map((item) => <View key={item} style={styles.item}><View style={styles.checkbox} /><View style={{ flex: 1 }}><AppText variant="heading">{item}</AppText><AppText variant="caption" color={palette.inkSoft}>{category}</AppText></View></View>)}</View>}
      <Pressable onPress={() => setOpen(true)} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}><Plus size={22} color={palette.white} strokeWidth={1.8} /><AppText variant="action" color={palette.white}>Add item</AppText></Pressable>
    </View>
    <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
      <KeyboardAvoidingView style={styles.modalRoot} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.scrim} onPress={() => setOpen(false)} />
        <View style={styles.sheet}><View style={styles.handle} /><AppText variant="title">Add item</AppText><TextInput autoFocus value={draft} onChangeText={setDraft} onSubmitEditing={add} placeholder="e.g. Jacket" placeholderTextColor="#919AA5" style={styles.input} /><View style={styles.categoryWrap}>{categories.map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.category, category === item && styles.categoryActive]}><AppText variant="action" color={category === item ? palette.white : palette.ink}>{item}</AppText></Pressable>)}</View><Pressable onPress={add} style={({ pressed }) => [styles.sheetAdd, !draft.trim() && styles.disabled, pressed && styles.pressed]}><AppText variant="action" color={palette.white}>Add</AppText></Pressable></View>
      </KeyboardAvoidingView>
    </Modal>
  </Screen>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: space.lg }, actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }, circle: { width: 50, height: 50, borderRadius: 25, backgroundColor: palette.canvas, borderWidth: 1, borderColor: palette.line, alignItems: 'center', justifyContent: 'center' }, hide: { minWidth: 144, height: 50, borderRadius: 25, borderWidth: 1, borderColor: palette.line, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }, eyebrow: { letterSpacing: 1.1, marginTop: 18, marginBottom: 5 }, tabs: { flexDirection: 'row', height: 74, borderBottomWidth: 1, borderBottomColor: palette.line, marginHorizontal: -space.lg, paddingHorizontal: space.lg, marginTop: 14 }, tab: { paddingHorizontal: 18, justifyContent: 'center' }, activeTab: { paddingHorizontal: 0, marginRight: 18, justifyContent: 'center', borderBottomWidth: 3, borderBottomColor: palette.sky }, suggestions: { minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: 14 }, rowPressed: { backgroundColor: palette.canvas }, empty: { alignItems: 'center', gap: 8, marginTop: 72 }, list: { marginTop: 28, gap: 10 }, item: { minHeight: 64, borderBottomWidth: 1, borderBottomColor: palette.line, flexDirection: 'row', alignItems: 'center', gap: 14 }, checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 1.5, borderColor: palette.inkSoft }, addButton: { position: 'absolute', right: 20, bottom: 24, height: 58, borderRadius: 29, paddingHorizontal: 26, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: palette.navy },
  modalRoot: { flex: 1, justifyContent: 'flex-end' }, scrim: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(13,49,90,.42)' }, sheet: { minHeight: 420, borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: palette.surface, paddingHorizontal: 22, paddingBottom: 24 }, handle: { width: 42, height: 4, borderRadius: 2, backgroundColor: palette.sheetHandle, alignSelf: 'center', marginTop: 14, marginBottom: 24 }, input: { height: 62, borderRadius: 26, borderWidth: 2, borderColor: palette.sky, paddingHorizontal: 20, color: palette.ink, marginTop: 18, ...typography.heading }, categoryWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 }, category: { minHeight: 50, borderRadius: 25, paddingHorizontal: 20, borderWidth: 1, borderColor: palette.line, alignItems: 'center', justifyContent: 'center' }, categoryActive: { backgroundColor: palette.navy, borderColor: palette.navy }, sheetAdd: { height: 58, borderRadius: 29, backgroundColor: palette.navy, alignItems: 'center', justifyContent: 'center', marginTop: 22 }, disabled: { opacity: .45 }, pressed: { opacity: .76, transform: [{ scale: .98 }] },
});
