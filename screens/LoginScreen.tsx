// screens/LoginScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "../firebase";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Fungsi Login
  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Error", "Email dan Password harus diisi!");
    
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Kirim email user sebagai nama sementara
      navigation.navigate("Chat", { name: userCredential.user.email || "User" });
    } catch (error: any) {
      Alert.alert("Gagal Login", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Daftar Baru (Register)
  const handleRegister = async () => {
    if (!email || !password) return Alert.alert("Error", "Email dan Password harus diisi!");
    
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Sukses", "Akun berhasil dibuat! Silakan login.");
    } catch (error: any) {
      Alert.alert("Gagal Daftar", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View style={styles.buttonContainer}>
          <Button title="Login" onPress={handleLogin} />
          <View style={{ marginTop: 10 }}>
             <Button title="Daftar Baru (Register)" onPress={handleRegister} color="green" />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderColor: "#ccc",
  },
  buttonContainer: {
    marginTop: 10,
  }
});