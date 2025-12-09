import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import SJText from '../components/SJText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreateListingScreenProps } from '../types/navigation';

const CreateListingScreen: React.FC<CreateListingScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <SJText style={styles.title}>Create Listing</SJText>
        <SJText style={styles.subtitle}>Coming soon!</SJText>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <SJText style={styles.buttonText}>Go Back</SJText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateListingScreen;
