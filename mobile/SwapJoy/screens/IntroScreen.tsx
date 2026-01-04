import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { useAppIntro } from '../hooks/useAppIntro';
import { IntroScreenProps } from '../types/navigation';
import { useLocalization } from '../localization';
import SJText from '../components/SJText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@navigation/MainTabNavigator.styles';
import { AppLanguage, SUPPORTED_LANGUAGES, LANGUAGE_LABELS } from '../types/language';

const { width, height } = Dimensions.get('window');

const INTRO_COMPLETED_KEY = 'intro_completed';

const IntroScreen: React.FC<IntroScreenProps> = ({ navigation }) => {
  const { slides, activeSlide, handleSlideChange, handleGetStarted } = useAppIntro();
  const { t, language, setLanguage } = useLocalization();
  const scrollViewRef = useRef<ScrollView>(null);
  const [hasSeenLastSlide, setHasSeenLastSlide] = useState(false);

  const handleGetStartedPress = async () => {
    // Mark intro as completed
    await AsyncStorage.setItem(INTRO_COMPLETED_KEY, 'true');
    handleGetStarted();
    // Navigate to MainTabs instead of EmailSignIn
    navigation.navigate('MainTabs');
  };

  const handleLanguageSelect = useCallback(
    (nextLanguage: AppLanguage) => {
      void setLanguage(nextLanguage);
    },
    [setLanguage]
  );

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundedIndex = Math.round(index);
    handleSlideChange(roundedIndex);
    
    // Track if user has seen the last slide
    if (roundedIndex === slides.length - 1) {
      setHasSeenLastSlide(true);
    }
  };

  const goToNext = () => {
    if (activeSlide < slides.length - 1) {
      const nextIndex = activeSlide + 1;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
      // Don't update state here - let the scroll event handle it
      // Track if user has reached the last slide
      if (nextIndex === slides.length - 1) {
        setHasSeenLastSlide(true);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Language Switcher - Centered on top */}
      <View style={styles.languageContainer}>
        <View style={styles.inlineSelectionContainer}>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.inlineSelectionButton,
                language === lang && styles.inlineSelectionButtonSelected,
              ]}
              onPress={() => handleLanguageSelect(lang)}
            >
              <SJText
                style={[
                  styles.inlineSelectionText,
                  language === lang && styles.inlineSelectionTextSelected,
                ]}
              >
                {LANGUAGE_LABELS[lang]}
              </SJText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sliding content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slides.map((item) => (
          <View key={item.key} style={styles.slide}>
            <Image
              source={item.image}
              style={styles.introImage}
              resizeMode="contain"
            />
            <View style={styles.textContainer}>
              <SJText style={styles.title}>{item.title}</SJText>
              <SJText style={styles.description}>{item.text}</SJText>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Page indicators */}
      <View style={styles.indicatorContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              activeSlide === index && styles.activeIndicator,
            ]}
          />
        ))}
      </View>

      {/* Navigation buttons */}
      <View style={styles.navigationContainer}>
        {hasSeenLastSlide ? (
          <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStartedPress}>
            <SJText style={styles.getStartedButtonText}>{t('onboarding.actions.getStarted')}</SJText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.navButton} onPress={goToNext}>
            <SJText style={styles.navButtonText}>{t('onboarding.actions.next')}</SJText>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  languageContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  inlineSelectionContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  inlineSelectionButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  inlineSelectionButtonSelected: {
    backgroundColor: colors.primaryYellow,
    borderColor: colors.primaryYellow,
  },
  inlineSelectionText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  inlineSelectionTextSelected: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
  },
  introImage: {
    width: '100%',
    height: height * 0.42,
  },
  textContainer: {
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 8,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 20,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    paddingTop: 10,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: colors.primaryYellow,
    width: 24,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
    gap: 12,
  },
  navButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  navButtonText: {
    fontSize: 16,
    color: colors.primaryYellow,
    fontWeight: '500',
  },
  getStartedButton: {
    backgroundColor: colors.primaryYellow,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    flex: 1,
    alignItems: 'center',
  },
  getStartedButtonText: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default IntroScreen;

