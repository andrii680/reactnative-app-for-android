import React,{useState,useEffect} from 'react';

import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { launchImageLibrary } from 'react-native-image-picker';

import { NavigationProp, RouteProp } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

import countries from '../../lib/countryCode';
import { useAuth } from '../AuthContext';
import {http} from '../../helpers/http';
import tw from '../../../tailwindcss';

interface Props {
    navigation:NavigationProp<any>;
    route:RouteProp<any, any>;
}

const {width} = Dimensions.get('window');
const height = (5/8)*width;

const ScreenProfile: React.FC<Props> = ({ navigation, route }) => {
    
    let userData : any;
    
    if(!route.params){
        userData = route;
    }else{
        userData = route.params
    }
    const initialCode = userData.country;

    const {phoneNumber} = useAuth();

    const [name, setName] = useState(userData.name);
    const [phone, setPhone] = useState(userData.phoneNumber);
    const [email, setEmail] = useState(userData.email);
    const [isActive, setIsActive] = useState(false);
    const [city, setCity] = useState(userData.cityLiveIn);
    const [imageUri, setImageUri] = useState(userData.imageUrl);
    const [countryCode, setCountryCode] = useState(initialCode);

    const selectImage = () => {

        const options = {
          mediaType: 'photo',
          includeBase64: false,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                alert('User cancelled image picker');
            } else if (response.error) {
                alert('ImagePicker Error: ', response.error);
            } else {
                setImageUri(response.assets[0].uri);
                // Here you can also handle the upload to your server
                uploadImage(response.assets[0]);
            }
        });
    };

    const uploadImage = (asset) => {
        const formData = new FormData();
        formData.append('photo', {
            name: asset.fileName,
            type: asset.type,
            uri: asset.uri,
        });

        // Replace with your upload URL
        fetch('YOUR_UPLOAD_URL', {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        .then(response => response.json())
        .then(data => {
            Alert.alert('Upload Success', 'Image uploaded successfully!');
        })
        .catch(error => {
            Alert.alert('Upload Error', error.message);
        });
    };

    const onPressCountry = () => {
        navigation.navigate('ScreenCountry', {
          from: 'profileScreen',
        });
    };

    const countryNumber = countries.find(
        country => country.code === countryCode,
      ).dial_code;
    
    // setPhone(data.phone.slice(countryNumber.length));
    useEffect(() => {

      setPhone(userData.phoneNumber.slice(countryNumber.length));
      setCountryCode(initialCode);

    }, [userData.phoneNumber, countryNumber]);

    const validateData = (send_data) => {
        const errors = {};
        
        // Validate name
        if (!send_data.name || send_data.name.trim() === '') {
            errors.name = 'Name is required.';
        }
    
        // Validate email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!isValidEmail) {
            errors.email = 'An email is required.';
        }
    
        const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format

         // Validate the phone number format
        if (!phoneRegex.test(send_data.phoneNumber)) {
            errors.phoneNumber = 'phoneNumber is not valid. Please enter a valid phone number.';
        }
        
        if (!send_data.imageUrl || send_data.imageUrl.trim() === '') {
            errors.imageUrl = 'image is required.';
        }
    
        // Validate city live
        if (!send_data.cityLiveIn || send_data.cityLiveIn.trim() === '') {
            errors.cityLiveIn = 'City of residence is required.';
        }
    
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    };
    
    const onUpdateUserData = () => {

        const userData = {
            name: name,
            email: email,
            phoneNumber: countryNumber+phone,
            imageUrl: imageUri,
            cityLiveIn: city,
        };
        
        // navigation.navigate('AppStack');
        const validationResult = validateData(userData); // Call the validation function

        if (validationResult.isValid) {
            http.put('/user/update_data', {userData}).then(res => {
                if(res.data === 'new user registered successfully'){
                    registerUserToFirebase(userData);
                    navigation.goBack();
                }
            });
        } else {
            // Handle validation errors
            alert('Validation errors: ' + JSON.stringify(validationResult.errors));
        }
    };

    const registerUserToFirebase = async(userData) => {
        try {
            // Create user with phone number
            await firestore().collection('users').doc(userData.phoneNumber).set({
                phoneNumber: userData.phoneNumber,
                username: userData.name,
                createdAt: firestore.FieldValue.serverTimestamp(),
              });
              
          } catch (error) {
            console.error(error);
            alert('Error registering user:' + error.message);
          }
    };

    const [isValidEmail, setIsValidEmail] = useState(true);
    const validateEmail = (input) => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setEmail(input);
        setIsValidEmail(emailPattern.test(input));
    };

    const verifyEmail = () => {

    };
    
    return(
        <View  style={tw`flex-1 justify-center bg-black pb-16`}>
            <ScrollView>
                {/* <TouchableOpacity
                    style={[tw`absolute z-10 top-[10px] left-[20px] p-[6px] rounded-md`, isActive && styles.activeBackButton]}
                    onPress={() => navigation.goBack()}
                    onPressIn={() => setIsActive(true)} // Set active state to true on press in
                    onPressOut={() => setIsActive(false)} // Reset active state on press out
                >
                    <Icon name="chevron-left" size={20} color="white" />
                </TouchableOpacity> */}
                <View style={{justifyContent:'center', alignItems:'center', marginTop:width*0.2}}>
                    <Text style={{color:'white', fontSize:20, fontWeight:'bold'}}>
                        Setting
                    </Text>
                </View>
                <View style={styles.project_detail}>
                    <TextInput
                        style={styles.itemContainer}
                        placeholder={'Name'}
                        placeholderTextColor="gray"
                        onChangeText={setName}
                        value={name}
                        editable={phoneNumber == userData.phoneNumber ? true : false}
                        />
                </View>
                <View style={styles.project_detail}>

                    <View style={{flex:1, justifyContent:'center',alignItems:'center' }}>
                        <TextInput
                            // style={styles.itemContainer}
                            style={[styles.itemContainer, isValidEmail ? styles.invalid : null]}
                            placeholder={'Email'}
                            placeholderTextColor="gray"
                            onChangeText={validateEmail}
                            value={email}
                            editable={phoneNumber == userData.phoneNumber ? true : false}
                        />
                    </View>
                    <View style={{justifyContent:'center', alignItems:'center', padding:1.5}}>
                        <TouchableOpacity 
                            onPress={verifyEmail}
                            style={{width:58, height:58, backgroundColor:'#414B84', borderRadius:10, justifyContent:'center', 
                                alignItems:'center', marginLeft:'2%' }}
                            activeOpacity={0.5}
                        >
                            <Text style={tw`text-white text-[12px] font-dm font-bold`}>Verify</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {!isValidEmail && <Text style={styles.errorText}>A valid email is required.</Text>} 
                <View style={styles.project_detail}>
                    <View style={{flex:3, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                        <TouchableOpacity onPress={onPressCountry} activeOpacity={0.5} disabled>
                            <Image
                                width={60}
                                height={30}
                                source={{
                                    uri: `https://flagcdn.com/w320/${countryCode.toLowerCase()}.png`,
                                }}
                                style={tw`mx-2.5`}
                            />
                        </TouchableOpacity>
                        <Text style={tw`text-[#6D6D6D] text-[18px] font-dm font-bold`}>
                            {countryNumber}
                        </Text>
                    </View>
                    <View style={{flex:7, justifyContent:'center', alignItems:'center', left:width*0.06}}>
                        <TextInput
                            style={{ color:'gray', fontSize:16, position:'absolute', left:0 }}
                            value={phone}
                            placeholder="Phone Number"
                            placeholderTextColor="gray"
                            onChangeText={setPhone}
                            editable={false}
                        /> 
                    </View>
                </View>
                <View style={styles.project_detail}>
                    <View style={{justifyContent:'center', alignItems:'center', padding:1.5}}>
                        <TouchableOpacity 
                            onPress={selectImage}
                            style={{width:58, height:58, backgroundColor:'#414B84', borderRadius:10, justifyContent:'center', 
                                alignItems:'center', marginLeft:'2%' }}
                            activeOpacity={0.5}
                            disabled={phoneNumber == userData.phoneNumber ? false : true}
                        >
                            <Text style={tw`text-black text-[18px] font-dm font-bold`}>+</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{flex:1, justifyContent:'center',alignItems:'center' }}>
                        {imageUri ? (
                            <View style={{ position: 'relative', width:'100%'}}>
                                <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} />
                                <TouchableOpacity style={{position:'absolute', backgroundColor:'red', top:5, right:5,padding:3, 
                                    borderRadius:5}} onPress={()=>setImageUri(null)}>
                                    <Text>
                                        cancel
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ):(
                            <Text style={{color: 'gray', position: 'absolute', left: '25%', fontSize: 16}}>
                                add image
                            </Text>
                        )}
                    </View>
                </View>
                <View style={styles.project_detail}>
                    <TextInput
                        style={styles.itemContainer}
                        placeholder={'City Living In'}
                        placeholderTextColor="gray"
                        onChangeText={setCity}
                        value={city}
                        editable={phoneNumber == userData.phoneNumber ? true : false}
                    />
                </View>
                
                
                {phoneNumber == userData.phoneNumber && 
                <View style={styles.update_back}>
                    <TouchableOpacity style={tw`bg-transparent mb-5 flex justify-center items-center h-10 w-25 bg-[#00A84F] rounded-[10] mt-15`} 
                        onPress={()=>onUpdateUserData()}>
                        <Text style={tw`text-white text-[12px] font-abril`}>
                            Update
                        </Text>
                    </TouchableOpacity>
                </View>
                }
                
                <View style={styles.containerAvatar}>
                    <TouchableOpacity style={tw`bg-transparent mb-5 flex justify-center items-center h-10 w-25 bg-[#211C1E] rounded-[10] ml-10 mt-5`} >
                        <Text style={tw`text-white text-[12px] font-abril`}>
                            Setting
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={tw`bg-transparent mb-5 flex justify-center items-center h-10 w-25 bg-[#00A84F] rounded-[10] mr-10 mt-5`} 
                        onPress={() => navigation.navigate('ScreenCandidateDetail', {phoneNumber:phoneNumber, profile:'true'})}>
                        <Text style={tw`text-white text-[12px] font-abril`}>
                            Profile
                        </Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({

    containerAvatar: {
        flexDirection: 'row', // Arrange items in a row
        justifyContent: 'space-between', // Optional: Space between images
        alignItems: 'center', // Center images vertically
        padding: 10, // Optional: Add padding around the container
    },

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
        width:'90%',
        height:65,
        backgroundColor:'#101214',
        borderRadius:10,
        marginTop:width*0.05,
        margin:'auto',
        overflow:'hidden',
        justifyContent:'center',
        alignItems:'center'
    },

    update_back:{
        flexDirection:'row',
        height:65,
        borderRadius:10,
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
        marginVertical: 5,
        marginHorizontal: 20,
        backgroundColor: '#101214',
        borderRadius: 10,
        height:70,
        width:'96%',
        fontSize:16,
        color:'white',
        textAlign:'left',
        marginLeft:'10%'
    },

    activeBackButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Optional: add a slight background color
    },
});

export default ScreenProfile;