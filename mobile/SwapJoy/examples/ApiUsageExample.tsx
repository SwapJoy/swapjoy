import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import SJText from '../components/SJText';

// Example component showing how to use the authenticated API service
const ApiUsageExample: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Example: Fetch user's items
  const fetchItems = async () => {
    if (!isAuthenticated) {
      Alert.alert('Error', 'You must be authenticated to fetch items');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await ApiService.getItems();
      
      if (error) {
        Alert.alert('Error', error.message || 'Failed to fetch items');
        return;
      }

      setItems(data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  // Example: Create a new item
  const createItem = async () => {
    if (!isAuthenticated) {
      Alert.alert('Error', 'You must be authenticated to create items');
      return;
    }

    const newItem = {
      title: 'Sample Item',
      description: 'This is a sample item created via API',
      condition: 'good',
      estimated_value: 50.00,
    };

    try {
      const { data, error } = await ApiService.createItem(newItem);
      
      if (error) {
        Alert.alert('Error', error.message || 'Failed to create item');
        return;
      }

      Alert.alert('Success', 'Item created successfully!');
      fetchItems(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', 'Failed to create item');
    }
  };

  // Example: Update user profile
  const updateProfile = async () => {
    if (!isAuthenticated) {
      Alert.alert('Error', 'You must be authenticated to update profile');
      return;
    }

    const updates = {
      first_name: 'Updated Name',
      bio: 'This is my updated bio',
    };

    try {
      const { data, error } = await ApiService.updateProfile(updates);
      
      if (error) {
        Alert.alert('Error', error.message || 'Failed to update profile');
        return;
      }

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchItems();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <SJText style={styles.message}>Please sign in to use the API</SJText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SJText style={styles.title}>API Usage Example</SJText>
      <SJText style={styles.subtitle}>Welcome, {user?.first_name}!</SJText>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={fetchItems}>
          <SJText style={styles.buttonText}>Fetch Items</SJText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={createItem}>
          <SJText style={styles.buttonText}>Create Item</SJText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={updateProfile}>
          <SJText style={styles.buttonText}>Update Profile</SJText>
        </TouchableOpacity>
      </View>

      <SJText style={styles.listTitle}>Your Items:</SJText>
      {loading ? (
        <SJText>Loading...</SJText>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <SJText style={styles.itemTitle}>{item.title}</SJText>
              <SJText style={styles.itemDescription}>{item.description}</SJText>
              <SJText style={styles.itemCondition}>Condition: {item.condition}</SJText>
            </View>
          )}
          ListEmptyComponent={<SJText>No items found</SJText>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  itemCondition: {
    fontSize: 12,
    color: '#888',
  },
});

export default ApiUsageExample;
