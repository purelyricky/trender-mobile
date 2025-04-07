import React, { useState } from "react";
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
} from "react-native";

import { signUp } from "@/lib/appwrite";
import { Redirect } from "expo-router";
import { useGlobalContext } from "@/lib/global-provider";
import images from "@/constants/images";
import { router } from "expo-router";

const SignUp = () => {
  const { refetch, loading, isLogged } = useGlobalContext();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!loading && isLogged) return <Redirect href="/" />;

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signUp({ name, email, password });
      if (result) {
        router.push("/sign-in");
      } else {
        Alert.alert("Error", "Failed to create account. Please try again.");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
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
            className="w-full h-1/3"
            resizeMode="contain"
          />

          <View className="px-10 flex-1">
            <Text className="text-base text-center uppercase font-rubik text-black-200">
              Join Trender
            </Text>

            <Text className="text-3xl font-rubik-bold text-black-300 text-center mt-2">
              Create Your Account {"\n"}
              <Text className="text-primary-300">And Start Exploring</Text>
            </Text>

            <View className="mt-6">
              <View className="mb-3">
                <Text className="text-sm font-rubik-medium text-black-200 mb-1">
                  Full Name
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  className="bg-gray-50 py-3 px-4 rounded-xl font-rubik text-black-300"
                />
              </View>

              <View className="mb-3">
                <Text className="text-sm font-rubik-medium text-black-200 mb-1">
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

              <View className="mb-3">
                <Text className="text-sm font-rubik-medium text-black-200 mb-1">
                  Password
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a password"
                  secureTextEntry
                  className="bg-gray-50 py-3 px-4 rounded-xl font-rubik text-black-300"
                />
              </View>

              <View className="mb-5">
                <Text className="text-sm font-rubik-medium text-black-200 mb-1">
                  Confirm Password
                </Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  secureTextEntry
                  className="bg-gray-50 py-3 px-4 rounded-xl font-rubik text-black-300"
                />
              </View>

              <TouchableOpacity
                onPress={handleSignUp}
                disabled={isSubmitting}
                className="bg-primary-300 rounded-full w-full py-4 mt-2"
              >
                <Text className="text-white text-center font-rubik-bold">
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Text>
              </TouchableOpacity>

              <View className="flex-row justify-center mt-4">
                <Text className="font-rubik text-black-200">
                  Already have an account?{" "}
                </Text>
                <TouchableOpacity onPress={() => router.push("/sign-in")}>
                  <Text className="font-rubik-medium text-primary-300">
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp;