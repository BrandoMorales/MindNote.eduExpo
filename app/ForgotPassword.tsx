import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getData, saveData } from "../utils/storage";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const router = useRouter();

  const handleReset = async () => {
    const user = await getData("user");

    if (!user || user.email !== email) {
      Alert.alert("Error", "Correo no registrado");
      return;
    }

    user.password = newPassword;
    await saveData("user", user);
    Alert.alert("Éxito", "Tu contraseña ha sido actualizada");
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar Contraseña</Text>
      <TextInput style={styles.input} placeholder="Correo electrónico" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Nueva contraseña" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Cambiar contraseña</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#E6F0FF", padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20, color: "#1E3A8A" },
  input: { width: "80%", backgroundColor: "#fff", padding: 12, marginBottom: 10, borderRadius: 10 },
  button: { backgroundColor: "#2563EB", padding: 12, borderRadius: 10, width: "80%", alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
