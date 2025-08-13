import React, {Component, useEffect, useState}from 'react';
import { 
    Text,
    View,
    StyleSheet, 
    Image, 
} from 'react-native';
import {COLORS, SIZES} from '../../constants'    
function PressAgencyItem(props) {
    let {id,name,avatar,address} = props.pressAgencyItem
    return ( 
        <View style ={{
            width:'95%',
            flexDirection:'row',
            borderRadius: SIZES.radius,
            padding:8, 
            marginVertical:5,
            marginHorizontal: 10,
            backgroundColor: COLORS.white,
            ...styles.shadow
            }}>
            <Image style={{
                height:45,
                width:45,
                resizeMode:'cover',
                marginRight:10,                          
                borderRadius: 50,
            }} 
            source={{uri: avatar ? avatar :null}}/>
            <View style={{
                // backgroundColor:'green',
                flex:1,
                marginRight:10,                
            }}>
                <Text style={{ 
                    color:'#0373F3',
                    fontSize:15,
                    fontWeight: 'bold'
                }}>{name}</Text>
                 
                    <View style={{
                        height:1,
                        backgroundColor:'#BCBCBC',
                    }} />                            
                        <View style= {{
                            flexDirection:'column'
                        }}>       
                            <Text style={{
                                fontWeight:'bold',
                                color:'black', fontSize: 13
                            }}>Địa chỉ:
                                <Text style={{
                                    fontWeight:'400',
                                    color:'black',
                                }}> {address}
                                </Text>
                            </Text> 
                            
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
export default PressAgencyItem;