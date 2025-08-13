import React from 'react';
import {
    Text, 
    View,
    Image,
    TouchableOpacity,
} from 'react-native'

function GridItem(props) {
    const {item, index, onPress} = props
    //debugger
    return <View style={{
        flex: 1,
        marginLeft: index % 0 == 0 ? 20 : 10,
        marginRight: 10,
        marginBottom: 8,
    }}>
        <TouchableOpacity
            onPress={onPress}
            style={{            
            }}>
            <Image
                style={{
                    width: '80%',
                    aspectRatio: 1/1,
                    height:'auto',
                    maxHeight:70,
                    resizeMode: 'contain', 
                    alignSelf:'center',
                    marginBottom:5,
                }}
                source={item.image}
            />
            <Text style={{
                color: 'black',
                fontSize: 12,
                fontWeight:'500',
                flex: 1,
                textAlign: 'center' 
            }}>{item.name}</Text>
        </TouchableOpacity> 
    </View>
}

export default GridItem