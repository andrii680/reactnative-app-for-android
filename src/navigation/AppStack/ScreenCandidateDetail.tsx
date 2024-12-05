import React,{useState,useEffect} from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import tw from '../../../tailwindcss';
import {http} from '../../helpers/http';

interface Props {
    navigation:NavigationProp<any>;
    route:RouteProp<any, any>;
}

const {width} = Dimensions.get('window');
const height = (5/8)*width;

const ScreenCandidateDetail: React.FC<Props> = ({ navigation, route }) => {

    // let phoneNumber : any;

    // if(!route.params){
    //     phoneNumber = route;
    // }else{
    //     phoneNumber = route.params;
    // }

    const {phoneNumber, profile} = route.params;

    const navigations = useNavigation();

    const [candidate, setCandate] = useState({});

    const fetchUserData = async () => {

        const response = await http.get('/user/get_user_data', {params:{phoneNumber}}); // Fetch data from the server
        const res_data = response.data.data[0]; // Extract the data from the
        return res_data;
    };
    
    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                try {
                    const tempCandidate = await fetchUserData();
                    setCandate(tempCandidate);
                } catch (error) {
                    console.error('Error fetching projects:', error);
                }
            };
            fetchData(); // Call the async function
                
        }, [navigations]) // Dependency array
    );

    console.log(candidate);

    const experience = {
        commitment_rating:'100',
        project_fulfilled:'1000000',
        choosen:'0',
        project_terminated:'100000',
        left_after_selection:'200000',
        biggest_investment:'30000',
        biggest_project:'300000'
    }

    const experienceArray = Object.entries(experience);

    const [isActive, setIsActive] = useState(false);
    
    const goProfile = () =>{
        navigation.navigate('ScreenProfile', candidate);
    }
        
    return(
        <View  style={tw`flex-1 justify-center bg-black pb-16`}>
            <ScrollView>
                <View style={styles.header_image}>
                    <View style={styles.containerImage}>
                        <Image
                            source={require('../../../assets/images/sea.jpg')}// Replace with your image URL
                            style={ {width: '100%', height: 200, resizeMode: 'cover', marginBottom:3 } }
                            resizeMode="cover"
                        />
                        <Text style={styles.overlayText}>{ candidate.name }</Text>

                        <TouchableOpacity
                        style={[styles.backButton, isActive && styles.activeButton]} // Apply active style when pressed
                        onPress={() => navigation.goBack()}
                        onPressIn={() => setIsActive(true)} // Set active state to true on press in
                        onPressOut={() => setIsActive(false)} // Reset active state on press out
                        >
                            <Icon name="chevron-left" size={20} color="white"/>
                        </TouchableOpacity>

                    </View>

                    <View style={styles.containerAvatar}>
                        <TouchableOpacity style={{width:'25%'}}>
                        {/* <TouchableOpacity style={{width:'25%'}} onPress={()=>goProfile()}> */}
                            <Image
                                source={require('../../../assets/images/man.png')} 
                                style={styles.image} 
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={{width:'25%', padding:5, backgroundColor:'#101214', 
                            borderRadius:10, justifyContent:'center', alignItems:'center', marginBottom:10}} >
                            <Text style={{color:'white', fontSize:10}}>Unverified</Text>
                        </TouchableOpacity> 
                        <TouchableOpacity style={{width:'25%', padding:5, backgroundColor:'#101214', 
                            borderRadius:10, justifyContent:'center', alignItems:'center', marginBottom:10}} >
                            <Text style={{color:'white', fontSize:10}}>Unverified</Text>
                        </TouchableOpacity> 
                        <TouchableOpacity style={{width:'25%', padding:5, backgroundColor:'#101214', 
                            borderRadius:10, justifyContent:'center', alignItems:'center', marginBottom:10}} >
                            <Text style={{color:'white', fontSize:10}}>Unverified</Text>
                        </TouchableOpacity> 
                    </View>
                </View>

                <View style={{justifyContent:'center', backgroundColor:'#000000', width:'100%',  marginLeft: 30, borderRadius:10}}>
                    <Text style={styles.history_title_text}>
                       Account History
                    </Text>
                    {experienceArray.map(([key, value]) => (
                        <View style={styles.project_detail} key={key}>
                            <View style={{ flex: 10,  justifyContent: 'center',  borderRadius:10,
                                overflow:'hidden' }}>
                                <Text style={styles.cadidate_info_text}>
                                    {key}
                                </Text>
                            </View>
                            <View style={{ flex: 4, padding: 5, justifyContent: 'right',  }}>
                                <TouchableOpacity style={styles.button} disabled>
                                    <Text style={styles.buttonText}>
                                        {key === 'commitment_rating' ? `${value}%` : 
                                        key === 'biggest_invest' ? `$${value}` : 
                                        key === 'biggest_project' ? `$${value}`:
                                        value}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>  
                    ))}
                </View>

                {(profile == 'true') && 
                <View style={styles.containerAvatar}>
                    <TouchableOpacity style={tw`bg-transparent mb-5 flex justify-center items-center h-10 w-25 bg-[#00A84F] rounded-[10] ml-10 mt-5`} 
                        onPress={() => navigation.goBack()} >
                        <Text style={tw`text-white text-[12px] font-abril`}>
                            Setting
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={tw`bg-transparent mb-5 flex justify-center items-center h-10 w-25 bg-[#211C1E] rounded-[10] mr-10 mt-5`} >
                        <Text style={tw`text-white text-[12px] font-abril`}>
                            Profile
                        </Text>
                    </TouchableOpacity>
                </View>}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
        
    header_image: {
        alignItems: 'center',
        justifyContent: 'center',
        // flexDirection: 'row',
        overflow:'hidden',
        width:'100%',
        height:height 
    },
    containerAvatar: {
        flexDirection: 'row', // Arrange items in a row
        justifyContent: 'space-between', // Optional: Space between images
        alignItems: 'center', // Center images vertically
        padding: 10, // Optional: Add padding around the container
    },
    image: {
        width: '90%',
        height: '62%',
        borderRadius:65,
        borderWidth: 2,
        borderColor: 'black', // Color of the square outline
    },

    containerImage: {
        backgroundColor:'grey',
        position: 'relative', // Set position relative for the parent container
        width: '100%',
        height: 140, // Adjust height as needed
    },
    
    overlayText: {
        position: 'absolute', // Position the text absolutely
        top: '90%',          // Center vertically
        left: '45%',         // Center horizontally
        transform: [{ translateX: -50 }, { translateY: -50 }], // Adjust for text size
        color: 'white',      // Text color
        fontSize: 20,        // Font size
        fontWeight: 'bold',  // Font weight
        textAlign: 'center', // Center text alignment
    },

    backButton: {
        position: 'absolute',
        top: 30, // Adjust as needed
        left: 15, // Adjust as needed
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
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
        width:'100%',
        height:45,
        marginTop:10,
        margin:'auto',
        overflow:'hidden'
    },
    button:{
        width:150,
        height:53,
        // backgroundColor:'#2E3771',
        borderRadius:15,
        // alignItems: 'flex-end',
    },

    cadidate_info_text:{
        color:'white',
        fontSize:14,
        fontWeight:'bold'
    },

    history_title_text:{
        color:'grey',
        textAlign:'center',
        fontSize:15,
        fontWeight:'bold'
    },

    activeButton: {
        // borderWidth: 2,
        // borderColor: 'grey', // Color of the square outline
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Optional: add a slight background color
    },

});

export default ScreenCandidateDetail;