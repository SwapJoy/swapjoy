import AsyncStorage from '@react-native-async-storage/async-storage';

const INTRO_COMPLETED_KEY = 'intro_completed';

/**
 * Check if the user has completed the intro screens
 */
export const hasCompletedIntro = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(INTRO_COMPLETED_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking intro completion:', error);
    return false;
  }
};

/**
 * Mark intro as completed
 */
export const markIntroCompleted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(INTRO_COMPLETED_KEY, 'true');
  } catch (error) {
    console.error('Error marking intro as completed:', error);
  }
};

/**
 * Reset intro completion (useful for testing or if user wants to see intro again)
 */
export const resetIntroCompletion = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(INTRO_COMPLETED_KEY);
  } catch (error) {
    console.error('Error resetting intro completion:', error);
  }
};



