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
  

  
  export async function signIn({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    try {
      console.log(`Signing in user ${email}`);
      
      // Create a session with email and password
      const session = await account.createEmailPasswordSession(email, password);
      if (!session) throw new Error("Failed to create session");
      
      console.log('Session created successfully');
      return true;
    } catch (error) {
      console.error('Failed to sign in:', error);
      return false;
    }
  }
  
  export async function signUp({
    email,
    password,
    name,
  }: {
    email: string;
    password: string;
    name: string;
  }) {
    try {
      console.log(`Creating account for ${email}`);
      
      // Create the user account
      const user = await account.create(
        ID.unique(),
        email,
        password,
        name
      );
      
      if (!user) throw new Error("Failed to create account");
      
      console.log('Account created successfully:', user.$id);
      return true;
    } catch (error) {
      console.error('Failed to create account:', error);
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
    userId,
    excludeIds = [],
  }: {
    filter: string;
    query: string;
    limit?: number;
    userId?: string;
    excludeIds?: string[];
  }) {
    try {
      const buildQuery = [Query.orderDesc("$createdAt")]; // Changed to orderDesc for newest first
  
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
  
      // Get all interacted items first if userId exists
      let allExcludedIds = [...new Set(excludeIds)]; // Remove duplicates from excludeIds
      
      if (userId) {
        const interactions = await databases.listDocuments(
          config.databaseId!,
          config.user_interactions!,
          [Query.equal("userId", userId)]
        );
        
        const interactedItemIds = interactions.documents.map(doc => doc.clothingId);
        allExcludedIds = [...new Set([...allExcludedIds, ...interactedItemIds])];
      }
  
      // Use individual notEqual queries for each ID to exclude
      if (allExcludedIds.length > 0) {
        allExcludedIds.forEach(id => {
          buildQuery.push(Query.notEqual("$id", id));
        });
      }
  
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

  export async function moveCartItemToSaved({
    userId,
    clothingId,
    cartItemId,
  }: {
    userId: string;
    clothingId: string;
    cartItemId: string;
  }) {
    try {
      // Delete from cart
      await databases.deleteDocument(
        config.databaseId!,
        config.user_cartitems!,
        cartItemId
      );
  
      // Add to saved items
      await databases.createDocument(
        config.databaseId!,
        config.user_saveditems!,
        ID.unique(),
        {
          userId,
          clothingId,
          savedAt: new Date().toISOString(),
        }
      );
  
      return true;
    } catch (error) {
      console.error('Failed to move item from cart to saved:', error);
      return false;
    }
  }

  // Add these new functions
  
  export async function removeFromSavedItems(userId: string, clothingId: string) {
    try {
      // First, find the saved item document
      const savedItems = await databases.listDocuments(
        config.databaseId!,
        config.user_saveditems!,
        [
          Query.equal('userId', userId),
          Query.equal('clothingId', clothingId),
        ]
      );
  
      if (savedItems.documents.length > 0) {
        // Delete the saved item
        await databases.deleteDocument(
          config.databaseId!,
          config.user_saveditems!,
          savedItems.documents[0].$id
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to remove from saved items:', error);
      return false;
    }
  }
  
  export async function checkIfItemIsSaved(userId: string, clothingId: string) {
    try {
      const savedItems = await databases.listDocuments(
        config.databaseId!,
        config.user_saveditems!,
        [
          Query.equal('userId', userId),
          Query.equal('clothingId', clothingId),
        ]
      );
      return savedItems.documents.length > 0;
    } catch (error) {
      console.error('Failed to check if item is saved:', error);
      return false;
    }
  }