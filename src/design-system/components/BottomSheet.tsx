import { X } from 'lucide-react-native';
import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Easing, PanResponder, Platform, Pressable, StyleSheet, View } from 'react-native';
import { palette, radius, space } from '../theme/tokens';
import { AppText } from './AppText';

type BottomSheetProps = {
  visible: boolean;
  title?: string;
  subtitle?: string;
  headerAction?: ReactNode;
  children: ReactNode;
  onClose: () => void;
  topInset?: number;
  bottomInset?: number;
  sheetHeight?: number;
  showClose?: boolean;
};

export function BottomSheet({ visible, title, subtitle, headerAction, children, onClose, topInset = 44, bottomInset = 0, sheetHeight, showClose = false }: BottomSheetProps) {
  const [translateY] = useState(() => new Animated.Value(72));
  const [backdropOpacity] = useState(() => new Animated.Value(0));
  const [reduceMotion, setReduceMotion] = useState(false);

  const requestClose = () => {
    if (reduceMotion) {
      onClose();
      return;
    }
    Animated.parallel([
      Animated.timing(translateY, { toValue: 720, duration: 190, easing: Easing.in(Easing.quad), useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(backdropOpacity, { toValue: 0, duration: 130, easing: Easing.linear, useNativeDriver: Platform.OS !== 'web' }),
    ]).start(({ finished }) => { if (finished) onClose(); });
  };

  const settleOpen = () => Animated.parallel([
    Animated.timing(translateY, { toValue: 0, duration: reduceMotion ? 0 : 190, easing: Easing.bezier(0.22, 1, 0.36, 1), useNativeDriver: Platform.OS !== 'web' }),
    Animated.timing(backdropOpacity, { toValue: 1, duration: reduceMotion ? 0 : 160, easing: Easing.out(Easing.quad), useNativeDriver: Platform.OS !== 'web' }),
  ]).start();

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx) * 1.15,
    onMoveShouldSetPanResponderCapture: (_, gesture) => gesture.dy > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx) * 1.15,
    onPanResponderMove: (_, gesture) => {
      const distance = Math.max(0, gesture.dy);
      translateY.setValue(distance);
      backdropOpacity.setValue(Math.max(0, 1 - distance / 320));
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dy > 72 || gesture.vy > 0.75) {
        requestClose();
        return;
      }
      settleOpen();
    },
    onPanResponderTerminate: settleOpen,
  });

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!visible) return;
    translateY.setValue(reduceMotion ? 0 : 72);
    backdropOpacity.setValue(reduceMotion ? 1 : 0);
    if (reduceMotion) return;
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, stiffness: 260, damping: 28, mass: 0.9, overshootClamping: true, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(backdropOpacity, { toValue: 1, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, [backdropOpacity, reduceMotion, translateY, visible]);

  if (!visible) return null;

  return <View style={[styles.layer, { bottom: bottomInset }]} pointerEvents="box-none">
    <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Close bottom sheet" onPress={requestClose} style={StyleSheet.absoluteFill} />
    </Animated.View>
    <Animated.View {...panResponder.panHandlers} style={[styles.sheet, sheetHeight ? { height: sheetHeight } : [styles.sheetFull, { marginTop: topInset }], { transform: [{ translateY }] }]}>
      <View accessibilityRole="adjustable" accessibilityLabel="Drag down to close" style={styles.dragZone}><View style={styles.handle} /></View>
      {title || showClose || headerAction ? <View style={styles.header}>
        <View style={styles.heading}>
          {title ? <AppText variant="h4">{title}</AppText> : null}
          {subtitle ? <AppText variant="supporting" color={palette.inkSoft}>{subtitle}</AppText> : null}
        </View>
        {headerAction}
        {showClose ? <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={requestClose} style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
          <X size={22} color={palette.ink} strokeWidth={1.8} />
        </Pressable> : null}
      </View> : null}
      {children}
    </Animated.View>
  </View>;
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', top: 0, right: 0, left: 0, zIndex: 50, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(16,47,85,.32)' },
  sheet: { overflow: 'hidden', borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, backgroundColor: palette.surface },
  sheetFull: { flex: 1 },
  dragZone: { height: 28, alignItems: 'center', justifyContent: 'center' },
  handle: { width: 42, height: 4, borderRadius: radius.pill, backgroundColor: palette.sheetHandle },
  header: { minHeight: 72, paddingHorizontal: space.lg, flexDirection: 'row', alignItems: 'center', gap: space.md },
  heading: { flex: 1, gap: 2 },
  close: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.canvas, borderWidth: 1, borderColor: palette.line },
  pressed: { opacity: .72, transform: [{ scale: .96 }] },
});
