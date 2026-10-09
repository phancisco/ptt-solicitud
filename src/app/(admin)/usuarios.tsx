import { Picker } from '@react-native-picker/picker';
import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Alert, Button, FlatList, Text, TextInput, View } from 'react-native';

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('MECANICO');

  const loadUsers = async () => {
    const db = await SQLite.openDatabaseAsync('ptt.db');
    const result = await db.getAllAsync('SELECT * FROM usuarios');
    setUsuarios(result);
  };

  useEffect(() => { loadUsers(); }, []);

  const crearUsuario = async () => {
    const db = await SQLite.openDatabaseAsync('ptt.db');
    await db.runAsync('INSERT INTO usuarios (correo, password, rol) VALUES (?, ?, ?)', [correo, password, rol]);
    Alert.alert('Éxito', 'Usuario creado');
    loadUsers();
  };

  const eliminarUsuario = async (id: number) => {
    const db = await SQLite.openDatabaseAsync('ptt.db');
    await db.runAsync('DELETE FROM usuarios WHERE id = ?', [id]);
    loadUsers();
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <Text style={{ fontWeight: 'bold' }}>Crear Nuevo Usuario</Text>
      <TextInput placeholder="Correo" style={{ borderWidth: 1, marginVertical: 5, padding: 8 }} value={correo} onChangeText={setCorreo} />
      <TextInput placeholder="Contraseña" style={{ borderWidth: 1, marginVertical: 5, padding: 8 }} value={password} onChangeText={setPassword} />
      
      <View style={{ borderWidth: 1, marginVertical: 5 }}>
        <Picker selectedValue={rol} onValueChange={(itemValue) => setRol(itemValue)}>
          <Picker.Item label="MECANICO" value="MECANICO" />
          <Picker.Item label="SUPERVISOR" value="SUPERVISOR" />
          <Picker.Item label="ADMIN" value="ADMIN" />
        </Picker>
      </View>

      <Button title="Guardar Usuario" onPress={crearUsuario} />
      
      <Text style={{ fontWeight: 'bold', marginTop: 20 }}>Lista de Usuarios</Text>
      <FlatList data={usuarios} keyExtractor={i => i.id.toString()} renderItem={({item}) => (
        <View style={{ padding: 10, borderWidth: 1, marginTop: 5, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text>{item.correo} - {item.rol}</Text>
          <Button title="Eliminar" color="red" onPress={() => eliminarUsuario(item.id)} />
        </View>
      )} />
    </View>
  );
}