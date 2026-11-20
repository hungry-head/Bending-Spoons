import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowDown, ArrowDownLeft, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, BadgeEuro, BedDouble, Bookmark, BriefcaseBusiness, CalendarPlus, CarFront, ChartColumnIncreasing, Check, ChevronDown, ChevronRight, Clock3, Compass, ContactRound, Ellipsis, EllipsisVertical, FileDown, FileText, Folder, Footprints, GripVertical, House, ImagePlus, LockKeyhole, Map, MapPinPlus, Menu, MessageSquare, Minus, Music2, NotebookPen, Pencil, Plus, QrCode, ReceiptText, ScanLine, Search, Share2, ShoppingBag, Sparkles, Star, Ticket, Trash2, Umbrella, UserPlus, UserRound, Utensils, WalletCards, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, Platform, Pressable, ScrollView, Share, StyleSheet, TextInput, View, useWindowDimensions, type ImageSourcePropType, type NativeScrollEvent, type NativeSyntheticEvent, type ViewStyle } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { AppText, BottomSheet, Button, Chip, ContextActionBar, HomeNavIcon, OpenStreetMap, Pill, type ContextAction } from '@/design-system/components';
import { buttonTokens, palette, typography } from '@/design-system/theme/tokens';

const days = ['Wed 11', 'Today', 'Fri 13', 'Sat 14', 'Sun 15', 'Mon 16', 'Tue 17', 'Wed 18', 'Thu 19', 'Fri 20', 'Sat 21', 'Final day'] as const;
type Day = (typeof days)[number];
const tripTabs = ['Overview', 'Plan', 'Saved', 'Expenses', 'Guides', 'Journal'] as const;
type TripTab = (typeof tripTabs)[number];
type OptionalTripTab = 'Saved' | 'Guides' | 'Journal';
type CollaborativeGuideStep = 'idle' | 'plan' | 'actions' | 'activity' | 'poll-card' | 'poll-setup' | 'add-activity' | 'cast-vote' | 'submit-vote' | 'open-results' | 'close-poll' | 'closed-results' | 'view-activity';

const toolGlassStyle = Platform.OS === 'web'
  ? ({ backdropFilter: 'blur(14px) saturate(120%)' } as ViewStyle & { backdropFilter: string })
  : undefined;

const tripMembers = [
  { name: 'Gops', initials: 'GO', joined: 'Trip leader', image: require('../../../assets/images/member-gops.jpg'), color: palette.violetSoft },
  { name: 'Kat', initials: 'KA', joined: 'Joined 12/11', image: require('../../../assets/images/member-kat.jpg'), color: palette.navySoft },
  { name: 'Gum', initials: 'GU', joined: 'Joined 12/11', image: require('../../../assets/images/member-gum.jpg'), color: palette.sunSoft },
  { name: 'Papi', initials: 'PA', joined: 'Joined 13/11', image: require('../../../assets/images/member-papi.jpg'), color: palette.mossSoft },
  { name: 'Ari', initials: 'AR', joined: 'Trip owner', image: require('../../../assets/images/member-ari.jpg'), color: palette.coralSoft },
] as const;

const savedPlaces = [
  { id: 'ramiro', name: 'Cervejaria Ramiro', cuisine: 'Seafood', price: '€€€', rating: '4.9', drive: '20m', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=700&q=82' },
  { id: 'prado', name: 'Prado', cuisine: 'Portuguese', price: '€€', rating: '4.9', drive: '20m', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=700&q=82' },
  { id: 'oficio', name: 'Ofício', cuisine: 'Portuguese', price: '€€', rating: '4.8', drive: '18m', image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=700&q=82' },
  { id: 'alma', name: 'Alma', cuisine: 'Modern Portuguese', price: '€€€', rating: '4.9', drive: '12m', image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=700&q=82' },
  { id: 'taberna', name: 'Taberna da Rua', cuisine: 'Petiscos', price: '€€', rating: '4.7', drive: '16m', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=700&q=82' },
] as const;
type SavedPlace = (typeof savedPlaces)[number];
type SavedCardItem = { id: string; name: string; cuisine: string; price: string; rating: string; drive: string; image: string };
const savedAttractions: readonly SavedCardItem[] = [
  { id: 'jeronimos', name: 'Jerónimos Monastery', cuisine: 'Culture', price: '€18', rating: '4.8', drive: '18m', image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=700&q=82' },
  { id: 'belem-tower', name: 'Belém Tower', cuisine: 'Landmark', price: '€15', rating: '4.7', drive: '20m', image: 'https://images.unsplash.com/photo-1525207934214-58e69a8f8a93?auto=format&fit=crop&w=700&q=82' },
  { id: 'gulbenkian', name: 'Gulbenkian Museum', cuisine: 'Museum', price: '€14', rating: '4.8', drive: '16m', image: 'https://images.unsplash.com/photo-1564399579883-451a5d44ec08?auto=format&fit=crop&w=700&q=82' },
  { id: 'st-george', name: 'São Jorge Castle', cuisine: 'Landmark', price: '€17', rating: '4.7', drive: '14m', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=700&q=82' },
  { id: 'miradouro', name: 'Miradouro da Senhora', cuisine: 'Outdoors', price: 'Free', rating: '4.9', drive: '12m', image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd4297?auto=format&fit=crop&w=700&q=82' },
] as const;
const savedPlaceImage = (id: SavedPlace['id']) => savedPlaces.find((place) => place.id === id)?.image ?? savedPlaces[0].image;
const scannedReceiptImage = require('../../../assets/images/scanned-lisbon-receipt.png');
const scannedReceiptItems = [
  { name: 'Couvert', amount: '2.00', quantity: 1 },
  { name: 'Risotto cogumelos', amount: '12.00', quantity: 1 },
  { name: 'Brocheta porco preto', amount: '13.50', quantity: 1 },
  { name: 'Copo vinho', amount: '8.00', quantity: 2 },
  { name: 'Água Ouro', amount: '2.00', quantity: 1 },
  { name: 'Bolo de caco', amount: '3.00', quantity: 1 },
  { name: 'Brownie', amount: '3.00', quantity: 1 },
  { name: 'Cappuccino', amount: '6.00', quantity: 2 },
] as const;

const activityImages: Record<string, string> = {
  'Praça do Comércio': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=500&q=82',
  'Rua Augusta': 'https://images.unsplash.com/photo-1525207934214-58e69a8f8a93?auto=format&fit=crop&w=500&q=82',
  'Time Out Market': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=500&q=82',
  'Oceanário de Lisboa': 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=500&q=82',
  'Parque das Nações': 'https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=500&q=82',
};
const activityImageFor = (title: string, tag: string) => activityImages[title]
  ?? (tag === 'Food & Drink'
    ? 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=500&q=82'
    : 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=500&q=82');

const dayPlans: Record<Day, { weather: string; activities: { title: string; detail: string; price: string; tag: string; walk: string }[] }> = {
  'Wed 11': {
    weather: '21° · Clear skies, light river breeze',
    activities: [
      { title: 'Santa Apolónia Station', detail: 'Morning · Arrive and drop off luggage', price: '€8', tag: 'Transport', walk: '7 min walk · 500 m' },
      { title: 'Alfama', detail: 'Afternoon · Hillside lanes and tiled houses', price: '', tag: 'Attractions', walk: '6 min walk · 400 m' },
      { title: 'Mesa de Frades', detail: 'Evening · Welcome dinner and fado', price: '€46', tag: 'Food & Drink', walk: '9 min walk · 650 m' },
    ],
  },
  Today: {
    weather: '22° · Light showers, bring an umbrella',
    activities: [
      { title: 'Praça do Comércio', detail: 'Morning · Riverside square and arcades', price: '', tag: 'Attractions', walk: '5 min walk · 350 m' },
      { title: 'Rua Augusta', detail: 'Late morning · Historic pedestrian street', price: '€4', tag: 'Attractions', walk: '6 min walk · 450 m' },
      { title: 'Time Out Market', detail: 'Midday · Lisbon food hall and market', price: '€28', tag: 'Food & Drink', walk: '10 min walk · 750 m' },
    ],
  },
  'Fri 13': {
    weather: '20° · Cloudy morning, clearing after lunch',
    activities: [
      { title: 'Jerónimos Monastery', detail: 'Morning · Cloisters and maritime history', price: '€18', tag: 'Culture', walk: '5 min walk · 350 m' },
      { title: 'Pastéis de Belém', detail: 'Midday · Original custard tarts', price: '€9', tag: 'Food & Drink', walk: '4 min walk · 280 m' },
      { title: 'MAAT', detail: 'Afternoon · Art, architecture and technology', price: '€11', tag: 'Culture', walk: '12 min walk · 850 m' },
    ],
  },
  'Sat 14': {
    weather: '23° · Sunny, carry water for the hills',
    activities: [
      { title: 'Castelo de São Jorge', detail: 'Morning · Castle walls and city views', price: '€15', tag: 'Attractions', walk: '13 min walk · 850 m' },
      { title: 'Feira da Ladra', detail: 'Afternoon · Alfama flea market', price: '', tag: 'Shopping', walk: '11 min walk · 750 m' },
      { title: 'Clube de Fado', detail: 'Evening · Dinner with live fado', price: '€52', tag: 'Food & Drink', walk: '8 min walk · 550 m' },
    ],
  },
  'Sun 15': {
    weather: '21° · Bright with a cool Atlantic breeze',
    activities: [
      { title: 'LX Factory', detail: 'Morning · Studios, shops and brunch', price: '€18', tag: 'Shopping', walk: '8 min walk · 600 m' },
      { title: 'Basílica da Estrela', detail: 'Afternoon · Baroque church and gardens', price: '', tag: 'Culture', walk: '10 min walk · 700 m' },
      { title: 'Senhora do Monte', detail: 'Evening · Sunset over Lisbon rooftops', price: '', tag: 'Outdoors', walk: '14 min walk · 1 km' },
    ],
  },
  'Mon 16': { weather: '22° · Calm and bright', activities: [{ title: 'Museu Nacional do Azulejo', detail: 'Morning · Portuguese tile collection', price: '€8', tag: 'Culture', walk: '9 min walk · 650 m' }, { title: 'Graça', detail: 'Afternoon · Miradouros and cafés', price: '', tag: 'Outdoors', walk: '12 min walk · 850 m' }] },
  'Tue 17': { weather: '20° · Light cloud', activities: [{ title: 'Sintra day trip', detail: 'Morning · Palaces and forested hills', price: '€38', tag: 'Attractions', walk: '8 min walk · 550 m' }, { title: 'Rossio', detail: 'Evening · Return to central Lisbon', price: '', tag: 'Attractions', walk: '6 min walk · 400 m' }] },
  'Wed 18': { weather: '21° · Clear afternoon', activities: [{ title: 'Calouste Gulbenkian Museum', detail: 'Morning · Art and gardens', price: '€14', tag: 'Culture', walk: '7 min walk · 500 m' }, { title: 'Príncipe Real', detail: 'Afternoon · Shops and shaded squares', price: '', tag: 'Shopping', walk: '11 min walk · 750 m' }] },
  'Thu 19': { weather: '19° · Occasional showers', activities: [{ title: 'Carmo Convent', detail: 'Morning · Gothic ruins and archaeology', price: '€7', tag: 'Culture', walk: '5 min walk · 350 m' }, { title: 'Chiado', detail: 'Afternoon · Bookshops and historic cafés', price: '€12', tag: 'Shopping', walk: '4 min walk · 280 m' }] },
  'Fri 20': { weather: '22° · Sunny spells', activities: [{ title: 'Costa da Caparica', detail: 'Morning · Atlantic beach escape', price: '€18', tag: 'Outdoors', walk: '10 min walk · 700 m' }, { title: 'Cais do Sodré', detail: 'Evening · Riverside dinner', price: '€42', tag: 'Food & Drink', walk: '8 min walk · 550 m' }] },
  'Sat 21': { weather: '23° · Warm and clear', activities: [{ title: 'Campo de Ourique Market', detail: 'Morning · Local produce and brunch', price: '€24', tag: 'Food & Drink', walk: '6 min walk · 420 m' }, { title: 'Estrela Garden', detail: 'Afternoon · Palms and quiet lawns', price: '', tag: 'Free', walk: '5 min walk · 350 m' }] },
  'Final day': { weather: '21° · Clear with a river breeze', activities: [{ title: 'Oceanário de Lisboa', detail: 'Morning · Final aquarium visit', price: '€25', tag: 'Attractions', walk: '7 min walk · 500 m' }, { title: 'Lunch at Prado', detail: 'Lunch · Seasonal Portuguese plates', price: '€34', tag: 'Food & Drink', walk: '8 min walk · 600 m' }, { title: 'Parque das Nações', detail: 'Afternoon · Riverside farewell walk', price: '', tag: 'Free', walk: '5 min walk · 350 m' }] },
};

const renImage: ImageSourcePropType = { uri: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=320&q=82' };

const tripExpenses = [
  { id: 'taxi-station', title: 'Taxi to Tram Station', amount: '€24', numericAmount: 24, member: 'Kat', date: '11 Nov', day: '11/11', category: 'Transport' },
  { id: 'dinner-prado', title: 'Dinner at Prado', amount: '€186', numericAmount: 186, member: 'Gum', date: '11 Nov', day: '11/11', category: 'Food & Drink' },
  { id: 'jeronimos-tickets', title: 'Jerónimos Monastery tickets', amount: '€72', numericAmount: 72, member: 'Papi', date: '12 Nov', day: '12/11', category: 'Tickets' },
  { id: 'hotel-mundial', title: 'Hotel Mundial', amount: '€540', numericAmount: 540, member: 'Ari', date: '12 Nov', day: '12/11', category: 'Stay' },
  { id: 'tram-passes', title: 'Tram 28 day passes', amount: '€38', numericAmount: 38, member: 'Gops', date: '13 Nov', day: '13/11', category: 'Transport' },
  { id: 'lunch-timeout', title: 'Lunch at Time Out Market', amount: '€62.78', numericAmount: 62.78, member: 'Kat', date: '13 Nov', day: '13/11', category: 'Food & Drink' },
  { id: 'sintra-train', title: 'Sintra return train', amount: '€49', numericAmount: 49, member: 'Gum', date: '14 Nov', day: '14/11', category: 'Transport' },
  { id: 'maat-entry', title: 'MAAT entry', amount: '€44', numericAmount: 44, member: 'Papi', date: '15 Nov', day: '15/11', category: 'Tickets' },
  { id: 'alfama-dinner', title: 'Alfama dinner', amount: '€141', numericAmount: 141, member: 'Ari', date: '16 Nov', day: '16/11', category: 'Food & Drink' },
  { id: 'hotel-tax', title: 'Hotel city tax', amount: '€100', numericAmount: 100, member: 'Gops', date: '16 Nov', day: '16/11', category: 'Stay' },
] as const;

export default function TripDetailScreen() {
  const { openActions, quickAction } = useLocalSearchParams<{ openActions?: string; quickAction?: string }>();
  const initialTab: TripTab = quickAction === 'expense' || quickAction === 'scan' ? 'Expenses' : quickAction === 'photo' || quickAction === 'memory' ? 'Journal' : quickAction === 'activity' || quickAction === 'day' ? 'Plan' : 'Overview';
  const [selectedDay, setSelectedDay] = useState<Day>('Final day');
  const daysScrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const [visitedActivities, setVisitedActivities] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TripTab>(initialTab);
  const [tabOrder, setTabOrder] = useState<TripTab[]>([...tripTabs]);
  const [enabledOptionalTabs, setEnabledOptionalTabs] = useState<OptionalTripTab[]>(quickAction === 'photo' || quickAction === 'memory' ? ['Saved', 'Guides', 'Journal'] : ['Saved', 'Guides']);
  const [tabsMenuOpen, setTabsMenuOpen] = useState(false);
  const [tabBarWidth, setTabBarWidth] = useState(0);
  const [tabProgress] = useState(() => new Animated.Value(0));
  const [tabContentMotion] = useState(() => new Animated.Value(1));
  const [actionsOpen, setActionsOpen] = useState(openActions === '1');
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [quickAiOpen, setQuickAiOpen] = useState(false);
  const [quickAiValue, setQuickAiValue] = useState('');
  const [addExpenseOpen, setAddExpenseOpen] = useState(quickAction === 'expense' || quickAction === 'scan');
  const [expenseStartScanned, setExpenseStartScanned] = useState(quickAction === 'scan');
  const [expenseActivityName, setExpenseActivityName] = useState<string | null>(null);
  const [spendingAnalysisOpen, setSpendingAnalysisOpen] = useState(false);
  const [allExpensesOpen, setAllExpensesOpen] = useState(false);
  const [addActivityOpen, setAddActivityOpen] = useState(quickAction === 'activity');
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [activityMemberOpen, setActivityMemberOpen] = useState(false);
  const [activityMemberSource, setActivityMemberSource] = useState<'editor' | 'itinerary'>('editor');
  const [activityMembers, setActivityMembers] = useState(['Kat', 'Gum', 'Papi', 'Ren', 'Gops']);
  const [pollWinnerAdded, setPollWinnerAdded] = useState(false);
  const [pollActivityAdded, setPollActivityAdded] = useState(false);
  const [pollVotesIn, setPollVotesIn] = useState(false);
  const [pollVoteChoice, setPollVoteChoice] = useState<string | null>(null);
  const [pollResultsOpen, setPollResultsOpen] = useState(false);
  const [pollClosed, setPollClosed] = useState(false);
  const [collaborativeGuideStep, setCollaborativeGuideStep] = useState<CollaborativeGuideStep>('idle');
  const [expenseGuideStep, setExpenseGuideStep] = useState<'idle' | 'tab' | 'add' | 'scan' | 'line-items' | 'edit-participants'>('idle');
  const [collaborativePulse] = useState(() => new Animated.Value(0));
  const [membersOpen, setMembersOpen] = useState(false);
  const [settleUpOpen, setSettleUpOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [guidedAddMember, setGuidedAddMember] = useState(false);
  const [guidedMemberAvatarTarget, setGuidedMemberAvatarTarget] = useState(false);
  const [focusRenInMembers, setFocusRenInMembers] = useState(false);
  const [renInvited, setRenInvited] = useState(false);
  const [renArrival] = useState(() => new Animated.Value(0));
  const renInviteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const renGuideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(quickAction === 'day' ? 'Add day selected' : quickAction === 'photo' ? 'Add photo selected' : quickAction === 'memory' ? 'Write a memory selected' : null);
  const [toastMotion] = useState(() => new Animated.Value(0));
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [savedPulse] = useState(() => new Animated.Value(0));
  const [toolCollapse] = useState(() => new Animated.Value(0));
  const [scrollY] = useState(() => new Animated.Value(0));
  const tripScrollRef = useRef<ComponentRef<typeof Animated.ScrollView>>(null);
  const plan = dayPlans[selectedDay];
  const visibleTabs = useMemo(() => tabOrder.filter((tab) => tab === 'Overview' || tab === 'Plan' || tab === 'Expenses' || enabledOptionalTabs.includes(tab as OptionalTripTab)), [enabledOptionalTabs, tabOrder]);
  const showPollWinner = pollWinnerAdded && selectedDay === 'Final day';
  const showLivePoll = pollActivityAdded && !pollWinnerAdded && selectedDay === 'Final day';
  const topHeaderHeight = Platform.OS === 'web' ? 98 : 78;
  const compactHeaderHeight = scrollY.interpolate({ inputRange: [310, 410], outputRange: [0, topHeaderHeight], extrapolate: 'clamp' });
  const floatingHeaderBackground = scrollY.interpolate({ inputRange: [140, 270], outputRange: ['rgba(252,253,254,0)', 'rgba(252,253,254,1)'], extrapolate: 'clamp' });
  const floatingHeaderShadow = scrollY.interpolate({ inputRange: [170, 270], outputRange: [0, 0.08], extrapolate: 'clamp' });
  const floatingTripCopyWidth = scrollY.interpolate({ inputRange: [140, 270], outputRange: [0, 90], extrapolate: 'clamp' });
  const floatingTripCopyOpacity = scrollY.interpolate({ inputRange: [170, 250], outputRange: [0, 1], extrapolate: 'clamp' });
  const floatingShareWidth = scrollY.interpolate({ inputRange: [140, 270], outputRange: [36, 0], extrapolate: 'clamp' });
  const floatingShareOpacity = scrollY.interpolate({ inputRange: [140, 225], outputRange: [1, 0], extrapolate: 'clamp' });
  const savedScale = savedPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });
  const savedShift = savedPulse.interpolate({ inputRange: [0, 1], outputRange: [0, -3] });

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('tripup:add-member-visibility', { detail: { visible: addMemberOpen } }));
    return () => { window.dispatchEvent(new CustomEvent('tripup:add-member-visibility', { detail: { visible: false } })); };
  }, [addMemberOpen]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('tripup:manage-group-visibility', { detail: { visible: membersOpen } }));
    return () => { window.dispatchEvent(new CustomEvent('tripup:manage-group-visibility', { detail: { visible: false } })); };
  }, [membersOpen]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const openTripMemberQuest = () => { setGuidedAddMember(true); setAddMemberOpen(true); };
    const openActivityMemberQuest = () => { setActiveTab('Plan'); setSelectedDay('Final day'); setSelectedActivity('Lunch at Prado'); };
    const startCollaborativeGuide = () => {
      setActiveTab('Overview');
      setSelectedDay('Final day');
      setQuickActionsOpen(false);
      setAddActivityOpen(false);
      setPollActivityAdded(false);
      setPollVotesIn(false);
      setPollWinnerAdded(false);
      setPollResultsOpen(false);
      setPollClosed(false);
      setCollaborativeGuideStep('plan');
    };
    const startExpenseTrackingGuide = () => {
      setExpenseGuideStep('tab');
      setQuickActionsOpen(false);
      setPollResultsOpen(false);
      tripScrollRef.current?.scrollTo({ y: 0, animated: true });
    };
    window.addEventListener('tripup:open-trip-member-quest', openTripMemberQuest);
    window.addEventListener('tripup:open-activity-member-quest', openActivityMemberQuest);
    window.addEventListener('tripup:start-collaborative-guide', startCollaborativeGuide);
    window.addEventListener('tripup:start-expense-tracking-guide', startExpenseTrackingGuide);
    return () => {
      window.removeEventListener('tripup:open-trip-member-quest', openTripMemberQuest);
      window.removeEventListener('tripup:open-activity-member-quest', openActivityMemberQuest);
      window.removeEventListener('tripup:start-collaborative-guide', startCollaborativeGuide);
      window.removeEventListener('tripup:start-expense-tracking-guide', startExpenseTrackingGuide);
    };
  }, []);

  useEffect(() => {
    let animation: ReturnType<typeof Animated.loop> | undefined;
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (reduceMotion) {
        collaborativePulse.setValue(1);
        return;
      }
      animation = Animated.loop(Animated.sequence([
        Animated.timing(collaborativePulse, { toValue: 1, duration: 720, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(collaborativePulse, { toValue: 0, duration: 720, useNativeDriver: Platform.OS !== 'web' }),
      ]));
      animation.start();
    });
    return () => animation?.stop();
  }, [collaborativePulse]);

  const saveSelectedActivity = () => {
    setSelectedActivity(null);
    setSavedCount((count) => count + 1);
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (reduceMotion) return;
      savedPulse.setValue(0);
      Animated.sequence([
        Animated.timing(savedPulse, { toValue: 1, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(savedPulse, { toValue: 0, duration: 260, easing: Easing.bezier(0.22, 1, 0.36, 1), useNativeDriver: Platform.OS !== 'web' }),
      ]).start();
    });
  };

  const toggleVisited = (activityKey: string) => setVisitedActivities((current) => current.includes(activityKey) ? current.filter((key) => key !== activityKey) : [...current, activityKey]);

  const closeQuickActions = () => {
    setQuickActionsOpen(false);
    setQuickAiOpen(false);
  };
  const aiQuickAction: ContextAction = { key: 'ai', label: 'Ask AI', icon: Sparkles, onPress: () => setQuickAiOpen((open) => !open) };
  const expenseQuickAction: ContextAction = { key: 'expense', label: 'Expense', icon: ReceiptText, onPress: () => { closeQuickActions(); setExpenseStartScanned(false); setAddExpenseOpen(true); } };
  const scanQuickAction: ContextAction = { key: 'scan', label: 'Scan receipt', icon: ScanLine, onPress: () => { closeQuickActions(); setExpenseStartScanned(true); setAddExpenseOpen(true); } };
  const quickActions: ContextAction[] = activeTab === 'Expenses' ? [aiQuickAction, expenseQuickAction, scanQuickAction] : [aiQuickAction, { key: 'activity', label: 'Activity', icon: MapPinPlus, guideVisible: collaborativeGuideStep === 'activity', guidePulse: collaborativePulse, onPress: () => { closeQuickActions(); setAddActivityOpen(true); if (collaborativeGuideStep === 'activity') setCollaborativeGuideStep('poll-card'); } }, { key: 'day', label: 'Add day', icon: CalendarPlus, onPress: () => { closeQuickActions(); setToastMessage('Add day selected'); } }, expenseQuickAction, scanQuickAction];

  useEffect(() => {
    let active = true;
    let collapseTimer: ReturnType<typeof setTimeout> | undefined;
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!active) return;
      collapseTimer = setTimeout(() => {
        if (reduceMotion) {
          toolCollapse.setValue(1);
          return;
        }
        Animated.timing(toolCollapse, { toValue: 1, duration: 480, easing: Easing.bezier(0.22, 1, 0.36, 1), useNativeDriver: false }).start();
      }, 1150);
    });
    return () => {
      active = false;
      if (collapseTimer) clearTimeout(collapseTimer);
    };
  }, [toolCollapse]);

  useEffect(() => {
    if (!toastMessage) return;
    let mounted = true;
    let exitTimer: ReturnType<typeof setTimeout> | undefined;
    let exitAnimation: Animated.CompositeAnimation | undefined;
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!mounted) return;
      toastMotion.stopAnimation();
      toastMotion.setValue(reduceMotion ? 1 : 0);
      if (!reduceMotion) Animated.spring(toastMotion, { toValue: 1, damping: 16, stiffness: 230, mass: .72, useNativeDriver: Platform.OS !== 'web' }).start();
      exitTimer = setTimeout(() => {
        if (reduceMotion) {
          setToastMessage(null);
          return;
        }
        exitAnimation = Animated.timing(toastMotion, { toValue: 0, duration: 220, easing: Easing.in(Easing.quad), useNativeDriver: Platform.OS !== 'web' });
        exitAnimation.start(({ finished }) => { if (finished) setToastMessage(null); });
      }, 2300);
    });
    return () => {
      mounted = false;
      if (exitTimer) clearTimeout(exitTimer);
      exitAnimation?.stop();
    };
  }, [toastMessage, toastMotion]);

  useEffect(() => () => {
    if (renInviteTimerRef.current) clearTimeout(renInviteTimerRef.current);
    if (renGuideTimerRef.current) clearTimeout(renGuideTimerRef.current);
  }, []);

  const inviteTripMember = (name: string) => {
    const invitedFromGuide = guidedAddMember;
    setAddMemberOpen(false);
    setGuidedAddMember(false);
    setToastMessage(`${name} has been invited into the trip.`);
    if (name.toLowerCase() !== 'ren') return;
    if (renInviteTimerRef.current) clearTimeout(renInviteTimerRef.current);
    renInviteTimerRef.current = setTimeout(() => {
      setRenInvited(true);
      AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
        if (reduceMotion) renArrival.setValue(1);
        else {
          renArrival.setValue(0);
          Animated.spring(renArrival, { toValue: 1, damping: 13, stiffness: 220, mass: .72, useNativeDriver: Platform.OS !== 'web' }).start();
        }
      });
      if (Platform.OS === 'web' && typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tripup:group-member-invited'));
      renInviteTimerRef.current = null;
    }, 1000);
    if (invitedFromGuide) {
      if (renGuideTimerRef.current) clearTimeout(renGuideTimerRef.current);
      renGuideTimerRef.current = setTimeout(() => {
        setGuidedMemberAvatarTarget(true);
        if (Platform.OS === 'web' && typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tripup:ren-avatar-ready'));
        renGuideTimerRef.current = null;
      }, 2700);
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const openGuidedTabsMenu = () => setTabsMenuOpen(true);
    const closeGuidedTabsMenu = () => setTabsMenuOpen(false);
    window.addEventListener('tripup:open-tabs-menu', openGuidedTabsMenu);
    window.addEventListener('tripup:close-tabs-menu', closeGuidedTabsMenu);
    return () => {
      window.removeEventListener('tripup:open-tabs-menu', openGuidedTabsMenu);
      window.removeEventListener('tripup:close-tabs-menu', closeGuidedTabsMenu);
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const updateQuickActionsVisibility = (event: Event) => {
      const visible = (event as CustomEvent<{ visible: boolean }>).detail.visible;
      setQuickActionsOpen(visible);
      if (!visible) setQuickAiOpen(false);
    };
    window.addEventListener('tripup:set-quick-actions', updateQuickActionsVisibility);
    return () => window.removeEventListener('tripup:set-quick-actions', updateQuickActionsVisibility);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('tripup:tabs-menu-visibility', { detail: { visible: tabsMenuOpen } }));
  }, [tabsMenuOpen]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const overlayOpen = tabsMenuOpen || actionsOpen || quickActionsOpen || quickAiOpen || addExpenseOpen || spendingAnalysisOpen || allExpensesOpen || addActivityOpen || activityMemberOpen || pollResultsOpen || membersOpen || settleUpOpen || addMemberOpen || selectedActivity !== null;
    window.dispatchEvent(new CustomEvent('tripup:screen-context', { detail: { activeTab, overlayOpen } }));
  }, [activeTab, actionsOpen, quickActionsOpen, quickAiOpen, addExpenseOpen, spendingAnalysisOpen, allExpensesOpen, addActivityOpen, activityMemberOpen, pollResultsOpen, membersOpen, settleUpOpen, addMemberOpen, selectedActivity, tabsMenuOpen]);

  useEffect(() => {
    const nextIndex = Math.max(0, visibleTabs.indexOf(activeTab));
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (reduceMotion) {
        tabProgress.setValue(nextIndex);
        tabContentMotion.setValue(1);
        return;
      }
      tabContentMotion.setValue(0);
      Animated.parallel([
        Animated.timing(tabProgress, { toValue: nextIndex, duration: 210, easing: Easing.bezier(0.22, 1, 0.36, 1), useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(tabContentMotion, { toValue: 1, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: Platform.OS !== 'web' }),
      ]).start();
    });
  }, [activeTab, tabContentMotion, tabProgress, visibleTabs]);

  const tabViewportWidth = Math.max(0, tabBarWidth - 40);
  const tabWidth = visibleTabs.length <= 4 ? tabViewportWidth / Math.max(1, visibleTabs.length) : tabViewportWidth / 4.35;
  const tabTrackWidth = tabWidth * visibleTabs.length;
  const indicatorWidth = Math.min(46, tabWidth * 0.56);
  const tabIndicatorShift = tabProgress.interpolate({ inputRange: [0, visibleTabs.length - 1], outputRange: [0, tabWidth * (visibleTabs.length - 1)] });
  const tabContentOpacity = tabContentMotion.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] });
  const tabContentShift = tabContentMotion.interpolate({ inputRange: [0, 1], outputRange: [6, 0] });

  const handleTripScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('tripup:trip-scroll', { detail: { y: event.nativeEvent.contentOffset.y } }));
  };

  return <View style={styles.screen}>
    <Animated.ScrollView ref={tripScrollRef} showsVerticalScrollIndicator={false} stickyHeaderIndices={[2]} contentContainerStyle={styles.scroll} scrollEventThrottle={16} onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false, listener: handleTripScroll })}>
      <View style={styles.mapHero}>
        <OpenStreetMap height={282} borderRadius={0} area="lisbon" />
      </View>
      <View style={styles.sheetHeader}>
        <View style={styles.handle} />
        <View style={styles.tripMeta}><AppText variant="caption" color={palette.coral}>NOV 11–22 · 12D11N</AppText><View style={styles.tools}><Tool icon={BriefcaseBusiness} label="Packing" expandedWidth={88} collapse={toolCollapse} /><Tool icon={Folder} label="Documents" expandedWidth={100} collapse={toolCollapse} /></View></View>
        <AppText variant="h1" style={styles.city}>Lisbon</AppText>
      </View>
      <View style={styles.subnavSticky}>
        <Animated.View style={[styles.compactTripSpacer, { height: compactHeaderHeight }]} />
        <View onLayout={(event) => setTabBarWidth(event.nativeEvent.layout.width)} style={styles.subnav}><ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={visibleTabs.length > 4} style={styles.subnavScroll} contentContainerStyle={styles.subnavScrollContent}><View style={[styles.subnavTrack, { width: Math.max(tabViewportWidth, tabTrackWidth) }]}>{visibleTabs.map((item, index) => { const saved = item === 'Saved'; const selected = item === activeTab; const labelScale = tabProgress.interpolate({ inputRange: [index - 1, index, index + 1], outputRange: [1, 1.045, 1], extrapolate: 'clamp' }); return <Pressable accessibilityRole="tab" accessibilityState={{ selected }} accessibilityLabel={`${item} trip tab`} onPress={() => { setActiveTab(item); if (item === 'Expenses' && expenseGuideStep === 'tab') setExpenseGuideStep('add'); if (item === 'Plan') { setSelectedDay('Final day'); if (collaborativeGuideStep === 'plan') setCollaborativeGuideStep('actions'); } }} key={item} style={({ pressed }) => [styles.subnavItem, { width: tabWidth }, pressed && styles.pressed]}><Animated.View style={[styles.subnavLabel, saved && savedCount > 0 && styles.savedTabMarked, { transform: [{ scale: labelScale }] }, saved && { transform: [{ translateY: savedShift }, { scale: Animated.multiply(savedScale, labelScale) }] }]}><AppText variant="tab" numberOfLines={1} color={selected ? palette.ink : saved && savedCount > 0 ? palette.sky : palette.inkSoft}>{item}</AppText>{item === 'Plan' ? <GuidePulse visible={collaborativeGuideStep === 'plan'} pulse={collaborativePulse} /> : null}{item === 'Expenses' ? <GuidePulse visible={expenseGuideStep === 'tab'} pulse={collaborativePulse} /> : null}{saved && savedCount > 0 ? <View style={styles.savedCount}><AppText variant="supporting" color={palette.white}>{savedCount}</AppText></View> : null}</Animated.View></Pressable>; })}{tabBarWidth > 0 ? <Animated.View pointerEvents="none" style={[styles.subnavActive, { left: (tabWidth - indicatorWidth) / 2, width: indicatorWidth, transform: [{ translateX: tabIndicatorShift }] }]} /> : null}</View></ScrollView><Pressable accessibilityRole="button" accessibilityLabel="Customize trip tabs" accessibilityHint="Add, remove, or reorder trip tabs" onPress={() => setTabsMenuOpen(true)} style={({ pressed }) => [styles.tabMenuButton, pressed && styles.pressed]}><Menu size={21} color={palette.inkSoft} strokeWidth={1.7} /></Pressable></View>
      </View>
      <Animated.View style={{ opacity: tabContentOpacity, transform: [{ translateY: tabContentShift }] }}>{activeTab === 'Plan' ? <View style={styles.sheetBody}>
        <ScrollView ref={daysScrollRef} horizontal showsHorizontalScrollIndicator={false} onContentSizeChange={() => daysScrollRef.current?.scrollToEnd({ animated: false })} contentContainerStyle={styles.days}>{days.map((day) => { const selected = day === selectedDay; return <Pressable accessibilityRole="tab" accessibilityState={{ selected }} accessibilityLabel={`Show plan for ${day}`} onPress={() => setSelectedDay(day)} key={day} style={({ pressed }) => [styles.day, selected && styles.dayActive, pressed && styles.dayPressed]}><AppText variant="label" color={selected ? palette.white : palette.ink}>{day}</AppText></Pressable>; })}<Pressable accessibilityRole="button" accessibilityLabel="Show more trip days" style={({ pressed }) => [styles.dayMenuCircle, pressed && styles.dayPressed]}><AppText variant="label">•••</AppText></Pressable></ScrollView>
        <View style={styles.weather}><Umbrella size={17} color={palette.inkSoft} /><AppText variant="body" color={palette.inkSoft}>{plan.weather}</AppText></View>
        <View style={styles.timeline}>{plan.activities.map((activity, index) => {
          const activityKey = `${selectedDay}:${activity.title}`;
          const visited = visitedActivities.includes(activityKey);
          const schedule = activity.detail.split('·')[0].trim();
          return <View key={activity.title} style={styles.activityRow}>
            <View style={styles.rail}><Pressable accessibilityRole="checkbox" accessibilityState={{ checked: visited }} accessibilityLabel={`Mark ${activity.title} as ${visited ? 'not visited' : 'visited'}`} onPress={() => toggleVisited(activityKey)} style={({ pressed }) => [styles.number, visited && styles.numberVisited, pressed && styles.pressed]}>{visited ? <Check size={17} color={palette.white} strokeWidth={2.2} /> : <AppText variant="label" color={palette.coral}>{index + 1}</AppText>}</Pressable>{index < plan.activities.length - 1 || showPollWinner ? <View style={styles.railLine} /> : null}</View>
            <View style={{ flex: 1 }}><View style={[styles.activityCard, styles.activityCardCurrent]}>
              <View style={styles.activityCurrentTop}>
                <Image accessibilityLabel={`${activity.title} attraction`} source={{ uri: activityImageFor(activity.title, activity.tag) }} resizeMode="cover" style={styles.activityThumbnail} />
                <View style={styles.activityCurrentCopy}><AppText variant="supporting" color={palette.inkSoft} style={styles.activitySchedule}>{schedule}</AppText><View style={styles.activityTitleLine}><AppText variant="h5" numberOfLines={2} style={styles.activityTitle}>{activity.title}</AppText></View><View style={styles.activityCurrentMeta}><View style={styles.activityTag}><Pill label={activity.tag} compact /></View><ActivityParticipants inline /></View></View>
                <View style={styles.activityCurrentActions}><Pressable accessibilityRole="button" accessibilityLabel={`More actions for ${activity.title}`} onPress={() => setSelectedActivity(activity.title)} style={({ pressed }) => [styles.itemMore, styles.itemMoreCurrent, pressed && styles.pressed]}><Ellipsis size={18} color={palette.inkSoft} /></Pressable><AppText variant="label" numberOfLines={1} style={styles.activityCurrentPrice}>{activity.price}</AppText></View>
              </View>
              <MessageSquare style={styles.activityCurrentComment} size={18} color={palette.inkSoft} strokeWidth={1.7} />
            </View>{index < plan.activities.length - 1 || showPollWinner ? <View style={styles.walk}><Footprints size={17} color={palette.inkSoft} /><AppText variant="label" color={palette.inkSoft}>{activity.walk}</AppText></View> : null}</View>
          </View>;
        })}{showLivePoll ? <LivePollActivityCard index={plan.activities.length + 1} voted={pollVotesIn} closed={pollClosed} guidePulse={collaborativePulse} guideStep={collaborativeGuideStep} onCastVote={() => { setPollResultsOpen(true); setCollaborativeGuideStep('submit-vote'); }} onOpenResults={() => { setPollResultsOpen(true); setCollaborativeGuideStep(pollClosed ? 'view-activity' : 'close-poll'); }} /> : null}{showPollWinner ? <PollGeneratedActivityCard index={plan.activities.length + 1} visited={visitedActivities.includes(`${selectedDay}:Dinner at Cervejaria Ramiro`)} onToggleVisited={() => toggleVisited(`${selectedDay}:Dinner at Cervejaria Ramiro`)} onMore={() => setSelectedActivity('Dinner at Cervejaria Ramiro')} /> : null}</View>
        <View style={styles.addStop}><Button label="Add a stop to today" icon={Plus} tone="tertiary" fullWidth style={styles.addStopButton} accessibilityLabel="Add a stop to today" onPress={() => setActionsOpen(true)} /></View>
      </View> : activeTab === 'Expenses' ? <ExpensesSheetBody guideAddExpense={expenseGuideStep === 'add'} guidePulse={collaborativePulse} onAddExpense={() => { if (expenseGuideStep === 'add') setExpenseGuideStep('scan'); setExpenseStartScanned(false); setAddExpenseOpen(true); }} onSettleUp={() => setSettleUpOpen(true)} onViewAnalysis={() => setSpendingAnalysisOpen(true)} onViewAll={() => setAllExpensesOpen(true)} /> : activeTab === 'Overview' ? <TripOverview visibleTabs={visibleTabs} pollActive={pollActivityAdded && !pollWinnerAdded} pollVoted={pollVotesIn} onOpenTab={setActiveTab} onOpenPoll={() => { setActiveTab('Plan'); setSelectedDay('Final day'); setTimeout(() => tripScrollRef.current?.scrollToEnd({ animated: true }), 260); }} /> : activeTab === 'Saved' ? <SavedLisbon /> : <TripTabPlaceholder tab={activeTab} />}</Animated.View>
    </Animated.ScrollView>
    <Animated.View style={[styles.floatingTripNav, { height: topHeaderHeight, backgroundColor: floatingHeaderBackground, shadowOpacity: floatingHeaderShadow }]}>
      <View style={styles.floatingTripNavInner}>
        <RoundAction icon={ArrowLeft} label="Back to Home" onPress={() => router.replace('/')} />
        <Animated.View style={[styles.floatingTripCopy, { width: floatingTripCopyWidth, opacity: floatingTripCopyOpacity }]}><AppText variant="h5" numberOfLines={1}>Lisbon</AppText><AppText variant="supporting" color={palette.inkSoft} numberOfLines={1}>NOV 11–22 · 12 DAYS</AppText></Animated.View>
        <View style={styles.floatingTripActions}><MemberGroup hasRenGuest={renInvited} arrival={renArrival} guideVisible={guidedMemberAvatarTarget} guidePulse={collaborativePulse} onPress={() => { setFocusRenInMembers(guidedMemberAvatarTarget); setGuidedMemberAvatarTarget(false); setMembersOpen(true); }} /><RoundAction icon={UserPlus} compact label="Add group member" onPress={() => { setGuidedAddMember(false); setMembersOpen(false); setAddMemberOpen(true); }} /><Animated.View style={[styles.floatingShareSlot, { width: floatingShareWidth, opacity: floatingShareOpacity }]}><RoundAction icon={Share2} compact label="Share trip" /></Animated.View><RoundAction icon={Ellipsis} compact label="More options" /></View>
      </View>
    </Animated.View>
    <AllActionsSheet visible={actionsOpen} onClose={() => setActionsOpen(false)} onAddActivity={() => { setActionsOpen(false); setAddActivityOpen(true); }} />
    <ManageTabsSheet visible={tabsMenuOpen} orderedTabs={tabOrder} enabledTabs={enabledOptionalTabs} onClose={() => setTabsMenuOpen(false)} onMove={(tab, direction) => setTabOrder((current) => { const index = current.indexOf(tab); const target = index + direction; if (tab === 'Overview' || index < 0 || target <= 0 || target >= current.length) return current; const next = [...current]; [next[index], next[target]] = [next[target], next[index]]; return next; })} onToggle={(tab) => { const removing = enabledOptionalTabs.includes(tab); if (removing && activeTab === tab) setActiveTab('Overview'); setEnabledOptionalTabs((current) => current.includes(tab) ? current.filter((item) => item !== tab) : [...current, tab]); }} />
    <AddActivitySheet key={editingActivity ?? (addActivityOpen ? 'add-activity-open' : 'add-activity-closed')} visible={addActivityOpen} mode={editingActivity ? 'edit' : 'add'} activityName={editingActivity ?? undefined} members={activityMembers} onMembersChange={setActivityMembers} onAddMember={() => { setActivityMemberSource('editor'); setAddActivityOpen(false); setActivityMemberOpen(true); }} guided={collaborativeGuideStep !== 'idle'} guidedStep={collaborativeGuideStep} guidePulse={collaborativePulse} onGuideStep={setCollaborativeGuideStep} onGoToExpenses={(name) => { setAddActivityOpen(false); setEditingActivity(null); setExpenseActivityName(name); setExpenseStartScanned(false); setActiveTab('Expenses'); setAddExpenseOpen(true); }} onActivityAdded={(hasPoll) => { setAddActivityOpen(false); setEditingActivity(null); if (hasPoll) { setPollActivityAdded(true); setPollVotesIn(false); setPollVoteChoice(null); setActiveTab('Plan'); setSelectedDay('Final day'); setCollaborativeGuideStep('cast-vote'); setToastMessage('Dinner poll added to the final day itinerary'); setTimeout(() => tripScrollRef.current?.scrollToEnd({ animated: true }), 320); } }} onClose={() => { setAddActivityOpen(false); setEditingActivity(null); }} />
    <ItemActionsSheet itemName={selectedActivity} onClose={() => setSelectedActivity(null)} onSave={saveSelectedActivity} onEdit={() => { const item = selectedActivity; setSelectedActivity(null); setEditingActivity(item); setAddActivityOpen(true); }} onManageParticipants={() => { setActivityMemberSource('itinerary'); setSelectedActivity(null); setActivityMemberOpen(true); }} />
    <MembersSheet visible={membersOpen} hasRenGuest={renInvited} focusRen={focusRenInMembers} onClose={() => { const completesGuidedFlow = focusRenInMembers; setMembersOpen(false); setFocusRenInMembers(false); if (completesGuidedFlow && Platform.OS === 'web' && typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tripup:group-management-complete')); }} onAddMember={() => { setMembersOpen(false); setFocusRenInMembers(false); setAddMemberOpen(true); }} />
    <SettleUpSheet visible={settleUpOpen} onClose={() => setSettleUpOpen(false)} />
    <SpendingAnalysisSheet visible={spendingAnalysisOpen} onClose={() => setSpendingAnalysisOpen(false)} onSettleUp={() => { setSpendingAnalysisOpen(false); setSettleUpOpen(true); }} />
    <AllExpensesSheet visible={allExpensesOpen} onClose={() => setAllExpensesOpen(false)} onAnalysis={() => { setAllExpensesOpen(false); setSpendingAnalysisOpen(true); }} onAddExpense={() => { setAllExpensesOpen(false); setExpenseStartScanned(false); setAddExpenseOpen(true); }} />
    <AddExpenseSheet key={`${expenseStartScanned ? 'scanned' : 'manual'}-${expenseActivityName ?? 'new'}`} visible={addExpenseOpen} startScanned={expenseStartScanned} initialName={expenseActivityName ?? undefined} guideStep={expenseGuideStep} onScan={() => setExpenseGuideStep('line-items')} onOpenLineItems={() => setExpenseGuideStep('edit-participants')} onOpenParticipants={() => setExpenseGuideStep('idle')} onClose={() => { setAddExpenseOpen(false); setExpenseStartScanned(false); setExpenseActivityName(null); }} onSave={() => { setAddExpenseOpen(false); setExpenseStartScanned(false); setExpenseActivityName(null); setToastMessage('Expense saved. All participants notified.'); }} />
    <AddMemberSheet visible={addMemberOpen} guided={guidedAddMember} guidePulse={collaborativePulse} onClose={() => { setGuidedAddMember(false); setAddMemberOpen(false); }} onBack={() => { setGuidedAddMember(false); setAddMemberOpen(false); setMembersOpen(true); }} onInvite={inviteTripMember} />
    <AddMemberSheet visible={activityMemberOpen} scope="activity" candidateImage={tripMembers[4].image} onClose={() => { setActivityMemberOpen(false); if (activityMemberSource === 'editor') setAddActivityOpen(true); }} onBack={() => { setActivityMemberOpen(false); if (activityMemberSource === 'editor') setAddActivityOpen(true); }} onInvite={(name) => { setActivityMembers((current) => current.some((member) => member.toLowerCase() === name.toLowerCase()) ? current : [...current, name]); setActivityMemberOpen(false); if (activityMemberSource === 'editor') setAddActivityOpen(true); setToastMessage(`${name} added to this activity`); }} />
    <PollResultsSheet visible={pollResultsOpen} closed={pollClosed} voted={pollVotesIn} selectedVote={pollVoteChoice} guidePulse={collaborativePulse} guideStep={collaborativeGuideStep} onClose={() => setPollResultsOpen(false)} onVote={(name) => { setPollVoteChoice(name); setPollVotesIn(true); setPollResultsOpen(false); setCollaborativeGuideStep('open-results'); setToastMessage(`Vote cast for ${name}`); }} onClosePoll={() => { setPollClosed(true); setPollResultsOpen(false); setCollaborativeGuideStep('closed-results'); setToastMessage('Dinner poll closed · Cervejaria Ramiro won'); setTimeout(() => tripScrollRef.current?.scrollToEnd({ animated: true }), 260); }} onViewItinerary={() => { setPollResultsOpen(false); setPollWinnerAdded(true); setCollaborativeGuideStep('idle'); if (Platform.OS === 'web' && typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tripup:collaborative-decision-complete')); }} />
    {toastMessage ? <Animated.View accessibilityRole="alert" style={[styles.toast, { opacity: toastMotion, transform: [{ translateY: toastMotion.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }, { scale: toastMotion.interpolate({ inputRange: [0, 1], outputRange: [.97, 1] }) }] }]}><Check size={18} color={palette.white} strokeWidth={2} /><AppText variant="label" color={palette.white}>{toastMessage}</AppText></Animated.View> : null}
    <ContextActionBar open={quickActionsOpen} actions={quickActions} aiOpen={quickAiOpen} aiValue={quickAiValue} onAiChange={setQuickAiValue} onAiSubmit={() => { if (!quickAiValue.trim()) return; closeQuickActions(); router.push(`/assistant?prompt=${encodeURIComponent(quickAiValue.trim())}`); setQuickAiValue(''); }} onDismiss={closeQuickActions} bottom={84} />
    <View style={styles.bottomNav}><NavItem icon={House} label="Home" active onPress={() => router.replace('/')} /><NavItem icon={Compass} label="Explore" onPress={() => router.replace('/explore')} /><Pressable accessibilityRole="button" accessibilityLabel={quickActionsOpen ? 'Close quick actions' : 'Open quick actions'} accessibilityState={{ expanded: quickActionsOpen }} onPress={() => { setQuickActionsOpen((open) => !open); if (quickActionsOpen) setQuickAiOpen(false); if (collaborativeGuideStep === 'actions') setCollaborativeGuideStep('activity'); }} style={({ pressed }) => [styles.navActionItem, pressed && styles.pressed]}><View style={styles.navActionCircle}><Plus size={25} color={palette.white} strokeWidth={1.8} /><GuidePulse visible={collaborativeGuideStep === 'actions'} pulse={collaborativePulse} /></View></Pressable><NavItem icon={Map} label="Memories" onPress={() => router.replace('/memories')} /><NavItem icon={UserRound} label="Account" onPress={() => router.replace('/more')} /></View>
  </View>;
}

function GuidePulse({ visible }: { visible: boolean; pulse?: Animated.Value }) {
  const [localPulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let animation: ReturnType<typeof Animated.loop> | undefined;
    let mounted = true;

    if (!visible) {
      localPulse.stopAnimation();
      localPulse.setValue(0);
      return;
    }

    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!mounted) return;
      if (reduceMotion) {
        localPulse.setValue(0.45);
        return;
      }
      animation = Animated.loop(Animated.sequence([
        Animated.timing(localPulse, { toValue: 1, duration: 680, easing: Easing.out(Easing.quad), useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(localPulse, { toValue: 0, duration: 680, easing: Easing.in(Easing.quad), useNativeDriver: Platform.OS !== 'web' }),
      ]));
      animation.start();
    });

    return () => {
      mounted = false;
      animation?.stop();
    };
  }, [localPulse, visible]);

  if (!visible) return null;
  return <Animated.View pointerEvents="none" accessibilityElementsHidden style={[styles.inlineGuidePulse, {
    opacity: localPulse.interpolate({ inputRange: [0, 1], outputRange: [.88, .1] }),
    transform: [{ scale: localPulse.interpolate({ inputRange: [0, 1], outputRange: [.78, 1.52] }) }],
  }]} />;
}

function ExpensesSheetBody({ guideAddExpense, guidePulse, onAddExpense, onSettleUp, onViewAnalysis, onViewAll }: { guideAddExpense: boolean; guidePulse: Animated.Value; onAddExpense: () => void; onSettleUp: () => void; onViewAnalysis: () => void; onViewAll: () => void }) {
  const [expenseView, setExpenseView] = useState<'recent' | 'balance'>('recent');
  const summaryRef = useRef<ComponentRef<typeof View>>(null);
  const detailsRef = useRef<ComponentRef<typeof View>>(null);
  const expenses = tripExpenses.slice(0, 5);
  const hasExpenses = expenses.length > 0;

  const publishExpenseContext = useCallback(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    summaryRef.current?.measureInWindow((_summaryX, summaryY, _summaryWidth, summaryHeight) => {
      detailsRef.current?.measureInWindow((_detailsX, detailsY, _detailsWidth, detailsHeight) => {
        window.dispatchEvent(new CustomEvent('tripup:expense-overview-context', { detail: { visible: true, summaryY: summaryY + summaryHeight / 2, detailsY: detailsY + detailsHeight / 2 } }));
      });
    });
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const timer = setTimeout(publishExpenseContext, 180);
    window.addEventListener('resize', publishExpenseContext);
    window.addEventListener('tripup:trip-scroll', publishExpenseContext);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', publishExpenseContext);
      window.removeEventListener('tripup:trip-scroll', publishExpenseContext);
      window.dispatchEvent(new CustomEvent('tripup:expense-overview-context', { detail: { visible: false, summaryY: 0, detailsY: 0 } }));
    };
  }, [publishExpenseContext]);

  return <View style={[styles.sheetBody, styles.expensesBody]}>
    <View ref={summaryRef} onLayout={publishExpenseContext} style={styles.expenseSummaryCard}>
      <View style={styles.expenseSummaryTop}><ExpenseParticipantStack /><Pressable accessibilityRole="button" accessibilityLabel="Add expense" onPress={onAddExpense} style={({ pressed }) => [styles.expenseAddButton, pressed && styles.pressed]}><ReceiptText size={21} color={palette.white} strokeWidth={1.7} /><View style={styles.expenseAddBadge}><Plus size={10} color={palette.navy} strokeWidth={2.4} /></View><GuidePulse visible={guideAddExpense} pulse={guidePulse} /></Pressable></View>
      <AppText variant="overline" style={styles.expenseSpentLabel}>SPENT</AppText>
      <AppText variant="h2" style={styles.expenseSpentAmount}>{hasExpenses ? '€1,256.78' : '€0.00'}</AppText>
      <Pressable accessibilityRole="button" accessibilityLabel="Edit trip budget, currently 10,000 euros" style={({ pressed }) => [styles.expenseBudgetEdit, pressed && styles.pressed]}><AppText variant="supporting" color={palette.inkSoft}>Budget €10,000.00</AppText><Pencil size={14} color={palette.inkSoft} strokeWidth={1.7} /></Pressable>
      <View style={styles.expenseBudgetTrack}><View style={[styles.expenseBudgetProgress, { width: hasExpenses ? '25%' : 8 }]} /></View>
      <View style={styles.expenseBudgetMeta}><View style={styles.expenseBudgetLeft}><AppText variant="supporting" color={palette.ink}>{hasExpenses ? '€8,743 left' : '€10,000 left'}</AppText></View></View>
      <Button label="View spending analysis" tone="tertiary" style={styles.expenseAnalysisLink} onPress={onViewAnalysis} />
    </View>

    {hasExpenses ? <>
      <View ref={detailsRef} onLayout={publishExpenseContext} accessibilityRole="tablist" style={styles.expenseViewTabs}><Pressable accessibilityRole="tab" accessibilityState={{ selected: expenseView === 'recent' }} onPress={() => setExpenseView('recent')} style={[styles.expenseViewTab, expenseView === 'recent' && styles.expenseViewTabActive]}><AppText variant="action" color={expenseView === 'recent' ? palette.ink : palette.inkSoft}>Recent expenses</AppText></Pressable><Pressable accessibilityRole="tab" accessibilityState={{ selected: expenseView === 'balance' }} onPress={() => setExpenseView('balance')} style={[styles.expenseViewTab, expenseView === 'balance' && styles.expenseViewTabActive]}><AppText variant="action" color={expenseView === 'balance' ? palette.ink : palette.inkSoft}>Group balance</AppText></Pressable></View>
      {expenseView === 'recent' ? <View style={styles.expenseList}>{expenses.map((expense) => <Pressable accessibilityRole="button" accessibilityLabel={`${expense.title}, ${expense.amount}, paid by ${expense.member}`} key={expense.id} style={({ pressed }) => [styles.expenseRow, pressed && styles.actionRowPressed]}><View style={styles.expenseRowMain}><AppText variant="listItem">{expense.title}</AppText><AppText variant="supporting" color={palette.inkSoft}>{expense.member} · {expense.date} · {expense.category}</AppText></View><View style={styles.expenseRowAmount}><AppText variant="listItem">{expense.amount}</AppText><AppText variant="supporting" color={palette.inkSoft}>{expense.category}</AppText></View></Pressable>)}<Button label="View all expenses" tone="tertiary" style={styles.expenseViewAll} onPress={onViewAll} /></View> : <View style={styles.expenseBalanceCard}><AppText variant="h4">Group balance</AppText><AppText variant="supporting" color={palette.inkSoft} style={styles.expenseBalanceMessage}>Simplified by merging 9 debts into 4 transfers</AppText><BalancePreviewRow label="You → Gums" amount="€320" direction="pay" /><BalancePreviewRow label="Ari → You" amount="€120" direction="receive" /><BalancePreviewRow label="Papi → You" amount="€120" direction="receive" /><BalancePreviewRow label="Ren → You" amount="€120" direction="receive" /><Button label="View group settle-up" tone="tertiary" style={styles.expenseBalanceLink} onPress={onSettleUp} /></View>}
    </> : <View style={styles.expenseEmptyState}><View style={styles.expenseEmptyIcon}><ReceiptText size={25} color={palette.sky} strokeWidth={1.7} /></View><AppText variant="h4">No expenses yet</AppText><AppText variant="body" color={palette.inkSoft} style={styles.expenseEmptyCopy}>Add your first expense to start tracking the trip budget and group balances.</AppText><Button label="Add expense" icon={Plus} onPress={onAddExpense} /></View>}
  </View>;
}

function AllExpensesSheet({ visible, onClose, onAnalysis, onAddExpense }: { visible: boolean; onClose: () => void; onAnalysis: () => void; onAddExpense: () => void }) {
  const [filter, setFilter] = useState<'All' | 'Food & Drink' | 'Transport' | 'Tickets' | 'Stay'>('All');
  const categories = ['All', 'Food & Drink', 'Transport', 'Tickets', 'Stay'] as const;
  const filtered = filter === 'All' ? tripExpenses : tripExpenses.filter((expense) => expense.category === filter);
  const daysInOrder = Array.from(new Set(filtered.map((expense) => expense.day)));
  const iconFor = (category: string) => category === 'Food & Drink' ? Utensils : category === 'Transport' ? CarFront : category === 'Tickets' ? Ticket : BedDouble;
  const tintFor = (category: string) => category === 'Food & Drink' ? palette.sunSoft : category === 'Transport' ? palette.skySoft : category === 'Tickets' ? palette.violetSoft : palette.mossSoft;
  const colorFor = (category: string) => category === 'Food & Drink' ? '#D9782F' : category === 'Transport' ? palette.sky : category === 'Tickets' ? palette.violet : palette.moss;

  return <BottomSheet visible={visible} onClose={onClose} bottomInset={76} topInset={20} showClose={false}>
    <View style={styles.allExpensesFrame}>
      <View style={styles.allExpensesHeader}><Pressable accessibilityRole="button" accessibilityLabel="Back to expense summary" onPress={onClose} style={({ pressed }) => [styles.allExpensesHeaderButton, pressed && styles.pressed]}><ArrowLeft size={21} color={palette.ink} strokeWidth={1.8} /></Pressable><View style={styles.allExpensesHeaderCopy}><AppText variant="h5">Expenses</AppText><AppText variant="supporting" color={palette.inkSoft}>Lisbon · 12 days · 5 people</AppText></View><Pressable accessibilityRole="button" accessibilityLabel="Search expenses" style={({ pressed }) => [styles.allExpensesHeaderIcon, pressed && styles.pressed]}><Search size={20} color={palette.ink} strokeWidth={1.8} /></Pressable><Pressable accessibilityRole="button" accessibilityLabel="More expense options" style={({ pressed }) => [styles.allExpensesHeaderIcon, pressed && styles.pressed]}><Ellipsis size={20} color={palette.ink} strokeWidth={1.8} /></Pressable></View>
      <ScrollView style={styles.allExpensesScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.allExpensesContent}>
        <View style={styles.allExpensesSummaryRow}><View><AppText variant="overline">TOTAL SPENT</AppText><AppText variant="h2">€1,256.78</AppText><AppText variant="supporting" color={palette.inkSoft}>€251.36/person · {tripExpenses.length} expenses</AppText></View><Pressable accessibilityRole="button" accessibilityLabel="Open spending analysis" onPress={onAnalysis} style={({ pressed }) => [styles.allExpensesAnalysis, pressed && styles.pressed]}><ChartColumnIncreasing size={17} color={palette.navy} strokeWidth={1.8} /><AppText variant="label">Analysis</AppText></Pressable></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.allExpensesFilters}>{categories.map((category) => { const selected = filter === category; const count = category === 'All' ? tripExpenses.length : tripExpenses.filter((expense) => expense.category === category).length; return <Pressable key={category} accessibilityRole="tab" accessibilityState={{ selected }} onPress={() => setFilter(category)} style={({ pressed }) => [styles.allExpensesFilter, selected && styles.allExpensesFilterActive, pressed && styles.pressed]}><AppText variant="label" color={selected ? palette.white : palette.ink}>{category} · {count}</AppText></Pressable>; })}</ScrollView>
        {daysInOrder.map((day) => { const dayExpenses = filtered.filter((expense) => expense.day === day); const total = dayExpenses.reduce((sum, expense) => sum + expense.numericAmount, 0); return <View key={day} style={styles.allExpensesDay}><View style={styles.allExpensesDayHeader}><AppText variant="overline">{day === '13/11' ? 'TODAY · ' : ''}{day}</AppText><AppText variant="label">€{total.toFixed(total % 1 ? 2 : 0)}</AppText></View>{dayExpenses.map((expense) => { const Icon = iconFor(expense.category); return <Pressable accessibilityRole="button" accessibilityLabel={`${expense.title}, ${expense.amount}`} key={expense.id} style={({ pressed }) => [styles.allExpensesRow, pressed && styles.actionRowPressed]}><View style={[styles.allExpensesCategoryIcon, { backgroundColor: tintFor(expense.category) }]}><Icon size={20} color={colorFor(expense.category)} strokeWidth={1.8} /></View><View style={styles.allExpensesRowCopy}><AppText variant="listItem">{expense.title}</AppText><AppText variant="supporting" color={palette.inkSoft}>{expense.member} paid · split 5 ways · {expense.category}</AppText></View><AppText variant="label">{expense.amount}</AppText></Pressable>; })}</View>; })}
      </ScrollView>
      <Button label="Add expense" icon={Plus} onPress={onAddExpense} style={styles.allExpensesAdd} />
    </View>
  </BottomSheet>;
}

function ExpenseParticipantStack() {
  const visible = tripMembers.slice(0, 3);
  const remaining = tripMembers.length - visible.length;
  return <View accessibilityLabel={`${tripMembers.length} expense participants`} style={styles.expenseParticipants}>{visible.map(({ name, image }, index) => <Image key={name} source={image} resizeMode="cover" style={[styles.expenseParticipantAvatar, index === 0 && styles.avatarFirst, { zIndex: index + 1 }]} />)}<View style={[styles.expenseParticipantMore, { zIndex: visible.length + 1 }]}><AppText variant="caption">+{remaining}</AppText></View></View>;
}

function BalancePreviewRow({ label, amount, direction }: { label: string; amount: string; direction: 'pay' | 'receive' }) {
  const outgoing = direction === 'pay';
  const color = outgoing ? '#D9782F' : palette.success;
  const DirectionIcon = outgoing ? ArrowUpRight : ArrowDownLeft;
  return <View accessibilityLabel={`${outgoing ? 'You pay' : 'You receive'} ${amount}. ${label}`} style={styles.balancePreviewRow}><View style={styles.balancePreviewMain}><DirectionIcon size={18} color={color} strokeWidth={1.9} /><AppText variant="listItem" color={color}>{label}</AppText></View><AppText variant="listItem" color={color}>{amount}</AppText></View>;
}

function SpendingAnalysisSheet({ visible, onClose, onSettleUp }: { visible: boolean; onClose: () => void; onSettleUp: () => void }) {
  const categoryBreakdown = [
    { label: 'Stay', amount: '€594.00', percent: 47, icon: BedDouble, color: palette.sky, background: palette.skySoft },
    { label: 'Food & Drink', amount: '€286.78', percent: 23, icon: Utensils, color: '#D9782F', background: palette.sunSoft },
    { label: 'Transport', amount: '€264.00', percent: 21, icon: CarFront, color: palette.violet, background: palette.violetSoft },
    { label: 'Tickets', amount: '€112.00', percent: 9, icon: Ticket, color: palette.moss, background: palette.mossSoft },
  ];
  const dailySpend = [
    { label: '11/11', amount: 450.78 },
    { label: '12/11', amount: 706 },
    { label: '13/11', amount: 100 },
    { label: '14/11', amount: 0 },
    { label: '15/11', amount: 0 },
    { label: '16/11', amount: 0 },
  ];
  const payerBreakdown = [
    { memberIndex: 4, amount: '€100.00', detail: 'Tram passes' },
    { memberIndex: 0, amount: '€164.00', detail: 'Taxi and local transport' },
    { memberIndex: 1, amount: '€286.78', detail: 'Dinner and shared meals' },
    { memberIndex: 2, amount: '€112.00', detail: 'Attraction tickets' },
    { memberIndex: 3, amount: '€594.00', detail: 'Hotel Mundial' },
  ];
  const maxDailySpend = Math.max(...dailySpend.map((day) => day.amount));

  return <BottomSheet visible={visible} onClose={onClose} bottomInset={76} topInset={20} showClose={false}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.analysisContent}>
      <View style={styles.analysisHeader}><Pressable accessibilityRole="button" accessibilityLabel="Back to expenses" onPress={onClose} style={({ pressed }) => [styles.analysisHeaderButton, pressed && styles.pressed]}><ArrowLeft size={21} color={palette.ink} strokeWidth={1.8} /></Pressable><View style={styles.analysisHeaderCopy}><AppText variant="h5">Spending analysis</AppText><AppText variant="supporting" color={palette.inkSoft}>Lisbon · 12 days · 11–22 Nov · 5 people</AppText></View><Pressable accessibilityRole="button" accessibilityLabel="Share spending analysis" onPress={() => Share.share({ message: 'Lisbon trip spending: €1,256.78 across 5 expenses.' })} style={({ pressed }) => [styles.analysisHeaderButton, pressed && styles.pressed]}><Share2 size={20} color={palette.ink} strokeWidth={1.8} /></Pressable></View>

      <View style={styles.analysisSummary}><AppText variant="overline">TOTAL SPENT</AppText><AppText variant="h1" style={styles.analysisTotal}>€1,256.78</AppText><AppText variant="supporting" color={palette.inkSoft}>€251.36/person · 5 expenses</AppText><View style={styles.analysisBudgetTrack}><View style={styles.analysisBudgetFill} /></View><View style={styles.analysisBudgetMeta}><AppText variant="supporting" color={palette.inkSoft}>Used 13% of €10,000 budget</AppText><View style={styles.analysisBudgetLeft}><AppText variant="caption">€8,743 left</AppText></View></View></View>

      <AppText variant="overline" style={styles.analysisSectionTitle}>BY DAY</AppText>
      <View style={styles.analysisChart}><View style={styles.analysisChartPlot}>{dailySpend.map((day) => <View key={day.label} style={styles.analysisChartColumn}><View style={styles.analysisChartValue}>{day.amount > 0 ? <AppText variant="caption" color={palette.inkSoft}>{day.amount.toFixed(day.amount % 1 ? 2 : 0)}</AppText> : null}</View><View style={[styles.analysisChartBar, { height: day.amount > 0 ? `${Math.max(8, (day.amount / maxDailySpend) * 100)}%` : 4 }, day.amount === maxDailySpend && styles.analysisChartBarActive]} /></View>)}</View><View style={styles.analysisChartLabels}>{dailySpend.map((day) => <AppText key={day.label} variant="caption" color={day.amount === maxDailySpend ? palette.ink : palette.inkSoft} style={styles.analysisChartLabel}>{day.label}</AppText>)}</View></View>

      <AppText variant="overline" style={styles.analysisSectionTitle}>YOURS</AppText>
      <View style={styles.analysisYoursCard}><View style={styles.analysisYoursColumns}><View style={styles.analysisYoursColumn}><AppText variant="supporting">You paid</AppText><AppText variant="h5">€100.00</AppText></View><View style={styles.analysisYoursColumn}><AppText variant="supporting">Your share</AppText><AppText variant="h5">€209.46</AppText></View></View><View style={styles.analysisYoursFooter}><AppText variant="h6">You owe €109.46</AppText><Button label="Settle up" tone="tertiary" onPress={onSettleUp} style={styles.analysisSettleLink} /></View></View>

      <AppText variant="overline" style={styles.analysisSectionTitle}>BY CATEGORY</AppText>
      <View style={styles.analysisCategoryList}>{categoryBreakdown.map(({ label, amount, percent, icon: Icon, color, background }) => <View key={label} style={styles.analysisCategoryRow}><View style={[styles.analysisCategoryIcon, { backgroundColor: background }]}><Icon size={19} color={color} strokeWidth={1.8} /></View><View style={styles.analysisCategoryBody}><View style={styles.analysisCategoryMeta}><AppText variant="h6">{label}</AppText><AppText variant="label">{amount}</AppText></View><View style={styles.analysisCategoryTrack}><View style={[styles.analysisCategoryFill, { width: `${percent}%`, backgroundColor: color }]} /></View></View><AppText variant="supporting" color={palette.inkSoft} style={styles.analysisCategoryPercent}>{percent}%</AppText></View>)}</View>

      <AppText variant="overline" style={styles.analysisSectionTitle}>WHO PAID WHAT</AppText>
      <View style={styles.analysisPayerList}>{payerBreakdown.map(({ memberIndex, amount, detail }) => { const member = tripMembers[memberIndex]; return <View key={member.name} style={styles.analysisPayerRow}><Image source={member.image} resizeMode="cover" style={styles.analysisPayerAvatar} /><View style={styles.analysisPayerCopy}><AppText variant="h6">{member.name}</AppText><AppText variant="supporting" color={palette.inkSoft}>{detail}</AppText></View><AppText variant="h6">{amount}</AppText></View>; })}</View>
    </ScrollView>
  </BottomSheet>;
}

function SettleUpSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  const [markPaidOpen, setMarkPaidOpen] = useState(false);
  const betweenOthers = [
    { from: 'Papi', to: 'Gums', amount: '€420', fromIndex: 3, toIndex: 2 },
    { from: 'Kat', to: 'Gums', amount: '€280', fromIndex: 1, toIndex: 2 },
  ];
  const balances = [
    { name: 'Gums', detail: 'Paid €1,180 · Share €460', amount: '+€720', memberIndex: 2, positive: true },
    { name: 'Ari', detail: 'Paid €260 · Share €380', amount: '−€120', memberIndex: 4, positive: false },
    { name: 'Papi', detail: 'Paid €40 · Share €460', amount: '−€420', memberIndex: 3, positive: false },
  ];

  const closeSettleUp = () => { setMarkPaidOpen(false); onClose(); };

  return <><BottomSheet visible={visible} title="Settle up" subtitle="6 people · 3 transfers" onClose={closeSettleUp} bottomInset={76} topInset={44}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.settleUpContent}>
      <AppText variant="overline">YOU NEED TO PAY</AppText>
      <AppText variant="h1" style={styles.settleUpTotal}>{sent ? '€0.00' : '€320.00'}</AppText>
      <AppText variant="body" color={palette.inkSoft}>{sent ? 'Your transfer to Gums is marked as paid' : 'to Gums · settle or record the payment below'}</AppText>

      <View style={styles.settleProgressCard}><View style={styles.settleProgressHeader}><AppText variant="h6">Whole group</AppText><AppText variant="label">{sent ? '1/3' : '0/3'} transfers done</AppText></View><View style={styles.settleProgressTrack}><View style={[styles.settleProgressFill, { width: sent ? '33%' : 4 }]} /></View><AppText variant="body" color={palette.inkSoft}>{sent ? '1 transfer recorded · 9 cross debts merged into 3 transfers' : 'When members pay, completed transfers are recorded here.'}</AppText></View>

      <View style={styles.settleCombinedCard}>
        <View style={styles.settleActionBlock}><AppText variant="overline">WHAT YOU OWE · 1</AppText><View style={styles.settleTransferHeader}><Image source={tripMembers[2].image} resizeMode="cover" style={styles.settleAvatarLarge} /><View style={styles.settleTransferCopy}><AppText variant="h5">Gums</AppText><AppText variant="h5">€320.00</AppText></View><View style={[styles.settleStatus, sent && styles.settleStatusDone]}><AppText variant="caption" color={sent ? palette.success : '#8A6410'}>{sent ? 'Paid' : 'Not paid'}</AppText></View></View><AppText variant="body" color={palette.inkSoft}>{sent ? 'Recorded as paid in TripUp' : 'Gums hasn’t added a bank account yet'}</AppText><View style={styles.settleActionRow}><Button label={sent ? 'Marked as paid' : 'Mark paid'} icon={Check} tone="secondary" disabled={sent} onPress={() => setMarkPaidOpen(true)} style={styles.settleActionButton} /><Button label="Settle Up" disabled={sent} onPress={() => {}} style={styles.settleActionButton} /></View></View>
        <View style={styles.settleCombinedDivider} />
        <View style={styles.settleOthersBlock}><View style={styles.settleSectionHeader}><AppText variant="overline">BETWEEN OTHERS · 2</AppText><AppText variant="supporting" color={palette.inkSoft}>View only</AppText></View>{betweenOthers.map((transfer) => <View key={transfer.from} style={styles.otherTransferRow}><View style={styles.otherTransferPeople}><Image source={tripMembers[transfer.fromIndex].image} resizeMode="cover" style={styles.settleAvatarSmall} /><ArrowRight size={18} color={palette.inkSoft} strokeWidth={1.7} /><Image source={tripMembers[transfer.toIndex].image} resizeMode="cover" style={styles.settleAvatarSmall} /></View><AppText variant="h6" style={styles.otherTransferLabel}>{transfer.from} → {transfer.to}</AppText><AppText variant="h6">{transfer.amount}</AppText><View style={styles.transferPendingDot} /></View>)}</View>
      </View>

      <AppText variant="overline" style={styles.settleSectionLabel}>EACH PERSON’S BALANCE</AppText>
      <View>{balances.map((balance) => <View key={balance.name} style={styles.personBalanceRow}><Image source={tripMembers[balance.memberIndex].image} resizeMode="cover" style={styles.settleAvatarSmall} /><View style={styles.personBalanceCopy}><AppText variant="h6">{balance.name}</AppText><AppText variant="supporting" color={palette.inkSoft}>{balance.detail}</AppText></View><View style={[styles.personBalanceAmount, balance.positive ? styles.personBalancePositive : styles.personBalanceNegative]}><AppText variant="label" color={balance.positive ? palette.success : '#C35B43'}>{balance.amount}</AppText></View></View>)}</View>
    </ScrollView>
  </BottomSheet><MarkPaidSheet visible={visible && markPaidOpen} onClose={() => setMarkPaidOpen(false)} onConfirm={() => { setSent(true); setMarkPaidOpen(false); }} /></>;
}

function MarkPaidSheet({ visible, onClose, onConfirm }: { visible: boolean; onClose: () => void; onConfirm: () => void }) {
  const [method, setMethod] = useState<string | null>(null);
  const methods = ['Cash App', 'Venmo', 'PayPal', 'Zelle', 'Cash', 'Other'];
  const close = () => { setMethod(null); onClose(); };
  const confirm = () => { if (!method) return; onConfirm(); setMethod(null); };
  return <BottomSheet visible={visible} title="How was this expense paid?" subtitle="We’ll keep this for your records and mark the transfer as paid. Gums won’t get a payment reminder." onClose={close} bottomInset={76} topInset={20} showClose={false}>
    <View style={styles.markPaidContent}><View style={styles.markPaidMethods}>{methods.map((item) => { const selected = method === item; return <Pressable key={item} accessibilityRole="radio" accessibilityState={{ selected }} onPress={() => setMethod(item)} style={({ pressed }) => [styles.markPaidMethod, selected && styles.markPaidMethodSelected, pressed && styles.pressed]}><View style={[styles.markPaidRadio, selected && styles.markPaidRadioSelected]}>{selected ? <View style={styles.markPaidRadioDot} /> : null}</View><AppText variant="body">{item}</AppText></Pressable>; })}</View><AppText variant="caption" color={palette.inkSoft}>TripUp is not affiliated with Cash App, Venmo, PayPal, Zelle, or any other third-party payment service.</AppText><View style={styles.markPaidActions}><Button label="Mark as paid" fullWidth disabled={!method} onPress={confirm} style={!method && styles.buttonDisabled} /><Button label="Close" tone="secondary" fullWidth onPress={close} /></View></View>
  </BottomSheet>;
}

type ExpenseGuideStep = 'idle' | 'tab' | 'add' | 'scan' | 'line-items' | 'edit-participants';

function AddExpenseSheet({ visible, startScanned, initialName, guideStep, onScan, onOpenLineItems, onOpenParticipants, onClose, onSave }: { visible: boolean; startScanned: boolean; initialName?: string; guideStep: ExpenseGuideStep; onScan: () => void; onOpenLineItems: () => void; onOpenParticipants: () => void; onClose: () => void; onSave: () => void }) {
  type SplitMode = 'Split equally between' | 'By percentage' | 'By exact amount' | 'Shares';
  const categories = ['Food & Drinks', 'Transport', 'Tickets', 'Stay'];
  const splitModes: SplitMode[] = ['Split equally between', 'By percentage', 'By exact amount', 'Shares'];
  const [amount, setAmount] = useState(startScanned ? '49.50' : '0.00');
  const [expenseName, setExpenseName] = useState(startScanned ? 'Dinner at CRC Lisboa' : initialName ?? '');
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [payerIndices, setPayerIndices] = useState([4]);
  const [payerPickerOpen, setPayerPickerOpen] = useState(false);
  const [coverOpen, setCoverOpen] = useState(false);
  const [splitMode, setSplitMode] = useState<SplitMode>('Split equally between');
  const [splitMembers, setSplitMembers] = useState([0, 1, 2, 3]);
  const [percentages, setPercentages] = useState([25, 25, 25, 25, 0]);
  const [exactAmounts, setExactAmounts] = useState(['0.00', '0.00', '0.00', '0.00', '0.00']);
  const [shares, setShares] = useState([1, 1, 1, 1, 1]);
  const [scanned, setScanned] = useState(startScanned);
  const [editingLineItems, setEditingLineItems] = useState(false);
  const [lineItemsExpanded, setLineItemsExpanded] = useState(false);
  const [lineItems, setLineItems] = useState<{ name: string; amount: string }[]>(() => scannedReceiptItems.map(({ name, amount: itemAmount }) => ({ name, amount: itemAmount })));
  const [lineItemMembers, setLineItemMembers] = useState<number[][]>(() => scannedReceiptItems.map(() => [0, 1, 2, 3, 4]));
  const [scanReveal] = useState(() => new Animated.Value(0));
  const [lineEditReveal] = useState(() => new Animated.Value(0));
  const expenseScrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const lineItemsYRef = useRef(0);
  const canSave = Boolean(expenseName.trim()) && Number.parseFloat(amount) > 0;

  useEffect(() => {
    if (!scanned) {
      scanReveal.setValue(0);
      return;
    }
    Animated.timing(scanReveal, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [scanReveal, scanned]);

  useEffect(() => {
    if (!editingLineItems) {
      lineEditReveal.setValue(0);
      return;
    }
    Animated.timing(lineEditReveal, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [editingLineItems, lineEditReveal]);

  const scanReceipt = () => {
    onScan();
    setAmount('49.50');
    setExpenseName('Dinner at CRC Lisboa');
    setCategoryIndex(0);
    setScanned(true);
    setEditingLineItems(false);
    setLineItemsExpanded(false);
  };

  const returnToManualExpense = () => {
    setScanned(false);
    setAmount('0.00');
    setExpenseName('');
    setEditingLineItems(false);
    setLineItemsExpanded(false);
  };

  const openLineItems = () => {
    setLineItemsExpanded(true);
    onOpenLineItems();
    setTimeout(() => expenseScrollRef.current?.scrollTo({ y: Math.max(0, lineItemsYRef.current - 18), animated: true }), 120);
  };

  const openParticipantEditor = () => {
    onOpenParticipants();
    setEditingLineItems(true);
  };

  const closeParticipantEditor = () => {
    const detectedTotal = lineItems.reduce((total, item) => total + (Number.parseFloat(item.amount) || 0), 0);
    setAmount(detectedTotal.toFixed(2));
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      const showReview = () => {
        setEditingLineItems(false);
        setLineItemsExpanded(true);
        setTimeout(() => expenseScrollRef.current?.scrollTo({ y: Math.max(0, lineItemsYRef.current - 18), animated: !reduceMotion }), 160);
      };
      if (reduceMotion) {
        showReview();
        return;
      }
      Animated.timing(lineEditReveal, { toValue: 0, duration: 140, easing: Easing.in(Easing.quad), useNativeDriver: true }).start(({ finished }) => {
        if (finished) showReview();
      });
    });
  };

  const toggleLineItemMember = (lineIndex: number, memberIndex: number) => {
    setLineItemMembers((current) => current.map((members, index) => {
      if (index !== lineIndex) return members;
      if (members.includes(memberIndex)) return members.length === 1 ? members : members.filter((item) => item !== memberIndex);
      return [...members, memberIndex].sort((left, right) => left - right);
    }));
  };

  const resetAndClose = () => {
    setAmount('0.00');
    setExpenseName('');
    setCategoryIndex(0);
    setCategoryPickerOpen(false);
    setPayerIndices([4]);
    setPayerPickerOpen(false);
    setCoverOpen(false);
    setSplitMode('Split equally between');
    setSplitMembers([0, 1, 2, 3]);
    setPercentages([25, 25, 25, 25, 0]);
    setExactAmounts(['0.00', '0.00', '0.00', '0.00', '0.00']);
    setShares([1, 1, 1, 1, 1]);
    setScanned(false);
    setEditingLineItems(false);
    setLineItemsExpanded(false);
    setLineItems(scannedReceiptItems.map(({ name, amount: itemAmount }) => ({ name, amount: itemAmount })));
    setLineItemMembers(scannedReceiptItems.map(() => [0, 1, 2, 3, 4]));
    onClose();
  };

  const toggleSplitMember = (memberIndex: number) => setSplitMembers((current) => current.includes(memberIndex) ? current.filter((index) => index !== memberIndex) : [...current, memberIndex]);
  const togglePayer = (memberIndex: number) => setPayerIndices((current) => current.includes(memberIndex) ? current.filter((index) => index !== memberIndex) : [...current, memberIndex]);

  if (editingLineItems) return <BottomSheet visible={visible} onClose={resetAndClose} bottomInset={76} topInset={108} showClose={false}>
    <ScrollView key="line-item-allocation-page" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.lineItemPageContent}>
      <Animated.View style={[styles.lineItemPageHeader, { opacity: lineEditReveal, transform: [{ translateX: lineEditReveal.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }]}><Pressable accessibilityRole="button" accessibilityLabel="Back to scan bill" hitSlop={8} onPress={closeParticipantEditor} style={({ pressed }) => [styles.lineItemPageBack, pressed && styles.pressed]}><ArrowLeft size={21} color={palette.navy} strokeWidth={1.8} /><AppText variant="action" color={palette.navy}>Back to scan bill</AppText></Pressable><View style={styles.lineItemPageTitle}><AppText variant="h4">Item participants</AppText><AppText variant="supporting" color={palette.inkSoft}>Exclude anyone who didn’t share the scanned bill.</AppText></View></Animated.View>
      <Animated.View style={[styles.lineItemCards, { opacity: lineEditReveal, transform: [{ translateX: lineEditReveal.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }]}>{lineItems.map((item, lineIndex) => <View key={`${lineIndex}-${item.name}`} style={styles.lineItemCard}>
        <View style={styles.lineItemCardFields}><TextInput accessibilityLabel={`Line item ${lineIndex + 1} name`} value={item.name} onChangeText={(value) => setLineItems((current) => current.map((line, index) => index === lineIndex ? { ...line, name: value } : line))} style={styles.lineItemCardNameInput} /><View style={styles.lineItemCardAmount}><AppText variant="body" color={palette.navy}>€</AppText><TextInput accessibilityLabel={`${item.name} amount`} inputMode="decimal" value={item.amount} onChangeText={(value) => setLineItems((current) => current.map((line, index) => index === lineIndex ? { ...line, amount: value } : line))} style={styles.lineItemCardAmountInput} /></View></View>
        <AppText variant="overline" color={palette.inkSoft}>PARTICIPANTS FOR THIS ITEM</AppText>
        <View style={styles.lineItemMemberList}>{tripMembers.map((member, memberIndex) => { const included = lineItemMembers[lineIndex].includes(memberIndex); return <Pressable key={member.name} accessibilityRole="button" accessibilityLabel={`${included ? 'Exclude' : 'Include'} ${member.name} from ${item.name}`} accessibilityState={{ selected: included }} onPress={() => toggleLineItemMember(lineIndex, memberIndex)} style={({ pressed }) => [styles.lineItemMemberChip, included && styles.lineItemMemberChipIncluded, !included && styles.lineItemMemberChipExcluded, pressed && styles.pressed]}><Image source={member.image} style={styles.lineItemMemberAvatar} /><AppText variant="label" color={included ? palette.ink : palette.inkSoft}>{member.name}</AppText>{included ? <X size={14} color={palette.inkSoft} strokeWidth={1.8} /> : <Plus size={14} color={palette.navy} strokeWidth={1.8} />}</Pressable>; })}</View>
        <AppText variant="supporting" color={palette.inkSoft}>{lineItemMembers[lineIndex].length} of {tripMembers.length} people included</AppText>
      </View>)}</Animated.View>
      <Button label="Save line items" fullWidth onPress={closeParticipantEditor} style={styles.lineItemSaveButton} />
    </ScrollView>
  </BottomSheet>;

  return <><BottomSheet visible={visible} onClose={resetAndClose} bottomInset={76} topInset={108} showClose={false}>
    <ScrollView ref={expenseScrollRef} key="expense-review-page" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.addExpenseContent}>
      {scanned ? <View style={styles.scanResultHeader}><Pressable accessibilityRole="button" accessibilityLabel="Back to Add expense" hitSlop={8} onPress={returnToManualExpense} style={({ pressed }) => [styles.scanResultBack, pressed && styles.pressed]}><ArrowLeft size={21} color={palette.navy} strokeWidth={1.8} /><AppText variant="action">Back to Add expense</AppText></Pressable><AppText variant="h2">Scan bill</AppText></View> : <View style={styles.addExpenseHeader}><AppText variant="h2">Add expense</AppText><Pressable accessibilityRole="button" accessibilityLabel="Scan bill" onPress={scanReceipt} style={({ pressed }) => [styles.addExpenseHeaderIcon, pressed && styles.pressed]}><ScanLine size={23} color={palette.white} strokeWidth={1.8} /><GuidePulse visible={guideStep === 'scan'} /></Pressable></View>}

      {scanned ? <Animated.View style={[styles.scannedReceiptBlock, { opacity: scanReveal, transform: [{ translateY: scanReveal.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>
        <View style={styles.scannedReceiptCapture}><Image source={scannedReceiptImage} resizeMode="cover" style={styles.scannedReceiptImage} /><LinearGradient colors={['rgba(9,29,54,.72)', 'rgba(9,29,54,0)']} style={styles.scannedReceiptDisclaimer}><AppText variant="caption" color={palette.white}>For representation purpose only</AppText></LinearGradient></View>
        <View style={styles.scannedReceiptDetected}><AppText variant="body">{lineItems.length} items detected</AppText><View style={styles.scannedReceiptLineItemsTarget}><Button label="Line items" tone="tertiary" onPress={openLineItems} style={styles.scannedReceiptLineItemsAction} /><GuidePulse visible={guideStep === 'line-items'} /></View></View>
      </Animated.View> : null}

      <View style={[styles.addExpenseAmountRow, scanned && styles.addExpenseAmountRowScanned]}><AppText variant="h2" color={scanned ? palette.navy : palette.ink}>€</AppText><TextInput accessibilityLabel="Expense amount" inputMode="decimal" value={amount} onChangeText={setAmount} selectTextOnFocus style={[styles.addExpenseAmountInput, scanned && styles.addExpenseAmountInputScanned]} /></View>
      <TextInput accessibilityLabel="Expense name" placeholder="Expense name" placeholderTextColor={palette.inkSoft} value={expenseName} onChangeText={setExpenseName} style={styles.addExpenseNameInput} />

      <AppText variant="h5" style={styles.addExpenseSectionTitle}>Category</AppText>
      <View style={styles.addExpenseCategoryRow}><View accessibilityLabel={`Selected category: ${categories[categoryIndex]}`} style={styles.addExpenseCategory}><AppText variant="pill">{categories[categoryIndex]}</AppText></View><Pressable accessibilityRole="button" accessibilityLabel="Edit expense category" onPress={() => setCategoryPickerOpen(true)} style={({ pressed }) => [styles.addExpenseCategoryEdit, pressed && styles.pressed]}><Pencil size={18} color={palette.navy} strokeWidth={1.8} /></Pressable></View>

      <AppText variant="h5" style={styles.addExpenseSectionTitle}>Paid by</AppText>
      <View style={styles.addExpensePayers}>{payerIndices.map((memberIndex) => <MemberToggleAvatar key={tripMembers[memberIndex].name} memberIndex={memberIndex} active context="payer" onToggle={() => togglePayer(memberIndex)} />)}<Pressable accessibilityRole="button" accessibilityLabel="Add a payer" onPress={() => setPayerPickerOpen(true)} style={({ pressed }) => [styles.expensePayerAddButton, pressed && styles.pressed]}><Plus size={24} color={palette.navy} strokeWidth={1.8} /></Pressable></View>

      <Pressable accessibilityRole="button" accessibilityLabel={`Split mode: ${splitMode}`} accessibilityState={{ expanded: coverOpen }} onPress={() => setCoverOpen((open) => !open)} style={({ pressed }) => [styles.addExpenseCover, pressed && styles.pressed]}><AppText variant="body">{splitMode}</AppText><ChevronDown size={20} color={palette.ink} strokeWidth={1.8} /></Pressable>
      {coverOpen ? <View style={styles.addExpenseCoverOptions}>{splitModes.map((option) => <Pressable accessibilityRole="button" accessibilityState={{ selected: splitMode === option }} key={option} onPress={() => { setSplitMode(option); setCoverOpen(false); }} style={({ pressed }) => [styles.addExpenseCoverOption, splitMode === option && styles.addExpenseCoverOptionActive, pressed && styles.pressed]}><AppText variant="action" color={splitMode === option ? palette.white : palette.ink}>{option}</AppText></Pressable>)}</View> : null}

      {splitMode === 'Split equally between' ? <View style={styles.expenseSplitEqual}>{tripMembers.map((_, memberIndex) => <MemberToggleAvatar key={tripMembers[memberIndex].name} memberIndex={memberIndex} active={splitMembers.includes(memberIndex)} context="split" onToggle={() => toggleSplitMember(memberIndex)} />)}</View> : null}

      {splitMode === 'By percentage' ? <View style={styles.expenseSplitList}>{tripMembers.map((_, memberIndex) => { const active = splitMembers.includes(memberIndex); return <View key={tripMembers[memberIndex].name} style={[styles.expenseSplitRow, !active && styles.expenseSplitRowInactive]}><MemberToggleAvatar memberIndex={memberIndex} active={active} context="split" onToggle={() => toggleSplitMember(memberIndex)} /><Pressable accessibilityRole="adjustable" accessibilityLabel={`${tripMembers[memberIndex].name} percentage`} accessibilityState={{ disabled: !active }} disabled={!active} accessibilityValue={{ min: 0, max: 100, now: percentages[memberIndex], text: `${percentages[memberIndex]} percent` }} onPress={() => setPercentages((current) => current.map((value, index) => index === memberIndex ? (value >= 100 ? 0 : value + 5) : value))} style={styles.expensePercentControl}><AppText variant="h6" style={styles.expenseSplitValue}>{percentages[memberIndex]}%</AppText><View style={styles.expensePercentTrack}><View style={[styles.expensePercentFill, { width: `${percentages[memberIndex]}%` }]} /><View style={[styles.expensePercentKnob, { left: `${percentages[memberIndex]}%` }]} /></View></Pressable></View>; })}</View> : null}

      {splitMode === 'By exact amount' ? <View style={styles.expenseSplitList}>{tripMembers.map((_, memberIndex) => { const active = splitMembers.includes(memberIndex); return <View key={tripMembers[memberIndex].name} style={[styles.expenseSplitRow, !active && styles.expenseSplitRowInactive]}><MemberToggleAvatar memberIndex={memberIndex} active={active} context="split" onToggle={() => toggleSplitMember(memberIndex)} /><View style={styles.expenseExactControl}><AppText variant="body">€</AppText><TextInput accessibilityLabel={`${tripMembers[memberIndex].name} exact amount`} editable={active} inputMode="decimal" value={exactAmounts[memberIndex]} onChangeText={(value) => setExactAmounts((current) => current.map((amountValue, index) => index === memberIndex ? value : amountValue))} style={styles.expenseExactInput} /></View></View>; })}</View> : null}

      {splitMode === 'Shares' ? <View style={styles.expenseSplitList}>{tripMembers.map((_, memberIndex) => { const active = splitMembers.includes(memberIndex); return <View key={tripMembers[memberIndex].name} style={[styles.expenseSplitRow, !active && styles.expenseSplitRowInactive]}><MemberToggleAvatar memberIndex={memberIndex} active={active} context="split" onToggle={() => toggleSplitMember(memberIndex)} /><View style={styles.expenseShareControl}><Pressable accessibilityRole="button" accessibilityLabel={`Decrease ${tripMembers[memberIndex].name} shares`} hitSlop={4} disabled={!active || shares[memberIndex] <= 0} onPress={() => setShares((current) => current.map((value, index) => index === memberIndex ? Math.max(0, value - 1) : value))} style={({ pressed }) => [styles.expenseShareButton, (!active || shares[memberIndex] <= 0) && styles.controlDisabled, pressed && styles.pressed]}><Minus size={17} color={palette.ink} strokeWidth={1.7} /></Pressable><AppText variant="h6">{active ? shares[memberIndex] : 0}</AppText><Pressable accessibilityRole="button" accessibilityLabel={`Increase ${tripMembers[memberIndex].name} shares`} hitSlop={4} disabled={!active} onPress={() => setShares((current) => current.map((value, index) => index === memberIndex ? value + 1 : value))} style={({ pressed }) => [styles.expenseShareButton, !active && styles.controlDisabled, pressed && styles.pressed]}><Plus size={17} color={palette.ink} strokeWidth={1.7} /></Pressable></View></View>; })}</View> : null}

      {scanned ? <View onLayout={(event) => { lineItemsYRef.current = event.nativeEvent.layout.y; }} style={styles.detectedLineItems}><Pressable accessibilityRole="button" accessibilityState={{ expanded: lineItemsExpanded }} accessibilityLabel={`${lineItemsExpanded ? 'Hide' : 'View'} detected line items`} onPress={() => setLineItemsExpanded((expanded) => !expanded)} style={({ pressed }) => [styles.detectedLineItemsHeader, pressed && styles.pressed]}><View><AppText variant="h5">View line items</AppText><AppText variant="supporting" color={palette.inkSoft}>{lineItems.length} detected</AppText></View><ChevronDown size={20} color={palette.inkSoft} strokeWidth={1.8} style={lineItemsExpanded ? styles.detectedLineItemsChevronOpen : undefined} /></Pressable>{lineItemsExpanded ? <><View style={styles.detectedLineItemsToolbar}><View style={styles.detectedLineItemsToolbarCopy}><AppText variant="h6">Line item details</AppText><AppText variant="supporting" color={palette.inkSoft}>Edit names, prices and participants</AppText></View><Pressable accessibilityRole="button" accessibilityLabel="Edit line item details" onPress={openParticipantEditor} style={({ pressed }) => [styles.detectedLineItemsEditParticipants, pressed && styles.pressed]}><Pencil size={17} color={palette.navy} strokeWidth={1.8} /><AppText variant="action" color={palette.navy}>Edit</AppText><GuidePulse visible={guideStep === 'edit-participants'} /></Pressable></View><View style={styles.detectedLineItemsList}>{lineItems.map((item, lineIndex) => { const excluded = tripMembers.filter((_, memberIndex) => !lineItemMembers[lineIndex].includes(memberIndex)); return <View key={`${lineIndex}-${item.name}`} style={styles.detectedLineItemRow}><View style={styles.detectedLineItemCopy}><AppText variant="h6">{item.name}</AppText><AppText variant="supporting" color={palette.inkSoft}>{scannedReceiptItems[lineIndex]?.quantity ?? 1} ×</AppText></View><View style={styles.detectedLineItemMeta}><AppText variant="h6">€{item.amount}</AppText><AppText variant="supporting" color={palette.inkSoft}>{excluded.length === 0 ? 'Shared by all' : `${excluded.map((member) => member.name).join(' & ')} excluded`}</AppText></View></View>; })}</View></> : null}</View> : null}

              <Button label={scanned ? 'Save expense' : 'Add expense'} fullWidth disabled={!canSave} onPress={onSave} style={[styles.addExpenseSubmit, scanned && styles.finishEditingButton, !canSave && styles.controlDisabled]} />
    </ScrollView>
  </BottomSheet><BottomSheet visible={categoryPickerOpen} title="Category" subtitle="Choose the best match for this expense." onClose={() => setCategoryPickerOpen(false)} bottomInset={76} sheetHeight={294} showClose={false}>
    <View style={styles.expenseCategoryPicker}>{categories.map((category, index) => { const selected = categoryIndex === index; return <Pressable key={category} accessibilityRole="radio" accessibilityState={{ selected }} accessibilityLabel={`${category}${selected ? ', selected' : ''}`} onPress={() => { setCategoryIndex(index); setCategoryPickerOpen(false); }} style={({ pressed }) => [styles.expenseCategoryOption, selected && styles.expenseCategoryOptionSelected, pressed && styles.pressed]}><AppText variant="body" color={selected ? palette.navy : palette.ink}>{category}</AppText>{selected ? <Check size={18} color={palette.navy} strokeWidth={2} /> : null}</Pressable>; })}</View>
  </BottomSheet><BottomSheet visible={payerPickerOpen} title="Who paid?" subtitle="Select one or more people." onClose={() => setPayerPickerOpen(false)} bottomInset={76} sheetHeight={244} showClose={false}>
    <View style={styles.payerPickerContent}><View style={styles.payerPickerMembers}>{tripMembers.map((member, memberIndex) => <View key={member.name} style={styles.payerPickerMember}><MemberToggleAvatar memberIndex={memberIndex} active={payerIndices.includes(memberIndex)} context="payer" onToggle={() => togglePayer(memberIndex)} /><AppText variant="caption" color={palette.inkSoft}>{member.name}</AppText></View>)}</View><Button label="Done" fullWidth disabled={payerIndices.length === 0} onPress={() => setPayerPickerOpen(false)} style={payerIndices.length === 0 && styles.controlDisabled} /></View>
  </BottomSheet></>;
}

function MemberToggleAvatar({ memberIndex, active, context, onToggle }: { memberIndex: number; active: boolean; context: 'payer' | 'split'; onToggle: () => void }) {
  const member = tripMembers[memberIndex];
  const label = active ? `Exclude ${member.name} as ${context === 'payer' ? 'payer' : 'participant'}` : `Add ${member.name} as ${context === 'payer' ? 'payer' : 'participant'}`;
  return <View accessibilityLabel={member.name} style={[styles.splitMemberAvatarWrap, !active && styles.memberToggleInactive]}><Image source={member.image} resizeMode="cover" style={styles.splitMemberAvatar} /><Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: active }} hitSlop={7} onPress={onToggle} style={({ pressed }) => [styles.splitMemberToggle, active && styles.splitMemberToggleActive, pressed && styles.pressed]}>{active ? <Minus size={14} color={palette.ink} strokeWidth={1.8} /> : <Plus size={14} color={palette.navy} strokeWidth={1.8} />}</Pressable></View>;
}

function ManageTabsSheet({ visible, orderedTabs, enabledTabs, onClose, onToggle, onMove }: { visible: boolean; orderedTabs: TripTab[]; enabledTabs: OptionalTripTab[]; onClose: () => void; onToggle: (tab: OptionalTripTab) => void; onMove: (tab: TripTab, direction: -1 | 1) => void }) {
  return <BottomSheet visible={visible} title="Customize tabs" subtitle="Choose what appears, then arrange the order." onClose={onClose} bottomInset={76} sheetHeight={530}>
    <View style={styles.manageTabsContent}>
      <View style={styles.manageTabsList}>{orderedTabs.map((tab, index) => {
        const locked = tab === 'Overview' || tab === 'Plan' || tab === 'Expenses';
        const enabled = locked || enabledTabs.includes(tab as OptionalTripTab);
        const cannotMoveEarlier = index <= 1;
        const cannotMoveLater = tab === 'Overview' || index === orderedTabs.length - 1;
        return <View key={tab} style={styles.manageTabRow}><GripVertical size={18} color={palette.inkSoft} strokeWidth={1.6} /><View style={styles.manageTabCopy}><AppText variant="h6">{tab}</AppText><AppText variant="supporting" color={palette.inkSoft}>{locked ? 'Always shown' : enabled ? 'Shown in trip tabs' : 'Hidden from trip tabs'}</AppText></View><View style={styles.manageTabOrder}><Pressable accessibilityRole="button" accessibilityLabel={`Move ${tab} earlier`} disabled={cannotMoveEarlier} onPress={() => onMove(tab, -1)} style={({ pressed }) => [styles.manageTabOrderButton, cannotMoveEarlier && styles.manageTabControlDisabled, pressed && styles.pressed]}><ArrowUp size={17} color={palette.inkSoft} strokeWidth={1.7} /></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`Move ${tab} later`} disabled={cannotMoveLater} onPress={() => onMove(tab, 1)} style={({ pressed }) => [styles.manageTabOrderButton, cannotMoveLater && styles.manageTabControlDisabled, pressed && styles.pressed]}><ArrowDown size={17} color={palette.inkSoft} strokeWidth={1.7} /></Pressable></View>{locked ? <View accessibilityLabel={`${tab} is always shown`} style={styles.manageTabLocked}><LockKeyhole size={18} color={palette.inkSoft} strokeWidth={1.7} /></View> : <Pressable accessibilityRole="button" accessibilityLabel={`${enabled ? 'Remove' : 'Add'} ${tab} tab`} onPress={() => onToggle(tab as OptionalTripTab)} style={({ pressed }) => [styles.manageTabToggle, enabled && styles.manageTabToggleActive, pressed && styles.pressed]}>{enabled ? <Minus size={19} color={palette.navy} strokeWidth={1.8} /> : <Plus size={19} color={palette.white} strokeWidth={1.8} />}</Pressable>}</View>;
      })}</View>
    </View>
  </BottomSheet>;
}

function TripOverview({ visibleTabs, pollActive, pollVoted, onOpenTab, onOpenPoll }: { visibleTabs: TripTab[]; pollActive: boolean; pollVoted: boolean; onOpenTab: (tab: TripTab) => void; onOpenPoll: () => void }) {
  const highlights = visibleTabs.filter((tab) => tab !== 'Overview').sort((left, right) => left === 'Expenses' ? -1 : right === 'Expenses' ? 1 : 0);
  return <View style={styles.overviewPage}>
    <View style={styles.overviewHero}>
      <View style={styles.overviewHeroTop}><View><AppText variant="overline" color={palette.sky}>FINAL DAY · 22 NOV</AppText><AppText variant="h3" style={styles.overviewHeroTitle}>Your Lisbon trip, at a glance</AppText></View><View style={styles.overviewDayBadge}><AppText variant="h5">12</AppText><AppText variant="supporting" color={palette.inkSoft}>days</AppText></View></View>
      <View style={styles.overviewProgressTrack}><View style={styles.overviewProgressFill} /></View>
      <AppText variant="supporting" color={palette.inkSoft}>11 days explored · one final day together</AppText>
      <Pressable accessibilityRole="link" accessibilityLabel="Add memories to your Lisbon trip" onPress={() => router.replace('/memories')} style={({ pressed }) => [styles.overviewMemoriesLink, pressed && styles.pressed]}><AppText variant="action" color={palette.sky}>Add memories to your Lisbon trip</AppText><ChevronRight size={17} color={palette.sky} strokeWidth={1.8} /></Pressable>
    </View>
    {pollActive ? <Pressable accessibilityRole="button" accessibilityLabel="Open active dinner poll" onPress={onOpenPoll} style={({ pressed }) => [styles.overviewPollCard, pressed && styles.overviewCardPressed]}><View style={styles.overviewPollIcon}><AppText variant="h5" color={palette.white}>?</AppText></View><View style={styles.overviewCardHeading}><AppText variant="overline" color={palette.violet}>ACTIVE GROUP POLL</AppText><AppText variant="h6">Where should we eat tonight?</AppText><AppText variant="supporting" color={palette.inkSoft}>{pollVoted ? 'Cervejaria Ramiro leading with 3 votes' : 'No votes yet · closes in 15 minutes'}</AppText></View><ChevronRight size={20} color={palette.inkSoft} strokeWidth={1.7} /></Pressable> : null}
    <View style={styles.overviewSectionHeading}><AppText variant="h5">Your trip highlights</AppText></View>
    <View style={styles.overviewHighlights}>{highlights.map((tab) => <OverviewHighlight key={tab} tab={tab} onPress={() => onOpenTab(tab)} />)}</View>
  </View>;
}

function OverviewHighlight({ tab, onPress }: { tab: Exclude<TripTab, 'Overview'>; onPress: () => void }) {
  if (tab === 'Plan') return <Pressable accessibilityRole="button" accessibilityLabel="Open Plan: three activities on the final day" onPress={onPress} style={({ pressed }) => [styles.overviewCard, pressed && styles.overviewCardPressed]}><View style={styles.overviewCardHeader}><View style={[styles.overviewIcon, styles.overviewIconBlue]}><CalendarPlus size={19} color={palette.sky} strokeWidth={1.8} /></View><View style={styles.overviewCardHeading}><AppText variant="overline" color={palette.coral}>PLAN · FINAL DAY</AppText><AppText variant="h5">3 moments before goodbye</AppText></View><ChevronRight size={20} color={palette.inkSoft} strokeWidth={1.7} /></View><View style={styles.overviewPlanPreview}><Image source={{ uri: activityImageFor('Jerónimos Monastery', 'Attractions') }} style={styles.overviewPlanImage} /><View style={styles.overviewPlanCopy}><AppText variant="supporting" color={palette.inkSoft}>09:30 · Belém</AppText><AppText variant="h6">Jerónimos Monastery</AppText><AppText variant="supporting" color={palette.inkSoft}>First of today’s plans</AppText></View></View></Pressable>;
  if (tab === 'Expenses') return <Pressable accessibilityRole="button" accessibilityLabel="Open Expenses: 899 euros spent" onPress={onPress} style={({ pressed }) => [styles.overviewCard, pressed && styles.overviewCardPressed]}><View style={styles.overviewCardHeader}><View style={[styles.overviewIcon, styles.overviewIconMint]}><ReceiptText size={19} color={palette.success} strokeWidth={1.8} /></View><View style={styles.overviewCardHeading}><AppText variant="overline" color={palette.success}>EXPENSES</AppText><AppText variant="h5">€899 spent together</AppText></View><ChevronRight size={20} color={palette.inkSoft} strokeWidth={1.7} /></View><View style={styles.overviewMetricRow}><View style={styles.overviewMetric}><AppText variant="h4">€8,743</AppText><AppText variant="supporting" color={palette.inkSoft}>budget left</AppText></View><View style={styles.overviewMetricDivider} /><View style={styles.overviewMetric}><AppText variant="h4">3</AppText><AppText variant="supporting" color={palette.inkSoft}>transfers to settle</AppText></View></View></Pressable>;
  if (tab === 'Saved') return <Pressable accessibilityRole="button" accessibilityLabel="Open 10 saved places in Lisbon" onPress={onPress} style={({ pressed }) => [styles.overviewCard, pressed && styles.overviewCardPressed]}><View style={styles.overviewCardHeader}><View style={[styles.overviewIcon, styles.overviewIconViolet]}><Bookmark size={19} color={palette.violet} strokeWidth={1.8} /></View><View style={styles.overviewCardHeading}><AppText variant="overline" color={palette.violet}>SAVED</AppText><AppText variant="h5">10 Lisbon places</AppText></View><ChevronRight size={20} color={palette.inkSoft} strokeWidth={1.7} /></View><View style={styles.overviewSavedStrip}>{[savedPlaces[0], savedAttractions[0], savedPlaces[1]].map((place) => <Image key={place.id} source={{ uri: place.image }} style={styles.overviewSavedImage} />)}<View style={styles.overviewSavedMore}><AppText variant="label" color={palette.ink}>+7</AppText></View></View><AppText variant="supporting" color={palette.inkSoft} style={styles.overviewCardFooter}>Restaurants, landmarks and museums for the group</AppText></Pressable>;
  if (tab === 'Guides') return <Pressable accessibilityRole="button" accessibilityLabel="Open Lisbon Guides" onPress={onPress} style={({ pressed }) => [styles.overviewCard, pressed && styles.overviewCardPressed]}><View style={styles.overviewCardHeader}><View style={[styles.overviewIcon, styles.overviewIconSand]}><Map size={19} color="#B46B16" strokeWidth={1.8} /></View><View style={styles.overviewCardHeading}><AppText variant="overline" color="#A86113">GUIDES</AppText><AppText variant="h5">Lisbon essentials</AppText></View><ChevronRight size={20} color={palette.inkSoft} strokeWidth={1.7} /></View><View style={styles.overviewGuideTags}><Pill label="Getting around" compact /><Pill label="Local etiquette" compact /><Pill label="Belém" compact /></View><AppText variant="supporting" color={palette.inkSoft} style={styles.overviewCardFooter}>3 guides saved for offline use</AppText></Pressable>;
  return <Pressable accessibilityRole="button" accessibilityLabel="Open Trip Journal" onPress={onPress} style={({ pressed }) => [styles.overviewCard, pressed && styles.overviewCardPressed]}><View style={styles.overviewCardHeader}><View style={[styles.overviewIcon, styles.overviewIconCoral]}><NotebookPen size={19} color={palette.coral} strokeWidth={1.8} /></View><View style={styles.overviewCardHeading}><AppText variant="overline" color={palette.coral}>JOURNAL</AppText><AppText variant="h5">28 memories from Lisbon</AppText></View><ChevronRight size={20} color={palette.inkSoft} strokeWidth={1.7} /></View><View style={styles.overviewJournalRow}><Image source={{ uri: savedAttractions[1].image }} style={styles.overviewJournalImage} /><View style={styles.overviewPlanCopy}><AppText variant="h6">Tram rides and tiled streets</AppText><AppText variant="supporting" color={palette.inkSoft}>4 photos · yesterday</AppText></View></View></Pressable>;
}

function SavedLisbon() {
  const [filter, setFilter] = useState<'All' | 'Food' | 'Attractions'>('All');
  const [savedIds, setSavedIds] = useState(() => new Set([...savedPlaces.map((place) => place.id), ...savedAttractions.map((place) => place.id)]));
  const visibleFood = filter !== 'Attractions';
  const visibleAttractions = filter !== 'Food';
  const toggleSaved = (id: string) => setSavedIds((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  return <View style={styles.savedPage}>
    <View style={styles.savedIntro}><View><AppText variant="h3">Saved for Lisbon</AppText><AppText variant="body" color={palette.inkSoft}>{savedIds.size} places shared with your group</AppText></View><View style={styles.savedIntroIcon}><Bookmark size={20} color={palette.violet} fill={palette.violetSoft} strokeWidth={1.8} /></View></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.savedFilters}>{(['All', 'Food', 'Attractions'] as const).map((item) => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: filter === item }} onPress={() => setFilter(item)} style={({ pressed }) => [styles.savedFilter, filter === item && styles.savedFilterActive, pressed && styles.pressed]}><AppText variant="pill" color={filter === item ? palette.white : palette.ink}>{item === 'Food' ? 'Food & drink' : item}</AppText></Pressable>)}</ScrollView>
    {visibleFood ? <SavedSection title="FOOD & DRINK" subtitle="5 places" places={savedPlaces} savedIds={savedIds} onToggle={toggleSaved} /> : null}
    {visibleAttractions ? <SavedSection title="ATTRACTIONS" subtitle="5 places" places={savedAttractions} savedIds={savedIds} onToggle={toggleSaved} /> : null}
  </View>;
}

function SavedSection({ title, subtitle, places, savedIds, onToggle }: { title: string; subtitle: string; places: readonly SavedCardItem[]; savedIds: Set<string>; onToggle: (id: string) => void }) {
  return <View style={styles.savedSection}><View style={styles.savedSectionHeader}><AppText variant="overline">{title}</AppText><AppText variant="supporting" color={palette.inkSoft}>{subtitle}</AppText></View><View style={styles.savedList}>{places.map((place) => <SavedPlaceRow key={place.id} place={place} saved={savedIds.has(place.id)} onToggle={() => onToggle(place.id)} />)}</View></View>;
}

function SavedPlaceRow({ place, saved, onToggle }: { place: SavedCardItem; saved: boolean; onToggle: () => void }) {
  const isFree = place.price === 'Free';
  return <View style={styles.savedPlaceCard}><Image source={{ uri: place.image }} resizeMode="cover" style={styles.savedPlaceImage} /><View style={styles.savedPlaceBody}><View style={styles.savedPlaceTitleRow}><AppText variant="h6" numberOfLines={2} style={styles.savedPlaceTitle}>{place.name}</AppText><Pressable accessibilityRole="button" accessibilityLabel={`${saved ? 'Remove' : 'Save'} ${place.name}`} accessibilityState={{ selected: saved }} hitSlop={6} onPress={onToggle} style={({ pressed }) => [styles.savedBookmark, saved && styles.savedBookmarkActive, pressed && styles.pressed]}><Bookmark size={17} color={saved ? palette.white : palette.ink} fill={saved ? palette.white : 'transparent'} strokeWidth={1.8} /></Pressable></View><AppText variant="supporting" color={palette.inkSoft}>{place.cuisine} · {isFree ? 'Free' : place.price}</AppText><View style={styles.savedPlaceMeta}><View style={styles.savedRating}><Star size={13} color={palette.success} fill={palette.success} strokeWidth={1.5} /><AppText variant="caption" color={palette.ink}>{place.rating}</AppText></View><View style={styles.savedTravel}><CarFront size={14} color={palette.inkSoft} strokeWidth={1.7} /><AppText variant="supporting" color={palette.inkSoft}>{place.drive}</AppText></View></View></View></View>;
}

function TripTabPlaceholder({ tab }: { tab: 'Guides' | 'Journal' }) {
  const content = {
    Guides: { title: 'Lisbon guides', copy: 'Trip guides and shared recommendations will appear here.' },
    Journal: { title: 'Trip journal', copy: 'Photos, notes, and memories from this trip will appear here.' },
  }[tab];
  return <View style={[styles.sheetBody, styles.tabPlaceholder]}><View style={styles.tabPlaceholderIcon}>{tab === 'Guides' ? <Map size={22} color={palette.sky} strokeWidth={1.7} /> : <NotebookPen size={22} color={palette.sky} strokeWidth={1.7} />}</View><AppText variant="h3">{content.title}</AppText><AppText variant="body" color={palette.inkSoft} style={styles.tabPlaceholderCopy}>{content.copy}</AppText></View>;
}

function MembersSheet({ visible, hasRenGuest, focusRen, onClose, onAddMember }: { visible: boolean; hasRenGuest: boolean; focusRen: boolean; onClose: () => void; onAddMember: () => void }) {
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const balances = ['€123', '€123', 'No dues', '€123', '€123'] as const;
  const balanceColors = ['#D76A18', palette.success, palette.inkSoft, palette.success, palette.success] as const;
  const roles = ['Trip leader', 'Participant', 'Participant', 'Participant', 'Participant'] as const;

  useEffect(() => {
    if (!visible || !focusRen || !hasRenGuest) return;
    const timer = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 320);
    return () => clearTimeout(timer);
  }, [focusRen, hasRenGuest, visible]);

  return <BottomSheet visible={visible} title="Manage group" subtitle={`Private group · ${hasRenGuest ? 6 : 5} members`} headerAction={<Button label="Add member" icon={UserPlus} style={styles.manageHeaderAction} onPress={onAddMember} />} onClose={onClose} bottomInset={76} topInset={44} showClose={false}>
    <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.manageGroupContent} onContentSizeChange={() => { if (focusRen && hasRenGuest) scrollRef.current?.scrollToEnd({ animated: true }); }}>
      <AppText variant="h5" style={styles.manageSectionTitle}>Permanent members</AppText>
      <View style={styles.manageMemberList}>{tripMembers.map(({ name, image }, index) => <ManageMemberRow key={name} name={name} email={`${name.toLowerCase()}${name.toLowerCase()}@gmail.com`} image={image} role={roles[index]} balance={balances[index]} balanceColor={balanceColors[index]} />)}</View>
      {hasRenGuest ? <><AppText variant="h5" style={styles.manageSectionTitle}>Guests</AppText><ManageMemberRow name="Ren" email="renren@gmail.com" image={renImage} detail="Dinner on 11 Nov" balance="€123" balanceColor="#D76A18" /></> : null}
      <View style={styles.inviteFriendsCard}><View style={styles.inviteFriendsIcon}><UserPlus size={22} color={palette.sky} strokeWidth={1.7} /></View><AppText variant="h4">Bring a friend along</AppText><AppText variant="body" color={palette.inkSoft} style={styles.inviteFriendsCopy}>Trips are better with friends. Have someone joining you?</AppText><Button label="Invite friends" fullWidth onPress={onAddMember} /></View>
    </ScrollView>
  </BottomSheet>;
}

function ManageMemberRow({ name, email, image, role, detail, balance, balanceColor }: { name: string; email: string; image: ImageSourcePropType; role?: string; detail?: string; balance: string; balanceColor: string }) {
  return <View style={styles.manageMemberRow}><View style={styles.manageAvatarWrap}><Image source={image} resizeMode="cover" style={styles.manageAvatar} />{role ? <View style={styles.manageRole}><AppText variant="supporting" color={palette.inkSoft} numberOfLines={1}>{role}</AppText></View> : null}</View><View style={styles.manageMemberCopy}><AppText variant="h6">{name}</AppText><AppText variant="body" color={palette.inkSoft} numberOfLines={1}>{email}</AppText>{detail ? <AppText variant="supporting" color={palette.inkSoft}>{detail}</AppText> : null}</View><AppText variant="h6" color={balanceColor}>{balance}</AppText><Pressable accessibilityRole="button" accessibilityLabel={`More options for ${name}`} style={({ pressed }) => [styles.manageMemberMore, pressed && styles.pressed]}><EllipsisVertical size={20} color={palette.ink} strokeWidth={1.8} /></Pressable></View>;
}

function AddMemberSheet({ visible, onClose, onBack, onInvite, scope = 'trip', candidateName = 'Ren', candidateImage = renImage, guided = false, guidePulse }: { visible: boolean; onClose: () => void; onBack: () => void; onInvite: (name: string) => void; scope?: 'trip' | 'activity'; candidateName?: string; candidateImage?: ImageSourcePropType; guided?: boolean; guidePulse?: Animated.Value }) {
  const [guest, setGuest] = useState(false);
  const [query, setQuery] = useState('');
  const [contactSelected, setContactSelected] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [guidedInviteStep, setGuidedInviteStep] = useState<'qr' | 'close-qr' | 'invite'>('qr');
  const [qrMotion] = useState(() => new Animated.Value(0));
  const [inviteExitMotion] = useState(() => new Animated.Value(1));
  const activityScoped = scope === 'activity';
  const typedName = query.trim().replace(/\s+/g, ' ');
  const displayName = activityScoped ? typedName.replace(/\b\w/g, (letter) => letter.toUpperCase()) : candidateName;
  const normalizedName = displayName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const candidateEmail = `${normalizedName}${normalizedName}@gmail.com`;
  const displayImage = tripMembers.find((member) => member.name.toLowerCase() === displayName.toLowerCase())?.image ?? candidateImage;
  const matchesCandidate = activityScoped ? typedName.length >= 2 : typedName.toLowerCase().includes(candidateName.toLowerCase());
  const selected = matchesCandidate && contactSelected;

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || activityScoped) return;
    window.dispatchEvent(new CustomEvent('tripup:add-member-qr-visibility', { detail: { visible: visible && qrOpen } }));
    return () => { window.dispatchEvent(new CustomEvent('tripup:add-member-qr-visibility', { detail: { visible: false } })); };
  }, [activityScoped, qrOpen, visible]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || activityScoped) return;
    window.dispatchEvent(new CustomEvent('tripup:add-member-selection', { detail: { visible: visible && guided && selected, guest } }));
    return () => { window.dispatchEvent(new CustomEvent('tripup:add-member-selection', { detail: { visible: false, guest: false } })); };
  }, [activityScoped, guest, guided, selected, visible]);

  const reset = () => {
    setGuest(false);
    setQuery('');
    setContactSelected(false);
    setQrOpen(false);
    setGuidedInviteStep('qr');
    qrMotion.setValue(0);
    inviteExitMotion.setValue(1);
  };

  const closeSheet = () => { reset(); onClose(); };
  const backToGroup = () => { reset(); onBack(); };
  const sendInvite = () => {
    const selectedName = displayName;
    const completeInvite = () => { reset(); onInvite(selectedName); };
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (reduceMotion) { completeInvite(); return; }
      Animated.timing(inviteExitMotion, { toValue: 0, duration: 180, easing: Easing.in(Easing.quad), useNativeDriver: Platform.OS !== 'web' }).start(({ finished }) => {
        if (finished) completeInvite();
      });
    });
  };

  const updateGuest = (value: boolean) => {
    setGuest(value);
    if (guided) setGuidedInviteStep('qr');
  };

  const shareInvite = () => {
    void Share.share({ title: 'Join our TripUp group', message: 'Join our Lisbon trip on TripUp.' }).catch(() => undefined);
  };

  const openQr = () => {
    if (guided) setGuidedInviteStep('close-qr');
    setQrOpen(true);
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      qrMotion.setValue(reduceMotion ? 1 : 0);
      if (!reduceMotion) Animated.spring(qrMotion, { toValue: 1, stiffness: 240, damping: 22, mass: .8, useNativeDriver: Platform.OS !== 'web' }).start();
    });
  };
  const closeQr = () => {
    if (guided) setGuidedInviteStep('invite');
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (reduceMotion) { qrMotion.setValue(0); setQrOpen(false); return; }
      Animated.timing(qrMotion, { toValue: 0, duration: 170, easing: Easing.in(Easing.quad), useNativeDriver: Platform.OS !== 'web' }).start(({ finished }) => { if (finished) setQrOpen(false); });
    });
  };

  return <BottomSheet visible={visible} onClose={closeSheet} bottomInset={76} topInset={108} showClose={false}>
    <Animated.View style={[styles.addMemberSheet, { opacity: inviteExitMotion, transform: [{ translateY: inviteExitMotion.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={activityScoped ? 'Back to Add Activity' : 'Back to Manage group'} onPress={backToGroup} style={({ pressed }) => [styles.addMemberBack, pressed && styles.pressed]}><ArrowLeft size={22} color={palette.ink} strokeWidth={1.8} /><AppText variant="action">{activityScoped ? 'Back to Add Activity' : 'Back to Manage group'}</AppText></Pressable>
      <AppText variant="h3">{activityScoped ? 'Add activity member' : 'Add group member'}</AppText>
      <AppText variant="body" color={palette.inkSoft} style={styles.addMemberIntro}>{activityScoped ? 'Search for someone to include in this activity only.' : 'Add members through email, phone number, or simply enter their names.'}</AppText>
      {!qrOpen ? <View style={styles.addMemberSearch}><Search size={19} color={palette.inkSoft} strokeWidth={1.7} /><TextInput accessibilityLabel="Search contacts or add members" value={query} onChangeText={(value) => { setQuery(value); setContactSelected(false); }} autoCapitalize="words" placeholder="Search contacts or add members" placeholderTextColor={palette.inkSoft} style={styles.addMemberSearchInput} /><Pressable accessibilityRole="button" accessibilityLabel="Find Ren in contacts" onPress={() => { setQuery(candidateName.toLowerCase()); setContactSelected(false); }} style={({ pressed }) => [styles.contactPickerAction, pressed && styles.pressed]}><ContactRound size={21} color={palette.ink} strokeWidth={1.7} />{guided && guidePulse ? <GuidePulse visible={!matchesCandidate} pulse={guidePulse} /> : null}</Pressable></View> : null}
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.addMemberResults}>
        {!qrOpen && matchesCandidate && !selected ? <Pressable accessibilityRole="button" accessibilityLabel={`Select ${displayName}`} onPress={() => setContactSelected(true)} style={({ pressed }) => [styles.contactResultCard, pressed && styles.pressed]}><Image source={displayImage} resizeMode="cover" style={styles.contactResultAvatar} /><View style={styles.contactResultCopy}><AppText variant="h5">{displayName}</AppText><AppText variant="body" color={palette.inkSoft}>{candidateEmail}</AppText></View><View style={styles.contactResultAdd}><Plus size={20} color={palette.navy} strokeWidth={1.8} />{guided && guidePulse ? <GuidePulse visible pulse={guidePulse} /> : null}</View></Pressable> : null}
        {!qrOpen && selected ? <View style={styles.selectedMemberCard}><Pressable accessibilityRole="button" accessibilityLabel={`Unselect ${displayName}`} onPress={() => { setContactSelected(false); updateGuest(false); }} style={({ pressed }) => [styles.removeSelectedMember, pressed && styles.pressed]}><X size={17} color={palette.ink} strokeWidth={1.8} /></Pressable><View style={styles.selectedMemberHeader}><Image source={displayImage} resizeMode="cover" style={styles.selectedMemberAvatar} /><View style={styles.selectedMemberCopy}><AppText variant="h5">{displayName}</AppText><AppText variant="body">{candidateEmail}</AppText>{!activityScoped && guest ? <View style={styles.selectedDateLine}><AppText variant="supporting" color={palette.inkSoft}>Final day · 22 Nov</AppText></View> : null}</View>{!activityScoped ? <View style={styles.guestToggle}><Pressable accessibilityRole="switch" accessibilityState={{ checked: guest }} accessibilityLabel={`${displayName} is a guest`} onPress={() => updateGuest(!guest)} style={({ pressed }) => [styles.iosSwitch, guest && styles.iosSwitchOn, pressed && styles.iosSwitchPressed]}><View style={[styles.iosSwitchThumb, guest && styles.iosSwitchThumbOn]} />{guided && guidePulse ? <GuidePulse visible={!guest} pulse={guidePulse} /> : null}</Pressable><AppText variant="supporting" color={palette.inkSoft}>Guest</AppText></View> : null}</View></View> : null}
        {qrOpen ? <Animated.View style={[styles.qrInviteCard, { opacity: qrMotion, transform: [{ translateY: qrMotion.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }, { scale: qrMotion.interpolate({ inputRange: [0, 1], outputRange: [.97, 1] }) }] }]}><View style={styles.qrInviteHeading}><AppText variant="h5">Invite with QR code</AppText><Pressable accessibilityRole="button" accessibilityLabel="Close QR code" onPress={closeQr} style={({ pressed }) => [styles.qrClose, pressed && styles.pressed]}><X size={18} color={palette.ink} strokeWidth={1.8} /></Pressable></View><View style={styles.qrCodeSurface}><QRCode value="https://tripup.app/invite/lisbon-ren" size={164} color={palette.navy} backgroundColor={palette.surface} /></View><Button label="Share invite" icon={Share2} fullWidth onPress={shareInvite} /></Animated.View> : null}
      </ScrollView>
      <View style={styles.addMemberActions}><View style={styles.inviteGuideWrap}>{guided && guidePulse ? <GuidePulse visible={selected && guest && !qrOpen && guidedInviteStep === 'invite'} pulse={guidePulse} /> : null}<Button label={activityScoped ? 'Add to activity' : 'Invite friends'} disabled={!selected || qrOpen} style={[styles.inviteMemberButton, (!selected || qrOpen) && styles.buttonDisabled]} onPress={sendInvite} /></View>{!activityScoped ? <Pressable accessibilityRole="button" accessibilityLabel={qrOpen ? 'Close QR code' : 'Invite with QR code'} accessibilityState={{ expanded: qrOpen }} onPress={qrOpen ? closeQr : openQr} style={({ pressed }) => [styles.qrInviteButton, qrOpen && styles.qrInviteButtonActive, pressed && styles.pressed]}>{qrOpen ? <X size={24} color={palette.white} strokeWidth={1.8} /> : <QrCode size={26} color={palette.ink} strokeWidth={1.8} />}{guided && guidePulse ? <GuidePulse visible={selected && guest && ((!qrOpen && guidedInviteStep === 'qr') || (qrOpen && guidedInviteStep === 'close-qr'))} pulse={guidePulse} /> : null}</Pressable> : null}</View>
    </Animated.View>
  </BottomSheet>;
}

function ItemActionsSheet({ itemName, onClose, onSave, onEdit, onManageParticipants }: { itemName: string | null; onClose: () => void; onSave: () => void; onEdit: () => void; onManageParticipants: () => void }) {
  const actions = [
    { label: 'Mark as visited', icon: Check, color: palette.sky },
    { label: 'Save item', icon: Bookmark, color: palette.sky, onPress: onSave },
    { label: 'Manage participants', icon: UserPlus, color: palette.inkSoft, onPress: onManageParticipants },
    { label: 'Review this place', icon: Star, color: palette.inkSoft },
    { label: 'Edit activity', icon: Pencil, color: palette.inkSoft, onPress: onEdit },
    { label: 'Change time', icon: Clock3, color: palette.inkSoft },
    { label: 'Add cost', icon: BadgeEuro, color: palette.inkSoft },
    { label: 'Delete', icon: Trash2, color: '#EB5A62' },
  ];

  return <BottomSheet visible={itemName !== null} onClose={onClose} bottomInset={76} sheetHeight={466} showClose={false}>
    <View accessibilityLabel={itemName ? `Actions for ${itemName}` : undefined} style={styles.itemActionsContent}>
      {actions.map(({ label, icon: Icon, color, onPress }) => <Pressable accessibilityRole="button" accessibilityLabel={`${label}${itemName ? `, ${itemName}` : ''}`} key={label} onPress={onPress} style={({ pressed }) => [styles.itemActionRow, pressed && styles.actionRowPressed]}><Icon size={20} color={color} strokeWidth={1.7} /><AppText variant="label" color={label === 'Delete' ? '#C94650' : palette.ink}>{label}</AppText></Pressable>)}
    </View>
  </BottomSheet>;
}

function AddActivitySheet({ visible, onClose, onActivityAdded, onGoToExpenses, members, onMembersChange, onAddMember, guided, guidedStep, guidePulse, onGuideStep, mode = 'add', activityName }: { visible: boolean; onClose: () => void; onActivityAdded: (hasPoll: boolean) => void; onGoToExpenses: (name: string) => void; members: string[]; onMembersChange: (members: string[]) => void; onAddMember: () => void; guided: boolean; guidedStep: CollaborativeGuideStep; guidePulse: Animated.Value; onGuideStep: (step: CollaborativeGuideStep) => void; mode?: 'add' | 'edit'; activityName?: string }) {
  const categories = ['Attractions', 'Food & Drink', 'Transport', 'Stay', 'Shopping', 'Entertainment', 'Free'];
  const [category, setCategory] = useState('Food & Drink');
  const [activityQuery, setActivityQuery] = useState(activityName ?? '');
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [paidByPickerOpen, setPaidByPickerOpen] = useState(false);
  const [paidBy, setPaidBy] = useState<string | null>(null);
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);
  const [date, setDate] = useState('15/11/2026');
  const [time, setTime] = useState('22:00');
  const [picker, setPicker] = useState<'date' | 'time' | null>(null);
  const [pollOpen, setPollOpen] = useState(false);
  const [pollPlaces, setPollPlaces] = useState<SavedPlace[]>([]);
  const formScrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const activityScrollYRef = useRef(0);
  const categoryAnchorYRef = useRef(0);
  const savedAnchorYRef = useRef(0);
  const selectedSavedPlace = savedPlaces.find((place) => place.id === selectedSavedId) ?? null;

  const publishActivityContext = useCallback((isVisible = visible && !pollOpen && !paidByPickerOpen && picker === null) => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('tripup:activity-category-context', { detail: { visible: isVisible, scrollY: activityScrollYRef.current, categoryY: categoryAnchorYRef.current, savedY: savedAnchorYRef.current, savedVisible: category === 'Food & Drink' && pollPlaces.length === 0 } }));
  }, [category, paidByPickerOpen, picker, pollOpen, pollPlaces.length, visible]);

  useEffect(() => {
    publishActivityContext();
    return () => { publishActivityContext(false); };
  }, [publishActivityContext]);

  const updateActivityQuery = (value: string) => {
    setActivityQuery(value);
    const normalized = value.trim().toLowerCase();
    if (!normalized) return;
    if (/lunch|dinner|food|drink|restaurant|cafe|bar/.test(normalized)) setCategory('Food & Drink');
    else if (/train|flight|taxi|bus|tram|ride/.test(normalized)) setCategory('Transport');
    else if (/hotel|hostel|stay|apartment/.test(normalized)) setCategory('Stay');
    else if (/shop|market|souvenir|mall/.test(normalized)) setCategory('Shopping');
    else if (/music|show|concert|nightlife/.test(normalized)) setCategory('Entertainment');
    else if (/park|walk|viewpoint|free/.test(normalized)) setCategory('Free');
    else setCategory('Attractions');
    setSelectedSavedId(null);
  };

  return <><BottomSheet visible={visible && !pollOpen} onClose={onClose} bottomInset={76} topInset={44} showClose={false}>
    <ScrollView ref={formScrollRef} showsVerticalScrollIndicator={false} scrollEventThrottle={16} onScroll={(event) => { activityScrollYRef.current = event.nativeEvent.contentOffset.y; publishActivityContext(); }} contentContainerStyle={styles.activityPickerForm}>
      <AppText variant="h2">{mode === 'edit' ? 'Edit Activity' : 'Add Activity'}</AppText>
      <View style={styles.activitySearchField}><Search size={20} color={palette.inkSoft} strokeWidth={1.7} /><TextInput accessibilityLabel="Search by activity name" value={activityQuery} onChangeText={updateActivityQuery} placeholder="Search by name" placeholderTextColor={palette.inkSoft} style={styles.activitySearchInput} /></View>

      <View onLayout={(event) => { categoryAnchorYRef.current = event.nativeEvent.layout.y + 62; publishActivityContext(); }}><AppText variant="overline" style={styles.activityPickerLabel}>CATEGORY</AppText><View style={styles.categoryWrap}>{categories.slice(0, categoriesExpanded ? categories.length : 3).map((item) => <Chip key={item} label={item} selected={category === item} onPress={() => { setCategory(item); setSelectedSavedId(null); setPollOpen(false); }} />)}{!categoriesExpanded ? <Chip label="View more" selected={false} onPress={() => setCategoriesExpanded(true)} /> : null}</View></View>

      <AppText variant="overline" style={styles.activityPickerLabel}>TIME</AppText>
      <View style={styles.timeRow}><ActivityValue value={date} label="Date" wide onPress={() => setPicker('date')} /><ActivityValue value={time} label="Time" onPress={() => setPicker('time')} /></View>

      <AppText variant="overline" style={styles.activityPickerLabel}>PARTICIPANTS</AppText>
      <View style={styles.activityMemberPills}>{members.map((name) => { const memberImage = tripMembers.find((member) => member.name === name)?.image ?? (name === 'Ren' ? renImage : tripMembers[4].image); return <View key={name} style={styles.activityMemberPill}><Image source={memberImage} resizeMode="cover" style={styles.activityMemberPillAvatar} /><AppText variant="pill" color={palette.inkSoft}>{name}</AppText><Pressable accessibilityRole="button" accessibilityLabel={`Remove ${name}`} hitSlop={8} onPress={() => onMembersChange(members.filter((member) => member !== name))} style={({ pressed }) => [styles.activityMemberRemove, pressed && styles.pressed]}><X size={14} color={palette.ink} strokeWidth={1.8} /></Pressable></View>; })}<Pressable accessibilityRole="button" accessibilityLabel="Add member to this activity" hitSlop={4} onPress={onAddMember} style={({ pressed }) => [styles.activityMemberPill, pressed && styles.pressed]}><Plus size={16} color={palette.ink} strokeWidth={1.8} /><AppText variant="pill" color={palette.inkSoft}>Add</AppText></Pressable></View>

      <View style={styles.activityPaidByHeader}><AppText variant="overline">PAID BY</AppText><Button label="Add" icon={Plus} tone="tertiary" onPress={() => setPaidByPickerOpen(true)} style={styles.activityPaidByAdd} /></View>
      {paidBy ? <View style={styles.activityPaidByRow}><View style={styles.activityPaidByPill}><Image source={paidBy === 'Ari (you)' ? tripMembers[4].image : tripMembers.find((member) => member.name === paidBy)?.image ?? renImage} resizeMode="cover" style={styles.activityPaidByAvatar} /><AppText variant="pill" color={palette.inkSoft}>{paidBy}</AppText></View></View> : null}

      {category === 'Food & Drink' ? pollPlaces.length ? <><AppText variant="overline" style={styles.activityPickerLabel}>GROUP POLL</AppText><View style={styles.configuredPollCard}><View style={styles.configuredPollHeader}><View style={styles.overviewCardHeading}><AppText variant="h4">Where should we eat tonight?</AppText><AppText variant="supporting" color={palette.inkSoft}>{pollPlaces.length} options · closes in 15 minutes</AppText></View><Pressable accessibilityRole="button" accessibilityLabel="Edit dinner poll" onPress={() => setPollOpen(true)} style={({ pressed }) => [styles.configuredPollEdit, pressed && styles.pressed]}><Pencil size={18} color={palette.navy} strokeWidth={1.8} /></Pressable></View><View style={styles.configuredPollOptions}>{pollPlaces.map((place) => <View key={place.id} style={styles.configuredPollOption}><Image source={{ uri: place.image }} style={styles.configuredPollImage} /><AppText variant="supporting" numberOfLines={1} style={styles.configuredPollName}>{place.name}</AppText></View>)}</View><AppText variant="supporting" color={palette.inkSoft}>This poll will be sent to all participants in this activity.</AppText></View></> : <View onLayout={(event) => { savedAnchorYRef.current = event.nativeEvent.layout.y + 76; publishActivityContext(); }}><AppText variant="overline" style={styles.activityPickerLabel}>ADD FROM YOUR SAVED LIST</AppText>{selectedSavedPlace ? <SelectedSavedPlaceCard place={selectedSavedPlace} onRemove={() => setSelectedSavedId(null)} /> : <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.restaurantList}>{savedPlaces.map((place) => <RestaurantOption key={place.id} place={place} onPress={() => setSelectedSavedId(place.id)} />)}</ScrollView>}<Pressable accessibilityRole="button" accessibilityLabel="Start a restaurant poll" onPress={() => { setPollOpen(true); if (guidedStep === 'poll-card') onGuideStep('poll-setup'); }} style={({ pressed }) => [styles.pollPrompt, pressed && styles.pressed]}><GuidePulse visible={guidedStep === 'poll-card'} pulse={guidePulse} /><AppText variant="h4">Group unable to decide?</AppText><View style={styles.pollPromptRow}><AppText variant="body">Select multiple items to start a poll</AppText><ChevronRight size={22} color={palette.ink} strokeWidth={1.8} /></View></Pressable></View> : <ActivityCategoryOptions key={category} category={category} />}

      <View style={styles.activitySubmitWrap}><GuidePulse visible={guidedStep === 'add-activity'} pulse={guidePulse} /><Button label={mode === 'edit' ? 'Save changes' : 'Add activity'} fullWidth style={styles.activityInvite} onPress={() => onActivityAdded(pollPlaces.length > 0)} /></View>
    </ScrollView>
  </BottomSheet><DinnerPollSheet visible={visible && pollOpen} onClose={() => setPollOpen(false)} guided={guidedStep === 'poll-setup'} guidePulse={guidePulse} onConfigured={(places) => { setPollPlaces(places); setPollOpen(false); onGuideStep('add-activity'); setTimeout(() => formScrollRef.current?.scrollToEnd({ animated: true }), 120); }} /><BottomSheet visible={visible && paidByPickerOpen} title="Who paid?" subtitle="Select the person who covered this activity." onClose={() => setPaidByPickerOpen(false)} bottomInset={76} sheetHeight={guided ? 250 : 314} showClose={false}><View style={styles.activityPayerPickerContent}><View style={styles.activityPayerPickerMembers}>{['Ari (you)', ...members].map((name) => { const selected = paidBy === name; const image = name === 'Ari (you)' ? tripMembers[4].image : tripMembers.find((member) => member.name === name)?.image ?? renImage; return <Pressable key={name} accessibilityRole="radio" accessibilityState={{ checked: selected }} accessibilityLabel={`${name}${selected ? ', selected payer' : ''}`} onPress={() => setPaidBy(name)} style={({ pressed }) => [styles.activityPayerOption, pressed && styles.pressed]}><View style={[styles.activityPayerAvatarWrap, selected && styles.activityPayerAvatarSelected]}><Image source={image} resizeMode="cover" style={styles.activityPayerAvatar} />{selected ? <View style={styles.activityPayerCheck}><Check size={12} color={palette.white} strokeWidth={2.3} /></View> : null}</View><AppText variant="caption" color={selected ? palette.navy : palette.inkSoft} numberOfLines={1}>{name}</AppText></Pressable>; })}</View><Button label="Done" fullWidth disabled={!paidBy} onPress={() => setPaidByPickerOpen(false)} style={!paidBy && styles.controlDisabled} />{!guided ? <Button label="Go to expenses" tone="secondary" fullWidth onPress={() => onGoToExpenses(activityQuery.trim() || activityName || 'Activity expense')} /> : null}</View></BottomSheet><ActivityPickerSheet type={picker} value={picker === 'date' ? date : time} onClose={() => setPicker(null)} onSelect={(value) => { if (picker === 'date') setDate(value); else setTime(value); setPicker(null); }} /></>;
}

function ActivityCategoryOptions({ category }: { category: string }) {
  const configurations = {
    Attractions: { title: 'ATTRACTION OPTIONS', action: 'Browse saved attractions', icon: MapPinPlus, options: ['Museum', 'Landmark', 'Outdoors'] },
    Transport: { title: 'TRANSPORT OPTIONS', action: 'Add transport details', icon: CarFront, options: ['Taxi', 'Train', 'Flight'] },
    Stay: { title: 'STAY OPTIONS', action: 'Find a hotel from the list', icon: BedDouble, options: ['Hotel', 'Hostel', 'Apartment'] },
    Shopping: { title: 'SHOPPING OPTIONS', action: 'Browse saved shops', icon: ShoppingBag, options: ['Market', 'Mall', 'Souvenirs'] },
    Entertainment: { title: 'ENTERTAINMENT OPTIONS', action: 'Browse saved entertainment', icon: Music2, options: ['Live music', 'Show', 'Nightlife'] },
    Free: { title: 'FREE ACTIVITY OPTIONS', action: 'Browse free activities', icon: BadgeEuro, options: ['Walking tour', 'Park', 'Viewpoint'] },
  } as const;
  const configuration = configurations[category as keyof typeof configurations] ?? configurations.Attractions;
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedAttractionId, setSelectedAttractionId] = useState<string | null>(null);
  const Icon = configuration.icon;

  if (category === 'Attractions') {
    const selectedAttraction = savedAttractions.find((attraction) => attraction.id === selectedAttractionId) ?? null;
    return <View style={styles.categoryOptionsSection}><AppText variant="overline" style={styles.activityPickerLabel}>ADD FROM YOUR SAVED LIST</AppText>{selectedAttraction ? <SelectedSavedPlaceCard place={selectedAttraction} onRemove={() => setSelectedAttractionId(null)} /> : <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.restaurantList}>{savedAttractions.map((attraction) => <RestaurantOption key={attraction.id} place={attraction} onPress={() => setSelectedAttractionId(attraction.id)} />)}</ScrollView>}</View>;
  }

  return <View style={styles.categoryOptionsSection}><AppText variant="overline" style={styles.activityPickerLabel}>{configuration.title}</AppText><Pressable accessibilityRole="button" accessibilityLabel={configuration.action} style={({ pressed }) => [styles.categoryOptionAction, pressed && styles.pressed]}><View style={styles.categoryOptionIcon}><Icon size={19} color={palette.sky} strokeWidth={1.7} /></View><AppText variant="listItem" style={styles.categoryOptionActionLabel}>{configuration.action}</AppText><ChevronRight size={19} color={palette.inkSoft} strokeWidth={1.7} /></Pressable><View style={styles.categoryOptionChips}>{configuration.options.map((option) => <Chip key={option} label={option} selected={selectedOption === option} onPress={() => setSelectedOption(option)} />)}</View></View>;
}

function ActivityValue({ value, label, wide, onPress }: { value: string; label: string; wide?: boolean; onPress: () => void }) { return <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${value}`} onPress={onPress} style={({ pressed }) => [styles.activityValue, wide && styles.activityValueWide, pressed && styles.pressed]}><AppText variant="body" color={palette.inkSoft} style={styles.activityValueText}>{value}</AppText></Pressable>; }

function ActivityPickerSheet({ type, value, onClose, onSelect }: { type: 'date' | 'time' | null; value: string; onClose: () => void; onSelect: (value: string) => void }) {
  const options = type === 'date' ? Array.from({ length: 8 }, (_, index) => `${15 + index}/11/2026`) : ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
  return <BottomSheet visible={type !== null} title={type === 'date' ? 'Select date' : 'Select time'} onClose={onClose} bottomInset={76} sheetHeight={320}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.activityPickerOptions}>{options.map((option) => { const selected = option === value; return <Pressable accessibilityRole="button" accessibilityState={{ selected }} key={option} onPress={() => onSelect(option)} style={({ pressed }) => [styles.activityPickerOption, selected && styles.activityPickerOptionSelected, pressed && styles.pressed]}><AppText variant="body" style={styles.activityPickerOptionText} color={selected ? palette.white : palette.ink}>{option}</AppText>{selected ? <Check size={18} color={palette.white} strokeWidth={2} /> : null}</Pressable>; })}</ScrollView>
  </BottomSheet>;
}

function RestaurantOption({ place, onPress }: { place: SavedCardItem; onPress: () => void }) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(156, Math.max(146, width * 0.39));
  return <Pressable accessibilityRole="button" accessibilityLabel={`Add ${place.name} to this activity`} accessibilityState={{ selected: false }} onPress={onPress} style={({ pressed }) => [styles.restaurantCard, { width: cardWidth }, pressed && styles.pressed]}><View style={styles.restaurantImageFrame}><Image source={{ uri: place.image }} resizeMode="cover" style={styles.restaurantCardImage} /><View style={styles.restaurantStatusRibbon}><AppText variant="supporting" color={palette.white}>Open now</AppText></View><View style={styles.restaurantAdd}><Plus size={20} color={palette.ink} strokeWidth={1.8} /></View><View style={styles.restaurantRatingBadge}><AppText variant="label" color={palette.white}>{place.rating}</AppText><Star size={13} color={palette.white} fill={palette.white} strokeWidth={1.7} /></View></View><View style={styles.restaurantCopy}><AppText variant="h5" numberOfLines={1}>{place.name}</AppText><View style={styles.restaurantMetaRow}><View style={styles.restaurantDriveRow}><CarFront size={15} color={palette.inkSoft} strokeWidth={1.7} /><AppText variant="supporting" color={palette.inkSoft}>{place.drive}</AppText></View><AppText variant="supporting" color={palette.inkSoft}>· {place.cuisine} · {place.price}</AppText></View></View></Pressable>;
}

function SelectedSavedPlaceCard({ place, onRemove }: { place: SavedCardItem; onRemove: () => void }) {
  return <View accessibilityLabel={`${place.name} selected for this activity`} style={styles.selectedSavedCard}><Image source={{ uri: place.image }} resizeMode="cover" style={styles.selectedSavedImage} /><View style={styles.selectedSavedCopy}><View style={styles.selectedSavedTitle}><AppText variant="h5" numberOfLines={2} style={styles.pollSelectedName}>{place.name}</AppText><Star size={15} color={palette.ink} strokeWidth={1.7} /><AppText variant="supporting">{place.rating}</AppText></View><AppText variant="supporting" color={palette.inkSoft}>{place.cuisine} · {place.price}</AppText><View style={styles.restaurantDrive}><CarFront size={15} color={palette.inkSoft} strokeWidth={1.7} /><AppText variant="supporting" color={palette.inkSoft}>{place.drive}</AppText></View></View><View style={styles.selectedSavedDetails}><AppText variant="supporting" color={palette.inkSoft}>Open now</AppText></View><Pressable accessibilityRole="button" accessibilityLabel={`Remove ${place.name} from this activity`} onPress={onRemove} style={({ pressed }) => [styles.selectedSavedRemove, pressed && styles.pressed]}><X size={17} color={palette.ink} strokeWidth={1.8} /></Pressable></View>;
}

function DinnerPollSheet({ visible, onClose, onConfigured, guided, guidePulse }: { visible: boolean; onClose: () => void; onConfigured: (places: SavedPlace[]) => void; guided: boolean; guidePulse: Animated.Value }) {
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedPlaces = selectedIds.map((id) => savedPlaces.find((place) => place.id === id)).filter((place): place is SavedPlace => Boolean(place));
  const filteredPlaces = savedPlaces.filter((place) => !selectedIds.includes(place.id) && `${place.name} ${place.cuisine}`.toLowerCase().includes(query.trim().toLowerCase()));
  const togglePlace = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const finishPoll = () => onConfigured(selectedPlaces);

  return <BottomSheet visible={visible} onClose={onClose} bottomInset={76} topInset={20} showClose={false}>
    <View style={styles.pollSheetFrame}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.pollSheetContent}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to Add Activity" onPress={onClose} style={({ pressed }) => [styles.pollBack, pressed && styles.pressed]}><ArrowLeft size={23} color={palette.ink} strokeWidth={1.8} /><AppText variant="action">Back to Add Activity</AppText></Pressable>
        <AppText variant="h1">Dinner poll</AppText>
        <View style={styles.pollSearch}><Search size={20} color={palette.inkSoft} strokeWidth={1.7} /><TextInput accessibilityLabel="Search for restaurants" value={query} onChangeText={setQuery} placeholder="Search for restaurants" placeholderTextColor={palette.inkSoft} style={styles.pollSearchInput} /></View>
        {selectedPlaces.length ? <View style={styles.pollSelectedSection}><AppText variant="h4">Where should we eat tonight?</AppText><View style={styles.pollSelectedList}>{selectedPlaces.map((place, index) => <PollSelectedRestaurant key={place.id} place={place} status={index === 1 ? 'Opens at 9pm' : 'Open now'} onRemove={() => togglePlace(place.id)} />)}</View><Pressable accessibilityRole="button" accessibilityLabel="Edit poll closing time" style={({ pressed }) => [styles.pollDeadline, pressed && styles.pressed]}><View style={styles.pollDeadlineCopy}><AppText variant="h6">Closes in 15 mins at 8:15 PM</AppText><AppText variant="supporting" color={palette.inkSoft}>Sent to all participants in this activity</AppText></View><Pencil size={23} color={palette.ink} strokeWidth={1.8} /></Pressable></View> : null}
        <AppText variant="h4" style={styles.pollSavedTitle}>Add from your saved list</AppText>
        {filteredPlaces.length ? <View style={styles.pollRestaurantList}>{filteredPlaces.map((place, index) => <PollAvailableRestaurant key={place.id} place={place} onAdd={() => togglePlace(place.id)} guideVisible={guided && selectedIds.length < 2 && index === 0} guidePulse={guidePulse} />)}</View> : <View style={styles.pollEmpty}>{query.trim() ? <><Search size={22} color={palette.inkSoft} strokeWidth={1.6} /><AppText variant="body" color={palette.inkSoft}>No saved restaurants match “{query.trim()}”.</AppText></> : <><Check size={22} color={palette.sky} strokeWidth={1.8} /><AppText variant="body" color={palette.inkSoft}>All saved restaurants are in this poll.</AppText></>}</View>}
      </ScrollView>
      <View style={styles.pollFooter}><GuidePulse visible={guided && selectedIds.length >= 2} pulse={guidePulse} /><Button label="Save Poll & Continue to Activity" fullWidth disabled={selectedIds.length < 2} style={selectedIds.length < 2 && styles.buttonDisabled} onPress={finishPoll} /></View>
    </View>
  </BottomSheet>;
}

function PollSelectedRestaurant({ place, status, onRemove }: { place: SavedPlace; status: string; onRemove: () => void }) {
  return <View accessibilityLabel={`${place.name}, selected for dinner poll`} style={styles.pollSelectedRestaurant}><Image source={{ uri: place.image }} resizeMode="cover" style={styles.pollSelectedImage} /><View style={styles.pollSelectedCopy}><View style={styles.pollSelectedTitleLine}><AppText variant="h5" numberOfLines={2} style={styles.pollSelectedName}>{place.name}</AppText><Star size={15} color={palette.ink} strokeWidth={1.7} /><AppText variant="supporting">{place.rating}</AppText></View><AppText variant="body" color={palette.inkSoft}>{place.cuisine} · {place.price}</AppText></View><View style={styles.pollSelectedMeta}><AppText variant="body" color={palette.inkSoft}>{status}</AppText><View style={styles.restaurantDrive}><CarFront size={15} color={palette.ink} strokeWidth={1.7} /><AppText variant="body" color={palette.inkSoft}>{place.drive}</AppText></View></View><Pressable accessibilityRole="button" accessibilityLabel={`Remove ${place.name} from dinner poll`} onPress={onRemove} style={({ pressed }) => [styles.pollSelectedRemove, pressed && styles.pressed]}><X size={15} color={palette.ink} strokeWidth={1.8} /></Pressable></View>;
}

function PollAvailableRestaurant({ place, onAdd, guideVisible, guidePulse }: { place: SavedPlace; onAdd: () => void; guideVisible: boolean; guidePulse: Animated.Value }) {
  return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: false }} accessibilityLabel={`Add ${place.name} to dinner poll`} onPress={onAdd} style={({ pressed }) => [styles.pollSelectedRestaurant, pressed && styles.pressed]}><Image source={{ uri: place.image }} resizeMode="cover" style={styles.pollSelectedImage} /><View style={styles.pollSelectedCopy}><View style={styles.pollSelectedTitleLine}><AppText variant="h5" numberOfLines={2} style={styles.pollSelectedName}>{place.name}</AppText><Star size={15} color={palette.ink} strokeWidth={1.7} /><AppText variant="supporting">{place.rating}</AppText></View><AppText variant="body" color={palette.inkSoft}>{place.cuisine} · {place.price}</AppText><View style={styles.restaurantDrive}><CarFront size={15} color={palette.ink} strokeWidth={1.7} /><AppText variant="supporting" color={palette.inkSoft}>{place.drive}</AppText></View></View><View style={styles.pollAvailableAdd}><Plus size={18} color={palette.ink} strokeWidth={1.8} /><GuidePulse visible={guideVisible} pulse={guidePulse} /></View></Pressable>;
}

function PollResultsSheet({ visible, closed, voted, selectedVote, guidePulse, guideStep, onClose, onVote, onClosePoll, onViewItinerary }: { visible: boolean; closed: boolean; voted: boolean; selectedVote: string | null; guidePulse: Animated.Value; guideStep: CollaborativeGuideStep; onClose: () => void; onVote: (name: string) => void; onClosePoll: () => void; onViewItinerary: () => void }) {
  return <BottomSheet visible={visible} onClose={onClose} bottomInset={76} topInset={20} showClose={false}><PollResults closed={closed} voted={voted} selectedVote={selectedVote} guidePulse={guidePulse} guideStep={guideStep} onVote={onVote} onClosePoll={onClosePoll} onViewItinerary={onViewItinerary} /></BottomSheet>;
}

function PollResults({ closed, voted, selectedVote, guidePulse, guideStep, onVote, onClosePoll, onViewItinerary }: { closed: boolean; voted: boolean; selectedVote: string | null; guidePulse: Animated.Value; guideStep: CollaborativeGuideStep; onVote: (name: string) => void; onClosePoll: () => void; onViewItinerary: () => void }) {
  const [draftChoice, setDraftChoice] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);
  const closeActionRef = useRef<ComponentRef<typeof View>>(null);
  const suggestionRef = useRef<ComponentRef<typeof View>>(null);
  const choice = draftChoice ?? selectedVote;
  const populatedResults = [
    { name: 'Cervejaria Ramiro', cuisine: 'Seafood · €€€', status: 'Open now', percent: 50, image: savedPlaceImage('ramiro'), voters: [0, 1, 2] },
    { name: 'Santa Marta', cuisine: 'Portuguese · Vegan · €€', status: 'Opens at 9pm', percent: 33, image: savedPlaceImage('oficio'), voters: [3, 5] },
    { name: 'Firefly', cuisine: 'Mexican · €€', status: 'Open now', percent: 17, image: savedPlaceImage('prado'), voters: [4] },
    { name: 'Encanto by José Avillez', cuisine: 'Portuguese · €€€', status: 'Open now', percent: 0, image: savedPlaceImage('alma'), voters: [] },
  ];
  const showResults = voted || closed;
  const results = showResults ? populatedResults : populatedResults.map((result) => ({ ...result, percent: 0, voters: [] }));
  const countdown = `${Math.floor(secondsRemaining / 60)}:${String(secondsRemaining % 60).padStart(2, '0')}`;

  useEffect(() => {
    if (closed) return;
    const timer = setInterval(() => setSecondsRemaining((current) => Math.max(0, current - 1)), 1000);
    return () => clearInterval(timer);
  }, [closed]);
  const publishCloseControlPosition = useCallback(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || guideStep !== 'close-poll') return;
    closeActionRef.current?.measureInWindow((_x, y, _width, height) => window.dispatchEvent(new CustomEvent('tripup:poll-creator-control', { detail: { visible: true, y: y + height / 2 } })));
  }, [guideStep]);

  const publishSuggestionPosition = useCallback(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !showResults || closed) return;
    suggestionRef.current?.measureInWindow((_x, y, _width, height) => window.dispatchEvent(new CustomEvent('tripup:poll-suggestion-context', { detail: { visible: true, y: y + height / 2 } })));
  }, [closed, showResults]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    if (guideStep !== 'close-poll') {
      window.dispatchEvent(new CustomEvent('tripup:poll-creator-control', { detail: { visible: false, y: 0 } }));
      return;
    }
    const timer = setTimeout(publishCloseControlPosition, 240);
    window.addEventListener('resize', publishCloseControlPosition);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', publishCloseControlPosition);
      window.dispatchEvent(new CustomEvent('tripup:poll-creator-control', { detail: { visible: false, y: 0 } }));
    };
  }, [guideStep, publishCloseControlPosition]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    if (!showResults || closed) {
      window.dispatchEvent(new CustomEvent('tripup:poll-suggestion-context', { detail: { visible: false, y: 0 } }));
      return;
    }
    const timer = setTimeout(publishSuggestionPosition, 260);
    window.addEventListener('resize', publishSuggestionPosition);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', publishSuggestionPosition);
      window.dispatchEvent(new CustomEvent('tripup:poll-suggestion-context', { detail: { visible: false, y: 0 } }));
    };
  }, [closed, publishSuggestionPosition, showResults]);

  return <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pollResultsContent} onScrollEndDrag={() => { publishCloseControlPosition(); publishSuggestionPosition(); }} onMomentumScrollEnd={() => { publishCloseControlPosition(); publishSuggestionPosition(); }}>
    <AppText variant="h1">Dinner poll</AppText>
    <View style={styles.pollAuthor}><Image source={tripMembers[4].image} style={styles.pollAuthorAvatar} /><AppText variant="body" color={palette.inkSoft}>Ari (you) started a poll</AppText></View>
    <AppText variant="h4" style={styles.pollResultsQuestion}>Where should we eat tonight?</AppText>
    <View style={styles.pollParticipationRow}><AppText variant="supporting" color={palette.inkSoft} style={styles.pollParticipation}>{showResults ? '6 of 6 participants have voted' : '0 of 6 participants have voted'}</AppText><View style={[styles.pollCountdown, closed && styles.pollCountdownClosed]}><Clock3 size={14} color={closed ? palette.inkSoft : palette.navy} strokeWidth={1.8} /><AppText variant="caption" color={closed ? palette.inkSoft : palette.navy}>{closed ? 'Poll closed' : `Closes in ${countdown}`}</AppText></View></View>
    <View style={styles.pollResultsList}>{results.map((result) => <PollResultRow key={result.name} result={result} showResults={showResults} selected={choice === result.name} disabled={closed} onSelect={() => setDraftChoice(result.name)} />)}</View>
    {showResults ? <><View style={styles.pollSuggestionBy}><Image source={tripMembers[0].image} resizeMode="cover" style={styles.pollSuggestionAvatar} /><AppText variant="body">Gops suggested</AppText></View><Pressable ref={suggestionRef} accessibilityRole="radio" accessibilityState={{ selected: choice === 'Alma', disabled: closed }} accessibilityLabel={`Alma, suggested by Gops${choice === 'Alma' ? ', selected' : ''}`} disabled={closed} onPress={() => setDraftChoice('Alma')} style={({ pressed }) => [styles.pollSuggestionCard, choice === 'Alma' && styles.pollSuggestionCardSelected, pressed && styles.pressed]}><Image source={{ uri: savedPlaceImage('alma') }} resizeMode="cover" style={styles.pollSuggestionImage} /><View style={styles.pollSuggestionCopy}><View style={styles.pollSelectedTitleLine}><AppText variant="h5">Alma</AppText><Star size={14} color={palette.ink} strokeWidth={1.7} /><AppText variant="supporting">4.9</AppText></View><AppText variant="body" color={palette.inkSoft}>Modern Portuguese · €€€</AppText></View><View style={styles.pollSuggestionMeta}><AppText variant="body" color={palette.inkSoft}>Open now</AppText><View style={styles.restaurantDrive}><CarFront size={15} color={palette.ink} strokeWidth={1.7} /><AppText variant="body" color={palette.inkSoft}>12m</AppText></View></View>{choice === 'Alma' ? <View style={styles.pollSelectedVote}><Check size={15} color={palette.white} strokeWidth={2.2} /></View> : null}</Pressable></> : null}
    {closed ? <View style={styles.pollWinnerNotice}><GuidePulse visible={guideStep === 'view-activity'} pulse={guidePulse} /><AppText variant="h6">The winning restaurant was added to your itinerary!</AppText><Button label="View activity" tone="tertiary" onPress={onViewItinerary} style={styles.pollViewItinerary} /></View> : <><View style={styles.pollVoteAction}><GuidePulse visible={guideStep === 'submit-vote'} pulse={guidePulse} /><Button label={voted ? 'Recast vote' : 'Cast vote'} fullWidth disabled={!choice} style={!choice && styles.buttonDisabled} onPress={() => { if (choice) onVote(choice); }} /></View>{voted ? <View ref={closeActionRef} style={styles.pollCloseAction}><GuidePulse visible={guideStep === 'close-poll'} pulse={guidePulse} /><Button label="Close poll and notify group" tone="tertiary" fullWidth onPress={onClosePoll} /></View> : null}</>}
  </ScrollView>;
}

function PollResultRow({ result, showResults, selected, disabled, onSelect }: { result: { name: string; cuisine: string; status: string; percent: number; image: string; voters: number[] }; showResults: boolean; selected: boolean; disabled: boolean; onSelect: () => void }) {
  return <Pressable accessibilityRole="radio" accessibilityState={{ selected, disabled }} disabled={disabled} onPress={onSelect} style={({ pressed }) => [styles.pollResultRow, selected && styles.pollResultSelected, pressed && styles.pressed]}><Image source={{ uri: result.image }} resizeMode="cover" style={styles.pollResultImage} /><View style={styles.pollResultCopy}><View style={styles.pollSelectedTitleLine}><AppText variant="h5" numberOfLines={2} style={styles.pollSelectedName}>{result.name}</AppText><Star size={14} color={palette.ink} strokeWidth={1.7} /><AppText variant="supporting">4.9</AppText></View><View style={styles.pollResultStatusLine}><AppText variant="body" color={palette.inkSoft}>{result.status} ·</AppText><CarFront size={13} color={palette.ink} strokeWidth={1.7} /><AppText variant="body" color={palette.inkSoft}>20m</AppText></View><AppText variant="body" color={palette.inkSoft}>{result.cuisine}</AppText>{showResults ? <View style={styles.pollWinningProgress}><View style={styles.pollProgressTrack}><View style={[styles.pollProgressFill, { width: `${result.percent}%` }]} /></View><AppText variant="body" color={palette.inkSoft}>{result.percent}%</AppText><View style={styles.pollVoters}>{result.voters.map((memberIndex, avatarIndex) => <Image key={`${memberIndex}-${avatarIndex}`} source={memberIndex === tripMembers.length ? renImage : tripMembers[memberIndex].image} resizeMode="cover" style={[styles.pollVoterAvatar, avatarIndex > 0 && styles.pollVoterOverlap]} />)}</View></View> : <AppText variant="supporting" color={palette.inkSoft} style={styles.pollNoVotes}>No votes yet</AppText>}</View>{selected ? <View style={styles.pollSelectedVote}><Check size={15} color={palette.white} strokeWidth={2.2} /></View> : null}</Pressable>;
}

function PollGeneratedActivityCard({ index, visited, onToggleVisited, onMore }: { index: number; visited: boolean; onToggleVisited: () => void; onMore: () => void }) {
  return <View style={styles.activityRow}><View style={styles.rail}><Pressable accessibilityRole="checkbox" accessibilityState={{ checked: visited }} accessibilityLabel={`Mark Dinner at Cervejaria Ramiro as ${visited ? 'not visited' : 'visited'}`} onPress={onToggleVisited} style={({ pressed }) => [styles.number, visited && styles.numberVisited, pressed && styles.pressed]}>{visited ? <Check size={17} color={palette.white} strokeWidth={2.2} /> : <AppText variant="label" color={palette.coral}>{index}</AppText>}</Pressable></View><View style={{ flex: 1 }}><View style={[styles.activityCard, styles.activityCardCurrent, styles.pollGeneratedCard]}><View style={styles.activityCurrentTop}><Image accessibilityLabel="Cervejaria Ramiro restaurant" source={{ uri: savedPlaceImage('ramiro') }} resizeMode="cover" style={styles.activityThumbnail} /><View style={styles.activityCurrentCopy}><AppText variant="supporting" color={palette.inkSoft} style={styles.activitySchedule}>22:30</AppText><View style={styles.activityTitleLine}><AppText variant="h5" numberOfLines={2} style={styles.activityTitle}>Dinner at Cervejaria Ramiro</AppText></View><View style={styles.activityCurrentMeta}><View style={styles.activityTag}><Pill label="Food & Drinks" compact /></View><ActivityParticipants inline /></View></View><View style={styles.activityCurrentActions}><Pressable accessibilityRole="button" accessibilityLabel="More actions for Dinner at Cervejaria Ramiro" onPress={onMore} style={({ pressed }) => [styles.itemMore, styles.itemMoreCurrent, pressed && styles.pressed]}><Ellipsis size={18} color={palette.inkSoft} /></Pressable></View></View><MessageSquare style={styles.activityCurrentComment} size={18} color={palette.inkSoft} strokeWidth={1.7} /></View></View></View>;
}

function LivePollActivityCard({ index, voted, closed, guidePulse, guideStep, onCastVote, onOpenResults }: { index: number; voted: boolean; closed: boolean; guidePulse: Animated.Value; guideStep: CollaborativeGuideStep; onCastVote: () => void; onOpenResults: () => void }) {
  const resultsLabel = closed ? 'Cervejaria Ramiro won with 3 votes' : 'Cervejaria Ramiro leading with 3 votes';
  const pulseStep = closed ? 'closed-results' : voted ? 'open-results' : 'cast-vote';
  return <View style={styles.activityRow}><View style={styles.rail}><View style={styles.number}><AppText variant="label" color={palette.coral}>{index}</AppText></View></View><View style={{ flex: 1 }}><View accessibilityLabel={voted ? `Dinner poll, ${resultsLabel}` : 'Dinner poll with no votes'} style={[styles.activityCard, styles.livePollCard]}><View style={styles.pollActivityHeader}><View><AppText variant="h5">Dinner</AppText><AppText variant="body" color={palette.inkSoft}>{closed ? 'Poll closed' : 'Ari (you) started a poll'}</AppText></View><Ellipsis size={18} color={palette.inkSoft} strokeWidth={1.8} /></View>{voted ? <View style={styles.pollActivityStatus}><View style={styles.pollLeaderSwatch} /><AppText variant="h6">{resultsLabel}</AppText></View> : <View style={styles.pollActivityEmpty}><AppText variant="body" color={palette.inkSoft}>No votes yet</AppText></View>}<Pressable accessibilityRole="button" accessibilityLabel={voted ? 'View dinner poll results' : 'Cast my vote'} onPress={voted ? onOpenResults : onCastVote} style={({ pressed }) => [styles.pollActivityLink, pressed && styles.pressed]}><GuidePulse visible={guideStep === pulseStep} pulse={guidePulse} /><AppText variant="action" color={palette.sky}>{voted ? 'View poll results' : 'Cast my vote'}</AppText></Pressable></View></View></View>;
}

function AllActionsSheet({ visible, onClose, onAddActivity }: { visible: boolean; onClose: () => void; onAddActivity: () => void }) {
  const quickActions = [
    { label: 'Scan receipt', icon: ReceiptText },
    { label: 'Add expense', icon: WalletCards },
    { label: 'Export expense report', icon: FileText },
  ];
  const planActions = [
    { label: 'Add Activity', icon: MapPinPlus, onPress: onAddActivity },
    { label: 'Add Day', icon: CalendarPlus },
    { label: 'Explore', icon: Compass },
    { label: 'Export itinerary PDF', icon: FileDown, premium: true },
  ];
  const journalActions = [
    { label: 'Add Photo', icon: ImagePlus },
    { label: 'Write a memory', icon: NotebookPen },
  ];

  return <BottomSheet visible={visible} title="All actions" subtitle="Available from every tab" onClose={onClose} bottomInset={76}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.actionsContent}>
      <Pressable accessibilityRole="button" style={({ pressed }) => [styles.aiAction, pressed && styles.pressed]}>
        <Sparkles size={19} color={palette.sky} strokeWidth={1.8} />
        <AppText variant="body" color={palette.inkSoft} numberOfLines={1} style={styles.aiPlaceholder}>Ask the AI assistant about this trip...</AppText>
        <View style={styles.aiSend}><ArrowUp size={21} color={palette.white} strokeWidth={1.8} /></View>
      </Pressable>

      <View style={styles.quickActions}>{quickActions.map(({ label, icon: Icon }) => <Pressable accessibilityRole="button" key={label} style={({ pressed }) => [styles.quickAction, styles.quickActionExpense, pressed && styles.pressed]}><View style={[styles.quickActionIcon, styles.quickActionIconExpense]}><Icon size={21} color={palette.success} strokeWidth={1.8} /></View><AppText variant="h6" style={styles.quickActionLabel}>{label}</AppText></Pressable>)}</View>

      <ActionSection title="PLAN">{planActions.map((action) => <ActionRow key={action.label} {...action} />)}</ActionSection>
      <ActionSection title="JOURNAL">{journalActions.map((action) => <ActionRow key={action.label} {...action} tone="warm" />)}</ActionSection>
    </ScrollView>
  </BottomSheet>;
}

function ActionSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={styles.actionSection}><AppText variant="overline" style={styles.actionSectionTitle}>{title}</AppText>{children}</View>;
}

function ActionRow({ label, icon: Icon, premium, tone = 'blue', onPress }: { label: string; icon: typeof MapPinPlus; premium?: boolean; tone?: 'blue' | 'green' | 'warm'; onPress?: () => void }) {
  const iconColor = tone === 'green' ? palette.success : tone === 'warm' ? '#DF8436' : palette.sky;
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}>
    <View style={[styles.actionRowIcon, tone === 'green' && styles.actionRowIconGreen, tone === 'warm' && styles.actionRowIconWarm]}><Icon size={20} color={iconColor} strokeWidth={1.8} /></View>
    <AppText variant="listItem" style={{ flex: 1 }}>{label}</AppText>
    {premium ? <View style={styles.premium}><AppText variant="caption" color={palette.white}>Premium</AppText></View> : null}
    <ChevronRight size={19} color={palette.inkSoft} strokeWidth={1.7} />
  </Pressable>;
}

function RoundAction({ icon: Icon, text, label, dark, compact, onPress }: { icon?: typeof ArrowLeft; text?: string; label: string; dark?: boolean; compact?: boolean; onPress?: () => void }) { return <Pressable accessibilityRole="button" accessibilityLabel={label} hitSlop={compact ? 4 : undefined} onPress={onPress} style={[styles.roundAction, compact && styles.roundActionCompact, dark && styles.roundActionDark]}>{Icon ? <Icon size={compact ? 17 : 19} color={dark ? palette.white : '#0D315A'} strokeWidth={1.8} /> : <AppText variant="action" color={dark ? palette.white : '#0D315A'}>{text}</AppText>}</Pressable>; }
function MemberGroup({ hasRenGuest, arrival, guideVisible, guidePulse, onPress }: { hasRenGuest: boolean; arrival: Animated.Value; guideVisible: boolean; guidePulse: Animated.Value; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`Open trip members: Gops, Kat, Gum, Papi${hasRenGuest ? ', and Ren' : ', and Ari'}`} onPress={onPress} style={({ pressed }) => [styles.memberGroup, pressed && styles.pressed]}>{tripMembers.slice(0, 4).map(({ initials, image }, index) => <Image key={initials} source={image} resizeMode="cover" style={[styles.memberInitial, index === 0 && styles.avatarFirst, { zIndex: index + 1 }]} />)}{hasRenGuest ? <Animated.Image source={renImage} resizeMode="cover" style={[styles.memberInitial, { zIndex: 6, opacity: arrival, transform: [{ scale: arrival.interpolate({ inputRange: [0, 1], outputRange: [.72, 1] }) }] }]} /> : null}<GuidePulse visible={guideVisible} pulse={guidePulse} /></Pressable>;
}
function ActivityParticipants({ align = 'left', inline = false }: { align?: 'left' | 'right'; inline?: boolean }) {
  const visibleMembers = tripMembers.slice(0, 3);
  const remaining = tripMembers.length - visibleMembers.length;
  return <View accessible accessibilityLabel="Participants: Gops, Kat, Gum, and 2 more" style={[styles.activityParticipants, align === 'right' && styles.activityParticipantsRight, inline && styles.activityParticipantsInline]}>{visibleMembers.map(({ initials, image }, index) => <Image key={initials} source={image} resizeMode="cover" style={[styles.activityParticipantAvatar, index === 0 && styles.avatarFirst, { zIndex: index + 1 }]} />)}{remaining > 0 ? <View style={[styles.activityParticipantOverflow, { zIndex: visibleMembers.length + 1 }]}><AppText variant="supporting" color={palette.ink} style={styles.activityParticipantOverflowText}>+{remaining}</AppText></View> : null}</View>;
}
function Tool({ icon: Icon, label, expandedWidth, collapse }: { icon: typeof Folder; label: string; expandedWidth: number; collapse: Animated.Value }) {
  const width = collapse.interpolate({ inputRange: [0, 1], outputRange: [expandedWidth, 36] });
  const labelOpacity = collapse.interpolate({ inputRange: [0, 0.55, 1], outputRange: [1, 0.6, 0] });
  const labelScale = collapse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.78] });
  const labelShift = collapse.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  return <Animated.View style={[styles.toolAnimated, { width }]}><Pressable accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [styles.tool, toolGlassStyle, pressed && styles.pressed]}><View style={styles.toolIcon}><Icon size={16} color="#0D315A" strokeWidth={1.7} /></View><Animated.View pointerEvents="none" style={[styles.toolLabel, { opacity: labelOpacity, transform: [{ translateX: labelShift }, { scale: labelScale }] }]}><AppText variant="caption" numberOfLines={1}>{label}</AppText></Animated.View></Pressable></Animated.View>;
}
function NavItem({ icon: Icon, label, active, onPress }: { icon: typeof House; label: string; active?: boolean; onPress: () => void }) { const color = active ? palette.navy : palette.inkSoft; const strokeWidth = active ? 1.65 : 1.3; return <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} accessibilityLabel={label} onPress={onPress} style={styles.navItem}>{active ? <LinearGradient pointerEvents="none" colors={['rgba(43,125,233,0.20)', 'rgba(43,125,233,0)']} locations={[0, 1]} style={styles.navItemGradient} /> : null}<View style={styles.navIcon}>{label === 'Home' ? <HomeNavIcon active={active} size={22} color={color} strokeWidth={strokeWidth} /> : <Icon size={22} color={color} strokeWidth={strokeWidth} />}</View><AppText variant="caption" color={color} style={!active && styles.navLabelInactive}>{label}</AppText></Pressable>; }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.surface }, scroll: { paddingBottom: 120 }, mapHero: { height: 282 }, floatingTripNav: { position: 'absolute', zIndex: 40, top: 0, left: 0, right: 0, shadowColor: palette.ink, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 }, floatingTripNavInner: { flex: 1, paddingTop: Platform.OS === 'web' ? 44 : 18, paddingHorizontal: 12, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, floatingTripCopy: { height: 42, overflow: 'hidden', justifyContent: 'center' }, floatingTripActions: { flexDirection: 'row', alignItems: 'center', gap: 4 }, floatingShareSlot: { height: 36, overflow: 'hidden' }, memberGroup: { height: 42, paddingHorizontal: 5, borderRadius: 21, backgroundColor: palette.surface, flexDirection: 'row', alignItems: 'center', shadowColor: palette.ink, shadowOpacity: .09, shadowRadius: 8 }, memberInitial: { width: 32, height: 32, marginLeft: -7, borderRadius: 16, borderWidth: 2, borderColor: palette.surface }, avatarFirst: { marginLeft: 0 }, roundAction: { width: 42, height: 42, borderRadius: 21, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center', shadowColor: palette.ink, shadowOpacity: .09, shadowRadius: 8 }, roundActionCompact: { width: 36, height: 36, borderRadius: 18 }, roundActionDark: { backgroundColor: '#0D315A' },
  overviewPage: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, backgroundColor: palette.surface },
  overviewHero: { padding: 18, borderRadius: 22, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surfaceMuted, gap: 9, shadowColor: palette.ink, shadowOpacity: .035, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  overviewHeroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  overviewHeroTitle: { maxWidth: 250, marginTop: 4, color: palette.ink },
  overviewDayBadge: { width: 52, height: 52, borderRadius: 26, backgroundColor: palette.skySoft, alignItems: 'center', justifyContent: 'center' },
  overviewProgressTrack: { height: 7, marginTop: 4, borderRadius: 4, backgroundColor: palette.line, overflow: 'hidden' },
  overviewProgressFill: { width: '92%', height: 7, borderRadius: 4, backgroundColor: palette.sky },
  overviewMemoriesLink: { minHeight: 34, marginTop: 1, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 3 },
  overviewSectionHeading: { marginTop: 24, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  overviewHighlights: { gap: 12 },
  overviewCard: { padding: 14, borderRadius: 20, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, shadowColor: palette.ink, shadowOpacity: .035, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  overviewCardPressed: { opacity: .82, transform: [{ scale: .992 }] },
  overviewCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  overviewCardHeading: { flex: 1, minWidth: 0 },
  overviewIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  overviewPollCard: { minHeight: 88, paddingHorizontal: 14, paddingVertical: 13, borderRadius: 20, borderWidth: 1, borderColor: palette.violet, backgroundColor: palette.violetSoft, flexDirection: 'row', alignItems: 'center', gap: 11 },
  overviewPollIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: palette.navy, alignItems: 'center', justifyContent: 'center' },
  overviewIconBlue: { backgroundColor: palette.skySoft },
  overviewIconMint: { backgroundColor: palette.mossSoft },
  overviewIconViolet: { backgroundColor: palette.violetSoft },
  overviewIconSand: { backgroundColor: palette.sunSoft },
  overviewIconCoral: { backgroundColor: palette.coralSoft },
  overviewPlanPreview: { marginTop: 12, minHeight: 66, paddingTop: 12, borderTopWidth: 1, borderTopColor: palette.line, flexDirection: 'row', alignItems: 'center', gap: 11 },
  overviewPlanImage: { width: 62, height: 62, borderRadius: 15, backgroundColor: palette.surfaceMuted },
  overviewPlanCopy: { flex: 1, minWidth: 0, gap: 2 },
  overviewMetricRow: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: palette.line, flexDirection: 'row', alignItems: 'center' },
  overviewMetric: { flex: 1, gap: 1 },
  overviewMetricDivider: { width: 1, height: 36, marginHorizontal: 14, backgroundColor: palette.line },
  overviewSavedStrip: { height: 54, marginTop: 13, flexDirection: 'row', alignItems: 'center' },
  overviewSavedImage: { width: 54, height: 54, marginRight: -8, borderRadius: 16, borderWidth: 2, borderColor: palette.surface, backgroundColor: palette.surfaceMuted },
  overviewSavedMore: { width: 54, height: 54, marginLeft: -8, borderRadius: 16, borderWidth: 2, borderColor: palette.surface, backgroundColor: palette.violetSoft, alignItems: 'center', justifyContent: 'center' },
  overviewGuideTags: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  overviewCardFooter: { marginTop: 10 },
  overviewJournalRow: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: palette.line, flexDirection: 'row', alignItems: 'center', gap: 11 },
  overviewJournalImage: { width: 74, height: 54, borderRadius: 14, backgroundColor: palette.surfaceMuted },
  savedPage: { paddingBottom: 42, backgroundColor: palette.surface },
  savedIntro: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  savedIntroIcon: { width: 44, height: 44, borderRadius: 16, backgroundColor: palette.violetSoft, alignItems: 'center', justifyContent: 'center' },
  savedFilters: { paddingHorizontal: 20, paddingBottom: 18, gap: 8 },
  savedFilter: { minHeight: 40, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center' },
  savedFilterActive: { borderColor: palette.navy, backgroundColor: palette.navy },
  savedSection: { marginBottom: 24 },
  savedSectionHeader: { minHeight: 34, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  savedList: { paddingHorizontal: 16, gap: 10 },
  savedPlaceCard: { minHeight: 112, padding: 8, borderRadius: 20, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, flexDirection: 'row', alignItems: 'stretch', gap: 12, shadowColor: palette.ink, shadowOpacity: .035, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  savedPlaceImage: { width: 100, minHeight: 96, borderRadius: 15, backgroundColor: palette.surfaceMuted },
  savedPlaceBody: { flex: 1, minWidth: 0, paddingVertical: 4, justifyContent: 'space-between' },
  savedPlaceTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 7 },
  savedPlaceTitle: { flex: 1, minWidth: 0 },
  savedBookmark: { width: 34, height: 34, marginTop: -2, borderRadius: 17, backgroundColor: palette.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  savedBookmarkActive: { backgroundColor: palette.navy },
  savedPlaceMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  savedRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  savedTravel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  expensesScreen: { flex: 1, backgroundColor: palette.surface },
  expensesScroll: { paddingBottom: 132 },
  expensesTopHeader: { minHeight: Platform.OS === 'web' ? 104 : 78, paddingTop: Platform.OS === 'web' ? 44 : 18, paddingHorizontal: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: palette.line, backgroundColor: palette.surface, flexDirection: 'row', alignItems: 'center', gap: 8 },
  expensesTripCopy: { flex: 1, minWidth: 56, justifyContent: 'center' },
  expensesHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  expensesTripIntro: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 18, backgroundColor: palette.surface },
  expensesTripMeta: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  expensesTools: { flexDirection: 'row', gap: 7 },
  expenseTool: { minHeight: 42, paddingHorizontal: 12, borderRadius: 21, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, flexDirection: 'row', alignItems: 'center', gap: 7 },
  expensesCity: { marginTop: 4, color: palette.ink },
  expensesTabs: { zIndex: 10, width: '100%', paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: palette.line, backgroundColor: palette.surface, flexDirection: 'row' },
  expensesTab: { flex: 1, height: 50, alignItems: 'center', justifyContent: 'center' },
  expensesTabActive: { position: 'absolute', bottom: 0, width: 54, height: 2, borderRadius: 1, backgroundColor: palette.ink },
  expensesBody: { backgroundColor: palette.surface },
  expenseSummaryCard: { marginHorizontal: 20, marginTop: 16, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface },
  expenseSummaryTop: { minHeight: 48, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  expenseParticipants: { height: 34, paddingLeft: 7, flexDirection: 'row', alignItems: 'center' },
  expenseParticipantAvatar: { width: 32, height: 32, marginLeft: -7, borderRadius: 16, borderWidth: 2, borderColor: palette.surface },
  expenseParticipantMore: { width: 32, height: 32, marginLeft: -7, borderRadius: 16, borderWidth: 1.5, borderColor: palette.line, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center' },
  expenseAddButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: palette.navy, backgroundColor: palette.navy, alignItems: 'center', justifyContent: 'center', shadowColor: palette.ink, shadowOpacity: .1, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  expenseAddBadge: { position: 'absolute', top: 2, right: 1, width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: palette.surface, backgroundColor: palette.white, alignItems: 'center', justifyContent: 'center' },
  expenseSpentLabel: { marginTop: 4 },
  expenseSpentAmount: { marginTop: 2, color: palette.ink },
  expenseBudgetTrack: { height: 8, marginTop: 14, borderRadius: 4, backgroundColor: palette.line, overflow: 'hidden' },
  expenseBudgetProgress: { height: 8, borderRadius: 4, backgroundColor: palette.navy },
  expenseBudgetMeta: { minHeight: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  expenseBudgetEdit: { alignSelf: 'flex-start', minHeight: 36, marginTop: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  expenseBudgetLeft: { minHeight: 28, paddingHorizontal: 10, borderRadius: 14, backgroundColor: palette.mossSoft, alignItems: 'center', justifyContent: 'center' },
  expenseAnalysisLink: { alignSelf: 'flex-start', minHeight: 40, paddingHorizontal: 0 },
  expenseViewTabs: { marginHorizontal: 20, marginTop: 20, borderBottomWidth: 1, borderBottomColor: palette.line, flexDirection: 'row' },
  expenseViewTab: { flex: 1, minHeight: 48, borderBottomWidth: 2, borderBottomColor: 'transparent', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  expenseViewTabActive: { borderBottomColor: palette.navy },
  expenseList: { marginHorizontal: 20, marginTop: 10 },
  expenseRow: { minHeight: 68, borderBottomWidth: 1, borderBottomColor: palette.line, flexDirection: 'row', alignItems: 'center', gap: 12 },
  expenseRowMain: { flex: 1, minWidth: 0, gap: 3 },
  expenseRowAmount: { alignItems: 'flex-end', gap: 3 },
  expenseViewAll: { alignSelf: 'flex-start', minHeight: 48, marginBottom: 90, paddingHorizontal: 0 },
  expenseBalancePanel: { marginHorizontal: 20, marginTop: 20, paddingVertical: 12 },
  expenseBalanceCard: { marginHorizontal: 20, marginTop: 16, padding: 18, borderRadius: 18, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface },
  expenseBalanceMessage: { maxWidth: 310, marginTop: 6 },
  expenseBalanceLink: { alignSelf: 'flex-start', marginTop: 10, paddingHorizontal: 0 },
  balancePreviewRow: { minHeight: 48, borderBottomWidth: 1, borderBottomColor: palette.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  balancePreviewMain: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 8 },
  expenseEmptyState: { minHeight: 310, paddingHorizontal: 32, paddingTop: 64, alignItems: 'center' },
  expenseEmptyIcon: { width: 52, height: 52, marginBottom: 16, borderRadius: 26, backgroundColor: palette.skySoft, alignItems: 'center', justifyContent: 'center' },
  expenseEmptyCopy: { maxWidth: 280, marginTop: 6, marginBottom: 20, textAlign: 'center' },
  allExpensesFrame: { flex: 1 },
  allExpensesHeader: { flexShrink: 0, minHeight: 58, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  allExpensesHeaderButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: palette.canvas, alignItems: 'center', justifyContent: 'center' },
  allExpensesHeaderCopy: { flex: 1, minWidth: 0, gap: 1 },
  allExpensesHeaderIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  allExpensesScroll: { flex: 1 },
  allExpensesContent: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 100 },
  allExpensesSummaryRow: { minHeight: 108, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 },
  allExpensesAnalysis: { minHeight: 38, marginTop: 2, paddingHorizontal: 13, borderRadius: 19, backgroundColor: palette.skySoft, flexDirection: 'row', alignItems: 'center', gap: 7 },
  allExpensesFilters: { paddingVertical: 16, gap: 8 },
  allExpensesFilter: { minHeight: 40, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center' },
  allExpensesFilterActive: { backgroundColor: palette.navy, borderColor: palette.navy },
  allExpensesDay: { marginTop: 12 },
  allExpensesDayHeader: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  allExpensesRow: { minHeight: 72, borderBottomWidth: 1, borderBottomColor: palette.line, flexDirection: 'row', alignItems: 'center', gap: 12 },
  allExpensesCategoryIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  allExpensesRowCopy: { flex: 1, minWidth: 0, gap: 2 },
  allExpensesAdd: { position: 'absolute', right: 20, bottom: 18, minWidth: 142, shadowColor: palette.ink, shadowOpacity: .14, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 6 },
  analysisContent: { paddingHorizontal: 20, paddingBottom: 40 },
  analysisHeader: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 10 },
  analysisHeaderButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: palette.canvas, alignItems: 'center', justifyContent: 'center' },
  analysisHeaderCopy: { flex: 1, minWidth: 0, gap: 1 },
  analysisSummary: { marginTop: 20 },
  analysisTotal: { marginTop: 3, color: palette.ink },
  analysisBudgetTrack: { height: 8, marginTop: 14, borderRadius: 4, backgroundColor: palette.line, overflow: 'hidden' },
  analysisBudgetFill: { width: '13%', height: 8, borderRadius: 4, backgroundColor: palette.sky },
  analysisBudgetMeta: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  analysisBudgetLeft: { minHeight: 30, paddingHorizontal: 11, borderRadius: 15, backgroundColor: palette.mossSoft, alignItems: 'center', justifyContent: 'center' },
  analysisSectionTitle: { marginTop: 26, marginBottom: 10 },
  analysisYoursCard: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, borderRadius: 20, backgroundColor: palette.canvas },
  analysisYoursColumns: { paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: palette.line, flexDirection: 'row', gap: 18 },
  analysisYoursColumn: { flex: 1, gap: 4 },
  analysisYoursFooter: { minHeight: 48, paddingTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  analysisSettleLink: { minHeight: 40, paddingHorizontal: 0 },
  analysisCategoryList: { gap: 6 },
  analysisCategoryRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 10 },
  analysisCategoryIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  analysisCategoryBody: { flex: 1, gap: 7 },
  analysisCategoryMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  analysisCategoryTrack: { height: 6, borderRadius: 3, backgroundColor: palette.line, overflow: 'hidden' },
  analysisCategoryFill: { height: 6, borderRadius: 3 },
  analysisCategoryPercent: { width: 30, textAlign: 'right' },
  analysisChart: { paddingTop: 8 },
  analysisChartPlot: { height: 170, borderBottomWidth: 1, borderBottomColor: palette.line, flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  analysisChartColumn: { flex: 1, height: 166, alignItems: 'center', justifyContent: 'flex-end', gap: 5 },
  analysisChartValue: { minHeight: 18, alignItems: 'center', justifyContent: 'center' },
  analysisChartBar: { width: '66%', maxWidth: 38, minHeight: 4, borderTopLeftRadius: 7, borderTopRightRadius: 7, backgroundColor: palette.skySoft },
  analysisChartBarActive: { backgroundColor: palette.navy },
  analysisChartLabels: { minHeight: 32, paddingTop: 7, flexDirection: 'row', gap: 8 },
  analysisChartLabel: { flex: 1, textAlign: 'center' },
  analysisPayerList: { borderTopWidth: 1, borderTopColor: palette.line },
  analysisPayerRow: { minHeight: 66, borderBottomWidth: 1, borderBottomColor: palette.line, flexDirection: 'row', alignItems: 'center', gap: 11 },
  analysisPayerAvatar: { width: 38, height: 38, borderRadius: 19 },
  analysisPayerCopy: { flex: 1, minWidth: 0, gap: 2 },
  settleUpContent: { paddingHorizontal: 20, paddingBottom: 32 },
  settleUpTotal: { marginTop: 8, color: palette.ink },
  settleProgressCard: { marginTop: 24, padding: 16, borderRadius: 18, backgroundColor: palette.canvas, gap: 12 },
  settleProgressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  settleProgressTrack: { height: 9, borderRadius: 5, backgroundColor: palette.surface, overflow: 'hidden' },
  settleProgressFill: { height: 9, borderRadius: 5, backgroundColor: palette.sky },
  settleSectionLabel: { marginTop: 28, marginBottom: 12 },
  settleCombinedCard: { marginTop: 28, borderRadius: 20, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, overflow: 'hidden' },
  settleActionBlock: { padding: 16, gap: 14 },
  settleCombinedDivider: { height: 1, backgroundColor: palette.line },
  settleOthersBlock: { paddingHorizontal: 16, paddingTop: 16 },
  settleTransferHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settleTransferCopy: { flex: 1, minWidth: 0, gap: 2 },
  settleAvatarLarge: { width: 54, height: 54, borderRadius: 27 },
  settleAvatarSmall: { width: 42, height: 42, borderRadius: 21 },
  settleStatus: { minHeight: 30, paddingHorizontal: 12, borderRadius: 15, backgroundColor: palette.sunSoft, alignItems: 'center', justifyContent: 'center' },
  settleStatusDone: { backgroundColor: palette.mossSoft },
  settleActionRow: { marginTop: 2, flexDirection: 'row', gap: 10 },
  settleActionButton: { flex: 1, minWidth: 0 },
  settleSectionHeader: { marginBottom: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  otherTransferRow: { minHeight: 70, borderBottomWidth: 1, borderBottomColor: palette.line, flexDirection: 'row', alignItems: 'center', gap: 10 },
  otherTransferPeople: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  otherTransferLabel: { flex: 1, minWidth: 0 },
  transferPendingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D9782D' },
  personBalanceRow: { minHeight: 68, borderBottomWidth: 1, borderBottomColor: palette.line, flexDirection: 'row', alignItems: 'center', gap: 12 },
  personBalanceCopy: { flex: 1, minWidth: 0, gap: 2 },
  personBalanceAmount: { minHeight: 32, paddingHorizontal: 12, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  personBalancePositive: { backgroundColor: palette.mossSoft },
  personBalanceNegative: { backgroundColor: palette.sunSoft },
  markPaidContent: { paddingHorizontal: 20, paddingBottom: 20, gap: 14 },
  markPaidMethods: { gap: 4 },
  markPaidMethod: { minHeight: 42, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: 'transparent', flexDirection: 'row', alignItems: 'center', gap: 12 },
  markPaidMethodSelected: { borderColor: palette.sky, backgroundColor: palette.skySoft },
  markPaidRadio: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: palette.inkSoft, alignItems: 'center', justifyContent: 'center' },
  markPaidRadioSelected: { borderColor: palette.sky },
  markPaidRadioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: palette.sky },
  markPaidActions: { gap: 8 },
  addExpenseContent: { minHeight: 680, paddingHorizontal: 20, paddingBottom: 28 },
  addExpenseHeader: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addExpenseHeaderIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: palette.navy, alignItems: 'center', justifyContent: 'center', shadowColor: palette.ink, shadowOpacity: .1, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  scanResultHeader: { minHeight: 94, justifyContent: 'space-between' },
  scanResultBack: { minHeight: 40, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8 },
  scannedReceiptBlock: { marginTop: 18, borderRadius: 18, borderWidth: 1, borderColor: palette.line, overflow: 'hidden', backgroundColor: palette.navySoft },
  scannedReceiptCapture: { position: 'relative', height: 182, backgroundColor: palette.surfaceMuted, overflow: 'hidden' },
  scannedReceiptImage: { width: '100%', height: '100%' },
  scannedReceiptDisclaimer: { position: 'absolute', top: 0, right: 0, left: 0, minHeight: 46, paddingHorizontal: 14, paddingTop: 10 },
  scannedReceiptDetected: { minHeight: 52, paddingLeft: 16, paddingRight: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  scannedReceiptLineItemsTarget: { position: 'relative', minHeight: 40, justifyContent: 'center' },
  scannedReceiptLineItemsAction: { minHeight: 40, paddingHorizontal: 8 },
  lineItemPageContent: { minHeight: 680, paddingHorizontal: 20, paddingBottom: 28 },
  lineItemPageHeader: { minHeight: 108, alignItems: 'flex-start', gap: 10 },
  lineItemPageBack: { minHeight: 40, marginLeft: -4, paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center', gap: 8 },
  lineItemPageTitle: { width: '100%', minWidth: 0, gap: 2 },
  globalParticipantEditor: { marginTop: 28, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, gap: 14 },
  lineItemCards: { marginTop: 20, gap: 12 },
  lineItemCard: { padding: 14, borderRadius: 18, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, gap: 12 },
  lineItemCardFields: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 10 },
  lineItemCardNameInput: { flex: 1, minWidth: 0, paddingVertical: 7, color: palette.ink, ...typography.h6 },
  lineItemCardAmount: { width: 94, minHeight: 40, paddingHorizontal: 10, borderRadius: 12, backgroundColor: palette.surfaceMuted, flexDirection: 'row', alignItems: 'center', gap: 3 },
  lineItemCardAmountInput: { flex: 1, minWidth: 0, paddingVertical: 7, color: palette.navy, textAlign: 'right', ...typography.body },
  lineItemMemberList: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  lineItemMemberChip: { minHeight: 34, paddingLeft: 4, paddingRight: 9, borderRadius: 17, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  lineItemMemberChipIncluded: { borderColor: palette.line, backgroundColor: palette.surface },
  lineItemMemberChipExcluded: { borderColor: palette.line, backgroundColor: palette.surface, opacity: .62 },
  lineItemMemberAvatar: { width: 26, height: 26, borderRadius: 13 },
  lineItemSaveButton: { marginTop: 20 },
  addExpenseAmountRow: { marginTop: 64, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2 },
  addExpenseAmountRowScanned: { marginTop: 30 },
  addExpenseAmountInput: { width: 82, paddingVertical: 0, color: palette.inkSoft, textAlign: 'left', ...typography.h2 },
  addExpenseAmountInputScanned: { color: palette.navy },
  addExpenseNameInput: { width: 210, minHeight: 44, alignSelf: 'center', borderBottomWidth: 1, borderBottomColor: palette.line, color: palette.ink, textAlign: 'center', ...typography.body },
  addExpenseSectionTitle: { marginTop: 44, marginBottom: 12, textAlign: 'center' },
  addExpenseCategoryRow: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8 },
  addExpenseCategory: { minHeight: 44, paddingHorizontal: 18, borderRadius: 22, borderWidth: 1.5, borderColor: palette.sky, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center' },
  addExpenseCategoryEdit: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  expenseCategoryPicker: { paddingHorizontal: 20, paddingBottom: 20, gap: 6 },
  expenseCategoryOption: { minHeight: 48, paddingHorizontal: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  expenseCategoryOptionSelected: { backgroundColor: palette.navySoft },
  addExpensePayers: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  expensePayerAddButton: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center' },
  payerPickerContent: { paddingHorizontal: 20, paddingBottom: 18, gap: 20 },
  payerPickerMembers: { minHeight: 68, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 12 },
  payerPickerMember: { alignItems: 'center', gap: 7 },
  addExpensePayer: { width: 46, height: 46 },
  addExpensePayerAvatar: { width: 44, height: 44, borderRadius: 22 },
  addExpensePayerRemove: { position: 'absolute', top: -7, right: -7, width: 26, height: 26, borderRadius: 13, backgroundColor: palette.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  addExpensePayerAdd: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center' },
  addExpenseCover: { minHeight: 44, marginTop: 36, alignSelf: 'center', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 14 },
  addExpenseCoverOptions: { maxWidth: 330, marginTop: 4, alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  addExpenseCoverOption: { minHeight: 40, paddingHorizontal: 12, borderRadius: 20, backgroundColor: palette.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  addExpenseCoverOptionActive: { backgroundColor: palette.navy },
  expenseSplitEqual: { marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 10 },
  expenseSplitAdd: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center' },
  expenseSplitList: { width: '100%', maxWidth: 320, marginTop: 10, alignSelf: 'center', gap: 8 },
  expenseSplitRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 14 },
  expenseSplitRowInactive: { opacity: .52 },
  splitMemberAvatarWrap: { width: 46, height: 46 },
  splitMemberAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: palette.line },
  memberToggleInactive: { opacity: .62 },
  splitMemberToggle: { position: 'absolute', top: -6, right: -6, width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center' },
  splitMemberToggleActive: { backgroundColor: palette.surfaceMuted },
  expensePercentControl: { flex: 1, minHeight: 48, justifyContent: 'flex-end', paddingBottom: 10 },
  expenseSplitValue: { alignSelf: 'flex-end', marginBottom: 7 },
  expensePercentTrack: { height: 6, borderRadius: 3, backgroundColor: palette.line },
  expensePercentFill: { height: 6, borderRadius: 3, backgroundColor: palette.sky },
  expensePercentKnob: { position: 'absolute', top: -6, width: 18, height: 18, marginLeft: -9, borderRadius: 9, backgroundColor: palette.surfaceMuted, borderWidth: 1, borderColor: palette.line },
  expenseExactControl: { flex: 1, minHeight: 44, paddingHorizontal: 14, borderRadius: 22, borderWidth: 1, borderColor: palette.line, flexDirection: 'row', alignItems: 'center', gap: 6 },
  expenseExactInput: { flex: 1, paddingVertical: 0, color: palette.ink, textAlign: 'right', ...typography.body },
  expenseShareControl: { width: 128, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 8 },
  expenseShareButton: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center' },
  addExpenseSubmit: { marginTop: 56 },
  finishEditingButton: { marginTop: 28 },
  detectedLineItems: { marginTop: 34, borderRadius: 18, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, overflow: 'hidden' },
  detectedLineItemsHeader: { minHeight: 70, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  detectedLineItemsChevronOpen: { transform: [{ rotate: '180deg' }] },
  detectedLineItemsToolbar: { minHeight: 68, paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: palette.line, backgroundColor: palette.surfaceMuted, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  detectedLineItemsToolbarCopy: { flex: 1, minWidth: 0, gap: 2 },
  detectedLineItemsEditParticipants: { position: 'relative', minHeight: 44, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  detectedLineItemsList: { paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: palette.line },
  detectedLineItemRow: { minHeight: 78, borderBottomWidth: 1, borderBottomColor: palette.line, flexDirection: 'row', alignItems: 'center', gap: 12 },
  detectedLineItemCopy: { flex: 1, minWidth: 0, gap: 2 },
  detectedLineItemMeta: { alignItems: 'flex-end', gap: 3 },
  detectedLineItemSplit: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  detectedLineItemEdit: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  controlDisabled: { opacity: .45 },
  expensesOverview: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 24, backgroundColor: palette.navySoft, alignItems: 'center' },
  expensesAmount: { textAlign: 'center' },
  expensesAmountRule: { width: 150, height: 4, marginTop: 8, borderRadius: 2, backgroundColor: palette.sky },
  expensesBudgetButton: { minHeight: 44, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  expensesOverviewActions: { width: '100%', marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  expenseOverviewButton: { flex: 1, height: 44, paddingHorizontal: 12, borderRadius: 22, borderWidth: 1.2, borderColor: palette.ink, backgroundColor: palette.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  expenseBreakdownButton: { flex: 1 },
  expensesIntroCopy: { maxWidth: 340, marginTop: 20, marginHorizontal: 20 },
  expenseCategories: { marginTop: 18, marginHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  expenseCategory: { minHeight: 44, paddingHorizontal: 14, borderRadius: 22, backgroundColor: palette.surfaceMuted, flexDirection: 'row', alignItems: 'center', gap: 7 },
  groupBalanceHeader: { marginTop: 30, marginHorizontal: 20, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  expenseBalanceCopy: { marginHorizontal: 20 },
  settleUpLink: { alignSelf: 'flex-start', marginTop: 12, marginLeft: 20, paddingHorizontal: 0 },
  sheetHeader: { zIndex: 20, marginTop: -18, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: palette.surface, paddingTop: 11, paddingBottom: 20, overflow: 'hidden', shadowColor: palette.ink, shadowOpacity: .06, shadowRadius: 12, shadowOffset: { width: 0, height: -4 } }, handle: { width: 42, height: 4, borderRadius: 2, backgroundColor: palette.sheetHandle, alignSelf: 'center', marginBottom: 22 }, tripMeta: { minHeight: 20, paddingHorizontal: 20, paddingRight: 210, flexDirection: 'row', alignItems: 'center' }, tools: { position: 'absolute', right: 20, top: 0, flexDirection: 'row', gap: 6 }, toolAnimated: { height: 36, overflow: 'hidden', borderRadius: 18 }, tool: { flex: 1, minHeight: 36, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(226,233,241,.72)', backgroundColor: 'rgba(252,253,254,.58)', overflow: 'hidden', shadowColor: palette.ink, shadowOpacity: .05, shadowRadius: 6 }, toolIcon: { position: 'absolute', left: 0, top: 0, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }, toolLabel: { position: 'absolute', left: 31, right: 6, top: 0, bottom: 0, justifyContent: 'center', transformOrigin: 'left center' }, city: { paddingHorizontal: 20, marginTop: 6, color: '#0D315A' },
  subnavSticky: { zIndex: 30, backgroundColor: palette.surface }, compactTripSpacer: { overflow: 'hidden', backgroundColor: palette.surface }, subnav: { width: '100%', height: 48, borderBottomWidth: 1, borderBottomColor: palette.line, backgroundColor: palette.surface, flexDirection: 'row', overflow: 'visible' }, subnavScroll: { flex: 1 }, subnavScrollContent: { minWidth: '100%' }, subnavTrack: { position: 'relative', height: 48, flexDirection: 'row' }, subnavItem: { height: 48, alignItems: 'center', justifyContent: 'center' }, subnavLabel: { minHeight: 30, paddingHorizontal: 2, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }, tabMenuButton: { width: 44, height: 48, marginRight: -4, marginBottom: -1, borderBottomWidth: 1, borderBottomColor: palette.line, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surface }, savedTabMarked: { backgroundColor: palette.skySoft }, savedCount: { minWidth: 17, height: 17, paddingHorizontal: 4, borderRadius: 9, backgroundColor: palette.sky, alignItems: 'center', justifyContent: 'center' }, subnavActive: { position: 'absolute', bottom: 0, height: 2, borderRadius: 1, backgroundColor: '#0D315A' }, sheetBody: { backgroundColor: palette.surface }, tabPlaceholder: { minHeight: 430, paddingHorizontal: 28, paddingTop: 74, alignItems: 'center' }, tabPlaceholderIcon: { width: 48, height: 48, marginBottom: 16, borderRadius: 24, backgroundColor: palette.skySoft, alignItems: 'center', justifyContent: 'center' }, tabPlaceholderCopy: { maxWidth: 280, marginTop: 8, textAlign: 'center' }, days: { padding: 16, gap: 8 }, day: { minWidth: 72, height: 44, paddingHorizontal: 14, borderRadius: 22, backgroundColor: '#F0F5FB', alignItems: 'center', justifyContent: 'center' }, dayMenuCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F0F5FB', alignItems: 'center', justifyContent: 'center' }, dayActive: { backgroundColor: '#0D315A' }, dayPressed: { opacity: .72, transform: [{ scale: .97 }] }, weather: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingHorizontal: 24, marginBottom: 18 },
  addActivityLink: { minHeight: 44, marginTop: -8, marginRight: 12, marginBottom: 6, alignSelf: 'flex-end' },
  timeline: { paddingHorizontal: 16 }, activityRow: { minHeight: 150, flexDirection: 'row' }, rail: { width: 50, alignItems: 'center' }, number: { width: 34, height: 34, borderRadius: 17, backgroundColor: palette.coralSoft, alignItems: 'center', justifyContent: 'center' }, numberVisited: { backgroundColor: palette.success }, railLine: { flex: 1, width: 2, marginVertical: 8, backgroundColor: '#E3EDF5' }, activityCard: { position: 'relative', minHeight: 116, borderRadius: 18, borderWidth: 1, borderColor: palette.line, padding: 14 }, activityCardCurrent: { minHeight: 132, padding: 0, overflow: 'hidden' }, activityTop: { flexDirection: 'row', gap: 8 }, activityCurrentTop: { minHeight: 132, flexDirection: 'row', alignItems: 'stretch', gap: 8 }, activityThumbnail: { width: 96, alignSelf: 'stretch', borderRadius: 0, backgroundColor: palette.surfaceMuted }, activityCurrentCopy: { flex: 1, minWidth: 0, paddingVertical: 14 }, activityCurrentMeta: { marginTop: 7, alignItems: 'flex-start', gap: 7 }, activityCurrentActions: { position: 'relative', width: 48, flexShrink: 0, paddingTop: 4, alignItems: 'center' }, activityCurrentPrice: { position: 'absolute', top: 32, left: 0, width: 48, textAlign: 'center' }, activityCurrentComment: { position: 'absolute', right: 15, bottom: 14 }, activitySchedule: { marginBottom: 2 }, activityTitleLine: { flexDirection: 'row', alignItems: 'center' }, activityTitle: { flex: 1 }, activityDescription: { marginTop: 4 }, activityAside: { minWidth: 94, alignItems: 'flex-end' }, activityAsideActions: { minHeight: 54, alignItems: 'flex-end', justifyContent: 'flex-start' }, activityParticipants: { flexDirection: 'row', alignItems: 'center', marginTop: 5, marginBottom: 1, paddingLeft: 6 }, activityParticipantsRight: { alignSelf: 'flex-end', paddingLeft: 0, paddingRight: 0 }, activityParticipantsInline: { marginTop: 0, marginBottom: 0 }, activityParticipantAvatar: { width: 22, height: 22, marginLeft: -6, borderRadius: 11, borderWidth: 1.5, borderColor: palette.surface }, activityParticipantOverflow: { width: 22, height: 22, marginLeft: -6, borderRadius: 11, borderWidth: 1.5, borderColor: palette.surface, backgroundColor: palette.surfaceMuted, alignItems: 'center', justifyContent: 'center' }, activityParticipantOverflowText: { fontSize: 8, lineHeight: 10, textAlign: 'center' }, itemMore: { width: 44, height: 44, marginTop: -12, marginRight: -13, alignItems: 'center', justifyContent: 'center', borderRadius: 22 }, itemMoreCurrent: { marginTop: -2, marginRight: 0 }, itemMoreAside: { marginTop: -12, marginRight: -13 }, activityBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 15, marginTop: 12 }, activityTag: { marginRight: 'auto' }, walk: { height: 40, flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 12 },
  addStop: { paddingTop: 4, paddingBottom: 24 }, addStopButton: { alignItems: 'flex-start', paddingHorizontal: 28, borderRadius: 0 },
  bottomNav: { position: 'absolute', left: 12, right: 12, bottom: 12, height: 64, borderRadius: 32, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, flexDirection: 'row', paddingVertical: 4, overflow: 'hidden', shadowColor: palette.ink, shadowOpacity: .12, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 8 }, navItem: { position: 'relative', flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 }, navItemGradient: { position: 'absolute', top: 2, left: 4, right: 4, bottom: 2, borderRadius: 27 }, navIcon: { width: 54, height: 32, alignItems: 'center', justifyContent: 'center' }, navLabelInactive: { fontWeight: '400' }, navActionItem: { flex: 1, alignItems: 'center', justifyContent: 'center' }, navActionCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: palette.navy, alignItems: 'center', justifyContent: 'center', shadowColor: palette.navy, shadowOpacity: .18, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  actionsContent: { paddingHorizontal: 20, paddingBottom: 28 }, aiAction: { height: 52, borderRadius: 26, borderWidth: 1.2, borderColor: palette.inkSoft, paddingLeft: 16, paddingRight: 5, flexDirection: 'row', alignItems: 'center', gap: 10 }, aiPlaceholder: { flex: 1 }, aiSend: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: buttonTokens.primaryBackground },
  manageTabsContent: { paddingHorizontal: 20, paddingBottom: 24 },
  manageTabsList: { gap: 2 },
  manageTabRow: { minHeight: 64, borderBottomWidth: 1, borderBottomColor: palette.line, flexDirection: 'row', alignItems: 'center', gap: 8 },
  manageTabCopy: { flex: 1, gap: 2 },
  manageTabOrder: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  manageTabOrderButton: { width: 30, height: 40, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  manageTabControlDisabled: { opacity: .28 },
  manageTabLocked: { width: 44, height: 44, borderRadius: 22, backgroundColor: palette.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  manageTabToggle: { width: 44, height: 44, borderRadius: 22, backgroundColor: palette.navy, alignItems: 'center', justifyContent: 'center' },
  manageTabToggleActive: { borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface },
  quickActions: { flexDirection: 'row', gap: 9, marginTop: 22 }, quickAction: { flex: 1, minHeight: 142, padding: 12, borderRadius: 22, backgroundColor: palette.navySoft, justifyContent: 'space-between' }, quickActionExpense: { backgroundColor: palette.mossSoft }, quickActionIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center' }, quickActionIconExpense: { backgroundColor: palette.surface }, quickActionLabel: { minHeight: 38 },
  actionSection: { marginTop: 24 }, actionSectionTitle: { marginBottom: 4 }, actionRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: palette.line }, actionRowPressed: { backgroundColor: palette.canvas }, actionRowIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.navySoft }, actionRowIconGreen: { backgroundColor: palette.mossSoft }, actionRowIconWarm: { backgroundColor: palette.sunSoft }, premium: { height: 24, paddingHorizontal: 12, borderRadius: 12, backgroundColor: palette.navy, justifyContent: 'center' }, pressed: { opacity: .72, transform: [{ scale: .97 }] },
  itemActionsContent: { flex: 1, paddingHorizontal: 24, paddingBottom: 12 }, itemActionRow: { minHeight: 53, flexDirection: 'row', alignItems: 'center', gap: 18, borderRadius: 12, paddingHorizontal: 4 },
  manageGroupContent: { paddingHorizontal: 16, paddingBottom: 32, gap: 12, backgroundColor: palette.surface },
  manageSectionTitle: { marginTop: 8, marginBottom: 2 },
  manageMemberList: { gap: 10 },
  manageMemberRow: { minHeight: 94, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 18, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, flexDirection: 'row', alignItems: 'center', gap: 10 },
  manageAvatarWrap: { width: 78, alignItems: 'center' },
  manageAvatar: { width: 54, height: 54, borderRadius: 27 },
  manageRole: { minHeight: 22, marginTop: -8, paddingHorizontal: 8, borderRadius: 11, backgroundColor: palette.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  manageMemberCopy: { flex: 1, minWidth: 0, gap: 1 },
  manageMemberMore: { width: 30, height: 44, alignItems: 'center', justifyContent: 'center' },
  inviteFriendsCard: { marginTop: 16, padding: 20, borderRadius: 24, backgroundColor: palette.canvas, alignItems: 'center', gap: 12 },
  inviteFriendsIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: palette.skySoft, alignItems: 'center', justifyContent: 'center' },
  inviteFriendsCopy: { maxWidth: 260, textAlign: 'center' },
  manageHeaderAction: { minHeight: 40, paddingHorizontal: 12 },
  addMemberSheet: { flex: 1, paddingHorizontal: 20, paddingBottom: 20 },
  addMemberBack: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  addMemberIntro: { marginTop: 8, marginBottom: 20, maxWidth: 320 },
  addMemberSearch: { minHeight: 52, paddingHorizontal: 14, borderRadius: 26, borderWidth: 1.2, borderColor: palette.inkSoft, flexDirection: 'row', alignItems: 'center', gap: 10 },
  addMemberSearchInput: { flex: 1, minWidth: 0, paddingVertical: 0, color: palette.ink, fontSize: 14 },
  contactPickerAction: { position: 'relative', width: 36, height: 36, marginRight: -7, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  addMemberResults: { paddingTop: 20, paddingBottom: 8 },
  contactResultCard: { minHeight: 78, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 18, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, flexDirection: 'row', alignItems: 'center', gap: 12 },
  contactResultAvatar: { width: 50, height: 50, borderRadius: 25 },
  contactResultCopy: { flex: 1, minWidth: 0 },
  contactResultAdd: { width: 38, height: 38, borderRadius: 19, backgroundColor: palette.navySoft, alignItems: 'center', justifyContent: 'center' },
  selectedMemberCard: { minHeight: 96, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, gap: 12 },
  selectedMemberHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  removeSelectedMember: { position: 'absolute', zIndex: 2, top: -10, left: -10, width: 30, height: 30, borderRadius: 15, backgroundColor: palette.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  selectedMemberAvatar: { width: 54, height: 54, borderRadius: 27 },
  selectedMemberCopy: { flex: 1, minWidth: 0 },
  selectedDateLine: { minHeight: 30, marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 4 },
  guestToggle: { alignItems: 'center', gap: 4 },
  iosSwitch: { width: 48, height: 28, padding: 2, borderRadius: 14, backgroundColor: palette.line, justifyContent: 'center' },
  iosSwitchOn: { backgroundColor: palette.sky },
  iosSwitchPressed: { opacity: .82, transform: [{ scale: .97 }] },
  iosSwitchThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: palette.white, alignSelf: 'flex-start', shadowColor: palette.ink, shadowOpacity: .18, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  iosSwitchThumbOn: { alignSelf: 'flex-end' },
  qrInviteCard: { padding: 16, borderRadius: 18, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, gap: 14 },
  qrInviteHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qrClose: { width: 40, height: 40, borderRadius: 20, backgroundColor: palette.canvas, alignItems: 'center', justifyContent: 'center' },
  qrCodeSurface: { width: 196, height: 196, borderRadius: 18, backgroundColor: palette.surface, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', shadowColor: palette.ink, shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  addMemberActions: { marginTop: 'auto', paddingTop: 20, flexDirection: 'row', alignItems: 'center', gap: 10 },
  inviteGuideWrap: { position: 'relative', flex: 1 },
  inviteMemberButton: { width: '100%' },
  buttonDisabled: { opacity: 0.42 },
  qrInviteButton: { width: 50, height: 50, borderRadius: 14, borderWidth: 1.2, borderColor: palette.ink, alignItems: 'center', justifyContent: 'center' },
  qrInviteButtonActive: { backgroundColor: palette.navy, borderColor: palette.navy },
  toast: { position: 'absolute', zIndex: 90, left: 24, right: 24, bottom: 94, minHeight: 52, paddingHorizontal: 18, borderRadius: 18, backgroundColor: palette.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: palette.ink, shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 7 },
  activityPickerForm: { paddingHorizontal: 20, paddingBottom: 32 },
  activityNameField: { marginTop: 22, gap: 8 },
  activityNameInput: { minHeight: 48, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: palette.line, color: palette.ink, fontSize: 16, fontWeight: '400' },
  activitySearchField: { minHeight: 52, marginTop: 22, paddingHorizontal: 16, borderRadius: 26, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, flexDirection: 'row', alignItems: 'center', gap: 10 },
  activitySearchInput: { flex: 1, minHeight: 50, paddingVertical: 0, color: palette.ink, ...typography.body },
  activityPickerLabel: { marginTop: 26, marginBottom: 10 },
  categoryWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  categoryFinalRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  timeRow: { flexDirection: 'row', gap: 8 },
  activityValue: { width: 92, minHeight: 44, paddingHorizontal: 14, borderRadius: 22, borderWidth: 1.2, borderColor: palette.line, justifyContent: 'center' },
  activityValueWide: { width: 142 },
  activityValueText: { fontWeight: '500' },
  activityMemberPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  activityMemberPill: { height: 40, paddingLeft: 5, paddingRight: 7, borderRadius: 20, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, flexDirection: 'row', alignItems: 'center', gap: 5 },
  activityMemberPillAvatar: { width: 28, height: 28, borderRadius: 14 },
  activityMemberRemove: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  activityPaidByHeader: { minHeight: 46, marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  activityPaidByAdd: { minHeight: 40, paddingHorizontal: 4 },
  activityPaidByRow: { minHeight: 48, marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 10 },
  activityPaidByPill: { minHeight: 42, paddingLeft: 5, paddingRight: 14, borderRadius: 21, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, flexDirection: 'row', alignItems: 'center', gap: 8 },
  activityPaidByAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: palette.surfaceMuted },
  activityPayerPickerContent: { paddingHorizontal: 20, paddingBottom: 18, gap: 12 },
  activityPayerPickerMembers: { minHeight: 76, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 },
  activityPayerOption: { width: 54, alignItems: 'center', gap: 6 },
  activityPayerAvatarWrap: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: 'transparent', padding: 2 },
  activityPayerAvatarSelected: { borderColor: palette.sky },
  activityPayerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: palette.surfaceMuted },
  activityPayerCheck: { position: 'absolute', right: -2, bottom: -2, width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: palette.surface, backgroundColor: palette.navy, alignItems: 'center', justifyContent: 'center' },
  categoryOptionsSection: { marginTop: 2 },
  categoryOptionAction: { minHeight: 52, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, flexDirection: 'row', alignItems: 'center', gap: 10 },
  categoryOptionIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: palette.skySoft, alignItems: 'center', justifyContent: 'center' },
  categoryOptionActionLabel: { flex: 1 },
  categoryOptionChips: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  activityPickerOptions: { paddingHorizontal: 20, paddingBottom: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  activityPickerOption: { width: '31%', minHeight: 48, paddingHorizontal: 12, borderRadius: 24, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  activityPickerOptionSelected: { backgroundColor: palette.navy, borderColor: palette.navy },
  activityPickerOptionText: { fontWeight: '500' },
  restaurantList: { gap: 12, paddingRight: 20 },
  restaurantCard: { width: 246, backgroundColor: palette.surface },
  restaurantImageFrame: { width: '100%', aspectRatio: 1.42, position: 'relative' },
  restaurantCardImage: { width: '100%', height: '100%', borderRadius: 18, backgroundColor: palette.surfaceMuted },
  restaurantStatusRibbon: { position: 'absolute', top: 8, left: 8, minHeight: 24, paddingHorizontal: 9, borderRadius: 9, backgroundColor: 'rgba(13,49,90,.84)', alignItems: 'center', justifyContent: 'center' },
  restaurantAdd: { position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center', shadowColor: palette.ink, shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  restaurantRatingBadge: { position: 'absolute', left: 8, bottom: -12, minHeight: 24, paddingHorizontal: 8, borderRadius: 12, backgroundColor: palette.moss, borderWidth: 2, borderColor: palette.surface, flexDirection: 'row', alignItems: 'center', gap: 3, shadowColor: palette.ink, shadowOpacity: 0.08, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  restaurantCopy: { paddingHorizontal: 2, paddingTop: 18, paddingBottom: 4, alignItems: 'flex-start', gap: 5 },
  restaurantMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  restaurantTitleLine: { flexDirection: 'row', alignItems: 'center', gap: 3, minWidth: 0 },
  restaurantDrive: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  restaurantDriveRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4 },
  selectedSavedCard: { minHeight: 116, borderRadius: 18, borderWidth: 1, borderColor: palette.sky, backgroundColor: palette.surface, flexDirection: 'row', alignItems: 'stretch', overflow: 'hidden' },
  selectedSavedImage: { width: 122, minHeight: 116, backgroundColor: palette.surfaceMuted },
  selectedSavedCopy: { flex: 1, minWidth: 0, paddingHorizontal: 14, paddingVertical: 20, justifyContent: 'center', gap: 6 },
  selectedSavedTitle: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  selectedSavedDetails: { paddingTop: 20, paddingRight: 42, paddingBottom: 20, alignItems: 'flex-end', justifyContent: 'center', gap: 9 },
  selectedSavedRemove: { position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: palette.canvas, alignItems: 'center', justifyContent: 'center' },
  pollPrompt: { minHeight: 112, marginTop: 20, paddingHorizontal: 18, borderRadius: 24, backgroundColor: palette.surfaceMuted, alignItems: 'center', justifyContent: 'center', gap: 8 },
  inlineGuidePulse: { position: 'absolute', zIndex: 8, top: '50%', left: '50%', width: 24, height: 24, marginTop: -12, marginLeft: -12, borderRadius: 12, backgroundColor: 'rgba(255,105,212,.88)', shadowColor: '#FF69D4', shadowOpacity: .42, shadowRadius: 8 },
  activitySubmitWrap: { position: 'relative' },
  configuredPollCard: { padding: 14, borderWidth: 1, borderColor: palette.line, borderRadius: 18, backgroundColor: palette.surfaceMuted, gap: 12 },
  configuredPollHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  configuredPollEdit: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: palette.navy, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center' },
  configuredPollOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  configuredPollOption: { width: 86, gap: 5 },
  configuredPollImage: { width: 86, height: 58, borderRadius: 12, backgroundColor: palette.line },
  configuredPollName: { width: 86 },
  pollPromptRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pollSheetFrame: { flex: 1 },
  pollSheetContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 28 },
  pollBack: { alignSelf: 'flex-start', minHeight: 44, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  pollSearch: { minHeight: 52, marginTop: 24, paddingHorizontal: 16, borderRadius: 26, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, flexDirection: 'row', alignItems: 'center', gap: 10 },
  pollSearchInput: { flex: 1, minHeight: 50, paddingVertical: 0, color: palette.ink, fontSize: 14, lineHeight: 20, fontWeight: '300' },
  pollSelectedSection: { marginTop: 26, gap: 12 },
  pollSelectedList: { gap: 10 },
  pollSelectedRestaurant: { minHeight: 116, borderRadius: 18, borderWidth: 1, borderColor: palette.sky, backgroundColor: palette.surface, flexDirection: 'row', alignItems: 'stretch', overflow: 'hidden' },
  pollSelectedImage: { width: 122, minHeight: 116, backgroundColor: palette.surfaceMuted },
  pollSelectedCopy: { flex: 1, minWidth: 0, paddingHorizontal: 14, paddingVertical: 18, justifyContent: 'center', gap: 6 },
  pollSelectedTitleLine: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  pollSelectedName: { flexShrink: 1 },
  pollSelectedMeta: { minWidth: 96, paddingTop: 32, paddingRight: 14, paddingBottom: 17, alignItems: 'flex-end', justifyContent: 'center', gap: 9 },
  pollSelectedRemove: { position: 'absolute', top: 5, right: 5, width: 32, height: 32, borderRadius: 16, backgroundColor: palette.canvas, alignItems: 'center', justifyContent: 'center' },
  pollDeadline: { minHeight: 88, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surfaceMuted, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  pollDeadlineCopy: { flex: 1, gap: 7 },
  pollSavedTitle: { marginTop: 26, marginBottom: 12 },
  pollRestaurantList: { gap: 12 },
  pollAvailableAdd: { width: 42, height: 42, marginRight: 12, borderRadius: 21, backgroundColor: palette.skySoft, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  pollRestaurantCard: { width: 246, backgroundColor: palette.surface },
  pollRestaurantCardSelected: { borderWidth: 2, borderColor: palette.sky },
  pollRestaurantImage: { width: '100%', height: '100%', borderRadius: 18, backgroundColor: palette.surfaceMuted },
  pollRestaurantAdd: { position: 'absolute', top: 12, right: 12, width: 38, height: 38, borderRadius: 19, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center', shadowColor: palette.ink, shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  pollRestaurantAddSelected: { backgroundColor: palette.sky },
  pollRestaurantCopy: { paddingHorizontal: 2, paddingTop: 21, paddingBottom: 4, alignItems: 'flex-start', gap: 6 },
  pollEmpty: { minHeight: 136, borderRadius: 18, backgroundColor: palette.surfaceMuted, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 24 },
  pollFooter: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14, borderTopWidth: 1, borderTopColor: palette.line, backgroundColor: palette.surface },
  pollResultsContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 44 },
  pollAuthor: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  pollAuthorAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: palette.surfaceMuted },
  pollResultsQuestion: { marginTop: 26, marginBottom: 12 },
  pollParticipationRow: { marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  pollParticipation: { flex: 1 },
  pollCountdown: { minHeight: 30, paddingHorizontal: 10, borderRadius: 15, backgroundColor: palette.skySoft, flexDirection: 'row', alignItems: 'center', gap: 5 },
  pollCountdownClosed: { backgroundColor: palette.surfaceMuted },
  pollResultsList: { gap: 10 },
  pollResultRow: { minHeight: 116, borderRadius: 14, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, flexDirection: 'row', overflow: 'hidden' },
  pollResultWinner: { borderWidth: 2, borderColor: palette.inkSoft },
  pollResultSelected: { borderColor: palette.sky, borderWidth: 2, backgroundColor: palette.skySoft },
  pollResultImage: { width: 104, minHeight: 116, backgroundColor: palette.surfaceMuted },
  pollResultCopy: { flex: 1, minWidth: 0, paddingHorizontal: 12, paddingVertical: 13, justifyContent: 'center', gap: 4 },
  pollResultStatusLine: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pollResultVotes: { width: 84, paddingVertical: 14, paddingRight: 12, alignItems: 'flex-end', justifyContent: 'space-between' },
  pollWinningProgress: { marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 8 },
  pollNoVotes: { marginTop: 6 },
  pollProgressTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: palette.line, overflow: 'hidden' },
  pollProgressFill: { height: 4, borderRadius: 2, backgroundColor: palette.inkSoft },
  pollVoters: { flexDirection: 'row', alignItems: 'center' },
  pollVoterAvatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: palette.surface },
  pollVoterOverlap: { marginLeft: -9 },
  pollSelectedVote: { position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: palette.sky, alignItems: 'center', justifyContent: 'center' },
  pollSuggestionBy: { marginTop: 24, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 9 },
  pollSuggestionAvatar: { width: 36, height: 36, borderRadius: 18 },
  pollSuggestionCard: { minHeight: 104, borderRadius: 14, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, flexDirection: 'row', overflow: 'hidden' },
  pollSuggestionCardSelected: { borderColor: palette.sky, borderWidth: 2, backgroundColor: palette.skySoft },
  pollSuggestionImage: { width: 104, minHeight: 104, backgroundColor: palette.surfaceMuted },
  pollSuggestionCopy: { flex: 1, minWidth: 0, paddingHorizontal: 12, justifyContent: 'center', gap: 6 },
  pollSuggestionMeta: { paddingRight: 14, alignItems: 'flex-end', justifyContent: 'center', gap: 9 },
  pollWinnerNotice: { minHeight: 104, marginTop: 24, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surfaceMuted, justifyContent: 'center', gap: 5 },
  pollVoteAction: { position: 'relative', marginTop: 24 },
  pollCloseAction: { position: 'relative', marginTop: 24 },
  pollViewItinerary: { alignSelf: 'flex-start', paddingHorizontal: 0 },
  pollGeneratedCard: { minHeight: 142 },
  livePollCard: { minHeight: 142, gap: 12 },
  pollActivityHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  pollActivityEmpty: { minHeight: 38, paddingHorizontal: 12, borderRadius: 10, backgroundColor: palette.surfaceMuted, justifyContent: 'center' },
  pollActivityStatus: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 9 },
  pollLeaderSwatch: { width: 24, height: 24, backgroundColor: palette.line },
  pollActivityLink: { position: 'relative', alignSelf: 'flex-start', minHeight: 34, justifyContent: 'center' },
  pollNotification: { position: 'absolute', zIndex: 96, left: 18, right: 18, bottom: 94, minHeight: 68, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, flexDirection: 'row', alignItems: 'center', gap: 11, shadowColor: palette.ink, shadowOpacity: .14, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
  pollNotificationIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: palette.navy, alignItems: 'center', justifyContent: 'center' },
  pollNotificationCopy: { flex: 1, gap: 2 },
  activityInvite: { marginTop: 24 },
});
