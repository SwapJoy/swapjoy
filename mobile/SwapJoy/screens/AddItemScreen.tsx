import React from 'react';
import {View, StyleSheet, TouchableOpacity, SafeAreaView} from 'react-native';
import SJText from '../components/SJText';
import { Ionicons } from '@expo/vector-icons';
import { AddItemScreenProps } from '../types/navigation';
import { colors } from '@navigation/MainTabNavigator.styles';

const AddItemScreen: React.FC<AddItemScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={colors.primaryDark} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="add-circle" size={80} color={colors.primaryDark} />
        </View>
        
        <SJText style={styles.title}>Add New Item</SJText>
        <SJText style={styles.subtitle}>
          Create a new listing to share with the SwapJoy community
        </SJText>
        
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Ionicons name="camera" size={20} color={colors.primaryDark} />
            <SJText style={styles.featureText}>Take photos of your item</SJText>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="text" size={20} color={colors.primaryDark} />
            <SJText style={styles.featureText}>Add description and details</SJText>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="location" size={20} color={colors.primaryDark} />
            <SJText style={styles.featureText}>Set your location</SJText>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="swap-horizontal" size={20} color={colors.primaryDark} />
            <SJText style={styles.featureText}>Choose what you want to swap for</SJText>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => {
            navigation.navigate('Camera');
          }}
        >
          <SJText style={styles.startButtonText}>Start Creating</SJText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007AFF', // Blue background as requested
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  featureList: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  featureText: {
    color: colors.primaryDark,
    fontSize: 16,
    marginLeft: 15,
    flex: 1,
  },
  startButton: {
    backgroundColor: colors.primaryYellow,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  startButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddItemScreen;
