import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useAppIntro } from '../hooks/useAppIntro';
import { IntroScreenProps } from '../types/navigation';
import { useLocalization } from '../localization';
import { LanguageSelector } from '../components/LanguageSelector';
import SJText from '../components/SJText';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const INTRO_COMPLETED_KEY = 'intro_completed';

const IntroScreen: React.FC<IntroScreenProps> = ({ navigation }) => {
  const { slides, activeSlide, handleSlideChange, handleGetStarted } = useAppIntro();
  const { t, language, setLanguage } = useLocalization();

  const handleGetStartedPress = async () => {
    // Mark intro as completed
    await AsyncStorage.setItem(INTRO_COMPLETED_KEY, 'true');
    handleGetStarted();
    // Navigate to MainTabs instead of EmailSignIn
    navigation.navigate('MainTabs');
  };

  const handleLanguageSelect = useCallback(
    (nextLanguage: typeof language) => {
      void setLanguage(nextLanguage);
    },
    [setLanguage]
  );

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    handleSlideChange(Math.round(index));
  };

  const goToNext = () => {
    if (activeSlide < slides.length - 1) {
      const nextIndex = activeSlide + 1;
      // Scroll logic would be handled by ScrollView
      handleSlideChange(nextIndex);
    }
  };

  const goToPrevious = () => {
    if (activeSlide > 0) {
      const prevIndex = activeSlide - 1;
      // Scroll logic would be handled by ScrollView
      handleSlideChange(prevIndex);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <LanguageSelector
          selectedLanguage={language}
          onSelect={handleLanguageSelect}
        />
        <TouchableOpacity style={styles.skipButton} onPress={handleGetStartedPress}>
          <SJText style={styles.skipText}>{t('onboarding.actions.skip')}</SJText>
        </TouchableOpacity>
      </View>

      {/* Sliding content */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slides.map((item) => (
          <View key={item.key} style={styles.slide}>
            <View style={styles.imageContainer}>
              <SJText style={styles.emoji}>{item.image}</SJText>
            </View>
            <SJText style={styles.title}>{item.title}</SJText>
            <SJText style={styles.description}>{item.text}</SJText>
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
        {activeSlide > 0 && (
          <TouchableOpacity style={styles.navButton} onPress={goToPrevious}>
            <SJText style={styles.navButtonText}>{t('onboarding.actions.previous')}</SJText>
          </TouchableOpacity>
        )}
        
        {activeSlide < slides.length - 1 ? (
          <TouchableOpacity style={styles.navButton} onPress={goToNext}>
            <SJText style={styles.navButtonText}>{t('onboarding.actions.next')}</SJText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.signInButton} onPress={handleGetStartedPress}>
            <SJText style={styles.signInButtonText}>{t('onboarding.actions.getStarted')}</SJText>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skipText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  imageContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#007AFF',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    color: '#007AFF',
    fontWeight: '500',
  },
  signInButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    flex: 1,
    alignItems: 'center',
  },
  signInButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default IntroScreen;

