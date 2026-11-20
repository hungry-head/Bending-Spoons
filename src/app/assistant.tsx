import { router } from 'expo-router';
import { ArrowUp, ArrowUpRight, Building2, Lightbulb, Map, Plus, ReceiptText, Search, Sparkles, UserRoundPlus, WalletCards, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { AppText, Screen } from '@/design-system/components';
import { palette, radius, shadow, space, typography } from '@/design-system/theme/tokens';

const prompts = ['Cafes with a view', 'What to eat', 'What to do at night', 'Travel tips'];
const suggestions = [
  { icon: WalletCards, title: 'Auto-settlement', detail: 'Who owes whom, computed for you', tone: palette.mossSoft },
  { icon: UserRoundPlus, title: 'Invite the group', detail: 'Share costs and the itinerary', tone: palette.navySoft },
  { icon: Map, title: 'AI itinerary suggestions', detail: 'A detailed plan in 30 seconds', tone: palette.violetSoft },
];
const capabilities = [
  { icon: Search, title: 'Find places & food', example: 'Cafes with a nice view near the center' },
  { icon: Map, title: 'Build a day-by-day itinerary', example: 'Suggest a 3-day itinerary' },
  { icon: Plus, title: 'Add places to your plan by chat', example: 'Add the night market to day 2' },
  { icon: ReceiptText, title: 'Log expenses instantly', example: 'Add expense lunch €20' },
  { icon: Building2, title: 'Find hotels', example: '4-star hotels nearby' },
  { icon: Lightbulb, title: 'Travel tips & advice', example: 'What should I prepare for this trip?' },
];

export default function AssistantScreen() {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState('');
  const [intro] = useState(() => new Animated.Value(0));
  useEffect(() => { Animated.timing(intro, { toValue: 1, duration: 220, useNativeDriver: Platform.OS !== 'web' }).start(); }, [intro]);
  const submit = () => { const value = message.trim(); if (!value) return; setSent(value); setMessage(''); };
  return <Screen scroll={false}>
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.top}><Pressable accessibilityLabel="Close assistant" onPress={() => router.back()} style={({ pressed }) => [styles.close, pressed && styles.pressed]}><X size={24} color={palette.ink} strokeWidth={1.7} /></Pressable></View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Animated.View style={{ opacity: intro, transform: [{ translateY: intro.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
          <View style={styles.aiMark}><Sparkles size={34} color={palette.white} strokeWidth={1.8} /></View>
          <AppText variant="title" style={styles.center}>Travel assistant</AppText><AppText variant="body" color={palette.inkSoft} style={styles.center}>Ask me about destinations, places to eat, or travel tips!</AppText>
          <View style={styles.promptWrap}>{prompts.map((prompt) => <Pressable key={prompt} onPress={() => setMessage(prompt)} style={({ pressed }) => [styles.prompt, pressed && styles.pressed]}><AppText variant="action">{prompt}</AppText></Pressable>)}</View>
          {sent ? <View style={styles.sent}><AppText variant="body">{sent}</AppText><AppText variant="caption" color={palette.inkSoft}>Ready to plan this with you.</AppText></View> : null}
          <Panel title="Suggested for you" hint="tap to open" titleIcon={Lightbulb}>{suggestions.map(({ icon: Icon, title, detail, tone }) => <Pressable key={title} style={({ pressed }) => [styles.suggestion, pressed && styles.rowPressed]}><View style={[styles.suggestionIcon, { backgroundColor: tone }]}><Icon size={18} color={palette.violet} strokeWidth={1.7} /></View><View style={{ flex: 1 }}><AppText variant="label">{title}</AppText><AppText variant="caption" color={palette.inkSoft}>{detail}</AppText></View><ArrowUpRight size={18} color={palette.violet} strokeWidth={1.7} /></Pressable>)}</Panel>
          <Panel title="What can the assistant do?" hint="Tap to try it" titleIcon={Sparkles}>{capabilities.map(({ icon: Icon, title, example }) => <Pressable key={title} onPress={() => setMessage(example)} style={({ pressed }) => [styles.capability, pressed && styles.rowPressed]}><Icon size={19} color={palette.navy} strokeWidth={1.7} /><View style={{ flex: 1 }}><AppText variant="label">{title}</AppText><AppText variant="caption" color={palette.inkSoft}>“{example}”</AppText></View><ArrowUpRight size={16} color={palette.inkSoft} strokeWidth={1.5} /></Pressable>)}</Panel>
        </Animated.View>
      </ScrollView>
      <View style={styles.usage}><View style={styles.meter}><View style={[styles.meterBar, styles.meterHot]} /><View style={styles.meterBar} /><View style={styles.meterBar} /></View><AppText variant="body" color={palette.inkSoft}>2/3 free AI requests left</AppText><View style={styles.premium}><AppText variant="caption" color={palette.white}>Premium</AppText></View></View>
      <View style={styles.composer}><TextInput value={message} onChangeText={setMessage} multiline placeholder="Ask the assistant..." placeholderTextColor="#A6ADB6" style={styles.composerInput} /><Pressable accessibilityLabel="Send message" onPress={submit} style={({ pressed }) => [styles.send, pressed && styles.pressed]}><ArrowUp size={23} color={palette.white} strokeWidth={1.8} /></Pressable></View>
    </KeyboardAvoidingView>
  </Screen>;
}

function Panel({ title, hint, titleIcon: Icon, children }: { title: string; hint: string; titleIcon: typeof Sparkles; children: React.ReactNode }) {
  return <View style={styles.panel}><View style={styles.panelTitle}><Icon size={17} color={palette.violet} strokeWidth={1.8} /><AppText variant="label" style={{ flex: 1 }}>{title}</AppText><AppText variant="caption" color="#ADB4BC">{hint}</AppText></View>{children}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: space.md }, top: { height: 52, alignItems: 'flex-end', justifyContent: 'center' }, close: { width: 46, height: 46, borderRadius: 23, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center', ...shadow.card }, content: { paddingBottom: 210 }, aiMark: { width: 72, height: 72, borderRadius: 24, backgroundColor: palette.violet, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 30, marginBottom: 18, shadowColor: palette.violet, shadowOpacity: .22, shadowRadius: 20 }, center: { textAlign: 'center', marginBottom: 5 }, promptWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 28, marginBottom: 8 }, prompt: { height: 42, borderRadius: 21, borderWidth: 1, borderColor: '#DDD5F8', backgroundColor: palette.surface, paddingHorizontal: 18, justifyContent: 'center' }, sent: { backgroundColor: palette.violetSoft, borderRadius: radius.lg, padding: 14, marginTop: 16, gap: 4 },
  panel: { marginTop: 20, borderRadius: radius.lg, borderWidth: 1, borderColor: '#E7E0F7', backgroundColor: palette.surface, padding: 14 }, panelTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }, suggestion: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, paddingHorizontal: 2 }, suggestionIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }, capability: { minHeight: 62, flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8, borderRadius: 10 }, rowPressed: { backgroundColor: palette.canvas },
  usage: { position: 'absolute', left: space.md, right: space.md, bottom: 172, flexDirection: 'row', alignItems: 'center', gap: 10 }, meter: { width: 58, flexDirection: 'row', gap: 3 }, meterBar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: palette.line }, meterHot: { backgroundColor: '#E78132' }, premium: { marginLeft: 'auto', height: 34, paddingHorizontal: 15, borderRadius: 17, backgroundColor: palette.navy, justifyContent: 'center' }, composer: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 160, borderTopLeftRadius: 32, borderTopRightRadius: 32, backgroundColor: palette.surface, padding: 22, ...shadow.card }, composerInput: { minHeight: 70, paddingRight: 48, color: palette.ink, textAlignVertical: 'top', ...typography.body }, send: { position: 'absolute', right: 22, bottom: 22, width: 52, height: 52, borderRadius: 26, backgroundColor: palette.black, alignItems: 'center', justifyContent: 'center' }, pressed: { opacity: .72, transform: [{ scale: .96 }] },
});
