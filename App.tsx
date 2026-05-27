// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { supabase } from './supabase'; 
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  FlatList, 
  Dimensions, 
  Alert 
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
  const [listaCafes, setListaCafes] = useState([]);

  // Estados compartilhados de informações do usuário
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  
  // Estados de feedback de API
  const [salvando, setSalvando] = useState(false);
  const [statusCadastro, setStatusCadastro] = useState('ocioso'); // 'ocioso' | 'carregando' | 'sucesso' | 'erro'
  const [statusLogin, setStatusLogin] = useState('ocioso');      // 'ocioso' | 'carregando' | 'erro'

  // Estados de Configurações
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);
  const [fontSizeMode, setFontSizeMode] = useState('padrao');

  const getFontSize = (baseSize) => {
    if (fontSizeMode === 'media') return baseSize * 1.2;
    if (fontSizeMode === 'grande') return baseSize * 1.4;
    return baseSize;
  };

  // CADASTRO COM LOGIN AUTOMÁTICO IMEDIATO
  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !nomeUsuario.trim()) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha Nome, E-mail e Senha para prosseguir.');
      return;
    }

    setStatusCadastro('carregando');

    try {
      // 1. Cria a conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData?.user) {
        // 2. Insere os dados adicionais de endereço na tabela 'perfis'
        const { error: profileError } = await supabase
          .from('perfis')
          .insert({
            id: authData.user.id,
            nome_usuario: nomeUsuario,
            rua: rua,
            numero: numero,
            bairro: bairro,
            cidade: cidade
          });

        if (profileError) throw profileError;

        setStatusCadastro('sucesso');
        
        // 3. LOGIN AUTOMÁTICO: Seta o estado local de sessão e pula pra Home direto
        setCurrentUser({ 
          id: authData.user.id, 
          email: authData.user.email, 
          avatar: USER_IMAGE 
        });

        Alert.alert('Conta Criada! 🎉', `Bem-vindo ao Coffee Shop, ${nomeUsuario}!`);
        setCurrentScreen('home');
      }
    } catch (error) {
      setStatusCadastro('erro');
      Alert.alert('Erro no Cadastro ❌', error.message);
      setTimeout(() => setStatusCadastro('ocioso'), 3000);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Por favor, preencha e-mail e senha.');
      return;
    }
    
    setStatusLogin('carregando');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      setCurrentUser({ 
        id: data.user.id, 
        email: data.user.email, 
        avatar: USER_IMAGE 
      });
      
      await buscarPerfilExistente(data.user.id);
      setStatusLogin('ocioso');
      setCurrentScreen('home');

    } catch (error) {
      setStatusLogin('erro');
      Alert.alert('Erro no Login ❌', 'E-mail ou senha incorretos.');
      setTimeout(() => setStatusLogin('ocioso'), 3000);
    }
  };

  const buscarPerfilExistente = async (userId) => {
    const { data } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      if (data.nome_usuario) setNomeUsuario(data.nome_usuario);
      if (data.rua) setRua(data.rua);
      if (data.numero) setNumero(data.numero);
      if (data.bairro) setBairro(data.bairro);
      if (data.cidade) setCidade(data.cidade);
    }
  };

  const handleSalvarPerfil = async () => {
    if (!nomeUsuario.trim()) {
      Alert.alert('Erro', 'O nome não pode ficar vazio.');
      return;
    }
    setSalvando(true);
    try {
      const { error } = await supabase
        .from('perfis')
        .upsert({ 
          id: currentUser.id,
          nome_usuario: nomeUsuario,
          rua, numero, bairro, cidade
        });

      if (error) throw error;
      Alert.alert('Sucesso', 'Perfil atualizado!');
      setCurrentScreen('home');
    } catch (err) {
      Alert.alert('Erro ao Salvar', err.message);
    } finally {
      setSalvando(false);
    }
  };

  const carregarCafesDoBanco = async () => {
    const { data } = await supabase.from('produtos').select('*');
    if (data) setListaCafes(data);
  };

  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => setCurrentScreen('login'), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  useEffect(() => {
    if (currentScreen === 'home') carregarCafesDoBanco();
  }, [currentScreen]);

  const obterEnderecoFormatado = () => {
    if (!rua) return '';
    return `${rua}${numero ? ', ' + numero : ''}${bairro ? ' - ' + bairro : ''}`;
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productImagePlaceholder}><Text style={{ fontSize: 36 }}>☕</Text></View>
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { fontSize: getFontSize(16) }]}>{item.nome}</Text>
        <Text style={[styles.productPrice, { fontSize: getFontSize(15) }]}>R$ {parseFloat(item.preco || 0).toFixed(2)}</Text>
        <Text style={[styles.productDesc, { fontSize: getFontSize(12) }]} numberOfLines={2}>{item.descricao}</Text>
      </View>
    </View>
  );

  if (currentScreen === 'splash') {
    return (
      <View style={[styles.container, styles.splashContainer]}>
        <StatusBar style="light" />
        <Text style={styles.logoText}>COFFEE</Text>
        <Text style={styles.tagline}>O melhor grão na sua mão</Text>
      </View>
    );
  }

  if (currentScreen === 'login') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <LoginScreen 
          email={email} setEmail={setEmail}
          password={password} setPassword={setPassword}
          showPassword={showPassword} setShowPassword={setShowPassword}
          nomeUsuario={nomeUsuario} setNomeUsuario={setNomeUsuario}
          rua={rua} setRua={setRua}
          numero={numero} setNumero={setNumero}
          bairro={bairro} setBairro={setBairro}
          cidade={cidade} setCidade={setCidade}
          handleLogin={handleLogin} handleSignUp={handleSignUp}
          statusCadastro={statusCadastro}
          statusLogin={statusLogin}
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
        salvando={salvando}
        handleLogout={() => { setCurrentUser(null); setCurrentScreen('login'); }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.headerTitle, { fontSize: getFontSize(22) }]}>Coffee Shop</Text>
          {/* Removido o texto "Entregar em" mantendo o formato limpo */}
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
        data={listaCafes}
        renderItem={renderProductItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        ListHeaderComponent={() => (
          <View style={styles.heroSection}>
            <Text style={[styles.heroTitle, { fontSize: getFontSize(26) }]}>Olá, {nomeUsuario || 'Cliente'}!</Text>
            <Text style={[styles.heroSubtitle, { fontSize: getFontSize(15) }]}>Qual café combina com hoje?</Text>
            <Text style={[styles.sectionLabel, { fontSize: getFontSize(18), marginBottom: 15 }]}>Cardápio do Dia</Text>
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
  heroSubtitle: { color: COLORS.gray, marginTop: 4, marginBottom: 25 },
  productCard: { flexDirection: 'row', backgroundColor: COLORS.sectionBg, padding: 15, borderRadius: 16, marginBottom: 15 },
  productImagePlaceholder: { width: 75, height: 75, backgroundColor: COLORS.secondary, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  productInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  productName: { fontWeight: 'bold', color: COLORS.accent },
  productPrice: { color: COLORS.primary, fontWeight: 'bold', marginVertical: 3 },
  productDesc: { color: COLORS.gray, lineHeight: 16 }
});