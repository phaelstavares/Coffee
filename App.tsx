// @ts-nocheck
import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, Image, TouchableOpacity, 
  SafeAreaView, ScrollView, TextInput, FlatList, Dimensions, Platform, Switch 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#4A5D45',   
  secondary: '#F3E5D0', 
  accent: '#3B0F0F',    
  logout: '#962121',    
  white: '#FFFFFF',
  gray: '#A0A0A0',
  sectionBg: '#F9F6F2', 
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [pageTitle, setPageTitle] = useState(''); 

  const [notifPush, setNotifPush] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);
  const [notifSms, setNotifSms] = useState(true);

  const navigateToSubPage = (title) => {
    setPageTitle(title);
    setCurrentScreen('subpage');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash': return <SplashScreen onLogin={() => setCurrentScreen('login')} onSignUp={() => setCurrentScreen('signup')} onStart={() => setCurrentScreen('start')} />;
      case 'login': return <LoginScreen onBack={() => setCurrentScreen('splash')} onEnter={() => setCurrentScreen('home')} onForgot={() => setCurrentScreen('forgot')} />;
      case 'forgot': return <ForgotScreen onBack={() => setCurrentScreen('login')} />;
      case 'signup': return <SignUpScreen onBack={() => setCurrentScreen('splash')} onComplete={() => setCurrentScreen('home')} />;
      case 'start': return <StartScreen onBack={() => setCurrentScreen('splash')} onNext={() => setCurrentScreen('home')} />;
      case 'home': return <HomeScreen onProfile={() => setCurrentScreen('profile')} />;
      case 'profile': return <ProfileScreen onBack={() => setCurrentScreen('home')} onLogout={() => setCurrentScreen('splash')} onNavigate={navigateToSubPage} />;
      case 'subpage': return (
        <SpecificSubPage 
          title={pageTitle} 
          onBack={() => setCurrentScreen('profile')} 
          notifStates={{ notifPush, setNotifPush, notifEmail, setNotifEmail, notifSms, setNotifSms }}
        />
      );
      default: return <SplashScreen />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <StatusBar style="auto" />
      {renderScreen()}
    </View>
  );
}

const CustomHeader = ({ onBack, title }) => (
  <View style={styles.headerContainer}>
    <TouchableOpacity style={styles.backButton} onPress={onBack}>
      <Text style={styles.backIcon}>✕</Text>
    </TouchableOpacity>
    {title && <Text style={styles.headerTitleText}>{title}</Text>}
  </View>
);

const ProfileSection = ({ title, children }) => (
  <View style={styles.sectionWrapper}>
    <Text style={styles.sectionLabel}>{title}</Text>
    <View style={styles.sectionCard}>{children}</View>
  </View>
);

const MenuButton = ({ label, icon, onPress, color = COLORS.primary }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIconWrapper}><Text style={styles.menuIcon}>{icon}</Text></View>
    <Text style={[styles.menuText, { color: color }]}>{label}</Text>
    <Text style={styles.arrowIcon}>›</Text>
  </TouchableOpacity>
);

const SplashScreen = ({ onLogin, onSignUp, onStart }) => (
  <SafeAreaView style={[styles.container, { backgroundColor: COLORS.primary }]}>
    <ScrollView contentContainerStyle={styles.scrollCenter}>
      <Image source={require('./assets/icone-app.png')} style={styles.logoImage} resizeMode="contain" />
      <View style={styles.splashActions}>
        <TouchableOpacity onPress={onLogin}><Text style={styles.splashLinkText}>Já é Cadastrado? <Text style={styles.boldUnderline}>Login</Text></Text></TouchableOpacity>
        <TouchableOpacity onPress={onSignUp}><Text style={styles.splashLinkText}>Não tem conta? <Text style={styles.boldUnderline}>Cadastre-se</Text></Text></TouchableOpacity>
      </View>
      <Text style={styles.splashTitle}>Acesse para reservar seu canto</Text>
      <TouchableOpacity style={styles.btnAcent} onPress={onStart}><Text style={styles.btnText}>Começar Agora</Text></TouchableOpacity>
    </ScrollView>
  </SafeAreaView>
);

const LoginScreen = ({ onBack, onEnter, onForgot }) => (
  <SafeAreaView style={styles.container}>
    <CustomHeader onBack={onBack} title="Login" />
    <View style={styles.paddedContent}>
      <Text style={styles.screenTitle}>Bem-vindo!</Text>
      <TextInput placeholder="Seu e-mail" style={styles.inputField} keyboardType="email-address" />
      <TextInput placeholder="Sua senha" style={styles.inputField} secureTextEntry />
      
      <TouchableOpacity onPress={onForgot} style={{ alignSelf: 'flex-end', marginBottom: 20 }}>
        <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Esqueci minha senha</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnPrimary} onPress={onEnter}><Text style={styles.btnText}>Entrar</Text></TouchableOpacity>
    </View>
  </SafeAreaView>
);

const ForgotScreen = ({ onBack }) => (
  <SafeAreaView style={styles.container}>
    <CustomHeader onBack={onBack} title="Recuperar Senha" />
    <View style={styles.paddedContent}>
      <Text style={styles.screenTitle}>Trocar Senha</Text>
      <Text style={{ color: '#666', marginBottom: 20 }}>Enviaremos um link para o seu e-mail para realizar a troca da senha.</Text>
      <TextInput placeholder="E-mail cadastrado" style={styles.inputField} keyboardType="email-address" />
      <TouchableOpacity style={styles.btnPrimary} onPress={() => alert('E-mail enviado com sucesso!')}>
        <Text style={styles.btnText}>Enviar E-mail</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

const SignUpScreen = ({ onBack, onComplete }) => (
  <SafeAreaView style={styles.container}>
    <CustomHeader onBack={onBack} title="Criar Conta" />
    <ScrollView contentContainerStyle={styles.paddedContent}>
      <Text style={styles.formSectionTitle}>Dados Pessoais</Text>
      <TextInput placeholder="Nome Completo" style={styles.inputField} />
      <TextInput placeholder="E-mail" style={styles.inputField} keyboardType="email-address" />
      <TextInput placeholder="Senha" style={styles.inputField} secureTextEntry />
      
      <Text style={[styles.formSectionTitle, { marginTop: 20 }]}>Endereço</Text>
      <TextInput placeholder="CEP (00000-000)" style={styles.inputField} keyboardType="numeric" />
      <TextInput placeholder="Rua / Avenida" style={styles.inputField} />
      <View style={styles.rowInputs}>
        <TextInput placeholder="Nº" style={[styles.inputField, { width: '30%' }]} keyboardType="numeric" />
        <TextInput placeholder="Bairro" style={[styles.inputField, { width: '65%' }]} />
      </View>
      <TextInput placeholder="Cidade" style={styles.inputField} />

      <TouchableOpacity style={styles.btnPrimary} onPress={onComplete}><Text style={styles.btnText}>Finalizar Cadastro</Text></TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  </SafeAreaView>
);

const HomeScreen = ({ onProfile }) => {
  const LOCAIS = [
    { id: '1', nome: 'Coffee Livros', desc: '15% de desconto em combos.', cupons: 3, cor: '#D2B48C' },
    { id: '2', nome: 'RocketSteak', desc: '20% de desconto na parrilla.', cupons: 1, cor: '#8B4513' },
    { id: '3', nome: 'RocketSushi', desc: '15% de desconto no buffet.', cupons: 2, cor: '#2F4F4F' },
    { id: '4', nome: 'RocketBrunch', desc: '50% no segundo brunch.', cupons: 5, cor: '#E9967A' },
    { id: '5', nome: 'Esquina Criativa', desc: 'Combo em dobro no SuperRocket.', cupons: 3, cor: '#556B2F' },
  ];
  return (
    <View style={styles.container}>
      <View style={styles.homeHeader}>
        <Text style={styles.homeHeaderText}>Explorar locais</Text>
        <TouchableOpacity onPress={onProfile} style={styles.profileCircleSmall}><Text style={{fontSize: 20}}>🐱</Text></TouchableOpacity>
      </View>
      <View style={styles.homeBody}>
        <FlatList
          data={LOCAIS}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.locationCard}>
              <View style={[styles.cardBanner, { backgroundColor: item.cor }]} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardPlaceName}>{item.nome}</Text>
                <Text style={styles.cardPlaceDesc}>{item.desc}</Text>
                <View style={styles.badgeCupom}><Text style={styles.badgeText}>🎫 {item.cupons} cupons</Text></View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        />
      </View>
    </View>
  );
};

const ProfileScreen = ({ onBack, onLogout, onNavigate }) => (
  <SafeAreaView style={styles.container}>
    <CustomHeader onBack={onBack} title="Meu Perfil" />
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.profileHero}>
        <View style={styles.avatarLarge}><Text style={{ fontSize: 50 }}>🐱</Text></View>
        <Text style={styles.profileName}>Olá, Fran!</Text>
      </View>

      <ProfileSection title="Atividade e Pedidos">
        <MenuButton label="Meus Pedidos" icon="🛍️" onPress={() => onNavigate('Meus Pedidos')} />
        <MenuButton label="Meus Cupons" icon="🎫" onPress={() => onNavigate('Meus Cupons')} />
      </ProfileSection>

      <ProfileSection title="Endereço">
        <MenuButton label="Endereço Cadastrado" icon="🏠" onPress={() => onNavigate('Endereço')} />
      </ProfileSection>

      <ProfileSection title="Segurança">
        <MenuButton label="Alterar Senha" icon="🔑" onPress={() => onNavigate('Alterar Senha')} />
        <MenuButton label="Segurança da Conta" icon="🛡️" onPress={() => onNavigate('Segurança')} />
      </ProfileSection>

      <ProfileSection title="Suporte e Configurações">
        <MenuButton label="Notificações" icon="🔔" onPress={() => onNavigate('Notificações')} />
        <MenuButton label="Acessibilidade" icon="♿" onPress={() => onNavigate('Acessibilidade')} />
        <MenuButton label="Ajuda" icon="❓" onPress={() => onNavigate('Ajuda')} />
        <MenuButton label="Sair da Conta" icon="🚪" color={COLORS.logout} onPress={onLogout} />
      </ProfileSection>
      <View style={{ height: 60 }} />
    </ScrollView>
  </SafeAreaView>
);

const SpecificSubPage = ({ title, onBack, notifStates }) => {
  const renderContent = () => {
    switch (title) {
      case 'Notificações':
        return (
          <View>
            <View style={styles.notifItem}>
              <Text style={styles.menuText}>Notificações Push</Text>
              <Switch 
                value={notifStates.notifPush} 
                onValueChange={notifStates.setNotifPush}
                trackColor={{ false: "#767577", true: COLORS.primary }}
              />
            </View>
            <View style={styles.notifItem}>
              <Text style={styles.menuText}>Notificações por E-mail</Text>
              <Switch 
                value={notifStates.notifEmail} 
                onValueChange={notifStates.setNotifEmail}
                trackColor={{ false: "#767577", true: COLORS.primary }}
              />
            </View>
            <View style={styles.notifItem}>
              <Text style={styles.menuText}>Notificações por SMS</Text>
              <Switch 
                value={notifStates.notifSms} 
                onValueChange={notifStates.setNotifSms}
                trackColor={{ false: "#767577", true: COLORS.primary }}
              />
            </View>
          </View>
        );
      case 'Meus Pedidos':
        return (
          <View>
            <View style={styles.subCard}><Text style={styles.cardTitle}>#001 - Coffee Livros</Text><Text>2x Cappuccino - R$ 24,00</Text></View>
            <View style={styles.subCard}><Text style={styles.cardTitle}>#002 - RocketSushi</Text><Text>1x Combo 20 Peças - R$ 45,00</Text></View>
          </View>
        );
      case 'Alterar Senha':
        return (
          <View>
            <TextInput placeholder="Senha Atual" style={styles.inputField} secureTextEntry />
            <TextInput placeholder="Nova Senha" style={styles.inputField} secureTextEntry />
            <TextInput placeholder="Confirmar Nova Senha" style={styles.inputField} secureTextEntry />
            <TouchableOpacity style={styles.btnPrimary} onPress={() => alert('Senha alterada!')}><Text style={styles.btnText}>Salvar Nova Senha</Text></TouchableOpacity>
          </View>
        );
      case 'Endereço':
        return (
          <View>
            <Text style={styles.infoTitle}>Endereço Atual:</Text>
            <Text style={styles.infoSubText}>Rua das Flores, 123 - Centro, São Paulo - SP</Text>
            <TouchableOpacity style={[styles.btnPrimary, {marginTop: 20}]}><Text style={styles.btnText}>Editar Endereço</Text></TouchableOpacity>
          </View>
        );
      default:
        return (
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderEmoji}>📑</Text>
            <Text style={styles.placeholderTitle}>{title}</Text>
            <Text style={styles.placeholderDesc}>Configurações de {title.toLowerCase()} em desenvolvimento.</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader onBack={onBack} title={title} />
      <ScrollView contentContainerStyle={styles.paddedContent}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const StartScreen = ({ onBack, onNext }) => (
  <SafeAreaView style={[styles.container, { backgroundColor: COLORS.secondary }]}>
    <CustomHeader onBack={onBack} title="Como funciona?" />
    <ScrollView contentContainerStyle={styles.paddedContent}>
      <Text style={styles.screenTitle}>Siga o passo a passo!</Text>
      
      <View style={styles.infoStepContainer}>
        <View style={styles.infoRow}>
          <View style={styles.stepCircle}><Text style={styles.stepNumber}>1</Text></View>
          <View style={styles.stepTextContent}>
            <Text style={styles.infoTitle}>Explore os Cantos</Text>
            <Text style={styles.infoSubText}>Navegue pela nossa lista de parceiros e encontre o local ideal.</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.stepCircle}><Text style={styles.stepNumber}>2</Text></View>
          <View style={styles.stepTextContent}>
            <Text style={styles.infoTitle}>Escolha seus Cupons</Text>
            <Text style={styles.infoSubText}>Selecione o cupom que deseja usar e salve no seu perfil.</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.stepCircle}><Text style={styles.stepNumber}>3</Text></View>
          <View style={styles.stepTextContent}>
            <Text style={styles.infoTitle}>Valide no Local</Text>
            <Text style={styles.infoSubText}>Apresente seu QR Code para validar o benefício.</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.stepCircle}><Text style={styles.stepNumber}>4</Text></View>
          <View style={styles.stepTextContent}>
            <Text style={styles.infoTitle}>Aproveite seu Conto</Text>
            <Text style={styles.infoSubText}>Agora é só aproveitar com o desconto garantido!</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.btnPrimary} onPress={onNext}>
        <Text style={styles.btnText}>Entendi, vamos começar!</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  headerContainer: { height: 70, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', marginTop: Platform.OS === 'android' ? 35 : 0 },
  headerTitleText: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: COLORS.accent, marginRight: 40 },
  backButton: { width: 45, height: 45, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 22.5 },
  backIcon: { fontSize: 18, fontWeight: 'bold' },
  scrollCenter: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  paddedContent: { padding: 25 },
  logoImage: { width: width * 0.5, height: width * 0.5, marginBottom: 30 },
  splashActions: { alignItems: 'center', marginBottom: 30 },
  splashLinkText: { color: COLORS.white, fontSize: 16, marginBottom: 10 },
  boldUnderline: { fontWeight: 'bold', textDecorationLine: 'underline' },
  splashTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: COLORS.white, marginBottom: 40 },
  screenTitle: { fontSize: 32, fontWeight: 'bold', color: COLORS.accent, marginBottom: 20 },
  formSectionTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary, marginBottom: 15 },
  inputField: { backgroundColor: COLORS.sectionBg, padding: 18, borderRadius: 15, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#EEE' },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },
  btnPrimary: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 12, alignItems: 'center' },
  btnAcent: { backgroundColor: COLORS.accent, padding: 18, borderRadius: 12, width: '100%', alignItems: 'center' },
  btnText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  homeHeader: { height: 120, backgroundColor: COLORS.primary, paddingHorizontal: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 30 },
  homeHeaderText: { color: COLORS.white, fontSize: 22, fontWeight: 'bold' },
  profileCircleSmall: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center' },
  homeBody: { flex: 1, backgroundColor: COLORS.secondary, borderTopLeftRadius: 40, marginTop: -20 },
  locationCard: { backgroundColor: COLORS.white, borderRadius: 20, overflow: 'hidden', marginBottom: 20, elevation: 4 },
  cardBanner: { height: 100, opacity: 0.8 },
  cardInfo: { padding: 15 },
  cardPlaceName: { fontSize: 18, fontWeight: 'bold', color: COLORS.accent },
  cardPlaceDesc: { fontSize: 13, color: '#666', marginVertical: 5 },
  badgeCupom: { backgroundColor: COLORS.secondary, alignSelf: 'flex-start', padding: 5, borderRadius: 5 },
  badgeText: { fontSize: 11, fontWeight: 'bold', color: COLORS.accent },
  profileHero: { alignItems: 'center', paddingVertical: 30, backgroundColor: COLORS.sectionBg },
  avatarLarge: { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: COLORS.primary },
  profileName: { fontSize: 24, fontWeight: 'bold', marginTop: 10 },
  sectionWrapper: { paddingHorizontal: 20, marginBottom: 20 },
  sectionLabel: { fontSize: 12, fontWeight: 'bold', color: COLORS.gray, marginBottom: 8, textTransform: 'uppercase' },
  sectionCard: { backgroundColor: COLORS.sectionBg, borderRadius: 15, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  menuIconWrapper: { width: 30 },
  menuText: { flex: 1, fontSize: 16, fontWeight: '500' },
  arrowIcon: { fontSize: 20, color: COLORS.gray },
  placeholderBox: { alignItems: 'center', marginVertical: 60 },
  placeholderEmoji: { fontSize: 80, marginBottom: 20 },
  placeholderTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.accent },
  placeholderDesc: { textAlign: 'center', color: '#666', marginTop: 10 },
  infoStepContainer: { marginBottom: 30 },
  infoRow: { flexDirection: 'row', marginBottom: 25 },
  stepCircle: { width: 35, height: 35, borderRadius: 17.5, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  stepNumber: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  stepTextContent: { flex: 1 },
  infoTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginBottom: 5 },
  infoSubText: { fontSize: 14, color: '#555', lineHeight: 20 },
  subCard: { backgroundColor: COLORS.sectionBg, padding: 15, borderRadius: 10, marginBottom: 10 },
  cardTitle: { fontWeight: 'bold', color: COLORS.accent },
  notifItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEE' },
});