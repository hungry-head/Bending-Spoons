# TripUp mobile

Mobile-first AI travel planner scaffold built with Expo SDK 58, React Native, TypeScript, and Expo Router.

## Run

```bash
npm install
npm run ios
```

Use `npm run android` for Android or `npm start` to open the Expo development menu.

## Included

- Native iOS/Android routing with four primary tabs
- Home/today experience with upcoming itinerary and trip essentials
- AI planning conversation with prompt starters and feedback states
- Trip collection and day-by-day trip detail workspace
- App-local token and component system
- Haptic interaction feedback and native screen transitions
- Typed routes, safe areas, and mobile touch targets

See `DESIGN.md` for the visual language, interaction principles, and component contract.

## Architecture

```text
src/
├── app/                 # Expo Router screens and layouts
├── data/                # Fixtures; later repositories/API adapters
├── design-system/       # Tokens and reusable native primitives
└── features/            # Future domain logic grouped by capability
```

The scaffold deliberately avoids speculative auth, backend, and state-management choices. Add them against the first real data contract and collaboration model.
