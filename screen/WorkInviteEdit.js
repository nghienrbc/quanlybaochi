import React, { useState, useEffect, useRef } from "react";
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    TextInput,
    ScrollView,
    SafeAreaView,
    FlatList,
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
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Icon1 from 'react-native-vector-icons/FontAwesome'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Ionicons from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker'
import { work as workRepo, journalist as journalistRepo } from "../repositories"
import { convertDateTimeToDateString, convertDateTimeToTimeString } from "../utilies/DateTime"
import { getMyStringValue } from "../utilies/LocalDataHandler"
import BottomPopup from '../Component/BottomPopup'

import { showAlert, closeAlert } from "react-native-customisable-alert";

import { CallCustomAlert } from "../utilies";
import AppLoader from '../utilies/AppLoader';

import CustomScrollView from '../Component/CustomScrollView';
import RNFetchBlob from "rn-fetch-blob";
import InviterItem from "./InviterItem";
import { useLayoutEffect } from "react";
import DropdownMultiSelect from '../Component/DropdownMultiSelect';
function WorkInviteEdit(props) {
    //navigation
    const { navigation, route } = props
    //functions of navigate to/back
    const { navigate, goBack } = navigation
    const [showLoading, setShowLoading] = useState(false)

    const HandleType = {
        Cancel: 0, Confirm: 1, WaitingResponse: 2
    }

    const [response, setResponse] = useState(null)
    const [date, setDate] = useState(new Date())
    const [open, setOpen] = useState(false)

    const [isChangeDate, setIsChangeDate] = useState(false)
    const [isJournalist, setIsJournalist] = useState(false)

    const [reasonString, setReasonString] = useState('')
    const [inviteDate, setInviteDate] = useState()
    const [inviteDateString, setInviteDateString] = useState('')
    const [inviteTimeString, setInviteTimeString] = useState('')

    const [instituteID, setInstituteID] = useState(0); // lưu id CQNN

    const [sessions, setSessions] = useState([]); // MẢNG LƯU DANH SÁCH CÁC SESSION
    const [registers, setRegisters] = useState([]) // MẢNG LƯU DANH SÁCH CÁC REGISTER

    const [searchText, setSearchText] = useState('');

    // CÁC GIÁ TRỊ SẼ GỬI LÊN POST API APOITMENT WORK  
    const [tokenString, setTokenString] = useState('')
    const [resContentString, setResContentString] = useState('')
    const [isChangeContent, setIsChangeContent] = useState('')

    const [inviteContentString, setInviteContentString] = useState('')
    const [workContentString, setWorkContentString] = useState('')
    const [workProblemString, setWorkProblemString] = useState('')

    const [isEditInvite, setIsEditInvite] = useState(true)
    const [isEnableUpdate, setIsEnableUpdate] = useState(false)
    const [isHasJounalistConfim, setIsHasJounalistConfim] = useState(false)

    const [isOwnerConfirm, setIsOwnerConfirm] = useState(false) // kiểm tra tài khoản đang đăng nhập có đồng ý lời mời làm việc không
    const [jounalists, setJounalists] = useState([])

    var filePath = []
    var fileName = []

    const flatListRef = useRef()
    const scrollViewRef = useRef();

    ///////////////// ASYGN STORAGE ///////////////////////
    const [userID, setUserID] = useState('')
    const [userTypeID, setUserTypeID] = useState('')
    getMyStringValue("userTypeID").then((value) => {
        const data = value;
        setUserTypeID(data)
        setIsJournalist(data == 7)
        getMyStringValue("token").then((value) => {
            const data = value;
            setTokenString(data)
        })
    })
    getMyStringValue("userID").then((value) => {
        const data = value;
        setUserID(data)
    })

    ////////////////// GET VALUE FROM NAVIGATION ////////////
    let WorkInviteItem = route.params.WorkInviteItem
    var { invitationObject, id, agency, title, time, status } = WorkInviteItem

    const handleSearchTextChange = (text) => {
        setSearchText(text);
    };

    ////////////////// NAVIGATION OPTION ////////////////////
    useLayoutEffect(() => {
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
                headerTintColor: 'white',
                headerRight: () => (
                    isHasJounalistConfim && status != 'Hoàn thành' && status != 'Hủy làm việc' ? <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity onPress={() => {
                            setIsEditInvite(true)
                            scrollViewRef.current.scrollTo({ animated: true, offset: 0 })
                        }}
                            disabled={isEditInvite}>
                            <Icon1 name='edit' style={{ color: !isEditInvite ? 'black' : '#c3c3c3', fontSize: 25, marginRight: 10 }} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => {
                            setIsEditInvite(false)
                            scrollViewRef.current.scrollToEnd({ animated: true })
                        }}
                            disabled={!isEditInvite}>
                            <Icon1 name='wpforms' style={{ color: isEditInvite ? 'black' : '#c3c3c3', fontSize: 25, marginRight: 10 }} />
                        </TouchableOpacity>
                    </View> : null
                )
            })
    }, [navigation, isEditInvite, isHasJounalistConfim])

    useEffect(() => {
        debugger
        if (tokenString !== "") {
            if (isJournalist) {
                setInviteFileName(invitationObject.workInvite.documents);
                setSessionFileName(invitationObject.workInvite.docSession);
                setWorkContentString(invitationObject.workInvite.contentSession);
                setInviteContentString(invitationObject.workInvite.contentInvite);
                setRegisters(invitationObject.workInvite.detailInvites);
                setIsOwnerConfirm(invitationObject.status === 1);
            } else {
                const allItemIds = []
                invitationObject.detailInvites.forEach(element => {
                    allItemIds.push(element.receiver.id);
                });
                setSelectedItems(allItemIds);
                setInviteFileName(invitationObject.documents);
                setSessionFileName(invitationObject.docSession);
                setWorkContentString(invitationObject.contentSession);
                setInviteContentString(invitationObject.contentInvite);
                setRegisters(invitationObject.detailInvites);
                setIsHasJounalistConfim(
                    invitationObject.detailInvites.find((data) => data.status === 1)
                );
            }
            journalistRepo.getAllJournalist(tokenString, 7)
                .then(responseJounalist => {
                    setJounalists(responseJounalist)
                    setShowLoading(false)
                }).catch(
                    errorMessage => {
                        setShowLoading(false)
                        if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
                    }
                )

        }
    }, [tokenString]);

    /////////////// lấy danh sách phóng viên cho flatlist
    const jounalistObjArray = []
    jounalists.forEach(element => {
        if (element.Institute) {
            const { name: instituteName, id: instituteId } = element.Institute;
            const { givenName: childName, id: childId } = element;
            const existingJournalist = jounalistObjArray.find(journalist => journalist.id === instituteId);

            if (existingJournalist) {
                existingJournalist.children.push({ name: childName, id: childId });
            }
            else {
                const journalist = {
                    name: instituteName,
                    id: instituteId,
                    children: [{ name: childName, id: childId }]
                };
                jounalistObjArray.push(journalist);
            }
        }
    });

    /////////////////// xữ lý danh sách register để hiển thị lên flatlist //////////////////
    let registersData = []
    registers.length > 0 && registers.forEach(element => {
        //debugger
        let registerObj = {
            "id": element.id,
            "senderId": element.receiver.id,
            "senderUserName": element.receiver.givenName,
            "agency": element.receiver?.Institute?.name,
            "status": (workContentString && element.status == 1) ? "Hoàn thành" : (element.status == 0 ? "Hủy làm việc" : (element.status == 1 ? "Chờ làm việc" : "Chờ phản hồi")),
            "reasonConfirm": element.status == 0 ? element.reasonConfirm : ''
        }
        registersData.push(registerObj)
    })

    /////////////////// USE EFFECT /////////////////////////// 
    useEffect(() => {
        //debugger
        if (time != null) {
            setInviteDateString(time.split(" ")[0]);
            setInviteTimeString(time.split(" ")[1]);
        }
    }, [time])

    useEffect(() => {
        //debugger
        if (isChangeDate) {
            setInviteDateString(convertDateTimeToDateString(date));
            setInviteTimeString(convertDateTimeToTimeString(date));
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
            // nếu là phóng viên thì gọi api confirm invite với status = hủy
            if (isJournalist) {
                callPostConfirmInvite(HandleType.Cancel)
            }
            else { // nếu là cơ quan nhà nước thì gọi api update invite với actived = false
                callPostUpdateInvite(HandleType.Cancel)
            }
        }
        else {
            // thông báo chưa nhập lý do hủy
            CallCustomAlert.showAlertWith("Chưa nhập lý do Hủy làm việc", 'error', 'OK')
        }
    }
    const onClosePopupWhenCancel = () => {
        //console.warn(popupRef.state.reasonString)
        popupRef.closePopup()
    }
    ////////////////// CLICK VÀO NÚT HẸN LẠI ////////////////////
    const onChangeTime = () => {
        // show confirm popup, neu dong y hen lai thi call API  
        let timeToShow = inviteDateString
        timeToShow += ' '
        timeToShow += inviteTimeString
        showAlert({
            title: "Cập nhật thông tin mời làm việc",
            message: "Thời gian làm việc: " + timeToShow,
            alertType: 'warning',
            btnLabel: 'Đồng ý',
            leftBtnLabel: 'Hủy',
            onPress: () => {
                closeAlert()
                callPostUpdateInvite(HandleType.WaitingResponse)
            },
        });
    }
    // phóng viên đồng ý lời mời làm viêc
    const onConfirmWorking = () => {
        showAlert({
            title: "Xác nhận lịch làm việc",
            message: "Đồng ý mời làm việc",
            alertType: 'warning',
            btnLabel: 'Đồng ý',
            leftBtnLabel: 'Hủy',
            onPress: () => {
                closeAlert()
                callPostConfirmInvite(HandleType.Confirm)
            },
        });
    }
    ////////////////// nhấn nút hoàn thành /////////////////////
    const onFinishWorking = () => {
        debugger
        if (workContentString == '' || workContentString == null) {
            CallCustomAlert.showAlertWith("Chưa nhập nội dung làm việc", 'error', 'OK')
            return
        }
        setIsEnableUpdate(false)
        showAlert({
            title: "Thông báo",
            message: "Hoàn thành buổi làm việc",
            alertType: 'warning',
            btnLabel: 'Đồng ý',
            leftBtnLabel: 'Hủy',
            onPress: () => {
                closeAlert()
                callPostFinishInvite()
            },
        });
    }
    const callPostConfirmInvite = (handleType) => {
        if (tokenString != '') {
            // debugger
            setShowLoading(true)
            workRepo.postConfimInvite(tokenString, invitationObject.id,
                popupRef.state.reasonString, handleType)
                .then(
                    responseWork => {
                        setResponse(responseWork)
                        setShowLoading(false)
                        showAlert({
                            title: "Thông báo",
                            message: handleType == 0 ? "Đã hủy lời mời làm việc" : "Đã xác nhận lời mời làm việc",
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
    /////////////////////// CALL API ///////////////////////////
    const showAlertWith = (title, message, alertType, btnLabel) => {
        showAlert({
            title: title,
            message: message,
            alertType: alertType,
            btnLabel: btnLabel,
        })
    }
    const callPostUpdateInvite = (handleType) => {
        debugger
        if (tokenString != '') {
            if (selectedItems.length == 0) {
                showAlertWith("Thông báo", "Chưa chọn phóng viên mời làm việc", 'error', 'OK')
                return
            }
            if (inviteContentString == '') {
                showAlertWith("Thông báo", "Chưa nhập lại nội dung", 'error', 'OK')
                return
            }
            if (inviteFileUri.length > 5) {
                showAlertWith("Thông báo", "Chỉ có thể gởi lại tối đa là 5 files", 'error', 'OK');
                return
            }
            debugger
            setShowLoading(true)
            let timestamp = new Date(date).getTime()
            workRepo.postUpdateInvite(tokenString, id, selectedItems, title, inviteContentString, timestamp,
                callPostUpdateInvite ? inviteFileUri : null, handleType, popupRef.state.reasonString)
                .then(
                    responseWork => {
                        setResponse(responseWork)
                        setShowLoading(false)
                        showAlert({
                            title: "Thông báo",
                            message: handleType == 0 ? "Đã hủy mời làm việc" : "Đã cập nhật thông tin mời làm việc",
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
    const callPostFinishInvite = () => {
        if (tokenString != '') {
            debugger
            setShowLoading(true)
            workRepo.postFinishWorkInvite(tokenString, invitationObject.id, workContentString, sessionFileUri)
                .then(
                    responseWork => {
                        setResponse(responseWork)
                        setShowLoading(false)
                        showAlert({
                            title: "Thông báo",
                            message: "Đã hoàn thành buổi mời làm việc",
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
    /////////////////// XỮ LÝ DROPDOWN //////////////////////////////
    //////////////// drop down tree chon phong vien //////////////////////
    const [selectedItems, setSelectedItems] = useState([])
    const onSelectedItemsChange = (selectedItems) => {
        setSelectedItems(selectedItems)
        setIsChangeInviteJournalist(true)
    };
    //chon tất cả
    const handleSelectAll = () => {
        const allItems = jounalistObjArray.flatMap((section) => section.children);
        const allItemIds = allItems.map((item) => item.id);
        setSelectedItems(allItemIds);
    };
    // hủy tất cả
    const handleRemoveAll = () => {
        setSelectedItems([]);
    };
    //Tìm kiếm theo cụm theo cha và con
    const filterItems = (searchText, items, _selectedItems) => {
        const filteredItems = items.filter((item) => {
            const itemName = item.name.toLowerCase();
            const searchTerm = searchText.toLowerCase();
            const hasItemMatch = itemName.includes(searchTerm);
            const hasChildMatch =
                item.children &&
                item.children.some(
                    (child) => child.name.toLowerCase().indexOf(searchTerm) !== -1
                );
            return hasItemMatch || hasChildMatch;
        });
        return filteredItems;
    };

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
                    Alert.alert('Error', 'Storage Permission Not Granted');
                }
            } catch (err) {
                console.log("++++" + err);
            }
        }
    };
    const downloadFile = (filePath, fileName) => {
        // Get today's date to add the time suffix in filename
        debugger
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
    const [inviteFileName, setInviteFileName] = useState([]);
    const [isChangeInviteFile, setIsChangeInviteFile] = useState(false)
    const [isChangeInviteJournalist, setIsChangeInviteJournalist] = useState(false) // kiểm tra sự thay đổi của phóng viên được mời

    const [sessionFileName, setSessionFileName] = useState([]);
    const [isChangeSessionFile, setIsChangeSessionFile] = useState(false)

    //////////////// CHOOSE INVITE FILE FROM DEVICE ////////////////////
    const [inviteFileUri, setInviteFileUri] = useState([]);
    const [inviteFileResult, setInviteFileResult] = React.useState(null)

    useEffect(() => {
        if (inviteFileResult == null) return;
        const newFileUris = inviteFileResult.map((result) => result.fileCopyUri);
        setInviteFileUri((prevUri) => prevUri.concat(newFileUris.filter((item) => {
            let result = true
            prevUri.filter((prevUriItem) => { if (prevUriItem.split('/').pop() == item.split('/').pop()) result = false; })
            return result
        })))
    }, [inviteFileResult]);

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
        setInviteFileUri((prevFiles) => prevFiles.filter((uri) => uri !== fileUri));
    };
    //////////////// CHOOSE SESSION FILE FROM DEVICE ////////////////////
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

    ///////////////////// LAYOUT RENDER ///////////////////////////////////
    return (
        <SafeAreaView style={styles.saveAreaViewContainer}>
            {showLoading ? <AppLoader /> : null}
            <DatePicker
                title="Chọn ngày và giờ"
                confirmText="Chọn"
                cancelText="Hủy"
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
                title="Đồng ý Hủy làm việc này"
                onTouchOutside={onClosePopupWhenTouchOutside}
                onTouchOKButton={onClosePopupAndPostData}
                onTouchCancelButton={onClosePopupWhenCancel}
            />
            <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                alwaysBounceVertical={false}
                contentContainerStyle={styles.scrollViewContainer}

            >
                {status == 'Hủy làm việc' ? <View style={[styles.viewContainAllInfo, { backgroundColor: colors.warning }]}>
                    <Text style={styles.titleInfo}>
                        Mời làm việc đã hủy
                    </Text>
                    <Text style={styles.titleInfo}>
                        Lý do:
                        <Text style={[styles.titleInfo, { color: 'white' }]}> {
                            isJournalist ? (invitationObject.reasonConfirm != null ? invitationObject.reasonConfirm : invitationObject.workInvite.reasonCancel) : invitationObject.reasonCancel}</Text>
                    </Text>
                </View> : null}

                <View style={styles.viewHeader}>
                    <Text style={styles.titleHeader}>
                        Chi tiết mời làm việc
                    </Text>
                </View>
                <View style={styles.viewContainAllInfo}>
                    <Text style={styles.titleInfo}>
                        Tiêu đề mời làm việc
                    </Text>
                    <CustomScrollView
                        style={[styles.input, { flex: 1, backgroundColor: COLORS.background }]}
                        value={title}
                        placeholder="Nhập tiêu đề"
                        editable={false}
                    />
                    {/* // nếu là phóng viên thì hiển thị tên đơn vị mời làm việc */}
                    {isJournalist ?
                        <View style={{ alignContent: 'center', alignItems: 'flex-start' }}>
                            <Text style={styles.titleInfo}>Đơn vị mời làm việc: </Text>
                            <Text style={styles.contentInfo}> {'- ' + agency} </Text>
                        </View> : null}

                    {!isJournalist && status != 'Hoàn thành' && status != 'Hủy làm việc' ? <View style={{
                        width: '100%', backgroundColor: 'red',
                        backgroundColor: COLORS.white,
                        borderWidth: 1,
                        paddingBottom: 5,
                        borderRadius: SIZES.radius,
                        borderColor: COLORS.gray,
                        paddingHorizontal: 10,
                        marginBottom: 10,
                    }}>
                        <DropdownMultiSelect
                            items={jounalistObjArray}
                            IconRenderer={Icon}
                            selectText="Chọn phóng viên mời làm việc"
                            onSelectedItemsChange={onSelectedItemsChange}
                            selectedItems={selectedItems}
                            searchText={searchText}
                            onSearchTextChange={handleSearchTextChange}
                            filterItems={filterItems}
                            styles={{
                                chipContainer: { //Container chính của chíp
                                    backgroundColor: '#F3F3F3',
                                    borderRadius: 20,
                                    margin: 5,
                                    padding: 5,
                                },
                                chipIcon: {
                                    color: colors.newprimary,// màu dấu x khi render ra chip
                                },
                                chipText: {
                                    color: 'black',// màu name user khi render ra chip
                                },
                                selectedSubItemText: {
                                    color: colors.workDone,// màu cho mỗi mục con đã chọn.
                                },
                                cancelButton: {
                                    backgroundColor: colors.cancel,
                                },
                                button: {
                                    backgroundColor: '#3479C8',// màu confirm button
                                    padding: 10,
                                },
                            }}
                            noResultsComponent={
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
                                    }}>Không tìm thấy kết quả phù hợp
                                    </Text>
                                    <Text style={{
                                        color: '#858181',
                                        fontSize: 16
                                    }}>Bạn thử tìm từ khóa khác nhé.
                                    </Text>
                                </View>}
                        />
                        {/* button select and remove all */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TouchableOpacity onPress={() => {
                                showAlert({
                                    title: "Thông báo",
                                    message: "Bạn muốn chọn tất cả những phóng viên còn lại",
                                    alertType: 'warning',
                                    btnLabel: 'Đồng ý',
                                    leftBtnLabel: 'Hủy',
                                    onPress: () => {
                                        closeAlert()
                                        handleSelectAll();
                                    }
                                });
                            }}
                                style={{
                                    flexDirection: 'row',
                                    height: 35,
                                    backgroundColor: colors.workDone,
                                    borderRadius: 10,
                                    alignContent: 'center',
                                    justifyContent: 'center',
                                    paddingVertical: 10,
                                    paddingHorizontal: 16,
                                }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Image style={{ height: 16, width: 16 }}
                                        resizeMode="cover"
                                        source={require("../assets/icons/checkmark_icon.png")} />
                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}> Chọn tất cả</Text>
                                </View>
                            </TouchableOpacity>
                            {selectedItems.length > 0 ?
                                <TouchableOpacity onPress={() => {
                                    showAlert({
                                        title: "Thông báo",
                                        message: "Bạn muốn hủy tất cả những phóng viên đã chọn?",
                                        alertType: 'warning',
                                        btnLabel: 'Đồng ý',
                                        leftBtnLabel: 'Hủy',
                                        onPress: () => {
                                            closeAlert()
                                            handleRemoveAll();
                                        }
                                    });
                                }}
                                    style={{
                                        flexDirection: 'row',
                                        height: 35,
                                        backgroundColor: colors.cancel,
                                        borderRadius: 10,
                                        alignContent: 'center',
                                        justifyContent: 'center',
                                        paddingVertical: 10,
                                        paddingHorizontal: 16,
                                    }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Image style={{ height: 16, width: 16 }}
                                            resizeMode="cover"
                                            source={require("../assets/icons/remove_icon.png")} />
                                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}> Hủy chọn</Text>
                                    </View>
                                </TouchableOpacity> : null}
                        </View>
                    </View> : null}

                    {/* // hiển thị danh sách những người tham gia cùng session */}
                    <Text style={styles.titleInfo}>
                        Danh sách người đã được mời
                    </Text>
                    <ScrollView
                        horizontal={true}
                        alwaysBounceHorizontal={false}
                        contentContainerStyle={{
                            width: '100%',
                            height: "auto", padding: 5, paddingTop: 10, maxHeight: 350,
                            borderRadius: 15,
                        }}>
                        <FlatList
                            nestedScrollEnabled={true}
                            ref={flatListRef}
                            data={registersData}
                            renderItem={({ item }) => <InviterItem
                                onPress={() => {
                                }}
                                register={item} key={item.id} />}
                            keyExtractor={eachRegister => eachRegister.id}
                        />
                    </ScrollView>
                    {/* </View> */}
                    <Text style={[styles.titleInfo, { marginTop: 20 }]}>
                        Nội dung:
                    </Text>
                    <CustomScrollView
                        style={[
                            styles.input,
                            (isEnableUpdate && status === 'Chờ làm việc' || status === 'Hủy làm việc') || (!isEnableUpdate && status === 'Hoàn thành') ? { backgroundColor: COLORS.background } : null,
                        ]}
                        value={inviteContentString}
                        placeholder="Nội dung "
                        editable={!isJournalist && status == 'Chờ làm việc'}
                        onChangeText={(value) => {
                            setInviteContentString(value)
                            setIsChangeContent(true)
                        }}
                    />

                    {/*/////////// XEM hoặc CHỌN FILE TẢI LÊN ////////////*/}
                    {inviteFileName?.length > 0 && (
                        <Text style={styles.titleInfo}>
                            File Đính kèm:
                        </Text>)}
                    {/* // nếu tk là phóng viên hoặc buổi làm việc đã hoàn thành hoặc hủy thì hiển thị lên text và nút download*/}
                    {isJournalist ?
                        <ScrollView
                            horizontal={true}
                            alwaysBounceHorizontal={false}
                            contentContainerStyle={{
                                width: '100%',
                                height: "auto", padding: 10, paddingTop: 16, maxHeight: 300, borderRadius: 15,
                            }}>
                            <FlatList
                                data={inviteFileName}
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
                        </ScrollView> : null}
                    {/* // nếu là user CQNN thì hiển thị tên file(nếu có) và nút chọn file */}
                    {(!isJournalist) ?
                        <View style={{
                            flexDirection: 'row', borderRadius: 10, backgroundColor: 'white', borderColor: COLORS.gray, borderWidth: 1,
                            padding: 10, marginBottom: 10, marginTop: 5
                        }}>
                            <View style={{ flex: 1 }}>
                                {/* // button chọn file  */}
                                {status != 'Hoàn thành' && status != 'Hủy làm việc' ?
                                    <TouchableOpacity style={{
                                        backgroundColor: '#0373F3', width: 100, borderRadius: 10,
                                        alignSelf: 'flex-end', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 10, flexDirection: 'row',
                                        marginBottom: 5,
                                    }}
                                        disabled={status != 'Chờ làm việc'}
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
                                                enableChooseFile && setInviteFileResult(pickerResults)
                                                enableChooseFile && setIsChangeInviteFile(true)
                                            } catch (e) {
                                                handleError(e)
                                            }
                                        }}>
                                        <FontAwesome name='file-text' style={{ color: 'white', fontSize: 18, marginRight: 5 }} />
                                        <Text style={{ fontSize: 13, color: 'white' }}>
                                            Chọn File
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
                                    {!isChangeInviteFile ?
                                        <FlatList
                                            data={inviteFileName}
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
                                            data={inviteFileUri}
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
                    <View style={{ flexDirection: 'row', alignContent: 'center', alignItems: 'center' }}>
                        <Text style={styles.titleInfo}>
                            Ngày làm việc:
                            {isJournalist || status != 'Chờ làm việc' ?
                                <Text style={styles.contentInfo}> {time}</Text> : null}
                        </Text>
                    </View>
                    <View>
                        {/* ////// CƠ QUAN NHÀ NƯỚC - CHỌN LẠI NGÀY LÀM VIỆC //////// */}
                        {(!isJournalist && status == 'Chờ làm việc') ?
                            <View style={{
                                flexDirection: 'row',
                                backgroundColor: 'white',
                                borderColor: COLORS.gray,
                                borderWidth: 1,
                                borderRadius: 10,
                                padding: 10
                            }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 16, color: '#000' }}>
                                        Ngày: {inviteDateString}
                                    </Text>
                                    <Text style={{ fontSize: 16, color: '#000' }}>
                                        Vào lúc: {inviteTimeString}
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
                                        flexDirection: 'row',
                                        width: 100,
                                    }}
                                        onPress={() => setOpen(true)}>
                                        <Ionicons name='calendar' style={{ color: 'white', fontSize: 18, marginRight: 5 }} />
                                        <Text style={{ fontSize: 13, color: 'white' }}>
                                            Hẹn lại
                                        </Text>
                                    </TouchableOpacity >
                                </View>
                            </View> : null}
                    </View>
                </View>

                {(!isEditInvite || status == "Hoàn thành") ? <View>
                    {/* ////////////////// NỘI DUNG BUỔI LÀM VIỆC /////////////////// */}
                    <View style={styles.viewHeader}>
                        <Text style={styles.titleHeader}>
                            Nội dung buổi làm việc
                        </Text>
                    </View>
                    {!isOwnerConfirm && isJournalist ? <View style={styles.viewContainAllInfo}>
                        <Text style={styles.titleInfo}>
                            Bạn không tham gia lời mời làm việc này
                        </Text>
                    </View> : null}

                    {isOwnerConfirm || !isJournalist ? <View style={styles.viewContainAllInfo}>
                        <Text style={styles.titleInfo}>
                            Nội dung:
                        </Text>

                        <CustomScrollView
                            style={[
                                styles.input,
                                (isEnableUpdate && status === 'Chờ làm việc') || (!isEnableUpdate && status === 'Hoàn thành') ? { backgroundColor: COLORS.background } : null,
                            ]}
                            value={workContentString}
                            placeholder="Nội dung buổi làm việc"
                            editable={(!isJournalist && status != 'Hoàn thành') || isEnableUpdate}
                            onChangeText={(value) => {
                                setWorkContentString(value)
                            }}
                        />
                        {/*/////////// XEM hoặc CHỌN FILE TẢI LÊN ////////////*/}
                        <Text style={styles.titleInfo}>
                            File Đính kèm:
                        </Text>
                        {/* // nếu tk là phóng viên hoặc buổi làm việc đã hoàn thành hoặc hủy thì hiển thị lên text và nút download*/}
                        {isJournalist ?
                            <ScrollView
                                horizontal={true}
                                alwaysBounceHorizontal={false}
                                contentContainerStyle={{
                                    width: '100%',
                                    height: "auto", padding: 10, paddingTop: 16, maxHeight: 300, borderRadius: 15,
                                }}>
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
                            </ScrollView> : null}
                        {/* // nếu là user CQNN thì hiển thị tên file(nếu có) và nút chọn file */}
                        {(!isJournalist) ?
                            <View style={{
                                flexDirection: 'row', borderRadius: 10, backgroundColor: 'white', borderColor: COLORS.gray, borderWidth: 1,
                                padding: 10, marginBottom: 10, marginTop: 5
                            }}>
                                <View style={{ flex: 1 }}>
                                    {/* // button chọn file  */}
                                    {(!isEnableUpdate && status === 'Chờ làm việc') || (isEnableUpdate && status === 'Hoàn thành') ? (
                                        <TouchableOpacity style={{
                                            backgroundColor: '#0373F3', width: 100, borderRadius: 10,
                                            alignSelf: 'flex-end', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 10, flexDirection: 'row',
                                            marginBottom: 5,
                                        }}
                                            disabled={status == 'Hoàn thành' && !isEnableUpdate}
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
                                                    enableChooseFile && setSessionFileResult(pickerResults)
                                                    enableChooseFile && setIsChangeSessionFile(true)
                                                } catch (e) {
                                                    handleError(e)
                                                }
                                            }}>
                                            <FontAwesome name='file-text' style={{ color: 'white', fontSize: 18, marginRight: 5 }} />
                                            <Text style={{ fontSize: 13, color: 'white' }}>
                                                Chọn File
                                            </Text>
                                        </TouchableOpacity>) : null}
                                    {/* // danh sách file đã chọn hoặc file đã tải lên */}
                                    <ScrollView
                                        horizontal={true}
                                        alwaysBounceHorizontal={false}
                                        contentContainerStyle={{
                                            width: '100%', height: "auto",
                                            padding: 10, paddingTop: 16,
                                            maxHeight: 300, borderRadius: 15,
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
                                                            <Icon name='close' size={20} color={colors.newprimary} />
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                            />
                                        }
                                    </ScrollView>
                                </View>
                            </View> : null}
                    </View> : null}
                </View> : null}
            </ScrollView>

            {/* CÁC BUTTON HỦY, HẸN LẠI, XÁC NHẬN  */}
            <View style={{
                flexDirection: 'row', justifyContent: 'center',
                paddingHorizontal: 5, backgroundColor: 'white',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.6,
                shadowRadius: 10,
                elevation: 10,
            }}>
                {status != 'Hoàn thành' && status != 'Hủy làm việc' ? <TouchableOpacity style={[styles.touchOpacity, { backgroundColor: colors.cancel, flex: 1, }]}
                    onPress={onShowPopup}
                >
                    <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>
                        Hủy làm việc
                    </Text>
                </TouchableOpacity> : null}

                {((status == 'Chờ phản hồi' && isJournalist)) ?
                    //{(!isJournalist  || (status == 'Đã phản hồi' && isJournalist)) ?
                    <TouchableOpacity style={[styles.touchOpacity, { backgroundColor: colors.workDone, flex: 1 }]}
                        onPress={() => onConfirmWorking()}
                    >
                        <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>
                            Xác nhận
                        </Text>
                    </TouchableOpacity > : null}

                {(isChangeDate || isChangeInviteFile || isChangeInviteJournalist) && status == 'Chờ làm việc' ? <TouchableOpacity
                    style={[styles.touchOpacity, { backgroundColor: colors.waitConfirm, flex: 1 }]}
                    onPress={() => onChangeTime()}
                //disabled={!isChangeDate} 
                >
                    <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>
                        Hẹn lại
                    </Text>
                </TouchableOpacity > : null}
                {((!isJournalist && isHasJounalistConfim && (!isEditInvite)) || isEnableUpdate) ?
                    <TouchableOpacity style={[styles.touchOpacity, { backgroundColor: colors.workDone, flex: 1 }]}
                        onPress={() => onFinishWorking()}
                    >
                        <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>
                            {isEnableUpdate ? 'Hoàn thành cập nhật' : 'Hoàn thành'}
                        </Text>
                    </TouchableOpacity > : null}
                {/* // nếu trạng thái đã hoàn thành  */}
                {(!isJournalist && status == 'Hoàn thành' && !isEnableUpdate) ?
                    <TouchableOpacity style={[styles.touchOpacity, { backgroundColor: colors.workDone, flex: 1 }]}
                        onPress={() => setIsEnableUpdate(true)}
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
        flex: 1,
        padding: 15,
        margin: 10,
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
        color: COLORS.primary,
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
        backgroundColor: '#FFF'
    },
    viewHeader: {
        justifyContent: 'center',
        backgroundColor: 'white',
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
        width: '100%',
        borderColor: COLORS.gray,
        borderWidth: 1,
        padding: 10,
        borderRadius: 10,
        fontSize: 16,
        marginVertical: 10,
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
export default WorkInviteEdit