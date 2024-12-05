import React, { useEffect, useState, useRef } from 'react';

import {
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  View, 
  Text, 
  TextInput,
  FlatList,
  ScrollView
} from 'react-native';

import { NavigationProp, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import firestore from '@react-native-firebase/firestore';

import moment from 'moment';
import { useAuth } from '../AuthContext';
import { http } from '../../helpers/http';
import tw from '../../../tailwindcss';

interface Props {
  navigation:NavigationProp<any>;
  route:RouteProp<any, any>;
}

const {width} = Dimensions.get('window');
const height = (5/8)*width;

const ScreenRoomChat: React.FC<Props> = ({ navigation, route }) => {

  const projectData = route.params.item;

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [channel, setChannel] = useState('general'); // Default channel
  const [userName, setUserName] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);

  const {phoneNumber} = useAuth();

  const candidateArray = projectData.selectedCandidates;

  const chatData = {
    "roomId":projectData.projectName + projectData.phoneNumber,
    "phoneNumber":projectData.phoneNumber,
    "userName":userName,
  }
  
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 9999, animated: true });
  };

  const getParticipants = async (chatRoomId: string) => {
    try {
      const chatRoomRef = firestore().collection('chats').doc(chatRoomId);
      
      // Fetch the chat room document
      const chatRoomDoc = await chatRoomRef.get();
      
      if (chatRoomDoc.exists) {
        const participants = chatRoomDoc.data()?.participants || [];
        console.log('Participants:', participants);
        return participants; // Return the participants array
      } else {
        console.log('Chat room does not exist.');
        return [];
      }
    } catch (error) {
      console.error('Error fetching participants: ', error);
      return [];
    }
  };

  useEffect(() => {

    if (!candidateArray.includes(projectData.phoneNumber)) {
      candidateArray.push(projectData.phoneNumber);
    }

    try {
      http.get('/user/get_user_data',{params:{phoneNumber}}).then(res => {
          const userData = res.data.data[0];
          setUserName(userData.name);
      });
    } catch (error) {
      console.error('Error communicating with server:', error);
    }
    
    const fetchParticipants = async () => {
      const participantsList = await getParticipants(chatData.roomId);
      setParticipants(participantsList);
    };

    fetchParticipants();

      const unsubscribe = firestore()
        .collection('chats')
        .doc(chatData.roomId)
        .collection('messages')
        .orderBy('createdAt', 'desc')
        .onSnapshot((querySnapshot) => {
          const messagesFirestore: any[] = [];
          querySnapshot.forEach((doc) => {
            messagesFirestore.push({ ...doc.data(), id: doc.id });
          });
          setMessages(messagesFirestore);
        });

      return () => unsubscribe();
    }, [chatData.roomId]);

  const onLeaveChatRoom = async() => {

    try {
      const chatRoomRef = firestore().collection('chats').doc(chatData.roomId);
      // Fetch the current participants
      const chatRoomDoc = await chatRoomRef.get();
      if (chatRoomDoc.exists) {
        const participants = chatRoomDoc.data()?.participants || [];
  
        // Filter out the participant to be removed
        const updatedParticipants = participants.filter((id: string) => id !== phoneNumber);
        // Update the Firestore document
        await chatRoomRef.update({ participants: updatedParticipants });
        navigation.goBack();
        console.log('Participant removed successfully!');
      } else {
        console.log('Chat room does not exist.');
      }
    } catch (error) {
      console.error('Error removing participant: ', error);
    }
  };

  const sendMessage = async () => {
    
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    scrollToTop();

    try {
      // Add message to the messages subcollection of the specified chat room
      await firestore()
        .collection('chats')
        .doc(chatData.roomId)
        .collection('messages')
        .add({
          senderId: chatData.userName, // Replace with the actual user ID
          message: message,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      // Clear the message input
      setMessage('');
    } catch (error) {
      console.error(error);
      alert('Error sending message' + error.message);
    }
  };

  return (
    <View  style={tw`flex-1 justify-center bg-black pb-5`}>
      <ScrollView ref={scrollViewRef}>
        <TouchableOpacity
              style={[styles.backButton, isActive && styles.activeButton]} // Apply active style when pressed
              onPress={() => navigation.goBack()}
              onPressIn={() => setIsActive(true)} // Set active state to true on press in
              onPressOut={() => setIsActive(false)} // Reset active state on press out
          >
            <Icon name="chevron-left" size={20} color="white" />
          </TouchableOpacity>

        <View style={tw`justify-center text-center mt-15`}>
          <Text style={tw`text-xl font-bold mb-4 text-slate-200 text-center`}>{projectData.projectName}</Text>
          <Text style={tw`text-sm mb-2 text-slate-200 text-center`}>{participants.length}</Text>
        </View>
        {(chatData.phoneNumber != phoneNumber) && 
          <View style={{justifyContent:'center', alignItems:'center', padding:1.5}}>
            <TouchableOpacity 
                onPress={onLeaveChatRoom}
                style={{width:150, height:40, backgroundColor:'#414B84', borderRadius:10, justifyContent:'center', 
                    alignItems:'center', marginLeft:'2%' }}
                activeOpacity={0.5}
            >
                <Text style={tw`text-white text-[12px] font-dm font-bold`}>Leave Chat Room</Text>
            </TouchableOpacity>
          </View>
        }
        
        <View style={styles.chat_rule}>
          <View style={tw`flex-1 justify-center items-center p-4 bg-gray-50 bg-transparent`}>
            <Text style={tw`text-center font-bold mb-4 text-slate-200`}>{projectData.description}</Text>
          </View>
        </View>

        <TextInput
          placeholder="Channel Name"
          value={channel}
          onChangeText={setChannel}
          style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
        />

        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          inverted
          renderItem={({ item }) => (
            <View style={tw`px-6`}>
              <Text style={tw`text-white text-lg`}>
                {
                  item.senderId + ' : ' + moment(item.createdAt * 1000).format('MM-DD HH:MM:SS')
                  // item.senderId + ':' + item.createdAt
                }</Text>
              <Text style={tw`text-gray-200 my-4 ml-3`}>{item.message}</Text>
            </View>
          )}
        />
      </ScrollView>
      <View style={styles.project_detail}>
            <TextInput
                style={styles.itemContainer}
                placeholderTextColor="gray"
                value={message} 
                onChangeText={setMessage} 
                placeholder="Type a message" 
                onSubmitEditing={sendMessage}
                returnKeyType="done"
            />
            <TouchableOpacity style={{backgroundColor:'#00B254',width:'20%',height:45, borderRadius:13, marginRight: 10,
              justifyContent:'center', alignItems:'center'}} onPress={()=>sendMessage()}>
                  <Text style={{color:'white', fontSize:16, fontWeight:'bold'}}>Send</Text>
              </TouchableOpacity>
        </View>
    </View>
  );

};

const styles = StyleSheet.create({
  errorText: {
      marginLeft:'10%',
      color: 'red',
  },
  invalid: {
      borderBottomColor: 'red',
      borderBottomWidth: 2,
  },
  header_image: {
      alignItems: 'center',
      justifyContent: 'center',
      // flexDirection: 'row',
      overflow:'hidden',
      width:width,
      height:height 
  },
  container: {
      // flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width:width*0.25,
      height:width*0.25,
      borderRadius:10,
      overflow:'hidden',
      marginBottom:8
  },
  image: {
      width: '100%',
      height: '100%',
      borderRadius:15
  },
  backButton: {
      position: 'absolute',
      top: 10, // Adjust as needed
      left: 20, // Adjust as needed
      padding: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
      borderRadius: 5,
  },
  buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight:'bold'
  },
  profile_text:{
      color:'white',
      fontWeight:'bold',
      fontSize:18,
      marginBottom:10
  },
  project_detail:{
      flexDirection:'row',
      // width:Dimensions.get('window').width*0.98,
      width:'94%',
      height:72,
      backgroundColor:'#101214',
      borderRadius:15,
      marginTop:14,
      margin:'auto',
      overflow:'hidden',
      justifyContent:'center',
      alignItems:'center'
  },

  chat_rule:{
    flexDirection:'row',
    // width:Dimensions.get('window').width*0.98,
    width:'94%',
    backgroundColor:'#101214',
    borderRadius:15,
    marginTop:14,
    margin:'auto',
    overflow:'hidden',
    justifyContent:'center',
    alignItems:'center'
},

  button:{
      width:width*0.22,
      height:width*0.11,
      backgroundColor:'#2E3771',
      borderRadius:10,
      justifyContent:'center',
      alignItems:'center',
  },
  cadidate_info_text:{
      color:'white',
      fontSize:14,
      fontWeight:'bold'
  },
  itemContainer: {
      flex:1,
      marginVertical: 5,
      marginHorizontal: 20,
      backgroundColor: '#101214',
      borderRadius: 10,
      height:70,
      // width:'96%',
      fontSize:16,
      color:'white',
      textAlign:'left'
  },

  activeButton: {
      // borderWidth: 2,
      // borderColor: 'grey', // Color of the square outline
      backgroundColor: 'rgba(255, 255, 255, 0.1)', // Optional: add a slight background color
  },

});

export default ScreenRoomChat;
