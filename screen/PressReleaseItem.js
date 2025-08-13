import React from "react";
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    StyleSheet
} from 'react-native'
import { COLORS, FONTS, SIZES } from '../constants'

function PressReleaseItem(props) {
    let {
        id,
        agency,
        title,
        time,
        senderName,
        imageUrl
    } = props.annoucement;
    const { onPress } = props
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                width: '100%',
                padding: 6,
                alignContent: 'center',
                alignItems: 'center',
                marginVertical: 10,
                marginBottom: 10,
                borderRadius: SIZES.radius,
                backgroundColor: COLORS.white,
                ...styles.shadow
            }}>
            <View style={{ flexDirection: 'row', marginTop: 4, marginStart: 3, alignSelf: 'flex-start' }}>
                <Image style={{ height: 15, width: 15 }}
                    resizeMode="cover"
                    source={require("../assets/icons/clock_icon.png")}
                />
                <Text style={{
                    color: 'black',
                    fontSize: 10,
                    marginStart: 3,
                    borderBottomColor: 'black',
                    marginBottom: 3,
                    paddingBottom: 3,
                    fontWeight: 'bold'
                }}> {time}</Text>
            </View>
            <View style={{ height: 1, width: '98%', backgroundColor: '#ECECEC', marginBottom: 6 }}>

            </View>
            <View style={{ justifyContent: 'center' }}>
                <Image style={{ width: 300, height: 200, borderRadius: 6, marginTop: 2 }}
                    source={{ uri: imageUrl ? imageUrl : null }} />
            </View>

            <View style={{
                flexDirection: 'row',
                margin: 10
            }}>
                <View style={{ flex: 1 }}>
                    <Text numberOfLines={3}
                        style={{
                            textAlign: "justify",
                            color: 'black',
                            ...FONTS.h3,
                            borderBottomColor: 'black',
                            marginBottom: 3,
                            paddingBottom: 3
                        }}>
                        <Image style={{ height: 24, width: 24 }}
                            resizeMode="cover"
                            source={require("../assets/icons/done_icon.png")}
                        />{title}</Text>

                    {agency && <Text style={{
                        fontWeight: 'bold',
                        ...FONTS.h3,
                        color: COLORS.primary,
                    }}>Đơn vị gửi thông cáo:
                        <Text style={{
                            color: 'black',
                            fontSize: 15,
                            fontWeight: '400',
                            marginBottom: 3,
                            paddingBottom: 3,
                        }}> {agency}</Text>
                    </Text>}

                    {senderName && <View style={{
                        color: 'black',
                        ...FONTS.h3,
                        borderBottomColor: 'black',
                    }}>
                        <Text style={{
                            fontWeight: 'bold',
                            ...FONTS.h3,
                            color: COLORS.primary
                        }}>Đại diện gửi:
                            <Text style={{
                                color: 'black',
                                fontWeight: '400',
                                fontSize: 15
                            }}> {senderName}</Text>
                        </Text>
                    </View>
                    }
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
    },
})
export default PressReleaseItem