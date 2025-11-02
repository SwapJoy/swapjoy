import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { RecommendationWeights, DEFAULT_RECOMMENDATION_WEIGHTS, clampWeight } from '../types/recommendation';

const DevRecommendationSettingsScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [weights, setWeights] = useState<RecommendationWeights>(DEFAULT_RECOMMENDATION_WEIGHTS);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadWeights();
  }, [user?.id]);

  const loadWeights = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const weightsData = await ApiService.getRecommendationWeights(user.id);
      setWeights(weightsData);
      setHasChanges(false);
    } catch (error) {
      console.error('Error loading recommendation weights:', error);
      Alert.alert('Error', 'Failed to load recommendation weights');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const handleSave = useCallback(async () => {
    if (!user?.id || !hasChanges) return;

    try {
      setSaving(true);
      console.log('[DevRecommendationSettings] Saving weights:', weights);
      const result = await ApiService.updateRecommendationWeights(user.id, weights);
      console.log('[DevRecommendationSettings] Save result:', result);
      
      if (result.error) {
        console.error('[DevRecommendationSettings] Error saving recommendation weights:', result.error);
        const errorMessage = result.error?.message || JSON.stringify(result.error) || 'Unknown error';
        Alert.alert('Error', `Failed to save recommendation weights: ${errorMessage}`);
        setSaving(false);
        return;
      }

      setHasChanges(false);
      setSaving(false);
      Alert.alert('Success', 'Recommendation weights saved! Top Picks will refresh automatically.');
    } catch (error: any) {
      console.error('[DevRecommendationSettings] Exception saving recommendation weights:', error);
      const errorMessage = error?.message || JSON.stringify(error) || 'Unknown error';
      Alert.alert('Error', `Failed to save recommendation weights: ${errorMessage}`);
      setSaving(false);
    }
  }, [user?.id, weights, hasChanges]);

  const updateWeight = useCallback((key: keyof RecommendationWeights, value: number) => {
    setWeights(prev => ({
      ...prev,
      [key]: Math.max(0, Math.min(1, value))
    }));
    setHasChanges(true);
  }, []);

  const resetToDefaults = useCallback(() => {
    Alert.alert(
      'Reset to Defaults',
      'Are you sure you want to reset all weights to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setWeights(DEFAULT_RECOMMENDATION_WEIGHTS);
            setHasChanges(true);
          }
        }
      ]
    );
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  // Draggable slider component with PanResponder
  const SliderControl = ({ 
    label, 
    value, 
    onValueChange, 
    description 
  }: { 
    label: string; 
    value: number; 
    onValueChange: (value: number) => void;
    description: string;
  }) => {
    const [localValue, setLocalValue] = useState(value);
    const trackRef = useRef<View>(null);
    const sliderWidth = 280;
    const thumbSize = 28;
    const [trackX, setTrackX] = useState(0);
    
    useEffect(() => {
      setLocalValue(value);
    }, [value]);
    
    useEffect(() => {
      // Measure track position on mount and when needed
      if (trackRef.current) {
        trackRef.current.measureInWindow((x, y, width, height) => {
          setTrackX(x);
        });
      }
    }, []);
    
    const updateValueFromPosition = useCallback((pageX: number) => {
      // Calculate relative position within the slider track
      const relativeX = pageX - trackX;
      const clampedX = Math.max(0, Math.min(sliderWidth, relativeX));
      const newValue = clampWeight(clampedX / sliderWidth);
      setLocalValue(newValue);
      onValueChange(newValue);
    }, [trackX, onValueChange]);
    
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          // Update track position and handle initial touch
          if (trackRef.current) {
            trackRef.current.measureInWindow((x, y, width, height) => {
              setTrackX(x);
              updateValueFromPosition(evt.nativeEvent.pageX);
            });
          } else {
            updateValueFromPosition(evt.nativeEvent.pageX);
          }
        },
        onPanResponderMove: (evt) => {
          // Handle drag
          updateValueFromPosition(evt.nativeEvent.pageX);
        },
        onPanResponderRelease: () => {
          // Touch released
        },
      })
    ).current;
    
    const handleTrackPress = (event: any) => {
      const touchX = event.nativeEvent.pageX;
      updateValueFromPosition(touchX);
    };
    
    const thumbPosition = localValue * (sliderWidth - thumbSize);
    const fillWidth = localValue * sliderWidth;
    
    return (
      <View style={styles.sliderContainer}>
        <View style={styles.sliderHeader}>
          <Text style={styles.sliderLabel}>{label}</Text>
          <View style={styles.valueContainer}>
            <TextInput
              style={styles.valueInput}
              value={Math.round(localValue * 100).toString()}
              onChangeText={(text) => {
                const num = parseInt(text) || 0;
                const clamped = clampWeight(num / 100);
                setLocalValue(clamped);
                onValueChange(clamped);
              }}
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={styles.percentSign}>%</Text>
          </View>
        </View>
        <Text style={styles.sliderDescription}>{description}</Text>
        <View style={styles.sliderWrapper}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleTrackPress}
            style={styles.sliderTrackContainer}
          >
            <View 
              ref={trackRef}
              style={styles.sliderTrack}
              collapsable={false}
              onLayout={() => {
                // Re-measure track position when layout changes
                if (trackRef.current) {
                  trackRef.current.measureInWindow((x, y, width, height) => {
                    setTrackX(x);
                  });
                }
              }}
            >
              <View style={[styles.sliderTrackFill, { width: fillWidth }]} />
              <View 
                style={[
                  styles.sliderThumb,
                  { 
                    left: thumbPosition,
                  }
                ]}
                {...panResponder.panHandlers}
                collapsable={false}
              />
            </View>
          </TouchableOpacity>
          <View style={styles.quickButtons}>
            <TouchableOpacity 
              style={styles.quickButton}
              onPress={() => {
                const newValue = clampWeight(0);
                setLocalValue(newValue);
                onValueChange(newValue);
              }}
            >
              <Text style={styles.quickButtonText}>0%</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickButton}
              onPress={() => {
                const newValue = clampWeight(0.5);
                setLocalValue(newValue);
                onValueChange(newValue);
              }}
            >
              <Text style={styles.quickButtonText}>50%</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickButton}
              onPress={() => {
                const newValue = clampWeight(1.0);
                setLocalValue(newValue);
                onValueChange(newValue);
              }}
            >
              <Text style={styles.quickButtonText}>100%</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabelText}>0% (ignored)</Text>
          <Text style={styles.sliderLabelText}>100% (critical)</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>🔧 DEV: Recommendation Weights</Text>
          <Text style={styles.subtitle}>
            Adjust how strongly different factors influence your Top Picks
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scoring Weights</Text>
          <Text style={styles.sectionDescription}>
            Each weight controls how much that factor affects recommendations. 
            0% = factor ignored, 100% = factor is critical.
          </Text>

          <SliderControl
            label="Category Score"
            value={weights.category_score}
            onValueChange={(value) => updateWeight('category_score', value)}
            description="How much favorite categories matter. 100% = only show items from favorite categories."
          />

          <SliderControl
            label="Price Score"
            value={weights.price_score}
            onValueChange={(value) => updateWeight('price_score', value)}
            description="How much price similarity matters. Higher = prioritize items with similar prices."
          />

          <SliderControl
            label="Location (Latitude)"
            value={weights.location_lat}
            onValueChange={(value) => updateWeight('location_lat', value)}
            description="How much location matters (latitude). Higher = prioritize nearby items."
          />

          <SliderControl
            label="Location (Longitude)"
            value={weights.location_lng}
            onValueChange={(value) => updateWeight('location_lng', value)}
            description="How much location matters (longitude). Higher = prioritize nearby items."
          />

          <SliderControl
            label="Similarity Weight (Base)"
            value={weights.similarity_weight}
            onValueChange={(value) => updateWeight('similarity_weight', value)}
            description="Base weight for semantic similarity (embeddings). Usually keep at 100%."
          />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>💡 How It Works</Text>
          <Text style={styles.infoText}>
            • Setting a weight to 100% makes that factor critical (e.g., category_score = 1.0 means only show favorite categories)
          </Text>
          <Text style={styles.infoText}>
            • Setting to 50% means that factor is moderately important
          </Text>
          <Text style={styles.infoText}>
            • Setting to 0% means that factor is ignored completely
          </Text>
          <Text style={styles.infoText}>
            • Final score combines all weighted factors automatically
          </Text>
        </View>

        <View style={styles.actions}>
          <View style={styles.buttonRow}>
            <View style={styles.buttonContainer}>
              <Text
                style={[styles.resetButton, !hasChanges && styles.disabledButton]}
                onPress={resetToDefaults}
              >
                Reset to Defaults
              </Text>
            </View>
            <View style={styles.buttonContainer}>
              <Text
                style={[styles.saveButton, (!hasChanges || saving) && styles.disabledButton]}
                onPress={handleSave}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 20,
    lineHeight: 18,
  },
  sliderContainer: {
    marginBottom: 24,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  sliderDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    lineHeight: 16,
  },
  sliderWrapper: {
    marginVertical: 8,
  },
  sliderTrackContainer: {
    marginVertical: 12,
  },
  sliderTrack: {
    width: 280,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    position: 'relative',
  },
  sliderTrackFill: {
    height: 4,
    backgroundColor: '#007AFF',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  sliderThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    position: 'absolute',
    top: -12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  quickButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  quickButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#F2F2F7',
    borderRadius: 6,
  },
  quickButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueInput: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    minWidth: 40,
    textAlign: 'right',
    paddingHorizontal: 4,
  },
  percentSign: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderLabelText: {
    fontSize: 11,
    color: '#999',
  },
  infoSection: {
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 8,
    lineHeight: 18,
  },
  actions: {
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonContainer: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    overflow: 'hidden',
  },
  resetButton: {
    backgroundColor: '#F2F2F7',
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default DevRecommendationSettingsScreen;

