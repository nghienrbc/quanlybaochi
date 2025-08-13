import React from "react";
import {
    Text,
    View,
    StyleSheet
} from 'react-native'
import {COLORS, FONTS, SIZES} from '../constants'

function ProvideItem(props) {
    let {
        id,  
        isAccount,
        email,
        name,
        pressInstitute,
    } = props.provide;
    return (
        <View style={{
            width:'100%',
            height: 'auto',
            paddingHorizontal:10,
            paddingVertical:5,
            marginBottom:5,
            borderRadius: SIZES.radius,
            backgroundColor: COLORS.white,
            ...styles.shadow
        }}> 
            <View style={{
                marginBottom: 1,  
            }}>
                <Text style={{ 
                    color:'black', 
                    fontWeight:'bold', 
                    ...FONTS.h4
                    }}>Người nhận:
                    <Text style={{
                    color: 'black', 
                    ...FONTS.h4
                }}> {name}
                    </Text>
                </Text>
            </View>

            <View style={{
                marginBottom: 1,  
            }}>
                <Text style={{ 
                    color:'black', 
                    fontWeight:'bold', 
                    ...FONTS.h4 
                    }}>Email:
                    <Text 
                    numberOfLines={1}
                    style={{ 
                        color: 'black', 
                        ...FONTS.h4
                        }}> {email}
                    </Text>
                </Text>                
            </View>

            {pressInstitute !== '' && <View style={{
                marginBottom: 1,  
            }}>
                <Text style={{ 
                    color:'black', 
                    fontWeight:'bold', 
                    ...FONTS.h4 
                    }}>Đơn vị:
                    <Text 
                    numberOfLines={1}
                    style={{ 
                        color: 'black', 
                        ...FONTS.h4
                        }}> {pressInstitute}
                    </Text>
                </Text>                
            </View>}
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
export default ProvideItem