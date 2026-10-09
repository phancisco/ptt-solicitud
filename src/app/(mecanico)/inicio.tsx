import { Stack, useFocusEffect, useRouter } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import React, { useState } from 'react';
import { Button, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function IndexMecanico() {
  const router = useRouter();
  const { logout, userId } = useAuth();
  const [solicitudes, setSolicitudes] = useState<any[]>([]);

  useFocusEffect(React.useCallback(() => {
    SQLite.openDatabaseAsync('ptt.db').then(db => {
      db.getAllAsync('SELECT * FROM solicitudes WHERE mecanico_id = ? ORDER BY id DESC', [userId]).then(setSolicitudes);
    });
  }, []));

  return (
    <ScrollView style={{ flex: 1, padding: 15 }}>
      <Stack.Screen options={{ title: 'Mis Solicitudes', headerRight: () => <Button title="Crear" onPress={() => router.push('/(mecanico)/formulario')} />, headerLeft: () => <Button title="Salir" onPress={() => { logout(); router.replace('/login'); }} color="red" /> }} />
      {solicitudes.map((item) => (
        <TouchableOpacity key={item.id} style={{ backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 5, borderWidth: 1, borderColor: item.estado === 'EN REVISION' ? 'orange' : '#ccc' }} 
          onPress={() => router.push(`/(mecanico)/detalle?id=${item.id}` as any)}>
          <Text style={{ fontWeight: 'bold' }}>Cód: {item.codigo} ({item.tipo_componente})</Text>
          <Text>Estado: {item.estado}</Text>
          {item.motivo_revision && <Text style={{color: 'red'}}>Motivo: {item.motivo_revision}</Text>}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}