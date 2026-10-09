import { useFocusEffect, useRouter } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import React, { useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

export default function Pendientes() {
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState<any[]>([]);

  useFocusEffect(React.useCallback(() => {
    SQLite.openDatabaseAsync('ptt.db').then(db => {
      db.getAllAsync('SELECT s.*, u.correo as mecanico FROM solicitudes s JOIN usuarios u ON s.mecanico_id = u.id WHERE s.estado = "PENDIENTE"').then(setSolicitudes);
    });
  }, []));

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <FlatList data={solicitudes} keyExtractor={i => i.id.toString()} renderItem={({item}) => (
        <TouchableOpacity style={{ padding: 15, backgroundColor: '#fff', borderWidth: 1, marginBottom: 10 }} 
          onPress={() => router.push(`/(supervisor)/evaluar?id=${item.id}` as any)}>
          <Text style={{ fontWeight: 'bold' }}>{item.codigo} - {item.tipo_componente}</Text>
          <Text>Mecánico: {item.mecanico}</Text>
        </TouchableOpacity>
      )} />
    </View>
  );
}