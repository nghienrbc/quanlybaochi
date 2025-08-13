import React from "react";
import {
Text,
View,
Image,
TouchableOpacity,
StyleSheet
} from 'react-native'
import {COLORS, FONTS, SIZES, images, colors} from '../constants'

function getColor(status)
{
    return status == 'Chờ phản hồi' ? colors.waitConfirm: 
    (status == "Chờ làm việc" ? colors.waitWorking :
    (status == "Hoàn thành" ? colors.workDone: colors.cancel))
}
function WorkInviteItem(props){
    let {
        id,
        agency,
        title,   
        time,
        status,
        userTypeID 
    } = props.invitation;
    const {onPress} = props
    return (
        <TouchableOpacity 
            onPress={onPress}
            style={{
                width:'100%',  
                paddingVertical: 5,
                paddingHorizontal: 10,
                marginTop: 5,
                marginBottom: 5,
                borderRadius: SIZES.radius,
                backgroundColor: COLORS.white,
                ...styles.shadow
            }}>
                <View style={{
                    flexDirection: 'row',
                    padding:4,
                    alignItems: 'center'
                }}>
                    <View
                        style={{
                            height: 50,
                            width: 50,
                            borderRadius: 25,
                            backgroundColor: COLORS.lightGray,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: SIZES.base
                        }}>
                        {userTypeID == 7 ? 
                        <Image style={{height:40,width:40}}
                            resizeMode = "cover"
                            source={images.worklist}/>
                        : 
                        <Image style={{height:40,width:40}}
                        resizeMode = "cover"
                        source={images.inviteWorking}/>}
                    </View>
                        <Text style={{ 
                            ...FONTS.h3,
                            color:getColor(status)
                        }}>Mời làm việc</Text>
                </View>

                {userTypeID == 7 ? 
                <View style={{
                    marginBottom: 3,
                    paddingBottom: 3,
                }}>
                    <Text style={{
                        fontWeight:'bold',
                        color: '#454545',
                        ...FONTS.h3,
                    }}>
                        <Image style={{height:28,width:28}}
                            resizeMode = "contain"
                            source={require("../assets/icons/bulding_icon.png")} /> {agency}</Text>
                </View> : null}

                <View style={{
                    marginBottom: 3,
                    paddingBottom: 3, 
                }}>
                    <Text style={{
                        fontWeight:'bold',
                        ...FONTS.h3,
                        color: COLORS.primary 
                    }}>Tiêu đề:</Text>
                    <Text style={{
                        textAlign:'left', 
                        color: COLORS.primary,
                        ...FONTS.h3,
                    }}>- {title}</Text>
                </View>
            <View style={{
                marginBottom: 3,
                paddingBottom: 3,
                flexDirection:'row'
            }}>
                <Text style={{
                    color:'black', 
                    fontWeight:'bold', 
                    ...FONTS.h3,
                    }}>Thời gian dự kiến:
                </Text>     
                <Text style={{
                    color:'black', 
                    ...FONTS.h3,
                    }}> {time}
                </Text>
            </View> 
            <View style={{
                width:'100%', 
                height: 40, 
                flexDirection: 'row', 
                justifyContent:'flex-end', 
                alignItems:'center'
                }}>
                <View style= {{
                    width:'40%', 
                    height:30, 
                    margin:5, 
                    borderRadius:10, 
                    backgroundColor:getColor(status),
                    justifyContent:'center', 
                    alignItems:'center'
                }}>
                    <Text style={{
                        color:'white', 
                        fontSize:16, 
                        fontWeight:'bold' 
                        }}>{status}  
                    </Text>   
                </View> 
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
        elevation: 5,
    }
})
export default WorkInviteItem