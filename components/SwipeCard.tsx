import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Platform } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue,
  withSpring,
  interpolate,
  runOnJS
} from 'react-native-reanimated';
import { Bookmark, ShoppingCart, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Models } from "react-native-appwrite";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface SwipeCardProps {
  item: Models.Document;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
  style?: any;
}

export default function SwipeCard({ 
  item, 
  onSwipeLeft, 
  onSwipeRight, 
  onSwipeUp,
  style
}: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onChange((event) => {
      translateX.value += event.changeX;
      translateY.value += event.changeY;
    })
    .onEnd(() => {
      if (translateY.value < -SWIPE_THRESHOLD) {
        translateY.value = withSpring(-SCREEN_HEIGHT, { damping: 100 });
        runOnJS(onSwipeUp)();
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5, { damping: 100 });
        translateY.value = withSpring(0);
        runOnJS(onSwipeLeft)();
      } else if (translateX.value > SWIPE_THRESHOLD) {
        translateX.value = withSpring(SCREEN_WIDTH * 1.5, { damping: 100 });
        translateY.value = withSpring(0);
        runOnJS(onSwipeRight)();
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      {
        rotate: `${(translateX.value / SCREEN_WIDTH) * 25}deg`,
      },
    ],
  }));

  const leftIndicatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD * 0.5, 0],
      [1, 0],
      'clamp'
    ),
    transform: [
      {
        scale: interpolate(
          translateX.value,
          [-SWIPE_THRESHOLD * 0.5, 0],
          [1, 0.3],
          'clamp'
        ),
      },
    ],
  }));

  const rightIndicatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD * 0.5],
      [0, 1],
      'clamp'
    ),
    transform: [
      {
        scale: interpolate(
          translateX.value,
          [0, SWIPE_THRESHOLD * 0.5],
          [0.3, 1],
          'clamp'
        ),
      },
    ],
  }));

  const topIndicatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [-SWIPE_THRESHOLD * 0.5, 0],
      [1, 0],
      'clamp'
    ),
    transform: [
      {
        scale: interpolate(
          translateY.value,
          [-SWIPE_THRESHOLD * 0.5, 0],
          [1, 0.3],
          'clamp'
        ),
      },
    ],
  }));

  const overlayStyle = useAnimatedStyle(() => {
    const xProgress = Math.abs(translateX.value) / SWIPE_THRESHOLD;
    const yProgress = Math.abs(translateY.value) / SWIPE_THRESHOLD;
    
    let gradientColors = ['transparent', 'transparent'];
    
    if (translateX.value < 0) {
      // Dislike - Red gradient
      gradientColors = [
        `rgba(239, 68, 68, ${xProgress * 0.5})`,
        `rgba(239, 68, 68, ${xProgress * 0.7})`
      ];
    } else if (translateX.value > 0) {
      // Like - Green gradient
      gradientColors = [
        `rgba(34, 197, 94, ${xProgress * 0.5})`,
        `rgba(34, 197, 94, ${xProgress * 0.7})`
      ];
    } else if (translateY.value < 0) {
      // Add to cart - Blue gradient
      gradientColors = [
        `rgba(59, 130, 246, ${yProgress * 0.5})`,
        `rgba(59, 130, 246, ${yProgress * 0.7})`
      ];
    }

    return {
      backgroundColor: gradientColors[1],
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, cardStyle, style]}>
        <View style={styles.cardInner}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.image}
            resizeMode="cover"
          />
          
          <Animated.View style={[styles.colorOverlay, overlayStyle]} />
          
          <View style={styles.overlay}>
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.gradient}
            >
              <View style={styles.productInfo}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.brand} numberOfLines={1}>{item.brand}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>HUF {item.price}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.actionIndicators}>
            <Animated.View style={[styles.indicator, styles.leftIndicator, leftIndicatorStyle]}>
              <View style={[styles.iconCircle, styles.dislikeCircle]}>
                <X size={80} color="#fff" strokeWidth={4} />
              </View>
            </Animated.View>
            
            <Animated.View style={[styles.indicator, styles.rightIndicator, rightIndicatorStyle]}>
              <View style={[styles.iconCircle, styles.likeCircle]}>
                <Bookmark size={80} color="#fff" strokeWidth={4} />
              </View>
            </Animated.View>
            
            <Animated.View style={[styles.indicator, styles.topIndicator, topIndicatorStyle]}>
              <View style={[styles.iconCircle, styles.cartCircle]}>
                <ShoppingCart size={80} color="#fff" strokeWidth={4} />
              </View>
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    width: Platform.select({
      web: Math.min(SCREEN_WIDTH - 32, 640),
      default: SCREEN_WIDTH - 20
    }),
    height: Platform.select({
      web: Math.min(SCREEN_HEIGHT - 280, 560),
      default: SCREEN_HEIGHT - 268  // Adjusted this value to account for tabs and filters
    }),
    position: 'absolute',
    backgroundColor: 'transparent',
    alignSelf: 'center',
  },
  cardInner: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  colorOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  gradient: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  brand: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  price: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionIndicators: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    position: 'absolute',
    alignItems: 'center',
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
  },
  leftIndicator: {
    left: 20,
  },
  rightIndicator: {
    right: 20,
  },
  topIndicator: {
    top: '30%',
  },
  dislikeCircle: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  likeCircle: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  cartCircle: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
});