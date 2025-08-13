import React from 'react';
import {
    Text,
    View,
    Image,
    TouchableOpacity,
} from 'react-native'
import { COLORS } from '../constants'

function GridItemStatis(props) {
    const { item, index, onPress } = props
    //debugger
    return <View style={{
        flex: 0.5,
        //height: 200,
        marginLeft: index % 2 == 0 ? 20 : 10,
        marginTop: 5,
        marginRight: 20,
        marginBottom: 10,
        borderRadius: 20,
        backgroundColor: item.name == '' ? null : COLORS.white,

        shadowColor:  item.name == ''? null :  "#000",
        shadowOffset: item.name == '' ? null : {
            width: 10,
            height: 10,
        },
        shadowOpacity: item.name == '' ? null : 0.25,
        shadowRadius: item.name == '' ? null : 3.84,
        elevation: item.name == '' ? null : 5
    }}>
        <TouchableOpacity
            onPress={onPress}
            style={{
                marginTop: 10,
                marginHorizontal: 10,
                padding: 20
            }}>
            <Image
                style={{
                    width: '45%',
                    aspectRatio: 1 / 1,
                    height: 'auto',
                    maxHeight: 70,
                    resizeMode: 'contain',
                    alignSelf: 'center',
                    marginBottom: 5,
                }}
                source={item.image}
            />
            <Text style={{
                color: 'black',
                fontSize: 12,
                fontWeight: '500',
                flex: 1,
                textAlign: 'center'
            }}>{item.name}</Text>
        </TouchableOpacity>
    </View>
}

export default GridItemStatis