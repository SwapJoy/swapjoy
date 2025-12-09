import React, { memo, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, } from 'react-native';
import SJText from '../components/SJText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ApiService } from '../services/api';
import CachedImage from '../components/CachedImage';

interface FollowerUser {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
  followed_at?: string;
}

const FollowersFollowingScreen: React.FC = memo(() => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userId, initialTab = 'followers' } = (route.params as any) || {};

  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
  const [followers, setFollowers] = useState<FollowerUser[]>([]);
  const [following, setFollowing] = useState<FollowerUser[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  // Track which tabs have been loaded to prevent duplicate loads
  const loadedTabsRef = useRef<Set<'followers' | 'following'>>(new Set());
  const isLoadingRef = useRef({ followers: false, following: false });

  // Load followers when tab is active
  const loadFollowers = useCallback(async () => {
    if (!userId || isLoadingRef.current.followers || loadedTabsRef.current.has('followers')) {
      return;
    }

    isLoadingRef.current.followers = true;
    setLoadingFollowers(true);
    try {
      const res = await ApiService.getFollowers(userId);
      if (res.data) {
        setFollowers(res.data as FollowerUser[]);
        loadedTabsRef.current.add('followers');
      }
    } catch (error) {
      console.error('Error loading followers:', error);
    } finally {
      setLoadingFollowers(false);
      isLoadingRef.current.followers = false;
    }
  }, [userId]);

  // Load following when tab is active
  const loadFollowing = useCallback(async () => {
    if (!userId || isLoadingRef.current.following || loadedTabsRef.current.has('following')) {
      return;
    }

    isLoadingRef.current.following = true;
    setLoadingFollowing(true);
    try {
      const res = await ApiService.getFollowing(userId);
      if (res.data) {
        setFollowing(res.data as FollowerUser[]);
        loadedTabsRef.current.add('following');
      }
    } catch (error) {
      console.error('Error loading following:', error);
    } finally {
      setLoadingFollowing(false);
      isLoadingRef.current.following = false;
    }
  }, [userId]);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'followers') {
      loadFollowers();
    } else {
      loadFollowing();
    }
  }, [activeTab, loadFollowers, loadFollowing]);

  // Reset loaded tabs when userId changes
  useEffect(() => {
    loadedTabsRef.current.clear();
    setFollowers([]);
    setFollowing([]);
  }, [userId]);

  const currentData = useMemo(() => {
    return activeTab === 'followers' ? followers : following;
  }, [activeTab, followers, following]);

  const isLoading = useMemo(() => {
    return activeTab === 'followers' ? loadingFollowers : loadingFollowing;
  }, [activeTab, loadingFollowers, loadingFollowing]);

  const renderUserItem = useCallback(({ item }: { item: FollowerUser }) => {
    const displayName = item.first_name || item.last_name
      ? `${item.first_name || ''} ${item.last_name || ''}`.trim()
      : item.username || 'User';
    
    const handlePress = () => {
      navigation.navigate('UserProfile', { userId: item.id });
    };

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <CachedImage
            uri={item.profile_image_url || ''}
            style={styles.avatar}
            resizeMode="cover"
            fallbackUri={'https://via.placeholder.com/100?text=Avatar'}
            defaultSource={require('../assets/icon.png')}
          />
        </View>
        <View style={styles.userInfo}>
          <SJText style={styles.userName} numberOfLines={1}>
            {displayName}
          </SJText>
          {item.username && (
            <SJText style={styles.username} numberOfLines={1}>
              @{item.username}
            </SJText>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [navigation]);

  return (
    <View style={styles.container} edges={['top']}>
      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab('followers')}
            style={[styles.tabButton, activeTab === 'followers' && styles.tabButtonActive]}
          >
            <SJText style={[styles.tabText, activeTab === 'followers' && styles.tabTextActive]}>
              Followers
            </SJText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('following')}
            style={[styles.tabButton, activeTab === 'following' && styles.tabButtonActive]}
          >
            <SJText style={[styles.tabText, activeTab === 'following' && styles.tabTextActive]}>
              Following
            </SJText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <SJText style={styles.loadingText}>Loading...</SJText>
        </View>
      ) : (
        <FlatList
          data={currentData}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          contentContainerStyle={currentData.length === 0 ? styles.emptyContainer : styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyView}>
              <SJText style={styles.emptyText}>
                No {activeTab === 'followers' ? 'followers' : 'following'} yet
              </SJText>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  tabsWrapper: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    color: '#8E8E93',
    fontSize: 15,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 400,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  listContent: {
    padding: 12,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: '#666',
  },
});

export default FollowersFollowingScreen;

