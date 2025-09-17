import { Animated, LayoutAnimation, Platform, UIManager } from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Animation utilities for smooth transitions throughout the app
 */

// Predefined animation configurations
export const AnimationConfigs = {
  // Fade animations
  fadeIn: {
    duration: 300,
    useNativeDriver: true,
  },
  fadeOut: {
    duration: 200,
    useNativeDriver: true,
  },
  
  // Slide animations
  slideUp: {
    duration: 300,
    useNativeDriver: true,
  },
  slideDown: {
    duration: 300,
    useNativeDriver: true,
  },
  
  // Scale animations
  scaleIn: {
    duration: 250,
    useNativeDriver: true,
  },
  scaleOut: {
    duration: 200,
    useNativeDriver: true,
  },
  
  // Spring animations for bouncy effects
  spring: {
    tension: 100,
    friction: 8,
    useNativeDriver: true,
  },
  
  // Layout animations
  layout: {
    duration: 300,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
    },
    delete: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
  },
  
  // Quick layout animation for list items
  quickLayout: {
    duration: 200,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.scaleXY,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
    },
  },
};

/**
 * Create a fade in animation
 */
export const fadeIn = (animatedValue: Animated.Value, config = AnimationConfigs.fadeIn) => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    ...config,
  });
};

/**
 * Create a fade out animation
 */
export const fadeOut = (animatedValue: Animated.Value, config = AnimationConfigs.fadeOut) => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    ...config,
  });
};

/**
 * Create a slide up animation
 */
export const slideUp = (animatedValue: Animated.Value, config = AnimationConfigs.slideUp) => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    ...config,
  });
};

/**
 * Create a slide down animation
 */
export const slideDown = (animatedValue: Animated.Value, config = AnimationConfigs.slideDown) => {
  return Animated.timing(animatedValue, {
    toValue: 50,
    ...config,
  });
};

/**
 * Create a scale in animation
 */
export const scaleIn = (animatedValue: Animated.Value, config = AnimationConfigs.scaleIn) => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    ...config,
  });
};

/**
 * Create a scale out animation
 */
export const scaleOut = (animatedValue: Animated.Value, config = AnimationConfigs.scaleOut) => {
  return Animated.timing(animatedValue, {
    toValue: 0.95,
    ...config,
  });
};

/**
 * Create a spring animation
 */
export const spring = (animatedValue: Animated.Value, toValue: number, config = AnimationConfigs.spring) => {
  return Animated.spring(animatedValue, {
    toValue,
    ...config,
  });
};

/**
 * Create a combined entrance animation (fade + slide + scale)
 */
export const entranceAnimation = (
  fadeValue: Animated.Value,
  slideValue: Animated.Value,
  scaleValue: Animated.Value
) => {
  return Animated.parallel([
    fadeIn(fadeValue),
    slideUp(slideValue),
    scaleIn(scaleValue),
  ]);
};

/**
 * Create a combined exit animation (fade + slide + scale)
 */
export const exitAnimation = (
  fadeValue: Animated.Value,
  slideValue: Animated.Value,
  scaleValue: Animated.Value
) => {
  return Animated.parallel([
    fadeOut(fadeValue),
    slideDown(slideValue),
    scaleOut(scaleValue),
  ]);
};

/**
 * Configure layout animation for smooth list updates
 */
export const configureLayoutAnimation = (config = AnimationConfigs.layout) => {
  LayoutAnimation.configureNext(config);
};

/**
 * Configure quick layout animation for fast updates
 */
export const configureQuickLayoutAnimation = (config = AnimationConfigs.quickLayout) => {
  LayoutAnimation.configureNext(config);
};

/**
 * Create a staggered animation for multiple items
 */
export const createStaggeredAnimation = (
  animatedValues: Animated.Value[],
  delay: number = 100,
  animationFn: (value: Animated.Value) => Animated.CompositeAnimation
) => {
  const animations = animatedValues.map((value, index) => {
    return Animated.sequence([
      Animated.delay(index * delay),
      animationFn(value),
    ]);
  });
  
  return Animated.parallel(animations);
};

/**
 * Create a pulse animation for attention-grabbing elements
 */
export const createPulseAnimation = (animatedValue: Animated.Value) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ])
  );
};

/**
 * Create a shake animation for error states
 */
export const createShakeAnimation = (animatedValue: Animated.Value) => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 10,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: -10,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 10,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }),
  ]);
};

/**
 * Create a bounce animation for successful actions
 */
export const createBounceAnimation = (animatedValue: Animated.Value) => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 1.2,
      duration: 200,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }),
  ]);
};

/**
 * Utility to create animated style objects
 */
export const createAnimatedStyle = (
  animatedValue: Animated.Value,
  styleType: 'opacity' | 'translateY' | 'translateX' | 'scale' | 'rotate'
) => {
  switch (styleType) {
    case 'opacity':
      return { opacity: animatedValue };
    case 'translateY':
      return { transform: [{ translateY: animatedValue }] };
    case 'translateX':
      return { transform: [{ translateX: animatedValue }] };
    case 'scale':
      return { transform: [{ scale: animatedValue }] };
    case 'rotate':
      return { transform: [{ rotate: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      }) }] };
    default:
      return {};
  }
};

/**
 * Hook for managing common animations
 */
export const useCommonAnimations = () => {
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const scaleAnim = new Animated.Value(0.95);
  const pulseAnim = new Animated.Value(1);
  const shakeAnim = new Animated.Value(0);

  const animateIn = () => {
    return entranceAnimation(fadeAnim, slideAnim, scaleAnim);
  };

  const animateOut = () => {
    return exitAnimation(fadeAnim, slideAnim, scaleAnim);
  };

  const startPulse = () => {
    return createPulseAnimation(pulseAnim);
  };

  const startShake = () => {
    return createShakeAnimation(shakeAnim);
  };

  const resetAnimations = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.95);
    pulseAnim.setValue(1);
    shakeAnim.setValue(0);
  };

  return {
    fadeAnim,
    slideAnim,
    scaleAnim,
    pulseAnim,
    shakeAnim,
    animateIn,
    animateOut,
    startPulse,
    startShake,
    resetAnimations,
  };
};

export default {
  AnimationConfigs,
  fadeIn,
  fadeOut,
  slideUp,
  slideDown,
  scaleIn,
  scaleOut,
  spring,
  entranceAnimation,
  exitAnimation,
  configureLayoutAnimation,
  configureQuickLayoutAnimation,
  createStaggeredAnimation,
  createPulseAnimation,
  createShakeAnimation,
  createBounceAnimation,
  createAnimatedStyle,
  useCommonAnimations,
};
