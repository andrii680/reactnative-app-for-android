import React,{useState,useEffect} from 'react';
import { Image, View, Keyboard, StyleSheet,Text } from 'react-native';

import {
  NativeStackScreenProps,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {RootStackParamList} from 'RootNavigator';
import ScreenPostProject from './ScreenPostProject';
import ScreenProjectList from './ScreenProjectList';
import ScreenProjectDetail from './ScreenProjectDetail';
import ScreenMyProjectsPanel from './ScreenMyProjectsPanel';
import ScreenCandidatesInProject from './ScreenCandidatesInProject';
import ScreenCandidateDetail from './ScreenCandidateDetail';
import ScreenChatRoutes from './ScreenChatRoutes';
import ScreenProfile from './ScreenProfile';
import ScreenRoomChat from './ScreenRoomChat';
import ScreenInterestedProjectList from './ScreenInterestedProjectList';
import { http } from '../../helpers/http';
import tw from '../../../tailwindcss';
import { useAuth } from '../AuthContext';

export type AppStackParamList = {
  AppStack_HomePageScreen?: {
    searchResult: {
      latitude: number;
      longitude: number;
      formatted_address: string;
      icon: string;
    };
  };
  AppStack_HotelDetailScreen: {
    item: any;
  };
  AppStack_SpotDetailScreen: {
    item: any;
  };
  AppStack_HotelSearch: undefined;
  AppStack_LocationSearch: undefined;
  AppStack_PriceFilterScreen: undefined;
  ScreenProfile: {
    name: String,
    email: String,
    phoneNumber: String,
    imageUrl:String,
    cityLiveIn:String,
    country: String,
    signed:Boolean
  };
  ScreenOTP: {
    confirmResult: FirebaseAuthTypes.ConfirmationResult;
    phoneNumber?: string;
    countryCode?: string;
    from?: string;
    type?: string;
    value?: string;
  };
  ScreenCountry: {
    from: string;
  };
};

const Tab = createBottomTabNavigator();

type Props = NativeStackScreenProps<RootStackParamList, 'AppStack'>;

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppStack: React.FC<Props> = ({navigation, route}) => {

  const {phoneNumber} = useAuth();

  const [userData, setUserData] = useState(false);

  var projectId : any = {"projectId": ""};

  const getUserData = () =>{
    try {
        http.get('/user/get_user_data',{params:{phoneNumber}}).then(res => {
            const data = res.data.data[0];
            setUserData(data);
        });
    } catch (error) {
            console.error('Error communicating with server:', error);
    }
  }

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF', // Color when the tab is active (clicked)
        tabBarInactiveTintColor: 'grey', // Color when the tab is inactive (normal)
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          // backgroundColor: '#101214', // Background color of the tab bar
          backgroundColor: '#0d0e0f',
          height:70,
          paddingBottom:10,
          paddingTop:10,
          position: 'absolute', // Required for shadow to work
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          elevation: 100, 
          borderColor:'#000000'
        },
      }}
    >
      <Tab.Screen 
          name="Home" 
          component={ MainStack}  
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <View>
                <Image 
                  source={require('../../../assets/images/icon/home.png')} // Path to your image
                  style={{ width: size, height: size, tintColor: color }} // Adjust size and color
                />
              </View>
            ),
          }}
          
      />
      <Tab.Screen 
        name="Chat" 
        component={ScreenChatRoutes} 
        options={{
          headerShown: false,
          // tabBarStyle: { display: 'none' },
          tabBarIcon: ({ color, size }) => (
            <View>
              <Image 
                source={require('../../../assets/images/icon/chat.png')} // Path to your image
                style={{ width: size, height: size, tintColor: color }} // Adjust size and color
              />
            </View>
          ),
        }}/>
      {/* <Tab.Screen name="My Projects" component={ScreenMyProjectsPanel} options={{headerShown: false}}/> */}
      {/* <Tab.Screen name="Candidate Panel" component={ScreenChatRoutes} options={{headerShown: false}}/> */}

      <Tab.Screen 
        name="Post Project" 
        options={{ 
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <View>
              <Image 
                source={require('../../../assets/images/icon/fire.png')} // Path to your image
                style={{ width: size, height: size, tintColor: color }} // Adjust size and color
              />
            </View>
          ),
        }}
      >
        {({ navigation, route }) => (
          <ScreenPostProject 
            navigation={navigation}
            route={projectId}
          />
        )}
      </Tab.Screen>

      <Tab.Screen 
        name="Projects" 
        component={ScreenInterestedProjectList} 
        options={{ 
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <View>
              <Image 
                source={require('../../../assets/images/icon/project1.png')} // Path to your image
                style={{ width: size, height: size, tintColor: color }} // Adjust size and color
              />
            </View>
          ),
        }}
      >
      </Tab.Screen>

      <Tab.Screen 
        name="Settings" 
        options={{ 
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <View>
              <Image 
                source={require('../../../assets/images/icon/settings.png')} // Path to your image
                style={{ width: size, height: size, tintColor: color }} // Adjust size and color
              />
            </View>
          ),
        }}
      >
        {({ navigation, route }) => (
          <ScreenProfile 
          navigation={navigation}
          route={userData}
        />
        )}
      </Tab.Screen>

    </Tab.Navigator>
  );
};

const MainStack: React.FC<Props> = ({navigation, route}) => {
  
  return (
    <Stack.Navigator initialRouteName="ScreenProjectList">
            
      <Stack.Screen
        name="ScreenPostProject"
        component={ScreenPostProject}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ScreenProjectList"
        component={ScreenProjectList}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ScreenMyProjectsPanel"
        component={ScreenMyProjectsPanel}
        options={{headerShown: false}}
      />

      {/* <Stack.Screen
        name="ScreenProjectDetail"
        component={ScreenProjectDetail}
        options={{headerShown: false}}
      /> */}
       
      {/* <Stack.Screen
        name="ScreenCandidatesInProject"
        component={ScreenCandidatesInProject}
        options={{headerShown: false}}
      />       */}
      <Stack.Screen
        name="ScreenCandidateDetail"
        component={ScreenCandidateDetail}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="ScreenProfile"
        component={ScreenProfile}
        options={{headerShown: false}}
      />  
      <Stack.Screen
        name="ScreenRoomChat"
        component={ScreenRoomChat}
        options={{headerShown: false}}
      />  
      <Stack.Screen
        name="ScreenChatRoutes"
        component={ScreenChatRoutes}
        options={{headerShown: false}}
      />  
      <Stack.Screen
        name="ScreenInterestedProjectList"
        component={ScreenInterestedProjectList}
        options={{headerShown: false}}
      />  

    </Stack.Navigator>
  );
};

export default AppStack;
