import { Stack, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function Piezas() {
  const router = useRouter();
  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Piezas del Componente' }} />
      <Text style={styles.title}>Piezas con Solicitud Activa</Text>
      {['Engranaje Principal', 'Eje Secundario'].map((pieza, index) => (
        <TouchableOpacity key={index} style={styles.card} onPress={() => router.push('/(mecanico)/detalle-pieza')}>
          <Text style={styles.cardTitle}>{pieza}</Text>
          <Text style={{color: 'blue'}}>Ver estado de solicitud...</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, padding: 15 }, title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 }, card: { backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 8 }, cardTitle: { fontSize: 16, fontWeight: 'bold' } });