import React, { useRef, useState } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import CameraScreen from './CameraScreen';
import MainTabNavigator from '../navigation/MainTabNavigator';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

const MainPageContainer: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(1); // Start with page 2 (MainTabs)
  const { isAuthenticated, isAnonymous } = useAuth();
  const navigation = useNavigation<any>();

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / width);
    
    // Prevent landing on camera (page 0) if user is not authenticated
    if (page === 0 && (!isAuthenticated || isAnonymous)) {
      // Snap back to MainTabs (page 1)
      scrollViewRef.current?.scrollTo({
        x: width,
        animated: false,
      });
      setCurrentPage(1);
      return;
    }
    
    setCurrentPage(page);
  };

  // Update page on scroll (not just momentum end) for more accurate tracking
  const handleScrollEvent = (event: any) => {
    if (!isAuthenticated || isAnonymous) {
      const offsetX = event.nativeEvent.contentOffset.x;
      // Prevent any scrolling left of MainTabs (page 1)
      if (offsetX < width) {
        scrollViewRef.current?.scrollTo({
          x: width,
          animated: false,
        });
        return;
      }
    }
    
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / width);
    
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const scrollToPage = (page: number) => {
    scrollViewRef.current?.scrollTo({
      x: page * width,
      animated: true,
    });
  };

  // Prevent scrolling left (to camera) when not authenticated
  const handleScrollBeginDrag = (event: any) => {
    if ((!isAuthenticated || isAnonymous) && currentPage === 1) {
      // Block any leftward scrolling from MainTabs
      scrollViewRef.current?.scrollTo({
        x: width,
        animated: false,
      });
    }
  };

  const handleNavigateToAdd = () => {
    // Check if user is authenticated (not anonymous)
    if (!isAuthenticated || isAnonymous) {
      navigation.navigate('EmailSignIn');
      return;
    }
    // Navigate to camera/add item
    scrollToPage(0);
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onScroll={handleScrollEvent}
      onScrollBeginDrag={handleScrollBeginDrag}
      onMomentumScrollEnd={handleScroll}
      scrollEventThrottle={16}
      contentOffset={{ x: width, y: 0 }} // Start at page 2 (MainTabs)
      style={styles.container}
      scrollEnabled={(isAuthenticated && !isAnonymous) || currentPage === 0}
      bounces={isAuthenticated && !isAnonymous}
    >
      {/* Page 1: Camera Screen */}
      <View style={styles.page}>
        <CameraScreen 
          onNavigateToMain={() => scrollToPage(1)} 
          isVisible={currentPage === 0}
        />
      </View>
      
      {/* Page 2: MainTabs (default) */}
      <View style={styles.page}>
        <MainTabNavigator onNavigateToAdd={handleNavigateToAdd} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    width: width,
    flex: 1,
  },
});

export default MainPageContainer;
