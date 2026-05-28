// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { supabase } from './supabase'; 
import { 
  StyleSheet, Text, View, Image, TouchableOpacity, 
  SafeAreaView, FlatList, Dimensions, Alert 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { COLORS } from './theme';
import LoginScreen from './LoginScreen';
import ProfileScreen from './ProfileScreen';

const USER_IMAGE = require('./assets/icone-gato.jpg'); 

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [currentUser, setCurrentUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [listaEspacos, setListaEspacos] = useState([]);
  const [minhasReservas, setMinhasReservas] = useState([]);
  const [filtroAtivo, setFiltroAtivo] = useState('Todos');

  const [nomeUsuario, setNomeUsuario] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  
  const [salvando, setSalvando] = useState(false);
  const [statusCadastro, setStatusCadastro] = useState('ocioso'); 
  const [statusLogin, setStatusLogin] = useState('ocioso');      

  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);
  const [fontSizeMode, setFontSizeMode] = useState('padrao');

  const getFontSize = (baseSize) => {
    if (fontSizeMode === 'media') return baseSize * 1.2;
    if (fontSizeMode === 'grande') return baseSize * 1.4;
    return baseSize;
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !nomeUsuario.trim()) {
      Alert.alert('Campos Obrigatórios', 'Preencha Nome, E-mail e Senha.');
      return;
    }
    setStatusCadastro('carregando');
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;

      if (authData?.user) {
        await supabase.from('perfis').insert({
            id: authData.user.id, nome_usuario: nomeUsuario, rua, numero, bairro, cidade
        });

        setStatusCadastro('sucesso');
        setCurrentUser({ id: authData.user.id, email: authData.user.email, avatar: USER_IMAGE });
        Alert.alert('Conta Criada!', `Bem-vindo, ${nomeUsuario}!`);
        setCurrentScreen('home');
      }
    } catch (error) {
      setStatusCadastro('erro');
      Alert.alert('Erro no Cadastro', error.message);
      setTimeout(() => setStatusCadastro('ocioso'), 3000);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Preencha e-mail e senha.');
      return;
    }
    setStatusLogin('carregando');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      setCurrentUser({ id: data.user.id, email: data.user.email, avatar: USER_IMAGE });
      await buscarPerfilExistente(data.user.id);
      await carregarReservasUsuario(data.user.id);
      setStatusLogin('ocioso');
      setCurrentScreen('home');
    } catch (error) {
      setStatusLogin('erro');
      Alert.alert('Erro no Login', 'E-mail ou senha incorretos.');
      setTimeout(() => setStatusLogin('ocioso'), 3000);
    }
  };

  const buscarPerfilExistente = async (userId) => {
    const { data } = await supabase.from('perfis').select('*').eq('id', userId).single();
    if (data) {
      if (data.nome_usuario) setNomeUsuario(data.nome_usuario);
      if (data.rua) setRua(data.rua);
      if (data.numero) setNumero(data.numero);
      if (data.bairro) setBairro(data.bairro);
      if (data.cidade) setCidade(data.cidade);
    }
  };

  const carregarEspacosDoBanco = async () => {
    const { data } = await supabase.from('espacos').select('*');
    if (data) setListaEspacos(data);
  };

  const carregarReservasUsuario = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('reservas')
        .select('*, espacos(*)')
        .eq('user_id', userId)
        .order('data_reserva', { ascending: false });
      
      if (!error && data) {
        setMinhasReservas(data);
      }
    } catch (err) {
      console.log('Erro ao buscar reservas:', err);
    }
  };

  const handleSalvarPerfil = async () => {
    if (!nomeUsuario.trim()) return Alert.alert('Erro', 'O nome não pode estar vazio.');
    setSalvando(true);
    try {
      await supabase.from('perfis').upsert({ 
          id: currentUser.id, nome_usuario: nomeUsuario, rua, numero, bairro, cidade
      });
      Alert.alert('Sucesso', 'Perfil guardado!');
      setCurrentScreen('home');
    } catch (err) {
      Alert.alert('Erro ao Guardar', err.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleReservarEspaco = (espaco) => {
    Alert.alert(
      'Confirmar Reserva',
      `Deseja reservar o espaço: ${espaco.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: async () => {
            if (!currentUser?.id) return;
            setSalvando(true);
            
            try {
              const { error } = await supabase.from('reservas').insert([
                {
                  user_id: currentUser.id,
                  espaco_id: espaco.id,
                  status: 'Agendado'
                }
              ]).select();

              if (error) {
                 Alert.alert('Erro ao salvar', error.message);
              } else {
                 Alert.alert('Sucesso', 'Reserva realizada com sucesso!');
                 await carregarReservasUsuario(currentUser.id);
              }
            } catch (err) {
              Alert.alert('Erro', err.message);
            } finally {
              setSalvando(false);
            }
        }}
      ]
    );
  };

  useEffect(() => {
    if (currentScreen === 'profile' && currentUser?.id) {
      carregarReservasUsuario(currentUser.id);
    }
  }, [currentScreen]);

  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => setCurrentScreen('login'), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  useEffect(() => {
    if (currentScreen === 'home') carregarEspacosDoBanco();
  }, [currentScreen]);

  const obterEnderecoFormatado = () => {
    if (!rua) return '';
    return `${rua}${numero ? ', ' + numero : ''}${bairro ? ' - ' + bairro : ''}`;
  };

  const espacosFiltrados = listaEspacos.filter(item => {
    if (filtroAtivo === 'Todos') return true;
    return item.categoria?.toLowerCase() === filtroAtivo.toLowerCase();
  });

  const renderProductItem = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.categoryBadgeContainer}>
          <Text style={styles.categoryBadgeText}>{item.categoria || 'Espaço'}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>⭐ 5.0</Text>
        </View>
      </View>

      <View style={styles.cardMainContent}>
        <View style={styles.productImagePlaceholder}>
          <Text style={{ fontSize: 36 }}>{item.categoria?.toLowerCase().includes('coworking') ? '💻' : '📚'}</Text>
        </View>
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { fontSize: getFontSize(17) }]}>{item.nome}</Text>
          <Text style={[styles.productPrice, { fontSize: getFontSize(15) }]}>R$ {parseFloat(item.preco || 0).toFixed(2)} / hora</Text>
          <Text style={[styles.productDesc, { fontSize: getFontSize(12) }]} numberOfLines={2}>{item.descricao}</Text>
        </View>
      </View>

      <View style={styles.amenitiesContainer}>
        <Text style={[styles.amenityTag, { fontSize: getFontSize(11) }]}>📶 Wi-Fi 5G</Text>
        <Text style={[styles.amenityTag, { fontSize: getFontSize(11) }]}>👥 Cap: {item.capacidade || '1'} pessoa(s)</Text>
      </View>

      <TouchableOpacity style={styles.reserveButton} onPress={() => handleReservarEspaco(item)} disabled={salvando}>
        <Text style={[styles.reserveButtonText, { fontSize: getFontSize(14) }]}>{salvando ? 'Processando...' : 'Reservar Espaço'}</Text>
      </TouchableOpacity>
    </View>
  );

  if (currentScreen === 'splash') {
    return (
      <View style={[styles.container, styles.splashContainer]}>
        <StatusBar style="light" />
        <Text style={styles.logoText}>FOCUS</Text>
        <Text style={styles.tagline}>Produtividade e Leitura</Text>
      </View>
    );
  }

  if (currentScreen === 'login') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <LoginScreen 
          email={email} setEmail={setEmail} password={password} setPassword={setPassword}
          showPassword={showPassword} setShowPassword={setShowPassword}
          nomeUsuario={nomeUsuario} setNomeUsuario={setNomeUsuario}
          rua={rua} setRua={setRua} numero={numero} setNumero={setNumero}
          bairro={bairro} setBairro={setBairro} cidade={cidade} setCidade={setCidade}
          handleLogin={handleLogin} handleSignUp={handleSignUp}
          statusCadastro={statusCadastro} statusLogin={statusLogin}
        />
      </SafeAreaView>
    );
  }

  if (currentScreen === 'profile') {
    return (
      <ProfileScreen 
        currentUser={currentUser} nomeUsuario={nomeUsuario} setNomeUsuario={setNomeUsuario}
        rua={rua} setRua={setRua} numero={numero} setNumero={setNumero}
        bairro={bairro} setBairro={setBairro} cidade={cidade} setCidade={setCidade}
        notificacoesAtivas={notificacoesAtivas} setNotificacoesAtivas={setNotificacoesAtivas}
        fontSizeMode={fontSizeMode} setFontSizeMode={setFontSizeMode} getFontSize={getFontSize}
        handleSalvarPerfil={handleSalvarPerfil} onVoltar={() => setCurrentScreen('home')}
        salvando={salvando} handleLogout={() => { setCurrentUser(null); setCurrentScreen('login'); }}
        minhasReservas={minhasReservas} 
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.headerTitle, { fontSize: getFontSize(22) }]}>Espaços</Text>
          {obterEnderecoFormatado() ? (
            <Text style={[styles.deliveryBadge, { fontSize: getFontSize(12) }]} numberOfLines={1}>📍 {obterEnderecoFormatado()}</Text>
          ) : (
            <Text style={[styles.deliveryBadge, { color: '#C97A7A', fontSize: getFontSize(12) }]}>📍 Sem endereço cadastrado</Text>
          )}
        </View>
        <TouchableOpacity onPress={() => setCurrentScreen('profile')}>
          <Image source={USER_IMAGE} style={styles.headerAvatar} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={espacosFiltrados}
        renderItem={renderProductItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.heroSection}>
            <Text style={[styles.heroTitle, { fontSize: getFontSize(26) }]}>Olá, {nomeUsuario || 'Cliente'}!</Text>
            <Text style={[styles.heroSubtitle, { fontSize: getFontSize(15) }]}>Onde vamos produzir hoje?</Text>
            
            <View style={styles.filterContainer}>
              {['Todos', 'Café Literário', 'Coworking'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.filterChip, filtroAtivo === cat && styles.filterChipActive]}
                  onPress={() => setFiltroAtivo(cat)}
                >
                  <Text style={[styles.filterText, { fontSize: getFontSize(13) }, filtroAtivo === cat && styles.filterTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { fontSize: getFontSize(18), marginBottom: 15 }]}>Mesas e Salas</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  splashContainer: { backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 48, fontWeight: 'bold', color: COLORS.secondary, letterSpacing: 5 },
  tagline: { color: COLORS.white, marginTop: 10, opacity: 0.8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  headerTitle: { fontWeight: 'bold', color: COLORS.accent },
  deliveryBadge: { color: COLORS.primary, marginTop: 2 },
  headerAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: COLORS.secondary },
  heroSection: { paddingTop: 20 },
  heroTitle: { fontWeight: 'bold', color: COLORS.accent },
  heroSubtitle: { color: COLORS.gray, marginTop: 4, marginBottom: 15 },
  filterContainer: { flexDirection: 'row', marginBottom: 25, marginTop: 5 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.sectionBg, marginRight: 10, borderWidth: 1, borderColor: COLORS.lightGray },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { color: COLORS.gray, fontWeight: '600' },
  filterTextActive: { color: COLORS.white },
  sectionLabel: { fontWeight: 'bold', color: COLORS.accent },
  productCard: { backgroundColor: COLORS.sectionBg, padding: 16, borderRadius: 20, marginBottom: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  categoryBadgeContainer: { backgroundColor: COLORS.secondary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryBadgeText: { fontSize: 11, color: COLORS.accent, fontWeight: 'bold' },
  ratingContainer: { backgroundColor: '#FFFEEA', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#FFE5A3' },
  ratingText: { fontSize: 12, fontWeight: 'bold', color: '#B37D00' },
  cardMainContent: { flexDirection: 'row' },
  productImagePlaceholder: { width: 70, height: 70, backgroundColor: COLORS.white, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.lightGray },
  productInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  productName: { fontWeight: 'bold', color: COLORS.accent },
  productPrice: { color: COLORS.primary, fontWeight: 'bold', marginVertical: 3 },
  productDesc: { color: COLORS.gray, lineHeight: 16 },
  amenitiesContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, borderTopWidth: 1, borderTopColor: COLORS.lightGray, paddingTop: 10 },
  amenityTag: { backgroundColor: COLORS.white, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginRight: 8, marginBottom: 5, color: COLORS.accent, fontWeight: '500', borderWidth: 1, borderColor: COLORS.lightGray },
  reserveButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 10, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 1 },
  reserveButtonText: { color: COLORS.white, fontWeight: 'bold' }
});