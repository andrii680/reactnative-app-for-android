import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AuthStackParamList} from '.';
import tw from '../../../tailwindcss';
import countries from '../../lib/countryCode';
import GoBackIcon from '../../components/GoBackIcon';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'ScreenCountry'
>;

const CountryCodeCard = ({flag, country, code, onPress}) => {
  return (
    <TouchableOpacity onPress={() => onPress(flag)} activeOpacity={0.5} style={tw`flex-row items-center `}>
      <View
        style={tw`flex-row items-center bg-[#101214] rounded-[13px] w-full h-17.5 mb-7 px-1 font-dm text-[14px] 
        font-bold tracking-[0.5px]`}>
        <View style={tw`w-1/2 flex-row items-center`}>
          <View
            style={tw`h-7.5 w-15 ml-1.5 mr-5 rounded-[13px] overflow-hidden`}>
            <Image
              width={60}
              height={30}
              source={{
                uri: `https://flagcdn.com/w320/${flag.toLowerCase()}.png`,
              }}
            />
          </View>
          <Text style={tw`text-[#93999A] text-[14px] font-dm font-bold`}>
            {code}
          </Text>
        </View>
        <Text style={tw`text-white text-[14px] font-bold font-dm flex-shrink`}>
          {String(country).toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const ScreenCountry: React.FC<Props> = ({navigation, route}) => {

  const [searchCountry, setSearchCountry] = useState('');

  const filteredData = countries.filter(item => 
    item.name.toLowerCase().includes(searchCountry.toLowerCase())
  );

  const onPressGoBack = () => {
    navigation.goBack();
  };
  const onPressCode = (flag: string) => {

    if (route.params.from === 'sign_up') {
      navigation.navigate('ScreenSignup', {
        countryCode: flag,
      });
    }  else if (route.params.from === 'profile') {
      navigation.navigate('AppStack', {
        screen: 'ScreenProfile',
        params: {
          countryCode: flag,
        },
      });
    }else if(route.params.from === 'profileScreen'){
      navigation.navigate('AppStack', {
        screen: 'ScreenProfile',
        params: {
          countryCode: flag,
        },
      });
    } 
    else {
      navigation.navigate('ScreenSignup', {
        countryCode: flag,
      });
    }
  };
  return (
    <View  style={tw`flex-1 justify-center items-center bg-black`}>
      <View style={tw`mt-5 mb-5 flex-row items-center justify-center`}>
          <TouchableOpacity onPress={onPressGoBack} activeOpacity={0.5}>
            <View>
              <GoBackIcon onPress={() => navigation.goBack()} />
            </View>
          </TouchableOpacity>
          <Text style={tw`font-abril text-white text-[18px] ml-5 text-center`}>
            Countries
          </Text>
        </View>
      <TextInput
        style={tw`flex-row items-center bg-[#101214] rounded-[13px] w-95% h-17.5 mb-7 px-1 font-dm text-[14px] text-white font-bold tracking-[0.5px] pl-5`}
        placeholder="country name..."
        placeholderTextColor="grey"
        value={searchCountry}
        onChangeText={setSearchCountry}
      />
      <ScrollView>
        
        <View style={tw`mx-3`}>
          <FlatList
            data={filteredData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item: {name, dial_code, code}}) => (
              <CountryCodeCard
                flag={code}
                country={name}
                code={dial_code}
                onPress={onPressCode}
              />
            )}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  searchInput: {
    height: 40,
    width: 200,
    borderColor: 'gray',
    color:'white',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default ScreenCountry;
