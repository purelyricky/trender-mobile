import {
    Client,
    Account,
    ID,
    Databases,
    OAuthProvider,
    Avatars,
    Query,
    Storage,
  } from "react-native-appwrite";
  import * as Linking from "expo-linking";
  import { openAuthSessionAsync } from "expo-web-browser";
  
  export const config = {
    platform: "com.trender",
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    galleriesCollectionId:
      process.env.EXPO_PUBLIC_APPWRITE_GALLERIES_COLLECTION_ID,
    reviewsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID,
    brandsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_BRANDS_COLLECTION_ID,
    clothesCollectionId:
      process.env.EXPO_PUBLIC_APPWRITE_CLOTHES_COLLECTION_ID,
      user_interactions: process.env.EXPO_PUBLIC_APPWRITE_USERINTERACTIONS_COLLECTION_ID,
      user_cartitems: process.env.EXPO_PUBLIC_APPWRITE_USERCARTITEMS_COLLECTION_ID,
      user_saveditems: process.env.EXPO_PUBLIC_APPWRITE_USERSAVEDITEMS_COLLECTION_ID,
  
  };
  
  export const client = new Client();
  client
    .setEndpoint(config.endpoint!)
    .setProject(config.projectId!)
    .setPlatform(config.platform!);
  
  export const avatar = new Avatars(client);
  export const account = new Account(client);
  export const databases = new Databases(client);
  export const storage = new Storage(client);
  
  export async function login() {
    try {
      const redirectUri = Linking.createURL("/");
  
      const response = await account.createOAuth2Token(
        OAuthProvider.Google,
        redirectUri
      );
      if (!response) throw new Error("Create OAuth2 token failed");
  
      const browserResult = await openAuthSessionAsync(
        response.toString(),
        redirectUri
      );
      if (browserResult.type !== "success")
        throw new Error("Create OAuth2 token failed");
  
      const url = new URL(browserResult.url);
      const secret = url.searchParams.get("secret")?.toString();
      const userId = url.searchParams.get("userId")?.toString();
      if (!secret || !userId) throw new Error("Create OAuth2 token failed");
  
      const session = await account.createSession(userId, secret);
      if (!session) throw new Error("Failed to create session");
  
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  
  export async function logout() {
    try {
      const result = await account.deleteSession("current");
      return result;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  
  export async function getCurrentUser() {
    try {
      const result = await account.get();
      if (result.$id) {
        const userAvatar = avatar.getInitials(result.name);
  
        return {
          ...result,
          avatar: userAvatar.toString(),
        };
      }
  
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  
  export async function getLatestProperties() {
    try {
      const result = await databases.listDocuments(
        config.databaseId!,
        config.clothesCollectionId!,
        [Query.orderAsc("$createdAt"), Query.limit(5)]
      );
  
      return result.documents;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  
  export async function getProperties({
    filter,
    query,
    limit,
  }: {
    filter: string;
    query: string;
    limit?: number;
  }) {
    try {
      const buildQuery = [Query.orderAsc("$createdAt")];
  
      if (filter && filter !== "All")
        buildQuery.push(Query.equal("type", filter));
  
      if (query)
        buildQuery.push(
          Query.or([
            Query.search("name", query),
            Query.search("description", query),
            Query.search("type", query),
          ])
        );
  
      if (limit) buildQuery.push(Query.limit(limit));
  
      const result = await databases.listDocuments(
        config.databaseId!,
        config.clothesCollectionId!,
        buildQuery
      );
  
      return result.documents;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  
  // write function to get property by id
  export async function getPropertyById({ id }: { id: string }) {
    try {
      const result = await databases.getDocument(
        config.databaseId!,
        config.clothesCollectionId!,
        id
      );
      return result;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  
  // Add these new functions
  
  export async function getUserSavedItems(userId: string) {
    try {
      const savedItems = await databases.listDocuments(
        config.databaseId!,
        config.user_saveditems!,
        [
          Query.equal('userId', userId),
          Query.orderDesc('savedAt'),
        ]
      );
  
      // Fetch full item details for each saved item
      const itemDetails = await Promise.all(
        savedItems.documents.map(item => 
          getPropertyById({ id: item.clothingId })
        )
      );
  
      return itemDetails.filter(item => item !== null);
    } catch (error) {
      console.error('Failed to fetch saved items:', error);
      return [];
    }
  }
  
  // Add this type definition at the top of the file
  interface ClothingItem {
    $id: string;
    $collectionId: string;
    $databaseId: string;
    $createdAt: string;
    $updatedAt: string;
    $permissions: string[];
    name: string;
    brand: string;
    price: number;
    image: string;
    type: string;
    description: string;
  }
  
  interface CartItem extends ClothingItem {
    quantity: number;
    cartItemId: string; // To store the cart document ID
  }
  
  // Update the getUserCartItems function
  export async function getUserCartItems(userId: string): Promise<CartItem[]> {
    try {
      const cartItems = await databases.listDocuments(
        config.databaseId!,
        config.user_cartitems!,
        [
          Query.equal('userId', userId),
          Query.orderDesc('addedAt'),
        ]
      );
  
      // Fetch full item details for each cart item
      const itemsWithDetails = await Promise.all(
        cartItems.documents.map(async (cartItem) => {
          const item = await getPropertyById({ id: cartItem.clothingId });
          if (!item) return null;
          
          return {
            ...item,
            quantity: cartItem.quantity || 1,
            cartItemId: cartItem.$id, // Store the cart document ID for updates/deletion
          } as CartItem;
        })
      );
  
      return itemsWithDetails.filter((item): item is CartItem => item !== null);
    } catch (error) {
      console.error('Failed to fetch cart items:', error);
      return [];
    }
  }
  
  export async function createUserInteraction({
    userId,
    clothingId,
    interactionType,
  }: {
    userId: string;
    clothingId: string;
    interactionType: "like" | "dislike" | "cart";
  }) {
    try {
      console.log(`Creating interaction: ${interactionType} for item ${clothingId} by user ${userId}`);
      const result = await databases.createDocument(
        config.databaseId!,
        config.user_interactions!,
        ID.unique(),
        {
          userId,
          clothingId,
          interactionType,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      console.log('Interaction created:', result);
      return result;
    } catch (error) {
      console.error('Failed to create interaction:', error);
      return null;
    }
  }
  
  export async function addToSavedItems({
    userId,
    clothingId,
  }: {
    userId: string;
    clothingId: string;
  }) {
    try {
      console.log(`Adding item ${clothingId} to saved items for user ${userId}`);
      const result = await databases.createDocument(
        config.databaseId!,
        config.user_saveditems!,
        ID.unique(),
        {
          userId,
          clothingId,
          savedAt: new Date().toISOString(),
        }
      );
      console.log('Item saved:', result);
      return result;
    } catch (error) {
      console.error('Failed to save item:', error);
      return null;
    }
  }
  
  export async function addToCart({
    userId,
    clothingId,
    quantity = 1,
  }: {
    userId: string;
    clothingId: string;
    quantity?: number;
  }) {
    try {
      console.log(`Adding item ${clothingId} to cart for user ${userId}`);
      const result = await databases.createDocument(
        config.databaseId!,
        config.user_cartitems!,
        ID.unique(),
        {
          userId,
          clothingId,
          quantity,
          addedAt: new Date().toISOString(),
        }
      );
      console.log('Item added to cart:', result);
      return result;
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      return null;
    }
  }