import React, { Component, useEffect, useState } from 'react';
import {
    Text,
    View,
    StyleSheet,
    Image,
    ImageBackground,
    TextInput,
    SafeAreaView,
    StatusBar,
    KeyboardAvoidingView,
    Keyboard,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { COLORS, FONTS, SIZES,images} from '../../constants'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
function PressAgencyFullItem(props) {
    let { id, name, avatar, address, email, phone } = props.pressAgencyItem
    return (
        <View style={{
            width:'95%',
            flexDirection:'row',
            borderRadius: SIZES.radius,
            padding:10, 
            margin:10,
            backgroundColor: COLORS.white,
            ...styles.shadow
        }}>
            {avatar ? <Image style={{
                height: 45,
                width: 45,
                resizeMode: 'cover',
                marginRight: 10,
                borderRadius: 50,
            }}
                source={{ uri: avatar ? avatar : null }} /> :

                <Image style={{
                    height: 45,
                    width: 45,
                    resizeMode: 'cover',
                    marginRight: 10,
                    borderRadius: 50,
                }} 
                    source={images.presslogo} />
            }
            <View style={{
                // backgroundColor:'green',
                flex: 1,
                marginRight: 10,
            }}>
                <Text style={{
                    color: '#0373F3',
                    fontSize: 14,
                    fontWeight: 'bold'
                }}>{name}</Text>

                <View style={{
                    height: 1,
                    backgroundColor: '#BCBCBC',
                }} />
                <View style={{
                    flexDirection: 'column'
                }}>
                    <Text style={{
                        fontWeight: 'bold',
                        color: 'black',
                        ...FONTS.h4,
                    }}>Địa chỉ:
                        <Text style={{
                            fontWeight: '400',
                            color: 'black',
                        }}> {address}
                        </Text>
                    </Text>

                    {phone && <View style={{ flexDirection: 'row' }}>
                        <FontAwesome name='phone' style={{ color: '#bf0826', fontSize: 16, marginRight: 14 }} />

                        <Text style={{
                            fontWeight: '400',
                            color: 'black',
                        }}> {phone}
                        </Text>
                    </View>}

                    {email && <View style={{ flexDirection: 'row' }}>
                        <FontAwesome name='envelope' style={{ color: '#bf0826', fontSize: 16, marginRight: 10 }} />
                        <Text style={{
                            fontWeight: '400',
                            color: 'black',
                        }}> {email}
                        </Text>
                    </View>}

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
export default PressAgencyFullItem;