import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getData, saveData } from "../utils/storage";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const remembered = await getData("rememberedUser");
      if (remembered) {
        setEmail(remembered.email);
        setPassword(remembered.password);
        setRemember(true);
      }
    })();
  }, []);

  const handleLogin = async () => {
    const user = await getData("user");

    if (!user || user.email !== email || user.password !== password) {
      Alert.alert("Error", "Correo o contraseña incorrectos");
      return;
    }

    if (remember) {
      await saveData("rememberedUser", { email, password });
    } else {
      await saveData("rememberedUser", null);
    }

    Alert.alert("Bienvenido", `Hola ${user.name}`);
    router.replace("/notas"); // Redirige a la pantalla de notas
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      <TextInput style={styles.input} placeholder="Correo electrónico" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword} />
      
      <TouchableOpacity onPress={() => setRemember(!remember)}>
        <Text style={{ color: remember ? "#2563EB" : "#333" }}>
          {remember ? "✓ Recordar contraseña" : "Recordar contraseña"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/ForgotPassword")}>
        <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#E6F0FF", padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20, color: "#1E3A8A" },
  input: { width: "80%", backgroundColor: "#fff", padding: 12, marginBottom: 10, borderRadius: 10 },
  button: { backgroundColor: "#2563EB", padding: 12, borderRadius: 10, width: "80%", alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontWeight: "bold" },
  link: { marginTop: 15, color: "#2563EB" },
});
