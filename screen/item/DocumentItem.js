import React, { useState, useEffect } from "react";
import {
    Text,
    View,
    Image,
    ImageBackground,
    TouchableOpacity,
    TextInput,
    StyleSheet
} from 'react-native'
import { COLORS, FONTS, SIZES, colors} from '../../constants'
import Icon from 'react-native-vector-icons/FontAwesome'

function DocumentItem(props) {
    let {
        file_name,
        file_path,
        file_type,
        file_origin
    } = props.documentItem;
    const { onPress } = props
    return (
        <View 
            style={{
                flexDirection: 'row',
                height: 'auto',
                padding: 8,
                margin:5, 
                borderRadius: SIZES.radius,
                backgroundColor: COLORS.white,
                ...styles.shadow
            }}>
            <View style={{flex: 1}}>
                <View style={{
                    marginBottom: 3,
                    paddingBottom: 3,
                }}>
                    <Text style={{
                        color: 'black', fontWeight: 'bold', ...FONTS.h4
                    }}>Tập tin:
                        <Text style={{
                            color: 'black', ...FONTS.h4
                        }}> {file_origin}
                        </Text>
                    </Text>
                </View>

                <View style={{
                    marginBottom: 3,
                    paddingBottom: 3,
                }}>
                    <Text style={{
                        color: 'black', fontWeight: 'bold', ...FONTS.h4
                    }}>Loại tập tin:
                        <Text style={{
                            color: 'black', ...FONTS.h4
                        }}> {file_type}
                        </Text>
                    </Text>
                </View>
            </View>
            <View style={{ justifyContent: 'center', marginRight: 10 }}>
                <TouchableOpacity onPress={onPress}>
                    <Icon name='download' style={{ color: colors.newprimary, fontSize: 20, margin: -10 }} />
                </TouchableOpacity>
            </View> 
        </View> 
        
    )
}
const styles = StyleSheet.create({
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 4,
    }
})
export default DocumentItem