// @ts-nocheck
import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from './theme';

export default function LoginScreen({
  email, setEmail, password, setPassword, showPassword, setShowPassword,
  handleLogin, statusLogin, goToSignUp
}) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40, flexGrow: 1, justifyContent: 'center' }}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.logoText}>Cantos e Contos</Text>
        <Text style={styles.tagline}>Seu cantinho favorito te espera</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Bem-vindo de volta! 👋</Text>
        <Text style={styles.subtitle}>Faça login para continuar</Text>

        <Text style={styles.label}>E-mail</Text>
        <TextInput style={styles.input} placeholder="seu@email.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

        <Text style={styles.label}>Senha</Text>
        <View style={styles.passwordContainer}>
          <TextInput style={[styles.input, { flex: 1, marginTop: 0 }]} placeholder="Sua senha" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
            <Text style={styles.eyeButtonText}>{showPassword ? '🙈' : '🙉'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.button, styles.loginButton, statusLogin === 'carregando' ? { opacity: 0.6 } : {}]} 
          onPress={handleLogin} 
          disabled={statusLogin === 'carregando'}
        >
          <Text style={styles.buttonText}>{statusLogin === 'carregando' ? 'Entrando...' : 'Entrar'}</Text>
        </TouchableOpacity>

        {statusLogin === 'erro' && <Text style={styles.errorText}>E-mail ou senha incorretos.</Text>}

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OU</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity style={styles.outlineButton} onPress={goToSignUp}>
          <Text style={styles.outlineButtonText}>Usuário não tem cadastro? Criar conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { alignItems: 'center', paddingVertical: 50, backgroundColor: COLORS.accent, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  logoText: { fontSize: 36, fontWeight: 'bold', color: COLORS.sectionBg, letterSpacing: 2 },
  tagline: { color: COLORS.sectionBg, marginTop: 8, opacity: 0.9 },
  formContainer: { padding: 24, marginTop: 10 },
  title: { fontWeight: 'bold', color: COLORS.accent, fontSize: 24 },
  subtitle: { color: COLORS.gray, marginTop: 4, fontSize: 14 },
  label: { color: COLORS.accent, fontWeight: '600', marginTop: 16, fontSize: 14 },
  input: { backgroundColor: COLORS.sectionBg, padding: 15, borderRadius: 12, fontSize: 15, color: COLORS.textDark, marginTop: 5 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  eyeButton: { padding: 10 },
  eyeButtonText: { fontSize: 20 },
  button: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  loginButton: { backgroundColor: COLORS.primary },
  buttonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  errorText: { color: COLORS.error, textAlign: 'center', marginTop: 15, fontWeight: '600' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  divider: { flex: 1, height: 1, backgroundColor: COLORS.lightGray },
  dividerText: { marginHorizontal: 10, color: COLORS.gray, fontWeight: 'bold' },
  outlineButton: { padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: COLORS.secondary },
  outlineButtonText: { color: COLORS.secondary, fontWeight: 'bold', fontSize: 16 },
});