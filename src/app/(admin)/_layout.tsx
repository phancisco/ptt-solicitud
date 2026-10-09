import { Tabs, useRouter } from 'expo-router';
import { Button } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const router = useRouter();
  const { logout } = useAuth();
  return (
    <Tabs screenOptions={{ headerLeft: () => <Button title="Salir" onPress={() => { logout(); router.replace('/login'); }} color="red" /> }}>
      <Tabs.Screen name="usuarios" options={{ title: 'Gestión Usuarios' }} />
      <Tabs.Screen name="solicitudes" options={{ title: 'Gestión Solicitudes' }} />
    </Tabs>
  );
}