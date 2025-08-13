import React from "react";
import {
    Text,
    View,
    StyleSheet
} from 'react-native'

import {COLORS, FONTS, SIZES} from '../constants'

function RegisterItem(props) {
    let {
        id,
        senderUserName, 
        agency
    } = props.register;
    return (
        <View style={{
            width:'100%', 
            padding:15,
            marginBottom:12,
            borderRadius: SIZES.radius,
            backgroundColor: COLORS.white,
            ...styles.shadow
        }}>
            <View style={{
                marginBottom: 3,
                paddingBottom: 3,
            }}>
                <Text style={{ 
                    color:'black', 
                    fontWeight:'bold', 
                    ...FONTS.h3
                    }}>Người tham dự:
                    <Text style={{
                    color: 'black', 
                    ...FONTS.h3
                }}> {senderUserName}
                    </Text>
                </Text>
            </View>
            <View style={{
                marginBottom: 3,
                paddingBottom: 3,
            }}>
                <Text style={{ 
                    color:'black', 
                    fontWeight:'bold', 
                    ...FONTS.h3 
                    }}>Đơn vị làm việc:
                    <Text style={{ 
                        color: 'black', 
                        ...FONTS.h3 
                        }}> {agency}
                    </Text>
                </Text>                
            </View>
        </View>
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
        elevation: 5,
    }
})
export default RegisterItem