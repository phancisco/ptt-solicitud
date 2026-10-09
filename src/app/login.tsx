import { useRouter } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    const db = await SQLite.openDatabaseAsync('ptt.db');
    const user = await db.getFirstAsync<{id: number, rol: string}>(
      'SELECT id, rol FROM usuarios WHERE correo = ? AND password = ?', 
      [correo, password]
    );

    if (user) {
      login(user.id, user.rol as any);
      if (user.rol === 'MECANICO') router.replace('/(mecanico)/inicio' as any);
      else if (user.rol === 'SUPERVISOR') router.replace('/(supervisor)/pendientes' as any);
      else if (user.rol === 'ADMIN') router.replace('/(admin)/usuarios' as any);
    } else {
      Alert.alert('Error', 'Credenciales incorrectas');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Power Train Technologies (PTT)</Text>
      <Text style={styles.subtitle}>Iniciar Sesión</Text>
      <TextInput style={styles.input} placeholder="Correo" value={correo} onChangeText={setCorreo} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Ingresar" onPress={handleLogin} />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', padding: 20 }, title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }, subtitle: { fontSize: 18, textAlign: 'center', marginBottom: 30 }, input: { borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 5 } });