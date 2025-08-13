import React, { useState, useEffect } from "react";
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    StyleSheet
} from 'react-native'
import { COLORS, FONTS, SIZES , colors} from '../../constants'
import { convertDateToDateTimeString } from "../../utilies/DateTime";

function ReportInofConfirmItem(props) {
    let {
        id,
        content,
        apointment,
        apointmentDate,
        createdAt,
        document
    } = props.requireInfo;
    const { onPress } = props
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                width: '100%',
                height: 'auto',
                padding: 10,
                marginBottom: 10,
                borderRadius: SIZES.radius,
                backgroundColor: COLORS.white,
                ...styles.shadow
            }}>
            <View style={{ alignSelf: 'flex-end', marginRight: 10, marginTop: 0 }}>
            </View>
            <View style={{
                marginBottom: 3,
                paddingBottom: 3,
                flexDirection:'row',
                justifyContent:'space-between'
            }}>
                <Text style={{
                    color: 'black', fontWeight: 'bold', ...FONTS.h4
                }}>Thời gian phản hồi:
                    <Text style={{
                        color: 'black', ...FONTS.h4
                    }}> {convertDateToDateTimeString(createdAt)}
                    </Text>    
                </Text>
                <Image source={require("../../assets/icons/viewMore_icon.png")}
                        style={{
                            width: 22,
                            height:22,
                            tintColor: colors.newprimary,
                        }}
                    />
            </View>

            <View style={{
                marginBottom: 3,
                paddingBottom: 3,
            }}>
                <Text
                    numberOfLines={2}
                    style={{
                        color: 'black', fontWeight: 'bold', ...FONTS.h4
                    }}>Nội dung phản hồi:
                    <Text style={{
                        color: 'black', ...FONTS.h4
                    }}> {content}
                    </Text>
                </Text>
            </View>
            {apointment == true ? <View style={{
                marginBottom: 3,
                paddingBottom: 3,
            }}>
                <Text
                    style={{
                        color: 'red', fontWeight: 'bold', ...FONTS.h4
                    }}>Hẹn cung cấp thông tin trực tiếp
                </Text>
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
export default ReportInofConfirmItem