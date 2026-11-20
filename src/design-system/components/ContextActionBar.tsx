import { LinearGradient } from 'expo-linear-gradient';
import { ArrowUp, type LucideIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, TextInput, View, type ViewStyle } from 'react-native';
import { palette, shadow, typography } from '../theme/tokens';
import { AppText } from './AppText';

const trayGlassStyle = Platform.OS === 'web'
  ? ({ backdropFilter: 'blur(16px) saturate(120%)' } as ViewStyle & { backdropFilter: string })
  : undefined;

export type ContextAction = {
  key: string;
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  guidePulse?: Animated.Value;
  guideVisible?: boolean;
};

export function ContextActionBar({ open, actions, aiOpen, aiValue, onAiChange, onAiSubmit, onDismiss, bottom = 84 }: {
  open: boolean;
  actions: ContextAction[];
  aiOpen: boolean;
  aiValue: string;
  onAiChange: (value: string) => void;
  onAiSubmit: () => void;
  onDismiss?: () => void;
  bottom?: number;
}) {
  const [actionMotion] = useState(() => new Animated.Value(open ? 1 : 0));
  const [composerMotion] = useState(() => new Animated.Value(aiOpen ? 1 : 0));

  useEffect(() => {
    Animated.timing(actionMotion, {
      toValue: open ? 1 : 0,
      duration: open ? 240 : 170,
      easing: open ? Easing.out(Easing.cubic) : Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [actionMotion, open]);

  useEffect(() => {
    Animated.timing(composerMotion, {
      toValue: aiOpen ? 1 : 0,
      duration: aiOpen ? 220 : 150,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [aiOpen, composerMotion]);

  const composerOpacity = composerMotion;
  const composerTranslate = composerMotion.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });
  const composerScale = composerMotion.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] });
  const trayTranslate = actionMotion.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });

  const compact = actions.length === 1;

  return <View pointerEvents="box-none" style={styles.layer}>
    {open && onDismiss ? <Pressable accessibilityRole="button" accessibilityLabel="Close quick actions" onPress={onDismiss} style={styles.dismissBackdrop} /> : null}
    <Animated.View pointerEvents={aiOpen ? 'auto' : 'none'} style={[styles.composer, { bottom: bottom + 70, opacity: composerOpacity, transform: [{ translateY: composerTranslate }, { scale: composerScale }] }]}>
      <TextInput accessibilityLabel="Ask TripUp AI" value={aiValue} onChangeText={onAiChange} placeholder="Ask AI about this trip…" placeholderTextColor={palette.inkSoft} returnKeyType="send" onSubmitEditing={onAiSubmit} style={styles.composerInput} />
      <Pressable accessibilityRole="button" accessibilityLabel="Send AI request" disabled={!aiValue.trim()} onPress={onAiSubmit} style={({ pressed }) => [styles.composerSend, !aiValue.trim() && styles.composerSendDisabled, pressed && styles.pressed]}><ArrowUp size={18} color={palette.white} strokeWidth={2} /></Pressable>
    </Animated.View>
    <Animated.View pointerEvents={open ? 'auto' : 'none'} style={[styles.actionsTray, compact && styles.actionsTrayCompact, trayGlassStyle, { bottom, opacity: actionMotion, transform: [{ translateY: trayTranslate }] }]}><LinearGradient pointerEvents="none" colors={['rgba(13,49,90,.94)', 'rgba(23,111,193,.82)', 'rgba(13,49,90,.94)']} locations={[0, 0.52, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.trayGradient} /><View style={styles.actionsRow}>{actions.map((action, index) => {
      const start = Math.min(index * 0.08, 0.32);
      const progress = actionMotion.interpolate({ inputRange: [start, 1], outputRange: [0, 1], extrapolate: 'clamp' });
      const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });
      const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.84, 1] });
      const Icon = action.icon;
      return <Animated.View key={action.key} style={[styles.actionSlot, { opacity: progress, transform: [{ translateY }, { scale }] }]}><Pressable accessibilityRole="button" accessibilityLabel={action.label} onPress={action.onPress} style={({ pressed }) => [styles.actionPressable, pressed && styles.pressed]}><View style={styles.actionCircle}><Icon size={18} color={palette.white} strokeWidth={1.8} />{action.guideVisible && action.guidePulse ? <Animated.View pointerEvents="none" style={[styles.guidePulse, { opacity: action.guidePulse.interpolate({ inputRange: [0, 1], outputRange: [.75, .18] }), transform: [{ scale: action.guidePulse.interpolate({ inputRange: [0, 1], outputRange: [.84, 1.34] }) }] }]} /> : null}</View><AppText variant="supporting" color={palette.white} numberOfLines={1} style={styles.actionLabel}>{action.label}</AppText></Pressable></Animated.View>;
    })}</View></Animated.View>
  </View>;
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', zIndex: 90, top: 0, right: 0, bottom: 0, left: 0 },
  dismissBackdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'transparent' },
  actionsTray: { position: 'absolute', left: 10, right: 10, height: 72, borderRadius: 36, borderWidth: 1, borderColor: 'rgba(255,255,255,.28)', backgroundColor: 'rgba(13,49,90,.86)', overflow: 'hidden', ...shadow.card },
  actionsTrayCompact: { left: '50%', right: 'auto', width: 88, marginLeft: -44 },
  trayGradient: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  actionsRow: { flex: 1, paddingHorizontal: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 },
  actionSlot: { flex: 1, maxWidth: 72, alignItems: 'center' },
  actionPressable: { width: '100%', minHeight: 62, alignItems: 'center', justifyContent: 'center', gap: 2 },
  actionCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,.08)', alignItems: 'center', justifyContent: 'center' },
  guidePulse: { position: 'absolute', width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,105,212,.84)', shadowColor: '#FFB5E9', shadowOpacity: .5, shadowRadius: 7 },
  actionLabel: { width: '100%', fontSize: 9, lineHeight: 12, textAlign: 'center' },
  composer: { position: 'absolute', left: 18, right: 18, height: 50, paddingLeft: 15, paddingRight: 4, borderRadius: 25, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, flexDirection: 'row', alignItems: 'center', ...shadow.card },
  composerInput: { flex: 1, height: 46, color: palette.ink, paddingVertical: 0, ...typography.body },
  composerSend: { width: 42, height: 42, borderRadius: 21, backgroundColor: palette.navy, alignItems: 'center', justifyContent: 'center' },
  composerSendDisabled: { opacity: 0.36 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.96 }] },
});
