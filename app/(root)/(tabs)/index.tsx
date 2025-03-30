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

const Home = () => {
  const { user } = useGlobalContext();
  const params = useLocalSearchParams<{ query?: string; filter?: string }>();

  const {
    data: properties,
    refetch,
    loading,
  } = useAppwrite({
    fn: getProperties,
    params: {
      filter: params.filter ?? "All",
      query: params.query ?? "",
      limit: 15,
    },
    skip: true,
  });

  useEffect(() => {
    refetch({
      filter: params.filter ?? "All",
      query: params.query ?? "",
      limit: 15,
    });
  }, [params.filter, params.query]);

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" className="text-primary-300 mt-5" />;
    }

    if (!properties || properties.length === 0) {
      return <NoResults />;
    }

    return (
      <View className="flex-1 items-center justify-start px-5 mt-5">
        {properties.map((item, index) => (
          <SwipeCard 
            key={item.$id}
            item={item} 
            onSwipeLeft={() => handleSwipeLeft(item.$id)}
            onSwipeRight={() => handleSwipeRight(item.$id)}
            onSwipeUp={() => handleSwipeUp(item.$id)}
            style={index > 0 ? { zIndex: properties.length - index } : {}}
          />
        )).reverse()}
      </View>
    );
  };

  const handleSwipeLeft = async (itemId: string) => {
    if (!user) return;
    console.log(`Processing dislike for item ${itemId}`);
    
    try {
      await createUserInteraction({
        userId: user.$id,
        clothingId: itemId,
        interactionType: "dislike"
      });
      console.log(`Item ${itemId} marked as disliked`);
      
      // Refetch to update the feed
      refetch({
        filter: params.filter ?? "All",
        query: params.query ?? "",
        limit: 15,
      });
    } catch (error) {
      console.error('Failed to process dislike:', error);
    }
  };

  const handleSwipeRight = async (itemId: string) => {
    if (!user) return;
    console.log(`Processing like for item ${itemId}`);
    
    try {
      // Create interaction
      await createUserInteraction({
        userId: user.$id,
        clothingId: itemId,
        interactionType: "like"
      });
      
      // Add to saved items
      await addToSavedItems({
        userId: user.$id,
        clothingId: itemId,
      });
      
      console.log(`Item ${itemId} marked as liked and saved`);
      
      // Refetch to update the feed
      refetch({
        filter: params.filter ?? "All",
        query: params.query ?? "",
        limit: 15,
      });
    } catch (error) {
      console.error('Failed to process like:', error);
    }
  };

  const handleSwipeUp = async (itemId: string) => {
    if (!user) return;
    console.log(`Processing add to cart for item ${itemId}`);
    
    try {
      // Create interaction
      await createUserInteraction({
        userId: user.$id,
        clothingId: itemId,
        interactionType: "cart"
      });
      
      // Add to cart
      await addToCart({
        userId: user.$id,
        clothingId: itemId,
      });
      
      console.log(`Item ${itemId} added to cart`);
      
      // Refetch to update the feed
      refetch({
        filter: params.filter ?? "All",
        query: params.query ?? "",
        limit: 15,
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
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