import React, { useState } from 'react';
import { View, Text, Button, Alert, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import * as Location from 'expo-location';

const CAFES_MOCK = [
  { id: '1', nome: 'Café Literário Centro', lat: -21.3889, lon: -42.6956 },
  { id: '2', nome: 'Coworking dos Poetas', lat: -21.3912, lon: -42.6912 },
  { id: '3', nome: 'Expresso & Prosa', lat: -21.4001, lon: -42.7001 }
];

function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; 
}

export default function MapaCafes() {
  const [localizacao, setLocalizacao] = useState<Location.LocationObject | null>(null);
  const [cafesProximos, setCafesProximos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(false);

  async function encontrarCafes() {
    setCarregando(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Ops!', 'Precisamos da permissão do navegador para achar os locais.');
      setCarregando(false);
      return;
    }

    let posicaoAtual = await Location.getCurrentPositionAsync({});
    setLocalizacao(posicaoAtual);

    const minhaLat = posicaoAtual.coords.latitude;
    const minhaLon = posicaoAtual.coords.longitude;

    const resultados = CAFES_MOCK.map(cafe => {
      const distancia = calcularDistancia(minhaLat, minhaLon, cafe.lat, cafe.lon);
      return { ...cafe, distanciaKm: distancia };
    });

    resultados.sort((a, b) => a.distanciaKm - b.distanciaKm);
    setCafesProximos(resultados);
    setCarregando(false);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cantos e Contos ☕📚</Text>
      <Button title="Buscar Mesas Próximas" onPress={encontrarCafes} color="#8b5a2b" />
      {carregando && <ActivityIndicator size="large" color="#8b5a2b" style={{ marginTop: 20 }} />}
      {localizacao && !carregando && (
        <View style={styles.resultadoContainer}>
          <Text style={styles.subtitulo}>Sua Localização Atual (Pelo PC):</Text>
          <Text style={styles.texto}>Lat: {localizacao.coords.latitude.toFixed(4)}</Text>
          <Text style={styles.texto}>Lon: {localizacao.coords.longitude.toFixed(4)}</Text>
          <Text style={[styles.subtitulo, { marginTop: 20 }]}>Cafés Encontrados:</Text>
          {cafesProximos.map(cafe => (
             <View key={cafe.id} style={styles.cardCafe}>
               <Text style={styles.nomeCafe}>{cafe.nome}</Text>
               <Text style={styles.texto}>📍 a {cafe.distanciaKm.toFixed(2)} km de distância</Text>
             </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', padding: 20, backgroundColor: '#fdf5e6', paddingTop: 50 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#3e2723' },
  subtitulo: { fontSize: 18, fontWeight: 'bold', color: '#5d4037', marginBottom: 5 },
  texto: { fontSize: 16, color: '#4e342e' },
  resultadoContainer: { marginTop: 20, width: '100%', alignItems: 'center' },
  cardCafe: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginVertical: 8, width: '90%', shadowColor: '#000', elevation: 3 },
  nomeCafe: { fontSize: 18, fontWeight: 'bold', color: '#8b5a2b' }
});