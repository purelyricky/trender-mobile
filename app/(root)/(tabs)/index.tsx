import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  View,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Models } from "react-native-appwrite";

import icons from "@/constants/icons";
import images from "@/constants/images";

import Filters from "@/components/Filters";
import NoResults from "@/components/NoResults";
import SwipeCard from "@/components/SwipeCard";
import { GestureWrapper } from "@/components/GestureWrapper";

import { useAppwrite } from "@/lib/useAppwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { getProperties } from "@/lib/appwrite";
import { createUserInteraction, addToSavedItems, addToCart } from "@/lib/appwrite";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BATCH_SIZE = 15;
const BATCH_THRESHOLD = 5;

const Home = () => {
  const { user } = useGlobalContext();
  const params = useLocalSearchParams<{ query?: string; filter?: string }>();
  
  const [currentBatch, setCurrentBatch] = useState<Models.Document[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadProperties = async () => {
    try {
      // Get current item IDs to exclude from next batch
      const currentIds = currentBatch.map(item => item.$id);
      
      const newItems = await getProperties({
        filter: params.filter ?? "All",
        query: params.query ?? "",
        limit: BATCH_SIZE * 2, // Request more items to ensure we have enough after filtering
        userId: user?.$id,
        excludeIds: currentIds,
      });
      
      // Ensure items are unique using Set
      const existingIds = new Set(currentBatch.map(item => item.$id));
      const uniqueNewItems = newItems.filter(item => !existingIds.has(item.$id));
      
      console.log(`Loaded ${uniqueNewItems.length} new unique items`);
      
      // Update batch with unique items only
      setCurrentBatch(prev => {
        const combined = [...prev, ...uniqueNewItems];
        const uniqueItems = Array.from(
          new Map(combined.map(item => [item.$id, item])).values()
        );
        return uniqueItems;
      });
      
      setInitialLoading(false);
      setIsLoadingMore(false);
    } catch (error) {
      console.error('Failed to load properties:', error);
      setInitialLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Initial load and filter/query changes
  useEffect(() => {
    setInitialLoading(true);
    setCurrentBatch([]);
    loadProperties();
  }, [params.filter, params.query]);

  // Load more items when batch gets low
  useEffect(() => {
    if (!isLoadingMore && currentBatch.length <= BATCH_THRESHOLD) {
      setIsLoadingMore(true);
      loadProperties();
    }
  }, [currentBatch.length]);

  const removeItemFromBatch = (itemId: string) => {
    setCurrentBatch(prev => prev.filter(item => item.$id !== itemId));
    console.log(`Removed item ${itemId} from batch. Remaining items: ${currentBatch.length - 1}`);
  };

  const handleInteraction = async (
    itemId: string, 
    interactionType: "like" | "dislike" | "cart",
    additionalAction?: () => Promise<void>
  ) => {
    if (!user) return;
    console.log(`Processing ${interactionType} for item ${itemId}`);
    
    try {
      // Remove item immediately for smooth UX
      removeItemFromBatch(itemId);

      // Process interaction in background
      await Promise.all([
        createUserInteraction({
          userId: user.$id,
          clothingId: itemId,
          interactionType
        }),
        additionalAction && additionalAction()
      ]);

      console.log(`Successfully processed ${interactionType} for item ${itemId}`);
    } catch (error) {
      console.error(`Failed to process ${interactionType}:`, error);
    }
  };

  const handleSwipeLeft = (itemId: string) => {
    handleInteraction(itemId, "dislike");
  };

  const handleSwipeRight = (itemId: string) => {
    handleInteraction(itemId, "like", async () => {
      await addToSavedItems({
        userId: user!.$id,
        clothingId: itemId,
      });
    });
  };

  const handleSwipeUp = (itemId: string) => {
    handleInteraction(itemId, "cart", async () => {
      await addToCart({
        userId: user!.$id,
        clothingId: itemId,
      });
    });
  };

  const renderContent = () => {
    if (initialLoading) {
      return <ActivityIndicator size="large" className="text-primary-300 mt-5" />;
    }

    if (!currentBatch || currentBatch.length === 0) {
      return <NoResults />;
    }

    return (
      <View className="flex-1 items-center justify-start px-5 mt-5">
        {currentBatch.map((item, index) => (
          <SwipeCard 
            key={item.$id}
            item={item} 
            onSwipeLeft={() => handleSwipeLeft(item.$id)}
            onSwipeRight={() => handleSwipeRight(item.$id)}
            onSwipeUp={() => handleSwipeUp(item.$id)}
            style={index > 0 ? { zIndex: currentBatch.length - index } : {}}
          />
        )).reverse()}
      </View>
    );
  };

  return (
    <GestureWrapper>
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
                  Welcome Back, Continue Swiping 👋!જ⁀➴
                </Text>
                <Text className="text-base font-rubik-medium text-black-300">
                  {user?.name}
                </Text>
              </View>
            </View>
            <Image source={icons.bell} className="size-6" />
          </View>

          <View className="mt-1">
            <Filters />
          </View>
        </View>

        {renderContent()}
      </SafeAreaView>
    </GestureWrapper>
  );
};

export default Home;