import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { useGlobalContext } from "@/lib/global-provider";
import { useAppwrite } from "@/lib/useAppwrite";
import {
  getPropertyById,
  addToCart,
  removeFromSavedItems,
  checkIfItemIsSaved,
} from "@/lib/appwrite";
import icons from "@/constants/icons";

export default function ClothingDetail() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useGlobalContext();
  const [isSaved, setIsSaved] = useState(false);
  const windowHeight = Dimensions.get("window").height;

  const { data: clothing } = useAppwrite({
    fn: getPropertyById,
    params: { id: id! },
  });

  useEffect(() => {
    if (user && id) {
      checkIfItemIsSaved(user.$id, id).then(setIsSaved);
    }
  }, [user, id]);

  const handleAddToCart = async () => {
    if (!user || !clothing) return;

    try {
      await addToCart({
        userId: user.$id,
        clothingId: clothing.$id,
        quantity: 1,
      });
      router.push("/cart");
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  const handleRemoveFromSaved = async () => {
    if (!user || !clothing) return;

    try {
      await removeFromSavedItems(user.$id, clothing.$id);
      router.back();
    } catch (error) {
      console.error("Failed to remove from saved:", error);
    }
  };

  if (!clothing) return null;

  return (
    <View className="flex-1 bg-white">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-24"
      >
        <View className="relative w-full" style={{ height: windowHeight * 0.65 }}>
          <Image
            source={{ uri: clothing.image }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View
            className="absolute top-0 left-0 right-0 p-4 flex-row justify-between items-center"
            style={{ marginTop: Platform.OS === "ios" ? 40 : 20 }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-white/80 rounded-full p-2"
            >
              <Image source={icons.backArrow} className="w-6 h-6" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="p-5">
          <Text className="text-2xl font-rubik-bold text-black-300">
            {clothing.name}
          </Text>
          <Text className="text-lg font-rubik-medium text-black-200 mt-1">
            {clothing.brand}
          </Text>
          <Text className="text-xl font-rubik-bold text-primary-300 mt-2">
            HUF {clothing.price}
          </Text>

          <Text className="text-base font-rubik text-black-200 mt-4">
            {clothing.description}
          </Text>

          <View className="flex-row items-center flex-wrap gap-2 mt-4">
            <View className="bg-primary-100 px-4 py-2 rounded-full">
              <Text className="text-primary-300 font-rubik-medium">
                {clothing.type}
              </Text>
            </View>
            <View className="bg-primary-100 px-4 py-2 rounded-full">
              <Text className="text-primary-300 font-rubik-medium">
                {clothing.size}
              </Text>
            </View>
            <View className="bg-primary-100 px-4 py-2 rounded-full">
              <Text className="text-primary-300 font-rubik-medium">
                {clothing.color}
              </Text>
            </View>
          </View>

          {/* Action Buttons moved up */}
          <View className="mt-8">
            <View className="flex-row justify-between gap-4">
              <TouchableOpacity
                onPress={handleRemoveFromSaved}
                className="flex-1 bg-red-500 py-3 rounded-full"
              >
                <Text className="text-white text-center font-rubik-bold">
                  Remove from Saved
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddToCart}
                className="flex-1 bg-primary-300 py-3 rounded-full"
              >
                <Text className="text-white text-center font-rubik-bold">
                  Add to Cart
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}