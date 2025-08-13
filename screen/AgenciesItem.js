import React from 'react';
import {
    Text,
    View,
    StyleSheet,
    Image,
} from 'react-native';

import { COLORS, FONTS, SIZES, colors } from '../constants'
import FontAwesome from 'react-native-vector-icons/FontAwesome';

function AgenciesItem(props) {
    let { nameAgencies, name, office, imageUrl, address, Email, Phone } = props.agenciesList
    return (
        <View style={{
            flexDirection: 'row',
            borderRadius: SIZES.radius,
            padding: 10,
            margin: 10,
            backgroundColor: COLORS.white,
            ...styles.shadow
        }}>
            <Image
                style={{
                    height: 75,
                    width: 75,
                    resizeMode: 'cover',
                    marginRight: 10,
                    borderRadius: 50,
                }}
                source={{ uri: imageUrl ? imageUrl : null }} />
            <View style={{
                flex: 1,
                marginRight: 2,
            }}>
                <Text style={{
                    color: '#0373F3',
                    ...FONTS.h4,
                    fontWeight: 'bold'
                }}>{nameAgencies}</Text>
                <View style={{ flexDirection: 'row',}}>
                    <Image
                        source={require("../assets/icons/job1_icon.png")}
                        style={{
                            width: 22,
                            height: 22,
                            tintColor: '#373737',
                            marginRight: 5
                        }}
                    />
                    <Text style={{
                        fontWeight: 'bold',
                        color: 'black',
                        ...FONTS.h4,
                    }}>Đại diện:
                        <Text style={{
                            fontWeight: '400',
                            color: 'black',
                        }}> {name}
                        </Text>
                    </Text>

                </View>
                <View style={{
                    height: 1,
                    backgroundColor: '#BCBCBC', flexWrap: 'wrap'
                }} />
                <Text style={{
                    fontWeight: 'bold',
                    color: 'black',
                    ...FONTS.h4,
                }}>Chức vụ:
                    <Text style={{
                        fontWeight: '400',
                        color: 'black',
                    }}> {office}
                    </Text>
                </Text>

                {address &&
                    <View style={{ flexDirection: 'row' }}>
                        <Image
                            source={require("../assets/icons/pin.png")}
                            style={{
                                width: 20,
                                height: 20,
                                marginTop: 5,
                                tintColor: colors.newprimary,
                            }}
                        />
                        <Text style={{
                            marginStart: 2,
                            fontWeight: '400',
                            color: 'black',
                            ...FONTS.h4,
                        }}>{address}
                        </Text>

                    </View>}
                {Phone &&
                    <View style={{ flexDirection: 'row' }}>
                        <FontAwesome name='phone' style={{ color: '#bf0826', fontSize: 16, marginRight: 10 }} />
                        <Text style={{
                            fontWeight: '400',
                            color: 'black',
                        }}> {Phone}
                        </Text>
                    </View>}

                {Email &&
                    <View style={{ flexDirection: 'row' }}>
                        <FontAwesome name='envelope' style={{ color: '#bf0826', fontSize: 16, marginRight: 6 }} />
                        <Text style={{
                            fontWeight: '400',
                            color: 'black',
                        }}> {Email}
                        </Text>
                    </View>}
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
export default AgenciesItem;