import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from "react-native";

import { signIn } from "@/lib/appwrite";
import { Redirect } from "expo-router";
import { useGlobalContext } from "@/lib/global-provider";
import images from "@/constants/images";
import { router } from "expo-router";

const Auth = () => {
  const { refetch, loading, isLogged } = useGlobalContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appearAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animate the form appearance
    Animated.timing(appearAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!loading && isLogged) return <Redirect href="/" />;

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signIn({ email, password });
      if (result) {
        refetch();
      } else {
        Alert.alert("Error", "Failed to sign in. Please check your credentials.");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpPress = () => {
    router.push("/(auth)/sign-up");
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            minHeight: "100%",
          }}
        >
          <Image
            source={images.onboarding}
            className="w-full h-2/5"
            resizeMode="contain"
          />

          <Animated.View 
            className="px-10 flex-1"
            style={{
              opacity: appearAnim,
              transform: [
                {
                  translateY: appearAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            }}
          >
            <Text className="text-base text-center uppercase font-rubik text-black-200">
              Welcome To Trender
            </Text>

            <Text className="text-3xl font-rubik-bold text-black-300 text-center mt-2">
              Let's Get You Closer To {"\n"}
              <Text className="text-primary-300">Your Ideal Style</Text>
            </Text>

            <View className="mt-8">
              <View className="mb-4">
                <Text className="text-sm font-rubik-medium text-black-200 mb-2">
                  Email
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="bg-gray-50 py-3 px-4 rounded-xl font-rubik text-black-300"
                />
              </View>

              <View className="mb-6">
                <Text className="text-sm font-rubik-medium text-black-200 mb-2">
                  Password
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry
                  className="bg-gray-50 py-3 px-4 rounded-xl font-rubik text-black-300"
                />
              </View>

              <TouchableOpacity
                onPress={handleSignIn}
                disabled={isSubmitting}
                className="bg-primary-300 rounded-full w-full py-4 mt-2"
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-rubik-bold">
                    Sign In
                  </Text>
                )}
              </TouchableOpacity>

              <View className="flex-row justify-center mt-4">
                <Text className="font-rubik text-black-200">
                  Don't have an account?{" "}
                </Text>
                <TouchableOpacity onPress={handleSignUpPress}>
                  <Text className="font-rubik-medium text-primary-300">
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Auth;