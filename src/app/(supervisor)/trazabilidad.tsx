import { useLocalSearchParams } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';

export default function Trazabilidad() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    SQLite.openDatabaseAsync('ptt.db').then(db => {
      db.getFirstAsync('SELECT s.*, u.correo FROM solicitudes s JOIN usuarios u ON s.mecanico_id = u.id WHERE s.id = ?', [Number(id)]).then(setData);
    });
  }, [id]);

  if (!data) return <Text style={{padding: 20}}>Cargando trazabilidad...</Text>;

  const imagenesFinales = data.imagenes ? JSON.parse(data.imagenes) : [];
  const imagenesOriginales = data.imagenes_originales ? JSON.parse(data.imagenes_originales) : [];
  const fueCorregida = !!data.descripcion_original;

  return (
    <ScrollView style={{ flex: 1, padding: 15 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>Expediente: {data.codigo}</Text>
      
      {fueCorregida && (
        <View style={{ backgroundColor: '#ffe0b2', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#ff9800', marginBottom: 15 }}>
          <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 5, color: '#e65100'}}>Lo que se solicitó ANTES (Original)</Text>
          <Text><Text style={{fontWeight: 'bold'}}>Descripción Original:</Text> {data.descripcion_original}</Text>

          {imagenesOriginales.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Evidencias Originales:</Text>
              <ScrollView horizontal>
                {imagenesOriginales.map((uri: string, idx: number) => (
                  <Image key={idx} source={{ uri }} style={{ width: 80, height: 80, borderRadius: 5, marginRight: 10, borderWidth: 1, borderColor: '#ffb74d' }} />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      )}

      <View style={{ backgroundColor: fueCorregida ? '#e8f5e9' : '#f9f9f9', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: fueCorregida ? '#4caf50' : '#ccc', marginBottom: 20 }}>
        <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 5, color: fueCorregida ? '#1b5e20' : '#333'}}>
          {fueCorregida ? 'Primera solicitud' : 'Solicitud Final'}
        </Text>
        <Text><Text style={{fontWeight: 'bold'}}>Mecánico:</Text> {data.correo}</Text>
        <Text><Text style={{fontWeight: 'bold'}}>Componente:</Text> {data.tipo_componente}</Text>
        <Text><Text style={{fontWeight: 'bold'}}>Cliente:</Text> {data.cliente}</Text>
        <Text><Text style={{fontWeight: 'bold'}}>Tipo de recuperación:</Text> {data.tipo_recuperacion}</Text>
        <Text><Text style={{fontWeight: 'bold'}}>Descripción:</Text> {data.descripcion}</Text>

        {imagenesFinales.length > 0 && (
          <View style={{ marginTop: 15 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Evidencias {fueCorregida ? 'Finales' : 'Adjuntas'}:</Text>
            <ScrollView horizontal>
              {imagenesFinales.map((uri: string, idx: number) => (
                <Image key={idx} source={{ uri }} style={{ width: 100, height: 100, borderRadius: 5, marginRight: 10, borderWidth: 1, borderColor: '#ddd' }} />
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Línea de Tiempo</Text>
      <View style={{ backgroundColor: '#fff', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', marginBottom: 40 }}>
        <Text style={{marginBottom: 10}}><Text style={{fontWeight: 'bold'}}>Paso 1:</Text> Solicitud creada por mecánico.</Text>
        
        {data.motivo_revision && (
           <Text style={{marginBottom: 10, color: 'orange'}}><Text style={{fontWeight: 'bold'}}>Paso 2 (Apelación):</Text> Devuelta por supervisor. Motivo: {data.motivo_revision}</Text>
        )}
        
        {fueCorregida && (
           <Text style={{marginBottom: 10}}><Text style={{fontWeight: 'bold'}}>Paso 3:</Text> Corregida y reenviada por el mecánico.</Text>
        )}
        
        <Text style={{marginTop: 10, color: data.estado === 'APROBADA' ? 'green' : 'red'}}>
          <Text style={{fontWeight: 'bold'}}>Decisión Final:</Text> Solicitud {data.estado} por el Supervisor.
        </Text>
      </View>
    </ScrollView>
  );
}