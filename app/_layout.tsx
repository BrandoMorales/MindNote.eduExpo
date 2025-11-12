import { Stack } from "expo-router";
import React from "react";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#2563EB" },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen name="home" options={{ title: "Bienvenido" }} />
      <Stack.Screen name="login" options={{ title: "Iniciar Sesión" }} />
      <Stack.Screen name="register" options={{ title: "Crear Cuenta" }} />
      <Stack.Screen name="notas" options={{ title: "Mis Notas" }} />
      <Stack.Screen name="ForgotPassword" options={{ title: "Recuperar Contraseña" }} />
    </Stack>
  );
}
