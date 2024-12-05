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
   
    console.log("ScreenProjectList");

    const {phoneNumber} = useAuth();

    const navigations = useNavigation();

    const [projectList, setProjectList] = useState([]);
    const [pageState, setPageState] = useState(1);
    const [activeButtons, setActiveButtons] = useState({"1": true, "2": false, "3": false});
    const [branchList, setBranchList] = useState([]);
    const [dimensions, setDimensions] = useState(Dimensions.get('window'));
    const [likedBuckets, setLikedBuckets] = useState({}); // State to track liked buckets

    const fetchProjects = async () => {

        setActiveButtons({"1": true, "2": false, "3": false});
        const response = await http.get('/project/get_myprojects', {params:{phoneNumber}}); // Fetch data from the server
        const res_data = response.data.data; // Extract the data from the
        return res_data;
    };

    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                try {
                    const tempProjects = await fetchProjects();
                    setFavoriteIcon(tempProjects);
                    setProjectList(tempProjects);
                    const tempBranches = ['My Projects', 'Favs', 'Applied', 'Candidate'];
                    setBranchList(tempBranches);
                } catch (error) {
                    console.error('Error fetching projects:', error);
                }
            };
            fetchData(); // Call the async function
                
        }, [navigations]) // Dependency array
    );

    const categories = branchList;

    const filter_project = async (buttonValue) => {
        
        try {

            switch(buttonValue){
                case 1:
                    http.get('/project/get_myprojects', {params:{phoneNumber}}).then(res=>{
                        setFavoriteIcon(res.data.data);
                        setProjectList(res.data.data);
                    });
                    break;
                case 2:
                    http.get('/project/get_favoriteprojects', {params:{phoneNumber}}).then(res=>{
                        setFavoriteIcon(res.data.data);
                        setProjectList(res.data.data);
                    });
                    break;
                case 3:
                    http.get('/project/get_appliedprojects', {params:{phoneNumber}}).then(res=>{
                        setFavoriteIcon(res.data.data);
                        setProjectList(res.data.data);
                    });
                    break;
                case 4:
                    http.get('/project/get_firstpaidjects', {params:{phoneNumber}}).then(res=>{
                        setFavoriteIcon(res.data.data);
                        setProjectList(res.data.data);
                    });
                    break;
            }
        } catch (error) {
                console.error('Error communicating with server:', error);
        }
    };
            
    const setFavoriteIcon = (projects) => {

        const favoriteArray = [];

        for(let i = 0; i < projects.length; i++){

            if(projects[i].favoriteCandidates.includes(phoneNumber)){
                favoriteArray.push(true);
            }else{
                favoriteArray.push(false);
            }
        }
        setLikedBuckets(favoriteArray);
    }


    const handleButtonPress = (buttonValue) => {
        
        filter_project(buttonValue);

        setActiveButtons(prev => {
            prev = {"1": false, "2": false, "3": false};
            const newActiveButtons = { ...prev, [buttonValue]: true };
            return newActiveButtons;
        });
    };

    const onGoDetailScreen = (item) => {
        const sending_data = {candidates:item.projectCandidates,  item:item};
        navigation.navigate('ScreenCandidatesInProject',{sending_data});
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
        firstImageUrl = "https://posting.backend.server.marketmajesty.net/" + item.projectImageUrl[0].path.replaceAll('\\', '/')
        // firstImageUrl = "http://192.168.148.98:3000/"  + item.projectImageUrl[0].path.replaceAll('\\', '/')

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
                        <Image source={require('../../../assets/images/2.png')}
                        style={{ width: '100%', height: 250, resizeMode: 'cover',borderRadius:10, marginBottom:3 }}/>    
                    </View>
                </View>
                <View style={styles.buttonMatrix}>
                    {Array.from({ length: 1 }, (_, rowIndex) => (
                        <View key={rowIndex} style={styles.row}>
                            {Array.from({ length: 4 }, (_, colIndex) => {
                                const buttonValue = rowIndex * 4 + colIndex + 1;
                                return (
                                    <HoverButton
                                        key={colIndex}
                                        title={categories[buttonValue - 1]}
                                        isActive={activeButtons[buttonValue]}
                                        onPress={() => handleButtonPress(buttonValue)}
                                    >
                                    </HoverButton>
                                );
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
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft:5,
        marginRight:5,
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        width:'80%',
        marginVertical: 1.5,
        padding: 3,
    },

    button: {
        // width: Dimensions.get('window').width * 0.28,
        width:'25%',
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
