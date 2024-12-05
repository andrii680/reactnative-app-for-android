import React,{useState, useEffect} from 'react';
import {
    Modal,
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Button,
    Dimensions,
    SafeAreaView,

} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import Sound from 'react-native-sound';

import { http } from '../../helpers/http';
import tw from '../../../tailwindcss';
import { useAuth } from '../AuthContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ImageGrid from '../../components/ImageGrid';
interface Props {
    navigation:NavigationProp<any>;
    route:RouteProp<any, any>;
}

Sound.setCategory('Playback');

const {width} = Dimensions.get('window');
const height = (4/7)*width;

const ScreenProjectDetail: React.FC<Props> = ({navigation, route}) => {

    const {phoneNumber} = useAuth();
    const {countryPhoneCode} = useAuth();
    const {item, from} = route.params;
    const navigations = useNavigation();

    const [modalVisible, setModalVisible] = useState(false);
    const [applybutton, setApplyButton] = useState(false);
    const [isActive, setIsActive] = useState(false); 
    const [selectedValue, setSelectedValue] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [imagesArray, setImagesArray] = useState<any[]>([]);

    const [sound, setSound] = useState<Sound | null>(null);

    const handleCloseModal = () => {
        setModalVisible(false);
    };

    useFocusEffect(
        React.useCallback(()=>{

            if(item.projectCandidates.includes(phoneNumber)){
                setApplyButton(true);
            }
            setImagesArray([]);
            getProjectImageArray();
            loadAudio();
        },[navigations])
    );


    const getProjectImageArray = () =>{
        
        item.projectImageUrl.forEach((image) => {
            
            const imagePath = image.path.replaceAll('\\', '/');
            // const serverUrl = "http://192.168.148.98:3000/" + imagePath
            const serverUrl = "https://posting.backend.server.marketmajesty.net/" + imagePath
            setImagesArray(prevItems => [...prevItems, serverUrl]);
        });
    }

    const applyProject = () =>{

        const project = item._id;
        if(item.phoneNumber == phoneNumber){
            alert('this is your project');
            return;
        }
        
        http.post('/project/apply_project',{phoneNumber, project}).then(res=>{
            
            if(res.data.message == "no candidate"){
                setModalVisible(true);
            }else{
                setApplyButton(true);
            }
        });
    };

    const handleDataFromImageGrid = () => {

    }

    const loadAudio = () => {
        // Replace with your server URL and audio file path

        if(!item.audioFile) 
            return;
        const imagePath = item.audioFile.replaceAll('\\', '/');
        const audioPath = `https://posting.backend.server.marketmajesty.net/${imagePath}`;
        // const audioPath = `http://localhost:3000/${imagePath}`;
        
        const newSound = new Sound(audioPath, null, (error) => {
          if (error) {
            console.error('Failed to load the sound', error);
            alert('Failed to load audio file');
          }
        });
    
        setSound(newSound);
      };

    const onPlayAudioFile = () =>{

        console.log("onplayaudiofile");
        
        if (sound) {
            sound.play((success: boolean) => {
              if (!success) {
                alert('Playback failed');
              }else{
                console.log('Play Success!');
              }
            });
          } else {
            alert('Sound not loaded');
          }
    }

    const onCandidatePanel = () => {
        const sending_data = {candidates:item.projectCandidates,  item:item};
        navigation.navigate('ScreenCandidatesInProject',{sending_data});
    }
    
    const onRegisterProfile = () =>{
        try {
            http.get('/user/get_user_data',{params:{phoneNumber}}).then(res => {
                const data = res.data.data[0];
                navigation.navigate('ScreenProfile', data);
            });
        } catch (error) {
                console.error('Error communicating with server:', error);
        }
        setModalVisible(false);
    }
        
    const buttons = Array.from({ length: item.available }, (_, i) => `seat ${i + 1}`);

    let dropdownData = [
        { label: 'Candidate', value: '1' },
      ];
    
    useEffect(() =>{

        switch(selectedValue){
            case '1':
                setSelectedValue(null);
                onCandidatePanel();
                break;
            default:
                break;    
    };
    },selectedValue);

    useEffect(() => {
        return () => {
          if (sound) {
            sound.release();
          }
        };
      }, [sound]);

    return(
        <View style={tw`flex-1 justify-center bg-black`}>
            <ScrollView>
                <Modal
                    animationType="none"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={handleCloseModal}
                >
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>You have to first register your profile.</Text>
                        <View style={{flexDirection:'row'}}>
                            <TouchableOpacity style={{backgroundColor:'#790000',width:'40%', borderRadius:10,
                            justifyContent:'center', alignItems:'center', padding: 10, marginRight:20, }} 
                            onPress={() => onRegisterProfile()}>
                                <Text style={{color:'white', fontSize:16, fontWeight:'bold'}}>Register</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{backgroundColor:'white',width:'40%', borderRadius:10,  padding: 10,
                            justifyContent:'center', alignItems:'center', borderWidth: 1.5, borderColor:'black' }} 
                            onPress={() => handleCloseModal()}>
                                <Text style={{color:'black', fontSize:16, fontWeight:'bold'}}>Close</Text>
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
                            data={dropdownData}
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
                <View style={{flexDirection:'row', backgroundColor:'#101214', width:'100%', height:86}}>
                    <View style={{width:'64%', justifyContent:'center', marginLeft:'6%'}}>
                        <Text style={{color:'white'}}>${item.budget}</Text>
                        <Text style={{color:'white', fontSize:12}}>I am capable of investing this amount</Text>
                    </View>
                    <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                        {applybutton && (item.phoneNumber != phoneNumber) && <TouchableOpacity style={{backgroundColor:'#323B74',
                        width:'80%',height:45, borderRadius:13, 
                            justifyContent:'center', alignItems:'center'}}>
                                <Text style={{color:'white', fontSize:16, fontWeight:'bold'}}>Applied</Text>
                            </TouchableOpacity>
                        }
                        {!applybutton && (item.phoneNumber != phoneNumber) && <TouchableOpacity onPress={()=>applyProject()}>
                                <LinearGradient 
                                    colors={['#55ed9d', '#009F4B']} 
                                    style={{ padding: 3, borderRadius: 10, width: 100, height: 40, alignItems:'center', justifyContent:'center'}}
                                >
                                    <Text style={{color:'white', fontWeight:'bold'}}>Apply</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        }
                        {(item.phoneNumber == phoneNumber) && <Text style={{color:'white', fontSize:16, fontWeight:'bold'}}>
                            My Project</Text>}
                    </View>
                </View>
                <Text style={{textAlign:'center' ,color:'white',fontSize:20, fontWeight:'bold', marginTop:9 }}>
                    {item.projectName}
                </Text>
                {/* //------placing seat buttons here------------------------------------ */}
                <View style={styles.available_button_container}>
                    {buttons.map((buttonTitle, index) => (
                        <TouchableOpacity key={index} style={[styles.button, index < item.projectCandidates.length ? styles.greenButton : styles.greyButton]}>
                            <Text style={styles.available_button_text}>{buttonTitle}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                {/* //------placing seat buttons here------------------------------------ */}
                <View style={{backgroundColor:'#101214', height:54, justifyContent: 'space-between', alignItems: 'center', margin:'auto', 
                    width:'93%', flexDirection: 'row', borderRadius:10, marginTop:8, paddingLeft:10}}>
                    {item.audioFile && <>
                        <TouchableOpacity style={styles.audio_play_button} onPress={() => onPlayAudioFile()}>
                        <View style={styles.audio_play_triangle} />
                        </TouchableOpacity>
                        <Text style={styles.description_content}>{item.audioFile}</Text></>}
                    {!item.audioFile && <Text style={styles.description_content}>No Audio File</Text>}
                </View>
                <View style={[styles.description_container,{marginTop:30}]}>
                    <Text style={styles.description_title}>About The {item.projectName}</Text>
                    <Text style={[styles.description_content,{marginTop:20}]}>{item.description}</Text>
                </View>
                <View style={[styles.description_container,{marginTop:20}]}>
                    <Text style={styles.description_title}>Location</Text>
                    <Text style={[styles.description_content,{marginTop:5}]}>{item.location}</Text>
                </View>
                <View style={[styles.description_container,{marginTop:5}]}>
                    <Text style={styles.description_title}>Information</Text>
                    <Text style={[styles.description_content,{marginTop:5}]}>Total Budget of The Project: ${item.budget}</Text>
                    <Text style={styles.description_content}>Seat Available: {item.available}</Text>
                    <Text style={styles.description_content}>Investment For Every Seat: ${item.budget/item.available}</Text>
                    <Text style={styles.description_content}>Ownership for : {item.ownershipForEverySeat}%</Text>
                </View>
                <View style={[styles.description_container,{marginTop:5}]}>
                    <Text style={styles.description_title}>Project Type</Text>
                    <Text style={[styles.description_content,{marginTop:5}]}>{item.projectType}</Text>
                </View>

                <SafeAreaView style={styles.bottom_container}>
                    <ImageGrid images={imagesArray} removeable={false} onSendData={handleDataFromImageGrid}/>
                </SafeAreaView>

            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({

    bottom_container: {
        flex: 1,
        flexDirection: 'row',
        marginLeft:20,
        // alignItems: 'center', // Center vertically
        gap: 10,
        marginTop:10
    },

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
        
        overflow:'hidden'
    },
    image: {
        width: '100%',
        height:300,
        resizeMode: 'cover',
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
    row: {
        justifyContent: 'space-between', // Space between buttons in a row
    },
    button: {
        width: '18%', // Adjust width to fit 5 buttons in a row
        marginBottom: 10, // Space between rows
        backgroundColor: '#00BE5A', // Button color
        padding: 8,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent:'center',
        height:60,
        marginHorizontal:3
    },
    greenButton: {
        backgroundColor: '#00BE5A', // Blue color for the first three buttons
    },
    greyButton: {
        backgroundColor: '#101214', // Grey color for the rest of the buttons
    },
    available_button_container: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Allows buttons to wrap to the next line
        justifyContent: 'space-between', // Space between buttons
        // padding: 10,
        marginTop:15,
        width:'93%',
        margin:'auto'
    },
    available_button_text:{
        color: 'white',
        fontSize: 12,
        fontWeight:'bold'
    },
    audio_play_button:{
        width: 35,
        height: 35,
        borderRadius: 25, // Makes the button circular
        backgroundColor: '#00BE5A', // Button color
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft:'3%'
    },
    audio_play_triangle: {
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 16,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: 'white', 
        transform: [{ rotate: '90deg' }]
    },
    description_container:{
        flex:1,
        justifyContent: 'center', // Center vertically
        alignItems: 'center', // Center horizontally
        
    },
    description_content:{
        width:'85%',
        fontSize:12,
        color:'white',
        lineHeight:13
    },
    description_title:{
        width:'93%',
        color:'white', 
        fontWeight:'bold',
        fontSize:16,
        margin:'auto'
    },
    activeButton: {
        // borderWidth: 2,
        // borderColor: 'grey', // Color of the square outline
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Optional: add a slight background color
    },
    buttonSpacing: {
        width: 10,
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

export default ScreenProjectDetail;