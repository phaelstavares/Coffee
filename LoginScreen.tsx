// @ts-nocheck
import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { COLORS } from './theme';

export default function LoginScreen({
  email, setEmail,
  password, setPassword,
  showPassword, setShowPassword,
  nomeUsuario, setNomeUsuario,
  rua, setRua,
  numero, setNumero,
  bairro, setBairro,
  cidade, setCidade,
  handleLogin,
  handleSignUp,
  statusCadastro, // 'ocioso' | 'carregando' | 'sucesso' | 'erro'
  statusLogin     // 'ocioso' | 'carregando' | 'erro'
}) {
  const [activeTab, setActiveTab] = useState('entrar');

  // Retorna a cor do botão de Login dependendo do estado
  const getLoginButtonStyles = () => {
    if (statusLogin === 'carregando') return { bg: COLORS.gray, text: 'Entrando...' };
    if (statusLogin === 'erro') return { bg: '#C62828', text: 'E-mail ou Senha Incorretos ❌' };
    return { bg: COLORS.primary, text: 'Entrar' };
  };

  // Retorna a cor do botão de Cadastro dependendo do estado
  const getSignUpButtonStyles = () => {
    if (statusCadastro === 'carregando') return { bg: COLORS.gray, text: 'Criando sua conta...' };
    if (statusCadastro === 'sucesso') return { bg: '#2E7D32', text: 'Conta Criada com Sucesso!  🎉' };
    if (statusCadastro === 'erro') return { bg: '#C62828', text: 'Erro ao Cadastrar ❌' };
    return { bg: COLORS.primary, text: 'Finalizar Cadastro' };
  };

  const loginStyle = getLoginButtonStyles();
  const signupStyle = getSignUpButtonStyles();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.loginScrollContainer} keyboardShouldPersistTaps="always">
        <View style={styles.loginContent}>
          
          <View style={styles.loginHeader}>
            <Text style={styles.loginTitle}>Coffee Shop</Text>
            <Text style={styles.loginSubtitle}>
              {activeTab === 'entrar' ? 'Faça login para continuar' : 'Crie sua conta preenchendo os dados abaixo'}
            </Text>
          </View>

          <View style={styles.tabWrapper}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'entrar' && styles.tabActive]} 
              onPress={() => setActiveTab('entrar')}
            >
              <Text style={[styles.tabText, activeTab === 'entrar' && styles.tabTextActive]}>Entrar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'registrar' && styles.tabActive]} 
              onPress={() => setActiveTab('registrar')}
            >
              <Text style={[styles.tabText, activeTab === 'registrar' && styles.tabTextActive]}>Cadastrar-se</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.form}>
            {activeTab === 'registrar' && (
              <>
                <Text style={styles.inputLabel}>Nome Completo *</Text>
                <TextInput style={styles.input} placeholder="Seu nome" value={nomeUsuario} onChangeText={setNomeUsuario} />
              </>
            )}

            <Text style={styles.inputLabel}>E-mail *</Text>
            <TextInput style={styles.input} placeholder="seu@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            
            <Text style={styles.inputLabel}>Senha *</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput style={styles.passwordInput} placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.showPasswordText}>{showPassword ? 'Ocultar' : 'Mostrar'}</Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'registrar' && (
              <View style={styles.addressSection}>
                <Text style={styles.sectionDividerText}>📍 Endereço de Entrega (Opcional)</Text>
                
                <Text style={styles.inputLabel}>Rua / Logradouro</Text>
                <TextInput style={styles.input} placeholder="Ex: Av. Principal" value={rua} onChangeText={setRua} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.inputLabel}>Número</Text>
                    <TextInput style={styles.input} placeholder="123" value={numero} onChangeText={setNumero} keyboardType="numeric" />
                  </View>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.inputLabel}>Bairro</Text>
                    <TextInput style={styles.input} placeholder="Centro" value={bairro} onChangeText={setBairro} />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Cidade</Text>
                <TextInput style={styles.input} placeholder="Sua cidade" value={cidade} onChangeText={setCidade} />
              </View>
            )}
            
            {activeTab === 'entrar' ? (
              <TouchableOpacity 
                style={[styles.mainButton, { backgroundColor: loginStyle.bg }]} 
                onPress={handleLogin}
                disabled={statusLogin === 'carregando'}
              >
                <Text style={styles.mainButtonText}>{loginStyle.text}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.mainButton, { backgroundColor: signupStyle.bg }]} 
                onPress={handleSignUp}
                disabled={statusCadastro === 'carregando' || statusCadastro === 'sucesso'}
              >
                <Text style={styles.mainButtonText}>{signupStyle.text}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loginScrollContainer: { flexGrow: 1, justifyContent: 'center', backgroundColor: COLORS.white },
  loginContent: { padding: 25 },
  loginHeader: { marginBottom: 20, alignItems: 'center' },
  loginTitle: { fontSize: 36, fontWeight: 'bold', color: COLORS.accent },
  loginSubtitle: { color: COLORS.gray, marginTop: 4, textAlign: 'center' },
  tabWrapper: { flexDirection: 'row', backgroundColor: COLORS.lightGray, borderRadius: 12, padding: 4, marginBottom: 20 },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: COLORS.white },
  tabText: { fontWeight: 'bold', color: COLORS.gray },
  tabTextActive: { color: COLORS.accent },
  form: { marginTop: 5 },
  inputLabel: { fontWeight: 'bold', color: COLORS.accent, marginTop: 12, fontSize: 13 },
  input: { backgroundColor: COLORS.sectionBg, padding: 14, borderRadius: 12, marginTop: 5, color: COLORS.textDark },
  passwordInputWrapper: { flexDirection: 'row', backgroundColor: COLORS.sectionBg, borderRadius: 12, alignItems: 'center', paddingRight: 15, marginTop: 5 },
  passwordInput: { flex: 1, padding: 14, color: COLORS.textDark },
  showPasswordText: { color: COLORS.primary, fontWeight: 'bold' },
  addressSection: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: COLORS.lightGray },
  sectionDividerText: { fontWeight: 'bold', color: COLORS.primary, marginBottom: 5 },
  mainButton: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 25 },
  mainButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 }
});