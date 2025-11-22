import { NavigationContainer } from "@react-navigation/native";
import { useEffect } from "react";
import 'react-native-reanimated';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initDatabase } from "./src/database/database";
import DrawerRoutes from "./src/routes/DrawerRoutes";

export default function App() {
  useEffect(() => {
    initDatabase(() => console.log("DB Ready ✅"));
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <DrawerRoutes />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
