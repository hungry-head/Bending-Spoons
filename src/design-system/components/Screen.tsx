import { Platform, ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette, space } from '../theme/tokens';

export function Screen({ children, scroll = true, contentContainerStyle, ...props }: ScrollViewProps & { scroll?: boolean }) {
  if (!scroll) return <SafeAreaView style={styles.safe} edges={['top']}><View style={styles.static}>{children}</View></SafeAreaView>;
  return <SafeAreaView style={styles.safe} edges={['top']}><ScrollView {...props} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, contentContainerStyle]}>{children}</ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.canvas,
    // The browser preview has a simulated camera island rather than a native
    // safe-area inset. Native iOS continues to use SafeAreaView's real inset.
    paddingTop: Platform.OS === 'web' ? 44 : 0,
  },
  static: { flex: 1 },
  content: { paddingHorizontal: space.md, paddingTop: space.sm, paddingBottom: 96 },
});
