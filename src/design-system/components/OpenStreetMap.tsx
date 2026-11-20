import { Image } from 'expo-image';
import { MapPin } from 'lucide-react-native';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { palette, radius } from '../theme/tokens';

const mapAreas = {
  lisbon: {
    label: 'Lisbon, Portugal, centered on the Alfama neighborhood',
    tiles: [
      [3887, 3138], [3888, 3138], [3889, 3138],
      [3887, 3139], [3888, 3139], [3889, 3139],
      [3887, 3140], [3888, 3140], [3889, 3140],
    ],
  },
  barcelona: {
    label: 'Barcelona, Spain',
    tiles: [
      [4144, 3061], [4145, 3061], [4146, 3061],
      [4144, 3062], [4145, 3062], [4146, 3062],
      [4144, 3063], [4145, 3063], [4146, 3063],
    ],
  },
} as const;

export function OpenStreetMap({ height = 150, borderRadius = radius.md, area = 'lisbon' }: { height?: number; borderRadius?: number; area?: keyof typeof mapAreas }) {
  const mapArea = mapAreas[area];
  return (
    <View style={[styles.map, { height, borderRadius }]} accessibilityLabel={`OpenStreetMap centered on ${mapArea.label}`}>
      <View style={styles.tileGrid}>
        {mapArea.tiles.map(([x, y]) => (
          <Image
            key={`${x}-${y}`}
            source={`https://tile.openstreetmap.org/13/${x}/${y}.png`}
            style={styles.tile}
            contentFit="cover"
            transition={120}
          />
        ))}
      </View>
      {[
        { left: '25%', top: '24%' },
        { left: '48%', top: '52%' },
        { left: '70%', top: '29%' },
      ].map((position, index) => (
        <View key={index} style={[styles.pin, position]}>
          <MapPin size={17} color={palette.white} fill={palette.coral} />
          <View style={styles.pinNumber}><AppText variant="caption" color={palette.white}>{index + 1}</AppText></View>
        </View>
      ))}
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="OpenStreetMap copyright and attribution"
        onPress={() => Linking.openURL('https://www.openstreetmap.org/copyright')}
        style={styles.attribution}>
        <AppText variant="caption" color={palette.inkSoft}>© OpenStreetMap contributors</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { overflow: 'hidden', borderRadius: radius.md, backgroundColor: '#DDE7EB' },
  tileGrid: { position: 'absolute', width: 432, height: 432, left: '50%', top: '50%', marginLeft: -216, marginTop: -216, flexDirection: 'row', flexWrap: 'wrap' },
  tile: { width: 144, height: 144 },
  pin: { position: 'absolute', width: 28, height: 34, alignItems: 'center' },
  pinNumber: { position: 'absolute', top: 3, width: 17, height: 17, alignItems: 'center', justifyContent: 'center' },
  attribution: { position: 'absolute', right: 4, bottom: 4, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, backgroundColor: 'rgba(255,255,255,.9)' },
});
