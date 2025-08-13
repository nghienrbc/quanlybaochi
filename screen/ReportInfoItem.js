import React from "react";
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    StyleSheet
} from 'react-native'
import { COLORS, FONTS, SIZES, images, colors } from '../constants'

function getColor(status) {
    return status == 'Chờ phản hồi' ? colors.waitConfirm : colors.workDone
}

function ReportItem(props) {
    let {
        id,
        agency,
        title,
        content,
        timeCreate,
        status,
        senderName,
        publicPage,
        userTypeID,
        notifyId,
        notifyView
    } = props.reportInfo;
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
                            source={images.reflectinfo} />
                    </View>
                    <Text style={{
                        ...FONTS.h3,
                        color: getColor(status)
                    }}>Phản ánh báo chí</Text>
                </View>

                <View style={{ flexDirection: 'row', width: '10%', alignContent: 'center' }}>
                    {notifyView == null ? (
                        <View style={{
                            borderRadius: 50, width: 20, height: 20,
                            backgroundColor: colors.newprimary
                        }}>
                        </View>
                    ) : null}
                </View>
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
                    }}>Người yêu cầu:
                        <Text style={{
                            color: 'black',
                            ...FONTS.h4
                        }}> {senderName}</Text>
                    </Text>
                </View>}

            <View style={{
                marginBottom: 3,
                paddingBottom: 3,
                flexDirection: 'row'
            }}>
                <Text style={{
                    color: 'black',
                    fontWeight: 'bold',
                    ...FONTS.h4,
                }}>Thời gian gởi phản ánh:
                </Text>
                <Text style={{
                    color: 'black',
                    ...FONTS.h4,
                }}> {timeCreate}
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
        shadowRadius: 2.84,
        elevation: 3,
    }
})
export default ReportItem