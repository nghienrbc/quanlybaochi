import React, { useState, useEffect, useRef } from "react";
import {
    Text, View, Image, TouchableOpacity, TextInput, ScrollView, SafeAreaView, FlatList,
    StatusBar, StyleSheet, PermissionsAndroid, Alert
} from 'react-native'
import DocumentPicker, {
    isInProgress,
    types,
} from 'react-native-document-picker'
import { COLORS, FONTS, SIZES, colors, string } from '../constants'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Icon1 from 'react-native-vector-icons/FontAwesome'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { work as workRepo, journalist as journalistRepo, notifications as notificationsRepo } from "../repositories"
import { getMyStringValue } from "../utilies/LocalDataHandler"
import { showAlert, closeAlert } from "react-native-customisable-alert";
import { CallCustomAlert } from "../utilies";
import AppLoader from '../utilies/AppLoader';
import CustomScrollView from '../Component/CustomScrollView';
import RNFetchBlob from "rn-fetch-blob";
import ProvideItem from "./ProvideItem"
import { useLayoutEffect } from "react";
import DropdownMultiSelect from '../Component/DropdownMultiSelect';
function WorkProvideEdit(props) {
    //navigation
    const { navigation, route } = props
    //functions of navigate to/back
    const { navigate, goBack } = navigation
    const [showLoading, setShowLoading] = useState(false)

    const HandleType = {
        Cancel: 0, Confirm: 1, WaitingResponse: 2
    }

    const [response, setResponse] = useState(null)
    const [isJournalist, setIsJournalist] = useState(false)
    const [searchText, setSearchText] = useState('');

    // CÁC GIÁ TRỊ SẼ GỬI LÊN POST API APOITMENT WORK  
    const [tokenString, setTokenString] = useState('')
    const [provideContentString, setProvideContentString] = useState('')
    const [provideTitleString, setProvideTitleString] = useState('')

    const [jounalists, setJounalists] = useState([])
    const [provide, setProvide] = useState([]);

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
    let WorkProvideItem = route.params.WorkProvideItem
    var { provideObject, id, title, content, time, agency, states, notifyId, notifyView } = WorkProvideItem

    const handleSearchTextChange = (text) => {
        setSearchText(text);
    };

    ////////////////// NAVIGATION OPTION ////////////////////
    useLayoutEffect(() => {
        debugger
        navigation.setOptions(
            {
                headerShown: true,
                headerTitle: 'Cung cấp thông tin',//status,
                headerTitleStyle: { fontSize: 20, fontWeight: 'bold' },
                headerTitleAlign: 'center',
                headerStyle: {
                    backgroundColor: colors.newprimary
                },
                headerTintColor: 'white',
            })

        setProvide(provideObject.sendTo)
    }, [navigation])

    useEffect(() => {
        // debugger
        if (tokenString !== "") {
            if (isJournalist) {
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
                setProvideTitleString(provideObject.title)
                setProvideContentString(provideObject.content);
                setProvideFileName(provideObject.document);
            } else {
                const allItemIds = provideObject.sendList.filter(element => element.usersId !== 0).map(element => element.usersId);
                setSelectedItems(allItemIds);
                const allEmails = provideObject.sendList.filter(item => item.usersId === 0).map(item => item.email);
                setTags(allEmails);
                setProvideTitleString(provideObject.title)
                setProvideContentString(provideObject.content);
                setProvideFileName(provideObject.document);
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

    const callPostWork = (states) => {
        if (tokenString != '') {
            if (tokenString === '' && tags === '') {
                // Cả hai trường đều rỗng, hiển thị thông báo
                showAlertWith("Thông báo", "Chưa chọn phóng viên và nhập email", 'error', 'OK')
                return
            }
            if (provideTitleString == '' || provideContentString == '') {
                // de nghi nhap ten tieu de// de nghi nhap ten tieu de
                showAlertWith("Thông báo", "Chưa nhập tiêu đề hoặc nội dung", 'error', 'OK')
                // onPress: () => closeAlert()                  
                return
            }
            if (provideFileUri.length > 5) {
                showAlertWith("Thông báo", "Chỉ có thể gởi tối đa là 5 files", 'error', 'OK');
                return
            }
            // debugger
            setShowLoading(true)
            // const newState = state === 'draft' ? 'Bản nháp' : 'Đã gởi'; 
            const successMessage = states === 'draft' ? "Lưu bản nháp cung cấp thông tin thành công" : "Cung cấp thông tin thành công";
            workRepo.postWorkProvideUpdate(tokenString, provideObject.id, sendTo, provideTitleString, provideContentString, provideFileUri, states)
                .then(
                    responseWork => {
                        setResponse(responseWork)
                        setShowLoading(false)
                        showAlert({
                            title: 'Thông báo',
                            message: successMessage,
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
                        if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
                    }
                )
        }
    }
    // call function to get data user và email
    // useEffect(() => {
    //     if (tokenString != '') {
    //         setShowLoading(true)
    //         if (isJournalist) {
    //             workRepo.getWorkProvideForJournalist(tokenString)
    //                 .then(responseInvitation => {
    //                     setProvideJournalist(responseInvitation)
    //                     setShowLoading(false)
    //                 })
    //                 .catch(
    //                     errorMessage => {
    //                         setShowLoading(false)
    //                         if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
    //                     }
    //                 )
    //         } else {
    //             workRepo.getWorkProvide(tokenString)
    //                 .then(responseProvide => {
    //                     setProvide(responseProvide)
    //                     setShowLoading(false)
    //                 })
    //                 .catch(
    //                     errorMessage => {
    //                         setShowLoading(false)
    //                         if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
    //                     }
    //                 )
    //         }
    //     }
    // }, [tokenString])
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
    let provideData = []
    // debugger
    provide.forEach(element => {
        // let provideObj = {
        //     provideObject: element,
        //     id: element.id,
        //     email: element.sendList?.filter(item => item.usersId === 0).map(item => item.email).join('\n'),
        //     namesJournalist: element.sendTo?.flatMap(item => item.journalist?.givenName).join(', '), // Lấy danh sách tên journalist từ mảng sendTo và nối chúng lại thành một chuỗi
        // };
        let provideObj = {
            id: element.id,
            isAccount: element.jounalist !== null,
            email: element.email,
            name: element?.journalist?.givenName || 'Gửi bằng email',
            pressInstitute: element?.journalist?.Institute?.name || '',
        };
        provideData.push(provideObj);
    });


    const handleDeletePress = () => {
        if (tokenString != '') {
            // debugger
            setShowLoading(true)
            if (isJournalist) {
                workRepo.deleteProvideInfoJounalist(tokenString, provideObject.id)
                    .then(
                        responseWork => {
                            setResponse(responseWork)
                            // hien thi thong bao ca xac nhan
                            setShowLoading(false)
                            showAlert({
                                title: "Thông báo",
                                message: "Đã Xóa thông tin",
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
            } else {
                workRepo.deleteProvideInfoAgencies(tokenString, provideObject.id)
                    .then(
                        responseWork => {
                            setResponse(responseWork)
                            // hien thi thong bao ca xac nhan
                            setShowLoading(false)
                            showAlert({
                                title: "Thông báo",
                                message: "Đã Xóa bản nháp",
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
                            // debugger
                            setShowLoading(false)
                            if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
                        }
                    )
            }
        }
    };
    /////////////////// USE EFFECT ///////////////////////////   
    /////////////////////// CALL API ///////////////////////////
    const showAlertWith = (title, message, alertType, btnLabel) => {
        showAlert({
            title: title,
            message: message,
            alertType: alertType,
            btnLabel: btnLabel,
        })
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

    const [tags, setTags] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };
    const addTag = () => {
        if (inputValue.trim() !== '') {
            const newTags = inputValue
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0);

            const invalidTags = newTags.filter((tag) => !validateEmail(tag));

            if (invalidTags.length === 0) {
                setTags([...tags, ...newTags]);
                setInputValue('');
            } else {
                const invalidEmails = invalidTags.join(', ');
                Alert.alert(
                    'Thông báo',
                    `Các địa chỉ email sau không hợp lệ: ${invalidEmails}`
                );
            }
        } else {
            Alert.alert(
                'Thông báo',
                'Vui lòng nhập địa chỉ email bạn muốn thêm vào ô'
            );
        }
    };
    const removeTag = (tagIndex) => {
        const newTags = tags.filter((_, index) => index !== tagIndex);
        setTags(newTags);
    };
    const clearAllTags = () => {
        setTags([]);
    };
    const sendToFromSelected = selectedItems.map(userId => {
        // Tìm người dùng có userId tương ứng trong danh sách jounalists
        const journalist = jounalists.find(journalist => journalist.id === userId);
        // Nếu tìm thấy người dùng, trả về đối tượng với userId và email
        if (journalist) {
            return { usersId: userId, email: journalist.email };
        }
        // else {
        //   return { usersId: userId, email: '' }; // Nếu không tìm thấy, gán email rỗng hoặc giá trị mặc định khác nếu cần
        // }
    });

    // Lấy mảng sendTo từ extractedEmails
    const sendToFromEmails = tags.map(email => ({ usersId: 0, email }));
    // Kết hợp mảng sendTo từ cả selectedItems và extractedEmails
    const sendTo = [...sendToFromSelected, ...sendToFromEmails];
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
    const [provideFileName, setProvideFileName] = useState([]);
    const [isChangeProvideFile, setIsChangeProvideFile] = useState(false)
    const [isChangeInviteJournalist, setIsChangeInviteJournalist] = useState(false) // kiểm tra sự thay đổi của phóng viên được mời

    //////////////// CHOOSE INVITE FILE FROM DEVICE ////////////////////
    const [provideFileUri, setProvideFileUri] = useState([]);
    const [provideFileResult, setProvideFileResult] = React.useState(null)

    useEffect(() => {
        if (provideFileResult == null) return;
        const newFileUris = provideFileResult.map((result) => result.fileCopyUri);
        setProvideFileUri((prevUri) => prevUri.concat(newFileUris.filter((item) => {
            let result = true
            prevUri.filter((prevUriItem) => { if (prevUriItem.split('/').pop() == item.split('/').pop()) result = false; })
            return result
        })))
    }, [provideFileResult]);

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
    // xóa từng file chọn lại
    const deleteFile = (fileUri) => {
        setProvideFileUri((prevFiles) => prevFiles.filter((uri) => uri !== fileUri));
    };

    ///////////////////// LAYOUT RENDER ///////////////////////////////////
    return (
        <SafeAreaView style={styles.saveAreaViewContainer}>
            {showLoading ? <AppLoader /> : null}
            <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
            <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                alwaysBounceVertical={false}
                contentContainerStyle={styles.scrollViewContainer}
            >
                <View style={styles.viewHeader}>
                    <Text style={[{ fontSize: 14 }, styles.titleHeader]}>
                        Chi tiết chủ động cung cấp thông tin
                    </Text>
                </View>
                <View style={styles.viewContainAllInfo}>
                    {isJournalist && <Text style={styles.titleInfo}>
                        Đơn vị cung cấp thông tin
                        <Text style={styles.contentInfo}> {agency}</Text>
                    </Text>}
                    <Text style={styles.titleInfo}>
                        Tiêu đề
                    </Text>
                    <CustomScrollView
                        style={[
                            styles.input,
                            (states === 'Đã gửi') ? { backgroundColor: COLORS.background } : null,
                        ]}
                        value={provideTitleString}
                        placeholder="Nhập tiêu đề"
                        editable={states !== 'Đã gửi'}
                        onChangeText={(value) => {
                            setProvideTitleString(value)
                        }}
                    />

                    {!isJournalist && states !== 'Đã gửi' ? <View style={{
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
                            selectText="Chọn phóng viên cần cung cấp thông tin"
                            onSelectedItemsChange={onSelectedItemsChange}
                            selectedItems={selectedItems}
                            searchText={searchText}
                            onSearchTextChange={handleSearchTextChange}
                            filterItems={filterItems}
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
                    {/* Tag email của pv */}
                    {!isJournalist && states !== 'Đã gửi' ?
                        <View style={{ 
                            width: '100%', backgroundColor: 'red',
                            backgroundColor: COLORS.white,
                            borderWidth: 1, paddingBottom: 5,
                            borderRadius: SIZES.radius, borderColor: COLORS.gray,
                            paddingHorizontal: 10, marginTop: 15
                        }}>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                {tags.map((tag, index) => (
                                    <View key={index}
                                        style={{
                                            flexDirection: 'row',
                                            marginTop: 10,
                                            marginStart: 10,
                                            padding: 5,
                                            borderWidth: 1,
                                            borderColor: COLORS.background,
                                            ...styles.shadow,
                                            borderRadius: 20,
                                            backgroundColor: 'white',
                                        }}>
                                        <Text numberOfLines={1} style={{}}>{tag} </Text>
                                        <TouchableOpacity onPress={() => removeTag(index)}>
                                            <Icon name="close" size={20} color="red" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                            <View>
                                <View style={{ flexDirection: 'row' }}>
                                    <TextInput
                                        style={[styles.input, {}]}
                                        placeholder={`Nhập email và nhấn nút 'Thêm' để xác nhận`}
                                        value={inputValue}
                                        onChangeText={setInputValue}
                                        onSubmitEditing={addTag}
                                        placeholderTextColor={'#BEC1D2'}
                                    />
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <TouchableOpacity onPress={addTag}
                                        style={{
                                            flexDirection: 'row',
                                            height: 35,
                                            width: 75,
                                            backgroundColor: colors.workDone,
                                            borderRadius: 10,
                                            alignContent: 'center',
                                            justifyContent: 'center',
                                            paddingVertical: 10,
                                            paddingHorizontal: 16,
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row' }}>
                                            <Image style={{ height: 16, width: 16 }}
                                                resizeMode="cover"
                                                source={require("../assets/icons/checkmark_icon.png")} />
                                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}> Thêm</Text>
                                        </View>
                                    </TouchableOpacity>
                                    {tags.length > 0 ?
                                        <TouchableOpacity onPress={() => {
                                            showAlert({
                                                title: "Thông báo",
                                                message: "Bạn muốn hủy tất cả những email đã chọn?",
                                                alertType: 'warning',
                                                btnLabel: 'Đồng ý',
                                                leftBtnLabel: 'Hủy',
                                                onPress: () => {
                                                    closeAlert()
                                                    clearAllTags();
                                                }
                                            });
                                        }}
                                            style={{
                                                flexDirection: 'row',
                                                height: 35,
                                                width: 100,
                                                backgroundColor: colors.cancel,
                                                borderRadius: 10,
                                                alignContent: 'center',
                                                justifyContent: 'center',
                                                paddingVertical: 10,
                                                paddingHorizontal: 16,
                                            }}
                                        >
                                            <View style={{ flexDirection: 'row' }}>
                                                <Image style={{ height: 16, width: 16 }}
                                                    resizeMode="cover"
                                                    source={require("../assets/icons/remove_icon.png")} />
                                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}> Hủy chọn</Text>
                                            </View>
                                        </TouchableOpacity> : null}
                                </View>
                            </View>
                        </View> : null}
                    {/* // hiển thị danh sách những người tham gia cùng session */}
                    {states === 'Đã gửi' && !isJournalist && (
                        <Text style={styles.titleInfo}>
                            Danh sách người được cung cấp
                        </Text>
                    )}

                    {states === 'Đã gửi' && !isJournalist && <ScrollView
                        horizontal={true}
                        alwaysBounceHorizontal={false}
                        contentContainerStyle={{
                            width: '100%',
                            height: "auto", padding: 5, paddingTop: 10, maxHeight: 350,
                            borderRadius: 15, marginBottom: 10
                        }}>
                        <FlatList
                            nestedScrollEnabled={true}
                            ref={flatListRef}
                            data={provideData}
                            renderItem={({ item }) => <ProvideItem
                                onPress={() => {
                                }}
                                provide={item} key={item.id} />}
                            keyExtractor={each => each.id}
                        />
                    </ScrollView>}
                    {/* </View> */}
                    <Text style={[styles.titleInfo, {}]}>
                        Nội dung:
                    </Text>
                    <CustomScrollView
                        style={[
                            styles.input,
                            (states === 'Đã gửi') ? { backgroundColor: COLORS.background } : null,
                        ]}
                        value={provideContentString}
                        placeholder="Nội dung"
                        editable={states !== 'Đã gửi'}

                        onChangeText={(value) => {
                            setProvideContentString(value)
                        }}
                    />

                    {/*/////////// XEM hoặc CHỌN FILE TẢI LÊN ////////////*/}
                    {(provideFileName?.length > 0 || states === 'Bản nháp') && (
                        <Text style={styles.titleInfo}>
                            File Đính kèm:
                        </Text>
                    )}

                    {(provideFileName?.length > 0 || states === 'Bản nháp') && (
                        <View style={{
                            flexDirection: 'row', borderRadius: 10, backgroundColor: 'white', borderColor: COLORS.gray, borderWidth: 1,
                            padding: 10, marginBottom: 10, marginTop: 5
                        }}>
                            <View style={{ flex: 1 }}>
                                {/* // button chọn file  */}
                                {states !== 'Đã gửi' && (
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
                                                enableChooseFile && setProvideFileResult(pickerResults)
                                                enableChooseFile && setIsChangeProvideFile(true)
                                            } catch (e) {
                                                handleError(e)
                                            }
                                        }}>
                                        <FontAwesome name='file-text' style={{ color: 'white', fontSize: 18, marginRight: 5 }} />
                                        <Text style={{ fontSize: 13, color: 'white' }}>
                                            Chọn File
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                {/* // danh sách file đã chọn hoặc file đã tải lên */}
                                <ScrollView
                                    horizontal={true}
                                    alwaysBounceHorizontal={false}
                                    contentContainerStyle={{
                                        width: '100%',
                                        height: "auto", padding: 10, paddingTop: 16, maxHeight: 300, borderRadius: 15,
                                    }}>
                                    {!isChangeProvideFile ?
                                        <FlatList
                                            data={provideFileName}
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
                                            data={provideFileUri}
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
                        </View>)}
                </View>
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
                {states !== 'Đã gửi' ?
                    <TouchableOpacity style={[styles.touchOpacity, { backgroundColor: colors.cancel, flex: 1, }]}
                        onPress={() => {
                            showAlert({
                                title: "Thông báo",
                                message: "Bạn muốn Xóa bản nháp này? (thao tác này không thể hoàn tác)",
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
                            Xóa
                        </Text>
                    </TouchableOpacity> : null}

                {isJournalist && (
                    <TouchableOpacity style={[styles.touchOpacity, { backgroundColor: colors.cancel, flex: 1, }]}
                        onPress={() => {
                            showAlert({
                                title: "Thông báo",
                                message: "Bạn muốn Xóa bản thông tin này? (thao tác này không thể hoàn tác)",
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
                            Xóa
                        </Text>
                    </TouchableOpacity>)}

                {(!isJournalist && states !== 'Đã gửi') ?
                    <TouchableOpacity style={[styles.touchOpacity, { backgroundColor: COLORS.darkgray, flex: 1 }]}
                        onPress={() => {
                            showAlert({
                                title: "Thông báo",
                                message: "Bạn muốn lưu bản nháp này ?",
                                alertType: 'warning',
                                btnLabel: 'Đồng ý',
                                leftBtnLabel: 'Hủy',
                                onPress: () => {
                                    closeAlert()
                                    callPostWork('draft');
                                }
                            });
                        }}
                    >
                        <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>
                            Lưu nháp
                        </Text>
                    </TouchableOpacity > : null}
                {/* // nếu trạng thái đã hoàn thành  */}
                {(!isJournalist && states !== 'Đã gửi') ?
                    <TouchableOpacity style={[styles.touchOpacity, { backgroundColor: colors.newprimary, flex: 1 }]}
                        onPress={() => {
                            showAlert({
                                title: "Thông báo",
                                message: "Bạn muốn gởi thông tin này ?",
                                alertType: 'warning',
                                btnLabel: 'Đồng ý',
                                leftBtnLabel: 'Hủy',
                                onPress: () => {
                                    closeAlert()
                                    callPostWork('completed');
                                }
                            });
                        }}
                    >
                        <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>
                            Gửi lên
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
export default WorkProvideEdit