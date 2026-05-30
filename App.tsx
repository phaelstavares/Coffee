import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';

import { COLORS } from './theme';
import LoginScreen from './LoginScreen';
import ProfileScreen from './ProfileScreen';

const USER_IMAGE: ImageSourcePropType = require('./assets/icone-gato.jpg');

// Interfaces para Tipagem do Projeto
export interface Perfil {
  id: string;
  nome_usuario: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  coords?: string | null;
}

export interface Espaco {
  id: number;
  nome: string;
  categoria: string;
  descricao?: string;
}

export interface Produto {
  id: number;
  espaco_id: number;
  nome: string;
  preco: number;
  descricao?: string;
}

export interface ItemPreEncomenda extends Produto {
  quantidade: number;
}

export interface Reserva {
  id: number;
  user_id: string;
  espaco_id: number;
  status: 'Agendado' | 'Cancelado';
  data_reserva: string;
  hora_reserva: string;
  mesa?: string;
  observacao?: string;
  created_at: string;
  espacos?: {
    nome: string;
  };
}

export interface UsuarioLogado {
  id: string;
  email?: string;
  avatar: ImageSourcePropType;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<string>('splash');
  const [currentUser, setCurrentUser] = useState<UsuarioLogado | null>(null);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [listaEspacos, setListaEspacos] = useState<Espaco[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState<string>('Todos');
  const [espacoSelecionado, setEspacoSelecionado] = useState<Espaco | null>(null);
  const [cardapioEspaco, setCardapioEspaco] = useState<Produto[]>([]);
  const [carregandoCardapio, setCarregandoCardapio] = useState<boolean>(false);

  const [nomeUsuario, setNomeUsuario] = useState<string>('');
  const [rua, setRua] = useState<string>('');
  const [numero, setNumero] = useState<string>('');
  const [bairro, setBairro] = useState<string>('');
  const [cidade, setCidade] = useState<string>('');

  const [salvando, setSalvando] = useState<boolean>(false);
  const [statusCadastro, setStatusCadastro] = useState<string>('ocioso');
  const [statusLogin, setStatusLogin] = useState<string>('ocioso');

  const [fontSizeMode, setFontSizeMode] = useState<string>('padrao');
  const [notificacoesAtivas, setNotificacoesAtivas] = useState<boolean>(true);
  
  const [mostrandoAgendamento, setMostrandoAgendamento] = useState<boolean>(false);
  const [dataReserva, setDataReserva] = useState<string>('');
  const [horaReserva, setHoraReserva] = useState<string>('');
  const [mesaSelecionada, setMesaSelecionada] = useState<string | null>(null);
  const [mesasDisponiveis, setMesasDisponiveis] = useState<string[]>([]);
  const [observacao, setObservacao] = useState<string>('');
  const [agendamentosDoUsuario, setAgendamentosDoUsuario] = useState<Reserva[]>([]);
  
  const [itensPreEncomendados, setItensPreEncomendados] = useState<ItemPreEncomenda[]>([]);

  const obterCoordenadasGps = async (): Promise<{ latitude: number; longitude: number } | null> => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return null;

      let local = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return local.coords;
    } catch (e) {
      console.log("Erro ao capturar GPS:", e);
      return null;
    }
  };

  const getFontSize = (baseSize: number): number => {
    if (fontSizeMode === 'media') return baseSize * 1.2;
    if (fontSizeMode === 'grande') return baseSize * 1.4;
    return baseSize;
  };

  const validarDataReserva = (dataStr: string): boolean => {
    const partes = dataStr.split('/');
    if (partes.length !== 3) return false;
    const [dia, mes, ano] = partes.map(Number);
    const dataObj = new Date(ano, mes - 1, dia);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const seisMeses = new Date();
    seisMeses.setMonth(hoje.getMonth() + 6);
    return dataObj >= hoje && dataObj <= seisMeses;
  };

  const carregarMesasDisponiveis = async (data: string, hora: string) => {
    if (!data || !hora || !espacoSelecionado) return;
    try {
      const { data: reservas, error } = await supabase
        .from('reservas')
        .select('mesa')
        .eq('espaco_id', espacoSelecionado.id)
        .eq('data_reserva', data)
        .eq('hora_reserva', hora)
        .not('mesa', 'is', null);
      
      if (error) {
        console.error('Erro mesas:', error);
        setMesasDisponiveis([]);
        return;
      }
      
      const mesasOcupadas = new Set(reservas?.map((r: any) => r.mesa) || []);
      const todasMesas = ['Mesa 1', 'Mesa 2', 'Mesa 3', 'Mesa 4', 'Mesa 5', 'Mesa 6', 'Mesa 7', 'Mesa 8'];
      setMesasDisponiveis(todasMesas.filter(m => !mesasOcupadas.has(m)));
    } catch (error) {
      setMesasDisponiveis([]);
    }
  };

  const togglePreEncomenda = (produto: Produto) => {
    setItensPreEncomendados(prev => {
      const existe = prev.find(item => item.id === produto.id);
      if (existe) {
        return prev.filter(item => item.id !== produto.id);
      }
      return [...prev, { ...produto, quantidade: 1 }];
    });
  };

  const aumentarQuantidadePre = (produtoId: number) => {
    setItensPreEncomendados(prev =>
      prev.map(item =>
        item.id === produtoId
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      )
    );
  };

  const diminuirQuantidadePre = (produtoId: number) => {
    setItensPreEncomendados(prev =>
      prev.map(item =>
        item.id === produtoId
          ? { ...item, quantidade: Math.max(1, item.quantidade - 1) }
          : item
      )
    );
  };

  const getResumoPreEncomenda = (): string => {
    if (itensPreEncomendados.length === 0) return '';
    return itensPreEncomendados.map(item => 
      `${item.quantidade}x ${item.nome}`
    ).join(', ');
  };

  const agendarEspaco = async () => {
    if (!currentUser?.id || !espacoSelecionado) {
      Alert.alert('Atenção', 'Faça login para agendar.');
      setCurrentScreen('login');
      return;
    }
    
    if (!dataReserva || !horaReserva || !mesaSelecionada) {
      Alert.alert('Erro', 'Preencha data, hora e selecione uma mesa.');
      return;
    }
    
    if (!validarDataReserva(dataReserva)) {
      Alert.alert('Data Inválida', 'Reserva até 6 meses.');
      return;
    }

    setSalvando(true);
    try {
      const resumoPreEncomenda = getResumoPreEncomenda();
      const observacaoCompleta = resumoPreEncomenda 
        ? `Pré-encomenda: ${resumoPreEncomenda}. ${observacao ? 'Obs: ' + observacao : ''}`
        : observacao || '';

      const { error } = await supabase.from('reservas').insert([
        {
          user_id: currentUser.id,
          espaco_id: espacoSelecionado.id,
          status: 'Agendado',
          data_reserva: dataReserva,
          hora_reserva: horaReserva,
          mesa: mesaSelecionada,
          observacao: observacaoCompleta,
        },
      ]);

      if (error) throw error;

      Alert.alert(
        'Agendado! 🎉',
        `${itensPreEncomendados.length > 0 ? `Pré-encomendado: ${resumoPreEncomenda}\n\n` : ''}` +
        `Sua ${mesaSelecionada} para ${dataReserva} às ${horaReserva}!\n\n` +
        `⚠️ PAGAMENTO NO LOCAL\n` +
        `A comida será preparada APÓS você chegar.`
      );
      
      setMostrandoAgendamento(false);
      setDataReserva('');
      setHoraReserva('');
      setMesaSelecionada(null);
      setObservacao('');
      setMesasDisponiveis([]);
      setItensPreEncomendados([]);
      
      await carregarAgendamentos();
      
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setSalvando(false);
    }
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
        const gps = await obterCoordenadasGps();
        const pontoGeografico = gps ? `POINT(${gps.longitude} ${gps.latitude})` : null;

        await supabase.from('perfis').insert({
          id: authData.user.id,
          nome_usuario: nomeUsuario,
          rua, numero, bairro, cidade,
          coords: pontoGeografico
        });
        setStatusCadastro('sucesso');
        setCurrentUser({ id: authData.user.id, email: authData.user.email ?? undefined, avatar: USER_IMAGE });
        Alert.alert('Conta Criada! 🎉', `Bem-vindo, ${nomeUsuario}!`);
        setCurrentScreen('home');
      }
    } catch (error: any) {
      setStatusCadastro('erro');
      Alert.alert('Erro', error.message);
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
      if (data?.user) {
        setCurrentUser({ id: data.user.id, email: data.user.email ?? undefined, avatar: USER_IMAGE });
        await buscarPerfil(data.user.id);
        setStatusLogin('ocioso');
        setCurrentScreen('home');
      }
    } catch (error) {
      setStatusLogin('erro');
      Alert.alert('Erro', 'E-mail ou senha incorretos.');
      setTimeout(() => setStatusLogin('ocioso'), 3000);
    }
  };

  const buscarPerfil = async (userId: string) => {
    const { data } = await supabase.from('perfis').select('*').eq('id', userId).single();
    if (data) {
      setNomeUsuario(data.nome_usuario || '');
      setRua(data.rua || '');
      setNumero(data.numero || '');
      setBairro(data.bairro || '');
      setCidade(data.cidade || '');
    }
  };

  const handleSalvarPerfil = async () => {
    if (!nomeUsuario.trim() || !currentUser) {
      Alert.alert('Erro', 'Nome obrigatório.');
      return;
    }
    setSalvando(true);
    try {
      const gps = await obterCoordenadasGps();
      const pontoGeografico = gps ? `POINT(${gps.longitude} ${gps.latitude})` : null;

      await supabase.from('perfis').upsert({
        id: currentUser.id,
        nome_usuario: nomeUsuario,
        rua, numero, bairro, cidade,
        coords: pontoGeografico,
      });
      Alert.alert('Sucesso', 'Perfil atualizado com sua localização atual!');
      setCurrentScreen('home');
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setSalvando(false);
    }
  };

  const carregarEspacos = async () => {
    const { data } = await supabase.from('espacos').select('*');
    if (data) setListaEspacos(data as Espaco[]);
  };

  const abrirEspaco = async (espaco: Espaco) => {
    setEspacoSelecionado(espaco);
    setCardapioEspaco([]);
    setItensPreEncomendados([]);  
    setCarregandoCardapio(true);
    setCurrentScreen('detalhe');
    const { data } = await supabase.from('produtos').select('*').eq('espaco_id', espaco.id).order('nome');
    setCardapioEspaco((data as Produto[]) || []);
    setCarregandoCardapio(false);
  };

  const getEndereco = (): string => {
    if (!rua) return '';
    return `${rua}${numero ? ', ' + numero : ''}${bairro ? ' - ' + bairro : ''}`;
  };

  const carregarAgendamentos = async () => {
    if (!currentUser?.id) return;
    const { data } = await supabase
      .from('reservas')
      .select('*, espacos(nome)')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });
    setAgendamentosDoUsuario((data as Reserva[]) || []);
  };

  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => setCurrentScreen('login'), 2500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  useEffect(() => {
    if (currentScreen === 'home') carregarEspacos();
    if (currentScreen === 'profile') carregarAgendamentos();
  }, [currentScreen]);

  useEffect(() => {
    if (dataReserva && horaReserva && espacoSelecionado) {
      carregarMesasDisponiveis(dataReserva, horaReserva);
    }
  }, [dataReserva, horaReserva, espacoSelecionado]);

  if (currentScreen === 'splash') {
    return (
      <View style={[styles.container, { backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar style="light" />
        <Text style={{ fontSize: 44, fontWeight: 'bold', color: COLORS.secondary }}>Cantos e Contos</Text>
        <Text style={{ color: COLORS.white, marginTop: 12 }}>Seu cantinho favorito te espera</Text>
      </View>
    );
  }

  if (currentScreen === 'login') {
    return (
      <SafeAreaView style={styles.container}>
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
          statusCadastro={statusCadastro} statusLogin={statusLogin}
        />
      </SafeAreaView>
    );
  }

  if (currentScreen === 'profile') {
    return (
      <ProfileScreen
        currentUser={currentUser}
        nomeUsuario={nomeUsuario} setNomeUsuario={setNomeUsuario}
        rua={rua} setRua={setRua}
        numero={numero} setNumero={setNumero}
        bairro={bairro} setBairro={setBairro}
        cidade={cidade} setCidade={setCidade}
        notificacoesAtivas={notificacoesAtivas} setNotificacoesAtivas={setNotificacoesAtivas}
        fontSizeMode={fontSizeMode} setFontSizeMode={setFontSizeMode}
        getFontSize={getFontSize}
        handleSalvarPerfil={handleSalvarPerfil}
        onVoltar={() => setCurrentScreen('home')}
        salvando={salvando}
        handleLogout={() => { setCurrentUser(null); setCurrentScreen('login'); }}
        agendamentos={agendamentosDoUsuario}
        setCurrentScreen={setCurrentScreen}
      />
    );
  }

  if (currentScreen === 'detalhe' && espacoSelecionado) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentScreen('profile')}>
            <Image source={USER_IMAGE} style={styles.headerAvatar} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}>
          <View style={styles.detalheHero}>
            <View style={{ width: 90, height: 90, backgroundColor: COLORS.secondary, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ fontSize: 40 }}>📖</Text>
            </View>
            <Text style={{ fontWeight: 'bold', fontSize: getFontSize(24), color: COLORS.accent, textAlign: 'center' }}>{espacoSelecionado.nome}</Text>
            <Text style={{ color: COLORS.primary, fontWeight: '600', marginTop: 4 }}>{espacoSelecionado.categoria}</Text>
            {espacoSelecionado.descricao && <Text style={{ color: COLORS.gray, textAlign: 'center', marginTop: 8 }}>{espacoSelecionado.descricao}</Text>}
            
            <TouchableOpacity
              style={{ padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 15, width: '100%', backgroundColor: '#8B4513' }}
              onPress={() => {
                if (!currentUser) {
                  Alert.alert('Atenção', 'Faça login para agendar.');
                  setCurrentScreen('login');
                  return;
                }
                setMostrandoAgendamento(true);
              }}
            >
              <Text style={{ color: COLORS.white, fontWeight: 'bold', fontSize: getFontSize(16) }}>
                📅 Agendar + Pré-encomendar
              </Text>
            </TouchableOpacity>
            
            {itensPreEncomendados.length > 0 && (
              <View style={{ backgroundColor: '#E3F2FD', padding: 10, borderRadius: 8, marginTop: 10, alignItems: 'center' }}>
                <Text style={{ color: COLORS.primary, fontWeight: '600', fontSize: 14 }}>
                  ✅ {itensPreEncomendados.length} item(ns) pré-encomendado(s)
                </Text>
              </View>
            )}
          </View>

          <Text style={{ fontWeight: 'bold', fontSize: getFontSize(18), marginTop: 28, marginBottom: 12, color: COLORS.accent }}>
            📜 Cardápio (Toc para pré-encomendar - Pagamento no local)
          </Text>

          {carregandoCardapio ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : cardapioEspaco.length === 0 ? (
            <Text style={{ color: COLORS.gray, textAlign: 'center', marginTop: 20 }}>Nenhum item.</Text>
          ) : (
            cardapioEspaco.map((item) => {
              const estaEncomendado = itensPreEncomendados.find(i => i.id === item.id);
              return (
                <View key={item.id.toString()} style={styles.productCard}>
                  <TouchableOpacity
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => togglePreEncomenda(item)}
                  >
                    <View style={{ width: 70, height: 70, backgroundColor: COLORS.secondary, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 }}>
                      <Text style={{ fontSize: 32 }}>{item.nome.includes('Livro') ? '📚' : item.nome.includes('COMBO') ? '🎁' : '☕'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontWeight: 'bold', color: COLORS.accent, fontSize: getFontSize(16), flex: 1 }}>{item.nome}</Text>
                        <View style={{ 
                          width: 24, 
                          height: 24, 
                          borderRadius: 12, 
                          borderWidth: 2, 
                          borderColor: estaEncomendado ? COLORS.primary : COLORS.gray, 
                          backgroundColor: estaEncomendado ? COLORS.primary : COLORS.white,
                          justifyContent: 'center', 
                          alignItems: 'center',
                          marginLeft: 10
                        }}>
                          {estaEncomendado && <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: 'bold' }}>✓</Text>}
                        </View>
                      </View>
                      <Text style={{ color: COLORS.primary, fontWeight: 'bold', marginTop: 3 }}>R$ {item.preco.toFixed(2)}</Text>
                      {item.descricao && <Text style={{ color: COLORS.gray, fontSize: 12 }} numberOfLines={2}>{item.descricao}</Text>}
                      <Text style={{ color: COLORS.gray, fontSize: 11, fontStyle: 'italic', marginTop: 5 }}>
                        {estaEncomendado ? '✅ Toc para remover' : '📝 Toc para pré-encomendar'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  
                  {estaEncomendado && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.lightGray }}>
                      <Text style={{ color: COLORS.gray, fontSize: 12 }}>Qtd:</Text>
                      <TouchableOpacity onPress={() => diminuirQuantidadePre(item.id)} style={{ backgroundColor: COLORS.sectionBg, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 18 }}>−</Text>
                      </TouchableOpacity>
                      <Text style={{ fontWeight: 'bold', fontSize: 15 }}>{estaEncomendado.quantidade}</Text>
                      <TouchableOpacity onPress={() => aumentarQuantidadePre(item.id)} style={{ backgroundColor: COLORS.sectionBg, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 18 }}>+</Text>
                      </TouchableOpacity>
                      <Text style={{ color: COLORS.primary, fontWeight: 'bold', marginLeft: 10 }}>
                        Total: R$ {(item.preco * estaEncomendado.quantidade).toFixed(2)}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>

        <Modal visible={mostrandoAgendamento} animationType="slide" transparent={true} onRequestClose={() => setMostrandoAgendamento(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray }}>
                <Text style={{ fontWeight: 'bold', fontSize: 20, color: COLORS.accent }}>📅 Agendar + Pré-encomendar</Text>
                <TouchableOpacity onPress={() => setMostrandoAgendamento(false)}>
                  <Text style={{ fontSize: 24 }}>×</Text>
                </TouchableOpacity>
              </View>

              {itensPreEncomendados.length > 0 ? (
                <>
                  <Text style={{ color: COLORS.accent, fontWeight: '600', marginTop: 15, fontSize: 16 }}>🛒 Pré-encomendas:</Text>
                  <ScrollView style={{ maxHeight: 150 }}>
                    {itensPreEncomendados.map((item) => (
                      <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: '600', color: COLORS.accent }}>{item.quantidade}x {item.nome}</Text>
                          <Text style={{ color: COLORS.primary, fontSize: 13 }}>R$ {(item.preco * item.quantidade).toFixed(2)}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <TouchableOpacity onPress={() => diminuirQuantidadePre(item.id)} style={{ backgroundColor: COLORS.sectionBg, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>−</Text>
                          </TouchableOpacity>
                          <Text style={{ fontWeight: 'bold', fontSize: 15 }}>{item.quantidade}</Text>
                          <TouchableOpacity onPress={() => aumentarQuantidadePre(item.id)} style={{ backgroundColor: COLORS.sectionBg, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                  
                  <View style={{ backgroundColor: '#FFF3E0', padding: 12, borderRadius: 8, marginTop: 12 }}>
                    <Text style={{ color: '#E65100', fontWeight: '600', fontSize: 13 }}>⚠️ PAGAMENTO NO LOCAL</Text>
                    <Text style={{ color: '#E65100', fontSize: 12, marginTop: 4 }}>
                      A comida será preparada APÓS você chegar no estabelecimento.
                    </Text>
                  </View>
                </>
              ) : (
                <View style={{ backgroundColor: '#E3F2FD', padding: 15, borderRadius: 10, marginTop: 20, alignItems: 'center' }}>
                  <Text style={{ fontSize: 30 }}>📝</Text>
                  <Text style={{ color: COLORS.gray, textAlign: 'center', marginTop: 10, fontSize: 14 }}>
                    Pré-encomende comidas/livros para agilizar!
                  </Text>
                  <Text style={{ color: COLORS.gray, textAlign: 'center', fontSize: 12, marginTop: 5 }}>
                    (Opcional — pode pedir no local também)
                  </Text>
                </View>
              )}

              <Text style={{ color: COLORS.accent, fontWeight: '600', marginTop: 15 }}>Data (máx 6 meses)</Text>
              <TextInput
                style={{ backgroundColor: COLORS.sectionBg, padding: 15, borderRadius: 12, fontSize: 15, marginTop: 5 }}
                placeholder="DD/MM/AAAA"
                value={dataReserva}
                onChangeText={(t) => { setDataReserva(t); setMesaSelecionada(null); setMesasDisponiveis([]); }}
                keyboardType="numeric"
                maxLength={10}
              />

              <Text style={{ color: COLORS.accent, fontWeight: '600', marginTop: 15 }}>Horário</Text>
              <TextInput
                style={{ backgroundColor: COLORS.sectionBg, padding: 15, borderRadius: 12, fontSize: 15, marginTop: 5 }}
                placeholder="HH:MM"
                value={horaReserva}
                onChangeText={(t) => { setHoraReserva(t); setMesaSelecionada(null); setMesasDisponiveis([]); }}
                keyboardType="numeric"
                maxLength={5}
              />

              <Text style={{ color: COLORS.accent, fontWeight: '600', marginTop: 15 }}>Escolha uma mesa</Text>
              {mesasDisponiveis.length === 0 && dataReserva && horaReserva ? (
                <Text style={{ color: COLORS.gray, fontStyle: 'italic', marginTop: 5 }}>Preencha data e hora</Text>
              ) : mesasDisponiveis.length === 0 ? (
                <Text style={{ color: COLORS.gray, fontStyle: 'italic', marginTop: 5 }}>Nenhuma mesa ainda</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 5 }}>
                  {mesasDisponiveis.map((mesa) => (
                    <TouchableOpacity
                      key={mesa}
                      style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: mesaSelecionada === mesa ? COLORS.primary : COLORS.sectionBg, marginRight: 10, borderWidth: 2, borderColor: mesaSelecionada === mesa ? COLORS.primary : COLORS.lightGray }}
                      onPress={() => setMesaSelecionada(mesa)}
                    >
                      <Text style={{ fontSize: 14, color: mesaSelecionada === mesa ? COLORS.white : COLORS.gray, fontWeight: '600' }}>{mesa}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <Text style={{ color: COLORS.accent, fontWeight: '600', marginTop: 15 }}>Observação (opcional)</Text>
              <TextInput
                style={{ backgroundColor: COLORS.sectionBg, padding: 15, borderRadius: 12, fontSize: 15, height: 60, marginTop: 5 }}
                placeholder="Ex: Aniversário, alérgico..."
                value={observacao}
                onChangeText={setObservacao}
                multiline
              />

              <TouchableOpacity
                style={{ padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 20, backgroundColor: (dataReserva && horaReserva && mesaSelecionada) ? COLORS.primary : COLORS.gray, opacity: (dataReserva && horaReserva && mesaSelecionada) ? 1 : 0.5 }}
                onPress={agendarEspaco}
                disabled={salvando || !(dataReserva && horaReserva && mesaSelecionada)}
              >
                <Text style={{ color: COLORS.white, fontWeight: 'bold', fontSize: 16 }}>
                  {salvando ? 'Agendando...' : `✅ Agendar ${itensPreEncomendados.length > 0 ? '+ Pré-encomendar' : ''}`}
                </Text>
              </TouchableOpacity>
              
              <Text style={{ color: '#E65100', textAlign: 'center', marginTop: 12, fontSize: 11, fontStyle: 'italic' }}>
                ⚠️ Pagamento feito no local após chegar
              </Text>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  const categorias = ['Todos', ...new Set(listaEspacos.map(e => e.categoria).filter(Boolean))];
  const espacosFiltrados = listaEspacos.filter(e => filtroAtivo === 'Todos' || e.categoria === filtroAtivo);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={{ fontWeight: 'bold', fontSize: getFontSize(22), color: COLORS.accent }}>Cantos e Contos</Text>
          <Text style={{ color: COLORS.primary, fontSize: getFontSize(12), marginTop: 2 }}>{getEndereco() || '📍 Sem endereço'}</Text>
        </View>
        <TouchableOpacity onPress={() => setCurrentScreen('profile')}>
          <Image source={USER_IMAGE} style={styles.headerAvatar} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={espacosFiltrados}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        ListHeaderComponent={() => (
          <View>
            <View style={{ paddingTop: 20 }}>
              <Text style={{ fontWeight: 'bold', fontSize: getFontSize(26), color: COLORS.accent }}>Olá, {nomeUsuario || 'Leitor'}!</Text>
              <Text style={{ color: COLORS.gray, marginTop: 4 }}>Qual cantinho combina com hoje?</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ paddingRight: 10 }}>
              {categorias.map((cat) => (
                <TouchableOpacity key={cat} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: filtroAtivo === cat ? COLORS.primary : COLORS.sectionBg, marginRight: 8 }} onPress={() => setFiltroAtivo(cat)}>
                  <Text style={{ color: filtroAtivo === cat ? COLORS.white : COLORS.gray, fontWeight: '500', fontSize: 13 }}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={{ fontWeight: 'bold', fontSize: getFontSize(18), marginBottom: 15, color: COLORS.accent }}>Espaços Disponíveis</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity style={{ flexDirection: 'row', backgroundColor: COLORS.sectionBg, padding: 15, borderRadius: 16, marginBottom: 15 }} onPress={() => abrirEspaco(item)}>
            <View style={{ width: 75, height: 75, backgroundColor: COLORS.secondary, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 36 }}>{item.categoria?.includes('Literário') ? '📖' : '💼'}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 15, justifyContent: 'center' }}>
              <Text style={{ fontWeight: 'bold', color: COLORS.accent, fontSize: getFontSize(16) }}>{item.nome}</Text>
              {item.categoria && <Text style={{ color: COLORS.primary, fontWeight: '600', marginTop: 2, fontSize: 12 }}>{item.categoria}</Text>}
              {item.descricao && <Text style={{ color: COLORS.gray, fontSize: 12 }} numberOfLines={2}>{item.descricao}</Text>}
              <Text style={{ color: COLORS.primary, fontWeight: '600', marginTop: 6, fontSize: 12 }}>Ver cardápio →</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => <Text style={{ color: COLORS.gray, textAlign: 'center', marginTop: 40 }}>Nenhum espaço.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  backButton: { paddingVertical: 4, paddingRight: 12 },
  backButtonText: { color: COLORS.primary, fontWeight: '600', fontSize: 15 },
  headerAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: COLORS.secondary },
  detalheHero: { alignItems: 'center', paddingVertical: 24 },
  productCard: { flexDirection: 'row', backgroundColor: COLORS.sectionBg, padding: 15, borderRadius: 16, marginBottom: 12 },
});