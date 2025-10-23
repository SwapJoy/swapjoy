import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExploreScreenProps } from '../types/navigation';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.7;

interface AIOffer {
  id: string;
  title: string;
  description: string;
  condition: string;
  estimated_value: number;
  image_url?: string;
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
  match_score: number;
  reason: string;
}

const ExploreScreen: React.FC<ExploreScreenProps> = memo(({ navigation }) => {
  const { user } = useAuth();
  const [aiOffers, setAiOffers] = useState<AIOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const isMountedRef = useRef(true);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  console.log('ExploreScreen render - user:', !!user, 'loading:', loading, 'hasData:', hasData, 'aiOffers.length:', aiOffers.length);

  const fetchAIOffers = useCallback(async () => {
    if (!user) {
      console.log('No user authenticated, skipping fetch');
      if (isMountedRef.current) {
        setLoading(false);
        setIsInitialized(true);
      }
      return;
    }

    if (isFetching) {
      console.log('Already fetching, skipping duplicate request');
      return;
    }
    
    try {
      setIsFetching(true);
      
      // Fetch items from "Top Picks" section (favorite categories)
      const { data: topPicks, error: topPicksError } = await ApiService.getTopPicksForUser(user.id, 10);
      
      if (topPicksError) {
        console.error('Error fetching top picks:', topPicksError);
        return;
      }

      // Transform items to AIOffer format
      const aiOffers: AIOffer[] = (topPicks || []).map((item: any) => {
        const matchScore = calculateMatchScore(item, user);
        const reason = getMatchReason(item, matchScore);
        
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          condition: item.condition,
          estimated_value: item.estimated_value || 0,
          image_url: item.item_images?.[0]?.image_url || 'https://via.placeholder.com/200x150',
          user: {
            id: item.users?.id || item.user_id,
            username: item.users?.username || `user_${item.user_id.slice(-4)}`,
            first_name: item.users?.first_name || `User ${item.user_id.slice(-4)}`,
            last_name: item.users?.last_name || '',
          },
          match_score: matchScore,
          reason: reason,
        };
      });

      // Sort by match score (highest first)
      aiOffers.sort((a, b) => b.match_score - a.match_score);

      if (isMountedRef.current) {
        setAiOffers(aiOffers);
        setHasData(true);
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Error fetching AI offers:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setIsFetching(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // Clear any existing timeout
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      
      // Debounce the fetch
      fetchTimeoutRef.current = setTimeout(() => {
        fetchAIOffers();
      }, 100);
    }
    
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [user, fetchAIOffers]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const calculateMatchScore = useCallback((item: any, currentUser: any) => {
    let score = 70; // Base score for items from favorite categories

    // Category matching (items are already from favorite categories, so high score)
    score += 20; // Bonus for being in favorite categories

    // Price range matching
    const itemPrice = item.estimated_value || 0;
    if (itemPrice > 0) {
      if (itemPrice >= 50 && itemPrice <= 200) score += 15;
      else if (itemPrice >= 100 && itemPrice <= 500) score += 10;
      else if (itemPrice >= 200 && itemPrice <= 1000) score += 5;
    }

    // Condition matching
    if (item.condition === 'excellent') score += 10;
    else if (item.condition === 'good') score += 5;

    // Recency bonus (newer items get higher scores)
    const daysSinceCreated = item.created_at ? 
      (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24) : 30;
    if (daysSinceCreated < 7) score += 10;
    else if (daysSinceCreated < 30) score += 5;

    // Ensure score is between 70-100
    return Math.min(100, Math.max(70, score));
  }, []);

  const getMatchReason = useCallback((item: any, matchScore: number) => {
    const reasons = [];
    
    if (matchScore >= 90) {
      reasons.push('Perfect match for your favorite categories');
      reasons.push('Excellent condition and great value');
      reasons.push('Highly recommended based on your interests');
    } else if (matchScore >= 80) {
      reasons.push('Great match from your favorite categories');
      reasons.push('Good value within your preferred range');
      reasons.push('Matches your interests perfectly');
    } else {
      reasons.push('From your favorite categories');
      reasons.push('Good condition and fair price');
      reasons.push('Worth considering');
    }

    // Add specific reasons based on item properties
    if (item.condition === 'excellent') {
      reasons.push('Excellent condition');
    }
    if (item.estimated_value && item.estimated_value >= 50 && item.estimated_value <= 200) {
      reasons.push('Great price range');
    }
    
    // Add recency reason
    const daysSinceCreated = item.created_at ? 
      (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24) : 30;
    if (daysSinceCreated < 7) {
      reasons.push('Recently added');
    }

    return reasons[Math.floor(Math.random() * reasons.length)];
  }, []);

  const renderAIOffer = useCallback(({ item }: { item: AIOffer }) => (
    <TouchableOpacity
      style={styles.offerCard}
      onPress={() => (navigation as any).navigate('ItemDetails', { itemId: item.id })}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image_url || 'https://via.placeholder.com/200x150' }}
          style={styles.itemImage}
          resizeMode="cover"
        />
        <View style={styles.matchBadge}>
          <Text style={styles.matchScore}>{item.match_score}%</Text>
        </View>
      </View>
      
      <View style={styles.offerContent}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.offerDetails}>
          <Text style={styles.condition}>Condition: {item.condition}</Text>
          <Text style={styles.value}>${item.estimated_value}</Text>
        </View>
        
        <View style={styles.matchReason}>
          <Text style={styles.reasonText}>{item.reason}</Text>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.user.first_name} {item.user.last_name}
          </Text>
          <Text style={styles.username}>@{item.user.username}</Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [navigation]);

  if (!user) {
         return (
           <SafeAreaView style={styles.container}>
             <View style={styles.loadingContainer}>
               <Text style={styles.loadingText}>Please sign in to view AI Matches...</Text>
             </View>
           </SafeAreaView>
         );
  }

         if (!isInitialized || loading || !hasData) {
           return (
             <SafeAreaView style={styles.container}>
               <View style={styles.loadingContainer}>
                 <Text style={styles.loadingText}>Finding perfect matches for you...</Text>
               </View>
             </SafeAreaView>
           );
         }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI-Powered Matches</Text>
          <Text style={styles.headerSubtitle}>
            Personalized recommendations just for you
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Matches</Text>
          <FlatList
            data={aiOffers}
            renderItem={renderAIOffer}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            snapToInterval={ITEM_WIDTH + 20}
            decelerationRate="fast"
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            windowSize={10}
            initialNumToRender={3}
            getItemLayout={(data, index) => ({
              length: ITEM_WIDTH + 20,
              offset: (ITEM_WIDTH + 20) * index,
              index,
            })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How it works</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Our AI analyzes your preferences, location, and item history to find the perfect swap matches. 
              Each recommendation includes a match score and reason why it's perfect for you.
            </Text>
          </View>
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
    color: '#666',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  horizontalList: {
    paddingHorizontal: 20,
  },
  offerCard: {
    width: ITEM_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  matchBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  matchScore: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  offerContent: {
    padding: 15,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  offerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  condition: {
    fontSize: 12,
    color: '#888',
    textTransform: 'capitalize',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  matchReason: {
    backgroundColor: '#f0f8ff',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  reasonText: {
    fontSize: 12,
    color: '#007AFF',
    fontStyle: 'italic',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  username: {
    fontSize: 12,
    color: '#666',
  },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default ExploreScreen;
