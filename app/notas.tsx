import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getData, removeData, saveData } from "../utils/storage";

// Definimos una interfaz para la estructura de una nota
interface Note {
  text: string;
  date: string; // Guardamos la fecha como string ISO para facilitar el almacenamiento
  completed: boolean;
}

export default function NotasScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState<'date' | 'time' | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const savedUser = await getData("user");
      if (savedUser) {
        setUser(savedUser);
        const userNotes = await getData(`notes_${savedUser.email}`);
        if (userNotes) {
          // Aseguramos que todas las notas tengan la propiedad 'completed'
          const sanitizedNotes = userNotes.map((n: any) => ({
            ...n,
            completed: n.completed || false,
          }));
          setNotes(sanitizedNotes);
        }
      } else {
        // Si no hay usuario, no debería estar en esta pantalla. Lo redirigimos.
        router.replace("/login");
      }
    };
    loadData();
  }, []);

  const saveNotes = async (newNotes: Note[]) => {
    if (!user) return;
    const sorted = newNotes.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setNotes(sorted);
    await saveData(`notes_${user.email}`, sorted);
  };

  const handleAddNote = async () => {
    if (!note.trim()) {
      Alert.alert("⚠️ Error", "La nota no puede estar vacía");
      return;
    }

    // Permitimos agendar en fechas pasadas para edición, pero no para notas nuevas
    if (editingIndex === null && date.getTime() < new Date().getTime() - 60000) { // Damos 1 min de margen
      Alert.alert("⏰ Error", "No puedes agendar notas nuevas en fechas pasadas");
      return;
    }

    let updatedNotes;
    const noteData: Note = {
      text: note.trim(),
      date: date.toISOString(), // Guardamos como string
      completed: editingIndex !== null ? notes[editingIndex].completed : false,
    };

    if (editingIndex !== null) {
      updatedNotes = notes.map((n, i) => (i === editingIndex ? noteData : n));
      Alert.alert("✅ Nota actualizada", "Los cambios se guardaron correctamente");
    } else {
      updatedNotes = [...notes, noteData];
      Alert.alert("✅ Nota guardada", "Tu nota fue agendada correctamente");
    }

    await saveNotes(updatedNotes);
    setNote("");
    setDate(new Date());
    setEditingIndex(null);
  };

  const handleDeleteNote = (index: number) => {
    Alert.alert("Eliminar nota", "¿Deseas eliminar esta nota?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          const updatedNotes = notes.filter((_, i) => i !== index);
          await saveNotes(updatedNotes);
          Alert.alert("🗑️ Nota eliminada");
        },
      },
    ]);
  };

  const handleEditNote = (index: number) => {
    const n = notes[index];
    setNote(n.text);
    setDate(new Date(n.date)); // Convertimos el string de vuelta a objeto Date
    setEditingIndex(index);
  };

  const handleToggleComplete = async (index: number) => {
    const updatedNotes = notes.map((n, i) =>
      i === index ? { ...n, completed: !n.completed } : n
    );
    await saveNotes(updatedNotes);
  };

  const renderItem = ({ item, index }: { item: Note; index: number }) => {
    const noteDate = new Date(item.date);
    const formattedDate = noteDate.toLocaleString("es-ES", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    });

    return (
      <View style={[styles.noteCard, item.completed && styles.noteCompleted]}>
        <View style={styles.noteHeader}>
          <Text style={styles.noteDate}>{formattedDate}</Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => handleToggleComplete(index)}>
              <Text style={styles.actionComplete}>{item.completed ? "✅" : "☑️"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleEditNote(index)}>
              <Text style={styles.actionEdit}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteNote(index)}>
              <Text style={styles.actionDelete}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.noteText, item.completed && styles.noteTextCompleted]}>
          {item.text}
        </Text>
      </View>
    );
  };

  const handleLogout = async () => {
    await removeData("rememberedUser");
    router.replace("/home");
  };

  // El selector de fecha solo se muestra en iOS y Android
  const renderDatePicker = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      return (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={showPicker === 'date' ? 'date' : 'time'}
          display="default"
          onChange={onDateChange}
        />
      );
    }
    // En web, no mostramos nada, pero podrías poner un mensaje.
    return null;
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    // Siempre ocultar el selector después de una acción (seleccionar o cancelar)
    setShowPicker(null);
    // Solo actualizar la fecha si el usuario presionó "OK" o seleccionó una fecha
    if (event.type === 'set' && selectedDate) {
      setDate(new Date(selectedDate));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>🗒️ Mis Notas</Text>
      {user && <Text style={styles.subtitle}>Hola, {user.name} 👋</Text>}

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Escribe tu nota..."
          value={note}
          onChangeText={setNote}
        />

        {Platform.OS !== 'web' ? (
          <View style={styles.dateContainer}>
            <TouchableOpacity
              onPress={() => setShowPicker('date')}
              style={styles.dateButton}
            >
              <Text style={styles.dateButtonText}>
                📅 {date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowPicker('time')}
              style={styles.dateButton}
            >
              <Text style={styles.dateButtonText}>
                ⏰ {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.webDateLabel}>Fecha y Hora (YYYY-MM-DD HH:MM):</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 2024-08-25 14:30"
              onChangeText={(text) => {
                const parsedDate = new Date(text);
                if (!isNaN(parsedDate.getTime())) setDate(parsedDate);
              }}
            />
          </View>
        )}

        {showPicker && renderDatePicker()}

        <TouchableOpacity
          style={[
            styles.addButton,
            { backgroundColor: editingIndex !== null ? "#2196F3" : "#4CAF50" },
          ]}
          onPress={handleAddNote}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>
            {editingIndex !== null ? "💾 Guardar Cambios" : "➕ Agregar Nota"}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        style={{ marginTop: 20, width: '100%' }}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Cerrar sesión</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F8",
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E1E1E",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 20,
    color: "#555",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
    marginBottom: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateButton: {
    backgroundColor: "#E8EAF6",
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    flex: 1, // Para que ocupen el espacio disponible
    marginHorizontal: 5, // Espacio entre botones
  },
  dateButtonText: {
    color: "#3949AB",
    fontSize: 16,
    fontWeight: "500",
  },
  webDateLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  addButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  noteCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
  },
  noteCompleted: {
    backgroundColor: '#E8F5E9', // Un fondo verde claro para notas completadas
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  noteDate: {
    fontSize: 14,
    color: "#757575",
  },
  noteText: {
    fontSize: 16,
    color: "#333",
    marginTop: 5,
  },
  noteTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#757575',
  },
  actions: {
    flexDirection: "row",
    gap: 15,
  },
  actionComplete: {
    fontSize: 20,
  },
  actionEdit: {
    fontSize: 20,
  },
  actionDelete: {
    fontSize: 20,
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    padding: 12,
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  logoutText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});
