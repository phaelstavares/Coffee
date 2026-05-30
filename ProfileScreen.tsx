import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from './theme';
import { supabase } from './supabase';
import { Reserva, UsuarioLogado } from './App';

const USER_IMAGE = require('./assets/icone-gato.jpg');

interface ProfileScreenProps {
  currentUser: UsuarioLogado | null;
  nomeUsuario: string;
  setNomeUsuario: (text: string) => void;
  rua: string;
  setRua: (text: string) => void;
  numero: string;
  setNumero: (text: string) => void;
  bairro: string;
  setBairro: (text: string) => void;
  cidade: string;
  setCidade: (text: string) => void;
  notificacoesAtivas: boolean;
  setNotificacoesAtivas: (value: boolean) => void;
  fontSizeMode: string;
  setFontSizeMode: (mode: string) => void;
  getFontSize: (size: number) => number;
  handleSalvarPerfil: () => Promise<void>;
  onVoltar: () => void;
  salvando: boolean;
  handleLogout: () => void;
  agendamentos: Reserva[];
  setCurrentScreen: (screen: string) => void;
}

export default function ProfileScreen({
  currentUser,
  nomeUsuario, setNomeUsuario,
  rua, setRua,
  numero, setNumero,
  bairro, setBairro,
  cidade, setCidade,
  notificacoesAtivas, setNotificacoesAtivas,
  fontSizeMode, setFontSizeMode,
  getFontSize,
  handleSalvarPerfil,
  onVoltar,
  salvando,
  agendamentos = [],
  setCurrentScreen,
}: ProfileScreenProps) {
  
  const handleLogoutAction = async () => {
    Alert.alert('Sair da Conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Sair', 
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            setNomeUsuario('');
            setRua('');
            setNumero('');
            setBairro('');
            setCidade('');
            
            if (setCurrentScreen) {
              setCurrentScreen('login');
            }
            
            Alert.alert('Sucesso', 'Você saiu!');
          } catch (error: any) {
            Alert.alert('Erro', error.message);
          }
        }
      }
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={onVoltar} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: getFontSize(22) }]}>Meu Perfil</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.profileHeader}>
        <Image source={USER_IMAGE} style={styles.avatar} />
        <Text style={[styles.userName, { fontSize: getFontSize(22) }]}>
          {nomeUsuario || 'Visitante'}
        </Text>
        <Text style={[styles.userEmail, { fontSize: getFontSize(14) }]}>
          {currentUser?.email || ''}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { fontSize: getFontSize(18) }]}>Informações Pessoais</Text>
        
        <Text style={[styles.label, { fontSize: getFontSize(14) }]}>Nome *</Text>
        <TextInput
          style={[styles.input, { fontSize: getFontSize(15) }]}
          placeholder="Seu nome"
          value={nomeUsuario}
          onChangeText={setNomeUsuario}
        />

        <Text style={[styles.label, { fontSize: getFontSize(14) }]}>E-mail</Text>
        <TextInput
          style={[styles.input, { fontSize: getFontSize(15), backgroundColor: COLORS.lightGray }]}
          value={currentUser?.email || ''}
          editable={false}
        />

        <Text style={[styles.sectionLabel, { fontSize: getFontSize(18), marginTop: 24 }]}>Endereço</Text>

        <Text style={[styles.label, { fontSize: getFontSize(14) }]}>Rua</Text>
        <TextInput style={[styles.input, { fontSize: getFontSize(15) }]} value={rua} onChangeText={setRua} />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.label, { fontSize: getFontSize(14) }]}>Número</Text>
            <TextInput style={[styles.input, { fontSize: getFontSize(15) }]} value={numero} onChangeText={setNumero} keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { fontSize: getFontSize(14) }]}>Bairro</Text>
            <TextInput style={[styles.input, { fontSize: getFontSize(15) }]} value={bairro} onChangeText={setBairro} />
          </View>
        </View>

        <Text style={[styles.label, { fontSize: getFontSize(14) }]}>Cidade</Text>
        <TextInput style={[styles.input, { fontSize: getFontSize(15) }]} value={cidade} onChangeText={setCidade} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { fontSize: getFontSize(18) }]}>Preferências</Text>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { fontSize: getFontSize(15) }]}>Notificações</Text>
          <Switch 
            value={notificacoesAtivas} 
            onValueChange={setNotificacoesAtivas} 
            trackColor={{ false: COLORS.gray, true: COLORS.primary }} 
            thumbColor={notificacoesAtivas ? COLORS.white : COLORS.gray} 
          />
        </View>
        <Text style={[styles.label, { fontSize: getFontSize(14), marginTop: 16 }]}>Tamanho da Fonte</Text>
        <View style={styles.fontSizeRow}>
          {['padrao', 'media', 'grande'].map((size) => (
            <TouchableOpacity 
              key={size} 
              style={[styles.fontSizeOption, fontSizeMode === size && styles.fontSizeOptionActive]} 
              onPress={() => setFontSizeMode(size)}
            >
              <Text style={[
                styles.fontSizeText, 
                fontSizeMode === size && styles.fontSizeTextActive, 
                { fontSize: size === 'padrao' ? 14 : size === 'media' ? 17 : 20 }
              ]}>
                {size === 'padrao' ? 'A' : size === 'media' ? 'A+' : 'A++'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { fontSize: getFontSize(18) }]}>Meus Agendamentos</Text>
        
        {agendamentos.length === 0 ? (
          <View style={styles.emptyAgendamentos}>
            <Text style={{ fontSize: 40 }}>📅</Text>
            <Text style={{ color: COLORS.gray, textAlign: 'center', marginTop: 10 }}>
              Você não tem agendamentos ainda.
            </Text>
            <Text style={{ color: COLORS.gray, textAlign: 'center', fontSize: 13 }}>
              Agende uma mesa no cardápio!
            </Text>
          </View>
        ) : (
          agendamentos.map((reserva) => (
            <View key={reserva.id} style={styles.agendamentoCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.agendamentoNome, { fontSize: getFontSize(16) }]}>
                  {reserva.espacos?.nome || 'Espaço'}
                </Text>
                <View style={[
                  styles.statusBadge, 
                  reserva.status === 'Agendado' && { backgroundColor: '#E8F5E9' },
                  reserva.status === 'Cancelado' && { backgroundColor: '#FFEBEE' }
                ]}>
                  <Text style={[
                    styles.statusText, 
                    reserva.status === 'Agendado' && { color: '#2E7D32' },
                    reserva.status === 'Cancelado' && { color: '#C62828' }
                  ]}>
                    {reserva.status || 'Agendado'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.agendamentoData, { fontSize: getFontSize(13) }]}>
                {reserva.data_reserva || new Date(reserva.created_at).toLocaleDateString('pt-BR')}
                {reserva.hora_reserva ? ' às ' + reserva.hora_reserva : ''}
              </Text>
              {reserva.mesa && (
                <Text style={[styles.agendamentoData, { fontSize: getFontSize(13) }]}>
                  {reserva.mesa}
                </Text>
              )}
              {reserva.observacao && (
                <Text style={[styles.agendamentoObs, { fontSize: getFontSize(12) }]}>
                  Obs: {reserva.observacao}
                </Text>
              )}
            </View>
          ))
        )}
      </View>

      <TouchableOpacity 
        style={[styles.saveButton, salvando && { opacity: 0.6 }]} 
        onPress={handleSalvarPerfil} 
        disabled={salvando}
      >
        <Text style={styles.saveButtonText}>
          {salvando ? 'Salvando...' : 'Salvar Perfil'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogoutAction}
      >
        <Text style={styles.logoutButtonText}>Sair da Conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  headerTitle: { fontWeight: 'bold', color: COLORS.accent },
  backButton: { paddingVertical: 4, paddingRight: 12 },
  backButtonText: { color: COLORS.primary, fontWeight: '600', fontSize: 15 },
  profileHeader: { alignItems: 'center', paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: COLORS.secondary },
  userName: { fontWeight: 'bold', color: COLORS.accent, marginTop: 12 },
  userEmail: { color: COLORS.gray, marginTop: 4 },
  section: { padding: 20 },
  sectionLabel: { fontWeight: 'bold', color: COLORS.accent, marginBottom: 12 },
  label: { color: COLORS.accent, fontWeight: '600', marginTop: 12, fontSize: 14 },
  input: { backgroundColor: COLORS.sectionBg, padding: 15, borderRadius: 12, fontSize: 15, color: COLORS.textDark },
  row: { flexDirection: 'row', marginTop: 12 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  settingLabel: { color: COLORS.textDark },
  fontSizeRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  fontSizeOption: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: COLORS.sectionBg, borderWidth: 2, borderColor: COLORS.lightGray },
  fontSizeOptionActive: { borderColor: COLORS.primary, backgroundColor: '#E3F2FD' },
  fontSizeText: { fontWeight: 'bold', color: COLORS.gray },
  fontSizeTextActive: { color: COLORS.primary },
  saveButton: { backgroundColor: COLORS.primary, margin: 20, padding: 16, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  logoutButton: { backgroundColor: '#FFEBEE', margin: 20, marginTop: 0, padding: 16, borderRadius: 12, alignItems: 'center' },
  logoutButtonText: { color: '#C62828', fontWeight: 'bold', fontSize: 16 },
  emptyAgendamentos: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  agendamentoCard: { backgroundColor: COLORS.sectionBg, padding: 16, borderRadius: 12, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  agendamentoNome: { fontWeight: 'bold', color: COLORS.accent },
  agendamentoData: { color: COLORS.gray, marginTop: 6, fontSize: 12 },
  agendamentoObs: { color: COLORS.gray, marginTop: 4, fontSize: 12, fontStyle: 'italic' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontWeight: 'bold', fontSize: 12 },
});