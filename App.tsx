import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  useWindowDimensions 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  // Hook para pegar dimensões em tempo real
  const { width, height } = useWindowDimensions();

  // Cálculos dinâmicos para responsividade
  const isSmallScreen = height < 700;
  const logoSize = width * 0.7; // Logo sempre ocupará 70% da largura da tela

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Área da Logo */}
        <View style={[styles.logoContainer, { width: logoSize, height: logoSize }]}>
          <Image 
            source={require('./assets/icone-app.png')} 
            style={styles.logoImage}
            resizeMode="contain" 
          />
        </View>

        {/* Textos de Chamada */}
        <View style={styles.textSection}>
          <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>
            Acesse para reservar
          </Text>
          
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.subtitle}>
              Já é Cadastrado? <Text style={styles.link}>Faça Login Aqui</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Botão Inferior - Colocado dentro do fluxo para telas pequenas */}
        <View style={[styles.footer, isSmallScreen ? styles.footerRelative : styles.footerAbsolute]}>
          <TouchableOpacity style={styles.button} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Começar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A5D45',
  },
  scrollContent: {
    flexGrow: 1, // Garante que o conteúdo ocupe a tela toda para centralizar
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10%', // Espaçamento relativo
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  textSection: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
    textAlign: 'center',
  },
  titleSmall: {
    fontSize: 22, // Diminui o texto se a tela for pequena
  },
  subtitle: {
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  link: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  footer: {
    width: '100%',
    paddingHorizontal: 10,
  },
  // No iPhone normal, o botão fica "preso" embaixo
  footerAbsolute: {
    marginTop: 40,
  },
  // No celular pequeno, o botão segue o fluxo do texto para não cobrir nada
  footerRelative: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#3B0F0F',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // Sombra
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});