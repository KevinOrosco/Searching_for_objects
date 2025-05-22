import React, { useState } from 'react';
import { View, Button, Image, Text, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Buffer } from 'buffer';
import { analizarImagen } from './analizarImagen'; // función separada

global.Buffer = Buffer; // Necesario para que Buffer funcione en React Native

export default function App() {
  const [image, setImage] = useState(null);
  const [resultados, setResultados] = useState(null);

  const tomarFoto = async () => {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      alert("Se necesita permiso para usar la cámara");
      return;
    }

    const imagen = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.8,
    });

    if (!imagen.cancelled) {
      setImage(imagen.uri);
      const base64String = imagen.base64;
      const buffer = Buffer.from(base64String, 'base64');

      const resultado = await analizarImagen(buffer);
      setResultados(resultado);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Button title="Tomar Foto" onPress={tomarFoto} />
      {image && <Image source={{ uri: image }} style={{ width: 300, height: 300, marginTop: 20 }} />}
      {resultados && (
        <View style={{ marginTop: 20 }}>
          <Text>Objetos detectados:</Text>
          {Object.entries(resultados).map(([objeto, cantidad]) => (
            <Text key={objeto}>{`${objeto}: ${cantidad}`}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
