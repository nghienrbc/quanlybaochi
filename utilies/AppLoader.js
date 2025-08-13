//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native'
// create a component
const AppLoader = () => {
    return (
        <View style={[StyleSheet.absoluteFillObject, styles.container]}> 
            <LottieView source={require('../assets/loader.json')}
            autoPlay loop/> 
            <Text style={{fontSize:20, fontWeight:'bold', color:'#BBBFFF'}} >Đang tải...</Text>
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(1,1,1,0.5)',
        zIndex: 1
    },
});

//make this component available to the app
export default AppLoader;
