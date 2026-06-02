// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, FlatList, Alert, ScrollView, ActivityIndicator, Modal, TextInput, Image, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { COLORS } from './theme';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen'; // <-- AQUI ESTAVA O ERRO! Agora está com o nome exato do seu arquivo.
import ProfileScreen from './ProfileScreen';

const USER_IMAGE = require('./assets/icone-gato.jpg');
const TODAS_MESAS = ['Mesa 1', 'Mesa 2', 'Mesa 3', 'Mesa 4', 'Mesa 5', 'Mesa 6', 'Mesa 7', 'Mesa 8'];
const CATEGORIAS_FIXAS = ['Todos', 'Coworking', 'Café Literário'];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [currentUser, setCurrentUser] = useState(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');

  const [listaEspacos, setListaEspacos] = useState([]);
  const [filtroAtivo, setFiltroAtivo] = useState('Todos');
  const [espacoSelecionado, setEspacoSelecionado] = useState(null);
  const [cardapioEspaco, setCardapioEspaco] = useState([]);
  const [carregandoCardapio, setCarregandoCardapio] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [statusCadastro, setStatusCadastro] = useState('ocioso');
  const [statusLogin, setStatusLogin] = useState('ocioso');
  
  const [mostrandoAgendamento, setMostrandoAgendamento] = useState(false);
  const [dataReserva, setDataReserva] = useState('');
  const [horaReserva, setHoraReserva] = useState('');
  const [mesaSelecionada, setMesaSelecionada] = useState(null);
  const [mesasOcupadas, setMesasOcupadas] = useState([]); 
  const [observacao, setObservacao] = useState('');
  const [agendamentosDoUsuario, setAgendamentosDoUsuario] = useState([]);
  const [itensPreEncomendados, setItensPreEncomendados] = useState([]);

  const mostrarAviso = (titulo, msg) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n${msg}`);
    } else {
      Alert.alert(titulo, msg);
    }
  };

  const getFontSize = (baseSize) => baseSize;

  const aplicarMascaraData = (valor) => {
    if (!valor) return '';
    let v = valor.replace(/\D/g, ''); 
    if (v.length > 2 && v.length <= 4) v = v.replace(/^(\d{2})(\d)/, '$1/$2');
    else if (v.length > 4) v = v.replace(/^(\d{2})(\d{2})(\d)/, '$1/$2/$3');
    return v;
  };

  const aplicarMascaraHora = (valor) => {
    if (!valor) return '';
    let v = valor.replace(/\D/g, ''); 
    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/, '$1:$2');
    return v;
  };

  const validarDataReserva = (dataStr) => {
    const partes = dataStr.split('/');
    if (partes.length !== 3) return false;
    const [dia, mes, ano] = partes;
    const dataObj = new Date(ano, mes - 1, dia);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const seisMeses = new Date();
    seisMeses.setMonth(hoje.getMonth() + 6);
    return dataObj >= hoje && dataObj <= seisMeses;
  };

  const timeToMins = (timeStr) => {
    if (!timeStr || !timeStr.includes(':')) return NaN;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const carregarMesasOcupadas = async (data, hora) => {
    if (!data || !hora || hora.length < 5 || !espacoSelecionado) return;
    try {
      const { data: reservas, error } = await supabase
        .from('reservas')
        .select('mesa, hora_reserva, status')
        .eq('espaco_id', espacoSelecionado.id)
        .eq('data_reserva', data)
        .not('status', 'eq', 'Cancelado')
        .not('mesa', 'is', null);
      
      if (error) { setMesasOcupadas([]); return; }
      
      const requestedMins = timeToMins(hora);
      if (isNaN(requestedMins)) { setMesasOcupadas([]); return; }

      const ocupadas = new Set();
      reservas?.forEach(r => {
        const resMins = timeToMins(r.hora_reserva);
        if (!isNaN(resMins) && Math.abs(requestedMins - resMins) < 60) {
          ocupadas.add(r.mesa);
        }
      });
      setMesasOcupadas(Array.from(ocupadas));
    } catch (error) {
      setMesasOcupadas([]);
    }
  };

  const aumentarQuantidadePre = (produto) => {
    setItensPreEncomendados(prev => {
      const existe = prev.find(item => item.id === produto.id);
      if (existe) return prev.map(item => item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item);
      return [...prev, { ...produto, quantidade: 1 }];
    });
  };

  const diminuirQuantidadePre = (produtoId) => {
    setItensPreEncomendados(prev => {
      const existe = prev.find(item => item.id === produtoId);
      if (!existe) return prev;
      if (existe.quantidade === 1) return prev.filter(item => item.id !== produtoId);
      return prev.map(item => item.id === produtoId ? { ...item, quantidade: item.quantidade - 1 } : item);
    });
  };

  const agendarEspaco = async () => {
    if (!currentUser?.id) { mostrarAviso('Atenção', 'Faça login para agendar.'); setCurrentScreen('login'); return; }
    if (!dataReserva || !horaReserva || !mesaSelecionada) { mostrarAviso('Erro', 'Preencha data, hora e selecione uma mesa.'); return; }
    if (!validarDataReserva(dataReserva)) { mostrarAviso('Data Inválida', 'A data deve ser válida e estar no prazo de até 6 meses.'); return; }

    setSalvando(true);
    try {
      const resumoPreEncomenda = itensPreEncomendados.map(item => `${item.quantidade}x ${item.nome}`).join(', ');
      const observacaoCompleta = resumoPreEncomenda ? `Pré-encomenda: ${resumoPreEncomenda}. ${observacao ? 'Obs: ' + observacao : ''}` : observacao || '';

      const { error } = await supabase.from('reservas').insert([{
        user_id: currentUser.id, espaco_id: espacoSelecionado.id, status: 'Agendado',
        data_reserva: dataReserva, hora_reserva: horaReserva, mesa: mesaSelecionada, observacao: observacaoCompleta,
      }]);

      if (error) throw error;

      mostrarAviso('Agendado! 🎉', `Sua ${mesaSelecionada} para ${dataReserva} às ${horaReserva} foi confirmada!`);
      setMostrandoAgendamento(false);
      setDataReserva(''); setHoraReserva(''); setMesaSelecionada(null); setObservacao(''); setMesasOcupadas([]); setItensPreEncomendados([]);
      await carregarAgendamentos();
    } catch (error) { mostrarAviso('Erro', error.message); } finally { setSalvando(false); }
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !nomeUsuario.trim()) { 
      mostrarAviso('Atenção', 'Preencha Nome, E-mail e Senha.'); 
      return; 
    }
    
    setStatusCadastro('carregando');
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      
      if (authError) throw authError;
      
      if (authData?.user) {
        const { error: dbError } = await supabase.from('perfis').insert({ 
          id: authData.user.id, 
          nome_usuario: nomeUsuario, 
          rua, 
          numero, 
          bairro, 
          cidade 
        });
        
        if (dbError) throw dbError;

        setStatusCadastro('sucesso');
        setCurrentUser({ id: authData.user.id, email: authData.user.email, avatar: USER_IMAGE });
        mostrarAviso('Bem-vindo!', 'Sua conta foi criada com sucesso.');
        setCurrentScreen('home');
      }
    } catch (error) { 
      setStatusCadastro('erro'); 
      mostrarAviso('Erro no Cadastro', error.message || 'Erro desconhecido ao tentar cadastrar.');
      setTimeout(() => setStatusCadastro('ocioso'), 3000); 
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) { mostrarAviso('Atenção', 'Preencha e-mail e senha.'); return; }
    setStatusLogin('carregando');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      setCurrentUser({ id: data.user.id, email: data.user.email, avatar: USER_IMAGE });
      const { data: perfilData } = await supabase.from('perfis').select('*').eq('id', data.user.id).single();
      
      if (perfilData) { 
        setNomeUsuario(perfilData.nome_usuario || ''); 
        setRua(perfilData.rua || ''); 
        setNumero(perfilData.numero || ''); 
        setBairro(perfilData.bairro || ''); 
        setCidade(perfilData.cidade || ''); 
      }
      
      setStatusLogin('ocioso');
      setCurrentScreen('home');
    } catch (error) { 
      setStatusLogin('erro'); 
      mostrarAviso('Erro no Login', 'E-mail ou senha incorretos.');
      setTimeout(() => setStatusLogin('ocioso'), 3000); 
    }
  };

  const handleSalvarPerfil = async () => {
    if (!nomeUsuario.trim()) { mostrarAviso('Atenção', 'Nome obrigatório.'); return; }
    setSalvando(true);
    try {
      await supabase.from('perfis').upsert({ id: currentUser.id, nome_usuario: nomeUsuario, rua, numero, bairro, cidade });
      mostrarAviso('Sucesso', 'Perfil atualizado com sucesso!');
      setCurrentScreen('home');
    } catch (err) { mostrarAviso('Erro', err.message); } finally { setSalvando(false); }
  };

  const carregarEspacos = async () => {
    const { data } = await supabase.from('espacos').select('*');
    if (data) setListaEspacos(data);
  };

  const abrirEspaco = async (espaco) => {
    setEspacoSelecionado(espaco); setCardapioEspaco([]); setItensPreEncomendados([]); setCarregandoCardapio(true); setCurrentScreen('detalhe');
    const { data } = await supabase.from('produtos').select('*').eq('espaco_id', espaco.id).order('nome');
    setCardapioEspaco(data || []); setCarregandoCardapio(false);
  };

  const carregarAgendamentos = async () => {
    if (!currentUser?.id) return;
    const { data } = await supabase.from('reservas').select('*, espacos(nome)').eq('user_id', currentUser.id).order('created_at', { ascending: false });
    setAgendamentosDoUsuario(data || []);
  };

  const irParaCadastro = () => {
    setEmail(''); setPassword(''); setNomeUsuario(''); setRua(''); setNumero(''); setBairro(''); setCidade('');
    setCurrentScreen('cadastro');
  };

  const irParaLogin = () => {
    setEmail(''); setPassword('');
    setCurrentScreen('login');
  };

  useEffect(() => {
    if (currentScreen === 'splash') { const timer = setTimeout(() => setCurrentScreen('login'), 2500); return () => clearTimeout(timer); }
  }, [currentScreen]);

  useEffect(() => {
    if (currentScreen === 'home') carregarEspacos();
    if (currentScreen === 'profile') carregarAgendamentos();
  }, [currentScreen]);

  useEffect(() => {
    if (dataReserva && horaReserva && espacoSelecionado && horaReserva.length >= 5) {
      carregarMesasOcupadas(dataReserva, horaReserva);
    }
  }, [dataReserva, horaReserva, espacoSelecionado]);

  if (currentScreen === 'splash') return <View style={[styles.container, { backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center' }]}><Text style={{ fontSize: 44, fontWeight: 'bold', color: COLORS.secondary }}>Cantos e Contos</Text></View>;

  if (currentScreen === 'login') return <SafeAreaView style={styles.container}><LoginScreen email={email} setEmail={setEmail} password={password} setPassword={setPassword} showPassword={showPassword} setShowPassword={setShowPassword} handleLogin={handleLogin} statusLogin={statusLogin} goToSignUp={irParaCadastro} /></SafeAreaView>;

  if (currentScreen === 'cadastro') return <SafeAreaView style={styles.container}><SignUpScreen email={email} setEmail={setEmail} password={password} setPassword={setPassword} showPassword={showPassword} setShowPassword={setShowPassword} nomeUsuario={nomeUsuario} setNomeUsuario={setNomeUsuario} rua={rua} setRua={setRua} numero={numero} setNumero={setNumero} bairro={bairro} setBairro={setBairro} cidade={cidade} setCidade={setCidade} handleSignUp={handleSignUp} statusCadastro={statusCadastro} goToLogin={irParaLogin} /></SafeAreaView>;

  if (currentScreen === 'profile') return <SafeAreaView style={styles.container}><ProfileScreen currentUser={currentUser} setCurrentUser={setCurrentUser} nomeUsuario={nomeUsuario} setNomeUsuario={setNomeUsuario} rua={rua} setRua={setRua} numero={numero} setNumero={setNumero} bairro={bairro} setBairro={setBairro} cidade={cidade} setCidade={setCidade} getFontSize={getFontSize} handleSalvarPerfil={handleSalvarPerfil} onVoltar={() => setCurrentScreen('home')} salvando={salvando} setCurrentScreen={setCurrentScreen} agendamentos={agendamentosDoUsuario} onRefresh={carregarAgendamentos} setEmail={setEmail} setPassword={setPassword} /></SafeAreaView>;

  if (currentScreen === 'detalhe' && espacoSelecionado) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backButton}><Text style={styles.backButtonText}>← Voltar</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentScreen('profile')}><Image source={USER_IMAGE} style={styles.headerAvatar} /></TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}>
          <View style={styles.detalheHero}>
            <View style={{ width: 90, height: 90, backgroundColor: COLORS.secondary, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 14 }}><Text style={{ fontSize: 40 }}>📖</Text></View>
            <Text style={{ fontWeight: 'bold', fontSize: getFontSize(24), color: COLORS.accent, textAlign: 'center' }}>{espacoSelecionado.nome}</Text>
            <TouchableOpacity style={{ padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 15, width: '100%', backgroundColor: COLORS.primary }} onPress={() => setMostrandoAgendamento(true)}>
              <Text style={{ color: COLORS.white, fontWeight: 'bold', fontSize: getFontSize(16) }}>📅 Agendar + Pré-encomendar</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontWeight: 'bold', fontSize: getFontSize(18), marginTop: 28, marginBottom: 12, color: COLORS.accent }}>📜 Cardápio</Text>
          
          {carregandoCardapio ? <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} /> : cardapioEspaco.map((item) => {
            const itemPreEncomendado = itensPreEncomendados.find(i => i.id === item.id);
            const qtd = itemPreEncomendado ? itemPreEncomendado.quantidade : 0;
            return (
              <View key={item.id.toString()} style={styles.productCard}>
                <View style={{ width: 70, height: 70, backgroundColor: COLORS.secondary, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 }}><Text style={{ fontSize: 32 }}>☕</Text></View>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={{ fontWeight: 'bold', color: COLORS.accent, fontSize: getFontSize(16) }}>{item.nome}</Text>
                  <Text style={{ color: COLORS.primary, fontWeight: 'bold', marginTop: 3 }}>R$ {parseFloat(item.preco || 0).toFixed(2)}</Text>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: COLORS.white, alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.lightGray }}>
                    <TouchableOpacity onPress={() => diminuirQuantidadePre(item.id)} style={{ width: 30, height: 30, justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 18, color: COLORS.primary }}>−</Text>
                    </TouchableOpacity>
                    <Text style={{ fontWeight: 'bold', fontSize: 15, paddingHorizontal: 10 }}>{qtd}</Text>
                    <TouchableOpacity onPress={() => aumentarQuantidadePre(item)} style={{ width: 30, height: 30, justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 18, color: COLORS.primary }}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <Modal visible={mostrandoAgendamento} animationType="slide" transparent={true} onRequestClose={() => setMostrandoAgendamento(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' }}>
              <ScrollView>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 20, color: COLORS.accent }}>📅 Finalizar Agendamento</Text>
                  <TouchableOpacity onPress={() => setMostrandoAgendamento(false)}><Text style={{ fontSize: 24 }}>×</Text></TouchableOpacity>
                </View>

                <Text style={{ color: COLORS.accent, fontWeight: '600', marginTop: 15 }}>Data (DD/MM/AAAA)</Text>
                <TextInput 
                  style={styles.modalInput} 
                  placeholder="Ex: 01/06/2026" 
                  value={dataReserva} 
                  onChangeText={(texto) => {
                    const formatado = aplicarMascaraData(texto);
                    setDataReserva(formatado);
                    setMesaSelecionada(null);
                    setMesasOcupadas([]);
                  }} 
                  keyboardType="numeric" 
                  maxLength={10} 
                />

                <Text style={{ color: COLORS.accent, fontWeight: '600', marginTop: 15 }}>Horário (HH:MM)</Text>
                <TextInput 
                  style={styles.modalInput} 
                  placeholder="Ex: 13:00" 
                  value={horaReserva} 
                  onChangeText={(texto) => {
                    const formatado = aplicarMascaraHora(texto);
                    setHoraReserva(formatado);
                    if(formatado.length < 5) {
                      setMesaSelecionada(null);
                      setMesasOcupadas([]);
                    }
                  }} 
                  keyboardType="numeric" 
                  maxLength={5} 
                />
                <Text style={{ color: COLORS.secondary, fontSize: 12, marginTop: 4 }}>⚠️ A reserva expira exatamente em 1h.</Text>

                <Text style={{ color: COLORS.accent, fontWeight: '600', marginTop: 15, marginBottom: 5 }}>Escolha uma mesa</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {TODAS_MESAS.map((mesa) => {
                    const ocupada = mesasOcupadas.includes(mesa);
                    const selecionada = mesaSelecionada === mesa;
                    return (
                      <TouchableOpacity
                        key={mesa}
                        disabled={ocupada}
                        style={{
                          paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginRight: 10, borderWidth: 2,
                          backgroundColor: ocupada ? COLORS.lightGray : selecionada ? COLORS.primary : COLORS.sectionBg,
                          borderColor: selecionada ? COLORS.primary : COLORS.lightGray
                        }}
                        onPress={() => setMesaSelecionada(mesa)}
                      >
                        <Text style={{ fontSize: 14, fontWeight: '600', color: ocupada ? COLORS.gray : selecionada ? COLORS.white : COLORS.accent }}>
                          {mesa} {ocupada ? '(Ocupada)' : ''}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <Text style={{ color: COLORS.accent, fontWeight: '600', marginTop: 15 }}>Observação (opcional)</Text>
                <TextInput style={[styles.modalInput, { height: 60 }]} value={observacao} onChangeText={setObservacao} multiline />

                <TouchableOpacity style={{ padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 20, backgroundColor: (dataReserva && horaReserva && mesaSelecionada) ? COLORS.primary : COLORS.gray }} onPress={agendarEspaco} disabled={salvando || !(dataReserva && horaReserva && mesaSelecionada)}>
                  <Text style={{ color: COLORS.white, fontWeight: 'bold', fontSize: 16 }}>✅ Confirmar Agendamento</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  const espacosFiltrados = listaEspacos.filter(e => filtroAtivo === 'Todos' || e.categoria === filtroAtivo);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={{ fontWeight: 'bold', fontSize: getFontSize(22), color: COLORS.accent }}>Cantos e Contos</Text>
        <TouchableOpacity onPress={() => setCurrentScreen('profile')}><Image source={USER_IMAGE} style={styles.headerAvatar} /></TouchableOpacity>
      </View>
      <FlatList
        data={espacosFiltrados}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        ListHeaderComponent={() => (
          <View>
            <Text style={{ fontWeight: 'bold', fontSize: getFontSize(26), color: COLORS.accent, paddingTop: 20 }}>Olá, {nomeUsuario || 'Leitor'}!</Text>
            <ScrollView horizontal style={{ marginVertical: 16 }} showsHorizontalScrollIndicator={false}>
              {CATEGORIAS_FIXAS.map((cat) => (
                <TouchableOpacity key={cat} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: filtroAtivo === cat ? COLORS.primary : COLORS.sectionBg, marginRight: 8 }} onPress={() => setFiltroAtivo(cat)}>
                  <Text style={{ color: filtroAtivo === cat ? COLORS.white : COLORS.gray, fontWeight: '600' }}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.productCardHome} onPress={() => abrirEspaco(item)}>
             <View style={{ width: 75, height: 75, backgroundColor: COLORS.secondary, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: 36 }}>📖</Text></View>
             <View style={{ flex: 1, marginLeft: 15, justifyContent: 'center' }}>
               <Text style={{ fontWeight: 'bold', color: COLORS.accent, fontSize: getFontSize(16) }}>{item.nome}</Text>
               <Text style={{ color: COLORS.primary, marginTop: 4, fontWeight: '500' }}>{item.categoria}</Text>
             </View>
          </TouchableOpacity>
        )}
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
  productCard: { flexDirection: 'row', backgroundColor: COLORS.sectionBg, padding: 15, borderRadius: 16, marginBottom: 15 },
  productCardHome: { flexDirection: 'row', backgroundColor: COLORS.sectionBg, padding: 15, borderRadius: 16, marginBottom: 15 },
  modalInput: { backgroundColor: COLORS.sectionBg, padding: 15, borderRadius: 12, fontSize: 15, marginTop: 5 },
});