import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Image,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Modal
} from 'react-native'
import { images, colors, COLORS, FONTS, string } from "../constants";
import Icon from 'react-native-vector-icons/Fontisto'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon1 from 'react-native-vector-icons/FontAwesome'
import DatePicker from 'react-native-date-picker'

import PhoneInput from "react-native-phone-number-input";

import { user as userRepo } from "../repositories"
import { convertDateTimeToDateString } from "../utilies/DateTime"
import { getMyStringValue } from "../utilies/LocalDataHandler"

import ImagePicker from 'react-native-image-crop-picker';
import { showAlert, closeAlert } from "react-native-customisable-alert";

import ChoosePhotoPopup from "../Component/ChoosePhotoPopup";
import ChangePasswordScreen from "../Component/ChangePasswordScreen";
import { CallCustomAlert } from "../utilies";
import AppLoader from '../utilies/AppLoader';

const ProfileScreen = (props) => {

  const [showLoading, setShowLoading] = useState(false)

  const [response, setResponse] = useState(null)
  const [open, setOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [isChangeImage, setIsChangeImage] = useState(false)
  const [isChangePressCardImage, setIsChangePressCardImage] = useState(false)
  const [dateString, setDateString] = useState('')
  const [userTypeName, setUserTypeName] = useState('')
  const [userObject, setUserObject] = useState(null)

  const [image, setImage] = useState(images.noAvatar)
  const [imageUrl, setImageUrl] = useState('')
  const [originalImageUrl, setOriginalImageUrl] = useState('')
  const [pressCardImage, setPressCardImage] = useState(images.noImage)
  const [pressCardImageUrl, setPressCardImageUrl] = useState('')
  const [isChoosePhotoForAvatar, setIsChoosePhotoForAvatar] = useState(false)
  const [originalPressCardImageUrl, setOriginalPressCardImageUrl] = useState('')

  const [name, setName] = useState('');
  const [originalName, setOriginalName] = useState(name);
  const [birthday, setBirthday] = useState(new Date());
  const [originalBirthday, setOriginalBirthday] = useState(new Date());
  const [isChangeBirthday, setIsChangeBirthday] = useState(false);

  const [instituteName, setInstituteName] = useState('')
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [originalAddress, setOriginalAddress] = useState(address);
  const [phone, setPhone] = useState('');
  const [originalPhone, setOriginalPhone] = useState(phone);
  const [seniority, setSeniority] = useState('');
  const [journalistCard, setJournalistCard] = useState('');

  const [isJournalist, setIsJournalist] = useState(false)

  const [tokenString, setTokenString] = useState('')
  const [userTypeID, setUserTypeID] = useState('')
  // mở ra modal
  const [isOpenChangePassword, setIsOpenChangePassword] = useState(false)
  const callOpenChangePassword = () => {
    setIsOpenChangePassword(!isOpenChangePassword)
  }
  const handlePasswordChangeSuccess = () => {
    setIsOpenChangePassword(false); // Close the modal
  };
  getMyStringValue("token").then((value) => {
    const data = value;
    setTokenString(data)
  })
  getMyStringValue("userTypeID").then((value) => {
    const data = value;
    setUserTypeID(data)
    setIsJournalist(data == 7)
  })

  useEffect(() => {
    if (tokenString != '') {
      setShowLoading(true)
      userRepo.getUserDetail(tokenString)
        .then(responseUser => {
          debugger
          setUserObject(responseUser)
          setShowLoading(false)

        })
        .catch(
          errorMessage => {
            setShowLoading(false)
            CallCustomAlert.showAlertWith('getUserDetail', errorMessage == 'Not found' ? string.NOT_FOUND : string.CANT_CONNECT_SERVER, "error", "OK")
          }
        )
    }
  }, [tokenString])

  useEffect(() => {
    // debugger
    if (userObject == null) return
    if (userObject.avatar != '' && userObject.avatar != null) {
      setIsChangeImage(true)
      setImageUrl(`${string.IMAGEURL}${userObject.avatar}`)
      setOriginalImageUrl(`${string.IMAGEURL}${userObject.avatar}`)
    }
    if (userObject.pressCard != '' && userObject.pressCard != null) {
      setIsChangePressCardImage(true)
      if (isJournalist) setPressCardImageUrl(`${string.IMAGEURL}${userObject.pressCard}`)
      setOriginalPressCardImageUrl(`${string.IMAGEURL}${userObject.pressCard}`)
    }
    setUserTypeName(userObject.TypeUser.name)
    setEmail(userObject.email)
    setName(userObject.givenName)
    setAddress(userObject.address)
    setInstituteName(userObject?.Institute?.name || '')
    setPhone(userObject.phone)
    if (userObject.birthday) {
      setOriginalBirthday(new Date(parseInt(userObject.birthday)));
      setIsChangeBirthday(true);
      setBirthday(new Date(parseInt(userObject.birthday)));
      setDateString(convertDateTimeToDateString(new Date(parseInt(userObject.birthday))));
    }
    if (userObject.TypeUser.id == 7) {
      setSeniority(userObject.seniority)
      setJournalistCard(userObject.journalistCard)
    }
  }, [userObject])

  useEffect(() => {
    isChangeBirthday && birthday && setDateString(convertDateTimeToDateString(birthday));
    debugger
  }, [birthday, isChangeBirthday])

  const callPostUserDetail = () => {
    showAlert({
      title: "Cập nhật thông tin",
      message: "Bạn muốn cập nhật các thông tin đã thay đổi?",
      alertType: 'warning',
      btnLabel: 'Đồng ý',
      leftBtnLabel: 'Hủy',
      onPress: () => {
        closeAlert()
        setShowLoading(true)
        let timestamp = new Date(birthday).getTime()
        userRepo.postUserDetail(tokenString, imageUrl, name, address, timestamp, phone, seniority, journalistCard, pressCardImageUrl)
          .then(
            responseUser => {
              setResponse(responseUser)
              // thông báo update thành công
              setShowLoading(false)
              setIsEdit(false)
              CallCustomAlert.showAlertWith('Cập nhật thành công', 'success', 'OK')
            }
          )
          .catch(errorMessage => {
            setShowLoading(false)
            CallCustomAlert.showAlertWith(errorMessage == 'Not found' ? string.NOT_FOUND : string.CANT_CONNECT_SERVER, "error", "OK")
          })
      },
    });
  }

  const bs = React.useRef(null);

  ////////////////////// BOTTOM POPUP /////////////////////
  let popupRef = React.createRef()
  const onShowPopup = () => {
    debugger
    popupRef.showPopup()
  }
  const onClosePopupWhenTouchOutside = () => {
    popupRef.closePopup()
  }
  const onClosePopupOpenCamera = () => {
    // choose Photo From camera
    takePhotoFromCamera()
    popupRef.closePopup()
  }
  const onClosePopupOpenLibrary = () => {
    //console.warn(popupRef.state.reasonString)
    choosePhotoFromLibrary()
    popupRef.closePopup()
  }
  ////////////////////////////////////////////////////////////
  const takePhotoFromCamera = () => {
    ImagePicker.openCamera({
      compressImageMaxWidth: 300,
      compressImageMaxHeight: 300,
      cropping: true,
      compressImageQuality: 0.7
    }).then(image => {
      console.log(image);
      // xữ lý trả về cho ảnh cá nhân hay ảnh thẻ ở đây
      if (isChoosePhotoForAvatar) { // avatar
        setImageUrl(image.path);
        setIsChangeImage(true)
      }
      else {
        setPressCardImageUrl(image.path);
        setIsChangePressCardImage(true)
      }
    });
  }

  const choosePhotoFromLibrary = () => {
    ImagePicker.openPicker({
      width: 300,
      height: isChoosePhotoForAvatar ? 300 : 200,
      cropping: true,
      compressImageQuality: 0.7
    }).then(image => {
      console.log(image.path);
      // xữ lý trả về cho ảnh cá nhân hay ảnh thẻ ở đây
      if (isChoosePhotoForAvatar) { // avatar
        setImageUrl(image.path);
        setIsChangeImage(true)
      }
      else {
        setPressCardImageUrl(image.path);
        setIsChangePressCardImage(true)
      }
    });
  }
  return (
    <SafeAreaView style={styles.saveAreaViewContainer}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      <ChoosePhotoPopup
        ref={(target) => popupRef = target}
        title="CHỌN ẢNH ĐẠI DIỆN"
        onTouchOutside={onClosePopupWhenTouchOutside}
        onTouchCameraButton={onClosePopupOpenCamera}
        onTouchLibraryButton={onClosePopupOpenLibrary}
      />
      {showLoading ? <AppLoader /> : null}
      <DatePicker
        title="Chọn ngày"
        confirmText="Chọn"
        cancelText="Hủy"
        modal
        open={open}
        date={birthday}
        onConfirm={(date) => {
          setOpen(false)
          setBirthday(date)
          setIsChangeBirthday(true)
        }}
        onCancel={() => {
          setOpen(false)
        }}
        mode="date"
        theme="auto"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={false}
        contentContainerStyle={styles.scrollViewContainer}>
        <View style={{
          alignContent: 'center',
          alignItems: 'center',
          marginTop: 20,
          backgroundColor: 'white',
        }}>
          {/* onPress={() => bs.current.snapTo(0)} */}
          {/* Hình nền phía sau avatar */}
          <TouchableOpacity
            style={{
              alignContent: 'center',
              alignItems: 'center'
            }}
            disabled={true}>
            <View style={{
              height: 160,
              width: '100%',
              position: 'absolute',
            }}>
              <ImageBackground
                source={require('../assets/images/hills_moutains.jpg')}
                style={{ height: 160, width: '100%' }}
              >
                <View
                  style={{
                    flex: 1,
                    alignSelf: 'flex-end',
                    marginTop: 10,
                    marginRight: 10
                  }}>
                </View>
              </ImageBackground>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setIsChoosePhotoForAvatar(true);
              onShowPopup();
            }}
            disabled={!isEdit}
          >
            <View
              style={{
                height: 150,
                width: 150,
                borderRadius: 75,
                marginTop: 60,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 4,// viền trắng bên ngoài avatar
                borderColor: 'white'
              }}
            >
              <ImageBackground
                source={isChangeImage ? { uri: imageUrl } : image}
                style={{ height: 140, width: 140 }}
                imageStyle={{ borderRadius: 70 }}
              >
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {isEdit && (
                    <MaterialCommunityIcons
                      name="camera"
                      size={35}
                      color="#fff"
                      style={styles.iconChoosePhoto}
                    />
                  )}
                </View>
              </ImageBackground>
            </View>
          </TouchableOpacity>
          <Text style={{
            ...FONTS.h2,
            fontWeight: 'bold',
            color: 'black',
            textAlign: 'center',
            marginTop: 4,
          }}>{name} <Image style={{ height: 16, width: 16 }}
            resizeMode="contain"
            source={require("../assets/icons/check_icon.png")} /></Text>

          <Text style={{ ...FONTS.h3, color: 'black' }}>
            {userTypeName}
          </Text>
        </View>
        <View style={{
          flexDirection: 'row', width: '100%',
          alignContent: 'center', justifyContent: 'center',
          alignSelf: 'center', backgroundColor: 'white',
        }}>
          {!isEdit && <TouchableOpacity onPress={() => callOpenChangePassword()}
            style={[styles.touchableOpacity, { backgroundColor: 'white', borderColor: colors.newprimary, borderWidth: 1 }]}
          >
            <Text style={{ fontSize: 11, color: colors.newprimary }}>
              Đổi mật khẩu
            </Text>
          </TouchableOpacity >}
          {!isEdit && <TouchableOpacity style={[styles.touchableOpacity, { backgroundColor: 'white', borderColor: '#0373F3', borderWidth: 1 }]}
            onPress={() => {
              setOriginalName(name)
              setOriginalAddress(address)
              setOriginalPhone(phone)
              setIsEdit(true)
            }}>
            <Text style={{ fontSize: 11, color: '#0373F3' }}>
              Chỉnh sửa
            </Text>
          </TouchableOpacity >}
          {isEdit && (
            <TouchableOpacity
              style={[styles.touchableOpacity, { backgroundColor: 'white', borderColor: 'red', borderWidth: 1 }]}
              onPress={() => {
                // kiểm tra nếu ko thay đổi gì thì không hiển thị alear
                const isDataChanged =
                  imageUrl !== originalImageUrl ||
                  name !== originalName ||
                  address !== originalAddress ||
                  phone !== originalPhone ||
                  birthday !== originalBirthday ||
                  pressCardImageUrl !== originalPressCardImageUrl;
                if (isDataChanged) {
                  showAlert({
                    title: 'Thông báo',
                    message: 'Bạn muốn hủy các thông tin đã thay đổi?',
                    alertType: 'warning',
                    btnLabel: 'Đồng ý',
                    leftBtnLabel: 'Tiếp tục chỉnh sửa',
                    onPress: () => {
                      closeAlert();
                      setImageUrl(originalImageUrl);
                      setName(originalName);
                      setAddress(originalAddress);
                      setPhone(originalPhone);
                      setBirthday(originalBirthday);
                      setPressCardImageUrl(originalPressCardImageUrl);
                      setIsEdit(false);
                    },
                  });
                } else {
                  // Không có thông tin nào thay đổi, không hiển thị aleart
                  setIsEdit(false);
                }
              }}
            >
              <Text style={{ fontSize: 11, color: 'red' }}>Hủy</Text>
            </TouchableOpacity>
          )}
          {isEdit && <TouchableOpacity style={[styles.touchableOpacity, { backgroundColor: 'white', borderColor: 'green', borderWidth: 1 }]}
            onPress={() => {
              console.log(isEdit)
              callPostUserDetail()
            }}
          >
            <Text style={{ fontSize: 11, color: 'green' }}>
              Cập nhật
            </Text>
          </TouchableOpacity >}

        </View>
        {/* UI BODY */}
        <View>
          {userTypeID == 7 ?
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 10,
              borderBottomWidth: !isEdit ? 1 : 0,
              borderBottomColor: '#EBEBEB'
            }}>
              <Text style={styles.titleInfo}>
                TÊN ĐẦY ĐỦ:
              </Text>
              {!isEdit && <Text style={[styles.contentInfo, { width: 250 }]}>
                {name}
              </Text>}
              {isEdit && <TextInput
                style={[styles.input, { flex: 1, backgroundColor: COLORS.background }]}
                onChangeText={(value) => setName(value)}
                value={name}
                placeholder="Họ và tên"
              />}
            </View>
            :
            <View style={[styles.viewContainInfo, {}]}>
              <Text style={styles.titleInfo}>
                TÊN CƠ QUAN:
              </Text>
              <Text style={styles.contentInfo}>
                {instituteName}
              </Text>
            </View>
          }
          {userTypeID == '7' && <View style={[styles.viewContainInfo, {}]}>
            <Text style={styles.titleInfo}>
              NGÀY SINH:
            </Text>
            <Text style={[styles.contentInfo, { flex: 1, padding: 8, borderRadius: 10 }]}>
              {dateString}
            </Text>
            {isEdit && <TouchableOpacity style={{
              flexDirection: 'row'
            }}
              onPress={() => setOpen(true)}>
              <Icon name='date' style={{ color: 'red', fontSize: 20, marginEnd: 10 }} />
            </TouchableOpacity >
            }
          </View>}

          {!isEdit &&
            <View style={{ height: 12, width: '100%', backgroundColor: COLORS.background }}></View>}

          {userTypeID == '7' && <View style={[styles.viewContainInfo, {
            borderBottomWidth: !isEdit ? 1 : 0,
            borderBottomColor: '#EBEBEB'
          }]}>
            <Text style={styles.titleInfo}>
              ĐƠN VỊ:
            </Text>
            <Text style={styles.contentInfo}>
              {instituteName}
            </Text>
          </View>}
          <View style={[styles.viewContainInfo, {
            borderBottomWidth: !isEdit ? 1 : 0,
            borderBottomColor: '#EBEBEB'
          }]}>
            <Text style={styles.titleInfo}>
              ĐỊA CHỈ:
            </Text>
            {!isEdit && <Text style={[styles.contentInfo, { width: 260 }]}>
              {address}
            </Text>}
            {isEdit && <TextInput
              style={[styles.input, { flex: 1, backgroundColor: COLORS.background }]}
              onChangeText={(value) => setAddress(value)}
              value={address}
              placeholder="Địa chỉ"
            />
            }
          </View>
          <View style={[styles.viewContainInfo, {
            borderBottomWidth: !isEdit ? 1 : 0,
            borderBottomColor: '#EBEBEB'
          }]}>
            <Text style={styles.titleInfo}>
              EMAIL:
            </Text>
            <Text style={styles.contentInfo}>
              {email}
            </Text>
          </View>
          <View style={[styles.viewContainInfo, {}]}>
            <Text style={styles.titleInfo}>
              SĐT:
            </Text>
            {!isEdit && <Text style={styles.contentInfo}>
              {phone}
            </Text>}
            {isEdit && <PhoneInput
              defaultValue={phone}
              defaultCode="VN"
              onChangeText={(value) => setPhone(value)}
              // layout="first"
              layout="second"
              // textInputStyle={{fontSize: 16,height: 40,color:'red'}}
              placeholder=" Nhập số điện thoại"
              textInputProps={{ style: { height: 40, fontSize: 15, } }}
              containerStyle={{ height: 45, width: '100%', borderRadius: 10, backgroundColor: COLORS.background }}
              textContainerStyle={{ height: 45, borderRadius: 10, backgroundColor: COLORS.background }}
            />
            }
          </View>
          {!isEdit &&
            <View style={{ height: 12, width: '100%', backgroundColor: COLORS.background }}></View>}
          {userTypeID == '7' && <View style={[styles.viewContainInfo, {
            borderBottomWidth: !isEdit ? 1 : 0,
            borderBottomColor: '#EBEBEB'
          }]}>
            <Text style={styles.titleInfo}>
              ID THẺ LÀM VIỆC:
            </Text>
            <Text style={[styles.contentInfo]}>
              {journalistCard}
            </Text>
          </View>}
          {userTypeID == '7' && <View style={[styles.viewContainInfo, {
            borderBottomWidth: !isEdit ? 1 : 0,
            borderBottomColor: '#EBEBEB'
          }]}>
            <Text style={styles.titleInfo}>
              SỐ NĂM CÔNG TÁC:
            </Text>
            <Text style={styles.contentInfo}>
              {seniority}
            </Text>
          </View>}
          {userTypeID == '7' &&
            <Text style={styles.titleInfo}>
              HÌNH ẢNH THẺ LÀM VIỆC:
            </Text>}
          {userTypeID == '7' && <View style={{ alignSelf: 'center', marginBottom: 10, marginHorizontal: 10 }}>
            <TouchableOpacity style={{ alignSelf: 'center' }}
              onPress={() => {
                setIsChoosePhotoForAvatar(false)
                onShowPopup()
              }}
              disabled={!isEdit}>
              <ImageBackground
                source={isChangePressCardImage ? {
                  uri: pressCardImageUrl,
                } : pressCardImage}
                style={{
                  width: '100%',
                  aspectRatio: 1 / 0.65,
                  height: undefined,
                  resizeMode: 'stretch',
                  alignSelf: 'center',
                }}
                imageStyle={{ borderRadius: 10 }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  {isEdit && <MaterialCommunityIcons
                    name="camera"
                    size={35}
                    color="#fff"
                    style={styles.iconChoosePhoto}
                  />}
                </View>
              </ImageBackground>
            </TouchableOpacity>
          </View>}
        </View>
        <Modal
          transparent={true}
          visible={isOpenChangePassword}
        >
          <View style={{
            flex: 1,
            backgroundColor: '#000000aa',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <View
              style={{
                margin: 30,
                borderRadius: 16,
                paddingVertical: 10,
                paddingHorizontal: 5,
                backgroundColor: COLORS.white,
              }}>
              <TouchableOpacity onPress={() => { setIsOpenChangePassword(false) }}
                style={{ width: 20, alignSelf: 'flex-end' }}
              >
                <Icon1 name='close' style={{ color: 'black', fontSize: 20 }} />
              </TouchableOpacity>
              {/* Modal content */}
              <ChangePasswordScreen onSuccess={handlePasswordChangeSuccess} />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  touchableOpacity: {
    backgroundColor: '#0373F3',
    borderRadius: 4,
    alignContent: 'center',
    justifyContent: 'center',
    padding: 5,
    margin: 10,
    flexDirection: 'row'
  },
  iconChoosePhoto: {
    opacity: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#fff',
    borderRadius: 10,
  },
  saveAreaViewContainer: { flex: 1, backgroundColor: '#FFF' },
  scrollViewContainer: {
    flexGrow: 1,
    backgroundColor: 'white',
    // width:'96%'
  },
  titleInfo: {
    fontSize: 11,
    color: '#727272',
    marginStart: 10,
    marginRight: 20,
    height: 35,
    textAlignVertical: 'center',
  },
  contentInfo: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'black',
    flexShrink: 1
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: "gray",
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    ...FONTS.h3,
    color: 'black',
    fontWeight: 'bold',
    textAlignVertical: 'center'
  },
  viewContainInfo: {
    flexDirection: 'row',
    marginVertical: 5,
    alignItems: 'center'
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 6,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 4,
  }
});
export default ProfileScreen