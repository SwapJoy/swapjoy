import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useOnboarding } from '../hooks/useOnboarding';
import { OnboardingScreenProps } from '../types/navigation';

const { width } = Dimensions.get('window');

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const { slides, activeSlide, handleSlideChange, handleGetStarted } = useOnboarding();

  const handleGetStartedPress = () => {
    navigation.navigate('PhoneSignIn');
  };

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
      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleGetStartedPress}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

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
              <Text style={styles.emoji}>{item.image}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.text}</Text>
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
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        
        {activeSlide < slides.length - 1 ? (
          <TouchableOpacity style={styles.navButton} onPress={goToNext}>
            <Text style={styles.navButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.signInButton} onPress={handleGetStartedPress}>
            <Text style={styles.signInButtonText}>Get Started</Text>
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
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
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

export default OnboardingScreen;