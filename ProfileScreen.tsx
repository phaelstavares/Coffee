// @ts-nocheck
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, Modal, Platform, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from './theme';
import { supabase } from './supabase';

const USER_IMAGE = require('./assets/icone-gato.jpg');

export default function ProfileScreen({
  currentUser, nomeUsuario, setNomeUsuario, rua, setRua, numero, setNumero, bairro, setBairro, cidade, setCidade,
  getFontSize, handleSalvarPerfil, onVoltar, salvando, agendamentos = [], setCurrentScreen, setCurrentUser, onRefresh,
  setEmail, setPassword
}) {
  
  const [modalConfirma, setModalConfirma] = useState({ visivel: false, tipo: '', id: null, titulo: '', mensagem: '' });

  const abrirConfirmacaoSair = () => {
    setModalConfirma({ visivel: true, tipo: 'sair', id: null, titulo: 'Sair da Conta', mensagem: 'Tem certeza que deseja sair do aplicativo?' });
  };

  const abrirConfirmacaoCancelar = (reservaId) => {
    setModalConfirma({ visivel: true, tipo: 'cancelar', id: reservaId, titulo: 'Cancelar Reserva', mensagem: 'Tem certeza que deseja cancelar esta reserva?' });
  };

  const executarAcaoModal = async () => {
    try {
      if (modalConfirma.tipo === 'sair') {
        await supabase.auth.signOut();
        setCurrentUser(null);
        setEmail('');
        setPassword('');
        setNomeUsuario('');
        setCurrentScreen('login');
      } else if (modalConfirma.tipo === 'cancelar') {
        await supabase.from('reservas').update({ status: 'Cancelado' }).eq('id', modalConfirma.id);
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.log('Erro na ação:', error);
    } finally {
      setModalConfirma({ visivel: false, tipo: '', id: null, titulo: '', mensagem: '' });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={onVoltar} style={styles.backButton}><Text style={styles.backButtonText}>← Voltar</Text></TouchableOpacity>
          <Text style={[styles.headerTitle, { fontSize: getFontSize(22) }]}>Meu Perfil</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.profileHeader}>
          <Image source={USER_IMAGE} style={styles.avatar} />
          <Text style={[styles.userName, { fontSize: getFontSize(22) }]}>{nomeUsuario || 'Visitante'}</Text>
          <Text style={[styles.userEmail, { fontSize: getFontSize(14) }]}>{currentUser?.email || ''}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { fontSize: getFontSize(18) }]}>🎟️ Meus Cupons</Text>
          <View style={styles.couponCard}>
            <Text style={{ fontSize: 24, marginRight: 10 }}>🏷️</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 'bold', color: COLORS.accent }}>Primeiro Café Literário</Text>
              <Text style={{ color: COLORS.gray, fontSize: 12 }}>10% OFF no seu primeiro agendamento</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { fontSize: getFontSize(18) }]}>📅 Histórico de Agendamentos</Text>
          {agendamentos.length === 0 ? (
            <View style={styles.emptyAgendamentos}>
              <Text style={{ fontSize: 40 }}>📚</Text>
              <Text style={{ color: COLORS.gray, textAlign: 'center', marginTop: 10 }}>Nenhum histórico encontrado.</Text>
            </View>
          ) : (
            agendamentos.map((reserva) => (
              <View key={reserva.id} style={styles.agendamentoCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.agendamentoNome, { fontSize: getFontSize(16) }]}>{reserva.espacos?.nome || 'Espaço'}</Text>
                  <View style={[styles.statusBadge, reserva.status === 'Agendado' ? { backgroundColor: '#E8F5E9' } : { backgroundColor: '#FFEBEE' }]}>
                    <Text style={[styles.statusText, reserva.status === 'Agendado' ? { color: '#2E7D32' } : { color: '#C62828' }]}>{reserva.status || 'Agendado'}</Text>
                  </View>
                </View>
                <Text style={[styles.agendamentoData, { fontSize: getFontSize(13) }]}>{reserva.data_reserva} às {reserva.hora_reserva}</Text>
                {reserva.mesa && <Text style={[styles.agendamentoData, { fontSize: getFontSize(13), fontWeight: '600' }]}>{reserva.mesa}</Text>}
                
                {reserva.status === 'Agendado' && (
                  <TouchableOpacity style={styles.cancelButton} onPress={() => abrirConfirmacaoCancelar(reserva.id)}>
                    <Text style={styles.cancelButtonText}>❌ Cancelar Reserva</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { fontSize: getFontSize(18) }]}>Informações Pessoais</Text>
          <TextInput style={[styles.input, { fontSize: getFontSize(15) }]} placeholder="Seu nome" value={nomeUsuario} onChangeText={setNomeUsuario} />
          <TextInput style={[styles.input, { fontSize: getFontSize(15), backgroundColor: COLORS.lightGray, marginTop: 10 }]} value={currentUser?.email || ''} editable={false} />
        </View>

        <TouchableOpacity style={[styles.saveButton, salvando ? { opacity: 0.6 } : {}]} onPress={handleSalvarPerfil} disabled={salvando}>
          <Text style={styles.saveButtonText}>{salvando ? 'Salvando...' : 'Salvar Perfil'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.logoutButton} onPress={abrirConfirmacaoSair}>
          <Text style={styles.logoutButtonText}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={modalConfirma.visivel} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalConfirma.titulo}</Text>
            <Text style={styles.modalMessage}>{modalConfirma.mensagem}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtnVoltar} onPress={() => setModalConfirma({ ...modalConfirma, visivel: false })}>
                <Text style={styles.modalBtnTextVoltar}>Não, voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnConfirmar} onPress={executarAcaoModal}>
                <Text style={styles.modalBtnTextConfirmar}>Sim, confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  section: { padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  sectionLabel: { fontWeight: 'bold', color: COLORS.accent, marginBottom: 12 },
  input: { backgroundColor: COLORS.sectionBg, padding: 15, borderRadius: 12, color: COLORS.textDark },
  couponCard: { flexDirection: 'row', backgroundColor: COLORS.sectionBg, padding: 16, borderRadius: 12, alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: COLORS.primary },
  saveButton: { backgroundColor: COLORS.primary, margin: 20, padding: 16, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  logoutButton: { backgroundColor: '#FFEBEE', margin: 20, marginTop: 0, padding: 16, borderRadius: 12, alignItems: 'center' },
  logoutButtonText: { color: '#C62828', fontWeight: 'bold', fontSize: 16 },
  emptyAgendamentos: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  agendamentoCard: { backgroundColor: COLORS.sectionBg, padding: 16, borderRadius: 12, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  agendamentoNome: { fontWeight: 'bold', color: COLORS.accent },
  agendamentoData: { color: COLORS.gray, marginTop: 6, fontSize: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontWeight: 'bold', fontSize: 12 },
  cancelButton: { backgroundColor: '#FFEBEE', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginTop: 10, alignItems: 'center', borderWidth: 1, borderColor: '#C62828' },
  cancelButtonText: { color: '#C62828', fontWeight: 'bold', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: COLORS.white, borderRadius: 20, padding: 24, width: '100%', maxWidth: 400, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.accent, marginBottom: 10 },
  modalMessage: { fontSize: 15, color: COLORS.gray, textAlign: 'center', marginBottom: 24 },
  modalButtons: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 12 },
  modalBtnVoltar: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: COLORS.sectionBg, alignItems: 'center' },
  modalBtnTextVoltar: { color: COLORS.accent, fontWeight: 'bold' },
  modalBtnConfirmar: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#FFEBEE', alignItems: 'center' },
  modalBtnTextConfirmar: { color: '#C62828', fontWeight: 'bold' },
});