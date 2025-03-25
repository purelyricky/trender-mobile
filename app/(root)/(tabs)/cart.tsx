import { Text, View } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text className="font-bold text-lg my-10">Home</Text>
      <Link href="/sign-in">
        Sign In
      </Link>
      <Link href="/cart">
       Cart
      </Link>
      <Link href="/saved">
       Saved
      </Link>
    </View>
  );
}
      