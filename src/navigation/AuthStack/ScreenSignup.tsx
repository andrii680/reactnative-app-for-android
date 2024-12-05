import React, {useEffect, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import auth from '@react-native-firebase/auth';
import {AuthStackParamList} from '.';
import {http} from '../../helpers/http';
import { useAuth } from '../AuthContext';
import countries from '../../lib/countryCode';
import tw from '../../../tailwindcss';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'ScreenSignup'
>;

const regexp = /^\+[0-9]?()[0-9](\s|\S)(\d[0-9]{8,16})$/;
const initialCode = 'US';
// const initialCode = 'MY';

const ScreenSignup: React.FC<Props> = ({navigation, route}) => {
  
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState(initialCode);
  const countryNumber = countries.find(
    country => country.code === countryCode,
  ).dial_code;
  const {setPhoneNumber} = useAuth();
  const {setCountryPhonecode} = useAuth();
  
  const sendOTP = (phoneNumber: string) => {
      auth()
      .signInWithPhoneNumber(phoneNumber)
      .then(confirmResult => {
          navigation.navigate('ScreenOTP', {
          confirmResult:confirmResult, 
          phoneNumber,
          countryCode,
          from: 'sign_up',
        });
        
      })
      .catch(error => {
        console.log(error.message);
        alert(error.message);
      });
  };

  const onPressSignUp = () => {

    const phoneNumber = `${countryNumber}${phone}`;
    setPhoneNumber(phoneNumber);
    setCountryPhonecode(countryCode);
    if (!regexp.test(phoneNumber)) {
      alert('Please Enter Phone Number');
      return;
    }

    try {
        http.post('/user/check_user', {phoneNumber})
        .then(res => {
          if(!res){
            throw new Error('network response was not ok')
          }
          if (res.data.message === 'User already exists') {
            navigation.navigate('AppStack');
          } else {
            sendOTP(phoneNumber);
          }
        })
        .catch(function (error) {
          console.log("error is " + error);
          throw error;
        });
    } catch (error) {
      console.log(error);  
    }
    
  };


  useEffect(() => {
    if (route.params?.countryCode) {
      setCountryCode(route.params.countryCode);
    }
  }, [route.params?.countryCode]);
  const onPressCountry = () => {
    navigation.navigate('ScreenCountry', {
      from: 'sign_up',
    });
  };
  return (
    <View  style={tw`flex-1 justify-center items-center bg-black`}>
      <View style={tw`flex-1 justify-center items-center bg-black mb-20`}>
        <Text
          style={tw`mb-10 self-stretch text-center text-[32px] font-normal text-white font-medium font-abril`}>
          Welcome
        </Text>
        <View
          style={tw`flex-row justify-center items-center bg-[#101214] rounded-lg`}>
          <TouchableOpacity onPress={onPressCountry} activeOpacity={0.5}>
            <Image
              width={60}
              height={30}
              source={{
                uri: `https://flagcdn.com/w320/${countryCode.toLowerCase()}.png`,
              }}
              style={tw`mx-2.5`}
            />
          </TouchableOpacity>
          <Text style={tw`text-white text-[18px] font-dm font-bold`}>
            {countryNumber}
          </Text>
          <TextInput
            style={tw`text-white rounded-lg flex-1 font-dm font-bold text-[15px]`}
            value={phone}
            placeholder="Phone Number"
            placeholderTextColor="white"
            onChangeText={setPhone}
          />
        </View>
      </View>
      <View style={tw`absolute bottom-0 w-full`}>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={onPressSignUp}
          style={tw`h-20 shrink-0 rounded-t-5 bg-white flex-row justify-end items-center`}>
          <LinearGradient 
              colors={['#55ed9d', '#009F4B']} 
              style={{ padding: 3, borderRadius: 10, width: 100, height: 50, alignItems:'center', justifyContent:'center', marginRight:20}}
          >
              <Text style={{color:'white', fontWeight:'bold', fontSize:17 }}>Next</Text>
          </LinearGradient>
          
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ScreenSignup;
