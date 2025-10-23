import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileScreenProps } from '../types/navigation';
import { useProfileData } from '../hooks/useProfileData';

const ProfileScreen: React.FC<ProfileScreenProps> = memo(() => {
  const {
    user,
    stats,
    rating,
    loading,
    handleSignOut,
    formatSuccessRate,
    formatRating,
  } = useProfileData();


  const renderStatItem = useCallback((title: string, value: string | number, subtitle?: string) => (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  ), []);

  const renderProfileItem = useCallback((
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    showArrow: boolean = true
  ) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress}>
      <View style={styles.profileItemLeft}>
        <Text style={styles.profileItemIcon}>{icon}</Text>
        <View style={styles.profileItemText}>
          <Text style={styles.profileItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.profileItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && <Text style={styles.arrow}>›</Text>}
    </TouchableOpacity>
  ), []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: (user as any)?.profile_image_url || 'https://via.placeholder.com/100' }}
                style={styles.avatar}
              />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.first_name} {user?.last_name}
              </Text>
              <Text style={styles.username}>@{user?.username}</Text>
              {(user as any)?.bio && (
                <Text style={styles.bio}>{(user as any).bio}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            {renderStatItem('Items Listed', stats.itemsListed)}
            {renderStatItem('Items Swapped', stats.itemsSwapped)}
          </View>
          <View style={styles.statsRow}>
            {renderStatItem('Total Offers', stats.totalOffers)}
            {renderStatItem('Success Rate', formatSuccessRate(stats.successRate))}
          </View>
        </View>

        {/* Rating */}
        {rating.totalRatings > 0 && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingTitle}>Rating</Text>
            <View style={styles.ratingContent}>
              <Text style={styles.ratingValue}>{formatRating(rating.averageRating)}</Text>
              <Text style={styles.ratingStars}>★★★★★</Text>
              <Text style={styles.ratingCount}>({rating.totalRatings} reviews)</Text>
            </View>
          </View>
        )}

        {/* Profile Options */}
        <View style={styles.profileOptions}>
          {renderProfileItem('👤', 'Edit Profile', 'Update your personal information')}
          {renderProfileItem('🔔', 'Notifications', 'Manage your notification preferences')}
          {renderProfileItem('🔒', 'Privacy & Security', 'Control your privacy settings')}
          {renderProfileItem('💬', 'Help & Support', 'Get help and contact support')}
          {renderProfileItem('ℹ️', 'About', 'App version and legal information')}
        </View>

        {/* Sign Out */}
        <View style={styles.signOutContainer}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#555',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statsContainer: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  ratingContainer: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  ratingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  ratingStars: {
    fontSize: 16,
    color: '#FFD700',
    marginRight: 10,
  },
  ratingCount: {
    fontSize: 14,
    color: '#666',
  },
  profileOptions: {
    backgroundColor: '#fff',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 24,
    textAlign: 'center',
  },
  profileItemText: {
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  profileItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  arrow: {
    fontSize: 18,
    color: '#ccc',
    marginLeft: 10,
  },
  signOutContainer: {
    padding: 20,
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;