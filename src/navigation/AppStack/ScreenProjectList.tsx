import React,{useState,useEffect} from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Dropdown } from 'react-native-element-dropdown';

import { useFocusEffect } from '@react-navigation/native';
import { NavigationProp, RouteProp, } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

import tw from '../../../tailwindcss';
import {http} from '../../helpers/http';
import { useAuth } from '../AuthContext';
import Loading from '../../components/Loading';

interface Props {
    navigation:NavigationProp<any>;
    route:RouteProp<any, any>;
}

const HoverButton = ({ title, isActive, onPress }) => {

    return (
        <TouchableOpacity 
            style={[styles.button, isActive && styles.activeButton]} 
            onPress={onPress}>
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
};

const {width} = Dimensions.get('window');
const height = (3/7)*width;

const ScreenProjectList: React.FC<Props> = ({ navigation, route }) => {
   
    const {phoneNumber} = useAuth();

    const navigations = useNavigation();

    const [projectList, setProjectList] = useState([]);
    const [activeButtons, setActiveButtons] = useState({});
    const [activatedButtonNames, setActivatedButtonNames] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [branchList, setBranchList] = useState([]);
    const [dimensions, setDimensions] = useState(Dimensions.get('window'));
    const [likedBuckets, setLikedBuckets] = useState({}); // State to track liked buckets

    const fetchProjects = async () => {
        const response = await http.get('/project/get_projects'); // Fetch data from the server
        const res_data = response.data.data; // Extract the data from the response

        return res_data;
    };
    
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

    const getUserData = async (phoneNumber) => {

        try {
            http.get('/user/get_user_data',{params:{phoneNumber}}).then(res => {
                const data = res.data.data[0];
                navigation.navigate('ScreenProfile', data);
            });
        } catch (error) {
                console.error('Error communicating with server:', error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                try {
                    setLoading(true);
                    const tempProjects = await fetchProjects();
                    setProjectList(tempProjects);

                    const favoriteArray = [];

                    for(let i = 0; i < tempProjects.length; i++){

                        if(tempProjects[i].favoriteCandidates.includes(phoneNumber)){
                            favoriteArray.push(true);
                        }else{
                            favoriteArray.push(false);
                        }
                    }
                    setLikedBuckets(favoriteArray);

                    const tempBranches = await autoGetBranches();
                    
                    setBranchList(tempBranches);

                } catch (error) {
                    console.error('Error fetching projects:', error);
                }
            };
            fetchData(); // Call the async function
                
        }, [navigations]) // Dependency array
    );

    const categories = branchList;

    const filter_project = async (buttonNames) => {
        try {
            if(buttonNames.length === 0){
                setLoading(true);
                const temp = await fetchProjects();
                setProjectList(temp);
            }else{
                setLoading(true);
                http.get('/project/filter_project',{params:{buttonNames}}).then(res => {
                    setProjectList(res.data); 
                    
                    setLoading(false);        
                });
            }
        } catch (error) {
                console.error('Error communicating with server:', error);
        }
    };
            
    const handleButtonPress = (buttonValue) => {
        
        setActiveButtons(prev => {
            const newActiveButtons = { ...prev, [buttonValue]: !prev[buttonValue] };
            const buttonName = categories[buttonValue - 1];
    
            // Update activated button names based on the new state
            let updatedActivatedButtonNames;
            if (newActiveButtons[buttonValue]) {
                updatedActivatedButtonNames = [...activatedButtonNames, buttonName];
                filter_project(updatedActivatedButtonNames);
            } else {
                updatedActivatedButtonNames = activatedButtonNames.filter(name => name !== buttonName);
                filter_project(updatedActivatedButtonNames);
            }
                // Update the state with the new activated button names
            setActivatedButtonNames(updatedActivatedButtonNames);
                          
            return newActiveButtons;
        });
    };

    const onGoDetailScreen = (item) => {
        navigation.navigate('ScreenProjectDetail', {item});
    };

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setDimensions(window);
        });

        return () => subscription?.remove();
    }, []);
      
    
    useEffect(() => {
        fetchProjects(); // Call fetchProjects on initial load

        const unsubscribe = navigation.addListener('focus', () => {
            fetchProjects(); // Call fetchProjects when the screen is focused
        });

        // Cleanup the listener on unmount
        return unsubscribe;
    }, [navigations]);
    
    useEffect(()=>{
        fetchProjects();
    },[]);
   
    
    const ProjectDetail = ({ item, index }) => {

        if(item.paidStep != 'none')
            return;
        
        const onFavoriteProject = (projectId, index) => {

            setLikedBuckets(prevState => ({
                ...prevState,
                [index]: !prevState[index] // Toggle the like state for the specific bucket
            }));

            http.post('/project/set_favorite',{phoneNumber, projectId}).then(res=>{
                if(res.data.message == "set favorite success"){
                    
                }
            });
        };

        let firstImageUrl = '';
        if(item.projectImageUrl.length > 0){
            firstImageUrl = "https://posting.backend.server.marketmajesty.net/" + item.projectImageUrl[0].path.replaceAll('\\', '/')
            // firstImageUrl = "http://192.168.148.98:3000/"  + item.projectImageUrl[0].path.replaceAll('\\', '/');
        }

        return (
            <View style={styles.project_detail}>
                <View style={{ backgroundColor: 'lightgray', justifyContent: 'center', alignItems: 'center', 
                    borderRadius: 12, overflow: 'hidden' }}>
                    <TouchableOpacity onPress={() => onGoDetailScreen(item)}>
                        
                        <Image
                            source={{ uri: firstImageUrl }} 
                            style={{ width: 120, height: 120 }}
                        />
                    </TouchableOpacity>
                </View>
                <View style={{ padding: 5, paddingLeft: 10, flex: 1 }}>
                    <View style={styles.header}>
                        <Text style={styles.projectName}>{item.projectName}</Text>
                        <TouchableOpacity onPress={() => onFavoriteProject(item._id, index)}> 
                            <FontAwesome 
                                name={likedBuckets[index] ? "heart" : "heart-o"}
                                size={20} 
                                color="red" 
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.descriptionContainer}>
                        <Text style={styles.description}>
                            {item.description}
                        </Text>  
                    </View>
                    <View style={styles.footer}>
                        <Text style={styles.location}>{item.location}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <TouchableOpacity style={styles.seatButton} onPress={() => onGoDetailScreen(item)}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <FontAwesome name="users" size={15} color="#000" /> 
                                        <Text style={{ color: 'white', marginLeft: 5 }}>
                                            {item.projectCandidates.length}/{item.available}
                                        </Text>
                                    </View>
                                    <Text style={styles.seatText}>Seat Available</Text>
                                </View>
                            </TouchableOpacity>
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>$ {item.budget}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        );
    };
    
    return (
        <View style={tw`flex-1 justify-center bg-black pb-18 `}>
            <ScrollView>
                <View style={styles.header_image}>
                    <View style={{ width: '100%', }}>
                        <Image source={require('../../../assets/images/1.png')}
                        style={{ width: '100%', height: 250, resizeMode: 'cover',borderRadius:10, marginBottom:3 }}/>    
                    </View>
                </View>
                <View style={styles.buttonMatrix}>
                    <Text style={tw`text-white text-7 text-center mb-3`}>Interested In</Text>
                    {Array.from({ length: Math.ceil(categories.length / 3) }, (_, rowIndex) => (
                        <View key={rowIndex} style={styles.row}>
                            {Array.from({ length: 3 }, (_, colIndex) => {
                                const buttonValue = rowIndex * 3 + colIndex + 1;
                                if(buttonValue <= categories.length){
                                    return (
                                        <HoverButton
                                            key={colIndex}
                                            title={categories[buttonValue - 1]}
                                            isActive={activeButtons[buttonValue]}
                                            onPress={() => handleButtonPress(buttonValue)}
                                        >
                                        </HoverButton>
                                    );
                                }
                            })}
                        </View>
                    ))}
                </View>
                <View style={{width:'98%', margin:'auto', marginTop:7}}>
                    {projectList && projectList.length>0?(
                        <FlatList 
                        data={projectList}
                        // renderItem={project_detail} 
                        // item.paidStep
                        renderItem={({item, index})=><ProjectDetail item={item} index={index}/>}
                        keyExtractor={(item, index)=>index.toString()}
                    />
                    ):(
                        <Text style={{ textAlign: 'center', marginTop: 20, color: 'gray' }}>
                            There are no projects.
                        </Text>
                    )}
                </View>
            </ScrollView>
            {/* <Loading visible={loading} /> */}
        </View>
    );
};

const styles = StyleSheet.create({
    header_image: {
        marginTop: 5,
        alignItems: 'center',
        justifyContent: 'center',
        // width: Dimensions.get('window').width*0.98,
        width:'98%',
        flexDirection: 'row',
        margin:'auto',
        overflow:'hidden' ,
        borderRadius:10,
        
    },
    buttonMatrix: {
        width: '100%',
        marginTop: 10,
        marginBottom: 5,
        paddingHorizontal: 25,
    },
    button: {
        // width: Dimensions.get('window').width * 0.28,
        width:'32%',
        height: 30,
        borderRadius: 25,
        backgroundColor: '#101214',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 3,
        borderColor: '#111516',
        // borderWidth: 2
    },
    buttonText: {
        color: 'white',
        fontSize: 11,
    },
    activeButton: {
        backgroundColor: '#28a745',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 1.5,
        padding: 3,
    },
    project_detail:{
        flexDirection:'row',
        // width:Dimensions.get('window').width*0.98,
        width:'100%',
        height:120,
        // height:Dimensions.get('window').width*0.28,
        backgroundColor:'#101214',
        borderRadius:10,
        marginTop:6,
        margin:'auto',
        overflow:'hidden'
    },
    header: {
        
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
        // paddingVertical: 10,
    },
    projectName: {
        fontSize: 18,
        fontWeight: 'bold',
        color:'white'
    },
    descriptionContainer: {
        marginTop:4,
        flex: 1,
        overflow: 'hidden',
        color:'white',
        
    },
    description: {
        fontSize: 7,
        lineHeight:10 ,
        color:'white'
    },
    footer: {
        // paddingVertical: 10,
        // borderTopWidth: 1,
        borderTopColor: '#ccc',
        // alignItems: 'flex-start',
    },
    location: {
        fontSize: 12,
        fontWeight: 'bold',
        color:'white',
        marginBottom:2
    },
    seatButton: {
        // marginTop: 5,
        padding: 2,
        backgroundColor: '#00A84F',
        borderRadius: 8,
        width:180,
        alignItems:'center',
        
    },
    seatText: {
        marginLeft:10,
        fontSize: 12,
        color:'white'
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

export default ScreenProjectList;
