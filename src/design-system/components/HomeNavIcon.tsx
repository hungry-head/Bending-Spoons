import { House } from 'lucide-react-native';
import type { ColorValue } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type HomeNavIconProps = {
  active?: boolean;
  color: ColorValue;
  size?: number;
  strokeWidth?: number;
};

export function HomeNavIcon({ active = false, color, size = 22, strokeWidth = 1.65 }: HomeNavIconProps) {
  if (!active) return <House size={size} color={color} strokeWidth={strokeWidth} />;

  return <Svg accessibilityRole="image" aria-label="Home" width={size} height={size} viewBox="0 0 24 24">
    <Path d="M3.5 10.6 12 3.5l8.5 7.1V20a1.5 1.5 0 0 1-1.5 1.5h-5.1v-6.2h-3.8v6.2H5A1.5 1.5 0 0 1 3.5 20v-9.4Z" fill={color} />
  </Svg>;
}
