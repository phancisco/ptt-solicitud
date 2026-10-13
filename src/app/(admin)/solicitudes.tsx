import { useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { Button, FlatList, Text, View } from 'react-native';
import { getDatabaseAsync } from '../../database';

export default function SolicitudesAdmin() {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);

  const load = async () => {
    const db = await getDatabaseAsync();
    const result = await db.getAllAsync('SELECT * FROM solicitudes');
    setSolicitudes(result);
  };

  useFocusEffect(React.useCallback(() => { load(); }, []));

  const eliminar = async (id: number) => {
    const db = await getDatabaseAsync();
    await db.runAsync('DELETE FROM solicitudes WHERE id = ?', [id]);
    load();
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList data={solicitudes} keyExtractor={i => i.id.toString()} renderItem={({item}) => (
        <View style={{ padding: 10, borderWidth: 1, marginTop: 5 }}>
          <Text style={{fontWeight: 'bold'}}>ID: {item.id} - Cod: {item.codigo}</Text>
          <Text>Estado: {item.estado}</Text>
          <Button title="Eliminar Solicitud" color="red" onPress={() => eliminar(item.id)} />
        </View>
      )} />
    </View>
  );
}