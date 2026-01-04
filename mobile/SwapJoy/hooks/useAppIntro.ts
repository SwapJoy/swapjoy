import { useMemo, useState } from 'react';
import { OnboardingSlide } from '../types/auth';
import { useLocalization } from '../localization';
import { ImageSourcePropType } from 'react-native';

export const useAppIntro = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const { t } = useLocalization();

  const slides: OnboardingSlide[] = useMemo(
    () => [
      {
        key: 'slide1',
        title: t('onboarding.slides.slide1.title'),
        text: t('onboarding.slides.slide1.description'),
        image: require('../assets/intro/1.png') as ImageSourcePropType,
      },
      {
        key: 'slide2',
        title: t('onboarding.slides.slide2.title'),
        text: t('onboarding.slides.slide2.description'),
        image: require('../assets/intro/2.png') as ImageSourcePropType,
      },
      {
        key: 'slide3',
        title: t('onboarding.slides.slide3.title'),
        text: t('onboarding.slides.slide3.description'),
        image: require('../assets/intro/3.png') as ImageSourcePropType,
      },
    ],
    [t]
  );

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

