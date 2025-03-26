import React from 'react';
import { Image, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue,
  withSpring,
  interpolate,
  runOnJS
} from 'react-native-reanimated';
import { Heart, ShoppingCart, X } from 'lucide-react-native';

import icons from "@/constants/icons";
import images from "@/constants/images";
import { Models } from "react-native-appwrite";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface SwipeCardProps {
  item: Models.Document;
  onPress: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
}

export const SwipeCard = ({ 
  item, 
  onPress, 
  onSwipeLeft, 
  onSwipeRight, 
  onSwipeUp 
}: SwipeCardProps) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onChange((event) => {
      translateX.value += event.changeX;
      translateY.value += event.changeY;
    })
    .onEnd(() => {
      if (translateY.value < -SWIPE_THRESHOLD) {
        translateY.value = withSpring(-SCREEN_HEIGHT);
        runOnJS(onSwipeUp)();
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-SCREEN_WIDTH);
        runOnJS(onSwipeLeft)();
      } else if (translateX.value > SWIPE_THRESHOLD) {
        translateX.value = withSpring(SCREEN_WIDTH);
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

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View 
        className="flex-1 w-full h-[80%] relative"
        style={cardStyle}
      >
        <TouchableOpacity 
          onPress={onPress}
          className="flex flex-col items-start w-full h-full relative"
        >
          <Image 
            source={{ uri: item.image }} 
            className="size-full rounded-2xl" 
          />

          <Image
            source={images.cardGradient}
            className="size-full rounded-2xl absolute bottom-0"
          />

          <View className="flex flex-row items-center absolute top-5 right-5 bg-white/90 px-3 py-1.5 rounded-full">
            <X size={20} color="#FF4B4B" />
            <Text className="text-xs font-rubik-bold text-primary-300 ml-1">
              Dislike
            </Text>
          </View>

          <View className="flex flex-col items-start absolute bottom-5 inset-x-5">
            <Text
              className="text-xl font-rubik-extrabold text-white"
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text className="text-base font-rubik text-white" numberOfLines={1}>
              {item.brand}
            </Text>

            <View className="flex flex-row items-center justify-between w-full">
              <Text className="text-xl font-rubik-extrabold text-white">
                ${item.price}
              </Text>
              <Image source={icons.heart} className="size-5" />
            </View>
          </View>
        </TouchableOpacity>

        <View className="absolute inset-0 pointer-events-none">
          <Animated.View 
            className="absolute left-5 top-1/2" 
            style={leftIndicatorStyle}
          >
            <View className="w-20 h-20 rounded-full bg-red-500 items-center justify-center">
              <X size={50} color="#fff" />
            </View>
          </Animated.View>

          <Animated.View 
            className="absolute right-5 top-1/2" 
            style={rightIndicatorStyle}
          >
            <View className="w-20 h-20 rounded-full bg-green-500 items-center justify-center">
              <Heart size={50} color="#fff" />
            </View>
          </Animated.View>

          <Animated.View 
            className="absolute top-1/3 self-center" 
            style={topIndicatorStyle}
          >
            <View className="w-20 h-20 rounded-full bg-blue-500 items-center justify-center">
              <ShoppingCart size={50} color="#fff" />
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};