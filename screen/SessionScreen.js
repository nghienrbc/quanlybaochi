import React, { useState, useEffect } from "react";
import {
    Text, 
    View, 
    TouchableOpacity,
    ScrollView, 
    SafeAreaView, 
    FlatList, 
    Switch,
    StatusBar,
    StyleSheet, 
    PermissionsAndroid
} from 'react-native'

import DocumentPicker, {
    DirectoryPickerResponse,
    DocumentPickerResponse,
    isInProgress,
    types,
} from 'react-native-document-picker'

import { COLORS, FONTS, SIZES, colors, string } from '../constants'

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon1 from 'react-native-vector-icons/FontAwesome'
import DatePicker from 'react-native-date-picker'

import { sessions as sessionsRepo } from "../repositories"
import { convertDateTimeToDateString, convertDateTimeToTimeString } from "../utilies/DateTime"
import { getMyStringValue } from "../utilies/LocalDataHandler"
import BottomPopup from '../Component/BottomPopup'

import { showAlert, closeAlert } from "react-native-customisable-alert";

import { CallCustomAlert } from "../utilies";
import AppLoader from '../utilies/AppLoader';
import CustomScrollView from '../Component/CustomScrollView';

import RNFetchBlob from "rn-fetch-blob";
import RegisterItem from "./RegisterItem";

function SessionScreen(props) {
    //navigation
    const { navigation, route } = props
    //functions of navigate to/back
    const { navigate, goBack } = navigation
    const [showLoading, setShowLoading] = useState(false)

    const HandleType = {
        Cancel: 0, Finish: 1, ChangeTime: 2 // 0: hủy, 1: hoàn thành, 2: chờ làm việc
    }

    const [response, setResponse] = useState(null)
    const [date, setDate] = useState(new Date())
    const [open, setOpen] = useState(false)

    const [isChangeDate, setIsChangeDate] = useState(false)

    const [reasonString, setReasonString] = useState('')
    const [sessionDate, setSessionDate] = useState()
    const [sessionDateString, setSessionDateString] = useState('')
    const [sessionTimeString, setSessionTimeString] = useState('')

    const [registers, setRegisters] = useState([]) // MẢNG LƯU DANH SÁCH CÁC REGISTER 

    const [workContentString, setWorkContentString] = useState('')
    const [workProblemString, setWorkProblemString] = useState('')
    const [sessionFileName, setSessionFileName] = useState([]);
    const [isChangeSessionFile, setIsChangeSessionFile] = useState(false)
    const [isEnableUpdate, setIsEnableUpdate] = useState(false)

    const [isJournalist, setIsJournalist] = useState(false)
    const [isManage, setIsManage] = useState(false)

    // CÁC GIÁ TRỊ SẼ GỬI LÊN POST API APOITMENT WORK  
    const [tokenString, setTokenString] = useState('')

    const flatListRef = React.useRef()

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
        setIsJournalist(data == 7)
        setIsManage(data == 2)
    })
    getMyStringValue("userID").then((value) => {
        const data = value;
        setUserID(data)
    })

    ////////////////// GET VALUE FROM NAVIGATION ////////////
    let sessionItem = route.params.sessionItem
    var { sessionObject, sessionId, workSession, respWorkSession, time, status } = sessionItem

    ////////////////// NAVIGATION OPTION ////////////////////
    useEffect(() => {
        debugger
        navigation.setOptions(
            {
                headerShown: true,
                headerTitle: 'Thông tin buổi làm việc',
                headerTitleStyle: { fontSize: 20, fontWeight: 'bold' },
                headerTitleAlign: 'center',
                headerStyle: {
                    backgroundColor: colors.newprimary
                },
                headerTintColor: 'white'
            })
        if (sessionObject.dateSession != null && sessionObject.dateSession != "") {
            setSessionDate(new Date(parseInt(sessionObject.dateSession)))
        }
        setSessionFileName(sessionObject.documents != null ? sessionObject.documents : [])
        setWorkContentString(sessionObject.result != 'null' ? sessionObject.result : '')
        setWorkProblemString(sessionObject.problems != 'null' ? sessionObject.problems : '')

        setRegisters(sessionObject.register) 
        setIsEnabled(sessionObject.publicPage)
    }, [])

    useEffect(() => {
        if (tokenString != '') {
            // lấy danh sách các session của 1 CQNN, để CQNN có thể add đăng ký này vào 1 session khác
        }
    }, [tokenString])

    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => {
        setIsEnabled(previousState => !previousState);
        setShowLoading(true) 
        debugger
        sessionsRepo.postUpdatePublicReport(tokenString, sessionId).then(
            responseSessions => {  
                setShowLoading(false)
            })
            .catch(
                errorMessage => {
                    setShowLoading(false)
                    if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
                }
            )
    }

    /////////////////// xữ lý danh sách register để hiển thị lên flatlist //////////////////
    let registersData = []
    registers.length > 0 && registers.forEach(element => {
        let registerObj = {
            "id": element.id,
            "senderId": element.senderId,
            "senderUserName": element?.senderUsers?.givenName,
            "agency": element?.senderUsers?.Institute?.name,
        }
        registersData.push(registerObj)
    })

    /////////////////// USE EFFECT ///////////////////////////
    useEffect(() => {
        if (sessionDate != null) {
            setSessionDateString(convertDateTimeToDateString(sessionDate));
            setSessionTimeString(convertDateTimeToTimeString(sessionDate));
        }
    }, [sessionDate])

    useEffect(() => {
        if (isChangeDate) {
            setSessionDateString(convertDateTimeToDateString(date));
            setSessionTimeString(convertDateTimeToTimeString(date));
        }
    }, [date])

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
        setReasonString(popupRef.state.reasonString)
        if (popupRef.state.reasonString != '') {
            popupRef.closePopup()
            // post data to api 
            callUpdateSession(HandleType.Cancel)
        }
        else {
            // thông báo chưa nhập lý do hủy
            CallCustomAlert.showAlertWith("Chưa nhập lý do hủy đăng ký", 'error', 'OK')
        }
    }
    const onClosePopupWhenCancel = () => {
        popupRef.closePopup()
    }

    ////////////////// CLICK VÀO NÚT HẸN LẠI ////////////////////
    const onChangeTime = () => {
        // show confirm popup, neu dong y hen lai thi call API  
        let timeToShow = sessionDateString
        timeToShow += ' '
        timeToShow += sessionTimeString

        showAlert({
            title: "Hẹn làm việc",
            message: "Thời gian làm việc: " + timeToShow,
            alertType: 'warning',
            btnLabel: 'Đồng ý',
            leftBtnLabel: 'Hủy',
            onPress: () => {
                closeAlert()
                callUpdateSession(HandleType.ChangeTime)
            },
        });
    }

    ////////////////// nhấn nút hoàn thành /////////////////////
    const onFinishWorking = () => {
        debugger
        if (workContentString === null || workContentString === "") {
            CallCustomAlert.showAlertWith("Chưa nhập nội dung làm việc", 'error', 'OK')
            return
        }
        if (sessionFileUri.length > 5) {
            CallCustomAlert.showAlertWith("Chỉ có thể gởi tối đa là 5 files", 'error', 'OK');
            return
        }
        showAlert({
            title: "Thông báo",
            message: "Hoàn thành buổi làm việc",
            alertType: 'warning',
            btnLabel: 'Đồng ý',
            leftBtnLabel: 'Hủy',
            onPress: () => {
                closeAlert()
                callUpdateSession(HandleType.Finish)
            },
        });
    }

    // Function to check the platform
    // If Platform is Android then check for permissions.
    const checkPermission = async () => {
        debugger
        if (Platform.OS === 'ios') {
            downloadFile();
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
                    downloadFile();
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
    const downloadFile = () => {
        // Get today's date to add the time suffix in filename
        debugger
        let date = new Date();
        // File URL which we want to download
        let FILE_URL = string.FILEURL + sessionObject.documents[0].file_path + "/" + sessionObject.documents[0].file_name;
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

    /////////////////////// CALL API ///////////////////////////
    const callUpdateSession = (handleType) => {
        if (tokenString != '') {
            debugger
            setShowLoading(true)
            let timestamp = sessionObject.dateSession;

            if (handleType == 2) { // nếu hẹn lại
                timestamp = new Date(date).getTime()
            }
            // nếu chọn hoàn thành buổi làm việc
            // call api để cập nhật nội dung làm việc cho session CompleteSessionBySessionID 
            sessionsRepo.CompleteSessionBySessionID(tokenString, sessionId, workContentString,
                workProblemString, isChangeSessionFile ? sessionFileUri : null, 1)
                .then(
                    responseWork => {
                        setResponse(responseWork)
                    }
                )
                .then(
                    sessionsRepo.updateSessionBySessionID(tokenString, sessionId, timestamp,
                        popupRef.state.reasonString, handleType)
                        .then(
                            responseSession => {
                                setResponse(responseSession)
                                // hien thi thong bao ca xac nhan
                                setShowLoading(false)
                                showAlert({
                                    title: "Thông báo",
                                    message: handleType == 0 ? "Đã hủy đăng ký làm việc" :
                                        (handleType == 1 ? "Đã hoàn tất nội dung buổi làm việc" : "Đã thay đổi thời gian buổi làm việc"),
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
                                setShowLoading(false)
                                if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
                            }
                        )
                )
                .catch(
                    errorMessage => {
                        setShowLoading(false)
                        if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
                    }
                )
        }
    }

    //////////////// CHOOSE FILE FROM DEVICE ////////////////////
    const [sessionFileUri, setSessionFileUri] = useState([]);
    const [sessionFileResult, setSessionFileResult] = React.useState(null)

    useEffect(() => {
        if (sessionFileResult == null) return;
        const newFileUris = sessionFileResult.map((result) => result.fileCopyUri);
        setSessionFileUri((prevUri) => prevUri.concat(newFileUris.filter((item) => {
            let result = true
            prevUri.filter((prevUriItem) => { if (prevUriItem.split('/').pop() == item.split('/').pop()) result = false; })
            return result
        })))
    }, [sessionFileResult]);

    const deleteSessionFile = (fileUri) => {
        setSessionFileUri((prevFiles) => prevFiles.filter((uri) => uri !== fileUri));
    };
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
                title="Đồng ý hủy đăng ký này"
                onTouchOutside={onClosePopupWhenTouchOutside}
                onTouchOKButton={onClosePopupAndPostData}
                onTouchCancelButton={onClosePopupWhenCancel}
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                alwaysBounceVertical={false}
                contentContainerStyle={styles.scrollViewContainer}>
                {status == 'Hủy đăng ký' ? <View style={[styles.viewContainAllInfo, { backgroundColor: colors.warning }]}>
                    <Text style={styles.titleInfo}>
                        Đăng ký công việc đã hủy bởi:
                    </Text>
                    <Text style={[styles.contentInfo, { color: 'white', fontWeight: 'bold', marginTop: -10, marginBottom: 10 }]}>
                        {sessionObject.uCancelSession.givenName}
                    </Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.titleInfo}>
                            Lý do: <Text style={[styles.titleInfo, { color: 'white', fontWeight: 'bold' }]}>
                                {sessionObject.reasonCancel}
                            </Text>
                        </Text>
                    </View>
                </View> : null}

                {/* Hiển thị danh sách công việc đã có ở đây */}
                {/* nếu trạng thái của đăng ký là chờ phê duyệt, kiểm tra session id của đk đó có bao nhiêu phóng viên trong đó rồi */}
                <View style={styles.viewHeader}>
                    <Text style={[styles.titleHeader, { marginTop: 10 }]}>
                        Chi tiết buổi làm việc
                    </Text>
                </View>

                <View style={styles.viewContainAllInfo}>
                    <View style={{ marginBottom: 3, paddingBottom: 3 }}>
                        <Text style={styles.titleInfo}>
                            Tiêu đề buổi làm việc:
                            <Text style={styles.contentInfo}> {respWorkSession ? respWorkSession : workSession}
                            </Text>
                        </Text>

                    </View>

                    {/* /////////////// thời gian làm việc ///////////////////// */}
                    <View>
                        <Text style={styles.titleInfo}>
                            Thời gian làm việc: {(status != 'Chờ làm việc') ? <Text style={styles.contentInfo}>
                                {sessionDateString + " " + sessionTimeString}
                            </Text> : null}
                        </Text>
                    </View>
                    {status == 'Chờ làm việc' ? <View style={{ flexDirection: 'row', borderColor: COLORS.gray, borderRadius: SIZES.radius, borderWidth: 1, padding: 10, backgroundColor: 'white' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 16, color: '#000' }}>
                                Ngày: {sessionDateString}
                            </Text>
                            <Text style={{ fontSize: 16, color: '#000' }}>
                                Vào lúc: {sessionTimeString}
                            </Text>
                        </View>
                        {/* {!isManage && <View style={{ justifyContent: 'center', }}>
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
                                    Hẹn lại
                                </Text>
                            </TouchableOpacity >
                        </View>} */}
                    </View> : null}

                    {/* // hiển thị danh sách những người tham gia cùng session */}
                    <Text style={[styles.titleInfo, { marginTop: 10 }]}>
                        Danh sách người tham dự
                    </Text>
                    <ScrollView
                        horizontal={true}
                        alwaysBounceHorizontal={false}
                        contentContainerStyle={{
                            width: '100%',
                            height: "auto", padding: 10, paddingTop: 16, maxHeight: 400,
                            borderRadius: 15,
                        }}>
                        <FlatList
                            nestedScrollEnabled={true}
                            style={{}}
                            ref={flatListRef}
                            data={registersData}
                            keyExtractor={eachRegister => eachRegister.id}
                            renderItem={({ item }) => <RegisterItem
                            register={item} key={item.id} />}
                        />
                    </ScrollView>

                </View>

                {/* // nội dung buổi làm việc */}
                {(status === 'Hủy làm việc') ? null : (
                    <View>
                        <View style={styles.viewHeader}>
                            <Text style={styles.titleHeader}>
                                Nội dung buổi làm việc
                            </Text>
                        </View>
                        <View style={styles.viewContainAllInfo}>
                            { isManage && status != 'Hủy làm việc' && <View style={{ flexDirection: 'row', marginBottom: 7 }}>
                                <Text style={styles.titleInfo}>Công khai</Text>
                                <Switch
                                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                                    thumbColor={isEnabled ? colors.workDone : '#f4f3f4'}
                                    ios_backgroundColor="#3e3e3e"
                                    onValueChange={toggleSwitch}
                                    value={isEnabled}
                                />
                            </View>}

                            <Text style={styles.titleInfo}>
                                Nội dung:
                            </Text>
                            <CustomScrollView
                                style={[
                                    styles.input,
                                    (isEnableUpdate && status === 'Chờ làm việc') || (!isEnableUpdate && status === 'Hoàn thành') || isManage ? { backgroundColor: COLORS.background } : null,
                                ]}
                                onChangeText={(value) => {
                                    setWorkContentString(value)
                                }}
                                multiline={true}
                                value={workContentString}
                                placeholder="Nhập nội dung buổi làm việc"
                                underlineColorAndroid='transparent'
                                editable={!isManage && (isEnableUpdate || status == 'Chờ làm việc')}
                            />
                            <Text style={styles.titleInfo}>
                                Các vướng mắc:
                            </Text>

                            <CustomScrollView
                                style={[
                                    styles.input,
                                    (isEnableUpdate && status === 'Chờ làm việc') || (!isEnableUpdate && status === 'Hoàn thành') || isManage ? { backgroundColor: COLORS.background } : null,
                                ]}
                                onChangeText={(value) => {
                                    setWorkProblemString(value)
                                }}
                                multiline={true}
                                value={workProblemString}
                                placeholder="Nhập các vướng mắc cần giải quyết"
                                underlineColorAndroid='transparent'
                                editable={!isManage && (isEnableUpdate || status == 'Chờ làm việc')}
                            />
                            {/*/////////// PHONG VIEN - CHỌN FILE TẢI LÊN ////////////*/}
                            <Text style={styles.titleInfo}>
                                File Đính kèm:
                            </Text>
                            <View style={{
                                flexDirection: 'row', borderRadius: 10, backgroundColor: 'white', borderColor: COLORS.gray, borderWidth: 1,
                                padding: 10, marginBottom: 10, marginTop: 5
                            }}>
                                <View style={{ flex: 1 }}>
                                    {/* // button chọn file  */}
                                    {((!isEnableUpdate && status === 'Chờ làm việc') || (isEnableUpdate && status === 'Hoàn thành')) && !isManage ?
                                        <TouchableOpacity style={{
                                            backgroundColor: '#0373F3', width: 100, borderRadius: 10,
                                            alignSelf: 'flex-end', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 10, flexDirection: 'row',
                                            marginBottom: 5,
                                        }}
                                            disabled={(status == 'Hoàn thành' && !isEnableUpdate) || status == 'Hủy đăng ký'}
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
                                                    enableChooseFile && setSessionFileResult(pickerResults)
                                                    enableChooseFile && setIsChangeSessionFile(true)
                                                } catch (e) {
                                                    handleError(e)
                                                }
                                            }}>
                                            <FontAwesome name='file-text' style={{ color: 'white', fontSize: 18, marginRight: 5 }} />
                                            <Text style={{ fontSize: 13, color: 'white' }}>
                                                Chọn Files
                                            </Text>
                                        </TouchableOpacity> : null}
                                    {/* // danh sách file đã chọn hoặc file đã tải lên */}
                                    <ScrollView
                                        horizontal={true}
                                        alwaysBounceHorizontal={false}
                                        contentContainerStyle={{
                                            width: '100%',
                                            height: "auto", padding: 10, paddingTop: 16, maxHeight: 300, borderRadius: 15,
                                        }}>
                                        {!isChangeSessionFile ?
                                            <FlatList
                                                data={sessionFileName}
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
                                                            <Icon1 name='download' size={20} color={colors.newprimary} />
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                            />
                                            :
                                            <FlatList
                                                data={sessionFileUri}
                                                keyExtractor={(fileUri) => fileUri}
                                                renderItem={({ item: fileUri }) => (
                                                    <View style={{
                                                        flexDirection: 'row', justifyContent: 'space-between', padding: 8, margin: 4, marginTop: 5,
                                                        borderRadius: 8, backgroundColor: COLORS.white, ...styles.shadow,
                                                    }}>
                                                        <Text style={{ fontSize: 15, color: '#000', width: '90%' }}>
                                                            {fileUri.split('/').pop()}
                                                        </Text>
                                                        <TouchableOpacity onPress={() => deleteSessionFile(fileUri)}>
                                                            <Icon1 name='close' size={20} color={colors.newprimary} />
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                            />
                                        }
                                    </ScrollView>
                                </View>
                            </View>
                        </View>
                    </View>)}
            </ScrollView>

            {/* CÁC BUTTON HỦY, HẸN LẠI, XÁC NHẬN  */}
            {status != 'Hủy đăng ký' && !isManage ? <View style={{
                flexDirection: 'row', justifyContent: 'center',
                paddingHorizontal: 5, paddingVertical: 5, backgroundColor: 'white',
            }}>
                {status != 'Hoàn thành' ? <TouchableOpacity style={[styles.touchOpacity, { backgroundColor: colors.cancel, flex: 1 }]}
                    onPress={onShowPopup}
                >
                    <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold', }}>
                        Hủy
                    </Text>
                </TouchableOpacity> : null}

                {isChangeDate ? <TouchableOpacity style={[styles.touchOpacity, { backgroundColor: colors.waitConfirm, flex: 1 }]}
                    onPress={() => onChangeTime()}
                >
                    <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>
                        Hẹn lại
                    </Text>
                </TouchableOpacity > : null}

                {(status == 'Chờ làm việc' || isEnableUpdate) ?
                    <TouchableOpacity style={[styles.touchOpacity, { backgroundColor: colors.workDone, flex: 1 }]}
                        onPress={() => onFinishWorking()}
                    >
                        <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>
                            Hoàn thành
                        </Text>
                    </TouchableOpacity > : null}

                {(status == 'Hoàn thành' && !isEnableUpdate) ?
                    <TouchableOpacity style={[styles.touchOpacity, { backgroundColor: colors.workDone, flex: 1 }]}
                        onPress={() => setIsEnableUpdate(true)}
                    >
                        <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>
                            Cập nhật
                        </Text>
                    </TouchableOpacity > : null}
            </View> : null}

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    viewContainAllInfo: {
        backgroundColor: COLORS.background,
        padding: 20,
        borderColor: COLORS.gray,
        borderRadius: SIZES.radius,
        margin: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 10,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    titleInfo: {
        ...FONTS.h3,
        fontWeight: 'bold',
        color: 'black',
        marginRight: 20,
        marginBottom: 10,
        textAlignVertical: 'center',
    },
    contentInfo: {
        flex: 1,
        ...FONTS.h3,
        color: 'black',
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
    },
    viewHeader: {
        justifyContent: 'center',
        backgroundColor: 'white'
    },
    titleHeader: {
        fontSize: 22,
        fontWeight: 'bold',
        marginLeft: 20,
        color: colors.newprimary
    },
    input: {
        height: 'auto',
        width: '100%',
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
export default SessionScreen