import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { getDatabaseAsync } from '../../database';

export default function Historial() {
  const router = useRouter();
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      setLoading(true);

      getDatabaseAsync().then(db => {
        db.getAllAsync('SELECT * FROM solicitudes WHERE estado != "PENDIENTE" ORDER BY id DESC')
          .then(res => {
            if (isActive) {
              setHistorial(res);
              setLoading(false);
            }
          })
          .catch(() => { if (isActive) setLoading(false); });
      });

      return () => { isActive = false; };
    }, [])
  );

  if (loading) return <View style={{flex: 1, justifyContent: 'center'}}><ActivityIndicator size="large" /></View>;

  return (
    <View style={{ flex: 1, padding: 15 }}>
      {historial.length === 0 ? <Text style={{textAlign: 'center', marginTop: 20}}>No hay historial disponible.</Text> : null}

      <FlatList data={historial} keyExtractor={i => i.id.toString()} renderItem={({item}) => (
        <TouchableOpacity style={{ padding: 15, backgroundColor: '#eee', borderWidth: 1, marginBottom: 10, borderRadius: 5 }}
          onPress={() => router.push(`/(supervisor)/trazabilidad?id=${item.id}` as any)}>
          <Text style={{ fontWeight: 'bold' }}>{item.codigo}</Text>
          <Text>Estado: {item.estado}</Text>
        </TouchableOpacity>
      )} />
    </View>
  );
}