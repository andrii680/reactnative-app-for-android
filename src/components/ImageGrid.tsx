import React from 'react';
import { 
    View, 
    Image, 
    FlatList, 
    StyleSheet,
    TouchableOpacity,
    Text
 } from 'react-native';
import tw from '../../tailwindcss';

interface ImageGridProps {
    images: any; // Array of image URLs
    removeable:boolean;
    onSendData: (index: number) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({ images, removeable, onSendData }) => {

    const renderItem = ({ item, index }: { item: any, index:number }) => (
        <View style={tw`p-1`}>
            <Image
                source={{ uri: item }}
                style={tw`w-20 h-20 rounded-lg`}
                resizeMode="cover"
            />
            <TouchableOpacity style={{width:'100%', marginTop:10, backgroundColor:'#101214', 
                borderRadius:10, justifyContent:'center', alignItems:'center', marginBottom:10}} 
                onPress={()=>removeImage(index)}>
                {removeable && <Text style={{color:'white', fontSize:10}}>remove</Text>}
            </TouchableOpacity> 
        </View>
    );

    const removeImage = ( index : number) => {
        onSendData(index);
    }

    return (
        <FlatList
            data={images}
            renderItem={renderItem}
            keyExtractor={(item) => item}
            numColumns={4} // Adjust the number of columns as needed
            contentContainerStyle={tw`items-center`}
        />
    );
};

export default ImageGrid;