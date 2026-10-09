import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Alert, Button, Image, ScrollView, Text, TextInput, View } from 'react-native';

export default function Evaluar() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [motivo, setMotivo] = useState('');

  useEffect(() => {
    SQLite.openDatabaseAsync('ptt.db').then(db => {
      db.getFirstAsync('SELECT * FROM solicitudes WHERE id = ?', [Number(id)]).then(setData);
    });
  }, [id]);

  const resolver = async (estado: string) => {
    if (estado === 'EN REVISION' && !motivo) return Alert.alert('Error', 'Falta motivo para apelar');
    const db = await SQLite.openDatabaseAsync('ptt.db');
    await db.runAsync('UPDATE solicitudes SET estado = ?, motivo_revision = ? WHERE id = ?', [estado, motivo, Number(id)]);
    Alert.alert('Listo', `Solicitud ${estado}`);
    router.replace('/(supervisor)/pendientes' as any);
  };

  if (!data) return <Text>Cargando...</Text>;

  const imagenes = data.imagenes ? JSON.parse(data.imagenes) : [];

  return (
    <ScrollView style={{ flex: 1, padding: 15 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Evaluación de: {data.codigo}</Text>
      <Text>Cliente: {data.cliente}</Text>
      <Text>Tipo de recuperación: {data.tipo_recuperacion}</Text>
      <Text>Falla: {data.descripcion}</Text>

      {imagenes.length > 0 && (
        <ScrollView horizontal style={{ marginTop: 15, marginBottom: 15 }}>
          {imagenes.map((uri: string, idx: number) => (
            <Image key={idx} source={{ uri }} style={{ width: 100, height: 100, borderRadius: 5, marginRight: 10, borderWidth: 1, borderColor: '#ddd' }} />
          ))}
        </ScrollView>
      )}
      
      <View style={{ marginVertical: 20, flexDirection: 'row', justifyContent: 'space-around' }}>
        <Button title="Aprobar" color="green" onPress={() => resolver('APROBADA')} />
        <Button title="Rechazar" color="red" onPress={() => resolver('RECHAZADA')} />
      </View>

      <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Apelar (Reenviar al mecánico):</Text>
      <TextInput placeholder="Motivo de apelación..." style={{ borderWidth: 1, padding: 10, marginVertical: 10 }} value={motivo} onChangeText={setMotivo} />
      <Button title="Reenviar a Corrección" color="orange" onPress={() => resolver('EN REVISION')} />
      <View style={{ marginBottom: 40 }} />
    </ScrollView>
  );
}