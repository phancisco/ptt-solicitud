import TextRecognition from '@react-native-ml-kit/text-recognition';
import { Picker } from '@react-native-picker/picker';
import Voice, { SpeechErrorEvent, SpeechResultsEvent } from '@react-native-voice/voice';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Button, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getDatabaseAsync } from '../../database';

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
  
  const [isListening, setIsListening] = useState<string | null>(null);
  const activeFieldRef = useRef<string | null>(null);

  useEffect(() => {
    Voice.onSpeechEnd = () => {
      setIsListening(null);
      activeFieldRef.current = null;
    };
    
    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      setIsListening(null);
      activeFieldRef.current = null;
      // Ignorar error 7 y 6 (Significan "No match" o "Silencio", no son errores críticos)
      if (e.error?.message && !e.error.message.includes('7') && !e.error.message.includes('6')) {
        Alert.alert('Error de Voz', e.error.message);
      }
    };

    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      if (e.value && e.value.length > 0) {
        const text = e.value[0];
        const currentField = activeFieldRef.current;
        
        if (currentField === 'cliente') {
          setCliente(prev => prev ? prev + ' ' + text : text);
        } else if (currentField === 'recuperacion') {
          setRecuperacion(prev => prev ? prev + ' ' + text : text);
        } else if (currentField === 'descripcion') {
          setDescripcion(prev => prev ? prev + ' ' + text : text);
        }
      }
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  useEffect(() => {
    if (!params.id || isNaN(Number(params.id))) return;

    let isActive = true;
    const loadSolicitud = async () => {
      try {
        const db = await getDatabaseAsync();
        const sol = await db.getFirstAsync<any>('SELECT * FROM solicitudes WHERE id = ?', [Number(params.id)]);
        if (isActive && sol) {
          setTipo(sol.tipo_componente || 'Motor');
          setCodigo(sol.codigo || '');
          setCliente(sol.cliente || '');
          setRecuperacion(sol.tipo_recuperacion || '');
          setDescripcion(sol.descripcion || '');
          if (sol.imagenes) setFotos(JSON.parse(sol.imagenes));
        }
      } catch (error) {
        if (isActive) {
          Alert.alert('Error de BD', error instanceof Error ? error.message : 'No se pudo cargar la solicitud.');
        }
      }
    };

    loadSolicitud();
    return () => {
      isActive = false;
    };
  }, [params.id]);

  const escanearCodigo = async () => {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (permiso.status !== 'granted') return Alert.alert('Permiso denegado');
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    
    if (!result.canceled) {
      setLoadingOCR(true);
      try {
        const recognizedText = await TextRecognition.recognize(result.assets[0].uri);
        if (recognizedText.text) {
          setCodigo(recognizedText.text.replace(/\n/g, ' ').trim());
        } else {
          Alert.alert('OCR', 'No se detectó texto en la imagen.');
        }
      } catch (error) {
        Alert.alert('Error', 'Hubo un problema al procesar la imagen.');
      } finally {
        setLoadingOCR(false);
      }
    }
  };

  const toggleDictado = async (field: string) => {
    try {
      if (isListening) {
        await Voice.stop();
        if (isListening === field) return; 
      }
      activeFieldRef.current = field;
      setIsListening(field);
      await Voice.start('es-ES');
    } catch (e: any) {
      setIsListening(null);
      activeFieldRef.current = null;
      Alert.alert('Error Micrófono', e.message || 'No se pudo iniciar el servicio de voz de Android.');
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
    if (!userId) return Alert.alert('Sesión vencida', 'Vuelve a iniciar sesión antes de guardar.');
    
    try {
      const db = await getDatabaseAsync();
      const imagenesStr = JSON.stringify(fotos);

      const safeUserId = userId;
      const safeCodigo = String(codigo || '');
      const safeTipo = String(tipo || 'Motor');
      const safeCliente = String(cliente || '');
      const safeRecuperacion = String(recuperacion || '');
      const safeDescripcion = String(descripcion || '');
      const safeImagenes = String(imagenesStr || '[]');

      if (params.id && !isNaN(Number(params.id))) {
        const idNum = Number(params.id);
        const current = await db.getFirstAsync<any>('SELECT descripcion_original, descripcion, imagenes, imagenes_originales FROM solicitudes WHERE id = ?', [idNum]);
        
        const descOrig = String(current?.descripcion_original ?? current?.descripcion ?? '');
        const imgOrig = String(current?.descripcion_original ? current?.imagenes_originales : current?.imagenes ?? '[]');

        await db.runAsync(
          'UPDATE solicitudes SET codigo=?, tipo_componente=?, cliente=?, tipo_recuperacion=?, descripcion=?, imagenes=?, estado="PENDIENTE", descripcion_original=?, imagenes_originales=? WHERE id=?', 
          [safeCodigo, safeTipo, safeCliente, safeRecuperacion, safeDescripcion, safeImagenes, descOrig, imgOrig, idNum]
        );
      } else {
        await db.runAsync(
          'INSERT INTO solicitudes (mecanico_id, codigo, tipo_componente, cliente, tipo_recuperacion, descripcion, imagenes, estado) VALUES (?, ?, ?, ?, ?, ?, ?, "PENDIENTE")', 
          [safeUserId, safeCodigo, safeTipo, safeCliente, safeRecuperacion, safeDescripcion, safeImagenes]
        );
      }
      
      Alert.alert('Éxito', 'Solicitud enviada');
      router.replace('/(mecanico)/inicio' as any);
      
    } catch (error: any) {
      Alert.alert('Error de BD', error.message || 'Error al guardar');
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 15 }}>
      <Stack.Screen options={{ title: params.id ? 'Corregir Solicitud' : 'Nueva Solicitud' }} />
      
      <Text>Componente:</Text>
      <View style={{borderWidth: 1, marginBottom: 10}}>
        <Picker selectedValue={tipo} onValueChange={setTipo}>
          <Picker.Item label="Motor" value="Motor" />
          <Picker.Item label="Transmisión" value="Transmisión" />
        </Picker>
      </View>

      <Text>Código de Componente:</Text>
      <View style={{flexDirection: 'row', marginBottom: 10}}>
        <TextInput style={{ borderWidth: 1, padding: 10, flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 }} value={codigo} onChangeText={setCodigo} />
        <TouchableOpacity style={{ backgroundColor: '#4CAF50', justifyContent: 'center', paddingHorizontal: 20, borderWidth: 1, borderLeftWidth: 0 }} onPress={escanearCodigo}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>📸</Text>
        </TouchableOpacity>
      </View>
      {loadingOCR && <ActivityIndicator size="small" color="blue" />}

      <Text>Cliente:</Text>
      <View style={{flexDirection: 'row', marginBottom: 10}}>
        <TextInput style={{ borderWidth: 1, padding: 10, flex: 1 }} value={cliente} onChangeText={setCliente} />
        <TouchableOpacity 
          style={{ backgroundColor: isListening === 'cliente' ? '#ffcdd2' : '#e0e0e0', justifyContent: 'center', paddingHorizontal: 15, marginLeft: 5, borderRadius: 5, borderWidth: 1, borderColor: isListening === 'cliente' ? 'red' : '#ccc' }}
          onPress={() => toggleDictado('cliente')}
        >
          <Text style={{ fontSize: 18 }}>{isListening === 'cliente' ? '🔴' : '🎤'}</Text>
        </TouchableOpacity>
      </View>

      <Text>Tipo de recuperación:</Text>
      <View style={{flexDirection: 'row', marginBottom: 10}}>
        <TextInput style={{ borderWidth: 1, padding: 10, flex: 1 }} value={recuperacion} onChangeText={setRecuperacion} />
        <TouchableOpacity 
          style={{ backgroundColor: isListening === 'recuperacion' ? '#ffcdd2' : '#e0e0e0', justifyContent: 'center', paddingHorizontal: 15, marginLeft: 5, borderRadius: 5, borderWidth: 1, borderColor: isListening === 'recuperacion' ? 'red' : '#ccc' }}
          onPress={() => toggleDictado('recuperacion')}
        >
          <Text style={{ fontSize: 18 }}>{isListening === 'recuperacion' ? '🔴' : '🎤'}</Text>
        </TouchableOpacity>
      </View>

      <Text>Descripción:</Text>
      <View style={{flexDirection: 'row', marginBottom: 10}}>
        <TextInput style={{ borderWidth: 1, padding: 10, flex: 1, height: 80, textAlignVertical: 'top' }} multiline value={descripcion} onChangeText={setDescripcion} />
        <TouchableOpacity 
          style={{ backgroundColor: isListening === 'descripcion' ? '#ffcdd2' : '#e0e0e0', justifyContent: 'center', paddingHorizontal: 15, marginLeft: 5, borderRadius: 5, borderWidth: 1, borderColor: isListening === 'descripcion' ? 'red' : '#ccc' }}
          onPress={() => toggleDictado('descripcion')}
        >
          <Text style={{ fontSize: 18 }}>{isListening === 'descripcion' ? '🔴' : '🎤'}</Text>
        </TouchableOpacity>
      </View>

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
        {fotos.length === 0 && <Text style={{ textAlign: 'center', marginTop: 10, color: 'red' }}>Requerido: 1 imagen mínimo</Text>}
      </View>

      <View style={{ marginBottom: 40 }}><Button title="Enviar a Supervisor" onPress={guardar} /></View>
    </ScrollView>
  );
}