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
    PermissionsAndroid,
} from 'react-native'

import DocumentPicker, {
    DirectoryPickerResponse,
    DocumentPickerResponse,
    isInProgress,
    types,
} from 'react-native-document-picker'

import { COLORS, FONTS, SIZES, colors, string } from '../constants'
import Icon from 'react-native-vector-icons/FontAwesome'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { reportinfo as reportinfoRepo, notifications as notificationsRepo, journalist } from "../repositories"
import { convertDateTimeToDateString, convertDateTimeToTimeString } from "../utilies/DateTime"
import { getMyStringValue } from "../utilies/LocalDataHandler"
import { showAlert, closeAlert } from "react-native-customisable-alert";
import { CallCustomAlert } from "../utilies";
import AppLoader from '../utilies/AppLoader';
import CustomScrollView from '../Component/CustomScrollView';
import RNFetchBlob from "rn-fetch-blob";

function ReportInfoEditScreen(props) {
    //navigation
    const { navigation, route } = props
    //functions of navigate to/back
    const { navigate, goBack } = navigation
    const [showLoading, setShowLoading] = useState(false)

    const HandleType = {
        Cancel: 0, Confirm: 1, ChangeTime: 2, HadResponsed: 3
    }
    const [response, setResponse] = useState(null)

    const [isJournalist, setIsJournalist] = useState(false)
    const [isSpokeman, setIsSpokeman] = useState(false)
    const [isManage, setIsManage] = useState(false)
    const [responseDate, setResponseDate] = useState()
    const [resDateString, setResDateString] = useState('')
    const [resTimeString, setResTimeString] = useState('')

    // CÁC GIÁ TRỊ SẼ GỬI LÊN POST API APOITMENT WORK  
    const [tokenString, setTokenString] = useState('')
    const [resContentString, setResContentString] = useState('')
    const [reqContentString, setReqContentString] = useState('')
    const [reqTitleString, setReqTitleString] = useState('')
    // const [isSelected, setSelection] = useState(false);
    // const [selectedConfimDetail, setSelectedConfirmDetail] = useState(null);

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
        setIsSpokeman(data == 3)
    })
    getMyStringValue("userID").then((value) => {
        const data = value;
        setUserID(data)
    })

    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => {
        setIsEnabled(previousState => !previousState);
        setShowLoading(true)
        debugger
        reportinfoRepo.postUpdatePublicReport(tokenString, id).then(
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

    ////////////////// GET VALUE FROM NAVIGATION ////////////
    let reportInfoItem = route.params.reportInfoItem
    var { reportObject, id, agency, title, status, senderName, notifyId, notifyView } = reportInfoItem

    ////////////////// NAVIGATION OPTION ////////////////////
    useEffect(() => {

        navigation.setOptions(
            {
                headerShown: true,
                headerTitle: 'Chi tiết phản ánh',//status,
                headerTitleStyle: { fontSize: 20, fontWeight: 'bold' },
                headerTitleAlign: 'center',
                headerStyle: {
                    backgroundColor: colors.newprimary
                },
                headerTintColor: 'white'
            })

        setReqTitleString(reportObject.title)
        setReqContentString(reportObject.content != null ? reportObject.content : '')
        setResContentString(reportObject?.feedback?.[0]?.content ?? '')
        setRequestFileName(reportObject.document != null ? reportObject.document : [])
        setResponseFileName(reportObject?.feedback?.[0]?.document ?? [])
        setIsEnabled(reportObject.publicPage)
    }, [])

    useEffect(() => {
        if (tokenString != '') {
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

        if (responseDate != null) {
            setResDateString(convertDateTimeToDateString(responseDate));
            setResTimeString(convertDateTimeToTimeString(responseDate));
        }
    }, [responseDate])

    ////////////////// CLICK VÀO NÚT HẸN LẠI ////////////////////
    // xữ lý phản hồi hoặc cập nhật phản hồi của manager
    const onConfirmOrUpdateReportInfo = () => {

        if (resContentString == null || resContentString == '') {
            CallCustomAlert.showAlertWith("Chưa nhập nội dung phản hồi", 'error', 'OK')
            return
        }
        if (responseFileUri.length > 5) {
            CallCustomAlert.showAlertWith("Chỉ có thể gởi lại tối đa là 5 files", 'error', 'OK')
        }
        // show confirm popup, neu dong y hen lai thi call API  
        reportinfoRepo.postConfirmOrUpdateReportInfo(tokenString, reportObject?.feedback?.[0]?.id, reportObject.id, resContentString, responseFileUri)
            .then(
                responseWork => {
                    setResponse(responseWork)
                    // hien thi thong bao ca xac nhan
                    setShowLoading(false)
                    showAlert({
                        title: "Thông báo",
                        message: "Đã phản hồi phản ánh báo chí",
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
    }

    // xữ lý phản hồi hoặc cập nhật phản hồi của manager
    const onUpdateReportInfoForSpokeman = () => {

        if (reqTitleString == null || reqTitleString == '') {
            CallCustomAlert.showAlertWith("Chưa nhập tiêu đề phản ánh", 'error', 'OK')
            return
        }
        if (reqContentString == null || reqContentString == '') {
            CallCustomAlert.showAlertWith("Chưa nhập nội dung phản ánh", 'error', 'OK')
            return
        }
        if (requestFileUri.length > 5) {
            CallCustomAlert.showAlertWith("Chỉ có thể gởi tối đa 5 files", 'error', 'OK')
        }
        // show confirm popup, neu dong y hen lai thi call API  
        reportinfoRepo.postCreateOrUpdateReportInfo(tokenString, reportObject.id, reqTitleString, reqContentString, requestFileUri)
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

                    setShowLoading(false)
                    if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
                }
            )
    }
    /////////////////////// FUNCTION ///////////////////////////
    /////////////////////// CALL API ///////////////////////////
    const callDeleteReportInfo = () => {
        if (tokenString != '') {
            debugger
            setShowLoading(true)
            reportinfoRepo.postDeleteReportInfo(tokenString, isManage, reportObject.id)
                .then(
                    responseWork => {
                        setResponse(responseWork)
                        // hien thi thong bao ca xac nhan
                        setShowLoading(false)
                        showAlert({
                            title: "Thông báo",
                            message: "Đã hủy phản ánh báo chí",
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
        }
    }
    //////////////// CHOOSE FILE FROM DEVICE ////////////////////  

    useEffect(() => {
        if (requestFileResult == null) return
        if (JSON.stringify(requestFileResult[0].fileCopyUri, null, 2) != '') {
            setRequestFileUri(requestFileResult[0].fileCopyUri)
        }
    }, [requestFileResult])

    useEffect(() => {
        if (responseFileResult == null) return
        if (JSON.stringify(responseFileResult[0].fileCopyUri, null, 2) != '') {
            setResponseFileUri(responseFileResult[0].fileCopyUri)
        }
    }, [responseFileResult])

    //////////////////// XỮ LÝ DOWNLOAD FILE ///////////////////// 
    // Function to check the platform
    // If Platform is Android then check for permissions.
    const checkPermission = async () => {

        if (Platform.OS === 'ios') {
            downloadFile(filePath, fileName);
        } else {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission Reportd',
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
        let date = new Date();
        // File URL which we want to download
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
            prevUri.filter((prevUriItem) => { if (prevUriItem.split('/').pop() == item.split('/').pop()) result = false; })
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
            prevUri.filter((prevUriItem) => { if (prevUriItem.split('/').pop() == item.split('/').pop()) result = false; })
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
            <StatusBar backgroundColor="#FFF" barStyle="dark-content" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                alwaysBounceVertical={false}
                contentContainerStyle={styles.scrollViewContainer}>

                <View style={styles.viewHeader}>
                    <Text style={styles.titleHeader}>
                        Chi tiết phản ánh báo chí
                    </Text>
                </View>
                <View style={styles.viewContainAllInfo}>
                    {isManage ? <View style={{ marginBottom: 3, paddingBottom: 3 }}>
                        <Text style={styles.titleInfo}>
                            Người phản ánh:
                            <Text style={styles.contentInfo}> {senderName}</Text>
                        </Text>
                    </View> : null}
                    {isManage ? <View style={{ marginBottom: 3, paddingBottom: 3 }}>
                        <Text style={styles.titleInfo}>
                            Đơn vị phản ánh:
                            <Text style={styles.contentInfo}> {agency}</Text>
                        </Text>
                    </View> : null}

                    {isSpokeman || isJournalist ? (<View style={{ marginBottom: 3, paddingBottom: 3 }}>
                        <Text style={styles.titleInfo}>
                            Đơn vị nhận phản ánh:
                            <Text style={styles.contentInfo}> {'Sở Thông tin truyền thông'}</Text>
                        </Text>
                    </View>) : null}

                    <Text style={styles.titleInfo}>
                        Tiêu đề:
                    </Text>
                    <CustomScrollView
                        style={[styles.input, { flex: 1, backgroundColor: !isSpokeman && !isJournalist || status === 'Đã phản hồi' ? COLORS.background : COLORS.white }]}

                        value={reqTitleString}
                        placeholder="Tiêu đề"
                        editable={isSpokeman || isJournalist && status === 'Chờ phản hồi'}
                        onChangeText={(value) => {
                            setReqTitleString(value)
                        }}
                    />
                    <Text style={styles.titleInfo}>
                        Nội dung:
                    </Text>
                    <CustomScrollView
                        style={[
                            styles.input,
                            { backgroundColor: !isSpokeman && !isJournalist || status === 'Đã phản hồi' ? COLORS.background : COLORS.white },
                        ]}
                        value={reqContentString}
                        placeholder="Nội dung"
                        editable={isSpokeman || isJournalist && status === 'Chờ phản hồi'}
                        onChangeText={(value) => {
                            setReqContentString(value)
                        }}
                    />
                    {/*/////////// PHONG VIEN - CHỌN FILE TẢI LÊN ////////////*/}
                    <View>
                        <Text style={styles.titleInfo}>
                            File Đính kèm:
                        </Text>
                        {/* // nếu tk là manager hoặc là tài khoản spokeman và trạng thái là đã phản hồi thì hiển thị nurt download*/}
                        {isManage || ((isSpokeman || isJournalist) && status == 'Đã phản hồi') ?
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

                                                filePath = fileUri.file_path
                                                fileName = fileUri.file_name
                                                checkPermission()
                                            }}>
                                                <Icon name='download' size={20} color={colors.newprimary} />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                />
                            </ScrollView> : null}
                        {/* // nếu là user CQNN thì hiển thị tên file(nếu có) và nút chọn file */}
                        {isSpokeman || isJournalist && status == 'Chờ phản hồi' ?
                            <View style={{
                                flexDirection: 'row', borderRadius: 10, backgroundColor: 'white', borderColor: COLORS.gray, borderWidth: 1,
                                padding: 10, marginBottom: 10, marginTop: 5
                            }}>
                                <View style={{ flex: 1 }}>
                                    {/* // button chọn file  */}
                                    <TouchableOpacity style={{
                                        backgroundColor: '#0373F3', width: 100, borderRadius: 10,
                                        alignSelf: 'flex-end', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 10, flexDirection: 'row',
                                        marginBottom: 5,
                                    }}
                                        disabled={false}
                                        onPress={async () => {
                                            try {
                                                const pickerResults = await DocumentPicker.pickMultiple({
                                                    presentationStyle: 'fullScreen',
                                                    copyTo: 'cachesDirectory',
                                                    type: [types.pdf, types.images, types.doc, types.docx]

                                                })
                                                debugger
                                                let enableChooseFile = true
                                                pickerResults.forEach(element => {
                                                    if (element.type !== 'image/png' && element.type !== 'image/jpeg'
                                                        && element.type !== 'application/msword' && element.type !== 'application/pdf'
                                                        && element.type != 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                                                        CallCustomAlert.showAlertWith('Bạn chỉ được chọn file jpg, png, doc, docx, pdf', 'error', 'OK')
                                                        enableChooseFile = false
                                                    }
                                                    if (element.size > 5242880) {
                                                        CallCustomAlert.showAlertWith('Bạn chỉ được chọn file có dung lượng dưới 5MB', 'error', 'OK')
                                                        enableChooseFile = false
                                                    }
                                                });
                                                enableChooseFile && setRequestFileResult(pickerResults)
                                                enableChooseFile && setIsChangeReqFile(true)
                                            } catch (e) {
                                                handleError(e)
                                            }
                                        }}>
                                        <FontAwesome name='file-text' style={{ color: 'white', fontSize: 18, marginRight: 5 }} />
                                        <Text style={{ fontSize: 13, color: 'white' }}>
                                            Chọn File
                                        </Text>
                                    </TouchableOpacity>
                                    {/* // danh sách file đã chọn hoặc file đã tải lên */}
                                    <ScrollView
                                        horizontal={true}
                                        alwaysBounceHorizontal={false}
                                        contentContainerStyle={{
                                            width: '100%',
                                            height: "auto", padding: 10, paddingTop: 16, maxHeight: 300, borderRadius: 15,
                                        }}>
                                        {!isChangeReqFile ?
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

                                                            filePath = fileUri.file_path
                                                            fileName = fileUri.file_name
                                                            checkPermission()
                                                        }}>
                                                            <Icon name='download' size={20} color={colors.newprimary} />
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                            />
                                            :
                                            <FlatList
                                                data={requestFileUri}
                                                keyExtractor={(fileUri) => fileUri}
                                                renderItem={({ item: fileUri }) => (
                                                    <View style={{
                                                        flexDirection: 'row', justifyContent: 'space-between', padding: 8, margin: 4, marginTop: 5,
                                                        borderRadius: 8, backgroundColor: COLORS.white, ...styles.shadow,
                                                    }}>
                                                        <Text style={{ fontSize: 15, color: '#000', width: '90%' }}>
                                                            {fileUri.split('/').pop()}
                                                        </Text>
                                                        <TouchableOpacity onPress={() => deleteFile(fileUri)}>
                                                            <Icon name='close' size={20} color={colors.newprimary} />
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                            />
                                        }
                                    </ScrollView>
                                </View>
                            </View> : null}
                    </View>
                </View>

                {/* ////////////////// PHẦN CƠ QUAN NHÀ NƯỚC /////////////////// */}
                {(isSpokeman || isJournalist && status !== 'Chờ phản hồi') || (isManage && (status === 'Chờ phản hồi' || status === 'Đã phản hồi')) ? (
                    <View style={styles.viewHeader}>
                        <Text style={styles.titleHeader}>
                            Phản hồi phản ánh
                        </Text>
                    </View>
                ) : null}
                {(isSpokeman || isJournalist && status !== 'Chờ phản hồi') || (isManage && (status === 'Chờ phản hồi' || status === 'Đã phản hồi')) ? (
                    <View style={styles.viewContainAllInfo}>

                        {isManage && <View style={{ flexDirection: 'row', marginBottom: 7 }}>
                            <Text style={styles.titleInfo}>Công khai</Text>
                            <Switch
                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                thumbColor={isEnabled ? colors.workDone : '#f4f3f4'}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={toggleSwitch}
                                value={isEnabled}
                            />
                        </View>}
                        {/* tiêu đề buổi làm việc của CQNN được sử dụng làm tên session */}
                        <View style={{ flexDirection: 'row', alignContent: 'center', alignItems: 'center' }}>
                            <Text style={styles.titleInfo}>
                                Nội dung phản hồi:
                            </Text>
                        </View>

                        <CustomScrollView
                            style={[styles.input, { flex: 1, backgroundColor: isSpokeman || isJournalist ? COLORS.background : COLORS.white }]}
                            value={resContentString}
                            selectTextOnFocus={true}
                            placeholder={isManage ? "Nội dung phản hồi" : ''}
                            editable={isManage}
                            onChangeText={(value) => {
                                setResContentString(value)
                            }}
                        />
                        {/*///////// HIỂN THỊ TÊN FILE VÀ NUT DOWNLOAD NẾU LÀ USER NGUOFI PHAT NGON ///////////*/}
                        {/* // nếu là user CQNN và trạng thái là đã phản hồi thì hiển thị file và download */}

                        <Text style={styles.titleInfo}>
                            File Đính kèm 12:
                        </Text>

                        {(isSpokeman || isJournalist) && status == 'Đã phản hồi' ?
                            <ScrollView
                                horizontal={true}
                                alwaysBounceHorizontal={false}
                                contentContainerStyle={{
                                    width: '100%',
                                    height: "auto", padding: 10, paddingTop: 16, maxHeight: 300, borderRadius: 15,
                                }}>
                                <FlatList
                                    data={responseFileName}
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

                                                filePath = fileUri.file_path
                                                fileName = fileUri.file_name
                                                checkPermission()
                                            }}>
                                                <Icon name='download' size={20} color={colors.newprimary} />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                />
                            </ScrollView> : null}
                        {/* // nếu là user Manage  */}
                        {isManage ?
                            <View style={{
                                flexDirection: 'row', borderRadius: 10, backgroundColor: 'white', borderColor: COLORS.gray, borderWidth: 1,
                                padding: 10, marginBottom: 10, marginTop: 5
                            }}>
                                <View style={{ flex: 1 }}>
                                    <TouchableOpacity style={{
                                        backgroundColor: '#0373F3', width: 100, borderRadius: 10,
                                        alignSelf: 'flex-end', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 10, flexDirection: 'row',
                                        marginBottom: 5,
                                    }}
                                        disabled={false}
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
                                                    if (element.size > 5242880) {
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
                                        <FontAwesome name='file-text' style={{ color: 'white', fontSize: 18, marginRight: 5 }} />
                                        <Text style={{ fontSize: 13, color: 'white' }}>
                                            Chọn File
                                        </Text>
                                    </TouchableOpacity>
                                    {/* // danh sách file đã chọn hoặc file đã tải lên */}
                                    <ScrollView
                                        horizontal={true}
                                        alwaysBounceHorizontal={false}
                                        contentContainerStyle={{
                                            width: '100%',
                                            height: "auto", padding: 10, paddingTop: 16, maxHeight: 300, borderRadius: 15,
                                        }}>
                                        {/* nếu chưa chọn lại file */}
                                        {!isChangeResFile ?
                                            <FlatList
                                                data={responseFileName}
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

                                                            filePath = fileUri.file_path
                                                            fileName = fileUri.file_name
                                                            checkPermission()
                                                        }}>
                                                            <Icon name='download' size={20} color={colors.newprimary} />
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                            />
                                            :
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
                                                        <TouchableOpacity onPress={() => deleteFile(fileUri)}>
                                                            <Icon name='close' size={20} color={colors.newprimary} />
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                            />
                                        }
                                    </ScrollView>
                                </View>
                            </View> : null}
                        {/* /////////////// thời gian phản hồi ///////////////////// //!isJournalist &&*/}
                    </View>
                ) : null}
            </ScrollView>

            {/* CÁC BUTTON HỦY, HẸN LẠI, XÁC NHẬN  */}
            <View style={{
                flexDirection: 'row', justifyContent: 'center',
                paddingHorizontal: 5, backgroundColor: 'white'
            }}>
                {isManage ? <TouchableOpacity style={[styles.touchOpacity, { backgroundColor: colors.waitConfirm, flex: 1 }]}
                    onPress={() => {
                        showAlert({
                            title: "Thông báo",
                            message:
                                status === 'Đã phản hồi'
                                    ? "Bạn muốn cập nhật thông tin này ?"
                                    : "Bạn muốn phản hồi thông tin này ?",
                            alertType: 'warning',
                            btnLabel: 'Đồng ý',
                            leftBtnLabel: 'Hủy',
                            onPress: () => {
                                closeAlert()
                                onConfirmOrUpdateReportInfo();
                            }
                        });
                    }}
                >
                    <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>
                        {status === 'Đã phản hồi' ? 'Cập nhật' : 'Phản hồi'}
                    </Text>
                </TouchableOpacity > : null}

                {isSpokeman || isJournalist && status == 'Chờ phản hồi' ?
                    <TouchableOpacity style={[styles.touchOpacity, { backgroundColor: colors.waitConfirm, flex: 1 }]}
                        onPress={() => {
                            showAlert({
                                title: "Thông báo",
                                message: "Bạn muốn cập nhật thông tin này ?",
                                alertType: 'warning',
                                btnLabel: 'Đồng ý',
                                leftBtnLabel: 'Hủy',
                                onPress: () => {
                                    closeAlert()
                                    onUpdateReportInfoForSpokeman();
                                }
                            });
                        }}
                    >
                        <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>
                            Cập nhật
                        </Text>
                    </TouchableOpacity > : null}
            </View>
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
    header: {
        flexDirection: 'row',
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F6F6F6',
    },
    headerTitle: { color: '#000', fontWeight: 'bold', fontSize: 16 },
    saveAreaViewContainer: { flex: 1, backgroundColor: '#FFF' },
    viewContainer: { flex: 1, backgroundColor: '#FFF' },
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
    titleSmallHeader: {
        ...FONTS.h3,
        fontWeight: 'bold',
        // marginLeft: 20,
        marginVertical: 10,
        color: 'black'
    },
    viewContainDropdown: {
        flex: 1,
        //justifyContent: 'center',
        backgroundColor: 'white',
        padding: 20
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
export default ReportInfoEditScreen