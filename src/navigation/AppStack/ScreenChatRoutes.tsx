import React,{useState,useEffect} from 'react';

import {
    View,
    Text,
    Image,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

import Loading from '../../components/Loading';
import tw from '../../../tailwindcss';
import {http} from '../../helpers/http';
import { useAuth } from '../AuthContext';

interface Props {
    navigation:NavigationProp<any>;
    route:RouteProp<any, any>;
}

const {width} = Dimensions.get('window');
const height = (5/8)*width;

interface ChatRoom {
    id: string;
    participants: string[];
  }

const ScreenChatRoutes: React.FC<Props> = ({ navigation, route }) => {

    const {phoneNumber} = useAuth();
    const navigations = useNavigation();

    // const projectList = route.params.roomChatAllowedProjects;
    
    const [loading, setLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [projectList, setProjectList] = useState([]);

    const fetchProjects = async () => {

        let projects = [];
        const response = await http.get('/project/chatallow_projects',  {params:{phoneNumber}}); // Fetch data from the server
        projects = response.data; // Extract the data from the response
        return projects;
    };
    
    const fetchChatRoomsForUser = async (userId: string): Promise<ChatRoom[]> => {
        try {
          const chatRoomsSnapshot = await firestore()
            .collection('chats')
            .where('participants', 'array-contains', userId)
            .get();
      
          const chatRooms: ChatRoom[] = chatRoomsSnapshot.docs.map(doc => ({
            id: doc.id,
            participants: doc.data().participants || [],
          }));
      
          return chatRooms;

        } catch (error) {
          console.error("Error fetching chat rooms: ", error);
          return [];
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                try {

                    setLoading(true);
                    const tempProjects = await fetchProjects();

                    const tempChatRoomList = await fetchChatRoomsForUser( phoneNumber );
                    
                    tempProjects.forEach((project) => {
                        const chatID = project.projectName + project.phoneNumber;
                        tempChatRoomList.forEach((chatRoom) => {
                            if(chatRoom.id == chatID){
                                setProjectList(prevItems => [...prevItems, project]);    
                            }
                        });
                    });
                   
                    setLoading(false);

                } catch (error) {
                    console.error('Error fetching projects:', error);
                }
            };

            setProjectList([]);
            fetchData(); // Call the async function
                
        }, [navigations]) // Dependency array
    );

    const goChatRoom = (item) => {
        navigation.navigate('ScreenRoomChat',{item});
    };

    const projectDetail = ({ item, index }) => (
        <TouchableOpacity onPress={()=>goChatRoom(item)}>
            <View style={styles.project_detail}>
                <View style={{  backgroundColor: 'black', justifyContent: 'center', alignItems: 'center',
                    borderRadius:10,overflow:'hidden' }}>
                    <Image
                        source={require('../../../assets/images/4.png')}
                        style={{width:80, height:80}}
                    />
                </View>
                <View style={styles.outerContainer}>
                    <View style={styles.innerContainer}>
                        <View style={styles.flex8}>
                            <Text style={styles.text}>{item.projectName}</Text>
                        </View>
                        <View style={styles.flex2}>
                            <Icon name="chevron-right" size={20} color="white"/>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
        
    );

    return(
        <SafeAreaView  style={tw`flex-1 bg-black pb-16`}>
            <TouchableOpacity
            style={[styles.backButton, isHovered && styles.hoveredButton]} // Apply hover style when hovered
            onPress={() => navigation.goBack()}
            onMouseOver={() => setIsHovered(true)} // Set hovered state to true on mouse enter
            onMouseLeave={() => setIsHovered(false)} // Reset hovered state on mouse leave
            >
                <Icon name="chevron-left" size={20} color="white" />
            </TouchableOpacity>
            <Text style={styles.panel_name}>Chat Room</Text>
            <View style={tw`mt-5 flex-row items-center justify-center w-full`}>
                {projectList && projectList.length > 0 ? (
                    <FlatList 
                        data={projectList}
                        renderItem={projectDetail}
                        keyExtractor={(item, index) => index.toString()}
                    />
                ) : (
                    <Text  style={{ textAlign: 'center', marginTop: 20, color: 'gray' }}>No projects you can chat.</Text>
                )}
            </View>
            <Loading visible={loading} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    project_detail:{
        flexDirection:'row',
        // width:Dimensions.get('window').width*0.98,
        width:'94%',
        height:92,
        backgroundColor:'black',
        borderRadius:10,
        marginTop:8,
        margin:'auto',
        overflow:'hidden',
        padding:6
    },
    panel_name:{
        marginTop:70,
        color:'white',
        fontSize:20,
        fontWeight:"bold",
        textAlign:'center'
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
        color: '#fff',
        fontSize: 18,
        fontWeight:'bold'
    },
    outerContainer: {
        flex: 1,
        padding: 5,
        justifyContent: 'center', // Center vertically
    },
    innerContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between', // Center the row content
    },
    flex8: {
        // height: '100%',
        flex:8,
        justifyContent: 'center',
        marginLeft:'5%'
        // alignItems: 'center',
    },
    flex2: {
    
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        
    },
    text: {
        color: 'white',
        fontSize: 18, // Optional: increase font size for better visibility
    },
   
});

export default ScreenChatRoutes;