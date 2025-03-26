import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';

import icons from "@/constants/icons";

import Search from "@/components/Search";
import Filters from "@/components/Filters";
import NoResults from "@/components/NoResults";
import { SwipeCard } from "@/components/SwipeCard";

import { useAppwrite } from "@/lib/useAppwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { getLatestProperties, getProperties } from "@/lib/appwrite";

const Home = () => {
  const { user } = useGlobalContext();
  const params = useLocalSearchParams<{ query?: string; filter?: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedItems, setLikedItems] = useState<string[]>([]);
  const [dislikedItems, setDislikedItems] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<string[]>([]);

  const { data: latestProperties, loading: latestPropertiesLoading } =
    useAppwrite({
      fn: getLatestProperties,
    });

  const {
    data: properties,
    refetch,
    loading,
  } = useAppwrite({
    fn: getProperties,
    params: {
      filter: params.filter!,
      query: params.query!,
      limit: 20,
    },
    skip: true,
  });

  useEffect(() => {
    refetch({
      filter: params.filter!,
      query: params.query!,
      limit: 20,
    });
  }, [params.filter, params.query]);

  const handleCardPress = (id: string) => {
    router.push(`/products/${id}`);
  };

  const handleSwipeLeft = () => {
    if (properties && properties[currentIndex]) {
      setDislikedItems(prev => [...prev, properties[currentIndex].$id]);
      setCurrentIndex(prev => Math.min(prev + 1, properties.length - 1));
    }
  };

  const handleSwipeRight = () => {
    if (properties && properties[currentIndex]) {
      setLikedItems(prev => [...prev, properties[currentIndex].$id]);
      setCurrentIndex(prev => Math.min(prev + 1, properties.length - 1));
    }
  };

  const handleSwipeUp = () => {
    if (properties && properties[currentIndex]) {
      setCartItems(prev => [...prev, properties[currentIndex].$id]);
      setCurrentIndex(prev => Math.min(prev + 1, properties.length - 1));
    }
  };

  return (
    <SafeAreaView className="h-full bg-white">
      <View className="px-5">
        <View className="flex flex-row items-center justify-between mt-5">
          <View className="flex flex-row">
            <Image
              source={{ uri: user?.avatar }}
              className="size-12 rounded-full"
            />

            <View className="flex flex-col items-start ml-2 justify-center">
              <Text className="text-xs font-rubik text-black-100">
                Welcome back 👋
              </Text>
              <Text className="text-base font-rubik-medium text-black-300">
                {user?.name}
              </Text>
            </View>
          </View>
          <Image source={icons.bell} className="size-6" />
        </View>

        <Search />        
        <View className="mt-0.1">
          <Filters />
        </View>

        <View className="mt-3 h-[70%]">
          {loading ? (
            <ActivityIndicator size="large" className="text-primary-300 mt-5" />
          ) : !properties || properties.length === 0 ? (
            <NoResults />
          ) : (
            currentIndex < properties.length && (
              <SwipeCard
                item={properties[currentIndex]}
                onPress={() => handleCardPress(properties[currentIndex].$id)}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onSwipeUp={handleSwipeUp}
              />
            )
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Home;