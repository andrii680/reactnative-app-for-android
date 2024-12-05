import React,{useState,useEffect} from 'react';

import {
    Modal,
    View,
    Text,
    Image,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

import {http} from '../../helpers/http';
import { useAuth } from '../AuthContext';
import Loading from '../../components/Loading';
import tw from '../../../tailwindcss';

interface Props {
    navigation:NavigationProp<any>;
    route:RouteProp<any, any>;
}

const {width} = Dimensions.get('window');
const height = (5/8)*width;

const ScreenMyProjectsPanel: React.FC<Props> = ({ navigation, route }) => {

    let typeProjects:any = '';
    if(!route.params){
        typeProjects = route;
    }else{
        typeProjects = route.params.projectsType;
    }
    
    const [loading, setLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [projects, setProjects] = useState([]);
    const [panelTitle, setPanelTitle] = useState('My Projects');

    const {phoneNumber} = useAuth();
    const navigations = useNavigation();

    const project_lists = projects;

    const candidatesProject = (item) => {

        if(typeProjects == 'mine'){
            const sending_data = {candidates:item.projectCandidates,  item:item};
            navigation.navigate('ScreenCandidatesInProject',{sending_data});
        }else{
            navigation.navigate('ScreenProjectDetail', {item});
        }
    };
    
    const autoGetProjects= () => {

        switch(typeProjects){
            case 'mine':
                setPanelTitle('My projects');
                http.get('/project/get_myprojects', {params:{phoneNumber}}).then(res=>{
                    setProjects(res.data.data)
                });
                break;
            case 'favorite':
                setPanelTitle('Favorite projects');
                http.get('/project/get_favoriteprojects', {params:{phoneNumber}}).then(res=>{
                    setProjects(res.data.data)
                });
                break;
            case 'applied':
                setPanelTitle('Applied projects');
                http.get('/project/get_appliedprojects', {params:{phoneNumber}}).then(res=>{
                    setProjects(res.data.data)
                });
                break;
        }
    }

    const projectDetail = ({ item, index }) => (
        <View style={styles.project_detail}>
            <View style={{  backgroundColor: 'lightgray', justifyContent: 'center', alignItems: 'center',
                borderRadius:10,overflow:'hidden' }}>
                <Image
                    source={require('../../../assets/images/sea.jpg')}
                    style={{width:80, height:80}}
                />
            </View>
            <View style={styles.outerContainer}>
                <View style={styles.innerContainer}>
                    <View style={styles.flex8}>
                        <Text style={styles.text}>{item.projectName}</Text>
                    </View>
                    <View style={styles.flex2}>
                        <TouchableOpacity onPress={()=>candidatesProject(item)}>
                            <Icon name="chevron-right" size={20} color="white"/>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    useFocusEffect(

        React.useCallback(
            ()=>{
                autoGetProjects();
            },[navigations]
        )
    );

    return(
        <SafeAreaView   style={tw`flex-1 bg-black pb-16`}>
            <TouchableOpacity
            style={[styles.backButton, isHovered && styles.hoveredButton]} // Apply hover style when hovered
            onPress={() => navigation.goBack()}
            onMouseOver={() => setIsHovered(true)} // Set hovered state to true on mouse enter
            onMouseLeave={() => setIsHovered(false)} // Reset hovered state on mouse leave
            >
                <Icon name="chevron-left" size={20} color="white" />
            </TouchableOpacity>
            <Text style={styles.panel_name}>{panelTitle}</Text>
            <View style={tw`mt-5 flex-row items-center justify-center w-full`}>
                {project_lists && project_lists.length > 0 ? (
                    <FlatList 
                        data={project_lists}
                        renderItem={projectDetail}
                        keyExtractor={(item, index) => index.toString()}
                    />
                ) : (
                    <Text  style={{ textAlign: 'center', marginTop: 20, color: 'gray' }}>No projects you post.</Text> 
                )}
            </View>
            {/* <Loading visible={loading} /> */}
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    project_detail:{
        flexDirection:'row',
        // width:Dimensions.get('window').width*0.98,
        width:'94%',
        height:92,
        // backgroundColor:'#101214',
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

export default ScreenMyProjectsPanel;