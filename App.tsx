// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  TextInput, 
  FlatList, 
  Dimensions, 
  Platform, 
  Switch,
  Alert 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const USER_IMAGE = require('./assets/icone-gato.jpg'); 

const COLORS = {
  primary: '#4A5D45',   
  secondary: '#F3E5D0', 
  accent: '#3B0F0F',    
  logout: '#962121',    
  white: '#FFFFFF',
  gray: '#A0A0A0',
  sectionBg: '#F9F6F2',
  success: '#28a745',
  error: '#dc3545'
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [pageTitle, setPageTitle] = useState(''); 
  const [fontScale, setFontScale] = useState(1);
  const [userAddress, setUserAddress] = useState('Rua das Flores, 123 - Centro, SP');
  const [currentUser, setCurrentUser] = useState(null);

  const [notifPush, setNotifPush] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);
  const [notifSms, setNotifSms] = useState(true);

  // ESTADOS DOS FORMULÁRIOS
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regNome, setRegNome] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPassword] = useState('');

  // ESTADOS SOLICITADOS (OLHO E ANIMAÇÃO)
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [statusColor, setStatusColor] = useState(COLORS.primary);

  const navigateToSubPage = (title) => {
    setPageTitle(title);
    setCurrentScreen('subpage');
  };

  const ds = (size) => size * fontScale;

  const handleSignUp = async () => {
    if (!regNome || !regEmail || !regPass) {
      setStatusColor(COLORS.error); // Animação de erro
      setTimeout(() => setStatusColor(COLORS.primary), 500);
      Alert.alert("Erro", "Preencha todos os campos para criar sua conta.");
      return;
    }
    try {
      const userData = { nome: regNome, email: regEmail, senha: regPass };
      await AsyncStorage.setItem(`@user_${regEmail}`, JSON.stringify(userData));
      setStatusColor(COLORS.success); // Animação de sucesso
      setTimeout(() => {
        setStatusColor(COLORS.primary);
        Alert.alert("Sucesso", "Conta criada com sucesso! Faça seu login.");
        setCurrentScreen('login');
      }, 500);
    } catch (e) {
      Alert.alert("Erro", "Falha ao salvar dados localmente.");
    }
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      setStatusColor(COLORS.error); // Animação de erro
      setTimeout(() => setStatusColor(COLORS.primary), 500);
      Alert.alert("Aviso", "Preencha e-mail e senha.");
      return;
    }
    try {
      const jsonValue = await AsyncStorage.getItem(`@user_${loginEmail}`);
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;

      if (user) {
        if (user.senha === loginPassword) {
          setStatusColor(COLORS.success); // Animação de sucesso
          setTimeout(() => {
            setStatusColor(COLORS.primary);
            setCurrentUser(user);
            setCurrentScreen('home');
          }, 500);
        } else {
          setStatusColor(COLORS.error);
          setTimeout(() => setStatusColor(COLORS.primary), 500);
          Alert.alert("Erro de Login", "Senha incorreta.");
        }
      } else {
        setStatusColor(COLORS.error);
        setTimeout(() => setStatusColor(COLORS.primary), 500);
        Alert.alert("Erro de Login", "E-mail não cadastrado.");
      }
    } catch (e) {
      Alert.alert("Erro", "Falha na verificação.");
    }
  };

  const renderScreen = () => {
    if (!currentUser) {
      switch (currentScreen) {
        case 'login': 
          return <LoginScreen 
            email={loginEmail} setEmail={setLoginEmail} 
            pass={loginPassword} setPass={setLoginPassword} 
            showPass={showLoginPass} setShowPass={setShowLoginPass}
            btnColor={statusColor}
            onBack={() => setCurrentScreen('splash')} onEnter={handleLogin} onForgot={() => setCurrentScreen('forgot')} ds={ds} 
          />;
        case 'signup': 
          return <SignUpScreen 
            nome={regNome} setNome={setRegNome} 
            email={regEmail} setEmail={setRegEmail} 
            pass={regPass} setPass={setRegPassword} 
            showPass={showRegPass} setShowPass={setShowRegPass}
            btnColor={statusColor}
            onBack={() => setCurrentScreen('splash')} onComplete={handleSignUp} ds={ds} 
          />;
        case 'forgot': 
          return <ForgotScreen onBack={() => setCurrentScreen('login')} ds={ds} />;
        default: 
          return <SplashScreen onLogin={() => setCurrentScreen('login')} onSignUp={() => setCurrentScreen('signup')} onStart={() => setCurrentScreen('login')} ds={ds} />;
      }
    }

    switch (currentScreen) {
      case 'home': 
        return <HomeScreen userName={currentUser.nome} onProfile={() => setCurrentScreen('profile')} ds={ds} userAddress={userAddress} onAddressClick={() => navigateToSubPage('Endereço')} />;
      case 'profile': 
        return <ProfileScreen userName={currentUser.nome} onBack={() => setCurrentScreen('home')} onLogout={() => {setCurrentUser(null); setCurrentScreen('splash');}} onNavigate={navigateToSubPage} ds={ds} />;
      case 'editAddress': 
        return <EditAddressScreen onBack={() => setCurrentScreen('subpage')} onSave={(newAddr) => { setUserAddress(newAddr); setCurrentScreen('subpage'); }} ds={ds} />;
      case 'subpage': 
        return (
          <SpecificSubPage 
            title={pageTitle} 
            onBack={() => setCurrentScreen('profile')} 
            onEditAddress={() => setCurrentScreen('editAddress')}
            notifStates={{ notifPush, setNotifPush, notifEmail, setNotifEmail, notifSms, setNotifSms }}
            accessibility={{ fontScale, setFontScale }}
            ds={ds}
            userAddress={userAddress}
          />
        );
      default: 
        return <HomeScreen userName={currentUser.nome} onProfile={() => setCurrentScreen('profile')} ds={ds} userAddress={userAddress} onAddressClick={() => navigateToSubPage('Endereço')} />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <StatusBar style="auto" />
      {renderScreen()}
    </View>
  );
}

const CustomHeader = ({ onBack, title, ds }) => (
  <View style={styles.headerContainer}>
    <TouchableOpacity style={styles.backButton} onPress={onBack}>
      <Text style={[styles.backIcon, { fontSize: ds(18) }]}>✕</Text>
    </TouchableOpacity>
    {title && <Text style={[styles.headerTitleText, { fontSize: ds(18) }]}>{title}</Text>}
  </View>
);

const ProfileSection = ({ title, children, ds }) => (
  <View style={styles.sectionWrapper}>
    <Text style={[styles.sectionLabel, { fontSize: ds(12) }]}>{title}</Text>
    <View style={styles.sectionCard}>{children}</View>
  </View>
);

const MenuButton = ({ label, icon, onPress, color = COLORS.primary, ds }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIconWrapper}>
      <Text style={[styles.menuIcon, { fontSize: ds(18) }]}>{icon}</Text>
    </View>
    <Text style={[styles.menuText, { color: color, fontSize: ds(16) }]}>{label}</Text>
    <Text style={[styles.arrowIcon, { fontSize: ds(20) }]}>›</Text>
  </TouchableOpacity>
);

const SplashScreen = ({ onLogin, onSignUp, onStart, ds }) => (
  <SafeAreaView style={[styles.container, { backgroundColor: COLORS.primary }]}>
    <ScrollView contentContainerStyle={styles.scrollCenter} bounces={false}>
      <Image 
        source={require('./assets/icone-app.png')} 
        style={[styles.logoImage, { width: width * 0.7, height: width * 0.7 * 0.6 }]} 
        resizeMode="contain" 
      />
      <View style={styles.splashActions}>
        <TouchableOpacity onPress={onLogin}>
          <Text style={[styles.splashLinkText, { fontSize: ds(16) }]}>Já é Cadastrado? <Text style={styles.boldUnderline}>Login</Text></Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSignUp}>
          <Text style={[styles.splashLinkText, { fontSize: ds(16) }]}>Não tem conta? <Text style={styles.boldUnderline}>Cadastre-se</Text></Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.splashTitle, { fontSize: ds(24) }]}>Acesse para reservar seu canto</Text>
      <TouchableOpacity style={styles.btnAcent} onPress={onStart}>
        <Text style={[styles.btnText, { fontSize: ds(18) }]}>Começar Agora</Text>
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>
);

const LoginScreen = ({ email, setEmail, pass, setPass, showPass, setShowPass, btnColor, onBack, onEnter, onForgot, ds }) => (
  <SafeAreaView style={styles.container}>
    <CustomHeader onBack={onBack} title="Login" ds={ds} />
    <View style={styles.paddedContent}>
      <Text style={[styles.screenTitle, { fontSize: ds(32) }]}>Bem-vindo!</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="Seu e-mail" style={[styles.inputField, { fontSize: ds(16) }]} keyboardType="email-address" autoCapitalize="none" />
      <View style={styles.passwordInputWrapper}>
        <TextInput 
          value={pass} 
          onChangeText={setPass} 
          placeholder="Sua senha" 
          style={[styles.inputField, { fontSize: ds(16), flex: 1, marginBottom: 0 }]} 
          secureTextEntry={!showPass} 
        />
        <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPass(!showPass)}>
          <Text style={{ fontSize: 20 }}>{showPass ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={onForgot} style={{ alignSelf: 'flex-end', marginVertical: 20 }}>
        <Text style={{ color: COLORS.primary, fontWeight: 'bold', fontSize: ds(14) }}>Esqueci minha senha</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: btnColor }]} onPress={onEnter}>
        <Text style={[styles.btnText, { fontSize: ds(18) }]}>Entrar</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

const ForgotScreen = ({ onBack, ds }) => (
  <SafeAreaView style={styles.container}>
    <CustomHeader onBack={onBack} title="Recuperar Senha" ds={ds} />
    <View style={styles.paddedContent}>
      <Text style={[styles.screenTitle, { fontSize: ds(32) }]}>Trocar Senha</Text>
      <Text style={{ color: '#666', marginBottom: 20, fontSize: ds(14) }}>Enviaremos um link para o seu e-mail para realizar a troca da senha.</Text>
      <TextInput placeholder="E-mail cadastrado" style={[styles.inputField, { fontSize: ds(16) }]} keyboardType="email-address" />
      <TouchableOpacity style={styles.btnPrimary} onPress={() => alert('E-mail enviado!')}>
        <Text style={[styles.btnText, { fontSize: ds(18) }]}>Enviar E-mail</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

const SignUpScreen = ({ nome, setNome, email, setEmail, pass, setPass, showPass, setShowPass, btnColor, onBack, onComplete, ds }) => (
  <SafeAreaView style={styles.container}>
    <CustomHeader onBack={onBack} title="Criar Conta" ds={ds} />
    <ScrollView contentContainerStyle={styles.paddedContent}>
      <Text style={[styles.formSectionTitle, { fontSize: ds(22) }]}>Dados Pessoais</Text>
      <TextInput value={nome} onChangeText={setNome} placeholder="Nome Completo" style={[styles.inputField, { fontSize: ds(16) }]} />
      <TextInput value={email} onChangeText={setEmail} placeholder="E-mail" style={[styles.inputField, { fontSize: ds(16) }]} keyboardType="email-address" autoCapitalize="none" />
      <View style={[styles.passwordInputWrapper, { marginBottom: 15 }]}>
        <TextInput 
          value={pass} 
          onChangeText={setPass} 
          placeholder="Senha" 
          style={[styles.inputField, { fontSize: ds(16), flex: 1, marginBottom: 0 }]} 
          secureTextEntry={!showPass} 
        />
        <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPass(!showPass)}>
          <Text style={{ fontSize: 20 }}>{showPass ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.formSectionTitle, { marginTop: 20, fontSize: ds(22) }]}>Endereço[cite: 14]</Text>
      <TextInput placeholder="CEP (00000-000)" style={[styles.inputField, { fontSize: ds(16) }]} keyboardType="numeric" />
      <TextInput placeholder="Rua / Avenida" style={[styles.inputField, { fontSize: ds(16) }]} />
      <View style={styles.rowInputs}>
        <TextInput placeholder="Nº" style={[styles.inputField, { width: '30%', fontSize: ds(16) }]} keyboardType="numeric" />
        <TextInput placeholder="Bairro" style={[styles.inputField, { width: '65%', fontSize: ds(16) }]} />
      </View>
      <TextInput placeholder="Cidade" style={[styles.inputField, { fontSize: ds(16) }]} />

      <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: btnColor }]} onPress={onComplete}>
        <Text style={[styles.btnText, { fontSize: ds(18) }]}>Finalizar Cadastro</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  </SafeAreaView>
);

const HomeScreen = ({ onProfile, ds, userAddress, onAddressClick, userName }) => {
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
        <View style={{ flex: 1 }}>
          <Text style={[styles.homeHeaderText, { fontSize: ds(22) }]}>Olá, {userName}!</Text>
          <TouchableOpacity onPress={onAddressClick}>
            <Text style={{ color: COLORS.secondary, fontSize: ds(12), marginTop: 4 }} numberOfLines={1}>
              📍 {userAddress}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={onProfile} style={styles.profileCircleSmall}>
          <Image source={USER_IMAGE} style={{ width: ds(45), height: ds(45), borderRadius: ds(22.5) }} />
        </TouchableOpacity>
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
                <Text style={[styles.cardPlaceName, { fontSize: ds(18) }]}>{item.nome}</Text>
                <Text style={[styles.cardPlaceDesc, { fontSize: ds(13) }]}>{item.desc}</Text>
                <View style={styles.badgeCupom}>
                  <Text style={[styles.badgeText, { fontSize: ds(11) }]}>🎫 {item.cupons} cupons</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        />
      </View>
    </View>
  );
};

const ProfileScreen = ({ userName, onBack, onLogout, onNavigate, ds }) => (
  <SafeAreaView style={styles.container}>
    <CustomHeader onBack={onBack} title="Meu Perfil" ds={ds} />
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.profileHero}>
        <View style={styles.avatarLarge}>
           <Image source={USER_IMAGE} style={{ width: ds(120), height: ds(120), borderRadius: ds(60) }} />
        </View>
        <TouchableOpacity style={styles.changePhotoBtn} onPress={() => alert('Em breve!')}>
          <Text style={[styles.changePhotoText, { fontSize: ds(14) }]}>📸 Alterar Foto</Text>
        </TouchableOpacity>
        <Text style={[styles.profileName, { fontSize: ds(24) }]}>{userName}</Text>
      </View>
      <ProfileSection title="Atividade e Pedidos" ds={ds}>
        <MenuButton label="Meus Pedidos" icon="🛍️" onPress={() => onNavigate('Meus Pedidos')} ds={ds} />
        <MenuButton label="Meus Cupons" icon="🎫" onPress={() => onNavigate('Meus Cupons')} ds={ds} />
      </ProfileSection>
      <ProfileSection title="Endereço" ds={ds}>
        <MenuButton label="Endereço Cadastrado" icon="🏠" onPress={() => onNavigate('Endereço')} ds={ds} />
      </ProfileSection>
      <ProfileSection title="Segurança" ds={ds}>
        <MenuButton label="Alterar Senha" icon="🔑" onPress={() => onNavigate('Alterar Senha')} ds={ds} />
        <MenuButton label="Segurança da Conta" icon="🛡️" onPress={() => onNavigate('Segurança')} ds={ds} />
      </ProfileSection>
      <ProfileSection title="Suporte e Configurações" ds={ds}>
        <MenuButton label="Notificações" icon="🔔" onPress={() => onNavigate('Notificações')} ds={ds} />
        <MenuButton label="Acessibilidade" icon="♿" onPress={() => onNavigate('Acessibilidade')} ds={ds} />
        <MenuButton label="Ajuda" icon="❓" onPress={() => onNavigate('Ajuda')} ds={ds} />
        <MenuButton label="Sair da Conta" icon="🚪" color={COLORS.logout} onPress={onLogout} ds={ds} />
      </ProfileSection>
      <View style={{ height: 60 }} />
    </ScrollView>
  </SafeAreaView>
);

const SpecificSubPage = ({ title, onBack, notifStates, onEditAddress, accessibility, ds, userAddress }) => {
  const renderContent = () => {
    switch (title) {
      case 'Acessibilidade':
        return (
          <View>
            <Text style={[styles.infoTitle, { fontSize: ds(18) }]}>Tamanho da Fonte</Text>
            <Text style={{ fontSize: ds(14), color: '#666', marginBottom: 20 }}>Ajuste a escala das letras para todo o app.</Text>
            <View style={styles.rowInputs}>
              <TouchableOpacity style={[styles.btnPrimary, { width: '45%' }]} onPress={() => accessibility.setFontScale(Math.max(0.8, accessibility.fontScale - 0.1))}>
                <Text style={[styles.btnText, { fontSize: ds(16) }]}>Diminuir -</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnPrimary, { width: '45%' }]} onPress={() => accessibility.setFontScale(Math.min(1.5, accessibility.fontScale + 0.1))}>
                <Text style={[styles.btnText, { fontSize: ds(16) }]}>Aumentar +</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.btnAcent, { marginTop: 20 }]} onPress={() => accessibility.setFontScale(1)}>
              <Text style={[styles.btnText, { fontSize: ds(16) }]}>Resetar Padrão</Text>
            </TouchableOpacity>
          </View>
        );
      case 'Ajuda':
        return (
          <View>
            <Text style={[styles.infoTitle, { fontSize: ds(18) }]}>FAQ - Perguntas Frequentes</Text>
            <View style={styles.subCard}>
              <Text style={[styles.cardTitle, { fontSize: ds(16) }]}>Como usar cupons?</Text>
              <Text style={{ fontSize: ds(14) }}>Vá ao local e apresente o QR Code na aba "Meus Cupons".</Text>
            </View>
            <View style={styles.subCard}>
              <Text style={[styles.cardTitle, { fontSize: ds(16) }]}>Esqueci minha senha?</Text>
              <Text style={{ fontSize: ds(14) }}>Use a opção "Esqueci minha senha" na tela de login.</Text>
            </View>
            <Text style={[styles.infoTitle, { fontSize: ds(18), marginTop: 20 }]}>Contato</Text>
            <MenuButton label="Chat de Suporte" icon="💬" ds={ds} />
            <MenuButton label="E-mail: suporte@contos.com" icon="📧" ds={ds} />
          </View>
        );
      case 'Notificações':
        return (
          <View>
            <View style={styles.notifItem}><Text style={[styles.menuText, { fontSize: ds(16) }]}>Push</Text><Switch value={notifStates.notifPush} onValueChange={notifStates.setNotifPush} /></View>
            <View style={styles.notifItem}><Text style={[styles.menuText, { fontSize: ds(16) }]}>E-mail</Text><Switch value={notifStates.notifEmail} onValueChange={notifStates.setNotifEmail} /></View>
            <View style={styles.notifItem}><Text style={[styles.menuText, { fontSize: ds(16) }]}>SMS</Text><Switch value={notifStates.notifSms} onValueChange={notifStates.setNotifSms} /></View>
          </View>
        );
      case 'Meus Pedidos':
        return (
          <View>
            <View style={styles.subCard}><Text style={[styles.cardTitle, { fontSize: ds(16) }]}>#001 - Coffee Livros</Text><Text style={{ fontSize: ds(14) }}>2x Cappuccino - R$ 24,00</Text></View>
            <View style={styles.subCard}><Text style={[styles.cardTitle, { fontSize: ds(16) }]}>#002 - RocketSushi</Text><Text style={{ fontSize: ds(14) }}>1x Combo 20 Peças - R$ 45,00</Text></View>
          </View>
        );
      case 'Alterar Senha':
        return (
          <View>
            <TextInput placeholder="Senha Atual" style={[styles.inputField, { fontSize: ds(16) }]} secureTextEntry />
            <TextInput placeholder="Nova Senha" style={[styles.inputField, { fontSize: ds(16) }]} secureTextEntry />
            <TextInput placeholder="Confirmar" style={[styles.inputField, { fontSize: ds(16) }]} secureTextEntry />
            <TouchableOpacity style={styles.btnPrimary} onPress={() => alert('Senha alterada!')}>
              <Text style={[styles.btnText, { fontSize: ds(18) }]}>Salvar</Text>
            </TouchableOpacity>
          </View>
        );
      case 'Endereço':
        return (
          <View>
            <Text style={[styles.infoTitle, { fontSize: ds(18) }]}>Endereço Atual:</Text>
            <Text style={[styles.infoSubText, { fontSize: ds(14) }]}>{userAddress}</Text>
            <TouchableOpacity style={[styles.btnPrimary, {marginTop: 20}]} onPress={onEditAddress}>
              <Text style={[styles.btnText, { fontSize: ds(16) }]}>Editar Endereço</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return (
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderEmoji}>📑</Text>
            <Text style={[styles.placeholderTitle, { fontSize: ds(24) }]}>{title}</Text>
            <Text style={[styles.placeholderDesc, { fontSize: ds(14) }]}>Configurações de {title.toLowerCase()} em desenvolvimento.</Text>
          </View>
        );
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader onBack={onBack} title={title} ds={ds} />
      <ScrollView contentContainerStyle={styles.paddedContent}>{renderContent()}</ScrollView>
    </SafeAreaView>
  );
};

const EditAddressScreen = ({ onBack, onSave, ds }) => {
  const [tempAddr, setTempAddr] = useState('');
  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader onBack={onBack} title="Alterar Endereço" ds={ds} />
      <ScrollView contentContainerStyle={styles.paddedContent}>
        <Text style={[styles.formSectionTitle, { fontSize: ds(22) }]}>Novo Endereço</Text>
        <TextInput placeholder="CEP" style={[styles.inputField, { fontSize: ds(16) }]} keyboardType="numeric" />
        <TextInput placeholder="Rua / Avenida" style={[styles.inputField, { fontSize: ds(16) }]} onChangeText={setTempAddr} />
        <View style={styles.rowInputs}>
          <TextInput placeholder="Nº" style={[styles.inputField, { width: '30%', fontSize: ds(16) }]} keyboardType="numeric" />
          <TextInput placeholder="Bairro" style={[styles.inputField, { width: '65%', fontSize: ds(16) }]} />
        </View>
        <TextInput placeholder="Cidade" style={[styles.inputField, { fontSize: ds(16) }]} />
        <TouchableOpacity style={styles.btnPrimary} onPress={() => { alert('Endereço atualizado!'); onSave(tempAddr || "Novo Endereço Salvo"); }}>
          <Text style={[styles.btnText, { fontSize: ds(18) }]}>Salvar Alterações</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const StartScreen = ({ onBack, onNext, ds }) => (
  <SafeAreaView style={[styles.container, { backgroundColor: COLORS.secondary }]}>
    <CustomHeader onBack={onBack} title="Como funciona?" ds={ds} />
    <ScrollView contentContainerStyle={styles.paddedContent}>
      <Text style={[styles.screenTitle, { fontSize: ds(32) }]}>Siga o passo a passo!</Text>
      <View style={styles.infoStepContainer}>
        <View style={styles.infoRow}>
          <View style={styles.stepCircle}><Text style={[styles.stepNumber, { fontSize: ds(16) }]}>1</Text></View>
          <View style={styles.stepTextContent}>
            <Text style={[styles.infoTitle, { fontSize: ds(18) }]}>Explore os Cantos</Text>
            <Text style={[styles.infoSubText, { fontSize: ds(14) }]}>Navegue pela nossa lista de parceiros e encontre o local ideal para o seu momento.</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.stepCircle}><Text style={[styles.stepNumber, { fontSize: ds(16) }]}>2</Text></View>
          <View style={styles.stepTextContent}>
            <Text style={[styles.infoTitle, { fontSize: ds(18) }]}>Escolha seus Cupons</Text>
            <Text style={[styles.infoSubText, { fontSize: ds(14) }]}>Cada local oferece vantagens exclusivas. Selecione o cupom que deseja usar e salve no seu perfil.</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.stepCircle}><Text style={[styles.stepNumber, { fontSize: ds(16) }]}>3</Text></View>
          <View style={styles.stepTextContent}>
            <Text style={[styles.infoTitle, { fontSize: ds(18) }]}>Valide no Local</Text>
            <Text style={[styles.infoSubText, { fontSize: ds(14) }]}>Ao chegar no estabelecimento, abra o app e apresente seu QR Code para validar o benefício na hora.</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.stepCircle}><Text style={[styles.stepNumber, { fontSize: ds(16) }]}>4</Text></View>
          <View style={styles.stepTextContent}>
            <Text style={[styles.infoTitle, { fontSize: ds(18) }]}>Aproveite seu Conto</Text>
            <Text style={[styles.infoSubText, { fontSize: ds(14) }]}>Agora é só relaxar, ler um bom livro e aproveitar seu café com o desconto garantido!</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.btnPrimary} onPress={onNext}>
        <Text style={[styles.btnText, { fontSize: ds(18) }]}>Entendi, vamos começar!</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  headerContainer: { height: 70, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', marginTop: Platform.OS === 'android' ? 35 : 0 },
  headerTitleText: { flex: 1, textAlign: 'center', fontWeight: 'bold', color: COLORS.accent, marginRight: 40 },
  backButton: { width: 45, height: 45, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 22.5 },
  backIcon: { fontWeight: 'bold' },
  scrollCenter: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30, paddingVertical: 40 },
  paddedContent: { padding: 25 },
  logoImage: { marginBottom: 40 },
  splashActions: { alignItems: 'center', marginBottom: 30 },
  splashLinkText: { color: COLORS.white, marginBottom: 10 },
  boldUnderline: { fontWeight: 'bold', textDecorationLine: 'underline' },
  splashTitle: { fontWeight: 'bold', textAlign: 'center', color: COLORS.white, marginBottom: 40 },
  screenTitle: { fontWeight: 'bold', color: COLORS.accent, marginBottom: 20 },
  formSectionTitle: { fontWeight: 'bold', color: COLORS.primary, marginBottom: 15 },
  inputField: { backgroundColor: COLORS.sectionBg, padding: 18, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#EEE', color: '#000' },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },
  btnPrimary: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 12, alignItems: 'center', width: '100%' },
  btnAcent: { backgroundColor: COLORS.accent, padding: 18, borderRadius: 12, width: '100%', alignItems: 'center' },
  btnText: { color: COLORS.white, fontWeight: 'bold' },
  homeHeader: { height: 130, backgroundColor: COLORS.primary, paddingHorizontal: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 30 },
  homeHeaderText: { color: COLORS.white, fontWeight: 'bold' },
  profileCircleSmall: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  homeBody: { flex: 1, backgroundColor: COLORS.secondary, borderTopLeftRadius: 40, marginTop: -20 },
  locationCard: { backgroundColor: COLORS.white, borderRadius: 20, overflow: 'hidden', marginBottom: 20, elevation: 4 },
  cardBanner: { height: 100, opacity: 0.8 },
  cardInfo: { padding: 15 },
  cardPlaceName: { fontWeight: 'bold', color: COLORS.accent },
  cardPlaceDesc: { color: '#666', marginVertical: 5 },
  badgeCupom: { backgroundColor: COLORS.secondary, alignSelf: 'flex-start', padding: 5, borderRadius: 5 },
  badgeText: { fontWeight: 'bold', color: COLORS.accent },
  profileHero: { alignItems: 'center', paddingVertical: 30, backgroundColor: COLORS.sectionBg },
  avatarLarge: { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: COLORS.primary, overflow: 'hidden' },
  changePhotoBtn: { marginTop: 10, marginBottom: 15, backgroundColor: COLORS.secondary, paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 },
  changePhotoText: { color: COLORS.accent, fontWeight: 'bold' },
  profileName: { fontWeight: 'bold', marginTop: 10 },
  sectionWrapper: { paddingHorizontal: 20, marginBottom: 20 },
  sectionLabel: { fontWeight: 'bold', color: COLORS.gray, marginBottom: 8, textTransform: 'uppercase' },
  sectionCard: { backgroundColor: COLORS.sectionBg, borderRadius: 15, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  menuIconWrapper: { width: 30 },
  menuText: { flex: 1, fontWeight: '500' },
  arrowIcon: { color: COLORS.gray },
  placeholderBox: { alignItems: 'center', marginVertical: 60 },
  placeholderEmoji: { fontSize: 80, marginBottom: 20 },
  placeholderTitle: { fontWeight: 'bold', color: COLORS.accent },
  placeholderDesc: { textAlign: 'center', color: '#666', marginTop: 10 },
  infoStepContainer: { marginBottom: 30 },
  infoRow: { flexDirection: 'row', marginBottom: 25 },
  stepCircle: { width: 35, height: 35, borderRadius: 17.5, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  stepNumber: { color: COLORS.white, fontWeight: 'bold' },
  stepTextContent: { flex: 1 },
  infoTitle: { fontWeight: 'bold', color: COLORS.primary, marginBottom: 5 },
  infoSubText: { color: '#555' },
  subCard: { backgroundColor: COLORS.sectionBg, padding: 15, borderRadius: 10, marginBottom: 10 },
  cardTitle: { fontWeight: 'bold', color: COLORS.accent },
  notifItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  // ESTILOS DO OLHO
  passwordInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.sectionBg, borderRadius: 15, paddingRight: 15, borderWidth: 1, borderColor: '#EEE' },
  eyeButton: { padding: 10 }
});