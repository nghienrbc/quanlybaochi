import React from "react";
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    StyleSheet
} from 'react-native'
import { COLORS, FONTS, SIZES,images, colors } from '../constants'

function getColor(status) {
    return status == 'Chờ phê duyệt' ? colors.waitConfirm :
        (status == "Chờ làm việc" ? colors.waitWorking :
            (status == "Hoàn thành" ? colors.workDone :
                (status == "Đã phản hồi" ? colors.hadResponsed : colors.cancel)))
}
function WorkItem(props) {
    let {
        id,
        agency,
        agencySend,
        title,
        responseTitle,
        content,
        time,
        status,
        senderName,
        userTypeID,
        notifyId,
        notifyView,
        direct
    } = props.work;
    const { onPress } = props
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                width: '100%',
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
                padding: 4,
                alignItems: 'center'
            }}>
                <View style={{ flexDirection: 'row', width: '90%', alignItems: 'center' }}>
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
                        {userTypeID === 3 || userTypeID === 2 ? (
                            <Image
                                style={{ height: 40, width: 40}}
                                resizeMode="cover"
                                source={images.worklist}
                            />
                            ) : (
                            <Image
                                style={{ height: 40, width: 40}}
                                resizeMode="cover"
                                source={images.inviteWorking}
                            />
                            )}
                    </View>
                    <Text
                        style={{
                            ...FONTS.h3,
                            color: getColor(status)
                        }}> {direct == true ? 'Đăng kí làm việc trực tiếp' : 'Đăng kí làm việc'}
                    </Text>
                </View>
                {userTypeID === 2 ? null : (
                    <View style={{ flexDirection: 'row', width: '10%', alignContent: 'center' }}>
                        {notifyView == null ? (
                        <View style={{ 
                            borderRadius: 50, width: 20, height: 20, 
                            backgroundColor: colors.newprimary 
                            }}>
                        </View>
                        ) : null}
                    </View>
                    )}
            </View>

            <Text style={{
                fontWeight: '800',
                fontSize: 16,
                color: '#454545',
                marginBottom: 3,
                paddingBottom: 3,
            }}> <Image style={{ height: 20, width: 20 }}
                resizeMode="contain"
                source={require("../assets/icons/bulding_icon.png")} /> {agency}
            </Text>

            {responseTitle ?
                <Text
                    numberOfLines={2}
                    style={{
                        color: 'black',
                        fontWeight: 'bold',
                        ...FONTS.h3,
                    }}>Buổi làm việc:
                    {responseTitle ?
                        <Text
                            style={{
                                fontWeight: '100',
                                color: 'black',
                                ...FONTS.h3,

                            }}> {responseTitle}
                        </Text> : null}
                </Text> : null}

            {direct == false && title !== responseTitle ? <Text
                numberOfLines={2}
                style={{
                    color: 'black',
                    fontWeight: 'bold',
                    ...FONTS.h3,
                }}>Tiêu đề đăng ký: <Text style={{
                    textAlign: "justify",
                    color: 'black',
                    ...FONTS.h3,
                }}>{title}</Text>
            </Text> : null}


            {userTypeID != 7 &&
                <View style={{
                    marginBottom: 3,
                    paddingBottom: 3,
                }}>
                    <Text style={{
                        color: 'black',
                        fontWeight: 'bold',
                        ...FONTS.h3
                    }}>Người đăng ký:
                        <Text style={{
                            color: 'black',
                            ...FONTS.h3
                        }}> {senderName}</Text>
                    </Text>
                </View>}
            {userTypeID == 2 && (
            <View style={{
                marginBottom: 3,
                paddingBottom: 3,
                flexDirection: 'row',
                flexWrap: 'wrap',
            }}>
                <Text style={{
                    color: 'black',
                    fontWeight: 'bold',
                    ...FONTS.h3,
                }}>Đơn vị đăng ký:
                </Text>
                <Text style={{
                    color: 'black',
                    ...FONTS.h3,
                }}> {agencySend}
                </Text>
            </View>
            )}

            <View style={{
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
export default WorkItem