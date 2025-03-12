import { Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-zinc-900">
      <TouchableOpacity
        onPress={() => alert("Hello")}
        className="bg-blue-500 p-4 rounded-lg shadow-lg shadow-blue-400"
      >
        <Text className="text-white font-bold ">I am Button</Text>
      </TouchableOpacity>
    </View>
  );
}
