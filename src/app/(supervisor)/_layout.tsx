import { Tabs, useRouter } from 'expo-router';
import { Button } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function SupervisorLayout() {
  const router = useRouter();
  const { logout } = useAuth();
  return (
    <Tabs screenOptions={{ headerLeft: () => <Button title="Salir" onPress={() => { logout(); router.replace('/login'); }} color="red" /> }}>
      <Tabs.Screen name="pendientes" options={{ title: 'Pendientes' }} />
      <Tabs.Screen name="historial" options={{ title: 'Historial' }} />
      <Tabs.Screen name="evaluar" options={{ href: null, title: 'Evaluar' }} />
      <Tabs.Screen name="trazabilidad" options={{ href: null, title: 'Trazabilidad' }} />
    </Tabs>
  );
}