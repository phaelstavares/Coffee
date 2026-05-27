// @ts-nocheck
import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  Switch 
} from 'react-native';
import { COLORS } from './theme';

export default function ProfileScreen({
  currentUser,
  nomeUsuario,
  setNomeUsuario,
  rua,
  setRua,
  numero,
  setNumero,
  bairro,
  setBairro,
  cidade,
  setCidade,
  notificacoesAtivas,
  setNotificacoesAtivas,
  fontSizeMode,
  setFontSizeMode,
  getFontSize,
  handleSalvarPerfil,
  handleLogout,
  onVoltar,
  salvando // Recebido do App.tsx
}) {
  const [ajudaAberta, setAjudaAberta] = useState(false);
  const [politicaAberta, setPoliticaAberta] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={styles.innerHeader}>
        <TouchableOpacity onPress={onVoltar} style={styles.backButton} disabled={salvando}>
          <Text style={[styles.backButtonText, { fontSize: getFontSize(16) }]}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={[styles.innerHeaderTitle, { fontSize: getFontSize(18) }]}>Configurações</Text>
        <View style={{ width: 60 }} /> 
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.profileScrollContainer} keyboardShouldPersistTaps="always" keyboardDismissMode="on-drag">
          
          <View style={styles.avatarWrapper}>
            <Image source={currentUser?.avatar} style={styles.largeAvatar} />
            <Text style={[styles.profileEmailText, { fontSize: getFontSize(14) }]}>{currentUser?.email}</Text>
          </View>

          {/* CARD 1: Dados Pessoais */}
          <View style={styles.configCard}>
            <Text style={[styles.cardTitle, { fontSize: getFontSize(16) }]}>👤 Dados Pessoais</Text>
            <Text style={[styles.inputLabel, { fontSize: getFontSize(13) }]}>Nome de Exibição</Text>
            <TextInput style={styles.input} value={nomeUsuario} onChangeText={setNomeUsuario} placeholder="Seu nome completo" editable={!salvando} />
          </View>

          {/* CARD 2: Endereço Detalhado para API */}
          <View style={styles.configCard}>
            <Text style={[styles.cardTitle, { fontSize: getFontSize(16) }]}>📍 Endereço de Entrega</Text>
            
            <Text style={[styles.inputLabel, { fontSize: getFontSize(13) }]}>Rua / Logradouro</Text>
            <TextInput style={styles.input} value={rua} onChangeText={setRua} placeholder="Ex: Av. Rio Branco" editable={!salvando} />

            <View style={styles.rowInputs}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.inputLabel, { fontSize: getFontSize(13) }]}>Número</Text>
                <TextInput style={styles.input} value={numero} onChangeText={setNumero} placeholder="123" keyboardType="numeric" editable={!salvando} />
              </View>
              <View style={{ flex: 2 }}>
                <Text style={[styles.inputLabel, { fontSize: getFontSize(13) }]}>Bairro</Text>
                <TextInput style={styles.input} value={bairro} onChangeText={setBairro} placeholder="Centro" editable={!salvando} />
              </View>
            </View>

            <Text style={[styles.inputLabel, { fontSize: getFontSize(13) }]}>Cidade</Text>
            <TextInput style={styles.input} value={cidade} onChangeText={setCidade} placeholder="Cidade" editable={!salvando} />
          </View>

          {/* CARD 3: Preferências e Acessibilidade */}
          <View style={styles.configCard}>
            <Text style={[styles.cardTitle, { fontSize: getFontSize(16) }]}>⚙️ Preferências do App</Text>
            
            <View style={styles.settingRow}>
              <View>
                <Text style={[styles.settingRowLabel, { fontSize: getFontSize(15) }]}>Notificações Push</Text>
                <Text style={styles.settingRowSub}>Receber avisos de café quentinho</Text>
              </View>
              <Switch 
                value={notificacoesAtivas} 
                onValueChange={setNotificacoesAtivas}
                disabled={salvando}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                thumbColor={Platform.OS === 'android' ? COLORS.white : ''}
              />
            </View>

            <View style={styles.divider} />

            <Text style={[styles.inputLabel, { fontSize: getFontSize(13), marginBottom: 10 }]}>Tamanho da Fonte (Acessibilidade)</Text>
            <View style={styles.fontSizeSelectorRow}>
              {['padrao', 'media', 'grande'].map((mode) => (
                <TouchableOpacity 
                  key={mode}
                  disabled={salvando}
                  style={[styles.fontSizeOptionButton, fontSizeMode === mode && styles.fontSizeOptionSelected]}
                  onPress={() => setFontSizeMode(mode)}
                >
                  <Text style={[
                    styles.fontSizeOptionText, 
                    fontSizeMode === mode && styles.fontSizeOptionTextSelected,
                    { fontSize: mode === 'padrao' ? 12 : mode === 'media' ? 14 : 16 }
                  ]}>
                    {mode === 'padrao' ? 'A' : mode === 'media' ? 'A+' : 'A++'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* CARD 4: Suporte Legal */}
          <View style={styles.configCard}>
            <Text style={[styles.cardTitle, { fontSize: getFontSize(16) }]}>📜 Suporte Legal</Text>

            <TouchableOpacity style={styles.accordionHeader} onPress={() => setAjudaAberta(!ajudaAberta)}>
              <Text style={[styles.accordionTitle, { fontSize: getFontSize(14) }]}>❓ Central de Ajuda</Text>
              <Text style={styles.accordionArrow}>{ajudaAberta ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {ajudaAberta && (
              <View style={styles.accordionContent}>
                <Text style={[styles.accordionBodyText, { fontSize: getFontSize(13) }]}>
                  Para dúvidas sobre entregas, pedidos cancelados ou estornos, entre em contato pelo email suporte@coffeeshop.com.
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <TouchableOpacity style={styles.accordionHeader} onPress={() => setPoliticaAberta(!politicaAberta)}>
              <Text style={[styles.accordionTitle, { fontSize: getFontSize(14) }]}>🛡️ Política de Privacidade</Text>
              <Text style={styles.accordionArrow}>{politicaAberta ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {politicaAberta && (
              <View style={styles.accordionContent}>
                <Text style={[styles.accordionBodyText, { fontSize: getFontSize(13) }]}>
                  Sua privacidade é muito importante para nós. Coletamos seus dados de endereço estritamente para entrega de produtos. Seus dados são criptografados pelo Supabase.
                </Text>
              </View>
            )}
          </View>

          <View style={{ paddingHorizontal: 5, marginTop: 10 }}>
            <TouchableOpacity 
              style={[styles.saveButton, salvando && { backgroundColor: COLORS.gray }]} 
              onPress={handleSalvarPerfil}
              disabled={salvando}
            >
              <Text style={[styles.saveButtonText, { fontSize: getFontSize(16) }]}>
                {salvando ? 'Salvando no banco...' : 'Salvar Alterações'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={salvando}>
              <Text style={[styles.logoutButtonText, { fontSize: getFontSize(15) }]}>Sair da Conta</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  innerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray, backgroundColor: COLORS.white },
  backButton: { paddingVertical: 5, paddingHorizontal: 10 },
  backButtonText: { color: COLORS.primary, fontWeight: 'bold' },
  innerHeaderTitle: { fontWeight: 'bold', color: COLORS.accent },
  profileScrollContainer: { padding: 20, paddingBottom: 40 },
  avatarWrapper: { alignItems: 'center', marginBottom: 20 },
  largeAvatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: COLORS.primary, marginBottom: 8 },
  profileEmailText: { color: COLORS.gray },
  configCard: { backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.lightGray, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardTitle: { fontWeight: 'bold', color: COLORS.accent, marginBottom: 8 },
  inputLabel: { fontWeight: 'bold', color: COLORS.accent, marginTop: 10 },
  input: { backgroundColor: COLORS.sectionBg, padding: 14, borderRadius: 12, marginTop: 4, color: COLORS.textDark },
  rowInputs: { flexDirection: 'row', marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.lightGray, marginVertical: 14 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingRowLabel: { fontWeight: '600', color: COLORS.textDark },
  settingRowSub: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  fontSizeSelectorRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  fontSizeOptionButton: { flex: 1, backgroundColor: COLORS.sectionBg, paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: 'transparent' },
  fontSizeOptionSelected: { backgroundColor: COLORS.secondary, borderColor: COLORS.accent },
  fontSizeOptionText: { fontWeight: 'bold', color: COLORS.accent },
  fontSizeOptionTextSelected: { color: COLORS.accent },
  accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  accordionTitle: { fontWeight: '600', color: COLORS.textDark },
  accordionArrow: { fontSize: 12, color: COLORS.gray },
  accordionContent: { backgroundColor: COLORS.sectionBg, padding: 12, borderRadius: 10, marginTop: 8 },
  accordionBodyText: { color: COLORS.textDark, lineHeight: 18 },
  saveButton: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  saveButtonText: { color: COLORS.white, fontWeight: 'bold' },
  logoutButton: { marginTop: 15, padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#C97A7A' },
  logoutButtonText: { color: '#C97A7A', fontWeight: 'bold' }
});