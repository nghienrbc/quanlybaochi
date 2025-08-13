import React, { useEffect, useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    ImageBackground,
    TextInput,
    SafeAreaView,
    StatusBar,
    Keyboard,
    Modal,
    TouchableOpacity,
    Platform,
    BackHandler,
    TouchableWithoutFeedback
} from 'react-native';
import { COLORS, FONTS, colors, string, SIZES } from '../constants'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { user as userRepo } from "../repositories"
import { isValidEmail, isValidPassword } from "../utilies/Validations"
import { getMyStringValue, setStringValue } from "../utilies/LocalDataHandler"
import messaging from '@react-native-firebase/messaging';
import Icon from 'react-native-vector-icons/FontAwesome'
import { CallCustomAlert } from "../utilies";
import AppLoader from '../utilies/AppLoader';

function LoginScreen(props) {
    //navigation
    const { navigation, route } = props
    //functions of navigate to/back
    const { navigate, goBack } = navigation
    //Hien mat khau
    const [getPasswordVisible, setPasswordVisible] = useState(false)

    const [showLoading, setShowLoading] = useState(false)
    const [token, setToken] = useState('')
    const [emailString, setEmailString] = useState('')//thienmai1312@gmail.com phongvienA@gmail.com hoalq1@gmail.com.vn
    const [emailForgotString, setEmailForgotString] = useState('')
    const [passwordString, setPasswordString] = useState('')
    const [newPasswordString, setNewPasswordString] = useState('')
    const [codeActiveString, setCodeActiveString] = useState('')
    const [deviceTokenString, setDeviceTokenString] = useState('')
    const [deviceType, setDeviceType] = useState('')

    const [isEmailExist, setIsEmailExist] = useState(true)

    async function requestUserPermission() {
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (enabled) {
            console.log('Authorization status:', authStatus);
        }
    }

    async function getToken() {
        // debugger
        const deviceToken = await messaging().getToken();
        console.log("Device Token:", deviceToken);
        setDeviceTokenString(deviceToken)
    }

    useEffect(() => {
        BackHandler.addEventListener("hardwareBackPress", () => { return true });
        setDeviceType(Platform.OS === 'ios' ? 'IOS' : 'ANDROID')
        const notificationHandler = async () => {
            await requestUserPermission();
            await getToken();
        }
        notificationHandler();
        // disable nut back trên thiết bị android
        return () =>
            BackHandler.removeEventListener("hardwareBackPress", () => { return true });
    }, []);

    const callLogin = () => {
        if (isValidEmail(emailString) && isValidPassword(passwordString)) {
            setShowLoading(true)
            debugger
            userRepo.postLogin(emailString, passwordString, deviceTokenString, deviceType) // Sửa lại deviceTokenString
                .then(
                    responseLogin => {
                        setToken(responseLogin)
                        setShowLoading(false)
                    })
                .catch(
                    errorMessage => {
                        setShowLoading(false)
                        if (errorMessage == 'Wrong password' || errorMessage == 'Not found') CallCustomAlert.showAlertWith(string.NOT_FOUND_USER, "error", "OK")
                        else CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
                    }
                )
        }
        else {
            // thông báo password hoặc email không hợp lệ
            CallCustomAlert.showAlertWith('Email và Password không hợp lệ', 'error', 'OK')
        }
    }

    const callForgotPassword = () => {
        debugger
        if (isValidEmail(emailForgotString)) {
            setShowLoading(true)
            debugger
            userRepo.postFogotPassword(emailForgotString)
                .then(
                    responseFogotPassword => {
                        if (responseFogotPassword.success) {
                            // hiển thị model nhập mật khẩu và mã code
                            setIsOpenForgotPW(false)
                            setIsOpenEnterCode(true)
                            setIsEmailExist(true)
                        }
                        else {
                            // hiển thi thông báo tài khoản email không tồn tại trong hệ thống
                            setIsEmailExist(false)
                        }
                        setShowLoading(false)
                    })
                .catch(
                    errorMessage => {
                        console.log(errorMessage)
                        setShowLoading(false)
                        CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
                    }
                )
        }
        else {
            // thông báo password hoặc email không hợp lệ
            CallCustomAlert.showAlertWith('Email không hợp lệ', 'error', 'OK')
        }
    }

    const callVerifyCode = () => {
        debugger
        if (codeActiveString.length !== 6) {
            CallCustomAlert.showAlertWith('Mã xác nhận không hợp lệ', 'error', 'OK')
            return
        }
        if (isValidPassword(newPasswordString)) {
            setShowLoading(true)
            debugger
            userRepo.postVerifyCode(emailForgotString, codeActiveString, newPasswordString)
                .then(
                    responseVerifyCode => {
                        CallCustomAlert.showAlertWith('Đổi mật khẩu thành công, bạn hãy đăng nhập lại', "success", "OK")
                        setShowLoading(false)
                        setEmailForgotString('')
                        setIsOpenEnterCode(false)
                        setCodeActiveString('')
                        setNewPasswordString('')
                    })
                .catch(
                    errorMessage => {
                        console.log(errorMessage)
                        setShowLoading(false)
                        CallCustomAlert.showAlertWith('Có lỗi xảy ra, bạn hãy kiểm tra mã xác nhận hoặc kết nối mạng', "error", "OK")
                    }
                )
        }
        else {
            // thông báo password hoặc email không hợp lệ
            CallCustomAlert.showAlertWith('Password không hợp lệ', 'error', 'OK')
        }

    }


    useEffect(() => {
        getMyStringValue("token").then((value) => {
            if(value != '' && value != null){ // đã đăng nhập và chưa logout
                userRepo.getUserDetail(value)
                .then(responseUser => {
                    debugger
                    setStringValue("userID", '' + responseUser?.id) // luu user id
                    setStringValue("userTypeID", '' + responseUser?.TypeUser?.id) // luu user type id
                    setStringValue("userTypeName", responseUser?.TypeUser?.name) // luu user type name
                    setStringValue("userEmail", responseUser?.email)
                    setStringValue("givenName", responseUser?.givenName)
                    responseUser?.Institute && setStringValue("instituteID", '' + responseUser?.Institute?.id)
                    responseUser?.Institute && setStringValue("instituteName", responseUser?.Institute?.name)

                    setShowLoading(false)
                    navigate('UITab', {
                        givenName: responseUser?.givenName
                    })
                })
                .catch(errorMessage => {
                    debugger
                    console.log(errorMessage)
                    CallCustomAlert.showAlertWith("Không thể kết nối hệ thống", "error", "OK")
                    setShowLoading(false)
                })
            }
        });
    }, []);

    useEffect(() => {
        //debugger
        if (token != '') {
            setStringValue("token", token)
            userRepo.getUserDetail(token)
                .then(responseUser => {
                    debugger
                    setStringValue("userID", '' + responseUser?.id) // luu user id
                    setStringValue("userTypeID", '' + responseUser?.TypeUser?.id) // luu user type id
                    setStringValue("userTypeName", responseUser?.TypeUser?.name) // luu user type name
                    setStringValue("userEmail", responseUser?.email)
                    setStringValue("givenName", responseUser?.givenName)
                    responseUser?.Institute && setStringValue("instituteID", '' + responseUser?.Institute?.id)
                    responseUser?.Institute && setStringValue("instituteName", responseUser?.Institute?.name)

                    setShowLoading(false)
                    navigate('UITab', {
                        givenName: responseUser?.givenName
                    })
                })
                .catch(errorMessage => {
                    debugger
                    console.log(errorMessage)
                    CallCustomAlert.showAlertWith("Không thể kết nối hệ thống", "error", "OK")
                    setShowLoading(false)
                })
        }
    }, [token])
    // bấm next trên keyboard tự xuống hàng, bấm next tự động đăng nhập 
    const ref_Email = useRef();
    const ref_Password = useRef();
    // mở ra modal dấu ? giải đáp thắc mắc 
    const [isOpenAnswers, setIsOpenAnswers] = useState(false)
    const callOpenAnswers = () => {
        setIsOpenAnswers(!isOpenAnswers)
    }

    // mở ra modal
    const [isOpenEnterCode, setIsOpenEnterCode] = useState(false)
    const [isOpenForgotPW, setIsOpenForgotPW] = useState(false)
    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground
                source={require("../assets/images/backgroundLogin.jpg")}
                resizeMode='cover'
                style={{
                    flex: 1
                }}
            >
                {/* dấu ? giải đáp thắc mắc */}
                <Modal
                    transparent={true}
                    visible={isOpenAnswers}
                >
                    <TouchableOpacity onPress={() => { setIsOpenAnswers(false) }}
                        style={{
                            flex: 1,
                            backgroundColor: '#000000aa',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <View onStartShouldSetResponder={() => true}
                            style={{
                                marginHorizontal: 50,
                                borderRadius: 16,
                                paddingVertical: 20,
                                paddingRight: 15,
                                paddingLeft: 5,
                                backgroundColor: COLORS.white,
                            }}
                        >
                            {/* Modal content */}
                            <View style={{ marginStart: 15, marginBottom: 10 }}>
                                <Text style={{ ...FONTS.h4, color: 'black' }}>
                                    - Mọi thắc mắc xin vui lòng liên hệ với chúng tôi theo số điện thoại hoặc số fax:
                                    <Text style={{ color: colors.newprimary, textDecorationLine: 'underline', ...FONTS.h4 }}> 0232.3844456</Text>.
                                </Text>
                                <Text style={{ ...FONTS.h4, color: 'black', marginTop: 10 }}>
                                    - Mọi ý kiến đóng góp, xin hãy gởi về địa chỉ Email:
                                    <Text style={{ color: colors.newprimary, textDecorationLine: 'underline', ...FONTS.h4 }}> stttt@quangbinh.gov.vn
                                    </Text>
                                    . Xin trân trọng cảm ơn!
                                </Text>
                                <TouchableOpacity onPress={() => { setIsOpenAnswers(false) }}
                                    style={{
                                        backgroundColor: colors.newprimary,
                                        marginTop: 10,
                                        borderRadius: 20,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        paddingVertical: 10,
                                        paddingHorizontal: 16,
                                    }}
                                >
                                    <Text style={{ color: 'white', ...FONTS.h3, fontWeight: 'bold' }}>Đồng ý</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>
                {/* Modal forgot pass word */}
                <Modal
                    transparent={true}
                    visible={isOpenForgotPW}
                >
                    <View
                        style={{
                            backgroundColor: '#000000aa', flex: 1,
                            height: 'auto', maxHeight: SIZES.height
                        }}>
                        <View onStartShouldSetResponder={() => true}
                            style={{
                                backgroundColor: 'white', margin: 20,
                                marginTop: 180,
                                padding: 10, borderRadius: 10,
                                height: 'auto', maxHeight: SIZES.height - 50
                            }}>
                            {/* // header */}
                            <View style={{
                                flexDirection: 'row', marginBottom: 10,
                                justifyContent: 'space-between',
                            }}>
                                <Text style={{
                                    ...FONTS.body2, fontWeight: 'bold',
                                    color: colors.newprimary,
                                }}>Quên mật khẩu</Text>
                                <TouchableOpacity onPress={() => {
                                    setIsOpenForgotPW(false)
                                    setEmailForgotString('')
                                }}>
                                    <Icon name='close' style={{ color: 'black', fontSize: 22 }} />
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.infoContainer, { marginTop: 20, marginHorizontal: 5 }]}>
                                <Image style={{ height: 20, width: 20, marginStart: 15 }}
                                    resizeMode="contain"
                                    source={require("../assets/icons/email_icon.png")} />
                                <TextInput style={styles.labels}
                                    autoCapitalize="none"
                                    placeholder="Nhập email để lấy code"
                                    placeholderTextColor='rgba(131, 138, 138, 1)'
                                    returnKeyType='next'
                                    autoCorrect={false}
                                    onChangeText={newText => setEmailForgotString(newText)}
                                    defaultValue=''
                                //onSubmitEditing={() => callLogin()}
                                //ref={ref_Email}
                                />
                            </View>
                            {!isEmailExist && <Text style={styles.error}>{"Email không tồn tại trong hệ thống"}</Text>}
                            <TouchableOpacity onPress={() => { callForgotPassword() }}
                                style={{
                                    backgroundColor: colors.newprimary,
                                    marginHorizontal: 5,
                                    marginVertical: 10,
                                    marginTop: 20,
                                    borderRadius: 20,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    paddingVertical: 10,
                                    paddingHorizontal: 16,
                                }}
                            >
                                <Text style={{ color: 'white', ...FONTS.h3, fontWeight: 'bold' }}>Nhận mã</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Modal nhập mã */}
                <Modal
                    transparent={true}
                    visible={isOpenEnterCode}
                >
                    <View
                        style={{
                            backgroundColor: '#000000aa',
                            flex: 1,
                            height: 'auto', maxHeight: SIZES.height
                        }}>
                        <View
                            style={{
                                backgroundColor: 'white', margin: 20,
                                marginTop: 100,
                                padding: 10, borderRadius: 10,
                                height: 'auto', maxHeight: SIZES.height - 50
                            }}>
                            {/* // header */}
                            <View style={{
                                flexDirection: 'row', marginBottom: 10,
                                justifyContent: 'space-between',
                            }}>
                                <Text style={{
                                    ...FONTS.body2, fontWeight: 'bold',
                                    color: colors.newprimary,
                                }}>Tạo mới mật khẩu</Text>
                                <TouchableOpacity onPress={() => {
                                    setIsOpenEnterCode(false)
                                    setEmailForgotString('')
                                    setCodeActiveString('')
                                    setNewPasswordString('')
                                }}>
                                    <Icon name='close' style={{ color: 'black', fontSize: 22 }} />
                                </TouchableOpacity>
                            </View>
                            <View style={{ paddingHorizontal: 15, backgroundColor: COLORS.background, padding: 5, borderRadius: 8, marginVertical: 5 }}>
                                <Text style={{ fontSize: 13, fontWeight: '600' }}><Image style={{ height: 18, width: 18, marginStart: 15 }}
                                    resizeMode="contain"
                                    source={require("../assets/icons/exclamationMark_icon.png")} /> Nếu không thấy mã, hãy kiểm tra trong mục Spam của email </Text>
                            </View>
                            <View style={[styles.infoContainer, { marginTop: 20, marginHorizontal: 5 }]}>
                                <Image style={{ height: 18, width: 18, marginStart: 15 }}
                                    resizeMode="contain"
                                    source={require("../assets/icons/EnterCode_icon.png")} />
                                <TextInput style={styles.labels}
                                    autoCapitalize="none"
                                    placeholder="Nhập code đã được gởi đến email"
                                    placeholderTextColor='rgba(131, 138, 138, 1)'
                                    returnKeyType='next'
                                    autoCorrect={false}
                                    onChangeText={newText => setCodeActiveString(newText)}
                                    defaultValue=''
                                // onSubmitEditing={() => callLogin()}
                                // ref={ref_Email}
                                />
                            </View>
                            <View style={[styles.infoContainer, { marginTop: 10, marginHorizontal: 5 }]}>
                                <FontAwesome name='lock' style={{ color: 'black', fontSize: 26, paddingStart: 15 }} />
                                <TextInput style={styles.labels}
                                    autoCapitalize="none"
                                    placeholder="Nhập mật khẩu"
                                    placeholderTextColor='rgba(131, 138, 138, 1)'
                                    returnKeyType='next'
                                    secureTextEntry={getPasswordVisible ? false : true}
                                    autoCorrect={false}
                                    onChangeText={newText => setNewPasswordString(newText)}
                                    defaultValue=''
                                //onSubmitEditing={() => callLogin()}
                                //ref={ref_Password}
                                />
                                <TouchableOpacity
                                    style={{
                                        height: '100%',
                                        width: 22,
                                        aspectRatio: 1,
                                        position: 'absolute',
                                        right: 0,
                                        marginEnd: 7,
                                    }}
                                    onPress={() => {
                                        setPasswordVisible(!getPasswordVisible)
                                    }}
                                >
                                    {getPasswordVisible ?
                                        <Image style={{ height: '100%', width: '100%' }}
                                            resizeMode="contain"
                                            source={require("../assets/icons/eyesOff_icon.png")} />
                                        :
                                        <Image style={{ height: '100%', width: '100%' }}
                                            resizeMode="contain"
                                            source={require("../assets/icons/eyesOn_icon.png")} />}
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity onPress={() => {
                                callVerifyCode()
                            }}
                                style={{
                                    backgroundColor: colors.newprimary,
                                    marginHorizontal: 5,
                                    marginVertical: 10,
                                    marginTop: 20,
                                    borderRadius: 20,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    paddingVertical: 10,
                                    paddingHorizontal: 16,
                                }}
                            >
                                <Text style={{ color: 'white', ...FONTS.h3, fontWeight: 'bold' }}>Xác nhận</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <StatusBar translucent={false} backgroundColor="#FFF" barStyle="dark-content" />
                {showLoading ? <AppLoader /> : null}
                <View style={{
                    flex: 0.1,
                    marginHorizontal: 10,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                }}>
                    <View style={{
                        flexDirection: 'row',
                        height: 50,
                        alignItems: 'center',
                    }}>
                        <Image
                            style={{ height: 24, width: 24 }}
                            resizeMode="contain"
                            source={require("../assets/icons/logo.png")}
                        />
                        <Text style={{
                            marginStart: 5,
                            fontSize: 12,
                            fontWeight: 'bold',
                            color: 'white',
                        }}>Quang Binh-BC</Text>
                    </View>
                    <TouchableOpacity onPress={() => callOpenAnswers()}
                        style={{ marginTop: 15 }}>
                        <Image
                            style={{ height: 18, width: 18, tintColor: 'white' }}
                            resizeMode="contain"
                            source={require("../assets/icons/ask_icon.png")}
                        />
                    </TouchableOpacity>
                </View>
                <View style={{
                    flex: 0.2,
                    // backgroundColor:'red',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 30
                }}>
                    <Text style={{ color: 'white', fontWeight: '700', ...FONTS.body3, textAlign: 'center' }}>HỆ THỐNG QUẢN LÝ HOẠT ĐỘNG TIẾP XÚC, LÀM VIỆC VÀ CUNG CẤP THÔNG TIN CHO BÁO CHÍ</Text>

                </View>
                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                    <View style={{
                        flex: 0.8,
                        backgroundColor: 'white',
                        borderTopLeftRadius: 100,
                        ...styles.shadow,
                    }}>
                        <Text style={styles.textLogin}>
                            Đăng Nhập
                        </Text>
                        <View style={styles.infoContainer}>
                            <FontAwesome name='user' style={{ color: 'black', fontSize: 26, paddingStart: 10 }} />
                            <TextInput style={styles.labels}
                                autoCapitalize="none"
                                placeholder="Nhập username/email"
                                placeholderTextColor='rgba(131, 138, 138, 1)'
                                keyboardType='email-address'
                                autoCorrect={false}
                                onChangeText={newText => setEmailString(newText)}
                                returnKeyType="next"
                                onSubmitEditing={() => ref_Email.current.focus()}
                                defaultValue=''
                                // defaultValue='hoalq1@gmail.com.vn'
                            />
                        </View>
                        <View style={styles.infoContainer}>
                            <FontAwesome name='lock' style={{ color: 'black', fontSize: 28, paddingStart: 10 }} />
                            <TextInput style={styles.labels}
                                autoCapitalize="none"
                                placeholder="Nhập mật khẩu"
                                placeholderTextColor='rgba(131, 138, 138, 1)'
                                returnKeyType='next'
                                secureTextEntry={getPasswordVisible ? false : true}
                                autoCorrect={false}
                                onChangeText={newText => setPasswordString(newText)}
                                defaultValue=''
                                // defaultValue='qlbc@123'
                                onSubmitEditing={() => callLogin()}
                                ref={ref_Email}
                            />
                            <TouchableOpacity
                                style={{
                                    height: '100%',
                                    width: 22,
                                    aspectRatio: 1,
                                    position: 'absolute',
                                    right: 0,
                                    marginEnd: 7,
                                }}
                                onPress={() => {
                                    setPasswordVisible(!getPasswordVisible)
                                }}
                            >
                                {getPasswordVisible ?
                                    <Image style={{ height: '100%', width: '100%' }}
                                        resizeMode="contain"
                                        source={require("../assets/icons/eyesOff_icon.png")} />
                                    :
                                    <Image style={{ height: '100%', width: '100%' }}
                                        resizeMode="contain"
                                        source={require("../assets/icons/eyesOn_icon.png")} />}
                            </TouchableOpacity>
                        </View>
                        <View style={styles.ForgotContainer}>
                            <TouchableOpacity onPress={() => setIsOpenForgotPW(true)}>
                                <Text style={styles.Textforgot}>
                                    Quên mật khẩu?
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.buttonContainer}
                            onPress={() => callLogin()}
                        >
                            <Text style={styles.buttonText}>Đăng nhập</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </ImageBackground>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        flexDirection: 'column',
    },
    textLogin: {
        marginTop: 40,
        marginVertical: 20,
        alignSelf: 'center',
        color: 'black',
        ...FONTS.h1,
        fontWeight: 'bold'
    },
    infoContainer: {
        marginHorizontal: 20,
        borderRadius: 50,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        shadowColor: "#000",
        shadowOffset: {
            width: 10,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 7,
    },
    icon: {
        marginTop: 30,
        backgroundColor: 'white',
        width: 18,
        height: 18,
    },
    labels: {
        paddingHorizontal: 10,
        height: 40,
        width: '80%',
        // backgroundColor: 'white',
        color: 'black',
        ...FONTS.h4,
    },
    buttonContainer: {
        marginHorizontal: 20,
        marginTop: 40,
        borderRadius: 30,
        paddingVertical: 8,
        height: 40,
        backgroundColor: colors.newprimary
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold'
    },
    ForgotContainer: {
        alignItems: 'flex-end',
        marginEnd: 28,
    },
    Textforgot: {
        color: '#0373F3',
        ...FONTS.h4,
        textDecorationLine: 'underline',
    },
    TextRemember: {
        paddingStart: 4,
        fontSize: 12,
    },
    error: {
        marginStart: 20,
        color: 'red',
        marginBottom: 8,
        fontSize: 14
    },
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
});

export default LoginScreen