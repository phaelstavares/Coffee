// @ts-nocheck
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
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
  handleLogin, handleSignUp,
  statusCadastro,
  statusLogin,
}) {
  const [abaAtiva, setAbaAtiva] = useState('login');

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.logoText}>Cantos e Contos</Text>
        <Text style={styles.tagline}>Seu cantinho favorito te espera</Text>
      </View>

      {/* Abas */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, abaAtiva === 'login' && styles.tabActive]}
          onPress={() => setAbaAtiva('login')}
        >
          <Text style={[styles.tabText, abaAtiva === 'login' && styles.tabTextActive]}>
            Entrar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, abaAtiva === 'cadastro' && styles.tabActive]}
          onPress={() => setAbaAtiva('cadastro')}
        >
          <Text style={[styles.tabText, abaAtiva === 'cadastro' && styles.tabTextActive]}>
            Criar Conta
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>

        {/* ABA LOGIN */}
        {abaAtiva === 'login' && (
          <>
            <Text style={styles.title}>Bem-vindo de volta! 👋</Text>
            <Text style={styles.subtitle}>Faça login para continuar</Text>

            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Sua senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Text style={styles.eyeButtonText}>{showPassword ? '🙈' : '🙉'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, styles.loginButton, statusLogin === 'carregando' && { opacity: 0.6 }]}
              onPress={handleLogin}
              disabled={statusLogin === 'carregando'}
            >
              <Text style={styles.buttonText}>
                {statusLogin === 'carregando' ? 'Entrando...' : 'Entrar'}
              </Text>
            </TouchableOpacity>

            {statusLogin === 'erro' && (
              <Text style={styles.errorText}>E-mail ou senha incorretos.</Text>
            )}

            <TouchableOpacity onPress={() => setAbaAtiva('cadastro')} style={styles.linkContainer}>
              <Text style={styles.linkText}>Não tem conta? <Text style={styles.linkBold}>Cadastre-se</Text></Text>
            </TouchableOpacity>
          </>
        )}

        {/* ABA CADASTRO */}
        {abaAtiva === 'cadastro' && (
          <>
            <Text style={styles.title}>Crie sua conta! 🎉</Text>
            <Text style={styles.subtitle}>Preencha os dados abaixo</Text>

            <Text style={styles.label}>Nome *</Text>
            <TextInput
              style={styles.input}
              placeholder="Seu nome completo"
              value={nomeUsuario}
              onChangeText={setNomeUsuario}
            />

            <Text style={styles.label}>E-mail *</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Senha *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Crie uma senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Text style={styles.eyeButtonText}>{showPassword ? '🙈' : '🙉'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { marginTop: 20 }]}>Endereço de Entrega</Text>

            <Text style={styles.label}>Rua</Text>
            <TextInput
              style={styles.input}
              placeholder="Rua"
              value={rua}
              onChangeText={setRua}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Número</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Num"
                  value={numero}
                  onChangeText={setNumero}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Bairro</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Bairro"
                  value={bairro}
                  onChangeText={setBairro}
                />
              </View>
            </View>

            <Text style={styles.label}>Cidade</Text>
            <TextInput
              style={styles.input}
              placeholder="Cidade"
              value={cidade}
              onChangeText={setCidade}
            />

            <TouchableOpacity
              style={[styles.button, styles.signUpButton, statusCadastro === 'carregando' && { opacity: 0.6 }]}
              onPress={handleSignUp}
              disabled={statusCadastro === 'carregando'}
            >
              <Text style={styles.buttonText}>
                {statusCadastro === 'carregando' ? 'Criando conta...' : 'Criar Conta'}
              </Text>
            </TouchableOpacity>

            {statusCadastro === 'sucesso' && (
              <Text style={styles.successText}>Conta criada com sucesso! 🎉</Text>
            )}
            {statusCadastro === 'erro' && (
              <Text style={styles.errorText}>Erro ao criar conta. Tente novamente.</Text>
            )}

            <TouchableOpacity onPress={() => setAbaAtiva('login')} style={styles.linkContainer}>
              <Text style={styles.linkText}>Já tem conta? <Text style={styles.linkBold}>Entrar</Text></Text>
            </TouchableOpacity>
          </>
        )}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { alignItems: 'center', paddingVertical: 44, backgroundColor: COLORS.accent },
  logoText: { fontSize: 36, fontWeight: 'bold', color: COLORS.secondary, letterSpacing: 2 },
  tagline: { color: COLORS.white, marginTop: 8, opacity: 0.8 },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.sectionBg,
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 14,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 11,
  },
  tabActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: { fontWeight: '600', fontSize: 15, color: COLORS.gray },
  tabTextActive: { color: COLORS.accent },
  formContainer: { padding: 24 },
  title: { fontWeight: 'bold', fontSize: 22, color: COLORS.accent },
  subtitle: { color: COLORS.gray, marginTop: 4, fontSize: 14 },
  label: { color: COLORS.accent, fontWeight: '600', marginTop: 16, fontSize: 14 },
  input: {
    backgroundColor: COLORS.sectionBg, padding: 15, borderRadius: 12,
    fontSize: 15, color: COLORS.textDark, marginTop: 5,
  },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  eyeButton: { padding: 10 },
  eyeButtonText: { fontSize: 20 },
  row: { flexDirection: 'row', marginTop: 4 },
  button: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  loginButton: { backgroundColor: COLORS.primary },
  signUpButton: { backgroundColor: COLORS.primary },
  buttonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  successText: { color: COLORS.success, textAlign: 'center', marginTop: 15, fontWeight: '600' },
  errorText: { color: COLORS.error, textAlign: 'center', marginTop: 15, fontWeight: '600' },
  linkContainer: { alignItems: 'center', marginTop: 20 },
  linkText: { color: COLORS.gray, fontSize: 14 },
  linkBold: { color: COLORS.primary, fontWeight: 'bold' },
});