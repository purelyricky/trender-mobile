import React, { useMemo } from 'react';
import { Text, View, ScrollView, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react-native";
import { useGlobalContext } from "@/lib/global-provider";
import { useAppwrite } from "@/lib/useAppwrite";
import { getUserCartItems } from "@/lib/appwrite";
import NoResults from "@/components/NoResults";
import { router } from 'expo-router';
import { moveCartItemToSaved } from "@/lib/appwrite";

export default function Cart() {
  const { user } = useGlobalContext();

  const {
    data: cartItems,
    loading,
    refetch,
  } = useAppwrite({
    fn: () => getUserCartItems(user?.$id ?? ''),
    params: {},
    skip: !user,
  });

  const { subtotal, tax, total } = useMemo(() => {
    if (!cartItems) return { subtotal: 0, tax: 0, total: 0 };
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const tax = subtotal * 0.27; // 27% VAT for Hungary
    return {
      subtotal,
      tax,
      total: subtotal + tax
    };
  }, [cartItems]);

  const handleDelete = async (itemId: string, cartItemId: string) => {
    try {
      if (!user) return;
      
      await moveCartItemToSaved({
        userId: user.$id,
        clothingId: itemId,
        cartItemId: cartItemId,
      });

      // Refresh the cart items
      refetch({});
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" className="text-primary-300 mt-5" />;
    }

    if (!cartItems || cartItems.length === 0) {
      return (
        <View className="flex-1 items-center justify-center">
          <NoResults />
        </View>
      );
    }

    return (
      <ScrollView 
        className="flex-1 w-full px-5"
        contentContainerStyle={{ paddingBottom: 180 }} // Replace View spacer with paddingBottom
      >
        {cartItems.map((item) => (
          <View 
            key={item.$id} 
            className="flex-row bg-white rounded-xl mb-4 overflow-hidden border border-gray-100 p-3"
          >
            <Image
              source={{ uri: item.image }}
              className="w-24 h-24 rounded-xl"
              resizeMode="cover"
            />
            <View className="flex-1 ml-3">
              <View className="flex-row justify-between items-start">
                <View className="flex-1 pr-2">
                  <Text className="font-rubik-medium text-sm text-black-300" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className="font-rubik text-xs text-black-100 mt-1" numberOfLines={1}>
                    {item.brand}
                  </Text>
                  <Text className="font-rubik-medium text-sm text-primary-300 mt-2">
                    HUF {item.price.toLocaleString()}
                  </Text>
                </View>
                <TouchableOpacity 
                  className="p-2"
                  onPress={() => handleDelete(item.$id, item.cartItemId)}
                >
                  <Trash2 size={18} color="#666" />
                </TouchableOpacity>
              </View>
              
              <View className="flex-row items-center mt-2">
                <Text className="font-rubik text-sm text-black-100 mr-3">Qty</Text>
                <TouchableOpacity 
                  className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                  onPress={() => {/* Handle decrease */}}
                >
                  <Minus size={16} color="#666" />
                </TouchableOpacity>
                <Text className="mx-4 font-rubik-medium">
                  {item.quantity || 1}
                </Text>
                <TouchableOpacity 
                  className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                  onPress={() => {/* Handle increase */}}
                >
                  <Plus size={16} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-5 py-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mr-3"
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="font-rubik-medium text-xl text-black-300">
          Shopping Cart
        </Text>
      </View>
      
      {renderContent()}

      {cartItems && cartItems.length > 0 && (
        <View className="absolute bottom-[80px] left-0 right-0 bg-white border-t border-gray-100 px-5 pt-3 pb-4">
          <View className="mb-3">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="font-rubik text-sm text-black-100">Cart Total</Text>
              <Text className="font-rubik text-sm text-black-300">
                HUF {subtotal.toLocaleString()}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="font-rubik text-sm text-black-100">Tax (27%)</Text>
              <Text className="font-rubik text-sm text-black-300">
                HUF {tax.toLocaleString()}
              </Text>
            </View>
            <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
              <Text className="font-rubik-medium text-base text-black-300">Sub Total</Text>
              <Text className="font-rubik-medium text-lg text-primary-300">
                HUF {total.toLocaleString()}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            className="w-full h-12 bg-primary-300 rounded-xl flex-row items-center justify-center"
            onPress={() => {/* Handle checkout */}}
          >
            <ShoppingBag size={20} color="#fff" />
            <Text className="font-rubik-medium text-white ml-2">
              Proceed to Checkout
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
      