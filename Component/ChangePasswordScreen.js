import React, { useState, useEffect,useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity,Image } from 'react-native';
import { user as userRepo } from "../repositories"
import { setStringValue, setObjectValue, getMyStringValue, getMyObject } from "../utilies/LocalDataHandler"
import { CallCustomAlert } from "../utilies";
import { showAlert, closeAlert } from "react-native-customisable-alert";
import { COLORS, FONTS, SIZES } from '../constants'
import { images, colors, icons, fontSizes, string } from "../constants";
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const ChangePasswordScreen = ({ onSuccess }) => {
  const [tokenString, setTokenString] = useState('');
  const [userTypeID, setUserTypeID] = useState('');
  const [showLoading, setShowLoading] = useState(false);

  const [passWord, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordError, setPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [getPasswordVisible, setPasswordVisible] = useState(false);
  const [getNewPasswordVisible, setNewPasswordVisible] = useState(false);
  const [getConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  
  const passwordRef = useRef();
  const newPasswordRef = useRef();
  const confirmPasswordRef = useRef();

  useEffect(() => {
    getMyStringValue("token").then((value) => {
      setTokenString(value);
    });
    getMyStringValue("userTypeID").then((value) => {
      setUserTypeID(value);
    });
  }, []);

  const handleTextInputFocus = () => {
    setPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');
  };
  const handleChangePasswordSubmit = () => {
    if (passWord.length === 0) {
      setPasswordError('Vui lòng nhập mật khẩu hiện tại');
      return;
    }
    if (passWord.length < 8 || passWord.length > 30) {
      setPasswordError('Mật khẩu không hợp lệ');
      return;
    }
    if (newPassword.length === 0) {
      setNewPasswordError('Vui lòng nhập mật khẩu mới');
      return;
    }
    if (newPassword.length < 8) {
      setNewPasswordError('Mật khẩu phải từ 8 ký tự trở lên');
      return;
    }
    if (newPassword.length > 30) {
      setNewPasswordError('Mật khẩu quá dài');
      return;
    }
    if (newPassword === passWord) {
      setNewPasswordError('Mật khẩu mới không được trùng với mật khẩu hiện tại');
      return;
    }
    const hasUppercase = /[A-Z]/;
    if (!hasUppercase.test(newPassword)) {
      setNewPasswordError('Mật khẩu phải chứa ít nhất một ký tự viết in hoa');
      return;
    }
    const hasNumber = /\d/;
    if (!hasNumber.test(newPassword)) {
      setNewPasswordError('Mật khẩu phải chứa ít nhất một ký tự là số');
      return;
    }
    const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/;
    if (hasSpecialCharacter.test(newPassword)) {
      setNewPasswordError('Mật khẩu không được chứa ký tự đặc biệt');
      return;
    }
    if (confirmPassword.length === 0) {
      setConfirmPasswordError('Vui lòng nhập lại mật khẩu mới');
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Mật khẩu nhập lại không trùng khớp với mật khẩu mới');
      return;
    }
    showAlert({
      title: "Đổi mật khẩu",
      message: "Bạn muốn thay đổi mật khẩu?",
      alertType: 'warning',
      btnLabel: 'Đồng ý',
      leftBtnLabel: 'Hủy',
      onPress: () => {
        closeAlert();
        setShowLoading(true);
        userRepo.changePassword(tokenString, passWord, newPassword)
          .then(() => {
            debugger
            CallCustomAlert.showAlertWith('Đổi mật khẩu thành công', 'success', 'OK')
            setShowLoading(false);
            setPasswordError('');
            setNewPasswordError('');
            setConfirmPasswordError('');
            setPassword('');
            setNewPassword('');
            setConfirmPassword('');
            onSuccess()
          })
          .catch((errorMessage) => {
            debugger
            setShowLoading(false);
            CallCustomAlert.showAlertWith(
              errorMessage === 'Not found' ? 
              string.NOT_FOUND : (errorMessage === "WRONG_PASSWORD_ERROR" ?
              'Mật khẩu cũ không chính xác': string.CANT_CONNECT_SERVER),'error','OK');
          });
      }
    });
  };

  return (
    <View>
      <Text style={styles.title}>Đổi mật khẩu</Text>
      <View style={styles.infoContainer}>
      <FontAwesome name='lock' style={{ color: 'black', fontSize: 26, paddingStart: 10 }} />
      <TextInput
        ref={passwordRef}
        style={styles.labels}
        secureTextEntry={getPasswordVisible ? false : true}
        placeholder="Nhập mật khẩu hiện tại"
        returnKeyType='next'
        onSubmitEditing={() => newPasswordRef.current.focus()} // Chuyển focus đến ô input newPasswordRef
        value={passWord}
        onChangeText={(text) => {
          setPassword(text);
        }}
        onFocus={handleTextInputFocus}
      />

        <TouchableOpacity onPress={() => {setPasswordVisible(!getPasswordVisible)}}
                  style ={styles.eyeContainer}>
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
      {passwordError? <Text style={styles.error}>{passwordError}</Text> : null}

      <View style={styles.infoContainer}>
      <FontAwesome name='lock' style={{ color:colors.newprimary, fontSize: 26, paddingStart: 10 }} />
        <TextInput
          ref={newPasswordRef}
          style={styles.labels}
          secureTextEntry={getNewPasswordVisible ? false : true}
          placeholder="Nhập mật khẩu mới"
          returnKeyType='next'
          onSubmitEditing={() => confirmPasswordRef.current.focus()} // Chuyển focus đến ô input confirmPasswordRef
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text);
          }}
          onFocus={handleTextInputFocus}
        />

        <TouchableOpacity onPress={() => {setNewPasswordVisible(!getNewPasswordVisible)}}
                  style ={styles.eyeContainer}>
        {getNewPasswordVisible ?
          <Image style={{ height: '100%', width: '100%' }}
              resizeMode="contain"
              source={require("../assets/icons/eyesOff_icon.png")} />
          :
          <Image style={{ height: '100%', width: '100%' }}
              resizeMode="contain"
              source={require("../assets/icons/eyesOn_icon.png")} />}
        </TouchableOpacity>
      </View>
      {newPasswordError ? <Text style={styles.error}>{newPasswordError}</Text> : null}
      
      <View style={styles.infoContainer}>
      <FontAwesome name='lock' style={{ color:colors.newprimary, fontSize: 26, paddingStart: 10, }} />
      <TextInput
        ref={confirmPasswordRef}
        style={styles.labels}
        secureTextEntry={getConfirmPasswordVisible ? false : true}
        placeholder="Nhập lại mật khẩu mới"
        returnKeyType='done' // Sử dụng returnKeyType='done' cho ô input cuối cùng
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
        }}
        onFocus={handleTextInputFocus}
      />

        <TouchableOpacity onPress={() => {setConfirmPasswordVisible(!getConfirmPasswordVisible)}}
                  style ={styles.eyeContainer}>
        {getConfirmPasswordVisible ?
          <Image style={{ height: '100%', width: '100%' }}
              resizeMode="contain"
              source={require("../assets/icons/eyesOff_icon.png")} />
          :
          <Image style={{ height: '100%', width: '100%' }}
              resizeMode="contain"
              source={require("../assets/icons/eyesOn_icon.png")} />}
        </TouchableOpacity>
      </View>
      {confirmPasswordError ? <Text style={styles.error}>{confirmPasswordError}</Text> : null}
      <TouchableOpacity onPress={handleChangePasswordSubmit}
          style={{
            backgroundColor: colors.newprimary,
            marginTop: 20,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 10,
            paddingHorizontal: 16,
          }}
      >
        <Text style={{ color: 'white', ...FONTS.h3, fontWeight: 'bold' }}>Đổi mật khẩu</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    ...FONTS.h2,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.newprimary,
    alignSelf:'center'
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  error: {
    marginStart:20,
    color: 'red',
    marginBottom: 8,
    fontSize:14
  },
  infoContainer: {
    marginHorizontal: 10,
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
  eyeContainer: {
    height: '100%',
    width: 22,
    aspectRatio: 1,
    position: 'absolute',
    right: 0,
    marginEnd: 10
  },
  labels: {
    paddingHorizontal: 10,
    height: 40,
    width: '80%',
    // backgroundColor: 'white',
    color: 'black',
    ...FONTS.h4,
  },
});
export default ChangePasswordScreen;
