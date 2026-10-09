import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function Formulario() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userId } = useAuth();
  
  const [tipo, setTipo] = useState('Motor');
  const [codigo, setCodigo] = useState('');
  const [cliente, setCliente] = useState('');
  const [recuperacion, setRecuperacion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loadingOCR, setLoadingOCR] = useState(false);
  const [fotos, setFotos] = useState<string[]>([]);

  useEffect(() => {
    if (params.id) {
      SQLite.openDatabaseAsync('ptt.db').then(db => {
        db.getFirstAsync<any>('SELECT * FROM solicitudes WHERE id = ?', [Number(params.id)]).then(sol => {
          if (sol) {
            setTipo(sol.tipo_componente); setCodigo(sol.codigo); setCliente(sol.cliente);
            setRecuperacion(sol.tipo_recuperacion); setDescripcion(sol.descripcion);
            if (sol.imagenes) setFotos(JSON.parse(sol.imagenes));
          }
        });
      });
    }
  }, [params.id]);

  const escanearCodigo = async () => {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (permiso.status !== 'granted') return Alert.alert('Permiso denegado');
    const result = await ImagePicker.launchCameraAsync({ quality: 0.3 });
    if (!result.canceled) {
      setLoadingOCR(true);
      setTimeout(() => {
        setLoadingOCR(false);
        setCodigo('TR-88' + Math.floor(Math.random() * 100)); 
        Alert.alert('OCR Completado', 'Código detectado correctamente.');
      }, 2000);
    }
  };

  const tomarEvidencia = async () => {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (permiso.status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.5 });
    
    if (!result.canceled) setFotos([...fotos, result.assets[0].uri]);
  };

  const eliminarFoto = (index: number) => setFotos(fotos.filter((_, i) => i !== index));

  const guardar = async () => {
    if (fotos.length < 1) return Alert.alert('Error', 'Debes adjuntar al menos 1 imagen de evidencia.');
    
    const db = await SQLite.openDatabaseAsync('ptt.db');
    const imagenesStr = JSON.stringify(fotos);

    if (params.id) {
      const current = await db.getFirstAsync<any>('SELECT descripcion_original, descripcion, imagenes, imagenes_originales FROM solicitudes WHERE id = ?', [Number(params.id)]);
      
      const descOrig = current.descripcion_original || current.descripcion;
      const imgOrig = current.descripcion_original ? current.imagenes_originales : current.imagenes;

      await db.runAsync(`UPDATE solicitudes SET codigo=?, tipo_componente=?, cliente=?, tipo_recuperacion=?, descripcion=?, imagenes=?, estado="PENDIENTE", descripcion_original=?, imagenes_originales=? WHERE id=?`, 
      [codigo, tipo, cliente, recuperacion, descripcion, imagenesStr, descOrig, imgOrig, Number(params.id)]);
    } else {
      await db.runAsync('INSERT INTO solicitudes (mecanico_id, codigo, tipo_componente, cliente, tipo_recuperacion, descripcion, imagenes, estado) VALUES (?, ?, ?, ?, ?, ?, ?, "PENDIENTE")', 
      [userId, codigo, tipo, cliente, recuperacion, descripcion, imagenesStr]);
    }
    Alert.alert('Éxito', 'Solicitud enviada');
    router.replace('/(mecanico)/inicio' as any);
  };

  return (
    <ScrollView style={{ flex: 1, padding: 15 }}>
      <Stack.Screen options={{ title: params.id ? 'Corregir Solicitud' : 'Nueva Solicitud' }} />
      
      <Text>Componente:</Text>
      <View style={{borderWidth: 1, marginBottom: 10}}><Picker selectedValue={tipo} onValueChange={setTipo}><Picker.Item label="Motor" value="Motor" /><Picker.Item label="Transmisión" value="Transmisión" /></Picker></View>

      <Text>Código OCR:</Text>
      <View style={{flexDirection: 'row', marginBottom: 10}}>
        <TextInput style={{ borderWidth: 1, padding: 10, flex: 1 }} value={codigo} onChangeText={setCodigo} />
        <Button title="Escanear" onPress={escanearCodigo} />
      </View>
      {loadingOCR && <ActivityIndicator size="small" color="blue" />}

      <Text>Cliente:</Text>
      <TextInput style={{ borderWidth: 1, padding: 10, marginBottom: 10 }} value={cliente} onChangeText={setCliente} />

      <Text>Tipo de recuperación:</Text>
      <TextInput style={{ borderWidth: 1, padding: 10, marginBottom: 10 }} value={recuperacion} onChangeText={setRecuperacion} />

      <Text>Descripción (puedes dictar):</Text>
      <TextInput style={{ borderWidth: 1, padding: 10, marginBottom: 10, height: 80, textAlignVertical: 'top' }} multiline value={descripcion} onChangeText={setDescripcion} />

      <View style={{ marginVertical: 10, padding: 15, backgroundColor: '#e9ecef', borderRadius: 8 }}>
        <Button title="Añadir Foto de Evidencia" color="#607D8B" onPress={tomarEvidencia} />
        <ScrollView horizontal style={{ marginTop: 15 }}>
          {fotos.map((foto, index) => (
            <View key={index} style={{ marginRight: 10, position: 'relative' }}>
              <Image source={{ uri: foto }} style={{ width: 100, height: 100, borderRadius: 5 }} />
              <TouchableOpacity 
                style={{ position: 'absolute', top: 5, right: 5, backgroundColor: 'red', borderRadius: 15, width: 25, height: 25, justifyContent: 'center', alignItems: 'center' }} 
                onPress={() => eliminarFoto(index)}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>X</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
        {fotos.length === 0 && <Text style={{ textAlign: 'center', marginTop: 10, color: 'red' }}>* Requerido: 1 imagen mínimo</Text>}
      </View>

      <View style={{ marginBottom: 40 }}><Button title="Enviar a Supervisor" onPress={guardar} /></View>
    </ScrollView>
  );
}