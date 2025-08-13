import React from "react";
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    StyleSheet
} from 'react-native'
import { COLORS, FONTS, SIZES, colors } from '../constants'

function getColor(status) {
    return status == "Chờ làm việc" ? colors.waitWorking :
        (status == "Hoàn thành" ? colors.workDone : colors.cancel)
}
function SessionItem(props) {
    let {
        id,
        title,
        workSession,
        respWorkSession,
        register,
        time,
        status,
        isManager,
        publicPage
    } = props.session;
    const { onPress } = props

    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                width: '100%',
                paddingVertical: 5,
                paddingHorizontal: 10,
                marginBottom: 10,
                borderRadius: SIZES.radius,
                backgroundColor: COLORS.white,
                ...styles.shadow
            }}>
            <View style={{
                flexDirection: 'row',
                padding: 4,
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
                    <Image style={{ height: 40, width: 40}}
                        resizeMode="cover"
                        source={require("../assets/images/present.png")} />
                </View>
                <Text style={{
                    ...FONTS.h3,
                    color: getColor(status)
                }}>Buổi làm việc</Text>
            </View>
            {isManager && register.length > 0 && <Text style={{
                ...FONTS.h3,
                color: COLORS.primary,
                fontWeight: 'bold',
                marginTop: 3,
                marginBottom: 3,
                paddingBottom: 3,
            }}>Đơn vị tiếp nhận:
                <Text style={{
                    color: 'black',
                    fontWeight: '100',
                    ...FONTS.h3,
                }}> {register?.[0].receiveUnit?.name}
                </Text>
            </Text>}
            {isManager && register.length > 0 && <Text style={{
                ...FONTS.h3,
                color: COLORS.primary,
                fontWeight: 'bold',
                marginTop: 3,
                marginBottom: 3,
                paddingBottom: 3,
            }}>Người tạo:
                <Text style={{
                    color: 'black',
                    fontWeight: '100',
                    ...FONTS.h3,
                }}> {register?.[0].senderUsers?.givenName}
                </Text>
            </Text>}
            <Text style={{
                ...FONTS.h3,
                color: COLORS.primary,
                fontWeight: 'bold',
                marginTop: 3,
                marginBottom: 3,
                paddingBottom: 3,
            }}>Buổi làm việc:
                <Text style={{
                    color: 'black',
                    fontWeight: '100',
                    ...FONTS.h3,
                }}> {respWorkSession ? respWorkSession : workSession}
                </Text>
            </Text>
            <View style={{
                marginTop: 3,
                marginBottom: 3,
                paddingBottom: 3,
                flexDirection: 'row'
            }}>
                <Text style={{
                    color: 'black',
                    fontWeight: 'bold',
                    ...FONTS.h3,
                }}>Thời gian dự kiến:
                </Text>
                <Text style={{
                    color: 'black',
                    ...FONTS.h3,
                }}> {time}
                </Text>
            </View>

            <View style={{
                width: '100%',
                height: 40,
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center'
            }}>
                {publicPage && <View style={{
                    width: '40%',
                    height: 30,
                    margin: 5,
                    borderRadius: 10,
                    backgroundColor: colors.cancel,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Text style={{
                        color: 'white',
                        fontSize: 15,
                        fontWeight: 'bold'
                    }}>{'Công khai'}</Text>
                </View>}
                
                <View style={{
                    width: '40%',
                    height: 30,
                    margin: 5,
                    borderRadius: 10,
                    backgroundColor: getColor(status),
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Text style={{
                        color: 'white',
                        fontSize: 15,
                        fontWeight: 'bold'
                    }}>{status}</Text>
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
export default SessionItem