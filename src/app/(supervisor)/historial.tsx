import { useFocusEffect, useRouter } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import React, { useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

export default function Historial() {
  const router = useRouter();
  const [historial, setHistorial] = useState<any[]>([]);

  useFocusEffect(React.useCallback(() => {
    SQLite.openDatabaseAsync('ptt.db').then(db => {
      db.getAllAsync('SELECT * FROM solicitudes WHERE estado != "PENDIENTE" ORDER BY id DESC').then(setHistorial);
    });
  }, []));

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <FlatList data={historial} keyExtractor={i => i.id.toString()} renderItem={({item}) => (
        <TouchableOpacity style={{ padding: 15, backgroundColor: '#eee', borderWidth: 1, marginBottom: 10 }}
          onPress={() => router.push(`/(supervisor)/trazabilidad?id=${item.id}` as any)}>
          <Text style={{ fontWeight: 'bold' }}>{item.codigo}</Text>
          <Text>Estado: {item.estado}</Text>
        </TouchableOpacity>
      )} />
    </View>
  );
}