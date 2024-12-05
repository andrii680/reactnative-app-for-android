import React,{useState,useEffect} from 'react';
import {
    Modal,
    View,
    Text,
    Button,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Dropdown } from 'react-native-element-dropdown';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { getAuth } from "firebase/auth";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useStripe} from '@stripe/stripe-react-native';
import { useAuth } from '../AuthContext';
import {http} from '../../helpers/http';
import tw from '../../../tailwindcss';

interface Props {
    navigation:NavigationProp<any>;
    route:RouteProp<any, any>;
}

const {width} = Dimensions.get('window');
const height = (5/7)*width;

const ScreenCandidatesInProject: React.FC<Props> = ({ navigation, route }) => {

    const {sending_data} = route.params;
    const {item} = sending_data;
    const {initPaymentSheet, presentPaymentSheet} = useStripe();

    const {phoneNumber} = useAuth();

    const [modalVisible, setModalVisible] = useState(false);
    const [selected, setSelected] = useState(false);
    const [candidates, setCandidates] = useState([]);
    const [chatAllowed, setChatAllow] = useState(item.paidStep == 'none' ? false : true);
    const [fulfillBtnDisabled, setFulfillBtnDisabled] = useState(item.paidStep == 'none' ? false : true);
    const [isActive, setIsActive] = useState(false);
    const [isPaid, setIsPaid] = useState(item.paidStep == 'none' ? false : true);
    const [payBtnDisabled, setPayBtnDisabled] = useState(item.paidStep == 'none' ? false : true); 
    const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(null);

    const navigations = useNavigation();

    if(item.selectedCandidates.includes(item.phoneNumber)){
        const index = item.selectedCandidates.indexOf(item.phoneNumber, 0);
        if (index > -1) {
            item.selectedCandidates.splice(index, 1);
        }
    }
    
    const autoGetCandidates= () => {
        
        if(item.projectCandidates.includes(item.phoneNumber)){

            const index = item.projectCandidates.indexOf(item.phoneNumber, 0);
            if (index > -1) {
                item.projectCandidates.splice(index, 1);
            }
        }

        const send_data = item.projectCandidates;
        
        http.get('/user/get_candidates', {params:{send_data}}).then(res=>{
            setCandidates(res.data.data);
        });
    }

    useFocusEffect(

        React.useCallback(
            ()=>{
                autoGetCandidates();
            },[navigations]
        )
    );

    const onCandidateSelect = (phoneNumber) => {

        navigation.setOptions({
            tabBarVisible: false
        })

        const send_data = {
            project_id : item._id,
            candidate_phoneNumber:phoneNumber
        }
        
        setSelected(!selected);
        item.selectedCandidates.push(phoneNumber);

        http.post('/project/select_candidate',{send_data}).then(res=>{
            if(res.data.message == 'successful'){
            }
        });
    }

    const onCandidateUnSelect = (phoneNumber) => {

        const send_data = {
            project_id : item._id,
            candidate_phoneNumber:phoneNumber
        }
        
        setSelected(!selected);

        if(item.selectedCandidates.includes(phoneNumber)){
            const index = item.selectedCandidates.indexOf(phoneNumber, 0);
            if (index > -1) {
                item.selectedCandidates.splice(index, 1);
            }
        }

        http.post('/project/select_uncandidate',{send_data}).then(res=>{
            if(res.data.message == 'successful'){
                console.log("unselect success");
            }
        });
    }

    const onPayEvent = () =>{

        if(item.selectedCandidates.length == 0){
            alert('First, you need to select the candidates you need.');
        }else{
            showDialogPay();
        }
    }

    const showDialogPay = async () => {

        const response = await http.post('/create-payment-intent', {
          amount: item.budget / 100 * item.selectedCandidates.length
        });

        const {clientSecret, customer, paymentIntentId} = response.data;

        const {error} = await initPaymentSheet({
            customerId: customer,
            paymentIntentClientSecret: clientSecret,
            merchantDisplayName: 'hotel-booking-app-sonnet',
          });

          if (error) {
            console.log(error);
          } else {
            const {error} = await presentPaymentSheet();
            if (error) {
              console.log(error);
            } else {
              //success
              const itemId = item._id
              http.post('/project/first_pay',{itemId}).then(res=>{
                if(res.data.message == 'paid success'){
                    //pay success
                        setChatAllow(!chatAllowed);
                        setFulfillBtnDisabled(!fulfillBtnDisabled);
                        setPayBtnDisabled(true);
                        setIsPaid(true);
                        item.paidStep = 'first';
                    }
                });
            }
        }
    };

    const onGoCandidateDetailScreen = (candidate) => {
        const phoneNumber = candidate.phoneNumber;
        navigation.navigate('ScreenCandidateDetail', {phoneNumber:phoneNumber, profile:'false'});
    }

    const onTerminateProject = () =>{
        //terminate project event
        const projectId = item._id;
        http.post('/project/terminate_project',{projectId}).then(res=>{
            if(res.data.message == 'project terminate success!'){
                navigation.goBack();
            }
        });
    }

    const onChatEvent = () => {
        //create chat room
        const candidateArray = item.selectedCandidates;

        if (!candidateArray.includes(item.phoneNumber)) {
            candidateArray.push(item.phoneNumber);  
          }

        const chatData = {
            roomId : item.projectName + item.phoneNumber,
            participants : candidateArray,
        }

        createChatRoom(chatData);
    }

    const createChatRoom = async(chatData) => {
        
        try {
            // Create chat room with project name + phone number

            await firestore().collection('chats').doc(chatData.roomId).set({
                participants: chatData.participants,
                createdAt: firestore.FieldValue.serverTimestamp(),
                lastMessage: '',
                lastMessageTime: firestore.FieldValue.serverTimestamp(),
              });

            const itemId = item._id
              
            // when you create the chat room, project.roomChat = true.
            http.get('/project/roomchat_allow', {params:{itemId}}).then(res=>{
                navigation.navigate('ScreenRoomChat', {item});
            });

          } catch (error) {
            console.error(error);
            alert('Error registering user:' + error.message);
          }
    };

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setScreenDimensions(window);
        });

        return () => {
            subscription?.remove();
        };
    }, []);

    const handleCloseModal = () => {
        setModalVisible(false);
    };

    const setProjectPanel = () => {
        navigation.navigate('ScreenProjectDetail', {item});
    };

    const onEditProjectDetail = () =>{
       const projectId = item._id;
       http.get('/project/get_project', {params:{projectId}}).then(res=>{
            const returnProject = res.data.data;
            navigation.navigate('ScreenPostProject', returnProject);
        });
    }

    const { width } = screenDimensions;
    const buttonSize = width / 4; // Calculate size based on screen width

    let dropdownData = [
        { label: 'Project', value: '1' },
      { label: 'Edit', value: '2' },
      { label: 'Terminate', value: '3' },
    ];
    
    let dropdownData1 = [
        { label: 'Project', value: '1' },
    ];

    useEffect(() =>{

        switch(selectedValue){
            case '1':
                setSelectedValue(null);
                setProjectPanel();
                break;
            case '2':
                setSelectedValue(null);
                onEditProjectDetail();
                break;
            case '3':
                setSelectedValue(null);
                setModalVisible(true);
                break;
            default:
                break;    
        };
    },selectedValue);

    return(
        <View  style={tw`flex-1 justify-center bg-black pb-20`}>
            <ScrollView>
                <Modal
                    animationType="none"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={handleCloseModal}
                >
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Are you sure you want to terminate the project?</Text>
                        <View style={{flexDirection:'row'}}>

                            <TouchableOpacity style={{backgroundColor:'white',width:'40%', borderRadius:10,
                            justifyContent:'center', alignItems:'center', padding: 10, marginRight:20, borderWidth: 1.5, borderColor:'black'}} 
                            onPress={() => onTerminateProject()}>
                                <Text style={{color:'black', fontSize:16, fontWeight:'bold'}}>Yes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{backgroundColor:'#790000',width:'40%', borderRadius:10,  padding: 10,
                            justifyContent:'center', alignItems:'center'}} 
                            onPress={() => handleCloseModal()}>
                                <Text style={{color:'white', fontSize:16, fontWeight:'bold'}}>No</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <View style={styles.header_image}>
                    <View style={styles.container}>
                        <Image 
                            source={require('../../../assets/images/sea.jpg')} 
                            style={styles.image}
                        />
                        <Dropdown
                            style={[styles.dropdown, { borderWidth: 0, marginTop:5 }]} // Set borderWidth to 0
                            
                            data={ (!isPaid &&  (phoneNumber == item.phoneNumber) ) ? dropdownData : dropdownData1}
                            labelField="label"
                            valueField="value"
                            value={selectedValue}
                            onChange={item => {
                                setSelectedValue(item.value);
                                setIsDropdownOpen(false);
                            }}
                            onFocus={() => setIsDropdownOpen(true)} // Open dropdown on focus
                            onBlur={() => setIsDropdownOpen(false)}
                            containerStyle={styles.dropdownContainer}
                           
                            renderItem={(item) => (
                                <View style={styles.dropdownItem}>
                                    <Text style={{color:'black'}}>{item.label}</Text>
                                </View>
                            )}
                            placeholder="" 
                            renderRightIcon={() => (
                                isDropdownOpen ? ( // Show circular icon only when dropdown is open
                                    <View style={styles.circleIconContainer}>
                                        <MaterialIcons name="more-vert" size={30} color="black" />
                                    </View>
                                ) : (<MaterialIcons name="more-vert" size={30} color="black" />)
                            )}/>

                         <TouchableOpacity
                            style={[styles.backButton, isActive && styles.activeButton]} // Apply active style when pressed
                            onPress={() => navigation.goBack()}
                            onPressIn={() => setIsActive(true)} // Set active state to true on press in
                            onPressOut={() => setIsActive(false)} // Reset active state on press out
                        >
                            <Icon name="chevron-left" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{flexDirection:'row', backgroundColor:'#101214', width:'100%', 
                    height:Dimensions.get('window').width*0.17}}>
                    <View style={{flex:7, justifyContent:'center', marginLeft:'10%'}}>
                        <Text style={{color:'white'}}>{item.projectCandidates.length}/{item.available}</Text>
                    </View>
                    
                    <View style={{flex:3, justifyContent:'center', alignItems:'center' }}>
                        {fulfillBtnDisabled ? <TouchableOpacity style={{backgroundColor:'#5328C9',width:'80%',height:'50%', borderRadius:10, 
                            justifyContent:'center', alignItems:'center', marginRight:20}} 
                            onPress={() => onChatEvent()}>
                            <Text style={{color:'white', fontSize:16, fontWeight:'bold'}}>Chat</Text>
                        </TouchableOpacity>
                        :
                        (<TouchableOpacity style={{ backgroundColor:'#5328C9',width:'80%',height:'50%', borderRadius:10, 
                            justifyContent:'center', alignItems:'center', marginRight:20, }}
                            disabled>
                            <Text style={{color:'white', fontSize:16, fontWeight:'bold'}}>Fulfill</Text>
                        </TouchableOpacity>)}
                    </View>
                </View>

                <View style={{justifyContent:'center', alignItems:'center', marginTop:8}}>
                    <Text style={styles.text}>{item.projectName}</Text>
                    <Text style={[styles.text,{marginTop:3}]}>Application Candidates</Text>
                    <Text style={{fontSize:9, color:'white', marginBottom:5, marginTop:5}}>
                        Please Select {item.available} Candidates And Fullfill The Project
                    </Text>
                </View>

                <View style={styles.available_button_container}>

                    {candidates.map((candidate, index) => (

                        <View style={{alignItems:'center',width:'25%',marginHorizontal:15, backgroundColor:'black', 
                        marginBottom:5, borderRadius:10}}>
                            <TouchableOpacity style={[styles.buttonContainer, { width: buttonSize, height: buttonSize }]} 
                            onPress={() => onGoCandidateDetailScreen(candidate)}>
                                <View>
                                    <Image 
                                    source={{ uri: `https://posting.backend.server.marketmajesty.net/${candidate.profileImage}` }} 
                                    // source={require('../../../assets/images/download.png')}
                                    style={{width:'100%', height:'100%'}}/>
                                </View>
                            </TouchableOpacity>
                            <Text style={styles.candidate_text}>{candidate.name}</Text>

                            {!item.selectedCandidates.includes(candidate.phoneNumber) && !isPaid && (phoneNumber == item.phoneNumber) && (
                                <TouchableOpacity style={{borderRadius:5, marginTop:3,}} 
                                onPress={() => onCandidateSelect(candidate.phoneNumber)}>
                                    <LinearGradient 
                                        colors={['#535353', '#090909']} 
                                        style={{ padding: 3, borderRadius: 5, width: 60 }}
                                    >
                                        <Text style={{ color: 'white', textAlign: 'center', fontSize:8 }}>select</Text> 
                                    </LinearGradient>
                                 </TouchableOpacity>
                            )}

                            {item.selectedCandidates.includes(candidate.phoneNumber) && !isPaid && (phoneNumber == item.phoneNumber) &&(
                                <TouchableOpacity style={{borderRadius:5, marginTop:3,}} 
                                onPress={() => onCandidateUnSelect(candidate.phoneNumber)}>
                                    <LinearGradient 
                                        colors={['#535353', '#090909']} 
                                        style={{ padding: 3, borderRadius: 5, width: 60 }}
                                    >
                                        <Text style={{ color: 'white', textAlign: 'center', fontSize:8 }}>unSelect</Text> 
                                    </LinearGradient>
                                 </TouchableOpacity>
                            )}

                            {item.selectedCandidates.includes(candidate.phoneNumber) && (
                                <Text style={{position:'absolute', color:'red', top:10, right:5, backgroundColor:'#364251', 
                                    padding:2, borderRadius:5, fontSize:8, width:32}}>Report</Text>    
                            )}
                        </View>
                    ))}
                </View>
            </ScrollView>
            
            {!isPaid && (item.selectedCandidates.length > 0) &&<View style={{ position:'absolute', height:width*0.15, backgroundColor:'white', bottom:0, width:'100%', 
                borderTopEndRadius:10, borderTopLeftRadius:10, justifyContent:'center'}}>
                    <View style={styles.innerContainer}>
                        <View style={styles.flex8}>
                            <Text style={{fontSize:18, fontWeight:'bold', color:'black'}}>Total ${item.budget / 100 * item.selectedCandidates.length}</Text>
                        </View>
                        <View style={styles.flex2}>
                        {
                            (phoneNumber == item.phoneNumber) &&
                            <TouchableOpacity onPress={() => onPayEvent()} disabled={payBtnDisabled}>
                                <LinearGradient 
                                    colors={['#55ed9d', '#009F4B']} 
                                    style={{ padding: 3, borderRadius: 10, width: 100, height: 35, alignItems:'center', justifyContent:'center'}}
                                >
                                    <Text style={{color:'white', fontWeight:'bold'}}>Pay</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        }
                        </View>
                    </View>
            </View>}
        </View>
    );
};

const styles = StyleSheet.create({

    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },

    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        color: 'black'
    },

    header_image: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        overflow:'hidden' 
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 200
    },
    backButton: {
        position: 'absolute',
        top: 20, // Adjust as needed
        left: 20, // Adjust as needed
        padding: 10,
        // backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight:'bold'
    },
    available_button_container: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Allows buttons to wrap to the next line
        justifyContent: 'space-between', // Space between buttons
        padding: 10,
        width:'93%',
        margin:'auto'
    },
    button: {
        width: width * 0.25,
        height: width * 0.25,
        overflow: "hidden",
        borderRadius: 25,
        // borderColor: "green",
        // borderWidth:3 
    },
    candidate_text:{
        marginTop: 3, // Adds space between the image and text
        fontSize: 9, // Adjust font size as needed
        color: 'white', // Change text color if necessary
        textAlign: 'center', 
        
    },
    text:{
        color:'white',
        fontSize:16,
        fontWeight:'bold'
    },
    innerContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        // alignItems:'center'
    },
    flex8: {
        height: '100%',
        justifyContent: 'center',
        // alignItems: 'center',
        flex: 7,
        marginLeft:'5%'
    },
    flex2: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 3,
        height: '100%', // Ensure it takes full height for vertical centering
    },
    activeButton: {
        // borderWidth: 2,
        // borderColor: 'grey', // Color of the square outline
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Optional: add a slight background color
    },
    buttonContainer: {
        margin: 5, // Space between buttons
        borderRadius: 20,
        overflow: 'hidden', // To round the corners of the image
    },
    buttonSpacing: {
        width: 30,
            // Adjust this value for more or less space
    },
    dropdown: {
        position: 'absolute', // Position the dropdown absolutely
        top: 0, // Adjust this value based on the button height
        right: 1, // Align to the left of the button
        maxHeight: 'auto', // Set maxHeight if needed
        overflow: 'visible',
        
        width: 100, // Set width to match the button
        borderRadius: 5,
        zIndex: 1, // Ensure dro
      
    },
    
    dropdownContainer:{
        // position:'absolute',
        // top:65,
        // right:0,        
        maxHeight: 'auto', // or set a maxHeight if needed
        overflow: 'visible',
        backgroundColor:'#F0F0F0',
        width:100,
        borderRadius:5,
    },
    dropdownContainer1:{
        position:'absolute',
        top:65,
        right:0,        
        maxHeight: 'auto', // or set a maxHeight if needed
        overflow: 'visible',
        backgroundColor:'#F0F0F0',
        width:100,
        borderRadius:5,
    },
    dropdownItem: {
        paddingVertical: 5, // Adjust vertical padding
        paddingHorizontal: 10, // Adjust horizontal padding
        // lineHeight: 1, // Set line height for tighter spacing
    },
    circleIconContainer: {
        width: 30, // Adjust size as needed
        height: 30, // Adjust size as needed
        borderRadius: 15, // Half of width/height for a perfect circle
        backgroundColor: 'lightgray', // Background color for the circle
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 5, // Adjust margin as needed
    },
});

export default ScreenCandidatesInProject;