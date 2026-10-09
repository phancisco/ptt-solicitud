import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Button, Image, ScrollView, Text, View } from 'react-native';

export default function DetalleMecanico() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    SQLite.openDatabaseAsync('ptt.db').then(db => {
      db.getFirstAsync('SELECT * FROM solicitudes WHERE id = ?', [Number(id)]).then(setData);
    });
  }, [id]);

  if (!data) return <Text style={{padding: 20}}>Cargando detalles...</Text>;

  const imagenes = data.imagenes ? JSON.parse(data.imagenes) : [];

  return (
    <ScrollView style={{ flex: 1, padding: 15 }}>
      <Stack.Screen options={{ title: 'Detalle de Solicitud' }} />
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>Cód: {data.codigo}</Text>
      
      <View style={{ backgroundColor: '#fff', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' }}>
        <Text><Text style={{fontWeight: 'bold'}}>Componente:</Text> {data.tipo_componente}</Text>
        <Text><Text style={{fontWeight: 'bold'}}>Cliente:</Text> {data.cliente}</Text>
        <Text><Text style={{fontWeight: 'bold'}}>Tipo de recuperación:</Text> {data.tipo_recuperacion}</Text>
        <Text><Text style={{fontWeight: 'bold'}}>Descripción:</Text> {data.descripcion}</Text>
        <Text style={{ marginTop: 10 }}><Text style={{fontWeight: 'bold'}}>Estado:</Text> {data.estado}</Text>
        
        {data.motivo_revision && (
          <Text style={{ marginTop: 10, color: 'red' }}><Text style={{fontWeight: 'bold'}}>Motivo del Supervisor:</Text> {data.motivo_revision}</Text>
        )}

        {imagenes.length > 0 && (
          <View style={{ marginTop: 15, borderTopWidth: 1, borderColor: '#eee', paddingTop: 10 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Evidencias fotográficas:</Text>
            <ScrollView horizontal>
              {imagenes.map((uri: string, idx: number) => (
                <Image key={idx} source={{ uri }} style={{ width: 80, height: 80, borderRadius: 5, marginRight: 10 }} />
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {data.estado === 'EN REVISION' && (
        <View style={{ marginTop: 20, marginBottom: 30 }}>
          <Button title="Editar y Reenviar Solicitud" color="orange" onPress={() => router.push(`/(mecanico)/formulario?id=${data.id}` as any)} />
        </View>
      )}
    </ScrollView>
  );
}