// screens/ChatScreen.tsx
import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  TouchableOpacity
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';

import {
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  messagesCollection,
  auth,
  signOut
} from "../firebase";

type MessageType = {
  id: string;
  text: string;
  user: string;
  image?: string;
  createdAt: { seconds: number; nanoseconds: number } | null;
};

type Props = NativeStackScreenProps<RootStackParamList, "Chat">;

export default function ChatScreen({ navigation, route }: Props) {
  const { name } = route.params || { name: "User" };
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const STORAGE_KEY = 'CHAT_HISTORY';

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert("Error", "Gagal logout bro");
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={{ marginRight: 10 }}>
          <Text style={{ color: "red", fontWeight: "bold" }}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const loadOfflineData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonValue != null) setMessages(JSON.parse(jsonValue));
      } catch(e) { console.log("Error loading offline"); }
    };
    loadOfflineData();

    const q = query(messagesCollection, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const list: MessageType[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as MessageType);
      });
      setMessages(list);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    });
    return () => unsub();
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;
    try {
      await addDoc(messagesCollection, {
        text: message,
        user: name,
        createdAt: serverTimestamp(),
      });
      setMessage("");
    } catch (error) { Alert.alert("Gagal", "Error kirim pesan"); }
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.5,
      maxWidth: 500,
      maxHeight: 500,
      includeBase64: true,
    });

    if (result.assets && result.assets[0].base64) {
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      try {
        await addDoc(messagesCollection, {
          text: "📷 Mengirim gambar...",
          user: name,
          image: base64Img,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        Alert.alert("Gagal", "File terlalu besar/koneksi error");
      }
    }
  };

  const renderItem = ({ item }: { item: MessageType }) => (
    <View style={[styles.msgBox, item.user === name ? styles.myMsg : styles.otherMsg]}>
      <Text style={styles.sender}>{item.user}</Text>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.chatImage} />
      ) : (
        <Text style={styles.msgText}>{item.text}</Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 10, paddingBottom: 20 }}
        />
        <View style={styles.inputRow}>
          {/* --- BAGIAN YANG DIUBAH: PAKE GAMBAR IKON --- */}
          <TouchableOpacity onPress={pickImage} style={styles.camBtn}>
            <Image 
             source={require('../assets/images/camera_icon.png')} 
              style={styles.iconImage} 
            />
          </TouchableOpacity>
          {/* ------------------------------------------- */}
          
          <TextInput
            style={styles.input}
            placeholder="Ketik pesan..."
            value={message}
            onChangeText={setMessage}
          />
          <Button title="Kirim" onPress={sendMessage} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  msgBox: { padding: 10, marginVertical: 4, borderRadius: 8, maxWidth: "75%" },
  myMsg: { backgroundColor: "#d1f0ff", alignSelf: "flex-end" },
  otherMsg: { backgroundColor: "#f0f0f0", alignSelf: "flex-start" },
  sender: { fontSize: 10, color: "#666", marginBottom: 2, fontWeight: "bold" },
  msgText: { fontSize: 16, color: "#000" },
  chatImage: { width: 200, height: 200, borderRadius: 8, resizeMode: 'cover' },
  inputRow: { flexDirection: "row", padding: 10, borderTopWidth: 1, borderColor: "#ccc", alignItems: "center", backgroundColor: "#fff" },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", marginRight: 10, padding: 10, borderRadius: 20, backgroundColor: "#fff" },
  camBtn: { marginRight: 10, padding: 5 },
  
  // --- STYLE BARU UNTUK UKURAN IKON ---
  iconImage: {
    width: 24,  // Atur lebar ikon
    height: 24, // Atur tinggi ikon
    resizeMode: 'contain' // Biar gambar gak gepeng
  }
});