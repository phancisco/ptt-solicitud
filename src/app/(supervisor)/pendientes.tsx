import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { getDatabaseAsync } from '../../database';

export default function Pendientes() {
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      setLoading(true);

      getDatabaseAsync().then(db => {
        db.getAllAsync('SELECT s.*, u.correo as mecanico FROM solicitudes s JOIN usuarios u ON s.mecanico_id = u.id WHERE s.estado = "PENDIENTE" ORDER BY s.id DESC')
          .then(res => {
            if (isActive) {
              setSolicitudes(res);
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
      {solicitudes.length === 0 ? <Text style={{textAlign: 'center', marginTop: 20}}>No hay solicitudes pendientes.</Text> : null}
      
      <FlatList data={solicitudes} keyExtractor={i => i.id.toString()} renderItem={({item}) => (
        <TouchableOpacity style={{ padding: 15, backgroundColor: '#fff', borderWidth: 1, marginBottom: 10, borderRadius: 5 }} 
          onPress={() => router.push(`/(supervisor)/evaluar?id=${item.id}` as any)}>
          <Text style={{ fontWeight: 'bold' }}>{item.codigo} - {item.tipo_componente}</Text>
          <Text>Mecánico: {item.mecanico}</Text>
        </TouchableOpacity>
      )} />
    </View>
  );
}