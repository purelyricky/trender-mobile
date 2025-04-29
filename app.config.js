const { getDefaultConfig } = require('expo/metro-config');

module.exports = () => {
  // Load .env file
  require('dotenv').config();
  
  return {
    name: "trender",
    slug: "trender",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#FFFFFF"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.erick003.trenderapp",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#000000"
      },
      package: "com.erick003.trenderapp",
      buildType: "apk"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-font",
        {
          "fonts": [
            "./assets/fonts/Rubik-Bold.ttf",
            "./assets/fonts/Rubik-ExtraBold.ttf",
            "./assets/fonts/Rubik-Light.ttf",
            "./assets/fonts/Rubik-Medium.ttf",
            "./assets/fonts/Rubik-Regular.ttf",
            "./assets/fonts/Rubik-SemiBold.ttf"
          ]
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      // Make your env vars available here
      appwriteEndpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
      appwriteProjectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
      appwriteDatabaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      appwriteGalleriesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_GALLERIES_COLLECTION_ID,
      appwriteReviewsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID,
      appwriteBrandsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_BRANDS_COLLECTION_ID,
      appwriteClothesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_CLOTHES_COLLECTION_ID,
      appwriteUserInteractionsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USERINTERACTIONS_COLLECTION_ID,
      appwriteUserCartItemsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USERCARTITEMS_COLLECTION_ID,
      appwriteUserSavedItemsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USERSAVEDITEMS_COLLECTION_ID,
      eas: {
        projectId: "f56cc13c-8a4a-4981-9c06-e8e387251b37"
      }
    }
  };
};