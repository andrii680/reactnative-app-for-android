import React, {useEffect, useState} from 'react';
import {
  View, 
  Text, 
  TextInput, 
  TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import { LinearGradient } from 'react-native-linear-gradient';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {AuthStackParamList} from '.';
import {useAtom} from 'jotai';
import {userAtom} from '../../store';
import {http} from '../../helpers/http';
import Loading from '../../components/Loading';
import tw from '../../../tailwindcss';

type Props = NativeStackScreenProps<AuthStackParamList, 'ScreenOTP'>;

const ScreenOTP: React.FC<Props> = ({navigation, route}) => {
  
  const [user, setUser] = useAtom(userAtom);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmResult, setConfirmResult] =
    useState<FirebaseAuthTypes.ConfirmationResult>(null);

  useEffect(() => {
    if (route.params?.confirmResult) {
      setConfirmResult(route.params.confirmResult);
      console.log(confirmResult);
    }
  }, [route.params]);

  const onPressConfirmCode = () => {
    setLoading(true);
    
    confirmResult
      .confirm(code)
      .then(confirmResponse => {
        
        if (route.params.from === 'sign_up') {
          
          const userData = {
            phoneNumber: route.params.phoneNumber,
            country: route.params.countryCode,
          };

          http.post('/user/register', userData).then(res => {
            if(res.data.message === 'new user registered successfully'){
              navigation.navigate('AppStack');
            }
          });
        
        } else if (route.params.from === 'profile') {
          
          const data = {
            type: route.params.type,
            value: route.params.value,
          };
          http
            .patch(`/user/update/${user._id}`, data)
            .then(response => {
              if (response.data.message === 'Phone number already exists') {
                alert('Phone number already exists');
              } else {
                if (response.data.data.password) {
                  AsyncStorage.setItem('passwordRequired', 'true');
                }
                setUser(response.data.data);
              }
              setLoading(false);
              navigation.goBack();
            })
            .catch(error => {
              setLoading(false);
              console.log({error});
            });
        }

      })
      .catch(error => {
        alert(error);
        setLoading(false);
        alert(error.message);
      });
  };
  return (
    <View style={tw`flex-1 justify-center items-center bg-black`}>
      <Text
        style={tw`mb-10 self-stretch text-center text-[32px] font-normal text-white font-medium font-abril`}>
        Verification Code
      </Text>
      <View style={tw`flex-row w-full justify-center `}>
        <View
          style={tw`flex-row items-center h-15 w-3/4 bg-white rounded-lg mt-10`}>
          <TextInput
            style={tw`bg-white rounded-lg flex-1 font-dm font-bold text-[18px] text-center`}
            value={code}
            placeholder="Code"
            onChangeText={setCode}
          />
        </View>
      </View>
      <Text style={tw`text-center mt-3 text-white text-xs font-bold mb-20`}>
        Please enter your code here to sign in
      </Text>
      <View style={tw`absolute bottom-0 w-full`}>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={onPressConfirmCode}
          style={tw`h-20 shrink-0 rounded-t-5 bg-white flex-row justify-end items-center`}>
          <LinearGradient 
              colors={['#f09867', '#FF5C00']} 
              style={{ padding: 3, borderRadius: 10, width: 100, height: 50, alignItems:'center', justifyContent:'center', marginRight:20}}
          >
              <Text style={{color:'white', fontWeight:'bold', fontSize:17 }}>Sign In</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      {/* <Loading visible={loading} /> */}
    </View>
  );
};

export default ScreenOTP;
