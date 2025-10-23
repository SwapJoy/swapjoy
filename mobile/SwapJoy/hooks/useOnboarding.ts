import { useState } from 'react';
import { OnboardingSlide } from '../types/auth';

export const useOnboarding = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides: OnboardingSlide[] = [
    {
      key: 'slide1',
      title: 'Welcome to SwapJoy!',
      text: 'Discover a new way to exchange items you no longer need for things you truly desire.',
      image: '🔄',
    },
    {
      key: 'slide2',
      title: 'Find Your Perfect Match',
      text: 'Our AI-powered matching helps you find items and bundles that perfectly fit your preferences.',
      image: '🎯',
    },
    {
      key: 'slide3',
      title: 'Simple & Secure Swaps',
      text: 'Connect with other users, make offers, and swap items with confidence.',
      image: '🔒',
    },
  ];

  const handleSlideChange = (index: number) => {
    setActiveSlide(index);
  };

  const handleGetStarted = () => {
    // Navigation will be handled by the component
  };

  return {
    slides,
    activeSlide,
    handleSlideChange,
    handleGetStarted,
  };
};
