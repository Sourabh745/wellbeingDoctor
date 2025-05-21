import {BottomSheetModal} from '@gorhom/bottom-sheet';
import React, {useCallback, useRef, useState} from 'react';
import {StatusBar} from 'react-native';
import {ICarouselInstance} from 'react-native-reanimated-carousel';
import {
  AuthModal,
  OnboardingCarousel,
  OnboardingProgress,
  Screen,
} from '../../components';
import {colors} from '../../theme';
import {IScroll, SCROLL_DEFAULT} from '../../utils';

export const Onboarding = () => {
  const [progress, setProgress] = useState<IScroll>(SCROLL_DEFAULT);
  let carouselRef = useRef<ICarouselInstance>();

  const carouselIndex = (index: IScroll) => {
    setProgress(index);
  };
  const carousel = (
    ref: React.MutableRefObject<ICarouselInstance | undefined>,
  ) => {
    carouselRef = ref;
  };

  const getStartedModalRef = useRef<BottomSheetModal>(null);

  const openGetStartedModal = useCallback(() => {
    if (progress.index === 2) {
      getStartedModalRef.current?.present();
    } else {
      carouselRef.current?.next();
    }
  }, [progress.index]);

  return (
    <Screen
      buttonShadow={false}
      buttonLabel={progress.index === 2 ? 'Get Started' : 'Continue'}
      buttonOnPress={openGetStartedModal}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <OnboardingProgress progress={progress} />
      <OnboardingCarousel
        carouselRef={carousel}
        carouselIndex={carouselIndex}
      />
      <AuthModal bottomSheetModalRef={getStartedModalRef} />
    </Screen>
  );
};
