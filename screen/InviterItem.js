import React from "react";
import {
    Text,
    View,
    StyleSheet
} from 'react-native'
import {COLORS, FONTS, SIZES, colors} from '../constants'

function getColor(status)
{
    return status == 'Chờ phản hồi' ? colors.waitConfirm: 
    (status == "Chờ làm việc" ? colors.waitWorking :
    (status == "Hoàn thành" ? colors.workDone: colors.cancel))
}
function InviterItem(props) {
    let {
        id,
        senderUserName, 
        agency,
        status,
        reasonConfirm,
    } = props.register;
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
                    }}>Người tham dự:
                    <Text style={{
                    color: 'black', 
                    ...FONTS.h4
                }}> {senderUserName}
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
                    }}>Đơn vị làm việc:
                    <Text 
                    numberOfLines={1}
                    style={{ 
                        color: 'black', 
                        ...FONTS.h4
                        }}> {agency}
                    </Text>
                </Text>                
            </View>

            {status == 'Hủy làm việc' ? <View style={{
                marginBottom: 1, 
            }}>
                <Text style={{ 
                    color:'black', 
                    fontWeight:'bold', 
                    ...FONTS.h4 
                    }}>Lý do không tham dự:
                    <Text style={{ 
                        color: 'black', 
                        ...FONTS.h4
                        }}> {reasonConfirm}
                    </Text>
                </Text>                
            </View> : null}

            <View style={{
                width:'100%', 
                height: 30, 
                flexDirection: 'row', 
                justifyContent:'flex-end', 
                alignItems:'center'
                }}>
                <View style= {{
                    width:'40%', 
                    height:25, 
                    margin:1, 
                    borderRadius:10, 
                    backgroundColor:getColor(status),
                    justifyContent:'center', 
                    alignItems:'center'
                }}>
                    <Text style={{
                        color:'white', 
                        fontSize:14, 
                        fontWeight:'bold' 
                        }}>{status}</Text>
                </View> 
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
export default InviterItem