import React from 'react';
import { 
    Text,
    View,
    StyleSheet, 
    Image, 
    } from 'react-native';
import {COLORS, FONTS, SIZES} from '../constants'    
import FontAwesome from 'react-native-vector-icons/FontAwesome';

function JounalistScreenItem(props) {
    let {name,imageUrl,office,workPlace,City,Email,Phone} = props.jounalist
    return ( 
        <View style ={{
            width:'95%',
            flexDirection:'row',
            borderRadius: SIZES.radius,
            padding:10, 
            margin:10,
            backgroundColor: COLORS.white,
            ...styles.shadow
            }}>
            <Image style={{
                height:75,
                width:75,
                resizeMode:'cover',
                marginRight:10,                          
                borderRadius: 50,
            }} 
            source={{uri: imageUrl ? imageUrl :null}}/>
            <View style={{
                flex:1,
                marginRight:10,                
            }}>
                <Text style={{
                    flex:1,
                    color:'#0373F3',
                    ...FONTS.h4,
                    fontWeight: 'bold'
                }}>{name}</Text>
                <View style={{flexDirection:'row'}}>
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
                        color:'#454545',
                        fontWeight:'bold',
                        ...FONTS.h4,
                    }}>{office}</Text>
                </View>
                    <View style={{
                        height:1,
                        backgroundColor:'#BCBCBC',
                    }} />                            
                        <View style= {{
                            flexDirection:'column'
                        }}>
                            <Text style={{
                                fontWeight:'bold',
                                color:'black',
                                ...FONTS.h4,
                            }}>Đơn vị:
                                <Text style={{
                                    fontWeight:'400',
                                    color:'black',
                                }}> {workPlace}
                                </Text>
                            </Text>
                                        
                            <Text style={{
                                fontWeight:'bold',
                                color:'black',
                                ...FONTS.h4,
                            }}>Nơi công tác:
                                <Text style={{
                                    fontWeight:'400',
                                    color:'black',
                                }}> {City}
                                </Text>
                            </Text>

                            {Phone && <View style={{ flexDirection: 'row' }}>
                        <FontAwesome name='phone' style={{ color: '#bf0826', fontSize: 20, marginRight: 14 }} />

                        <Text style={{
                            fontWeight: '400',
                            color: 'black',
                        }}> {Phone}
                        </Text>
                    </View>}

                    {Email && <View style={{ flexDirection: 'row' }}>
                        <FontAwesome name='envelope' style={{ color: '#bf0826', fontSize: 20, marginRight: 10 }} />
                        <Text style={{
                            fontWeight: '400',
                            color: 'black',
                            marginRight: 3

                        }}> {Email}
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
export default JounalistScreenItem;