import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a MindNote.edu</Text>
      <Text style={styles.subtitle}>Agenda tus notas y tu día</Text>

      <View style={styles.navContainer}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push("/login")}>
          <Text style={styles.navText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.push("/register")}>
          <Text style={styles.navText}>Registrarse</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E6F0FF",
    padding: 20,
  },
  title: {
    fontSize: 30,
    alignItems: "center",
    color: "#1E3A8A",
    marginBottom: 20
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 30,
  },
  navContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 40,
  },
  navButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginVertical: 8,
    width: "70%",
    alignItems: "center",
    elevation: 3,
  },
  navText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
