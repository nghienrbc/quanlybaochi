import React, { useState, useEffect } from "react";
import {
    Text, 
    View, 
    TouchableOpacity,
    ScrollView, 
    SafeAreaView, 
    FlatList,
    StatusBar, 
    StyleSheet, 
    PermissionsAndroid, 
    Modal
} from 'react-native'
import CheckBox from '@react-native-community/checkbox';

import DocumentPicker, {
    DirectoryPickerResponse,
    DocumentPickerResponse,
    isInProgress,
    types,
} from 'react-native-document-picker'

import { COLORS, FONTS, SIZES, colors, string } from '../constants'
import Icon from 'react-native-vector-icons/FontAwesome'

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker'

import { requireinfo as requireinfoRepo, notifications as notificationsRepo } from "../repositories"
import { convertDateTimeToDateString, convertDateTimeToTimeString, convertDateToDateTimeString } from "../utilies/DateTime"
import { getMyStringValue } from "../utilies/LocalDataHandler"
import BottomPopup from '../Component/BottomPopup'

import { showAlert, closeAlert } from "react-native-customisable-alert";

import { CallCustomAlert } from "../utilies";
import AppLoader from '../utilies/AppLoader';
import CustomScrollView from '../Component/CustomScrollView';
import RNFetchBlob from "rn-fetch-blob";
import RequireInofConfirmItem from "./item/RequireInofConfirmItem";
import DocumentItem from "./item/DocumentItem";

function RequireInfoEditScreen(props) {
    //navigation
    const { navigation, route } = props
    //functions of navigate to/back
    const { navigate, goBack } = navigation
    const [showLoading, setShowLoading] = useState(false)

    const HandleType = {
        Cancel: 0, Confirm: 1, ChangeTime: 2, HadResponsed: 3
    }

    const [response, setResponse] = useState(null)
    const [date, setDate] = useState(new Date())
    const [open, setOpen] = useState(false)

    const [isChangeDate, setIsChangeDate] = useState(false)
    const [isJournalist, setIsJournalist] = useState(false)
    const [isManage, setIsManage] = useState(false)
    // const [reasonString, setReasonString] = useState('') // dư 
    const [responseDate, setResponseDate] = useState()
    const [resDateString, setResDateString] = useState('')
    const [resTimeString, setResTimeString] = useState('')

    const [instituteID, setInstituteID] = useState(0); // lưu id CQNN 

    // CÁC GIÁ TRỊ SẼ GỬI LÊN POST API APOITMENT WORK  
    const [tokenString, setTokenString] = useState('')
    const [sessionTime, setSessionTime] = useState();
    const [resContentString, setResContentString] = useState('')
    const [reqContentString, setReqContentString] = useState('')
    const [isChangeContent, setIsChangeContent] = useState('')
    const [isSelected, setSelection] = useState(false);
    const [isShowCofirmDetailPopup, setIsShowCofirmDetailPopup] = useState(false);

    const [requireInfos, setRequireInfos] = useState([]) // MẢNG LƯU DANH SÁCH CÁC phản hồi
    const [selectedConfimDetail, setSelectedConfirmDetail] = useState(null);

    var filePath = ''
    var fileName = ''

    const flatListRef = React.useRef()
    const docFlatListRef = React.useRef()

    ///////////////// ASYGN STORAGE ///////////////////////
    const [userID, setUserID] = useState('')
    const [userTypeID, setUserTypeID] = useState('')
    getMyStringValue("token").then((value) => {
        const data = value;
        setTokenString(data)
    })
    getMyStringValue("userTypeID").then((value) => {
        const data = value;
        setUserTypeID(data)
        setIsManage(data == 2)
        setIsJournalist(data == 7)
    })
    getMyStringValue("userID").then((value) => {
        const data = value;
        setUserID(data)
    })

    ////////////////// GET VALUE FROM NAVIGATION ////////////
    let requireInfoItem = route.params.requireInfoItem
    var { requireObject, id, agency, title, time, content, status, senderName, notifyId, notifyView } = requireInfoItem

    ////////////////// NAVIGATION OPTION ////////////////////
    useEffect(() => {
        debugger
        navigation.setOptions(
            {
                headerShown: true,
                headerTitle: 'Thông tin công việc',//status,
                headerTitleStyle: { fontSize: 20, fontWeight: 'bold' },
                headerTitleAlign: 'center',
                headerStyle: {
                    backgroundColor: colors.newprimary
                },
                headerTintColor: 'white'
            })

        setReqContentString(requireObject.content != null ? requireObject.content : '')
        setRequestFileName(requireObject.document != null ? requireObject.document : [])
        setRequireInfos(requireObject.confirm)
        // lấy tên session 
        setInstituteID(requireObject.institute.id)
    }, [])

    useEffect(() => {
        if (tokenString != '') {
            // lấy danh sách các session của 1 CQNN, để CQNN có thể add đăng ký này vào 1 session khác
            if (notifyView == null) {
                setShowLoading(true)
                notificationsRepo.getUpdateViewNotify(tokenString, notifyId).then(
                    responseSessions => {
                        debugger
                        setShowLoading(false)
                    })
                    .catch(
                        errorMessage => {
                            setShowLoading(false)
                            if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
                        }
                    )
            }
        }
    }, [tokenString])

    useEffect(() => {
        //debugger
        if (responseDate != null) {
            setResDateString(convertDateTimeToDateString(responseDate));
            setResTimeString(convertDateTimeToTimeString(responseDate));
        }
    }, [responseDate])

    useEffect(() => {
        //debugger
        if (isChangeDate) {
            setResDateString(convertDateTimeToDateString(date));
            setResTimeString(convertDateTimeToTimeString(date));
        }
    }, [date])

    /////////////////// xữ lý danh sách các phản hồi để hiển thị lên flatlist //////////////////
    let requireInfosData = []
    requireInfos.length > 0 && requireInfos.forEach(element => {
        //debugger
        let requireInfoObj = {
            "id": element.id,
            "content": element.content,
            "apointment": element.apointment,
            "apointmentDate": element.apointmentDate,
            "createdAt": element.createdAt, // ngày phản hồi
            "document": element.document
        }
        requireInfosData.push(requireInfoObj)
    })

    let docummentCofirmData = []
    selectedConfimDetail != null && selectedConfimDetail.document != null && selectedConfimDetail.document.forEach(element => {
        //debugger
        let documentObj = {
            "file_name": element.file_name,
            "file_path": element.file_path,
            "file_type": element.file_type,
            "file_origin": element.file_origin,
        }
        docummentCofirmData.push(documentObj)
    })

    ////////////////////// BOTTOM POPUP /////////////////////
    let popupRef = React.createRef()
    const onShowPopup = () => {
        popupRef.showPopup()
    }
    const onClosePopupWhenTouchOutside = () => {
        popupRef.closePopup()
    }

    //////////////////// HUY DANG KY ///////////////////
    const onClosePopupAndPostData = () => {
        //console.warn(popupRef.state.reasonString)
        //setReasonString(popupRef.state.reasonString || "")
        if (popupRef.state.reasonString != '') {
            popupRef.closePopup()
            // post data to api 
            callDeleteRequireInfo()
        }
        else {
            // thông báo chưa nhập lý do hủy
            CallCustomAlert.showAlertWith("Chưa nhập lý do Hủy đề nghị", 'error', 'OK')
        }
    }
    const onClosePopupWhenCancel = () => {
        //console.warn(popupRef.state.reasonString)
        popupRef.closePopup()
    }

    ////////////////// CLICK VÀO NÚT HẸN LẠI ////////////////////
    const onConfirmRequireInfo = () => {
        debugger
        if (resContentString == null || resContentString == '') {
            CallCustomAlert.showAlertWith("Chưa nhập nội dung phản hồi", 'error', 'OK')
            return
        }
        if (responseFileUri.length > 5) {
            CallCustomAlert.showAlertWith("Chỉ có thể gởi lại tối đa là 5 files", 'error', 'OK')
          }
        if (isSelected == true) {
            // nếu chọn hẹn cung câp thông tin trực tiếp mà chưa chon thoi gian
            if (resDateString == '') CallCustomAlert.showAlertWith("Chưa chọn thời gian làm việc", 'error', 'OK')
            else {
                let timeToShow = resDateString
                timeToShow += ' '
                timeToShow += resTimeString
                //console.warn(sessionId)
                let timestamp = new Date(date).getTime()
                showAlert({
                    title: "Hẹn làm việc",
                    message: "Thời gian làm việc: " + timeToShow,
                    alertType: 'warning',
                    btnLabel: 'Đồng ý',
                    leftBtnLabel: 'Hủy',
                    onPress: () => {
                        closeAlert()
                        requireinfoRepo.postConfirmRequireInfo(tokenString, requireObject.id, resContentString, isSelected,
                            timestamp, 1, responseFileUri)
                            .then(
                                responseWork => {
                                    setResponse(responseWork)
                                    // hien thi thong bao ca xac nhan
                                    setShowLoading(false)
                                    showAlert({
                                        title: "Thông báo",
                                        message: "Đã phản hồi yêu cầu cung cấp thông tin",
                                        alertType: 'success',
                                        btnLabel: 'OK',
                                        onPress: () => {
                                            closeAlert()
                                            navigation.goBack()
                                        }
                                    })
                                }
                            )
                            .catch(
                                errorMessage => {
                                    debugger
                                    setShowLoading(false)
                                    if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
                                }
                            )
                    },
                });
            }
        }
        else {
            // show confirm popup, neu dong y hen lai thi call API  
            requireinfoRepo.postConfirmRequireInfo(tokenString, requireObject.id, resContentString, null,
                null, 1, responseFileUri)
                .then(
                    responseWork => {
                        setResponse(responseWork)
                        // hien thi thong bao ca xac nhan
                        setShowLoading(false)
                        showAlert({
                            title: "Thông báo",
                            message: "Đã phản hồi yêu cầu cung cấp thông tin",
                            alertType: 'success',
                            btnLabel: 'OK',
                            onPress: () => {
                                closeAlert()
                                navigation.goBack()
                            }
                        })
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
    }

    ////////////////// nhấn nút hoàn thành /////////////////////
    const onFinishWorking = () => {

    }
    /////////////////////// FUNCTION ///////////////////////////
    /////////////////////// CALL API ///////////////////////////
    const callDeleteRequireInfo = () => {
        if (tokenString != '') {
            debugger
            setShowLoading(true)
            requireinfoRepo.postConfirmRequireInfo(tokenString, requireObject.id, popupRef.state.reasonString, null,
                null, 0, null)
                .then(
                    responseWork => {
                        setResponse(responseWork)
                        // hien thi thong bao ca xac nhan
                        setShowLoading(false)
                        showAlert({
                            title: "Thông báo",
                            message: "Đã Hủy đề nghị yêu cầu thông tin",
                            alertType: 'success',
                            btnLabel: 'OK',
                            onPress: () => {
                                closeAlert()
                                navigation.goBack()
                            }
                        })
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
    }
    const handleDeletePress = () => {
        if (tokenString != '') {
            debugger
            setShowLoading(true)
            requireinfoRepo.deleteRequireInfoJournalist(tokenString, requireObject.id)
            .then(
                responseWork => {
                    setResponse(responseWork)
                    // hien thi thong bao ca xac nhan
                    setShowLoading(false)
                    showAlert({
                        title: "Thông báo",
                        message: "Đã Xóa đề nghị yêu cầu thông tin",
                        alertType: 'success',
                        btnLabel: 'OK',
                        onPress: () => {
                            closeAlert()
                            navigation.goBack()
                        }
                    })
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
    };
    //////////////// CHOOSE FILE FROM DEVICE ////////////////////  

    useEffect(() => {
        if (requestFileResult == null) return
        //console.warn(JSON.stringify(result[0].fileCopyUri, null, 2))
        if (JSON.stringify(requestFileResult[0].fileCopyUri, null, 2) != '') {
            setRequestFileUri(requestFileResult[0].fileCopyUri)
        }
    }, [requestFileResult])

    useEffect(() => {
        if (responseFileResult == null) return
        //console.warn(JSON.stringify(result[0].fileCopyUri, null, 2))
        if (JSON.stringify(responseFileResult[0].fileCopyUri, null, 2) != '') {
            setResponseFileUri(responseFileResult[0].fileCopyUri)
        }
    }, [responseFileResult])


    //////////////////// XỮ LÝ DOWNLOAD FILE ///////////////////// 
    // Function to check the platform
    // If Platform is Android then check for permissions.
    const checkPermission = async () => {
        debugger
        if (Platform.OS === 'ios') {
            downloadFile(filePath, fileName);
        } else {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission Required',
                        message:
                            'Application needs access to your storage to download File',
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    // Start downloading
                    downloadFile(filePath, fileName);
                    console.log('Storage Permission Granted.');
                } else {
                    // If permission denied then show alert
                    Alert.alert('Error', 'Storage Permission Not Granted');
                }
            } catch (err) {
                // To handle permission related exception
                console.log("++++" + err);
            }
        }
    };
    const downloadFile = (filePath, fileName) => {
        // Get today's date to add the time suffix in filename
        debugger
        let date = new Date();
        let FILE_URL = string.FILEURL + filePath + "/" + fileName;
        // Function to get extention of the file url
        let file_ext = getFileExtention(FILE_URL);
        file_ext = '.' + file_ext[0];
        // config: To get response by passing the downloading related options
        // fs: Root directory path to download
        const { config, fs } = RNFetchBlob;
        let RootDir = fs.dirs.PictureDir;
        let options = {
            fileCache: true,
            addAndroidDownloads: {
                path:
                    RootDir +
                    '/file_' +
                    Math.floor(date.getTime() + date.getSeconds() / 2) +
                    file_ext,
                description: 'downloading file...',
                notification: true,
                // useDownloadManager works with Android only
                useDownloadManager: true,
            },
        };
        config(options)
            .fetch('GET', FILE_URL)
            .then(res => {
                // Alert after successful downloading
                console.log('res -> ', JSON.stringify(res));
                alert('File Downloaded Successfully.');
            });
    };
    const getFileExtention = fileUrl => {
        // To get the file extension
        return /[.]/.exec(fileUrl) ?
            /[^.]+$/.exec(fileUrl) : undefined;
    };
    /////////////// XỮ LÝ UPLOAD FILE //////////////////////////// 
    const [requestFileName, setRequestFileName] = useState([]);
    const [responseFileName, setResponseFileName] = useState([]);
    const [isChangeReqFile, setIsChangeReqFile] = useState(false)
    const [isChangeResFile, setIsChangeResFile] = useState(false)

    //////////////// CHOOSE INVITE FILE FROM DEVICE ////////////////////
    const [requestFileUri, setRequestFileUri] = useState([]);
    const [requestFileResult, setRequestFileResult] = React.useState(null)

    useEffect(() => {
        if (requestFileResult == null) return;
        const newFileUris = requestFileResult.map((result) => result.fileCopyUri); 
        setRequestFileUri((prevUri) => prevUri.concat(newFileUris.filter((item) => {
            let result = true
            prevUri.filter((prevUriItem) => {if (prevUriItem.split('/').pop() == item.split('/').pop()) result = false; })     
            return result
          }))) 
    }, [requestFileResult]);

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

    const deleteFile = (fileUri) => {
        setRequestFileUri((prevFiles) => prevFiles.filter((uri) => uri !== fileUri));
    };
    //////////////// CHOOSE SESSION FILE FROM DEVICE //////////////////// 
    const [responseFileUri, setResponseFileUri] = useState([]);
    const [responseFileResult, setResponseFileResult] = React.useState(null)

    useEffect(() => {
        if (responseFileResult == null) return;
        const newFileUris = responseFileResult.map((result) => result.fileCopyUri); 
        setResponseFileUri((prevUri) => prevUri.concat(newFileUris.filter((item) => {
            let result = true
            prevUri.filter((prevUriItem) => {if (prevUriItem.split('/').pop() == item.split('/').pop()) result = false; })     
            return result
          }))) 
    }, [responseFileResult]);

    const deleteReponseFile = (fileUri) => {
        setResponseFileUri((prevFiles) => prevFiles.filter((uri) => uri !== fileUri));
    };

    ///////////////////// LAYOUT RENDER ///////////////////////////////////
    return (
        <SafeAreaView style={styles.saveAreaViewContainer}>
            {showLoading ? <AppLoader /> : null}
            <DatePicker
                title="Chọn ngày và giờ"
                modal
                open={open}
                date={date}
                onConfirm={(date) => {
                    setIsChangeDate(true)
                    setOpen(false)
                    setDate(date)
                }}
                onCancel={() => {
                    setOpen(false)
                }}
                mode="datetime"
                theme="auto"
            />
            <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
            <BottomPopup
                ref={(target) => popupRef = target}
                title="Hủy đề nghị cung cấp thông tin này"
                onTouchOutside={onClosePopupWhenTouchOutside}
                onTouchOKButton={onClosePopupAndPostData}
                onTouchCancelButton={onClosePopupWhenCancel}
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                alwaysBounceVertical={false}
                contentContainerStyle={styles.scrollViewContainer}>
                {status == 'Hủy đề nghị' ? <View style={[styles.viewContainAllInfo, { backgroundColor: colors.warning, paddingVertical: 5 }]}>
                    <Text style={styles.titleInfo}>
                        Yêu cầu cung cấp thông tin đã hủy bởi:
                    </Text>
                    <Text style={[styles.contentInfo, { color: 'white', fontWeight: 'bold', marginTop: -7 }]}>
                        {requireObject.confirm[0].senderconfim.givenName}
                    </Text>
                    <Text style={styles.titleInfo}>
                        Lý do:
                    </Text>
                    <Text style={[styles.contentInfo, { color: 'white', fontWeight: 'bold', marginTop: -7 }]}> {requireObject.confirm[0].content}</Text>
                </View> : null}

                {/* modal view hiển thị chi tiết phản hồi thông tin từ cơ quan nhà nước với các thông tin:
                - nội dung phản hồi, danh sách file phản hồi, ngày giờ phản hồi */}
                <Modal
                    transparent={true}
                    visible={isShowCofirmDetailPopup}
                >
                    <View 
                        style={{
                            backgroundColor: '#000000aa', flex: 1,
                            height: 'auto', maxHeight: SIZES.height
                        }}>
                        <View 
                            style={{
                                backgroundColor: 'white', margin: 20,
                                padding: 10, borderRadius: 10,
                                height: 'auto', maxHeight: SIZES.height -50
                            }}>
                            {/* // header */}
                            <View style={{
                                flexDirection: 'row', marginBottom: 10,
                                justifyContent: 'space-between',
                            }}>
                                <Text style={{
                                    fontSize: 22, fontWeight: 'bold',
                                    color: colors.newprimary,
                                }}>Chi tiết phản hồi</Text>
                                <TouchableOpacity onPress={() => { setIsShowCofirmDetailPopup(false) }}>
                                    <Icon name='close' style={{ color: 'black', fontSize: 22 }} />
                                </TouchableOpacity>
                            </View>
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                alwaysBounceVertical={false}
                                contentContainerStyle={styles.scrollViewContainer}>
                                {/* // Detail */}
                                {selectedConfimDetail != null ? <View>
                                    <Text style={styles.titleInfo}>Nội dung phản hồi:</Text>
                                    <CustomScrollView
                                        style={[styles.input]}
                                        value={selectedConfimDetail.content}
                                        placeholder=" "
                                        editable={false}
                                    />
                                    <Text style={[styles.titleInfo, { marginTop: 10 }]}>Thời gian phản hồi:
                                        <Text style={styles.contentInfo}> {convertDateToDateTimeString(selectedConfimDetail.createdAt)}</Text>
                                    </Text>
                                    {selectedConfimDetail.apointmentDate ? <Text style={styles.titleInfo}>Thời gian hẹn cung cấp thông tin:</Text> : null}
                                    {selectedConfimDetail.apointmentDate ? <Text style={styles.contentInfo}>{
                                        convertDateToDateTimeString(new Date(parseInt(selectedConfimDetail.apointmentDate)))
                                    }</Text> : null}

                                    {selectedConfimDetail.document != null ? <Text style={[styles.titleInfo, { marginTop: 10 }]}>File đính kèm</Text> : null}
                                    {selectedConfimDetail.document != null ?
                                        <ScrollView 
                                            horizontal={true}
                                            alwaysBounceHorizontal={false}
                                            contentContainerStyle={{
                                                width: '100%',
                                                height: "auto", maxHeight: 250,
                                                borderRadius: 15,
                                            }}>
                                            <FlatList
                                                nestedScrollEnabled={true}
                                                ref={docFlatListRef}
                                                data={docummentCofirmData}
                                                renderItem={({ item }) => <DocumentItem
                                                    onPress={() => {
                                                        debugger
                                                        // download file
                                                        filePath = item.file_path
                                                        fileName = item.file_name
                                                        checkPermission()
                                                    }}
                                                    documentItem={item} key={item.file_name} />}
                                                keyExtractor={eachRegister => eachRegister.file_name}
                                            />
                                        </ScrollView>
                                        : null}
                                </View> : null}
                            </ScrollView>

                        </View>
                    </View>
                </Modal>

                <View style={styles.viewHeader}>
                    <Text style={styles.titleHeader}>
                        Chi tiết đề nghị cung cấp thông tin
                    </Text>
                </View>
                <View style={styles.viewContainAllInfo}>
                    {!isJournalist ? <View style={{ marginBottom: 3, paddingBottom: 3 }}>
                        <Text style={styles.titleInfo}>
                            Người đề nghị:
                            <Text style={styles.contentInfo}> {senderName}</Text>
                        </Text>
                    </View> : null}
                    {!isJournalist ? <View style={{ marginBottom: 3, paddingBottom: 3 }}>
                        <Text style={styles.titleInfo}>
                            Đơn vị đề nghị:
                            <Text style={styles.contentInfo}> {agency}</Text>
                        </Text>
                    </View> : null}

                    {isJournalist ? <View style={{ marginBottom: 3, paddingBottom: 3 }}>
                        <Text style={styles.titleInfo}>
                            Đơn vị cung cấp thông tin:
                            <Text style={styles.contentInfo}> {agency}</Text>
                        </Text>
                    </View> : null}

                    <Text style={styles.titleInfo}>
                        Tiêu đề:
                    </Text>
                    <CustomScrollView
                        style={[styles.input, { flex: 1,backgroundColor:COLORS.background }]}
                        value={title}
                        placeholder="Tiêu đề"
                        editable={false}
                    />
                    <Text style={styles.titleInfo}>
                        Nội dung:
                    </Text>
                    <CustomScrollView
                        style={[
                            styles.input,
                            (status === 'Chờ phản hồi'|| status === 'Đã phản hồi'|| status === 'Hủy đề nghị') ? { backgroundColor: COLORS.background } : null,
                          ]}
                        value={reqContentString}
                        placeholder="Nội dung"
                        editable={false}
                        onChangeText={(value) => {
                            setReqContentString(value)
                            setIsChangeContent(true)
                        }}
                    />
                    {/*/////////// PHONG VIEN - CHỌN FILE TẢI LÊN ////////////*/}
                    {requestFileName && requestFileName.length > 0 ? <View>
                        <Text style={styles.titleInfo}>
                            File Đính kèm:
                        </Text>
                        {/* // nếu tk là phóng viên hoặc buổi làm việc đã hoàn thành hoặc hủy thì hiển thị lên text và nút download*/}
                        <ScrollView
                            horizontal={true}
                            alwaysBounceHorizontal={false}
                            contentContainerStyle={{
                                width: '100%',
                                height: "auto", padding: 10, paddingTop: 16, maxHeight: 300, borderRadius: 15,
                            }}>
                            <FlatList
                                data={requestFileName}
                                keyExtractor={(fileUri) => fileUri.file_origin}
                                renderItem={({ item: fileUri }) => (
                                    <View style={{
                                        flexDirection: 'row', justifyContent: 'space-between', padding: 8, margin: 4, marginTop: 5,
                                        borderRadius: 8, backgroundColor: COLORS.white, ...styles.shadow,
                                    }}>
                                        <Text style={{ fontSize: 15, color: '#000', width: '90%' }}>
                                            {fileUri.file_origin}
                                        </Text>
                                        <TouchableOpacity onPress={() => {
                                            debugger
                                            filePath = fileUri.file_path
                                            fileName = fileUri.file_name
                                            checkPermission()
                                        }}>
                                            <Icon name='download' size={20} color={colors.newprimary} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                        </ScrollView>
                    </View> : null}

                </View>

                {/* ////////////////// hiển thị các lần phản hồi trước /////////////////// */}
                {status != 'Hủy đề nghị' && requireInfosData.length > 0 ? <View style={styles.viewHeader}>
                    <Text style={styles.titleHeader}>
                        Danh sách các lần phản hồi đề nghị
                    </Text>
                </View> : null}

                {status != 'Hủy đề nghị' && requireInfosData.length > 0 ?
                    <View style={styles.viewContainAllInfo}>
                        <ScrollView
                            horizontal={true}
                            alwaysBounceHorizontal={false}
                            contentContainerStyle={{
                                width: '100%',
                                height: "auto", padding: 10,
                                paddingTop: 16, maxHeight: 400,
                                borderRadius: 15,
                            }}>
                            <FlatList
                                nestedScrollEnabled={true}
                                style={{}}
                                ref={flatListRef}
                                data={requireInfosData}
                                renderItem={({ item }) => <RequireInofConfirmItem
                                    onPress={() => {
                                        setIsShowCofirmDetailPopup(true)
                                        setSelectedConfirmDetail(item)
                                    }}
                                    requireInfo={item} key={item.id} />}
                                keyExtractor={eachRegister => eachRegister.id}
                            />
                        </ScrollView></View>
                    : null}

                {/* ////////////////// PHẦN CƠ QUAN NHÀ NƯỚC /////////////////// */}
                {!isJournalist && !isManage && status != 'Hủy đề nghị' ? <View style={styles.viewHeader}>
                    <Text style={styles.titleHeader}>
                        Phản hồi đề nghị cung cấp thông tin
                    </Text>
                </View> : null}

                {!isJournalist && !isManage && status != 'Hủy đề nghị' ? <View style={styles.viewContainAllInfo}>

                    {/* tiêu đề buổi làm việc của CQNN được sử dụng làm tên session */}
                    <View style={{ flexDirection: 'row', alignContent: 'center', alignItems: 'center' }}>
                        <Text style={styles.titleInfo}>
                            Nội dung phản hồi:
                        </Text>
                    </View>
                    <CustomScrollView
                        style={styles.input}
                        value={resContentString}
                        selectTextOnFocus={true}
                        placeholder="Nội dung phản hồi"
                        editable={!isJournalist}
                        onChangeText={(value) => {
                            setResContentString(value)
                            setIsChangeContent(true)
                        }}
                    />
                    {/*///////// HIỂN THỊ TÊN FILE VÀ NUT DOWNLOAD NẾU LÀ USER PHÓNG VIÊN ///////////*/}
                    <View>
                    <View style={{ flexDirection: 'row', alignContent: 'center', alignItems: 'center' }}>
                        <Text style={styles.titleInfo}>
                            File Đính kèm:
                            {/* // nếu tk là CQNN thì hiển thị lên text và nút download*/}
                            {(isJournalist || status == 'Hủy đề nghị') ?
                                <Text style={styles.contentInfo}> {responseFileName}</Text> : null}
                        </Text>
                        {(isJournalist && responseFileName != '' && status != 'Hủy đề nghị') ? <TouchableOpacity onPress={() => {
                            filePath = requireObject.responseDocument.file_path
                            fileName = requireObject.responseDocument.file_name
                            checkPermission()
                        }}>
                            <Icon name='download' style={{ color: colors.newprimary, fontSize: 20, margin: -10 }} />
                        </TouchableOpacity> : null}
                    </View>
                    {/*//////////// hiển thị chọn file nếu user là cơ quan nhà nước ///////////*/}

                    {(!isJournalist && status != 'Hủy đề nghị') ?
                        <View style={{
                            flexDirection: 'row', borderRadius: 10, backgroundColor: 'white', borderColor: COLORS.gray, borderWidth: 1,
                            padding: 10, marginBottom: 10, marginTop: 5
                        }}>
                            <View style={{ flex: 1 }}>
                            {!isManage &&
                                <TouchableOpacity style={{
                                    backgroundColor: '#0373F3', width: 100, borderRadius: 10,
                                    alignSelf: 'flex-end', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 10, flexDirection: 'row',
                                    marginBottom: 5,
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
                                            enableChooseFile && setResponseFileResult(pickerResults)
                                            enableChooseFile && setIsChangeResFile(true)
                                        } catch (e) {
                                            handleError(e)
                                        }
                                    }}>
                                    <FontAwesome name='file-text' style={{ color: 'white', fontSize: 16, marginRight: 5 }} />
                                    <Text style={{ fontSize: 12, color: 'white' }}>
                                        Chọn File
                                    </Text>
                                </TouchableOpacity>}
                                <ScrollView
                                    horizontal={true}
                                    alwaysBounceHorizontal={false}
                                    contentContainerStyle={{
                                        width: '100%',
                                        height: "auto", padding: 10, paddingTop: 16, maxHeight: 300, borderRadius: 15,
                                    }}>
                                    <FlatList
                                        data={responseFileUri}
                                        keyExtractor={(fileUri) => fileUri}
                                        renderItem={({ item: fileUri }) => (
                                            <View style={{
                                                flexDirection: 'row', justifyContent: 'space-between', padding: 8, margin: 4, marginTop: 5,
                                                borderRadius: 8, backgroundColor: COLORS.white, ...styles.shadow,
                                            }}>
                                                <Text style={{ fontSize: 15, color: '#000', width: '90%' }}>
                                                    {fileUri.split('/').pop()}
                                                </Text>
                                                <TouchableOpacity onPress={() => deleteReponseFile(fileUri)}>
                                                    <Icon name='close' size={20} color={colors.newprimary} />
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    />
                                </ScrollView>
                            </View>
                        </View> : null}
                        </View>
                    {/* /////////////// thời gian phản hồi ///////////////////// //!isJournalist &&*/}
                    {!isManage &&                            
                    <View style={{
                        flexDirection: 'row',
                        alignContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Text style={{
                            ...FONTS.h3,
                            fontWeight: 'bold',
                            color: 'black'
                        }}>
                            Hẹn cung cấp đầy đủ thông tin trực tiếp:
                        </Text>
                        <CheckBox
                            value={isSelected}
                            onValueChange={setSelection}
                            style={{ alignSelf: 'center', marginRight: 20 }}
                        />
                    </View>}

                    {isSelected ? <View>
                        {(status != 'Hủy đề nghị' && !isJournalist) ?
                            <View style={{
                                flexDirection: 'row',
                                borderColor: COLORS.gray,
                                borderRadius: SIZES.radius,
                                borderWidth: 1,
                                padding: 10,
                                backgroundColor: 'white'
                            }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 16, color: '#000' }}>
                                        Ngày: {resDateString}
                                    </Text>
                                    <Text style={{ fontSize: 16, color: '#000' }}>
                                        Vào lúc: {resTimeString}
                                    </Text>
                                </View>

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
                                        <Ionicons name='calendar' style={{ color: 'white', fontSize: 20, marginRight: 10 }} />
                                        <Text style={{ fontSize: 14, color: 'white' }}>
                                            Chọn ngày
                                        </Text>
                                    </TouchableOpacity >
                                </View>
                            </View> : null}
                    </View> : null}

                </View> : null}
            </ScrollView>

            {/* CÁC BUTTON HỦY, HẸN LẠI, XÁC NHẬN  */}
            {!isManage && status != 'Hủy đề nghị' ? <View style={{
                flexDirection: 'row', justifyContent: 'center',
                paddingHorizontal: 5, backgroundColor: 'white'
            }}>
                {!isJournalist ? <TouchableOpacity style={[styles.touchOpacity, { backgroundColor: colors.cancel,flex:1}]}
                    onPress={onShowPopup}
                >
                    <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>
                        Hủy
                    </Text>
                </TouchableOpacity> : null}
                {isJournalist && status === 'Chờ phản hồi' && (
                 <TouchableOpacity style={[styles.touchOpacity, { backgroundColor: colors.cancel,flex:1}]}
                 onPress={() => {
                    showAlert({
                        title: "Thông báo",
                        message: "Bạn muốn Xóa đề nghị cung cấp thông tin này? (thao tác này không thể hoàn tác)",
                        alertType: 'warning',
                        btnLabel: 'Đồng ý',
                        leftBtnLabel: 'Hủy',
                        onPress: () => {
                            closeAlert();
                            handleDeletePress();
                        },
                    });
                }}
                >
                    <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>
                        Xóa đề nghị
                    </Text>
                </TouchableOpacity> 
                )}
                {/* // nếu có sự thay đổi ngày làm việc và công việc đó không do phóng viên chọn từ session có sẵn và công việc đó không bị bên cqnn thêm vào một session khác   */}
                {!isJournalist ? <TouchableOpacity style={[styles.touchOpacity, { backgroundColor: colors.waitConfirm,flex:1}]}
                    onPress={() => {
                        showAlert({
                            title: "Thông báo",
                            message: "Bạn muốn phản hồi thông tin này ?",
                            alertType: 'warning',
                            btnLabel: 'Đồng ý',
                            leftBtnLabel: 'Hủy',
                            onPress: () => {
                                closeAlert()
                                onConfirmRequireInfo();
                            }
                        });
                    }}
                >
                    <Text style={{ fontSize: 16, color: 'white',fontWeight:'bold' }}>
                        Phản hồi
                    </Text>
                </TouchableOpacity > : null}
            </View> : null}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    viewContainAllInfo: {
        padding: 10,
        margin: 15,
        borderRadius: SIZES.radius,
        backgroundColor: COLORS.background,
        shadowColor: "#000",
        shadowOffset: {
            width: 6,
            height: 6,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 4,
    },
    titleInfo: {
        ...FONTS.h3,
        fontWeight: 'bold',
        color: 'black',
        marginRight: 20,
        textAlignVertical: 'center',
        marginBottom: 3,
        paddingBottom: 3,
    },
    contentInfo: {
        ...FONTS.h3,
        color: COLORS.primary,
        marginBottom: 3,
        paddingBottom: 3,
        marginLeft: 10
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
    headerTitle: { color: '#000', fontWeight: 'bold', fontSize: 16 },
    saveAreaViewContainer: { flex: 1, backgroundColor: '#FFF' },
    scrollViewContainer: {
        flexGrow: 1,
        backgroundColor: '#FFF'
    },
    viewHeader: {
        justifyContent: 'center',
        backgroundColor: 'white'
    },
    titleHeader: {
        ...FONTS.h2,
        fontWeight: 'bold',
        marginLeft: 20,
        color: colors.newprimary,
        marginTop: 20,
    },
    input: {
        height: 'auto',
        // maxHeight: 200,
        width: '100%',
        borderColor: COLORS.gray,
        borderWidth: 1,
        padding: 10,
        borderRadius: 10,
        fontSize: 16,
        marginVertical: 10,
        // textAlignVertical: 'top',
        color: 'black',
        backgroundColor: 'white'
    },
    touchOpacity: {
        backgroundColor: colors.newprimary,
        borderRadius: 10,
        alignContent: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        flexDirection: 'row',
        margin: 5
    },
});
export default RequireInfoEditScreen