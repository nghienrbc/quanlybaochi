import React from "react";
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    StyleSheet
} from 'react-native'
import { FONTS, SIZES } from '../constants'

function PressReleaseSlideItem(props) {
    let {
        id,
        title,
        content,
        sender,
        createdAt,
        imageUrl
    } = props.annoucement;
    const { item, index, onPress } = props
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                // flex: 1,
                width: 300,
                height: 'auto',
                marginRight: SIZES.radius,
                marginLeft: index == 0 ? SIZES.padding : 0,
                marginVertical: SIZES.radius,
                borderRadius: SIZES.radius,
                backgroundColor: "white",
                ...styles.shadow,
                marginStart: 10
            }}>
            <View> 
                {/* ảnh thumnail thông cáo */}
                <Image style={{
                    height: 200,
                    width: "100%",
                    resizeMode: 'cover',
                    marginRight: 10,
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                }}
                    source={{ uri: imageUrl ? imageUrl : null }} />
                    
                {/* đon vị gửi thông cáo */}
                <Text numberOfLines={1}
                    style={{
                        ...FONTS.h4,
                        color: 'black',
                        marginLeft: 15,
                        marginTop: 7,
                        fontWeight: 'bold'
                    }}>Đơn vị gửi: <Text numberOfLines={2}
                        style={{
                            ...FONTS.h4,
                            color: '#393939', 
                        }}>{sender}</Text>
                </Text>
                {/* ngày gửi thông cáo */}              
                    <Text numberOfLines={2}
                        style={{
                            alignSelf:'flex-end',
                            marginVertical:7,
                            marginRight:10,
                            fontWeight:'bold',
                            fontSize:11,
                            color: '#393939', 
                        }}><Image style={{height:15,width:15}}
                        resizeMode = "cover"
                        source={require("../assets/icons/clock_icon.png")}/>  {createdAt}</Text>
            </View>
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 10,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 6,
    }
})
export default PressReleaseSlideItem