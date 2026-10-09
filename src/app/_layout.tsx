import { Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { AuthProvider } from '../context/AuthContext';
import { initDB } from '../database';

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDB().then(() => setDbReady(true));
  }, []);

  if (!dbReady) return <Text>Cargando Base de Datos...</Text>;

  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}