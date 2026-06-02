// @ts-nocheck
import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from './theme';

export default function SignUpScreen({
  email, setEmail, password, setPassword, showPassword, setShowPassword,
  nomeUsuario, setNomeUsuario, rua, setRua, numero, setNumero, bairro, setBairro, cidade, setCidade,
  handleSignUp, statusCadastro, goToLogin
}) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.logoText}>Cantos e Contos</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Crie sua conta! ☕</Text>
        <Text style={styles.subtitle}>Preencha os dados abaixo para começar</Text>

        <Text style={styles.label}>Nome *</Text>
        <TextInput style={styles.input} placeholder="Seu nome completo" value={nomeUsuario} onChangeText={setNomeUsuario} />

        <Text style={styles.label}>E-mail *</Text>
        <TextInput style={styles.input} placeholder="seu@email.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

        <Text style={styles.label}>Senha *</Text>
        <View style={styles.passwordContainer}>
          <TextInput style={[styles.input, { flex: 1, marginTop: 0 }]} placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
            <Text style={styles.eyeButtonText}>{showPassword ? '🙈' : '🙉'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { marginTop: 24, fontSize: 16, color: COLORS.primary }]}>Endereço (Opcional)</Text>
        <Text style={styles.label}>Rua</Text>
        <TextInput style={styles.input} placeholder="Ex: Rua das Flores" value={rua} onChangeText={setRua} />
        
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>Número</Text>
            <TextInput style={styles.input} placeholder="Ex: 123" value={numero} onChangeText={setNumero} keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Bairro</Text>
            <TextInput style={styles.input} placeholder="Ex: Centro" value={bairro} onChangeText={setBairro} />
          </View>
        </View>
        
        <Text style={styles.label}>Cidade</Text>
        <TextInput style={styles.input} placeholder="Sua cidade" value={cidade} onChangeText={setCidade} />

        <TouchableOpacity 
          style={[styles.button, styles.signUpButton, statusCadastro === 'carregando' ? { opacity: 0.6 } : {}]} 
          onPress={handleSignUp} 
          disabled={statusCadastro === 'carregando'}
        >
          <Text style={styles.buttonText}>
            {statusCadastro === 'carregando' ? 'Criando conta...' : 'Finalizar Cadastro'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goToLogin} style={{ marginTop: 20, alignItems: 'center', padding: 10 }}>
          <Text style={{ color: COLORS.gray, fontWeight: 'bold', fontSize: 15 }}>← Voltar para o Login</Text>
        </TouchableOpacity>

        {statusCadastro === 'erro' && <Text style={styles.errorText}>Erro ao criar conta. Verifique os dados.</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { alignItems: 'center', paddingVertical: 30, backgroundColor: COLORS.accent },
  logoText: { fontSize: 30, fontWeight: 'bold', color: COLORS.sectionBg, letterSpacing: 1 },
  formContainer: { padding: 24 },
  title: { fontWeight: 'bold', color: COLORS.accent, fontSize: 22 },
  subtitle: { color: COLORS.gray, marginTop: 4, fontSize: 14 },
  label: { color: COLORS.accent, fontWeight: '600', marginTop: 16, fontSize: 14 },
  input: { backgroundColor: COLORS.sectionBg, padding: 15, borderRadius: 12, fontSize: 15, color: COLORS.textDark, marginTop: 5 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  eyeButton: { padding: 10 },
  eyeButtonText: { fontSize: 20 },
  row: { flexDirection: 'row', marginTop: 12 },
  button: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  signUpButton: { backgroundColor: COLORS.primary },
  buttonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  errorText: { color: COLORS.error, textAlign: 'center', marginTop: 15, fontWeight: '600' },
});