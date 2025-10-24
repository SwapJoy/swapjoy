import React, { useRef, useState } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import CameraScreenTest from './CameraScreenTest';
import MainTabNavigator from '../navigation/MainTabNavigator';

const { width } = Dimensions.get('window');

const MainPageContainer: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(1); // Start with page 2 (MainTabs)

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / width);
    setCurrentPage(page);
  };

  const scrollToPage = (page: number) => {
    scrollViewRef.current?.scrollTo({
      x: page * width,
      animated: true,
    });
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={handleScroll}
      contentOffset={{ x: width, y: 0 }} // Start at page 2 (MainTabs)
      style={styles.container}
    >
      {/* Page 1: Camera Screen */}
      <View style={styles.page}>
        <CameraScreenTest onNavigateToMain={() => scrollToPage(1)} />
      </View>
      
      {/* Page 2: MainTabs (default) */}
      <View style={styles.page}>
        <MainTabNavigator onNavigateToAdd={() => scrollToPage(0)} />
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
