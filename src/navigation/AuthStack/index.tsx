import React, {useEffect} from 'react';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {
  NativeStackScreenProps,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppStack from '../../navigation/AppStack';
import ScreenCandidatesInProject from '../AppStack/ScreenCandidatesInProject';
import ScreenCandidateDetail from '../AppStack/ScreenCandidateDetail';
import ScreenProjectDetail from '../AppStack/ScreenProjectDetail';
import ScreenRoomChat from '../AppStack/ScreenRoomChat';
import ScreenProfile from '../AppStack/ScreenProfile';
import ScreenSignup from './ScreenSignup';
import ScreenCountry from './ScreenCountry';
import ScreenOTP from './ScreenOTP';
import {RootStackParamList} from 'RootNavigator';
import { AuthProvider } from '../AuthContext';

AsyncStorage.clear();
export type AuthStackParamList = {
  AppStack: {
    screen?: string;
  };
  ScreenSignup: {
    countryCode: string;
  };
  ScreenOTP: {
    confirmResult: FirebaseAuthTypes.ConfirmationResult;
    phoneNumber: string;
    countryCode: string;
    from?: string;
    type?: string;
    value?: string;
  };
  ScreenCountry: {
    from: string;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'AuthStack'>;

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack: React.FC<Props> = ({navigation, route}) => {
  
  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedin = await AsyncStorage.getItem('isLoggedIn');
      if (isLoggedin === 'true') {
        navigation.navigate('AuthStack', {screen: 'ScreenSignup'});
      }
    };
    checkAuth();
  }, []);
  
  return (

    <AuthProvider>
    
      <Stack.Navigator initialRouteName="ScreenSignup">
        <Stack.Screen
          name="ScreenSignup"
          component={ScreenSignup}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ScreenOTP"
          component={ScreenOTP}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ScreenCountry"
          component={ScreenCountry}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ScreenProfile"
          component={ScreenProfile}
          options={{headerShown: false}}
        />
        
        <Stack.Screen
          name="ScreenCandidateDetail"
          component={ScreenCandidateDetail}
          options={{headerShown: false}}
        />
        
        <Stack.Screen
        name="ScreenCandidatesInProject"
        component={ScreenCandidatesInProject}
        options={{
          headerShown: false
        }}
        />
        <Stack.Screen
        name="ScreenProjectDetail"
        component={ScreenProjectDetail}
        options={{
          headerShown: false
        }}
        />
        <Stack.Screen
        name="ScreenRoomChat"
        component={ScreenRoomChat}
        options={{
          headerShown: false
        }}
        />
        <Stack.Screen
          name="AppStack"
          component={AppStack}
          options={{headerShown: false}}
        />
        
      </Stack.Navigator>
    </AuthProvider>
  );
};

export default AuthStack;
