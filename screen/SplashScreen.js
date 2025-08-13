import React, { useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  ImageBackground,
  StatusBar
} from "react-native";
import messaging from '@react-native-firebase/messaging';
import { FONTS, } from '../constants'
import CustomisableAlert from "react-native-customisable-alert";
import { showAlert, closeAlert } from "react-native-customisable-alert";

import { useRoute } from '@react-navigation/native';

function SplashScreen(props) {
  return <Text> PRESS MANAGEMENT </Text>
}

export default SplashScreen = (props) => {
  //navigation
  const { navigation, route } = props
  //functions of navigate to/back
  const { navigate, goBack } = navigation
  const routeName = useRoute();

  useEffect(() => {
    const notificationHandler = async () => {
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log("remote message:", remoteMessage);
        showAlert({
          title: remoteMessage.notification.title,
          message: remoteMessage.notification.body,
          alertType: 'success',
          btnLabel: 'OK',
          onPress: () => {
            closeAlert()
          }
        })
      })
      const unsubcrible = messaging().onMessage(async (remoteMessage) => {
        debugger
        console.log('FOREGROUND: ', remoteMessage);
        showAlert({
          title: remoteMessage.notification.title,
          message: remoteMessage.notification.body,
          alertType: 'success',
          btnLabel: 'OK',
          onPress: () => {
            debugger
            console.log('route.name: ', route.name);
            if (route.name == 'Dashboard') {

            }
            closeAlert()
          }
        })
      });
      // Register background handler
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Message handled in the background!', remoteMessage);
        showAlert({
          title: remoteMessage.notification.title,
          message: remoteMessage.notification.body,
          alertType: 'success',
          btnLabel: 'OK',
          onPress: () => {
            closeAlert()
          }
        })
      });
      return unsubcrible;
    }
    notificationHandler();
    setTimeout(() => {
      navigate('LoginScreen')
    }, 3000)
  }, []);

  return (
    <ImageBackground style={{
      height: '100%',
      width: '100%'
    }}
      source={require("../assets/images/background.png")}
      resizeMode='cover'
    >
      <StatusBar translucent backgroundColor="transparent" barStyle={"light-content"} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 10
        }}>
          <Image style={{
            height: 160,
            width: 160,
            aspectRatio: 1 / 1,
            resizeMode: 'stretch'
          }}
            source={require("../assets/icons/logo.png")}
          />

          <Text style={{ color: 'white', fontWeight: '700', ...FONTS.body3, textAlign: 'center', marginTop: 20 }}>HỆ THỐNG QUẢN LÝ HOẠT ĐỘNG TIẾP XÚC, LÀM VIỆC VÀ CUNG CẤP THÔNG TIN CHO BÁO CHÍ</Text>

        </View>
        <CustomisableAlert
          titleStyle={{
            fontSize: 16,
            fontWeight: "bold",
            color: 'black'
          }}
          textStyle={{
            fontSize: 16,
            fontWeight: "bold",
            color: 'black'
          }}
        />
      </SafeAreaView>
    </ImageBackground>
  )
}

