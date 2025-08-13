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
    FlatList,
    StatusBar, 
    StyleSheet,  
    Modal
} from 'react-native'
import DocumentPicker, {
    DirectoryPickerResponse,
    DocumentPickerResponse,
    isInProgress,
    types,
} from 'react-native-document-picker'

import { COLORS, FONTS, SIZES, string, images, colors } from '../constants'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/FontAwesome'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon1 from 'react-native-vector-icons/MaterialIcons'
import DatePicker from 'react-native-date-picker'

import { work as workRepo, institute as instituteRepo, sessions as sessionsRepo, journalist as journalistRepo } from "../repositories"
import { convertDateTimeToDateString, convertDateTimeToTimeString } from "../utilies/DateTime"
import { getMyStringValue } from "../utilies/LocalDataHandler"
import { showAlert, closeAlert } from "react-native-customisable-alert";

import { CallCustomAlert } from "../utilies";
import AppLoader from '../utilies/AppLoader';
import RegisterItem from "./RegisterItem";
import DropdownSingleSelect from '../Component/DropdownSingleSelect';
import ChoosePhotoPopup from "../Component/ChoosePhotoPopup";
import ImagePicker from 'react-native-image-crop-picker';

function WorkRegisterForJounalist(props) {
    //navigation
    const { navigation, route } = props
    //functions of navigate to/back
    const { navigate, goBack } = navigation
    const [showLoading, setShowLoading] = useState(false)

    const [title, setTitle] = useState('');
    const [sessionID, setSessionID] = useState(0);
    const [content, setContent] = useState('');
    const [response, setResponse] = useState(null)
    const [date, setDate] = useState(new Date())
    const [open, setOpen] = useState(false)
    const [dateString, setDateString] = useState('')
    const [timeString, setTimeString] = useState('')

    const [image, setImage] = useState(images.noAvatar)
    const [imageUrl, setImageUrl] = useState('')
    const [pressCardImage, setPressCardImage] = useState(images.noImage)
    const [pressCardImageUrl, setPressCardImageUrl] = useState('https://img.icons8.com/color/344/circled-user-male-skin-type-5.png')
    const [isChoosePhotoForAvatar, setIsChoosePhotoForAvatar] = useState(false)

    const [pressName, setPressName] = useState('');
    const [pressAddress, setPressAddress] = useState('');
    const [pressDesciption, setPressDesciption] = useState('');

    const [journalistName, setJournalistName] = useState('');
    const [journalistPhone, setJournalistPhone] = useState('');
    const [journalistEmail, setJournalistEmail] = useState('');
    const [journalistAddress, setJournalistAddress] = useState('');
    const [journalistCardNumber, setJournalistCardNumber] = useState('');
    const [journalistCCCD, setJournalistCCCD] = useState('');
    // khai báo các select id

    const [selectedInstituteID, setSelectedInstituteID] = useState(0)
    const [selectedProvinceID, setSelectedProvinceID] = useState(0)
    const [selectedChildProvinceID, setSelectedChildProvinceID] = useState(0)
    const [selectedStrangeJournalistID, setSelectedStrangeJournalistID] = useState(0);
    const [selectedStrangePressInstituteID, setSelectedStrangePressInstituteID] = useState(0)

    const [timeStamp, setTimeStamp] = useState('')
    const [isChangeDate, setIsChangeDate] = useState(false)

    const [isChangeImage, setIsChangeImage] = useState(false)
    const [isChangePressCardImage, setIsChangePressCardImage] = useState(false)
 
    const [files, setFileUris] = useState([]);
    const [results, setResults] = React.useState(null)

    const [isJournalist, setIsJournalist] = useState(false)
    const [institute, setInstitute] = useState([])
    const [sessions, setSessions] = useState([])
    const [registers, setRegisters] = useState([])
    const [strangeJournalists, setStrangeJournalists] = useState([])
    const [strangePressInstitutes, setStrangePressInstitutes] = useState([])

    const [isOpenAddUserModal, setIsOpenAddUserModal] = useState(false)
    const [isOpenAddPressAgencyModal, setIsOpenAddPressAgencyModal] = useState(false)

    const flatListRef = React.useRef()

    ///////////////// ASYGN STORAGE ///////////////////////
    const [tokenString, setTokenString] = useState('')
    const [userID, setUserID] = useState('')
    const [userTypeID, setUserTypeID] = useState('')
    const [userInstituteID, setUserInstituteID] = useState('')

    getMyStringValue("token").then((value) => {
        const data = value;
        setTokenString(data)
    })
    getMyStringValue("userTypeID").then((value) => {
        const data = value;
        setUserTypeID(data)
        setIsJournalist(data == 7)
    })
    getMyStringValue("userID").then((value) => {
        const data = value;
        setUserID(data)
    })

    getMyStringValue("instituteID").then((value) => {
        const data = value;
        setSelectedInstituteID(parseInt(data))
    })

  //////////////// CHOOSE FILE FROM DEVICE //////////////////// 
  // xử lý gắn và hiện nhiều files
  useEffect(() => {
    if (results == null) return
    const newFileUris = results.map((result) => result.fileCopyUri);
    setFileUris((prevUri) => prevUri.concat(newFileUris.filter((item) => {
        let result = true
        prevUri.filter((prevUriItem) => {if (prevUriItem.split('/').pop() == item.split('/').pop()) result = false; })     
        return result
      }
    ))) 
  }, [results])

  const handleError = (err) => {
    if (DocumentPicker.isCancel(err)) {
      console.warn('cancelled')
      // User cancelled the picker, exit any dialogs or menus and move on
    } else if (isInProgress(err)) {
      console.warn('multiple pickers were opened, only the last will be considered')
    } else {
      throw err
    }
  }

  //Xóa từng file 
  const deleteFile = (fileUri) => {
    setFileUris((prevFiles) => prevFiles.filter((uri) => uri !== fileUri));
  };

    ////////////////// NAVIGATION OPTION ////////////////////
    useEffect(() => {
        navigation.setOptions(
            {
                headerShown: true,
                headerTitle: 'Đăng ký làm việc trực tiếp',
                headerTitleStyle: { fontSize: 20, fontWeight: 'bold' },
                headerTitleAlign: 'center',
                headerStyle: {
                    backgroundColor: colors.newprimary
                },
                headerTintColor: 'white'
            })
    }, [])

    //////////////////////// XỮ LÝ CAL API ///////////////////////////////////
    const callPostWorkRegistration = () => {
        if (tokenString != '') {
            if (title == '' || content == '') {
                // de nghi nhap ten tieu de// de nghi nhap ten tieu de
                CallCustomAlert.showAlertWith("Chưa nhập tiêu đề hoặc nội dung", 'error', 'OK')
                // onPress: () => closeAlert()                  
                return
            }
            if (dateString == '') {
                CallCustomAlert.showAlertWith("Chưa chọn ngày làm việc", 'error', 'OK')
                return
            }
            setShowLoading(true)
            debugger
            workRepo.postWorkRegistration(tokenString, selectedInstituteID, sessionID, title, content, timeStamp, true, false, false, files, selectedStrangeJournalistID)
                .then(
                    responseWork => {
                        setResponse(responseWork)
                        setShowLoading(false)
                        showAlert({
                            title: 'Thông báo',
                            message: "Đăng ký làm việc thành công",
                            alertType: 'success',
                            btnLabel: 'OK',
                            onPress: () => {
                                closeAlert()
                                navigation.goBack()
                            }
                        })
                    })
                .catch(
                    errorMessage => {
                        setShowLoading(false)
                        CallCustomAlert.showAlertWith("Đăng ký không thành công", errorMessage == 'Not found' ? string.NOT_FOUND : string.CANT_CONNECT_SERVER, "error", "OK")
                    }
                )
        }
    }
    const resetAddStrangePressInstitute = () => {
        setPressName('');
        setPressDesciption('');
        setSelectedProvinceID(0);
        setSelectedChildProvinceID(0);
        setPressAddress('');
      };
    const callPostAddStrangePressInstitute = () => {
        if (tokenString != '') {
            if (pressName == '') {
                // de nghi nhap ten tieu de// de nghi nhap ten tieu de
                CallCustomAlert.showAlertWith("Chưa nhập tên đơn vị báo chí", 'error', 'OK')
                // onPress: () => closeAlert()                  
                return
            }
            if (pressAddress == '') {
                CallCustomAlert.showAlertWith("Chưa nhập địa chỉ đơn vị", 'error', 'OK')
                return
            }
            if (pressDesciption == '') {
                CallCustomAlert.showAlertWith("Chưa nhập mô tả đơn vị", 'error', 'OK')
                return
            }

            if (selectedProvinceID == 0 && selectedChildProvinceID == 0) { // kiểm tra đã join vào session này chưa
                CallCustomAlert.showAlertWith("Chưa chọn các cấp hành chính của đơn vị", 'error', 'OK')
                return
            }

            setShowLoading(true)
            debugger
            instituteRepo.postAddStrangePressInstitute(tokenString, pressName, pressDesciption, 3,
                selectedChildProvinceID != 0 ? selectedChildProvinceID : selectedProvinceID, pressAddress)
                .then(
                    responseWork => {
                        setResponse(responseWork)
                        setShowLoading(false)
                        showAlert({
                            title: 'Thông báo',
                            message: "Tạo mới đơn vị phóng viên vãng lai thành công",
                            alertType: 'success',
                            btnLabel: 'OK',
                            onPress: () => {
                                closeAlert()
                                setIsOpenAddPressAgencyModal(false)
                                resetAddStrangePressInstitute()
                                // cập nhật lại danh sách đơn vị vãng lai
                                instituteRepo.getAllStrangePressInstitute(tokenString)
                                    .then(
                                        responseStrangePressInstitute => {
                                            setStrangePressInstitutes(responseStrangePressInstitute)
                                            setShowLoading(false)
                                        }
                                    )
                                    .catch(
                                        errorMessage => {
                                            debugger
                                            setShowLoading(false)
                                            if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
                                        }
                                    )
                            }
                        })
                    })
                .catch(
                    errorMessage => {
                        setShowLoading(false)
                        CallCustomAlert.showAlertWith("Tạo mới không thành công", string.CANT_CONNECT_SERVER, "error", "OK")
                    }
                )
        }
    }
    const resetFormAddStrangeJournalist= () => {
        setIsChangeImage(false)
        setJournalistName('');
        setSelectedStrangePressInstituteID(0);
        setJournalistAddress('');
        setJournalistEmail('');
        setJournalistPhone('');
        setJournalistCardNumber('');
        setIsChangePressCardImage(false)
        setJournalistCCCD('');
      };
    const callPostAddStrangeJournalist = () => {
        if (tokenString != '') {
            if (selectedStrangePressInstituteID == 0) {
                // de nghi nhap ten tieu de// de nghi nhap ten tieu de
                CallCustomAlert.showAlertWith("Chưa chọn đơn vị cho phóng viên", 'error', 'OK')
                return
            }
            if (journalistName == '' || journalistPhone == '' || journalistEmail == '' || journalistAddress == '' || journalistCardNumber == '') {
                CallCustomAlert.showAlertWith("Chưa nhập đầy đủ thông tin cho phóng viên", 'error', 'OK')
                return
            }
            if (journalistCCCD == '') {
                CallCustomAlert.showAlertWith("Chưa nhập số căn cước công dân", 'error', 'OK')  
            } else if (journalistCCCD.length !== 12) {
                CallCustomAlert.showAlertWith("Số CCCD phải có đúng 12 số", 'error', 'OK');
                return
            }
            if (isChangeImage != true || isChangePressCardImage != true) { // kiểm tra đã up ảnh cho pv hay chưa
                CallCustomAlert.showAlertWith("Cần có ảnh phóng viên và ảnh thẻ", 'error', 'OK')
                return
            }
            setShowLoading(true)
            // debugger
            journalistRepo.postAddStrangeJournalist(tokenString, imageUrl, journalistName, selectedStrangePressInstituteID,
                journalistAddress, journalistEmail, journalistPhone, journalistCardNumber, pressCardImageUrl,journalistCCCD)
                .then( responseWork => {
                        setResponse(responseWork)
                        setShowLoading(false)
                        showAlert({
                            title: 'Thông báo',
                            message: "Tạo mới phóng viên vãng lai thành công",
                            alertType: 'success',
                            btnLabel: 'OK',
                            onPress: () => {
                                closeAlert()
                                setIsOpenAddUserModal(false)
                                resetFormAddStrangeJournalist()
                                // cập nhật lại danh sách đơn vị vãng lai
                                journalistRepo.getAllStrangeJournalist(tokenString)
                                    .then(
                                        responseStrangeJournalist => {
                                            setStrangeJournalists(responseStrangeJournalist)
                                            setShowLoading(false)
                                        }
                                    )
                                    .catch(
                                        errorMessage => {
                                            debugger
                                            setShowLoading(false)
                                            if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
                                        }
                                    )
                            }
                        })
                    })
                    .catch(errorMessage => {
                            setShowLoading(false)
                            CallCustomAlert.showAlertWith("Số này CCCD Đã tồn tại trên hệ thống", "error", "OK")
                        })
                .catch(errorMessage => {
                        setShowLoading(false)
                        CallCustomAlert.showAlertWith("Tạo mới không thành công", string.CANT_CONNECT_SERVER, "error", "OK")
                    })
        }
    }

    /////////////////// USE EFFECT ///////////////////////////
    useEffect(() => {
        if (!isChangeDate) return
        setDateString(convertDateTimeToDateString(date));
        setTimeString(convertDateTimeToTimeString(date));
        setIsChangeDate(false)
    }, [isChangeDate])

    useEffect(() => {
        if (tokenString != '') {
            setShowLoading(true)
            // lấy danh  sách huyện / xã
            instituteRepo.getProvince(tokenString)
                .then(
                    responseInstitute => {
                        setInstitute(responseInstitute)
                        setShowLoading(false)
                    }
                )
                .then(
                    journalistRepo.getAllStrangeJournalist(tokenString)
                        .then(
                            responseStrangeJournalist => {
                                setStrangeJournalists(responseStrangeJournalist)
                                setShowLoading(false)
                            }
                        )
                        .then(
                            instituteRepo.getAllStrangePressInstitute(tokenString)
                                .then(
                                    responseStrangePressInstitute => {
                                        setStrangePressInstitutes(responseStrangePressInstitute)
                                        setShowLoading(false)
                                    }
                                )
                                .catch(
                                    errorMessage => {
                                        debugger
                                        setShowLoading(false)
                                        if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
                                    }
                                )
                        )
                        .catch(
                            errorMessage => {
                                debugger
                                setShowLoading(false)
                                if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
                            }
                        )
                )
                .catch(
                    errorMessage => {
                        debugger
                        setShowLoading(false)
                        if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
                    }
                )
        }
    }, [tokenString])

    //////////////////// DROPDOWN LIST CHANGE ITEM ///////////////// 
    ////////////////////////////////////////////////////////////
    // KHI CHỌN 1 SESSION CÓ SẴN
    const onChangeSession = (selectedItems) => {
        //console.warn(selectedItems[0])  
        setSessionID(selectedItems[0])
        registersData.length = 0;
        setRegisters([])
        setDateString('');
        setTimeString('');
        setTitle('')
        if (selectedItems[0] == 0) return
        debugger
        // nếu chọn 1 session có sẵn thì phải gán title và ngày làm việc của session có sẵn với đăng ký này
        let selectSession = sessionsData.find(data => data.id === selectedItems[0]);
        if (selectSession != null) {
            //console.warn(selectSession.dateSession)
            // đã lấy được session
            setDate(new Date(parseInt(selectSession.dateSession)))
            setTimeStamp(selectSession.dateSession)
            setIsChangeDate(true)
            setRegisters(selectSession.register)
            // set các giá trị để gửi API đăng ký
            setTitle(selectSession.workSession)
        }
    };

    const onChangeStrangeJournalist = (selectedItems) => {
        setSelectedStrangeJournalistID(selectedItems[0])
        setShowLoading(true)
        sessionsRepo.getSessionsByInstituteIDAndSessionID(tokenString, selectedInstituteID, 0, 1, 2)
            .then(
                responseSessions => {
                    setSessions(responseSessions)
                    setShowLoading(false)
                }
            )
            .catch(
                errorMessage => {
                    setShowLoading(false)
                    if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
                }
            )
    };

    const onChangeStrangePressInstitute = (selectedItems) => {
        setSelectedStrangePressInstituteID(selectedItems[0])
    };

    const openAddUserModal = () => {
        setIsOpenAddUserModal(true)
    };

    const openAddPressAgencyModal = () => {
        setIsOpenAddPressAgencyModal(true)
    };

    //////////////////// XỮ LÝ DỮ LIỆU TỪ API VÀO CÁC ARRAY /////////////
    const [tempArray, setTempArray] = useState([])

    //////////////////// DROPDOWN LIST CHANGE ITEM /////////////////
    // KHI CHỌN MỘT ĐƠN VỊ TRONG DANH SÁCH
    const childChooseProvinceData = []
    const onChangeProvince = (selectedItems) => {
        //console.warn(selectedItems[0])  
        //debugger
        childChooseProvinceData.length = 0;
        setSelectedProvinceID(parseInt(selectedItems[0]))
        setTempArray(childProvinceData)
    };

    tempArray.length > 0 && tempArray.forEach(element => {
        if (element.parentId == selectedProvinceID) {
            childChooseProvinceData.push(element)
        }
    })

    const onChangeChildProvince = (selectedItems) => {
        setSelectedChildProvinceID(parseInt(selectedItems[0]))
    };

    //////////////////// XỮ LÝ DỮ LIỆU TỪ API VÀO CÁC ARRAY /////////////
    const provinceData = []
    const childProvinceData = []
    if (institute.length > 0) {
        institute.forEach(element => {
            element.children && element.children.forEach(childElement1 => {
                provinceData.push({
                    "item": childElement1.name,
                    "label": childElement1.name,
                    "value": childElement1.id,
                    "id": childElement1.id,
                    'name': childElement1.name,
                    'parentId': childElement1.parentId,
                    'hierarchyLevel': childElement1.hierarchyLevel
                })
                childElement1.children && childElement1.children.forEach(childElement2 => {
                    childProvinceData.push({
                        "item": childElement2.name,
                        "label": childElement2.name,
                        "value": childElement2.id,
                        "id": childElement2.id,
                        'name': childElement2.name,
                        'parentId': childElement2.parentId,
                        'hierarchyLevel': childElement2.hierarchyLevel
                    })
                })
            })
        })
    }
    const strangeJournalistData = []
    strangeJournalists.length > 0 && strangeJournalists.forEach(element => {
        //debugger
        let strangeJournalistObj = {
            "label": element.givenName + "\nSố thẻ: " + element.journalistCard,
            "value": element.id,
            "id": element.id,
            "icon": {
                "uri": element.avatar != null ? string.IMAGEURL + element.avatar : 'https://img.icons8.com/color/344/circled-user-male-skin-type-5.png'
            },
            "journalistCard": element.journalistCard,
            "instituteName": element?.Institute?.name
        }
        strangeJournalistData.push(strangeJournalistObj)
    })
    const strangePressInstituteData = []
    strangePressInstitutes.length > 0 && strangePressInstitutes.forEach(element => {
        //debugger
        let strangePressInstituteObj = {
            "label": element.name,
            "value": element.id,
            "id": element.id, 
            "address": element.address
        }
        strangePressInstituteData.push(strangePressInstituteObj)
    })

    const [work, setWork] = useState([]);
    const sessionsData = []
    sessions.length > 0 && sessions.forEach(element => {
        // kiểm tra nếu session đó phóng viên đã join vào thì không đưa vào danh sách nữa
        if (element.register.find(data => data.senderId == selectedStrangeJournalistID) == null) {
            // tiếp tục kiểm tra xem phóng viên đã từng đăng ký vào session này chưa(đk nhưng chưa được duyệt)
            // chưa duyệt thì chưa có trong reggister của session, do đó session đó vẫn hiển thị lên
            // nếu dk đã duyệt nhưng bị hủy thì có thể join vào lại
            if (work.find(data => data.sessionContent.id == element.id && data.statusApointment != 0) == null) {
                let sessionObj = {
                    "id": element.id,
                    "label": element.respWorkSession ? element.respWorkSession : element.workSession,
                    "value": element.id,
                    "workSession": element.respWorkSession ? element.respWorkSession : element.workSession,
                    "dateSession": element.dateSession,
                    "statusSession": element.statusSession,
                    "register": element.register
                }
                sessionsData.push(sessionObj)
            }
        }
    })

    // Lấy danh sách người tham dự đưa vào mãng registerData để hiển thị lên flatlist
    let registersData = []
    registers.length > 0 && registers.forEach(element => {
        //debugger
        let registerObj = {
            "id": element.id,
            "senderId": element.senderId,
            "senderUserName": element.senderUsers.givenName,
            "agency": element.senderUsers?.Institute?.name,
        }
        registersData.push(registerObj)
    })
  
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
    const takePhotoFromCamera = () => {
        ImagePicker.openCamera({
            compressImageMaxWidth: 300,
            compressImageMaxHeight: isChoosePhotoForAvatar ? 300 : 200,
            cropping: true,
            compressImageQuality: 0.7
        }).then(image => {
            console.log(image);
            // xữ lý trả về cho ảnh cá nhân hay ảnh thẻ ở đây
            debugger
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
            debugger
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
    ///////////////////// LAYOUT RENDER ///////////////////////////////////
    return (
        <SafeAreaView style={styles.saveAreaViewContainer}>
            <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
            <ChoosePhotoPopup
                ref={(target) => popupRef = target}
                title="TẢI ẢNH LÊN"
                onTouchOutside={onClosePopupWhenTouchOutside}
                onTouchCameraButton={onClosePopupOpenCamera}
                onTouchLibraryButton={onClosePopupOpenLibrary}
            />
            {showLoading ? <AppLoader /> : null}
            <DatePicker
                title="Chọn ngày và giờ"
                modal
                open={open}
                date={date}
                onConfirm={(date) => {
                    debugger
                    setOpen(false)
                    setDate(date)
                    setTimeStamp(new Date(date).getTime())
                    setIsChangeDate(true)
                }}
                onCancel={() => {
                    setOpen(false)
                }}
                mode="datetime"
                theme="auto"
            />
            {/* // PHẦN MODAL TẠO MỚI PHÓNG VIÊN VÃNG LAI */}
            <Modal
                transparent={true}
                visible={isOpenAddUserModal}>
                <TouchableOpacity onPress={() => { setIsOpenAddUserModal(false) }}
                    style={{
                        backgroundColor: '#000000aa', flex: 1,
                        height: 'auto', maxHeight: SIZES.height
                    }}>
                    <View onStartShouldSetResponder={() => true}
                        style={{
                            backgroundColor: '#FFFFFF', margin: 20,
                            padding: 10, borderRadius: 10,
                            height: 'auto', maxHeight: SIZES.height - 60
                        }}>
                        {/* // header */}
                        <View style={{
                            flexDirection: 'row', marginBottom: 10,
                            justifyContent: 'space-between'
                        }}>
                            <Text style={{
                                fontSize: 20, fontWeight: 'bold',
                                color: colors.newprimary
                            }}>Tạo mới phóng viên lãng lai</Text>
                            <View style={{ justifyContent: 'center' }}>
                                <TouchableOpacity onPress={() => { setIsOpenAddUserModal(false) }}>
                                    <Icon name='close' style={{ color: 'black', fontSize: 22 }} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        {/* // Detail */}

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            alwaysBounceVertical={false}
                            nestedScrollEnabled={true}
                            contentContainerStyle={styles.scrollViewContainer}>
                            <View style={{ marginVertical: 10, flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{
                                    width: '90%',
                                    backgroundColor: COLORS.white,
                                    borderWidth: 1,
                                    borderRadius: SIZES.radius,
                                    borderColor: COLORS.gray,
                                }}>
                                    <DropdownSingleSelect
                                        items={strangePressInstituteData}
                                        IconRenderer={Icon1}
                                        displayKey="label"
                                        selectText="Chọn đơn vị"
                                        onSelectedItemsChange={onChangeStrangePressInstitute}
                                        selectedItems={[selectedStrangePressInstituteID]}
                                        filterItems={(filter, items) => {
                                            return items.filter((item) =>
                                            item.label.toLowerCase().includes(filter.toLowerCase())
                                            );
                                        }}
                                        noItemsComponent={
                                            <View style={{
                                                marginTop: 30,
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}>
                                                <Image style={{ height: 100, width: 100 }}
                                                    resizeMode="cover"
                                                    source={require("../assets/images/nothingFound.png")} />
                                                <Text style={{
                                                    color: 'black',
                                                    fontWeight: 'bold',
                                                    fontSize: 16
                                                }}>Hiện không có cơ quan báo chí vãng lai nào
                                                </Text>
                                                <Text style={{
                                                    color: '#858181',
                                                    fontSize: 16
                                                }}>Bạn thử tìm từ khóa khác nhé.
                                                </Text>
                                            </View>}
                                        />
                                </View>
                                <View>
                                    <TouchableOpacity style={{
                                        alignContent: 'center',
                                        justifyContent: 'center',
                                        marginLeft: 5
                                    }}
                                        onPress={() => {
                                            openAddPressAgencyModal()
                                        }}>
                                        <Icon name='plus' style={{ color: 'black', fontSize: 30 }} />
                                    </TouchableOpacity >
                                </View>
                            </View>
                            <View style={{}}>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.titleSmallHeader}>
                                            Tên phóng viên*
                                        </Text>
                                        <TextInput
                                            style={[styles.input, {}]}
                                            onChangeText={(value) => setJournalistName(value)}
                                            value={journalistName}
                                            multiline={true}
                                            placeholder="Nhập tên phóng viên*"
                                            placeholderTextColor={'#20202088'}
                                        />
                                        <Text style={styles.titleSmallHeader}>
                                            Số CCCD*
                                        </Text>
                                        <TextInput
                                            style={[styles.input, {}]}
                                            onChangeText={(value) => setJournalistCCCD(value)}
                                            value={journalistCCCD}
                                            multiline={true}
                                            placeholder="Nhập số CCCD*"
                                            placeholderTextColor={'#20202088'}
                                            keyboardType="numeric"
                                        />
                                        <Text style={styles.titleSmallHeader}>
                                            Số điện thoại*
                                        </Text>
                                        <TextInput
                                            style={[styles.input, {}]}
                                            onChangeText={(value) => setJournalistPhone(value)}
                                            value={journalistPhone}
                                            multiline={true}
                                            placeholder="Nhập số điện thoại*"
                                            placeholderTextColor={'#20202088'}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View style={{}}>
                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={styles.titleSmallHeader}>
                                                Chọn ảnh đại diện
                                            </Text>
                                        </View>
                                        <View style={{
                                            flex: 1,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            margin: 5,
                                        }}>
                                            {/* onPress={() => bs.current.snapTo(0)} */}
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setIsChoosePhotoForAvatar(true)
                                                    onShowPopup()
                                                }}
                                                disabled={false}>
                                                <View
                                                    style={{
                                                        height: 120,
                                                        width: 120,
                                                        borderRadius: 10,
                                                        justifyContent: 'center',
                                                        alignItems: 'center'
                                                    }}>
                                                    <ImageBackground
                                                        source={isChangeImage ? {
                                                            uri: imageUrl,
                                                        } : image}
                                                        style={{ height: 120, width: 120 }}
                                                        imageStyle={{ borderRadius: 10 }}>
                                                        <View
                                                            style={{
                                                                flex: 1,
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                            }}>
                                                            <MaterialCommunityIcons
                                                                name="camera"
                                                                size={35}
                                                                color={colors.newprimary}
                                                                style={styles.iconChoosePhoto}
                                                            />
                                                        </View>
                                                    </ImageBackground>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                <Text style={styles.titleSmallHeader}>
                                    Địa chỉ Email*
                                </Text>
                                <TextInput
                                    style={[styles.input, {}]}
                                    onChangeText={(value) => setJournalistEmail(value)}
                                    value={journalistEmail}
                                    multiline={true}
                                    placeholder="Nhập địa chỉ email*"
                                    placeholderTextColor={'#20202088'}
                                />

                                <Text style={styles.titleSmallHeader}>
                                    Địa chỉ thưởng trú hiện tại*
                                </Text>
                                <TextInput
                                    style={[styles.input, {}]}
                                    onChangeText={(value) => setJournalistAddress(value)}
                                    value={journalistAddress}
                                    multiline={true}
                                    placeholder="Nhập địa chỉ thường trú hiện tại*"
                                    placeholderTextColor={'#20202088'}
                                />

                                <Text style={styles.titleSmallHeader}>
                                    Số thẻ phóng viên*
                                </Text>
                                <TextInput
                                    style={[styles.input, {}]}
                                    onChangeText={(value) => setJournalistCardNumber(value)}
                                    value={journalistCardNumber}
                                    multiline={true}
                                    placeholder="Nhập số thẻ phóng viên*"
                                    placeholderTextColor={'#20202088'}
                                />
                                <Text style={styles.titleSmallHeader}>
                                    Hình ảnh thẻ phóng viên:
                                </Text>
                                <TouchableOpacity style={{ alignSelf: 'center', marginTop: 10 }}
                                    onPress={() => {
                                        setIsChoosePhotoForAvatar(false)
                                        onShowPopup()
                                    }}
                                    disabled={false}>
                                    <ImageBackground
                                        source={isChangePressCardImage ? {
                                            uri: pressCardImageUrl,
                                        } : pressCardImage}
                                        style={{
                                            width: '100%',
                                            aspectRatio: 1 / 0.65,
                                            height: undefined,
                                            resizeMode: 'stretch',
                                            alignSelf: 'center'
                                        }}
                                        imageStyle={{ borderRadius: 10 }}>
                                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
                                            <MaterialCommunityIcons
                                                name="camera"
                                                size={35}
                                                color={colors.newprimary}
                                                style={styles.iconChoosePhoto}
                                            />
                                        </View>
                                    </ImageBackground>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                        <TouchableOpacity onPress={() => {
                            showAlert({
                                title: "Thông báo",
                                message: "Bạn muốn tạo mới phóng viên này ?",
                                alertType: 'warning',
                                btnLabel: 'Đồng ý',
                                leftBtnLabel: 'Hủy',
                                onPress: () => {
                                    closeAlert()
                                    callPostAddStrangeJournalist();
                                }
                            });
                        }}
                        style={{
                            backgroundColor: colors.newprimary,
                            borderRadius: 10,
                            alignContent: 'center',
                            justifyContent: 'center',
                            paddingVertical: 10,
                            paddingHorizontal: 10,
                            marginTop: 10,
                            flexDirection: 'row'
                        }}>
                            <Text style={{ fontSize: 20, color: 'white' }}>
                                Tạo mới phóng viên
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
            {/* // PHẦN MODAL TẠO MỚI ĐƠN VỊ */}
            <Modal
                transparent={true}
                visible={isOpenAddPressAgencyModal}>
                <View style={{ backgroundColor: '#000000aa', flex: 1, height: 'auto', maxHeight: SIZES.height }}>
                    <View onStartShouldSetResponder={() => true}
                        style={{ backgroundColor: '#FFFFFF', margin: 20, padding: 10, borderRadius: 5, height: 'auto', maxHeight: SIZES.height - 100 }}>
                        {/* // header */}
                        <View style={{
                            flexDirection: 'row', marginBottom: 10,
                            justifyContent: 'space-between'
                        }}>
                            <Text style={{
                                fontSize: 20, fontWeight: 'bold',
                                color: colors.newprimary
                            }}>Tạo mới đơn vị phóng viên vãng lại</Text>
                            <View style={{ justifyContent: 'center' }}>
                                <TouchableOpacity onPress={() => { setIsOpenAddPressAgencyModal(false) }}>
                                    <Icon name='close' style={{ color: 'black', fontSize: 22,marginTop:-20 }} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        {/* // Detail */}
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            alwaysBounceVertical={false}
                            nestedScrollEnabled={true}
                            contentContainerStyle={styles.scrollViewContainer}>

                            <View style={{}}>

                                <Text style={styles.titleSmallHeader}>
                                    Tên đơn vị báo chí
                                </Text>
                                <TextInput
                                    style={[styles.input, {}]}
                                    onChangeText={(value) => setPressName(value)}
                                    value={pressName}
                                    multiline={true}
                                    placeholder="Nhập tên đơn vị báo chí"
                                    placeholderTextColor={'#20202088'}
                                />
                                {/* // danh sách các phóng viên tham gia vào session sẽ liệt kê ra ở đây, dùng flat list */}
                                <View style={{
                                    width: '100%',
                                    backgroundColor: COLORS.white,
                                    borderWidth: 1,
                                    borderRadius: SIZES.radius,
                                    borderColor: COLORS.gray,
                                    marginBottom: 10
                                }}>
                                    <DropdownSingleSelect
                                        items={provinceData}
                                        IconRenderer={Icon1}
                                        displayKey="name"
                                        selectText="Chọn cấp thành phố/ huyện/ thị xã"
                                        onSelectedItemsChange={onChangeProvince}
                                        selectedItems={[selectedProvinceID]}
                                        filterItems={(filter, items) => {
                                            return items.filter((item) =>
                                            item.name.toLowerCase().includes(filter.toLowerCase())
                                            );
                                        }}
                                        />
                                </View>

                                <View style={{
                                    width: '100%',
                                    backgroundColor: COLORS.white,
                                    borderWidth: 1,
                                    borderRadius: SIZES.radius,
                                    borderColor: COLORS.gray,
                                    marginBottom: 10
                                }}>
                                    <DropdownSingleSelect
                                        items={childChooseProvinceData}
                                        IconRenderer={Icon1}
                                        displayKey="name"
                                        selectText="Chọn cấp phường/ xã/ thị trấn"
                                        onSelectedItemsChange={onChangeChildProvince}
                                        selectedItems={[selectedChildProvinceID]}
                                        disabled={selectedProvinceID == 0}
                                        filterItems={(filter, items) => {
                                            return items.filter((item) =>
                                            item.name.toLowerCase().includes(filter.toLowerCase())
                                            );
                                        }}
                                    />
                                </View>
                                <Text style={styles.titleSmallHeader}>
                                    Địa chỉ*
                                </Text>
                                <TextInput
                                    style={[styles.input, {}]}
                                    onChangeText={(value) => setPressAddress(value)}
                                    value={pressAddress}
                                    multiline={true}
                                    placeholder="Nhập địa chỉ*"
                                    placeholderTextColor={'#20202088'}
                                />

                                <Text style={styles.titleSmallHeader}>
                                    Mô tả đơn vị*
                                </Text>
                                <TextInput
                                    style={[styles.input, {}]}
                                    onChangeText={(value) => setPressDesciption(value)}
                                    value={pressDesciption}
                                    multiline={true}
                                    placeholder="Nhập mô tả đơn vị*"
                                    placeholderTextColor={'#20202088'}
                                />
                            </View>
                        </ScrollView>
                        <TouchableOpacity onPress={() => {
                            showAlert({
                                title: "Thông báo",
                                message: "Bạn muốn tạo mới đơn vị này ?",
                                alertType: 'warning',
                                btnLabel: 'Đồng ý',
                                leftBtnLabel: 'Hủy',
                                onPress: () => {
                                    closeAlert()
                                    callPostAddStrangePressInstitute();
                                }
                            });
                        }}
                        style={{
                            backgroundColor: colors.newprimary,
                            borderRadius: 10,
                            alignContent: 'center',
                            justifyContent: 'center',
                            paddingVertical: 10,
                            paddingHorizontal: 10,
                            marginTop: 10,
                            flexDirection: 'row'
                        }}>
                            <Text style={{ fontSize: 20, color: 'white' }}>
                                Tạo mới đơn vị
                            </Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>
            {/* ///// PHẦN ĐĂNG KÝ LÀM VIỆC */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                alwaysBounceVertical={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.scrollViewContainer}>

                <View style={[styles.viewContainDropdown, {}]}>
                    <Text style={styles.titleSmallHeader}>
                        Chọn phóng viên vãng lai
                    </Text>
                    <View style={{ marginVertical: 10, flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{
                            width: '90%',
                            backgroundColor: COLORS.white,
                            borderWidth: 1,
                            borderRadius: SIZES.radius,
                            borderColor: COLORS.gray,
                        }}>
                            <DropdownSingleSelect
                                items={strangeJournalistData}
                                IconRenderer={Icon1}
                                displayKey="label"
                                selectText="Chọn phóng viên"
                                iconKey="icon"
                                onSelectedItemsChange={onChangeStrangeJournalist}
                                selectedItems={[selectedStrangeJournalistID]}
                                filterItems={(filter, items) => {
                                    return items.filter((item) =>
                                    item.label.toLowerCase().includes(filter.toLowerCase())
                                    );
                                }}
                                noItemsComponent={
                                    <View style={{
                                        marginTop: 30,
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}>
                                        <Image style={{ height: 100, width: 100 }}
                                            resizeMode="cover"
                                            source={require("../assets/images/nothingFound.png")} />
                                        <Text style={{
                                            color: 'black',
                                            fontWeight: 'bold',
                                            fontSize: 16
                                        }}>Hiện đang không có phóng viên vãng lai nào
                                        </Text>
                                        <Text style={{
                                            color: '#858181',
                                            fontSize: 16
                                        }}>Bạn thử tìm từ khóa khác nhé.
                                        </Text>
                                    </View>}
                                />
                        </View>
                        <View>
                            <TouchableOpacity style={{
                                alignContent: 'center',
                                justifyContent: 'center',
                                marginLeft: 5
                            }}
                                onPress={() => {
                                    openAddUserModal()
                                }}>
                                <Icon name='user-plus' style={{ color: 'black', fontSize: 30 }} />
                            </TouchableOpacity >
                        </View>
                    </View>

                    {sessionsData.length > 0 ?
                        <View style={{ marginBottom: 10, flexDirection: 'row' }}>
                            <View style={{
                                width: '90%', marginTop: 10,
                                backgroundColor: COLORS.white,
                                borderWidth: 1,
                                borderRadius: SIZES.radius,
                                borderColor: COLORS.gray,
                            }}>
                                <DropdownSingleSelect
                                items={sessionsData}
                                IconRenderer={Icon1}
                                displayKey="label"
                                selectText="Chọn buổi làm việc đang có sẵn"
                                onSelectedItemsChange={onChangeSession}
                                selectedItems={[sessionID]}
                                filterItems={(filter, items) => {
                                    return items.filter((item) =>
                                    item.label.toLowerCase().includes(filter.toLowerCase())
                                    );
                                }}
                                noItemsComponent={
                                    <View style={{
                                        marginTop: 30,
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}>
                                        <Image style={{ height: 100, width: 100 }}
                                            resizeMode="cover"
                                            source={require("../assets/images/nothingFound.png")} />
                                        <Text style={{
                                            color: 'black',
                                            fontWeight: 'bold',
                                            fontSize: 16
                                        }}>Hiện đang không có buổi làm việc có sẵn
                                        </Text>
                                        <Text style={{
                                            color: '#858181',
                                            fontSize: 16
                                        }}>Bạn thử tìm từ khóa khác nhé.
                                        </Text>
                                    </View>}
                                />
                            </View>
                            <TouchableOpacity style={{
                                alignContent: 'center',
                                justifyContent: 'center',
                                marginLeft: 10
                            }}
                                disabled={sessionID == 0}
                                onPress={() => {
                                    onChangeSession([0])
                                }}>
                                <Icon name='remove' style={{ color: 'black', fontSize: 30 }} />
                            </TouchableOpacity >
                        </View> : null}

                    {sessionID == 0 ? <View>
                        <Text style={styles.titleSmallHeader}>
                            Tiêu đề
                        </Text>
                        <TextInput
                            style={[styles.input, { height: 100 }]}
                            onChangeText={(value) => setTitle(value)}
                            value={title}
                            multiline={true}
                            placeholder="Nhập tiêu đề"
                            placeholderTextColor={'#20202088'}

                        />
                    </View> : null}
                    {/* // danh sách các phóng viên tham gia vào session sẽ liệt kê ra ở đây, dùng flat list */}
                    {sessionID != 0 ? <Text style={[styles.titleSmallHeader, { marginVertical: 10 }]}>
                        Danh sách người tham dự
                    </Text> : null}
                    {sessionID != 0 ?
                        <ScrollView
                            horizontal={true}
                            alwaysBounceHorizontal={false}
                            contentContainerStyle={{
                                width: '100%',
                                height: "auto", padding: 10, paddingTop: 16, maxHeight: 400,
                                borderRadius: 15,
                            }}
                        >
                            <FlatList
                                nestedScrollEnabled={true}
                                style={{}}
                                ref={flatListRef}
                                data={registersData}
                                renderItem={({ item }) => <RegisterItem
                                register={item} key={item.id} />}
                                keyExtractor={eachRegister => eachRegister.id}
                            />
                        </ScrollView> : null}

                    <Text style={styles.titleSmallHeader}>
                        Nội dung
                    </Text>
                    <TextInput
                        style={[styles.input, { flex: 1, }]}
                        onChangeText={(value) => setContent(value)}
                        value={content}
                        multiline={true}
                        placeholder="Nhập nội dung"
                        underlineColorAndroid='transparent'
                        placeholderTextColor={'#20202088'}
                    />
                    <Text style={styles.titleSmallHeader}>
                        File đính kèm
                    </Text>
                    <View style={{
                        flexDirection: 'row',
                        borderRadius: SIZES.radius,
                        borderColor: COLORS.gray,
                        borderWidth: 1,
                        padding: 10,
                        marginBottom: 10,
                        marginTop: 5,
                        backgroundColor: 'white'
                    }}>
                        <View style={{ flex: 1 }}>
                            <TouchableOpacity style={{
                                flexDirection: 'row',
                                backgroundColor: '#0373F3',
                                width: 100,
                                borderRadius: 10,
                                alignSelf: 'flex-end',
                                justifyContent: 'center',
                                paddingVertical: 10,
                                paddingHorizontal: 10,
                                marginBottom: 5
                            }}
                                onPress={async () => {
                                    try {
                                        const pickerResults = await DocumentPicker.pickMultiple({
                                            presentationStyle: 'fullScreen',
                                            copyTo: 'cachesDirectory',
                                            type: [types.pdf, types.images, types.doc, types.docx]
                                        })
                                        let enableChooseFile = true
                                        pickerResults.forEach(element => {
                                        if (element.type !== 'image/png' && element.type !== 'image/jpeg' 
                                        && element.type !== 'application/msword' && element.type !== 'application/pdf'
                                        && element.type != 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') { 
                                            CallCustomAlert.showAlertWith('Bạn chỉ được chọn file jpg, png, doc, docx, pdf', 'error', 'OK')
                                            enableChooseFile = false
                                        }
                                        if (element.size > 5242880 ) { 
                                            CallCustomAlert.showAlertWith('Bạn chỉ được chọn file có dung lượng dưới 5MB', 'error', 'OK')
                                            enableChooseFile = false
                                        }
                                        });
                                        enableChooseFile && setResults(pickerResults);
                                    } catch (e) {
                                        handleError(e)
                                    }
                                }}>
                                <FontAwesome name='file-text' style={{ color: 'white', fontSize: 18, marginRight: 5 }} />
                                <Text style={{ fontSize: 13, color: 'white' }}>
                                    Chọn File
                                </Text>
                            </TouchableOpacity >
                            <ScrollView
                                horizontal={true}
                                alwaysBounceHorizontal={false}
                                contentContainerStyle={{
                                    width: '100%',
                                    height: "auto", padding: 10, paddingTop: 16, maxHeight: 300, borderRadius: 15,
                                }}>
                                <FlatList
                                    nestedScrollEnabled={true}
                                    data={files}
                                    keyExtractor={(fileUri) => fileUri}
                                    renderItem={({ item: fileUri }) => (
                                        <View style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            padding: 8,
                                            margin: 4,
                                            marginTop: 5,
                                            borderRadius: 8,
                                            backgroundColor: COLORS.white,
                                            ...styles.shadow,
                                        }}>
                                            <Text style={{ fontSize: 15, color: '#000', width: '90%', }}>
                                                {fileUri.split('/').pop()}
                                            </Text>
                                            <TouchableOpacity onPress={() => deleteFile(fileUri)}>
                                                <Icon1 name='close' size={20} color={colors.newprimary} />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                />
                            </ScrollView>
                        </View>
                    </View>

                    <Text style={styles.titleSmallHeader}>
                        {sessionID == 0 ? 'Ngày đề xuất' : 'Ngày làm việc'}
                    </Text>
                    <View style={{ flexDirection: 'row', backgroundColor: 'white', borderColor: COLORS.gray, borderRadius: SIZES.radius, borderWidth: 1, padding: 10, marginTop: 5 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 16, color: '#000' }}>
                                Ngày: {dateString}
                            </Text>
                            <Text style={{ fontSize: 16, color: '#000' }}>
                                Vào lúc: {timeString}
                            </Text>
                        </View>
                        {sessionID == 0 ?
                            <View style={{ justifyContent: 'center', }}>
                                <TouchableOpacity style={{
                                    backgroundColor: '#0373F3',
                                    borderRadius: 10,
                                    alignContent: 'center',
                                    justifyContent: 'center',
                                    paddingVertical: 10,
                                    paddingHorizontal: 10,
                                    flexDirection: 'row'
                                }}
                                    onPress={() => setOpen(true)}>
                                    <Ionicons name='calendar' style={{ color: 'white', fontSize: 18, marginRight: 5 }} />
                                    <Text style={{ fontSize: 13, color: 'white' }}>
                                        Hẹn ngày
                                    </Text>
                                </TouchableOpacity >
                            </View> : null}
                    </View>
                </View>
            </ScrollView>

            <TouchableOpacity onPress={() => {
                  showAlert({
                      title: "Thông báo",
                      message: "Bạn muốn gửi đăng ký làm việc trực tiếp này ?",
                      alertType: 'warning',
                      btnLabel: 'Đồng ý',
                      leftBtnLabel: 'Hủy',
                      onPress: () => {
                          closeAlert()
                          callPostWorkRegistration();
                      }
                  });
              }}
            style={{
                backgroundColor: colors.newprimary,
                borderRadius: 10,
                alignContent: 'center',
                justifyContent: 'center',
                paddingVertical: 10,
                paddingHorizontal: 10,
                margin: 20,
                marginTop: 0,
                flexDirection: 'row'
            }}>
                <Text style={{ fontSize: 20, color: 'white' }}>
                    Gửi đăng ký
                </Text>
            </TouchableOpacity >
        </SafeAreaView>
    );
};

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
    },
    headerTitle: { color: '#000', fontWeight: 'bold', fontSize: 16 },
    saveAreaViewContainer: {
        flex: 1,
    },
    scrollViewContainer: {
        flexGrow: 1,
    },
    titleSmallHeader: {
        ...FONTS.h3,
        fontWeight: 'bold',
        color: 'black'
    },
    viewContainDropdown: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 20
    },
    input: {
        height: 'auto',
        width: '100%',
        maxHeight:300,
        borderColor: COLORS.gray,
        borderWidth: 1,
        padding: 10,
        borderRadius: 10,
        fontSize: 16,
        marginVertical: 10,
        textAlignVertical: 'top',
        color: 'black',
        backgroundColor: 'white'
    },
    iconChoosePhoto: {
        opacity: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#fff',
        borderRadius: 10,
    },
});
export default WorkRegisterForJounalist