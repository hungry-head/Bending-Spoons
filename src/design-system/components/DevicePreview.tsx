import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router, usePathname } from 'expo-router';
import { AccessibilityInfo, Animated, Easing, Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { palette } from '../theme/tokens';

const guidedQuests = [
  { key: 'group-management', title: 'Group Management' },
  { key: 'collaborative-decisions', title: 'Collaborative decision making' },
  { key: 'expense-tracking', title: 'Expense tracking' },
  { key: 'expense-settling', title: 'Expense settling' },
] as const;

type ChapterKey = 'open-world' | 'guided-experience' | (typeof guidedQuests)[number]['key'];
type PostCustomizeGuideStep = 'idle' | 'plus' | 'dismiss-actions';

export function DevicePreview({ children }: { children: ReactNode }) {
  if (Platform.OS !== 'web') return children;

  return <WebDevicePreview>{children}</WebDevicePreview>;
}

function WebDevicePreview({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();
  const pathname = usePathname();
  const [webReady, setWebReady] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<ChapterKey>('open-world');
  const [annotationsEnabled, setAnnotationsEnabled] = useState(true);
  const [showGuidedExitConfirmation, setShowGuidedExitConfirmation] = useState(false);
  const [guidedTripStepComplete, setGuidedTripStepComplete] = useState(false);
  const [customizeTabsOpen, setCustomizeTabsOpen] = useState(false);
  const [postCustomizeGuideStep, setPostCustomizeGuideStep] = useState<PostCustomizeGuideStep>('idle');
  const [tripScreenContext, setTripScreenContext] = useState({ activeTab: 'Overview', overlayOpen: false });
  const [addMemberFlowOpen, setAddMemberFlowOpen] = useState(false);
  const [addMemberQrOpen, setAddMemberQrOpen] = useState(false);
  const [addMemberSelection, setAddMemberSelection] = useState({ visible: false, guest: false });
  const [manageGroupOpen, setManageGroupOpen] = useState(false);
  const [groupMemberQuestComplete, setGroupMemberQuestComplete] = useState(false);
  const [renAvatarReady, setRenAvatarReady] = useState(false);
  const [pollCreatorControl, setPollCreatorControl] = useState({ visible: false, y: 0 });
  const [pollSuggestionContext, setPollSuggestionContext] = useState({ visible: false, y: 0 });
  const [expenseOverviewContext, setExpenseOverviewContext] = useState({ visible: false, summaryY: 0, detailsY: 0 });
  const [activityCategoryContext, setActivityCategoryContext] = useState({ visible: false, scrollY: 0, categoryY: 0, savedY: 0, savedVisible: false });
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);
  const [pulse] = useState(() => new Animated.Value(0));
  const [ambient] = useState(() => new Animated.Value(0));
  const [selectionMotion] = useState(() => new Animated.Value(1));
  const [annotationToggleMotion] = useState(() => new Animated.Value(1));
  const [tripAnnotationsOpacity] = useState(() => new Animated.Value(1));
  const [tripAnnotationScroll] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const hydrationTimer = setTimeout(() => setWebReady(true), 0);
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotionEnabled);
    return () => clearTimeout(hydrationTimer);
  }, []);

  useEffect(() => {
    const updateAddMemberVisibility = (event: Event) => setAddMemberFlowOpen((event as CustomEvent<{ visible: boolean }>).detail.visible);
    window.addEventListener('tripup:add-member-visibility', updateAddMemberVisibility);
    return () => window.removeEventListener('tripup:add-member-visibility', updateAddMemberVisibility);
  }, []);

  useEffect(() => {
    const updateQrVisibility = (event: Event) => setAddMemberQrOpen((event as CustomEvent<{ visible: boolean }>).detail.visible);
    window.addEventListener('tripup:add-member-qr-visibility', updateQrVisibility);
    return () => window.removeEventListener('tripup:add-member-qr-visibility', updateQrVisibility);
  }, []);

  useEffect(() => {
    const updateMemberSelection = (event: Event) => setAddMemberSelection((event as CustomEvent<{ visible: boolean; guest: boolean }>).detail);
    window.addEventListener('tripup:add-member-selection', updateMemberSelection);
    return () => window.removeEventListener('tripup:add-member-selection', updateMemberSelection);
  }, []);

  useEffect(() => {
    const updateManageGroupVisibility = (event: Event) => setManageGroupOpen((event as CustomEvent<{ visible: boolean }>).detail.visible);
    window.addEventListener('tripup:manage-group-visibility', updateManageGroupVisibility);
    return () => window.removeEventListener('tripup:manage-group-visibility', updateManageGroupVisibility);
  }, []);

  useEffect(() => {
    const completeGroupMemberQuest = () => setGroupMemberQuestComplete(true);
    window.addEventListener('tripup:group-member-invited', completeGroupMemberQuest);
    return () => window.removeEventListener('tripup:group-member-invited', completeGroupMemberQuest);
  }, []);

  useEffect(() => {
    const revealRenAvatar = () => setRenAvatarReady(true);
    window.addEventListener('tripup:ren-avatar-ready', revealRenAvatar);
    return () => window.removeEventListener('tripup:ren-avatar-ready', revealRenAvatar);
  }, []);

  useEffect(() => {
    const startCollaborativeDecisionFlow = () => {
      setManageGroupOpen(false);
      setRenAvatarReady(false);
      setPostCustomizeGuideStep('idle');
      setSelectedChapter('collaborative-decisions');
      selectionMotion.stopAnimation();
      if (reduceMotionEnabled) selectionMotion.setValue(1);
      else {
        selectionMotion.setValue(0);
        Animated.spring(selectionMotion, { toValue: 1, damping: 13, stiffness: 230, mass: .72, useNativeDriver: false }).start();
      }
      setTimeout(() => window.dispatchEvent(new CustomEvent('tripup:start-collaborative-guide')), 160);
    };
    window.addEventListener('tripup:group-management-complete', startCollaborativeDecisionFlow);
    return () => window.removeEventListener('tripup:group-management-complete', startCollaborativeDecisionFlow);
  }, [reduceMotionEnabled, selectionMotion]);

  useEffect(() => {
    const updateCustomizeTabsVisibility = (event: Event) => setCustomizeTabsOpen((event as CustomEvent<{ visible: boolean }>).detail.visible);
    window.addEventListener('tripup:tabs-menu-visibility', updateCustomizeTabsVisibility);
    return () => window.removeEventListener('tripup:tabs-menu-visibility', updateCustomizeTabsVisibility);
  }, []);

  useEffect(() => {
    const updateTripScreenContext = (event: Event) => setTripScreenContext((event as CustomEvent<{ activeTab: string; overlayOpen: boolean }>).detail);
    window.addEventListener('tripup:screen-context', updateTripScreenContext);
    return () => window.removeEventListener('tripup:screen-context', updateTripScreenContext);
  }, []);

  useEffect(() => {
    const updateTripScroll = (event: Event) => tripAnnotationScroll.setValue((event as CustomEvent<{ y: number }>).detail.y);
    window.addEventListener('tripup:trip-scroll', updateTripScroll);
    return () => window.removeEventListener('tripup:trip-scroll', updateTripScroll);
  }, [tripAnnotationScroll]);

  useEffect(() => {
    const updatePollCreatorControl = (event: Event) => setPollCreatorControl((event as CustomEvent<{ visible: boolean; y: number }>).detail);
    window.addEventListener('tripup:poll-creator-control', updatePollCreatorControl);
    return () => window.removeEventListener('tripup:poll-creator-control', updatePollCreatorControl);
  }, []);

  useEffect(() => {
    const updatePollSuggestionContext = (event: Event) => setPollSuggestionContext((event as CustomEvent<{ visible: boolean; y: number }>).detail);
    window.addEventListener('tripup:poll-suggestion-context', updatePollSuggestionContext);
    return () => window.removeEventListener('tripup:poll-suggestion-context', updatePollSuggestionContext);
  }, []);

  useEffect(() => {
    const advanceToExpenseTracking = () => {
      if (selectedChapter !== 'collaborative-decisions') return;
      setSelectedChapter('expense-tracking');
      setPollCreatorControl({ visible: false, y: 0 });
      setPollSuggestionContext({ visible: false, y: 0 });
      selectionMotion.stopAnimation();
      if (reduceMotionEnabled) selectionMotion.setValue(1);
      else {
        selectionMotion.setValue(0);
        Animated.spring(selectionMotion, { toValue: 1, damping: 13, stiffness: 230, mass: .72, useNativeDriver: false }).start();
      }
      setTimeout(() => window.dispatchEvent(new CustomEvent('tripup:start-expense-tracking-guide')), 180);
    };
    window.addEventListener('tripup:collaborative-decision-complete', advanceToExpenseTracking);
    return () => window.removeEventListener('tripup:collaborative-decision-complete', advanceToExpenseTracking);
  }, [reduceMotionEnabled, selectedChapter, selectionMotion]);

  useEffect(() => {
    const updateActivityCategoryContext = (event: Event) => setActivityCategoryContext((event as CustomEvent<{ visible: boolean; scrollY: number; categoryY: number; savedY: number; savedVisible: boolean }>).detail);
    window.addEventListener('tripup:activity-category-context', updateActivityCategoryContext);
    return () => window.removeEventListener('tripup:activity-category-context', updateActivityCategoryContext);
  }, []);

  useEffect(() => {
    const updateExpenseOverviewContext = (event: Event) => setExpenseOverviewContext((event as CustomEvent<{ visible: boolean; summaryY: number; detailsY: number }>).detail);
    window.addEventListener('tripup:expense-overview-context', updateExpenseOverviewContext);
    return () => window.removeEventListener('tripup:expense-overview-context', updateExpenseOverviewContext);
  }, []);

  useEffect(() => {
    let pulseAnimation: ReturnType<typeof Animated.loop> | undefined;
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!mounted) return;
      if (reduceMotion) {
        pulse.setValue(1);
        return;
      }
      pulseAnimation = Animated.loop(Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 720, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 720, useNativeDriver: false }),
      ]));
      pulseAnimation.start();
    });
    return () => {
      mounted = false;
      pulseAnimation?.stop();
    };
  }, [pulse]);

  useEffect(() => {
    let ambientAnimation: ReturnType<typeof Animated.loop> | undefined;
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!mounted) return;
      if (reduceMotion) {
        ambient.setValue(0.5);
        return;
      }
      ambientAnimation = Animated.loop(Animated.sequence([
        Animated.timing(ambient, { toValue: 1, duration: 18000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(ambient, { toValue: 0, duration: 22000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ]));
      ambientAnimation.start();
    });
    return () => {
      mounted = false;
      ambientAnimation?.stop();
    };
  }, [ambient]);

  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });
  const guidePulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1.34] });
  const guidePulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.72, 0.12] });
  const showChapters = webReady && width >= 1020;
  const showHomeAnnotation = showChapters && annotationsEnabled && (pathname === '/' || pathname === '/index');
  const showTripAnnotations = showChapters && annotationsEnabled && postCustomizeGuideStep === 'idle' && pathname.startsWith('/trip/') && tripScreenContext.activeTab === 'Overview' && !tripScreenContext.overlayOpen && !addMemberFlowOpen && !manageGroupOpen && (selectedChapter === 'open-world' || selectedChapter === 'guided-experience');
  const showCustomizeTabsAnnotations = showChapters && annotationsEnabled && pathname.startsWith('/trip/') && customizeTabsOpen;
  const showAddMemberAnnotation = showChapters && annotationsEnabled && pathname.startsWith('/trip/') && addMemberFlowOpen && !addMemberQrOpen;
  const showGuestMemberAnnotation = showAddMemberAnnotation && addMemberSelection.visible && !addMemberSelection.guest;
  const showGuestFinalDayAnnotation = showAddMemberAnnotation && addMemberSelection.visible && addMemberSelection.guest;
  const guidedFlowActive = selectedChapter !== 'open-world';
  const showHomeGuideTarget = showChapters && guidedFlowActive && (pathname === '/' || pathname === '/index');
  const showTripGuideTarget = showChapters && selectedChapter === 'guided-experience' && pathname.startsWith('/trip/') && !guidedTripStepComplete;
  const showCustomizeTabsGuideTarget = showChapters && guidedFlowActive && pathname.startsWith('/trip/') && customizeTabsOpen;
  const showPostCustomizePlusTarget = showChapters && selectedChapter === 'guided-experience' && pathname.startsWith('/trip/') && postCustomizeGuideStep === 'plus';
  const showContextActionsDismissTarget = showChapters && selectedChapter === 'guided-experience' && pathname.startsWith('/trip/') && postCustomizeGuideStep === 'dismiss-actions';
  const showGroupMemberGuideTarget = showChapters && selectedChapter === 'group-management' && pathname.startsWith('/trip/') && !addMemberFlowOpen && !manageGroupOpen && !groupMemberQuestComplete;
  const showRenAcceptedAnnotation = showChapters && annotationsEnabled && selectedChapter === 'group-management' && pathname.startsWith('/trip/') && renAvatarReady && !manageGroupOpen && !addMemberFlowOpen;
  const showManageGroupDismissPulse = showChapters && selectedChapter === 'group-management' && pathname.startsWith('/trip/') && renAvatarReady && manageGroupOpen;
  const phoneHeight = Math.min(852, height);
  const phoneTop = Math.max(0, (height - phoneHeight) / 2);
  const phoneLeft = Math.max(0, (width - 410) / 2);
  const chaptersLeft = Math.max(32, phoneLeft - 310);
  const showPollCreatorAnnotation = showChapters && annotationsEnabled && selectedChapter === 'collaborative-decisions' && pollCreatorControl.visible && pollCreatorControl.y > phoneTop + 70 && pollCreatorControl.y < phoneTop + phoneHeight - 82;
  const showPollSuggestionAnnotation = showChapters && annotationsEnabled && selectedChapter === 'collaborative-decisions' && pollSuggestionContext.visible && pollSuggestionContext.y > phoneTop + 70 && pollSuggestionContext.y < phoneTop + phoneHeight - 82;
  const expenseSummaryOpacity = Math.min(.78, Math.max(0, (expenseOverviewContext.summaryY - phoneTop - 34) / 58));
  const expenseDetailsOpacity = Math.min(.78, Math.max(0, (expenseOverviewContext.detailsY - phoneTop - 34) / 58));
  const showExpenseSummaryAnnotation = showChapters && annotationsEnabled && selectedChapter === 'expense-tracking' && tripScreenContext.activeTab === 'Expenses' && !tripScreenContext.overlayOpen && expenseOverviewContext.visible && expenseOverviewContext.summaryY < phoneTop + phoneHeight - 74 && expenseSummaryOpacity > 0;
  const showExpenseDetailsAnnotation = showChapters && annotationsEnabled && selectedChapter === 'expense-tracking' && tripScreenContext.activeTab === 'Expenses' && !tripScreenContext.overlayOpen && expenseOverviewContext.visible && expenseOverviewContext.detailsY < phoneTop + phoneHeight - 74 && expenseDetailsOpacity > 0;
  const activityCategoryAnchorY = phoneTop + 60 + activityCategoryContext.categoryY - activityCategoryContext.scrollY;
  const activitySavedAnchorY = phoneTop + 60 + activityCategoryContext.savedY - activityCategoryContext.scrollY;
  const activityCategoryOpacity = Math.min(.78, Math.max(0, (activityCategoryAnchorY - phoneTop - 38) / 58));
  const activitySavedOpacity = Math.min(.78, Math.max(0, (activitySavedAnchorY - phoneTop - 38) / 58));
  const showActivityCategoryAnnotation = showChapters && annotationsEnabled && selectedChapter === 'collaborative-decisions' && activityCategoryContext.visible && activityCategoryAnchorY < phoneTop + phoneHeight - 80 && activityCategoryOpacity > 0;
  const showActivitySavedAnnotation = showChapters && annotationsEnabled && selectedChapter === 'collaborative-decisions' && activityCategoryContext.visible && activityCategoryContext.savedVisible && activitySavedAnchorY < phoneTop + phoneHeight - 80 && activitySavedOpacity > 0;
  const ambientX = ambient.interpolate({ inputRange: [0, 1], outputRange: [-64, 72] });
  const ambientY = ambient.interpolate({ inputRange: [0, 1], outputRange: [40, -56] });
  const ambientScale = ambient.interpolate({ inputRange: [0, 1], outputRange: [1, 1.16] });
  const ambientReverseX = ambient.interpolate({ inputRange: [0, 1], outputRange: [78, -52] });
  const ambientReverseY = ambient.interpolate({ inputRange: [0, 1], outputRange: [-34, 52] });
  const ambientReverseScale = ambient.interpolate({ inputRange: [0, 1], outputRange: [1.12, 0.96] });
  const selectionScale = selectionMotion.interpolate({ inputRange: [0, 1], outputRange: [0.975, 1] });
  const selectionFlashOpacity = selectionMotion.interpolate({ inputRange: [0, 0.42, 1], outputRange: [0, 0.34, 0] });
  const selectionArrowX = selectionMotion.interpolate({ inputRange: [0, 1], outputRange: [-5, 0] });
  const annotationThumbX = annotationToggleMotion.interpolate({ inputRange: [0, 1], outputRange: [0, 26] });
  const annotationThumbScale = annotationToggleMotion.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.9, 1.12, 1] });
  const tripAnnotationShift = Animated.multiply(tripAnnotationScroll, -1);
  const tripAnnotationMotion = (baseTop: number) => ({
    opacity: Animated.multiply(tripAnnotationsOpacity, tripAnnotationScroll.interpolate({ inputRange: [0, Math.max(1, baseTop - 72), baseTop], outputRange: [1, 1, 0], extrapolate: 'clamp' })),
    transform: [{ translateY: tripAnnotationShift }],
  });

  const handleAnnotationToggle = () => {
    const nextEnabled = !annotationsEnabled;
    setAnnotationsEnabled(nextEnabled);
    annotationToggleMotion.stopAnimation();
    if (reduceMotionEnabled) {
      annotationToggleMotion.setValue(nextEnabled ? 1 : 0);
      return;
    }
    Animated.spring(annotationToggleMotion, {
      toValue: nextEnabled ? 1 : 0,
      damping: 12,
      stiffness: 250,
      mass: 0.65,
      useNativeDriver: false,
    }).start();
  };

  const handleChapterSelect = (chapter: ChapterKey) => {
    setSelectedChapter(chapter);
    setRenAvatarReady(false);
    setPostCustomizeGuideStep('idle');
    setShowGuidedExitConfirmation(false);
    setGuidedTripStepComplete(false);
    tripAnnotationsOpacity.setValue(1);
    if (chapter === 'open-world') router.replace('/');
    if (chapter === 'guided-experience') {
      setCustomizeTabsOpen(false);
      setAddMemberFlowOpen(false);
      setAddMemberQrOpen(false);
      setManageGroupOpen(false);
      router.replace('/');
    }
    if (chapter === 'group-management') router.replace('/trip/lisbon');
    if (chapter === 'group-management') setGroupMemberQuestComplete(false);
    if (chapter === 'collaborative-decisions') {
      router.replace('/trip/lisbon');
      setTimeout(() => window.dispatchEvent(new CustomEvent('tripup:start-collaborative-guide')), 160);
    }
    if (chapter === 'expense-tracking') {
      router.replace('/trip/lisbon');
      setTimeout(() => window.dispatchEvent(new CustomEvent('tripup:start-expense-tracking-guide')), 160);
    }
    selectionMotion.stopAnimation();
    if (reduceMotionEnabled) {
      selectionMotion.setValue(1);
      return;
    }
    selectionMotion.setValue(0);
    Animated.spring(selectionMotion, {
      toValue: 1,
      damping: 13,
      stiffness: 230,
      mass: 0.72,
      useNativeDriver: false,
    }).start();
  };

  const handleTripGuideTarget = () => {
    setGuidedTripStepComplete(true);
    setCustomizeTabsOpen(true);
    if (reduceMotionEnabled) tripAnnotationsOpacity.setValue(0);
    else Animated.timing(tripAnnotationsOpacity, { toValue: 0, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tripup:open-tabs-menu'));
  };

  const handleCustomizeTabsCloseTarget = () => {
    setCustomizeTabsOpen(false);
    if (selectedChapter === 'guided-experience') setPostCustomizeGuideStep('plus');
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tripup:close-tabs-menu'));
  };

  const handlePostCustomizePlusTarget = () => {
    setPostCustomizeGuideStep('dismiss-actions');
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tripup:set-quick-actions', { detail: { visible: true } }));
  };

  const handleContextActionsDismissTarget = () => {
    setPostCustomizeGuideStep('idle');
    setSelectedChapter('group-management');
    setGroupMemberQuestComplete(false);
    setRenAvatarReady(false);
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tripup:set-quick-actions', { detail: { visible: false } }));
  };

  const openGroupQuest = (eventName?: 'tripup:open-activity-member-quest') => {
    setGroupMemberQuestComplete(false);
    router.replace('/trip/lisbon');
    if (eventName) setTimeout(() => window.dispatchEvent(new CustomEvent(eventName)), 120);
  };

  const handleGroupMemberGuideTarget = () => {
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tripup:open-trip-member-quest'));
  };

  return (
    <View style={styles.desktopCanvas}>
      <LinearGradient pointerEvents="none" colors={['#100A27', '#211247', '#160B35', '#100A27']} locations={[0, 0.34, 0.7, 1]} start={{ x: 0.05, y: 0 }} end={{ x: 1, y: 1 }} style={styles.desktopGradient} />
      <Animated.View pointerEvents="none" style={[styles.ambientGlow, styles.ambientGlowA, { transform: [{ translateX: ambientX }, { translateY: ambientY }, { scale: ambientScale }] }]}>
        <LinearGradient colors={['rgba(121,72,255,0.50)', 'rgba(255,63,191,0.22)', 'rgba(33,232,255,0.04)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ambientGlowFill} />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.ambientGlow, styles.ambientGlowB, { transform: [{ translateX: ambientReverseX }, { translateY: ambientReverseY }, { scale: ambientReverseScale }] }]}>
        <LinearGradient colors={['rgba(33,232,255,0.18)', 'rgba(97,46,190,0.44)', 'rgba(16,10,39,0.02)']} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={styles.ambientGlowFill} />
      </Animated.View>
      <View pointerEvents="none" style={styles.desktopArcadeGrid}>{Array.from({ length: 120 }).map((_, index) => <View key={index} style={styles.desktopArcadeGridPixel} />)}</View>
      {showChapters ? <View accessibilityLabel="Chapters" style={[styles.chaptersPanel, { left: chaptersLeft, top: phoneTop + 96 }]}>
        <View pointerEvents="none" style={styles.arcadeGrid}>{Array.from({ length: 35 }).map((_, index) => <View key={index} style={styles.arcadeGridPixel} />)}</View>
        <View style={styles.scoreRow}><ArcadeText style={styles.scoreLabel}>PLAYER 1</ArcadeText><ArcadeText style={styles.scoreValue}>009870</ArcadeText></View>
        <Animated.View style={[styles.panelBeacon, { opacity: glowOpacity }]} />
        <ArcadeText style={styles.chaptersEyebrow}>SELECT STAGE</ArcadeText>
        <ArcadeText style={styles.chaptersTitle}>CHAPTERS</ArcadeText>
        <View style={styles.chapterDivider}><View style={styles.chapterDividerHot} /></View>
        <View accessibilityRole="radiogroup" style={styles.chapterList}>
          <Animated.View style={[styles.chapterRowFrame, selectedChapter === 'open-world' && { transform: [{ scale: selectionScale }] }]}>
            <Pressable accessibilityRole="radio" accessibilityState={{ checked: selectedChapter === 'open-world' }} accessibilityLabel="Chapter 01, Open World Exploration" onPress={() => handleChapterSelect('open-world')} style={({ pressed }) => [styles.chapterRow, selectedChapter === 'open-world' && styles.chapterRowSelected, pressed && styles.chapterRowPressed]}>
              {selectedChapter === 'open-world' ? <Animated.View pointerEvents="none" style={[styles.chapterSelectionFlash, { opacity: selectionFlashOpacity }]} /> : null}
              <View style={styles.chapterCopy}><View style={styles.chapterHeading}><View style={[styles.chapterNumber, selectedChapter === 'open-world' && styles.chapterNumberSelected]}><ArcadeText style={[styles.chapterNumberText, selectedChapter === 'open-world' && styles.chapterNumberTextSelected]}>01</ArcadeText></View><ArcadeText style={[styles.chapterName, selectedChapter === 'open-world' && styles.chapterNameSelected]}>OPEN WORLD EXPLORATION</ArcadeText></View><View style={styles.chapterDescription}><ArcadeText style={styles.chapterDescriptionText}>Look through the app as you wish without a guided walkthrough</ArcadeText></View></View>
              <ArcadeText style={[styles.chapterArrow, selectedChapter === 'open-world' && styles.chapterArrowSelected, selectedChapter === 'open-world' && { transform: [{ translateX: selectionArrowX }] }]}>▶</ArcadeText>
            </Pressable>
          </Animated.View>
          <View style={styles.guidedCard}>
            <Pressable accessibilityRole="radio" accessibilityState={{ checked: selectedChapter === 'guided-experience' }} accessibilityLabel="Chapter 02, Guided Experience" onPress={() => handleChapterSelect('guided-experience')} style={({ pressed }) => [styles.guidedHeader, selectedChapter === 'guided-experience' && styles.guidedHeaderSelected, pressed && styles.chapterRowPressed]}>{selectedChapter === 'guided-experience' ? <Animated.View pointerEvents="none" style={[styles.chapterSelectionFlash, { opacity: selectionFlashOpacity }]} /> : null}<View style={[styles.chapterNumber, selectedChapter === 'guided-experience' && styles.chapterNumberSelected]}><ArcadeText style={[styles.chapterNumberText, selectedChapter === 'guided-experience' && styles.chapterNumberTextSelected]}>02</ArcadeText></View><ArcadeText style={[styles.chapterName, selectedChapter === 'guided-experience' && styles.chapterNameSelected]}>GUIDED EXPERIENCE</ArcadeText><ArcadeText style={[styles.guidedHeaderArrow, selectedChapter === 'guided-experience' && styles.chapterArrowSelected, selectedChapter === 'guided-experience' && { transform: [{ translateX: selectionArrowX }] }]}>▶</ArcadeText></Pressable>
            <View style={styles.guidedQuestList}>{guidedQuests.map((quest, index) => { const selected = selectedChapter === quest.key; const lastQuest = index === guidedQuests.length - 1; const questCaption = quest.key === 'group-management' ? '3 SIDE QUESTS AVAILABLE' : quest.key === 'collaborative-decisions' ? '1 SIDE QUEST AVAILABLE' : quest.key === 'expense-tracking' ? '3 SIDE QUESTS AVAILABLE' : 'SIDE QUESTS AVAILABLE'; return <Pressable key={quest.key} accessibilityRole="radio" accessibilityState={{ checked: selected }} accessibilityLabel={`${quest.title}, ${questCaption.toLowerCase()}`} onPress={() => handleChapterSelect(quest.key)} style={({ pressed }) => [styles.guidedQuest, selected && styles.guidedQuestSelected, pressed && styles.chapterRowPressed]}>{selected ? <Animated.View pointerEvents="none" style={[styles.chapterSelectionFlash, { opacity: selectionFlashOpacity }]} /> : null}<View pointerEvents="none" style={[styles.guidedTreeStem, lastQuest && styles.guidedTreeStemLast]} /><View pointerEvents="none" style={styles.guidedTreeBranch} /><View pointerEvents="none" style={styles.guidedTreeNode} /><View style={styles.guidedQuestCopy}><ArcadeText style={[styles.guidedQuestTitle, selected && styles.chapterNameSelected]}>{quest.title.toUpperCase()}</ArcadeText><ArcadeText style={styles.guidedQuestCaption}>{questCaption}</ArcadeText></View><ArcadeText style={[styles.guidedQuestArrow, selected && styles.chapterArrowSelected, selected && { transform: [{ translateX: selectionArrowX }] }]}>▶</ArcadeText></Pressable>; })}</View>
          </View>
        </View>
        <View style={styles.arcadeFooter}><Animated.View style={{ opacity: glowOpacity }}><ArcadeText style={styles.pressStart}>TO START, CHOOSE A CHAPTER</ArcadeText></Animated.View></View>
      </View> : null}
      <View style={styles.device}>
        <View pointerEvents="none" style={styles.hardware}>
          <View style={styles.speaker} />
          <View style={styles.camera} />
        </View>
        <View style={[styles.screen, styles.screenRounded]}>{children}</View>
      </View>
      {showHomeGuideTarget ? <View style={[styles.guidedInteractionLayer, { left: phoneLeft, top: phoneTop }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Exit guided flow" onPress={() => setShowGuidedExitConfirmation(true)} style={styles.guidedExitHitArea} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue to today’s plan"
          onPress={() => router.push('/trip/lisbon')}
          style={styles.guidedTarget}
        >
          <Animated.View pointerEvents="none" style={[styles.guidedTargetPulse, { opacity: guidePulseOpacity, transform: [{ scale: guidePulseScale }] }]} />
        </Pressable>
      </View> : null}
      {showTripGuideTarget ? <View pointerEvents="box-none" style={[styles.guidedInteractionLayer, { left: phoneLeft, top: phoneTop }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Customize trip navigation" onPress={handleTripGuideTarget} style={styles.guidedTripTabsTarget}>
          <Animated.View pointerEvents="none" style={[styles.guidedTargetPulse, { opacity: guidePulseOpacity, transform: [{ scale: guidePulseScale }] }]} />
        </Pressable>
      </View> : null}
      {showCustomizeTabsGuideTarget ? <View pointerEvents="box-none" style={[styles.guidedInteractionLayer, { left: phoneLeft, top: phoneTop }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back from Customize tabs" onPress={handleCustomizeTabsCloseTarget} style={styles.guidedCustomizeBackHitArea} />
        <Animated.View pointerEvents="none" style={[styles.guidedTargetPulse, styles.guidedCustomizeHint, { opacity: guidePulseOpacity, transform: [{ scale: guidePulseScale }] }]} />
      </View> : null}
      {showPostCustomizePlusTarget ? <View pointerEvents="box-none" style={[styles.guidedInteractionLayer, { left: phoneLeft, top: phoneTop }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Open contextual actions" onPress={handlePostCustomizePlusTarget} style={styles.guidedBottomActionTarget}>
          <Animated.View pointerEvents="none" style={[styles.guidedTargetPulse, { opacity: guidePulseOpacity, transform: [{ scale: guidePulseScale }] }]} />
        </Pressable>
      </View> : null}
      {showContextActionsDismissTarget ? <View pointerEvents="box-none" style={[styles.guidedInteractionLayer, { left: phoneLeft, top: phoneTop }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Dismiss contextual actions and start Group Management" onPress={handleContextActionsDismissTarget} style={styles.guidedContextActionsDismissTarget} />
        <Animated.View pointerEvents="none" style={[styles.guidedTargetPulse, styles.guidedContextActionsDismissHint, { opacity: guidePulseOpacity, transform: [{ scale: guidePulseScale }] }]} />
      </View> : null}
      {showGroupMemberGuideTarget ? <View style={[styles.guidedInteractionLayer, { left: phoneLeft, top: phoneTop }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Exit guided flow" onPress={() => setShowGuidedExitConfirmation(true)} style={styles.guidedExitHitArea} />
        <Pressable accessibilityRole="button" accessibilityLabel="Add a trip member" onPress={handleGroupMemberGuideTarget} style={styles.guidedGroupMemberTarget}>
          <Animated.View pointerEvents="none" style={[styles.guidedTargetPulse, { opacity: guidePulseOpacity, transform: [{ scale: guidePulseScale }] }]} />
        </Pressable>
      </View> : null}
      {showManageGroupDismissPulse ? <View pointerEvents="none" style={[styles.guidedInteractionLayer, { left: phoneLeft, top: phoneTop }]}>
        <Animated.View style={[styles.guidedTargetPulse, styles.guidedManageGroupDismissHint, { opacity: guidePulseOpacity, transform: [{ scale: guidePulseScale }] }]} />
      </View> : null}
      {showChapters ? <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: annotationsEnabled }}
        accessibilityLabel={`${annotationsEnabled ? 'Hide' : 'Show'} design annotations`}
        onPress={handleAnnotationToggle}
        style={({ pressed }) => [styles.annotationToggle, styles.annotationTogglePosition, pressed && styles.annotationTogglePressed]}
      >
        <View style={styles.annotationToggleCopy}>
          <ArcadeText style={styles.annotationToggleEyebrow}>KEEP ANNOTATIONS?</ArcadeText>
          <ArcadeText style={styles.annotationToggleState}>{annotationsEnabled ? 'YES' : 'NO'}</ArcadeText>
        </View>
        <View style={[styles.annotationSwitchTrack, annotationsEnabled && styles.annotationSwitchTrackOn]}>
          <Animated.View style={[styles.annotationSwitchThumb, annotationsEnabled && styles.annotationSwitchThumbOn, { transform: [{ translateX: annotationThumbX }, { scale: annotationThumbScale }] }]} />
        </View>
      </Pressable> : null}
      {showChapters && selectedChapter === 'group-management' ? <View accessibilityLabel="Group management side quests" style={styles.sideQuestPanel}><ArcadeText style={styles.sideQuestEyebrow}>SIDE QUESTS</ArcadeText><Pressable accessibilityRole="button" onPress={() => openGroupQuest()} style={({ pressed }) => [styles.sideQuestRow, pressed && styles.sideQuestRowPressed]}><ArcadeText style={styles.sideQuestNumber}>01</ArcadeText><ArcadeText style={styles.sideQuestCopy}>Add trip-level members through the top navigation.</ArcadeText><ArcadeText style={styles.sideQuestArrow}>▶</ArcadeText></Pressable><Pressable accessibilityRole="button" onPress={() => openGroupQuest('tripup:open-activity-member-quest')} style={({ pressed }) => [styles.sideQuestRow, pressed && styles.sideQuestRowPressed]}><ArcadeText style={styles.sideQuestNumber}>02</ArcadeText><ArcadeText style={styles.sideQuestCopy}>Add activity-level members through the meatball menu in an itinerary card.</ArcadeText><ArcadeText style={styles.sideQuestArrow}>▶</ArcadeText></Pressable><Pressable accessibilityRole="button" onPress={() => openGroupQuest()} style={({ pressed }) => [styles.sideQuestRow, pressed && styles.sideQuestRowPressed]}><ArcadeText style={styles.sideQuestNumber}>03</ArcadeText><ArcadeText style={styles.sideQuestCopy}>Add a guest vs add a member into the trip.</ArcadeText><ArcadeText style={styles.sideQuestArrow}>▶</ArcadeText></Pressable></View> : null}
      {showChapters && selectedChapter === 'collaborative-decisions' ? <View accessibilityLabel="Collaborative decision making side quests" style={styles.sideQuestPanel}><ArcadeText style={styles.sideQuestEyebrow}>SIDE QUESTS</ArcadeText><Pressable accessibilityRole="button" style={({ pressed }) => [styles.sideQuestRow, pressed && styles.sideQuestRowPressed]}><ArcadeText style={styles.sideQuestNumber}>01</ArcadeText><ArcadeText style={styles.sideQuestCopy}>Create a poll outside an activity.</ArcadeText><ArcadeText style={styles.sideQuestArrow}>▶</ArcadeText></Pressable></View> : null}
      {showChapters && selectedChapter === 'expense-tracking' ? <View accessibilityLabel="Expense tracking side quests" style={styles.sideQuestPanel}><ArcadeText style={styles.sideQuestEyebrow}>SIDE QUESTS</ArcadeText><Pressable accessibilityRole="button" style={({ pressed }) => [styles.sideQuestRow, pressed && styles.sideQuestRowPressed]}><ArcadeText style={styles.sideQuestNumber}>01</ArcadeText><ArcadeText style={styles.sideQuestCopy}>Exclude Ren and Nic from wine through receipt scan.</ArcadeText><ArcadeText style={styles.sideQuestArrow}>▶</ArcadeText></Pressable><Pressable accessibilityRole="button" style={({ pressed }) => [styles.sideQuestRow, pressed && styles.sideQuestRowPressed]}><ArcadeText style={styles.sideQuestNumber}>02</ArcadeText><ArcadeText style={styles.sideQuestCopy}>Exclude Ren and Nic from wine through manual exclusion.</ArcadeText><ArcadeText style={styles.sideQuestArrow}>▶</ArcadeText></Pressable><Pressable accessibilityRole="button" style={({ pressed }) => [styles.sideQuestRow, pressed && styles.sideQuestRowPressed]}><ArcadeText style={styles.sideQuestNumber}>03</ArcadeText><ArcadeText style={styles.sideQuestCopy}>Add an expense through an activity.</ArcadeText><ArcadeText style={styles.sideQuestArrow}>▶</ArcadeText></Pressable></View> : null}
      {showAddMemberAnnotation && !addMemberSelection.visible ? <View pointerEvents="none" accessibilityLabel="Add member flow assumption" style={[styles.homeAnnotation, styles.addMemberAnnotation, { left: phoneLeft + 440, top: phoneTop + 284 }]}><View style={styles.addMemberConnector} /><View style={styles.addMemberAnnotationNode} /><ArcadeText style={styles.homeAnnotationLabel}>USE CASE ASSUMPTION</ArcadeText><ArcadeText style={styles.homeAnnotationCopy}>For the sake of this usecase, we are assuming that Ren is a part of our contacts and that system permissions are already granted.</ArcadeText></View> : null}
      {showGuestMemberAnnotation ? <View pointerEvents="none" accessibilityLabel="Guest versus member annotation" style={[styles.homeAnnotation, styles.guestMemberAnnotation, { left: phoneLeft + 440, top: phoneTop + 348 }]}><View style={styles.guestMemberConnector} /><View style={styles.guestMemberAnnotationNode} /><ArcadeText style={styles.homeAnnotationLabel}>GUEST OR MEMBER?</ArcadeText><ArcadeText style={styles.homeAnnotationCopy}>Choosing Guest adds the member temporarily to the trip. Keeping it switched off allows them to stay for the entire trip.</ArcadeText><ArcadeText style={styles.guestMemberSideQuest}>VIEW SIDE QUEST TO LEARN MORE.</ArcadeText></View> : null}
      {showGuestFinalDayAnnotation ? <View pointerEvents="none" accessibilityLabel="Final day guest date annotation" style={[styles.homeAnnotation, styles.guestFinalDayAnnotation, { left: phoneLeft + 440, top: phoneTop + 388 }]}><View style={styles.guestFinalDayConnector} /><View style={styles.guestFinalDayAnnotationNode} /><ArcadeText style={styles.homeAnnotationLabel}>FINAL DAY SELECTED</ArcadeText><ArcadeText style={styles.homeAnnotationCopy}>Here the final day is automatically selected since this is the final day of the trip. To view further use cases of what happens, check out the side quest tab.</ArcadeText></View> : null}
      {showHomeAnnotation ? <View pointerEvents="none" accessibilityLabel="Homepage design annotation" style={[styles.homeAnnotation, { left: phoneLeft + 440, top: phoneTop + 420 }]}><View style={styles.homeAnnotationConnector} /><View style={styles.homeAnnotationNode} /><ArcadeText style={styles.homeAnnotationLabel}>TRIP AT A GLANCE</ArcadeText><ArcadeText style={styles.homeAnnotationCopy}>When users arrive, the homepage brings together what’s happening now, today’s plan, and timely trip prompts in one clear view.</ArcadeText></View> : null}
      {showHomeAnnotation ? <View pointerEvents="none" accessibilityLabel="Contextual actions design annotation" style={[styles.homeAnnotation, styles.homeActionsAnnotation, { left: phoneLeft + 440, bottom: phoneTop }]}><View style={styles.homeActionsConnectorHorizontal} /><View style={styles.homeActionsAnnotationNode} /><ArcadeText style={styles.homeAnnotationLabel}>CONTEXTUAL ACTIONS</ArcadeText><ArcadeText style={styles.homeAnnotationCopy}>Actions reside here and are surfaced contextually across pages. On Home, the action is Ask AI.</ArcadeText></View> : null}
      {showPostCustomizePlusTarget ? <View pointerEvents="none" accessibilityLabel="Floating Action Button annotation" style={[styles.homeAnnotation, styles.homeActionsAnnotation, { left: phoneLeft + 440, bottom: phoneTop + 30 }]}><View style={styles.homeActionsConnectorHorizontal} /><View style={styles.homeActionsAnnotationNode} /><ArcadeText style={styles.homeAnnotationLabel}>CONTEXTUAL ACTIONS</ArcadeText><ArcadeText style={styles.homeAnnotationCopy}>The actions within the Floating Action Button now contextually reside within this button.</ArcadeText></View> : null}
      {showContextActionsDismissTarget && annotationsEnabled ? <View pointerEvents="none" accessibilityLabel="Overview contextual options annotation" style={[styles.homeAnnotation, styles.overviewActionsAnnotation, { left: phoneLeft + 440, top: phoneTop + 698 }]}><View style={styles.overviewActionsConnector} /><View style={styles.overviewActionsAnnotationNode} /><ArcadeText style={styles.homeAnnotationLabel}>OVERVIEW OPTIONS</ArcadeText><ArcadeText style={styles.homeAnnotationCopy}>On Overview tab, all relevant options are shown.</ArcadeText></View> : null}
      {showGroupMemberGuideTarget && annotationsEnabled ? <View pointerEvents="none" accessibilityLabel="Start Group Management flow annotation" style={[styles.homeAnnotation, styles.groupManagementStartAnnotation, { left: phoneLeft + 440, top: phoneTop + 49 }]}><View style={styles.groupManagementStartConnector} /><View style={styles.groupManagementStartAnnotationNode} /><ArcadeText style={styles.homeAnnotationLabel}>GROUP MANAGEMENT</ArcadeText><ArcadeText style={styles.homeAnnotationCopy}>Start Group Management flow by clicking here.</ArcadeText></View> : null}
      {showRenAcceptedAnnotation ? <View pointerEvents="none" accessibilityLabel="Ren accepted trip annotation" style={[styles.homeAnnotation, styles.renAcceptedAnnotation, { left: phoneLeft + 440, top: phoneTop + 49 }]}><View style={styles.renAcceptedConnector} /><View style={styles.renAcceptedAnnotationNode} /><ArcadeText style={styles.homeAnnotationLabel}>TRIP MEMBER ADDED</ArcadeText><ArcadeText style={styles.homeAnnotationCopy}>Ren has accepted the trip and is added to the trip members.</ArcadeText></View> : null}
      {showPollCreatorAnnotation ? <View pointerEvents="none" accessibilityLabel="Poll creator closing controls annotation" style={[styles.homeAnnotation, styles.pollCreatorAnnotation, { left: phoneLeft + 440, top: pollCreatorControl.y - 34 }]}><View style={styles.pollCreatorConnector} /><View style={styles.pollCreatorAnnotationNode} /><ArcadeText style={styles.homeAnnotationLabel}>POLL CLOSING</ArcadeText><ArcadeText style={styles.homeAnnotationCopy}>The poll creator can close the poll manually or have it close automatically after a fixed time.</ArcadeText></View> : null}
      {showPollSuggestionAnnotation ? <View pointerEvents="none" accessibilityLabel="Participant suggested alternative annotation" style={[styles.homeAnnotation, styles.pollSuggestionAnnotation, { left: phoneLeft + 440, top: pollSuggestionContext.y - 58 }]}><View style={styles.pollSuggestionConnector} /><View style={styles.pollSuggestionAnnotationNode} /><ArcadeText style={styles.homeAnnotationLabel}>ALTERNATIVES STAY OPEN</ArcadeText><ArcadeText style={styles.homeAnnotationCopy}>Allowing participants to introduce alternatives preserves agency and reduces premature convergence. New suggestions join the same ballot, so the group can compare and vote without restarting the decision.</ArcadeText></View> : null}
      {showExpenseSummaryAnnotation ? <View pointerEvents="none" accessibilityLabel="Expense summary behavioral annotation" style={[styles.homeAnnotation, styles.expenseSummaryAnnotation, { left: phoneLeft + 440, top: expenseOverviewContext.summaryY - 66, opacity: expenseSummaryOpacity }]}><View style={styles.expenseSummaryConnector} /><View style={styles.expenseSummaryAnnotationNode} /><ArcadeText style={styles.homeAnnotationLabel}>SPENDING AT A GLANCE</ArcadeText><ArcadeText style={styles.homeAnnotationCopy}>The overview leads with the user’s highest-priority questions: how to add an expense, how much has been spent, how that compares with the budget, and what remains. Answering these immediately reduces search effort and supports faster action.</ArcadeText></View> : null}
      {showExpenseDetailsAnnotation ? <View pointerEvents="none" accessibilityLabel="Expense detail behavioral annotation" style={[styles.homeAnnotation, styles.expenseDetailsAnnotation, { left: phoneLeft + 440, top: expenseOverviewContext.detailsY - 58, opacity: expenseDetailsOpacity }]}><View style={styles.expenseDetailsConnector} /><View style={styles.expenseDetailsAnnotationNode} /><ArcadeText style={styles.homeAnnotationLabel}>DETAIL ON DEMAND</ArcadeText><ArcadeText style={styles.homeAnnotationCopy}>Once users are oriented, itemized spending and group balance support verification and reconciliation. This progressive disclosure keeps secondary detail available without competing with the immediate financial task.</ArcadeText></View> : null}
      {showActivityCategoryAnnotation ? <View pointerEvents="none" accessibilityLabel="Contextual Add Activity categories annotation" style={[styles.homeAnnotation, styles.activityCategoryAnnotation, { left: phoneLeft + 440, top: activityCategoryAnchorY - 46, opacity: activityCategoryOpacity }]}><View style={styles.activityCategoryConnector} /><View style={styles.activityCategoryAnnotationNode} /><ArcadeText style={styles.homeAnnotationLabel}>CONTEXTUAL ACTIVITY FORM</ArcadeText><ArcadeText style={styles.homeAnnotationCopy}>Add Activity adapts its content to the selected category, surfacing only relevant information. Once a user enters a name, the category is inferred automatically, reducing cognitive load.</ArcadeText></View> : null}
      {showActivitySavedAnnotation ? <View pointerEvents="none" accessibilityLabel="Saved items behavioral annotation" style={[styles.homeAnnotation, styles.activitySavedAnnotation, { left: phoneLeft + 440, top: activitySavedAnchorY - 46, opacity: activitySavedOpacity }]}><View style={styles.activitySavedConnector} /><View style={styles.activitySavedAnnotationNode} /><ArcadeText style={styles.homeAnnotationLabel}>SAVED, READY TO USE</ArcadeText><ArcadeText style={styles.homeAnnotationCopy}>Users save places to reduce the effort of finding them again. Surfacing those saved items here shortens the path to action, reduces repeat decisions, and helps them finish planning faster.</ArcadeText></View> : null}
      {showTripAnnotations ? <Animated.View pointerEvents="none" accessibilityLabel="Trip header actions design annotation" style={[styles.homeAnnotation, styles.tripHeaderAnnotation, { left: phoneLeft + 440, top: phoneTop + 105 }, tripAnnotationMotion(105)]}><View style={styles.tripHeaderConnectorHorizontal} /><View style={styles.tripHeaderConnectorVertical} /><View style={styles.tripHeaderAnnotationNode} /><ArcadeText style={styles.homeAnnotationLabel}>ADD MEMBER ICON UPDATED</ArcadeText><ArcadeText style={styles.homeAnnotationCopy}>Header icons were updated to accommodate contextual Actions in the bottom navigation.</ArcadeText></Animated.View> : null}
      {showTripAnnotations ? <Animated.View pointerEvents="none" accessibilityLabel="Packing and documents design annotation" style={[styles.homeAnnotation, styles.tripUtilitiesAnnotation, { left: phoneLeft + 440, top: phoneTop + 225 }, tripAnnotationMotion(225)]}><View style={styles.tripUtilitiesConnector} /><View style={styles.tripUtilitiesAnnotationNode} /><ArcadeText style={styles.homeAnnotationLabel}>REDUCED HEADER CLUTTER</ArcadeText><ArcadeText style={styles.homeAnnotationCopy}>Packing and Documents now transition into compact icons—keeping trip utilities accessible while reducing header clutter.</ArcadeText></Animated.View> : null}
      {showTripAnnotations ? <Animated.View pointerEvents="none" accessibilityLabel="Configurable trip navigation design annotation" style={[styles.homeAnnotation, styles.tripTabsAnnotation, { left: phoneLeft + 440, top: phoneTop + 375 }, tripAnnotationMotion(375)]}><View style={styles.tripTabsConnectorHorizontal} /><View style={styles.tripTabsAnnotationNode} /><ArcadeText style={styles.homeAnnotationLabel}>CONFIGURABLE TRIP NAVIGATION</ArcadeText><ArcadeText style={styles.tripTabsProblemCopy}>Travellers have different planning priorities, and not every tab is equally relevant throughout a trip. A fixed structure forces everyone into the same experience and increases navigation clutter.</ArcadeText><ArcadeText style={styles.tripTabsDecisionLabel}>DESIGN DECISION</ArcadeText><ArcadeText style={styles.tripTabsDecisionCopy}>Introduced configurable trip navigation, allowing participants to show, hide, and reorder optional tabs while keeping core experiences consistent.</ArcadeText></Animated.View> : null}
      {showTripAnnotations ? <Animated.View pointerEvents="none" accessibilityLabel="Dynamic trip overview design annotation" style={[styles.homeAnnotation, styles.tripOverviewAnnotation, { left: phoneLeft + 440, top: phoneTop + 625 }, tripAnnotationMotion(625)]}><View style={styles.tripOverviewConnectorHorizontal} /><View style={styles.tripOverviewAnnotationNode} /><ArcadeText style={styles.homeAnnotationLabel}>DYNAMIC TRIP OVERVIEW</ArcadeText><ArcadeText style={styles.homeAnnotationCopy}>Trip overview gives users contextual, dynamic trip-specific highlights.</ArcadeText></Animated.View> : null}
      {showCustomizeTabsAnnotations ? <View pointerEvents="none" accessibilityLabel="Customize tabs design annotation" style={[styles.homeAnnotation, styles.customizeTabsAnnotation, { left: phoneLeft + 440, top: phoneTop + 350 }]}><View style={styles.customizeTabsConnector} /><View style={styles.customizeTabsAnnotationNode} /><ArcadeText style={styles.homeAnnotationLabel}>PERSONALIZED TAB SETUP</ArcadeText><ArcadeText style={styles.homeAnnotationCopy}>Users can rearrange, add, or remove tabs to match the way they plan.</ArcadeText></View> : null}
      {showCustomizeTabsAnnotations ? <View pointerEvents="none" accessibilityLabel="Saved tab design annotation" style={[styles.homeAnnotation, styles.savedTabAnnotation, { left: phoneLeft + 440, top: phoneTop + 465 }]}><View style={styles.savedTabConnector} /><View style={styles.savedTabAnnotationNode} /><ArcadeText style={styles.homeAnnotationLabel}>SAVED TAB</ArcadeText><ArcadeText style={styles.customizeAnnotationCopy}>Explore was already accessible through the global bottom navigation, creating unnecessary duplication within the trip experience. Saved was introduced in its place to make bookmarked places and activities more accessible during trip planning.</ArcadeText></View> : null}
      {showCustomizeTabsAnnotations ? <View pointerEvents="none" accessibilityLabel="Optional Guides and Journal tabs design annotation" style={[styles.homeAnnotation, styles.optionalTabsAnnotation, { left: phoneLeft + 440, top: phoneTop + 640 }]}><View style={styles.optionalTabsConnector} /><View style={styles.optionalTabsBranch} /><View style={styles.optionalTabsGuidesNode} /><View style={styles.optionalTabsJournalNode} /><ArcadeText style={styles.homeAnnotationLabel}>GUIDES AND JOURNAL TABS ARE OPTIONAL, IF THE USER CHOOSES</ArcadeText><ArcadeText style={styles.customizeAnnotationCopy}>Guides and Journal are retained as optional tabs, accessible through the customisation drawer rather than removed from the product.</ArcadeText><ArcadeText style={styles.tripTabsDecisionLabel}>INTENT</ArcadeText><ArcadeText style={styles.customizeAnnotationIntent}>Prioritise frequently used, trip-specific actions without sacrificing feature discoverability or individual choice.</ArcadeText></View> : null}
      {showGuidedExitConfirmation ? <View accessibilityRole="alert" style={[styles.guidedExitCard, { left: phoneLeft + 440, top: phoneTop + phoneHeight - 232 }]}>
        <ArcadeText style={styles.guidedExitEyebrow}>LEAVE GUIDED FLOW?</ArcadeText>
        <ArcadeText style={styles.guidedExitCopy}>This will exit you from the guided flow. Are you sure you want to continue?</ArcadeText>
        <Pressable accessibilityRole="button" onPress={() => handleChapterSelect('open-world')} style={({ pressed }) => [styles.guidedExitPrimary, pressed && styles.guidedExitPressed]}><ArcadeText style={styles.guidedExitPrimaryText}>YES, EXIT GUIDED FLOW</ArcadeText></Pressable>
        <Pressable accessibilityRole="button" onPress={() => setShowGuidedExitConfirmation(false)} style={({ pressed }) => [styles.guidedExitSecondary, pressed && styles.guidedExitPressed]}><ArcadeText style={styles.guidedExitSecondaryText}>NO, KEEP ME HERE</ArcadeText></Pressable>
      </View> : null}
      <View pointerEvents="none" style={styles.caption}><View style={styles.captionDot} /></View>
    </View>
  );
}

function ArcadeText({ children, style }: { children: ReactNode; style?: object }) {
  return <Animated.Text style={[styles.arcadeText, style]}>{children}</Animated.Text>;
}

const styles = StyleSheet.create({
  desktopCanvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#100A27',
  },
  desktopGradient: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  ambientGlow: { position: 'absolute', filter: 'blur(110px)', opacity: 0.86 },
  ambientGlowA: { width: '62%', height: '68%', left: '-12%', top: '-16%', borderRadius: 999 },
  ambientGlowB: { width: '56%', height: '72%', right: '-8%', bottom: '-20%', borderRadius: 999 },
  ambientGlowFill: { flex: 1, borderRadius: 999 },
  desktopArcadeGrid: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'flex-start', opacity: 0.34 },
  desktopArcadeGridPixel: { width: '8.333%', height: 76, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#33265E' },
  chaptersPanel: {
    position: 'absolute',
    width: 280,
    minHeight: 620,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(98,246,255,.58)',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'rgba(16,10,39,.82)',
    shadowColor: '#21E8FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    opacity: .8,
  },
  arcadeGrid: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'flex-start', opacity: 0.16 },
  arcadeGridPixel: { width: '14.285%', height: 58, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#7154BD' },
  panelBeacon: { position: 'absolute', top: 15, right: 17, width: 9, height: 9, backgroundColor: '#FFEA57', shadowColor: '#FFEA57', shadowOpacity: 1, shadowRadius: 9 },
  arcadeText: { fontFamily: 'monospace', color: '#EAFDFF', letterSpacing: 0.8 },
  scoreRow: { height: 22, paddingRight: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scoreLabel: { fontSize: 10, lineHeight: 14, color: '#FF69D4' },
  scoreValue: { fontSize: 10, lineHeight: 14, color: '#FFEA57' },
  chaptersEyebrow: { marginTop: 22, fontSize: 10, lineHeight: 14, color: '#8A7BFF' },
  chaptersTitle: { marginTop: 5, fontSize: 30, lineHeight: 36, fontWeight: '800', color: '#FCF9FF', letterSpacing: 2 },
  chapterDivider: { height: 5, marginTop: 12, marginBottom: 16, backgroundColor: '#251B4B' },
  chapterDividerHot: { width: '38%', height: 5, backgroundColor: '#FF3FBF', shadowColor: '#FF3FBF', shadowOpacity: 0.8, shadowRadius: 7 },
  chapterList: { gap: 9 },
  chapterRowFrame: { width: '100%', height: 122 },
  chapterRow: { flex: 1, paddingHorizontal: 18, borderWidth: 2, borderColor: '#33265E', backgroundColor: '#171034', flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  chapterRowSelected: { borderColor: 'rgba(98,246,255,.78)', backgroundColor: 'rgba(36,32,90,.78)', shadowColor: '#62F6FF', shadowOpacity: 0.16, shadowRadius: 6 },
  chapterRowPressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  chapterSelectionFlash: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: '#62F6FF' },
  chapterNumber: { width: 38, height: 38, borderWidth: 2, borderColor: '#5C468E', backgroundColor: '#211747', alignItems: 'center', justifyContent: 'center' },
  chapterNumberSelected: { borderColor: '#FFEA57', backgroundColor: '#FF3FBF' },
  chapterNumberText: { fontSize: 14, lineHeight: 18, fontWeight: '700', color: '#9D8EC4' },
  chapterNumberTextSelected: { color: '#100A27' },
  chapterCopy: { flex: 1, minWidth: 0, alignItems: 'stretch', justifyContent: 'center' },
  chapterHeading: { width: '100%', paddingRight: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  chapterName: { flex: 1, fontSize: 12, lineHeight: 16, fontWeight: '700', color: '#B8ADD7', textAlign: 'left' },
  chapterNameSelected: { color: '#FCF9FF' },
  chapterDescription: { marginLeft: 0, marginRight: 20, marginTop: 8 },
  chapterDescriptionText: { fontSize: 9, lineHeight: 13, color: '#62F6FF', letterSpacing: 0.25, textAlign: 'left' },
  chapterArrow: { position: 'absolute', top: 29, right: 7, width: 14, fontSize: 12, lineHeight: 16, color: '#51416F', textAlign: 'center' },
  chapterArrowSelected: { color: '#FFEA57' },
  guidedCard: { borderWidth: 2, borderColor: '#33265E', backgroundColor: '#171034', overflow: 'hidden' },
  guidedHeader: { position: 'relative', minHeight: 64, paddingLeft: 18, paddingRight: 30, flexDirection: 'row', alignItems: 'center', gap: 10, overflow: 'hidden' },
  guidedHeaderSelected: { backgroundColor: 'rgba(36,32,90,.78)' },
  guidedHeaderArrow: { position: 'absolute', right: 9, width: 12, fontSize: 10, lineHeight: 14, color: '#51416F', textAlign: 'center' },
  guidedQuestList: { borderTopWidth: 1, borderTopColor: '#33265E' },
  guidedQuest: { position: 'relative', minHeight: 62, paddingLeft: 92, paddingRight: 22, borderBottomWidth: 1, borderBottomColor: '#2A2051', flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  guidedQuestSelected: { backgroundColor: 'rgba(36,32,90,.78)' },
  guidedTreeStem: { position: 'absolute', zIndex: 2, left: 48, top: 0, bottom: 0, width: 2, backgroundColor: '#5C468E' },
  guidedTreeStemLast: { bottom: 31 },
  guidedTreeBranch: { position: 'absolute', zIndex: 2, left: 48, top: 30, width: 28, height: 2, backgroundColor: '#5C468E' },
  guidedTreeNode: { position: 'absolute', zIndex: 3, left: 73, top: 27, width: 7, height: 7, borderRadius: 4, borderWidth: 2, borderColor: '#62F6FF', backgroundColor: '#171034' },
  guidedQuestCopy: { flex: 1, minWidth: 0, paddingVertical: 8 },
  guidedQuestTitle: { fontSize: 11, lineHeight: 14, fontWeight: '700', color: '#B8ADD7', textAlign: 'left' },
  guidedQuestCaption: { marginTop: 3, fontSize: 8, lineHeight: 11, color: '#62F6FF', letterSpacing: 0.2, textAlign: 'left' },
  guidedQuestArrow: { width: 12, fontSize: 9, lineHeight: 12, color: '#51416F', textAlign: 'right' },
  arcadeFooter: { marginTop: 'auto', paddingTop: 18, alignItems: 'center' },
  pressStart: { fontSize: 10, lineHeight: 14, fontWeight: '700', color: '#FFEA57', letterSpacing: 1 },
  annotationToggle: { position: 'absolute', width: 224, minHeight: 72, paddingHorizontal: 18, paddingVertical: 13, borderWidth: 1, borderColor: 'rgba(98,246,255,.42)', borderRadius: 8, backgroundColor: 'rgba(16,10,39,.76)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#21E8FF', shadowOpacity: .08, shadowRadius: 10, opacity: .86 },
  annotationTogglePosition: { top: 28, right: 28 },
  annotationTogglePressed: { opacity: .62, transform: [{ scale: .98 }] },
  annotationToggleCopy: { gap: 3 },
  annotationToggleEyebrow: { fontSize: 10, lineHeight: 14, color: '#D1C7EA', letterSpacing: .8 },
  annotationToggleState: { fontSize: 11, lineHeight: 14, color: '#62F6FF', letterSpacing: 1 },
  annotationSwitchTrack: { width: 52, height: 28, padding: 3, borderWidth: 1, borderColor: '#51416F', borderRadius: 9, backgroundColor: '#211747', justifyContent: 'center' },
  annotationSwitchTrackOn: { borderColor: 'rgba(98,246,255,.7)', backgroundColor: 'rgba(33,232,255,.16)' },
  annotationSwitchThumb: { width: 20, height: 20, borderRadius: 6, backgroundColor: '#716394' },
  annotationSwitchThumbOn: { backgroundColor: '#62F6FF', shadowColor: '#62F6FF', shadowOpacity: .55, shadowRadius: 4 },
  sideQuestPanel: { position: 'absolute', top: 116, right: 28, width: 270, padding: 14, borderWidth: 1, borderColor: 'rgba(98,246,255,.34)', borderRadius: 8, backgroundColor: 'rgba(16,10,39,.84)', shadowColor: '#21E8FF', shadowOpacity: .08, shadowRadius: 10 },
  sideQuestEyebrow: { marginBottom: 8, fontSize: 9, lineHeight: 12, color: '#FF69D4', letterSpacing: 1 },
  sideQuestRow: { minHeight: 66, paddingVertical: 10, borderTopWidth: 1, borderTopColor: 'rgba(81,65,111,.75)', flexDirection: 'row', alignItems: 'center', gap: 10 },
  sideQuestRowPressed: { opacity: .68, transform: [{ scale: .99 }] },
  sideQuestNumber: { width: 22, fontSize: 9, lineHeight: 12, color: '#62F6FF' },
  sideQuestCopy: { flex: 1, fontSize: 9, lineHeight: 14, color: '#EAFDFF', letterSpacing: .1 },
  sideQuestArrow: { width: 10, fontSize: 9, lineHeight: 12, color: '#FFEA57' },
  guidedInteractionLayer: { position: 'absolute', zIndex: 120, width: 410, height: 852, maxWidth: '100%', maxHeight: '100%', borderRadius: 46, overflow: 'hidden', backgroundColor: 'transparent' },
  guidedExitHitArea: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  guidedTarget: { position: 'absolute', zIndex: 2, left: 150, top: 500, width: 244, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
  guidedTripTabsTarget: { position: 'absolute', zIndex: 2, left: 366, top: 384, width: 48, height: 52, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  guidedCustomizeBackHitArea: { position: 'absolute', zIndex: 1, top: 0, right: 0, bottom: 76, left: 0 },
  guidedCustomizeHint: { zIndex: 2, left: 193, top: 96 },
  guidedBottomActionTarget: { position: 'absolute', zIndex: 2, left: 177, bottom: 18, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  guidedContextActionsDismissTarget: { position: 'absolute', zIndex: 1, top: 0, right: 0, bottom: 156, left: 0 },
  guidedContextActionsDismissHint: { zIndex: 2, left: 193, bottom: 166 },
  guidedManageGroupDismissHint: { zIndex: 2, left: 193, top: 18 },
  guidedGroupMemberTarget: { position: 'absolute', zIndex: 2, left: 266, top: 50, width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  guidedTargetPulse: { position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,105,212,.84)', shadowColor: '#FFB5E9', shadowOpacity: .5, shadowRadius: 7 },
  guidedExitCard: { position: 'absolute', width: 266, padding: 16, borderWidth: 1, borderColor: 'rgba(98,246,255,.38)', borderRadius: 8, backgroundColor: 'rgba(16,10,39,.92)', shadowColor: '#21E8FF', shadowOpacity: .1, shadowRadius: 12 },
  guidedExitEyebrow: { fontSize: 10, lineHeight: 14, color: '#FF69D4', letterSpacing: 1 },
  guidedExitCopy: { marginTop: 8, fontSize: 11, lineHeight: 16, color: '#EAFDFF', letterSpacing: .15 },
  guidedExitPrimary: { minHeight: 38, marginTop: 14, paddingHorizontal: 10, borderRadius: 5, backgroundColor: '#62F6FF', alignItems: 'center', justifyContent: 'center' },
  guidedExitPrimaryText: { fontSize: 9, lineHeight: 12, fontWeight: '700', color: '#100A27', letterSpacing: .45 },
  guidedExitSecondary: { minHeight: 38, marginTop: 7, paddingHorizontal: 10, borderWidth: 1, borderColor: '#51416F', borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  guidedExitSecondaryText: { fontSize: 9, lineHeight: 12, fontWeight: '700', color: '#D1C7EA', letterSpacing: .45 },
  guidedExitPressed: { opacity: .7, transform: [{ scale: .985 }] },
  homeAnnotation: { position: 'absolute', width: 250, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: 'rgba(98,246,255,.4)', borderRadius: 4, backgroundColor: 'rgba(16,10,39,.74)', shadowColor: '#21E8FF', shadowOpacity: .08, shadowRadius: 8, opacity: .78 },
  homeAnnotationConnector: { position: 'absolute', left: -54, top: 25, width: 54, height: 1, backgroundColor: '#62F6FF' },
  homeAnnotationNode: { position: 'absolute', left: -58, top: 21, width: 8, height: 8, borderRadius: 4, backgroundColor: palette.navy, shadowColor: palette.navy, shadowOpacity: .45, shadowRadius: 5 },
  homeAnnotationLabel: { fontSize: 9, lineHeight: 12, color: '#FF69D4', letterSpacing: 1 },
  homeAnnotationCopy: { marginTop: 7, fontSize: 11, lineHeight: 16, color: '#EAFDFF', letterSpacing: .2 },
  addMemberAnnotation: { width: 270 },
  addMemberConnector: { position: 'absolute', left: -88, top: 36, width: 88, height: 1, backgroundColor: '#62F6FF' },
  addMemberAnnotationNode: { position: 'absolute', left: -92, top: 32, width: 8, height: 8, borderRadius: 4, backgroundColor: palette.navy, shadowColor: palette.navy, shadowOpacity: .45, shadowRadius: 5 },
  guestMemberAnnotation: { width: 270 },
  guestMemberConnector: { position: 'absolute', left: -92, top: 37, width: 92, height: 1, backgroundColor: '#62F6FF' },
  guestMemberAnnotationNode: { position: 'absolute', left: -96, top: 33, width: 8, height: 8, borderRadius: 4, backgroundColor: palette.navy, shadowColor: palette.navy, shadowOpacity: .45, shadowRadius: 5 },
  guestMemberSideQuest: { marginTop: 10, fontSize: 8, lineHeight: 11, color: '#62F6FF', letterSpacing: .75 },
  guestFinalDayAnnotation: { width: 290 },
  guestFinalDayConnector: { position: 'absolute', left: -240, top: 55, width: 240, height: 1, backgroundColor: '#62F6FF' },
  guestFinalDayAnnotationNode: { position: 'absolute', left: -244, top: 51, width: 8, height: 8, borderRadius: 4, backgroundColor: palette.navy, shadowColor: palette.navy, shadowOpacity: .45, shadowRadius: 5 },
  homeActionsAnnotation: { width: 250 },
  homeActionsConnectorHorizontal: { position: 'absolute', left: -235, top: 80, width: 235, height: 1, backgroundColor: '#62F6FF' },
  homeActionsAnnotationNode: { position: 'absolute', left: -239, top: 76, width: 8, height: 8, borderRadius: 4, backgroundColor: palette.navy, shadowColor: palette.navy, shadowOpacity: .45, shadowRadius: 5 },
  overviewActionsAnnotation: { width: 250 },
  overviewActionsConnector: { position: 'absolute', left: -40, top: 34, width: 40, height: 1, backgroundColor: '#62F6FF' },
  overviewActionsAnnotationNode: { position: 'absolute', left: -44, top: 30, width: 8, height: 8, borderRadius: 4, backgroundColor: palette.navy, shadowColor: palette.navy, shadowOpacity: .45, shadowRadius: 5 },
  groupManagementStartAnnotation: { width: 250 },
  groupManagementStartConnector: { position: 'absolute', left: -126, top: 25, width: 126, height: 1, backgroundColor: '#62F6FF' },
  groupManagementStartAnnotationNode: { position: 'absolute', left: -130, top: 21, width: 8, height: 8, borderRadius: 4, backgroundColor: palette.navy, shadowColor: palette.navy, shadowOpacity: .45, shadowRadius: 5 },
  renAcceptedAnnotation: { width: 250 },
  renAcceptedConnector: { position: 'absolute', left: -175, top: 25, width: 175, height: 1, backgroundColor: '#62F6FF' },
  renAcceptedAnnotationNode: { position: 'absolute', left: -179, top: 21, width: 8, height: 8, borderRadius: 4, backgroundColor: palette.navy, shadowColor: palette.navy, shadowOpacity: .45, shadowRadius: 5 },
  pollCreatorAnnotation: { width: 270 },
  pollCreatorConnector: { position: 'absolute', left: -50, top: 34, width: 50, height: 1, backgroundColor: '#62F6FF' },
  pollCreatorAnnotationNode: { position: 'absolute', left: -54, top: 30, width: 8, height: 8, borderRadius: 4, backgroundColor: palette.navy, shadowColor: palette.navy, shadowOpacity: .45, shadowRadius: 5 },
  pollSuggestionAnnotation: { width: 290 },
  pollSuggestionConnector: { position: 'absolute', left: -92, top: 58, width: 92, height: 1, backgroundColor: '#62F6FF' },
  pollSuggestionAnnotationNode: { position: 'absolute', left: -96, top: 54, width: 8, height: 8, borderRadius: 4, backgroundColor: palette.navy, shadowColor: palette.navy, shadowOpacity: .45, shadowRadius: 5 },
  expenseSummaryAnnotation: { width: 300 },
  expenseSummaryConnector: { position: 'absolute', left: -92, top: 66, width: 92, height: 1, backgroundColor: '#62F6FF' },
  expenseSummaryAnnotationNode: { position: 'absolute', left: -96, top: 62, width: 8, height: 8, borderRadius: 4, backgroundColor: palette.navy, shadowColor: palette.navy, shadowOpacity: .45, shadowRadius: 5 },
  expenseDetailsAnnotation: { width: 300 },
  expenseDetailsConnector: { position: 'absolute', left: -92, top: 58, width: 92, height: 1, backgroundColor: '#62F6FF' },
  expenseDetailsAnnotationNode: { position: 'absolute', left: -96, top: 54, width: 8, height: 8, borderRadius: 4, backgroundColor: palette.navy, shadowColor: palette.navy, shadowOpacity: .45, shadowRadius: 5 },
  activityCategoryAnnotation: { width: 290 },
  activityCategoryConnector: { position: 'absolute', left: -92, top: 46, width: 92, height: 1, backgroundColor: '#62F6FF' },
  activityCategoryAnnotationNode: { position: 'absolute', left: -96, top: 42, width: 8, height: 8, borderRadius: 4, backgroundColor: palette.navy, shadowColor: palette.navy, shadowOpacity: .45, shadowRadius: 5 },
  activitySavedAnnotation: { width: 290 },
  activitySavedConnector: { position: 'absolute', left: -92, top: 46, width: 92, height: 1, backgroundColor: '#62F6FF' },
  activitySavedAnnotationNode: { position: 'absolute', left: -96, top: 42, width: 8, height: 8, borderRadius: 4, backgroundColor: palette.navy, shadowColor: palette.navy, shadowOpacity: .45, shadowRadius: 5 },
  tripHeaderAnnotation: { width: 250 },
  tripHeaderConnectorHorizontal: { position: 'absolute', left: -138, top: 25, width: 138, height: 1, backgroundColor: '#62F6FF' },
  tripHeaderConnectorVertical: { position: 'absolute', left: -138, top: -24, width: 1, height: 49, backgroundColor: '#62F6FF' },
  tripHeaderAnnotationNode: { position: 'absolute', left: -142, top: -28, width: 8, height: 8, borderRadius: 4, backgroundColor: palette.navy, shadowColor: palette.navy, shadowOpacity: .45, shadowRadius: 5 },
  tripUtilitiesAnnotation: { width: 250 },
  tripUtilitiesConnector: { position: 'absolute', left: -75, top: 102, width: 75, height: 1, backgroundColor: '#62F6FF' },
  tripUtilitiesAnnotationNode: { position: 'absolute', left: -79, top: 98, width: 8, height: 8, borderRadius: 4, backgroundColor: palette.navy, shadowColor: palette.navy, shadowOpacity: .45, shadowRadius: 5 },
  tripTabsAnnotation: { width: 250 },
  tripTabsConnectorHorizontal: { position: 'absolute', left: -58, top: 42, width: 58, height: 1, backgroundColor: '#62F6FF' },
  tripTabsAnnotationNode: { position: 'absolute', left: -62, top: 38, width: 8, height: 8, borderRadius: 4, backgroundColor: palette.navy, shadowColor: palette.navy, shadowOpacity: .45, shadowRadius: 5 },
  tripTabsProblemCopy: { marginTop: 7, fontSize: 10, lineHeight: 15, color: '#D1C7EA', letterSpacing: .15 },
  tripTabsDecisionLabel: { marginTop: 12, fontSize: 8, lineHeight: 11, color: '#62F6FF', letterSpacing: .8 },
  tripTabsDecisionCopy: { marginTop: 4, fontSize: 10, lineHeight: 15, color: '#EAFDFF', letterSpacing: .15 },
  tripOverviewAnnotation: { width: 250 },
  tripOverviewConnectorHorizontal: { position: 'absolute', left: -50, top: 25, width: 50, height: 1, backgroundColor: '#62F6FF' },
  tripOverviewAnnotationNode: { position: 'absolute', left: -54, top: 21, width: 8, height: 8, borderRadius: 4, backgroundColor: palette.navy, shadowColor: palette.navy, shadowOpacity: .45, shadowRadius: 5 },
  customizeTabsAnnotation: { width: 250 },
  customizeTabsConnector: { position: 'absolute', left: -125, top: 87, width: 125, height: 1, backgroundColor: '#62F6FF' },
  customizeTabsAnnotationNode: { position: 'absolute', left: -129, top: 83, width: 8, height: 8, borderRadius: 4, backgroundColor: palette.navy, shadowColor: palette.navy, shadowOpacity: .45, shadowRadius: 5 },
  savedTabAnnotation: { width: 250 },
  savedTabConnector: { position: 'absolute', left: -58, top: 37, width: 58, height: 1, backgroundColor: '#62F6FF' },
  savedTabAnnotationNode: { position: 'absolute', left: -62, top: 33, width: 8, height: 8, borderRadius: 4, backgroundColor: palette.navy, shadowColor: palette.navy, shadowOpacity: .45, shadowRadius: 5 },
  optionalTabsAnnotation: { width: 250 },
  optionalTabsConnector: { position: 'absolute', left: -58, top: 25, width: 58, height: 1, backgroundColor: '#62F6FF' },
  optionalTabsBranch: { position: 'absolute', left: -58, top: -8, width: 1, height: 65, backgroundColor: '#62F6FF' },
  optionalTabsGuidesNode: { position: 'absolute', left: -62, top: -12, width: 8, height: 8, borderRadius: 4, backgroundColor: palette.navy, shadowColor: palette.navy, shadowOpacity: .45, shadowRadius: 5 },
  optionalTabsJournalNode: { position: 'absolute', left: -62, top: 53, width: 8, height: 8, borderRadius: 4, backgroundColor: palette.navy, shadowColor: palette.navy, shadowOpacity: .45, shadowRadius: 5 },
  customizeAnnotationCopy: { marginTop: 7, fontSize: 10, lineHeight: 15, color: '#D1C7EA', letterSpacing: .15 },
  customizeAnnotationIntent: { marginTop: 4, fontSize: 10, lineHeight: 15, color: '#EAFDFF', letterSpacing: .15 },
  device: {
    width: 410,
    height: 852,
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: 46,
    borderWidth: 8,
    backgroundColor: '#11181C',
    borderColor: '#11181C',
    overflow: 'hidden',
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.25,
    shadowRadius: 42,
  },
  screen: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: palette.canvas,
  },
  screenRounded: {
    borderRadius: 38,
  },
  hardware: {
    position: 'absolute',
    zIndex: 100,
    top: 12,
    left: '50%',
    marginLeft: -48,
    width: 96,
    height: 27,
    borderRadius: 16,
    backgroundColor: '#0B1013',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  speaker: {
    width: 34,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#273239',
  },
  camera: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#182E3C',
    borderWidth: 1,
    borderColor: '#304754',
  },
  caption: {
    position: 'absolute',
    bottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },
  captionDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(20,43,59,.34)',
  },
});
