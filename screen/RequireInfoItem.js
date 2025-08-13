import React from "react";
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    StyleSheet
} from 'react-native'
import { COLORS, FONTS, SIZES } from '../constants'
import { images, colors } from "../constants";

function getColor(status) {
    return status == 'Chờ phản hồi' ? colors.waitConfirm :
        (status == "Đã phản hồi" ? colors.workDone :
            (status == "Hủy đề nghị" ? colors.cancel : colors.hadResponsed))
}

function RequireItem(props) {
    let {
        id,
        agency,
        agencyReceive,
        title,
        content,
        time,
        timeCreate,
        status,
        senderName,
        userTypeID,
        notifyId,
        notifyView
    } = props.requireInfo;
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

                <View style={{
                    flexDirection: 'row', width: '90%', alignItems: 'center'
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
                        <Image style={{ height: 40, width: 40 }}
                            resizeMode="cover"
                            source={images.requireInfo} />
                    </View>
                    <Text style={{
                        ...FONTS.h3,
                        color: getColor(status)
                    }}>Đề nghị cung cấp thông tin</Text>
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

            <Text style={{
                color: 'black',
                fontWeight: 'bold',
                ...FONTS.h4,
            }}>Tiêu đề</Text>
            <Text style={{
                textAlign: "justify",
                color: 'black',
                ...FONTS.h4,
            }}>- {title}</Text>

            {userTypeID != 7 &&
                <View style={{
                    marginBottom: 3,
                    paddingBottom: 3,
                }}>
                    <Text style={{
                        color: 'black',
                        fontWeight: 'bold',
                        ...FONTS.h4
                    }}>Người đề nghị:
                        <Text style={{
                            color: 'black',
                            ...FONTS.h4
                        }}> {senderName}</Text>
                    </Text>
                </View>}
            {userTypeID == 2 && (
                <View style={{
                    marginBottom: 3,
                    paddingBottom: 3,
                    flexDirection: 'row',
                    flexWrap:'wrap',
                }}>
                    <Text style={{
                        color: 'black',
                        fontWeight: 'bold',
                        ...FONTS.h4,
                    }}>Đơn vị tiếp nhận:
                    </Text>
                    <Text style={{
                        color: 'black',
                        ...FONTS.h4,
                    }}> {agencyReceive}
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
                    ...FONTS.h4,
                }}>Thời gian gửi đề nghị:
                </Text>
                <Text style={{
                    color: 'black',
                    ...FONTS.h4,
                }}> {timeCreate}
                </Text>
            </View>

            {time != null &&
                <View style={{
                    marginBottom: 3,
                    paddingBottom: 3,
                    flexDirection: 'row'
                }}>
                    <Text style={{
                        color: 'black',
                        fontWeight: 'bold',
                        ...FONTS.h4,
                    }}>Thời gian cung cấp thông tin:
                    </Text>
                    <Text style={{
                        color: 'black',
                        ...FONTS.h4,
                    }}> {time}
                    </Text>
                </View>
            }
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
        shadowRadius: 2.84,
        elevation: 3,
    }
})
export default RequireItem