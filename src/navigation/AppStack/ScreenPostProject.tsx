import React,{useEffect, useRef, useState} from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Button,
  SafeAreaView 
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import DocumentPicker, { types } from 'react-native-document-picker';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import ImageResizer from 'react-native-image-resizer';

import axios from 'axios';

import ProgressBar from '../../components/ProgressBar';

import Loading from '../../components/Loading';
import { useAuth } from '../AuthContext';
import {http} from '../../helpers/http';
import tw from '../../../tailwindcss';

import MapView, {PROVIDER_GOOGLE, Marker, Callout, Region } from 'react-native-maps';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import ImageGrid from '../../components/ImageGrid'

import RNFS from 'react-native-fs';

const HoverButton = ({ title,isActive,onPress }) => {
    return (
        <TouchableOpacity 
            style={[styles.button, isActive && styles.activeButton]} 
            onPress={onPress}
        >
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
};

interface Props {
    navigation:NavigationProp<any>;
    route:RouteProp<any, any>;
}

const ScreenPostProject: React.FC<Props> = ({navigation, route}) => {

    const {phoneNumber} = useAuth();

    let project : any = {};

    if(!route.params){
        project = route;
    }else{
        project = route.params;
    }
    
    let state = 'post';

    if(project._id){
        state = 'update'
    }

    const projectDetails = [
        'About The Project',
        'Plan For Success',
        'Total Project Budget',
        'Available Seats',
        'Investment Required For One Seat',
        'Ownership For Every Seat',
    ];

    const categoriesName = [
        "Restaurant",
        "Tech",
        "Restaurant",
        "Gaming",
        "RealEstate",
        "Travel",
        "E-Commerce",
        "Agriculture",
        "Restaurant",
        "Novel",
    ];
    
    const projectNowDetails = [
        project.description,
        project.planForSuccess,
        project.budget ?  project.budget.toString() : '',
        project.available ? project.available.toString() : '',
        project.investmentRequiredForOneSeat,
        project.ownershipForEverySeat,
        project.location
    ];

    const navigations = useNavigation();

    const [loading, setLoading] = useState(false);

    const [projectName, setProjectName] = useState(!project.projectName ? '' : project.projectName);
    const [projectType, setProjectType] = useState('');
    const [projectTypeId, setProjectTypeId] = useState(-1);
    const [imageUri, setImageUri] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const [branchList, setBranchList] = useState([]);
    const [inputValues, setInputValues] = useState( !project.projectName ? Array(projectDetails.length).fill('') : projectNowDetails);
    const [activeButton, setActiveButton] = useState(null);
    const [activeButtons, setActiveButtons] = useState(Array(12).fill(false));
    const [selectImages, setSelectImages] = useState(null);
    const [audioFile, setAudioFile] = useState(null);
    const [audioFileName, setAudioFileName] = useState(( !project.projectName || !project.audioFile) ? null : project.audioFile);

    const [videoFile, setVideoFile] = useState(null);
    const [videoFileName, setVideoFileName] = useState(null);
    const [resizedVideoUri, setResizedVideoUri] = useState<string | null>(null);

    const [imagesArray, setImagesArray] = useState<any[]>([]);
    const [imagesInfo, setImagesInfo] = useState<any[]>([]);

    const [updateImagesArray, setUpdateImagesArray] = useState<any[]>([]);
    const [giveLocationName, setGiveLocationName] = useState(!project.projectName ? '' : project.location);

    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationName, setLocationName] = useState<string | null>(null);

    const CHUNK_SIZE = 1024 * 1024; 

    useEffect(() => {

        if(giveLocationName == ''){
            Geolocation.getCurrentPosition(
                (position) => {
                  const { latitude, longitude } = position.coords;
                  setLocation({ latitude, longitude });
                  getLocationName(latitude, longitude);
                },
                (error) => console.error(error),
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        }else{
            onSearchLocation();
        }
        
      }, []);

    const getLocationName = async (latitude: number, longitude: number) => {

        const api = "AIzaSyAKTwEiyXJRKneGWjFT33o6ZA2beRGz0yE";
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${api}`);
        
        const data = await response.json();
        
        if (data.results.length > 0) {
            const addressComponents = data.results[0].address_components;
            const city = addressComponents.find(component => component.types.includes("locality") || component.types.includes("administrative_area_level_1"));

            if (city) {
                setLocationName(city.long_name);
                setGiveLocationName(city.long_name);
            }
        }
    };

    const handleSearchLocation = () =>{
        onSearchLocation();
    };

    const onSearchLocation = async() =>{
        
        const apiKey = 'AIzaSyAKTwEiyXJRKneGWjFT33o6ZA2beRGz0yE';
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${giveLocationName}&key=${apiKey}`);
        const data = await response.json();
        
        if (data.results.length > 0) {
        
            const { location } = data.results[0].geometry;

            setLocation({
                latitude: location.lat,
                longitude: location.lng,
            });

            setLocationName(giveLocationName);
        } else {
            alert('City not found');
        }
    };

    const handleRemoveImage = (index : number) => {
        setImagesArray(prevItems => {
            const newItems = [...prevItems]; // Create a copy of the array
            newItems.splice(index, 1); // Remove the item at the specified index
            return newItems; // Return the new array
        });

        if(state == 'post'){
            setImagesInfo(prevItems1 => {
                const newItems1 = [...prevItems1]; // Create a copy of the array
                newItems1.splice(index, 1); // Remove the item at the specified index
                return newItems1; // Return the new array
            })
        }

        if(state == 'update'){
            project.projectImageUrl = removeItemByIndex(project.projectImageUrl, index);
        }
    };
    
    const removeItemByIndex = (array: any[], index: number): any[] => {
        return array.filter((_, i) => i !== index);
    };

    const handleRemoveUpdateImage = (index : number) =>{

        setUpdateImagesArray(prevItems => {
            const newItems = [...prevItems]; // Create a copy of the array
            newItems.splice(index, 1); // Remove the item at the specified index
            return newItems; // Return the new array
        });
        
        if(state == 'update'){
            setImagesInfo(prevItems1 => {
                const newItems1 = [...prevItems1]; // Create a copy of the array
                newItems1.splice(index, 1); // Remove the item at the specified index
                return newItems1; // Return the new array
            })
        }
    }

    const autoGetBranches = async () => {

        const response = await http.get('/branch/get_all_branches'); // Fetch data from the server

        const result = response.data.data;

        const res_data = [];
        for (let i = 0; i < result.length; i++) {

            res_data.push(
                result[i].name
            );
          }
        return res_data;
    };


    const initialState = () => {

        setImagesArray([]);
        
        if(!route.params){
            setProjectName('');
            setProjectType('');
            setProjectTypeId(-1);
            setImageUri(null);
            handleButtonPress(-1);
            setImagesInfo([]);
        }else{
            project.projectImageUrl.forEach((image) => {
                const imagePath = image.path.replaceAll('\\', '/');
                // const serverUrl = "http://192.168.148.98:3000/" + imagePath
                const serverUrl = "https://posting.backend.server.marketmajesty.net/" + imagePath
                setImagesArray(prevItems => [...prevItems, serverUrl]);
            });
        }
    }

    const categories = branchList;

    const handleInputChange = (index, value) => {

        const newInputValues = [...inputValues];
        const numericValue = parseFloat(value);
        if(index == 3){
            if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 50) {
                newInputValues[index] = value; // Update only if valid
            } else if (value === '') {
                newInputValues[index] = ''; // Allow clearing the input
            }
        }else if(index == 5){
            if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 100) {
                newInputValues[index] = value; // Update only if valid
            } else if (value === '') {
                newInputValues[index] = ''; // Allow clearing the input
            }
        }else{
            newInputValues[index] = value;
        }

        if (newInputValues[2] && newInputValues[3]) {
            const investment = Math.floor((parseFloat(newInputValues[2]) || 0) / (parseFloat(newInputValues[3]) || 0));54
            newInputValues[4] = investment.toString(); // Ensure it's a string
        } else {
            newInputValues[4] = ''; // Clear if inputs are not present
        }
       
        setInputValues(newInputValues);
    };
    
    const resizeImage = async (uri: string) => {
        try {
            const resizedImage = await ImageResizer.createResizedImage(uri, 300, 300, 'JPEG', 70);
            setImagesInfo(prevItems => [...prevItems, resizedImage])
            setImageUri(resizedImage.uri);
        } catch (error) {
            alert('Failed to resize image');
            console.error(error);
        }
    };

    const renderItem = ({ item, index }) => (

        <TextInput
            style={[styles.itemContainer, {paddingLeft:'8%'}]}
            placeholder={item}
            placeholderTextColor={(index == 4 ) ? "grey" : "white"}
            value={inputValues[index]}
            keyboardType={(index == 2 || index == 3 || index == 4) ? 'numeric' : 'default'}
            onChangeText={(value)=>handleInputChange(index, value)}
            multiline = {(index == 0 ||  index == 1) ? true : false}
            editable = {(index == 4 ) ? false : true}
        />
    );

    

    const handleButtonPress = (index) => {
        const newActiveButtons = [...activeButtons];
        newActiveButtons[index] = !newActiveButtons[index]; // Toggle active state
        setProjectTypeId(-1);
        setActiveButtons(newActiveButtons);
        setActiveButton(index);
        setProjectType(categories[index-1]);
    };
    
    const selectImage = () => {
        
        if(imagesArray.length == 10)
        {
            return
        }

        const options = {
          mediaType: 'photo',
          includeBase64: false
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                alert('User cancelled image picker');
            } else if (response.error) {
                alert('ImagePicker Error: ', response.error);
            } else {
                
                const newItem = response.assets[0].uri;

                if(state == 'post'){
                    setImagesArray(prevItems => [...prevItems, newItem]);
                }
                
                if(state == 'update'){
                    setUpdateImagesArray(prevItems => [...prevItems, newItem]);
                }
                resizeImage(response.assets[0].uri)
                // setImagesInfo(prevItems => [...prevItems, response.assets[0]])
                setSelectImages(response.assets[0]);
            }
        });
    };
    
    const selectVideoFile = async () => {

        const options = {
            mediaType: 'video',
            includeBase64: false
          };
  
          launchImageLibrary(options, (response) => {
              if (response.didCancel) {
                alert('User cancelled image picker');
            } else if (response.error) {
                alert('ImagePicker Error: ', response.error);
            } else {
                setVideoFile(response.assets[0]);
                // resizeVideo(response.assets[0])
                setVideoFileName(response.assets[0].fileName);
            }
          });
    }

    async function uploadFile(filePath: string) {
        const chunkSize = 5 * 1024 * 1024; // 5 MB per chunk
        const fileStat = await RNFS.stat(filePath);
        const totalChunks = Math.ceil(fileStat.size / chunkSize);
    
        for (let i = 0; i < totalChunks; i++) {
            const chunk = await RNFS.read(filePath, chunkSize, i * chunkSize, 'base64');
            const success = await uploadChunk(chunk, i);
    
            if (!success) {
                console.error(`Failed to upload chunk ${i}`);
                break;
            }
        }
    }

    const uploadChunk = async (chunk, chunkNumber) => {
        const response = await fetch('http://posting.backend.server.marketmajesty.net/api/video_upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream',
                'Chunk-Number': chunkNumber,
            },
            body: chunk,
        });
        return response.ok;
    };

    const selectAudioFile = async () => {
        try {
            const res = await DocumentPicker.pick({
              type: [types.audio], // Filters to show only audio files
            });
      
            setAudioFile(res[0]);
            setAudioFileName(res[0].name);
          } catch (err) {
            if (DocumentPicker.isCancel(err)) {
              console.log('User canceled the file picker');
            } else {
              console.error('Error picking file: ', err);
            }
          }
    };

    useFocusEffect(
        React.useCallback(() => {

            const fetchData = async () => {
                try {
                    const tempBranches = await autoGetBranches();
                    setBranchList(tempBranches);

                    if(project.projectType){
                        setProjectType(project.projectType);
                        const index = tempBranches.indexOf(project.projectType);
                        setProjectTypeId(index);
                    }
                    setInputValues(projectNowDetails);
                    initialState();
                    // setImageUri(project.projectImageUrl);
                    // setAudioFile(project.audioFile);
                } catch (error) {
                    console.error('Error fetching branches or project:', error);
                }
            };
            fetchData(); // Call the async function
        }, [navigations]) // Dependency array
    );

    const validateData = (send_data) => {
        const errors = {};
        
        // Validate name
        if (!send_data.phoneNumber || send_data.phoneNumber.trim() === '') {
            errors.phoneNumber = 'phoneNumber is required.';
        }
        if (!send_data.projectName || send_data.projectName.trim() === '') {
            errors.projectName = 'projectName is required.';
        }
        if (!send_data.projectType || send_data.projectType.trim() === '') {
            errors.projectType = 'projectType is required.';
        }
        if (!send_data.description || send_data.description.trim() === '') {
            errors.description = 'description is required.';
        }
        if (!send_data.planForSuccess || send_data.planForSuccess.trim() === '') {
            errors.planForSuccess = 'planForSuccess is required.';
        }
        if (!send_data.budget || send_data.budget.trim() === '') {
            errors.budget = 'budget is required.';
        }
        if (!send_data.ownershipForEverySeat || send_data.ownershipForEverySeat.trim() === '') {
            errors.ownershipForEverySeat = 'ownershipForEverySeat is required.';
        }
        if (!send_data.available || send_data.available.trim() === '') {
            errors.available = 'available is required.';
        }
        if (!send_data.investmentRequiredForOneSeat || send_data.investmentRequiredForOneSeat.trim() === '') {
            errors.investmentRequiredForOneSeat = 'investmentRequiredForOneSeat is required.';
        }
        if (!send_data.location || send_data.location.trim() === '') {
            errors.location = 'location is required.';
        }
        if (!send_data.projectImageUrl || send_data.projectImageUrl.trim() === '') {
            errors.projectImageUrl = 'projectImageUrl is required.';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    };

    const onPostProject = async () => {
        
        //i should add audio file to this.

        const send_data = {
            phoneNumber:phoneNumber,
            projectName:projectName,
            projectType:projectType,
            description:inputValues[0],
            planForSuccess:inputValues[1],
            budget:inputValues[2],
            ownershipForEverySeat:inputValues[5],
            available:inputValues[3],
            investmentRequiredForOneSeat:inputValues[4],
            location:giveLocationName,
            projectImageUrl:imageUri
        }

        const validationResult = validateData(send_data);
        
        if (validationResult.isValid) {
            
            const formData = new FormData();

            imagesInfo.forEach((image) => {

                formData.append('images', {
                    uri: image.uri,
                    type:  'image/jpeg',
                    name: image.name,
                });
            });

            if(audioFile){
                formData.append('audioFile',{
                    uri:audioFile.uri,
                    type:audioFile.type,
                    name:audioFile.name,
                });
            }
            
           
            // if(videoFile){
            //     formData.append('videoFile',{
            //         uri:videoFile.uri,
            //         type:videoFile.type,
            //         name:videoFile.fileName,
            //     });
            // }

            formData.append('_id', project._id);
            formData.append('phoneNumber',phoneNumber);
            formData.append('projectName',projectName);
            formData.append('projectType',projectType);
            formData.append('description',inputValues[0]);
            formData.append('planForSuccess',inputValues[1]);
            formData.append('budget',inputValues[2]);
            formData.append('available',inputValues[3]);
            formData.append('investmentRequiredForOneSeat', inputValues[4]);
            formData.append('ownershipForEverySeat', inputValues[5]);
            formData.append('location', giveLocationName);
            formData.append('projectImageUrl',imageUri);

            try{
                setLoading(true);
                await http.post('/project/post_project', formData, {
                    headers:{
                        'Content-Type': 'multipart/form-data',
                    },
                    timeout: 300000
                }).then(res => {
                    console.log(res.data.message);
                    if(res.data.message==='success'){
                        // setLoading(false);
                        // navigation.navigate('ScreenProjectList');
                        console.log(res.data.message)
                        if(videoFile){
                            console.log("start upload file")
                            
                        }else{
                            setLoading(false);
                            navigation.navigate('ScreenProjectList');
                        }
                    }
                }).catch(function(error){
                    console.log('there has been a problem with your fetch operation: ' + error.message);
                    setLoading(false);
                    throw error;
                });

            }catch(e){
                console.log("error is " , e);
                setLoading(false);
            }
        } else {
            alert('Validation errors: ' + JSON.stringify(validationResult.errors));
            setLoading(false);
        }
    }

    const onUpdateProject = async() => {

        const formData = new FormData();

        imagesInfo.forEach((image) => {

            formData.append('images', {
                uri: image.uri,
                type:  'image/jpeg',
                name: image.name,
            });
        });

        if(audioFile){
            formData.append('audioFile',{
                uri:audioFile.uri,
                type:audioFile.type,
                name:audioFile.name,
            });
        }
        
        
        formData.append('_id', project._id);
        formData.append('phoneNumber',phoneNumber);
        formData.append('projectName',projectName);
        formData.append('projectType',projectType);
        formData.append('description',inputValues[0]);
        formData.append('planForSuccess',inputValues[1]);
        formData.append('budget',inputValues[2]);
        formData.append('ownershipForEverySeat', inputValues[5]);
        formData.append('available',inputValues[3]);
        formData.append('investmentRequiredForOneSeat',inputValues[4]);
        formData.append('location', giveLocationName);
        formData.append('projectImageUrl', JSON.stringify(project.projectImageUrl));

        try{
            setLoading(true);
            await http.post('/project/update_project', formData, {
                headers:{
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 300000
            }).then(res => {
                console.log(res.data.message);
                if(res.data.message==='success'){
                    setLoading(false);
                    navigation.navigate('ScreenProjectList');
                }
            }).catch(function(error){
                console.log('there has been a problem with your fetch operation: ' + error.message);
                setLoading(false);
                throw error;
            });
        }catch(e){
            console.log("error is " , e);
            setLoading(false);
        }
    }

    return (
        <View  style={tw`flex-1 justify-center bg-black pb-16`}>
            <ScrollView>
                <View style={tw`flex-row items-center justify-center position-absolute`}>
                    <TouchableOpacity
                        style={[tw`absolute z-10 top-[10px] left-[20px] p-[6px] rounded-md`, 
                            isActive && styles.activeBackButton]}
                        onPress={() => navigation.goBack()}
                        onPressIn={() => setIsActive(true)} // Set active state to true on press in
                        onPressOut={() => setIsActive(false)} // Reset active state on press out
                        >
                        <Icon name="chevron-left" size={20} color="white" />
                    </TouchableOpacity>
                </View>
                <View style={tw`mt-[50px] bg-[#101214] rounded-[10px] w-[96%] mx-2`}>
                    <Text style={tw`text-white ml-[7%] text-[18px] mt-5 font-bold`}>Project Name  &  Type</Text>
                    <View style={tw` justify-center items-center bg-[#101214]`}>
                        <TextInput
                            style={tw`text-white rounded-[25px] bg-[#060606] font-dm  text-[13px] w-[80%] mt-5 `}
                            placeholder="project name"
                            placeholderTextColor="white"
                            textAlign="center"
                            value={projectName}
                            onChangeText={setProjectName} 
                        />
                    </View>
                    <View style={styles.buttonMatrix}>
                        {Array.from({ length: Math.ceil(categories.length / 3) }, (_, rowIndex) => (
                            <View key={rowIndex} style={styles.row}>
                                {Array.from({ length: 3 }, (_, colIndex) => {
                                    const buttonValue = rowIndex * 3 + colIndex + 1;
                                    if(buttonValue <= categories.length){
                                        return (
                                            <HoverButton key={colIndex} 
                                                title={categories[buttonValue-1]} 
                                                // isActive={activeButtons[buttonValue]}
                                                isActive={ activeButton===buttonValue || projectTypeId == buttonValue - 1}
                                                onPress={() => handleButtonPress(buttonValue)}
                                            />
                                        );
                                    }
                                })}
                            </View>
                        ))}
                    </View>
                </View>
                
                <View style={styles.container}>
                    <FlatList
                        data={projectDetails}
                        renderItem = {renderItem}
                        keyExtractor={(item, index)=>index.toString()}
                    />
                   
                    <TouchableOpacity style={ [styles.itemContainer,{justifyContent:'center', paddingLeft:'8%'}]} 
                        onPress={selectAudioFile}
                    >
                        {audioFileName ? (
                            <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>
                                Audio selected
                            </Text>
                        ) : (
                            <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>
                                Add Audio
                            </Text>
                        )}
                    </TouchableOpacity>
                    { audioFileName && <Text style={tw`ml-10 text-white text-[15px] font-bold`}>{audioFileName}</Text>}

                    {/* <TouchableOpacity style={ [styles.itemContainer,{justifyContent:'center', paddingLeft:'8%'}]} 
                        onPress={selectVideoFile}
                    >
                        {videoFileName ? (
                            <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>
                                Video selected
                            </Text>
                        ) : (
                            <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>
                                Add Video
                            </Text>
                        )}
                    </TouchableOpacity>
                    { videoFileName && <Text style={tw`ml-10 text-white text-[15px] font-bold`}>{videoFileName}</Text>} */}
                </View>

                <View style={tw`flex-row items-center ml-10 mt-5`}>
                    <Text style={tw`text-white text-[14px] font-bold`}>Project Location</Text>
                </View>

                <View style={tw`flex-row items-center ml-10 mt-5`}>
                    <TextInput
                        style={tw`text-white rounded-[10px] bg-[#060606] border-2 border-white font-dm text-[13px] w-[60%]`}
                        placeholder="location name"
                        placeholderTextColor="white"
                        textAlign="center"
                        value={giveLocationName}
                        onChangeText={setGiveLocationName} 
                    />
                    <TouchableOpacity style={tw`ml-5 flex justify-center items-center h-10 w-20 bg-[#00A84F] rounded-[3]`} 
                         onPress={handleSearchLocation} >
                        <Text style={tw`text-white text-[15px] font-abril`}>
                            set
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={tw`flex-1 bg-white w-full h-48 mt-5`}>
                    {location && (
                        <MapView
                            style={{ flex: 1 }}
                            initialRegion={{
                                latitude: location.latitude,
                                longitude: location.longitude,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0922,
                            }}
                            region={{
                                latitude: location.latitude,
                                longitude: location.longitude,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0922,
                            }}
                            showsUserLocation={true}
                            >
                            <Marker coordinate={location} title={locationName || "Current Location"} />
                        </MapView>
                        )}
                    {locationName && <Text>{locationName}</Text>}
                </View>

                <View style={styles.bottom_container}>
                    <TouchableOpacity style={styles.bottom_button} onPress={selectImage}>
                        <Text style={styles.bottom_text}>+</Text>
                    </TouchableOpacity>
                </View>  

                <SafeAreaView style={styles.bottom_container}>
                    <ImageGrid images={imagesArray} removeable={true} onSendData={handleRemoveImage}/>
                </SafeAreaView>

                {(state == 'update') && <SafeAreaView style={styles.bottom_container}>
                    <ImageGrid images={updateImagesArray} removeable={true} onSendData={handleRemoveUpdateImage}/>
                </SafeAreaView>}

                <View style={tw`flex-1 justify-center items-center mt-5`}>
                    {(state == 'post') && <TouchableOpacity style={tw`bg-transparent mb-5 flex justify-center items-center h-11 w-29 bg-[#00A84F] 
                    rounded-[3]`} 
                        onPress={onPostProject}>
                        <Text style={tw`text-white text-[18px] font-abril`}>
                            Post
                        </Text>
                    </TouchableOpacity>}

                    {(state == 'update') && <TouchableOpacity style={tw`bg-transparent mb-5 flex justify-center items-center h-11 w-29 bg-[#00A84F] 
                    rounded-[3]`} 
                        onPress={onUpdateProject}>
                        <Text style={tw`text-white text-[18px] font-abril`}>
                            Update
                        </Text>
                    </TouchableOpacity>}
                </View>
            </ScrollView>
            <Loading visible={loading} />
        </View>
    );
};

const styles = StyleSheet.create({

    locationContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        elevation: 3,
    },

    project_detail:{
        flexDirection:'row',
        width:'94%',
        height:92,
        backgroundColor:'black',
        borderRadius:10,
        marginTop:8,
        margin:'auto',
        overflow:'hidden',
        padding:6
    },
    
    locationText: {
        position: 'absolute',
        bottom: 20,
        left: 10,
        // backgroundColor:'white',
        color:'black',
        padding: 10,
        borderRadius: 5,
      },

    map: {
        width: '100%',
        height: '100%',
    },
    container: {
      justifyContent: 'center',
      marginTop:15
    },
    input: {
      height: 40,
      borderWidth: 1,
      width: '100%',
      marginBottom: 20,
      paddingHorizontal: 10,
    },
    buttonMatrix: {
      width: '100%',
      marginTop:20,
      marginBottom:25,
            
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'center', // Adjusts spacing between buttons
      marginVertical: 1,
      padding:3,
      
    },
    buttonHovered: {
        backgroundColor: '#00A84F', // Change to green on hover
      },
    button: {
      width: '28%', // 25% of screen width
      height: 35,
      borderRadius: 25, // Half of the height for elliptical shape
      backgroundColor: '#101214',
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 1,
      borderColor:'#181A19',
      borderWidth:2,
      
    },
    buttonText: {
      color: 'white',
      fontSize: 11,
    },
    itemContainer: {
        marginVertical: 5,
        marginHorizontal: 20,
        backgroundColor: '#101214',
        borderRadius: 10,
        height:'auto',
        width:'96%',
        marginLeft:'2%',
        fontSize:14,
        color:'white',
        fontWeight:'bold',
        paddingBottom:20,
        paddingTop:20,
        marginBottom:9
        // justifyContent:'center',
        
        // alignItems:'center'
    },
    
    activeButton: {
        backgroundColor: '#28a745', // Green color when active
    },
    bottom_container: {
        flex: 1,
        flexDirection: 'row',
        marginLeft:20,
        // alignItems: 'center', // Center vertically
        gap: 10,
        marginTop:20
    },
    bottom_button: {
        padding: 10,
        width:80,
        height:80,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'white',
        marginLeft:10,
        borderRadius:12
    },
    upload_image: {
        
        width:80,
        height:80,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'white',
        marginLeft:10,
        borderRadius:12
    },
    image: {
        // width: 100, // Set the width of the image
        // height: 100, // Set the height of the image
        // backgroundColor:'red',
        width:'100%',
        height:'100%',
        borderRadius:12
    },
    bottom_text:{
        // width:100,
        // height:100,
        fontSize:24,
        backgroundColor:'white',
        borderRadius:10,
        textAlign:'center'
    },
    activeBackButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Optional: add a slight background color
    },
  });

export default ScreenPostProject;
