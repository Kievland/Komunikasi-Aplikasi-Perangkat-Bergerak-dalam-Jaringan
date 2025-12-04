// App.tsx
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { User } from "firebase/auth"; 

// Import halaman
import LoginScreen from "./screens/LoginScreen";
import ChatScreen from "./screens/ChatScreen";

// Import auth saja (signInAnonymously udah KITA HAPUS)
import { auth, onAuthStateChanged } from "./firebase";

export type RootStackParamList = {
  Login: undefined;
  Chat: { name: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  // MISI 2: AUTO-LOGIN (Sudah include di sini!)
  // Kita cuma pasang 'pendengar' (listener). 
  // Kalau user sebelumnya udah login, dia bakal otomatis tau (tanpa kita suruh login ulang).
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (initializing) setInitializing(false);
    });

    return () => unsub();
  }, []);

  if (initializing) return null; // Loading bentar...

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* LOGIKA PINTAR: */}
        {/* Kalau user ada isinya (udah login), langsung masuk Chat */}
        {/* Kalau user kosong (belum login), masuk LoginScreen */}
        
        {user ? (
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen} 
            initialParams={{ name: user.email || "User" }} // Kirim email sebagai nama
            options={{ title: "Ruang Obrolan" }}
          />
        ) : (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ title: "Login Dulu Bro", headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}