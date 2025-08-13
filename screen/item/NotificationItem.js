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
import { COLORS, FONTS, colors, } from '../../constants'
function NotificationItem(props) {

    let { id, avatar, table, idTable, title, subTitle, action, time, viewUsersId } = props.NotificationItem
    const {onPress} = props
    return (
        <TouchableOpacity 
            onPress={onPress} 
            style={{
            width: '100%',
            flexDirection: 'row',
            paddingHorizontal:15,
            paddingTop:15,
            paddingBottom:8,
            backgroundColor: COLORS.white,
            ...styles.shadow
        }}>
            {viewUsersId == null ? 
            <View style={{
                backgroundColor:colors.newprimary,
                height:10, width: 10, borderRadius:50
                }}> 
            </View>
            : 
            <View style={{
                backgroundColor:'#00000000',
                height:10, width: 10, borderRadius:50
                }}>
            </View>}

            <Image style={{
                height: 50,
                width: 50,
                resizeMode: 'cover',
                marginRight: 10,
                borderRadius: 50,
            }}
                source={{ uri: avatar ? avatar : null }} />
            <View style={{
                flex: 1,
            }}>
                <Text style={{
                    color: '#0373F3',
                    ...FONTS.h4,
                    fontWeight: 'bold'
                }}>{title}</Text>

                <View style={{
                    flexDirection: 'column',
                }}>
                    <Text style={{
                        fontWeight: 'bold',
                        color: 'black',
                        fontSize: 12
                    }}>{subTitle}
                    </Text>
                    <Text style={{
                            color: 'black',
                            fontWeight: '400',
                            fontSize: 12
                        }}>{action}</Text>
                    <Text style={{
                        marginTop:12,
                        textAlign:'right',
                        fontWeight: '400',
                        fontSize: 13
                    }}> {time}
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
export default NotificationItem;