import React from "react";
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    StyleSheet
} from 'react-native'
import { COLORS, FONTS, SIZES, images, colors } from '../constants'

function getColor(states) {
    if (states === 'Bản nháp') {
        return COLORS.darkgray;
    } else if (states === 'Đã gửi') {
        return colors.success;
    }
}
function WorkProvideItem(props) {
    let {
        id,
        agency,
        agencySend,
        title,
        content,
        time,
        states,
        userTypeID,
        notifyView
    } = props.provide;
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
                            source={images.provideinfo} />
                    </View>
                    <Text style={{
                        ...FONTS.h3,
                        color: getColor(states)
                    }}>Chủ động cung cấp thông tin</Text>
                </View>
                {userTypeID == 7 && <View style={{ flexDirection: 'row', width: '10%', alignContent: 'center' }}>
                    {notifyView == null ? (
                        <View style={{
                            borderRadius: 50, width: 20, height: 20,
                            backgroundColor: colors.newprimary
                        }}>
                        </View>
                    ) : null}
                </View>}

            </View>

            {userTypeID == 7 || userTypeID == 2 ?
                <View style={{
                    marginBottom: 3,
                    paddingBottom: 3,
                }}>
                    <Text style={{
                        fontWeight: 'bold',
                        color: '#454545',
                        ...FONTS.h3,
                    }}>
                        <Image style={{ height: 28, width: 28 }}
                            resizeMode="contain"
                            source={require("../assets/icons/bulding_icon.png")} /> {agency}</Text>
                </View> : null}

            <View style={{
                marginBottom: 3,
                paddingBottom: 3,
            }}>
                <Text style={{
                    fontWeight: 'bold',
                    ...FONTS.h3,
                    color: COLORS.primary
                }}>Tiêu đề:</Text>
                <Text style={{
                    textAlign: 'left',
                    color: COLORS.primary,
                    ...FONTS.h3,
                }}>- {title}</Text>
            </View>
            <View style={{
                marginBottom: 3,
                paddingBottom: 3,
                flexDirection: 'row'
            }}>
            </View>
            <View style={{
                marginBottom: 3,
                paddingBottom: 3,
                flexDirection: 'row'
            }}>
                <View style={{
                    marginBottom: 3,
                    paddingBottom: 3,
                    flexDirection: 'row'
                }}>
                    {states === 'Bản nháp' && (
                        <Text style={{
                            color: 'black',
                            fontWeight: 'bold',
                            ...FONTS.h3,
                        }}>Thời gian lưu bản nháp:
                        </Text>
                    )}
                    {states === 'Đã gửi' && (
                        <Text style={{
                            color: 'black',
                            fontWeight: 'bold',
                            ...FONTS.h3,
                        }}>Thời gian cung cấp:
                        </Text>
                    )}
                    <Text style={{
                        color: 'black',
                        ...FONTS.h3,
                    }}> {time}
                    </Text>
                </View>
            </View>
            {userTypeID == 3 || userTypeID == 2 ?
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
                        backgroundColor: getColor(states),
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Text style={{
                            color: 'white',
                            fontSize: 16,
                            fontWeight: 'bold'
                        }}>{states}
                        </Text>
                    </View>
                </View> : null}
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
export default WorkProvideItem