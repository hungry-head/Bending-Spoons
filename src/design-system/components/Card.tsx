import { View, type ViewProps } from 'react-native';
import { palette, radius, shadow, space } from '../theme/tokens';

export function Card({ style, ...props }: ViewProps) {
  return <View {...props} style={[{ backgroundColor: palette.surface, borderRadius: radius.lg, padding: space.md, borderWidth: 1, borderColor: palette.line }, shadow.card, style]} />;
}
