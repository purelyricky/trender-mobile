import React from 'react';
import { Text, View, ScrollView, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalContext } from "@/lib/global-provider";
import { useAppwrite } from "@/lib/useAppwrite";
import { getUserSavedItems } from "@/lib/appwrite";
import NoResults from "@/components/NoResults";
import { router } from "expo-router";

export default function SavedItems() {
  const { user } = useGlobalContext();

  const {
    data: savedItems,
    loading,
    refetch,
  } = useAppwrite({
    fn: () => getUserSavedItems(user?.$id ?? ''),
    params: {},
    skip: !user,
  });

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" className="text-primary-300 mt-5" />;
    }

    if (!savedItems || savedItems.length === 0) {
      return <NoResults />;
    }

    return (
      <ScrollView className="flex-1 w-full px-5">
        <View className="flex-row flex-wrap justify-between">
          {savedItems?.map((item) => (
            <TouchableOpacity
              key={item.$id}
              onPress={() => router.push(`/clothings/${item.$id}`)}
              className="w-[48%] bg-white rounded-xl mb-4 overflow-hidden shadow-sm"
            >
              <Image
                source={{ uri: item.image }}
                className="w-full h-48 rounded-t-xl"
                resizeMode="cover"
              />
              <View className="p-3">
                <Text className="font-rubik-medium text-sm text-black-300" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text className="font-rubik text-xs text-black-100 mt-1" numberOfLines={1}>
                  {item.brand}
                </Text>
                <Text className="font-rubik-medium text-sm text-primary-300 mt-2">
                  HUF {item.price}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-5 py-4 border-b border-gray-100">
        <Text className="font-rubik-medium text-xl text-black-300">
          Saved Items
        </Text>
      </View>
      <ScrollView className="flex-1 w-full px-5">
        <View className="flex-row flex-wrap justify-between">
          {savedItems?.map((item) => (
            <TouchableOpacity
              key={item.$id}
              onPress={() => router.push(`/clothings/${item.$id}`)}
              className="w-[48%] bg-white rounded-xl mb-4 overflow-hidden shadow-sm"
            >
              <Image
                source={{ uri: item.image }}
                className="w-full h-48 rounded-t-xl"
                resizeMode="cover"
              />
              <View className="p-3">
                <Text className="font-rubik-medium text-sm text-black-300" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text className="font-rubik text-xs text-black-100 mt-1" numberOfLines={1}>
                  {item.brand}
                </Text>
                <Text className="font-rubik-medium text-sm text-primary-300 mt-2">
                  HUF {item.price}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
