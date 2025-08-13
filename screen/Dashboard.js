import React, { useState, useEffect } from "react";
import { useIsFocused } from '@react-navigation/native';
import {
    Text,
    View,
    Image,
    ImageBackground,
    TouchableOpacity,
    ScrollView,
    SafeAreaView, StyleSheet,
    FlatList,
    Platform,
    Modal
} from 'react-native'
import { images, colors, string, FONTS, COLORS } from "../constants";
import AntDesign from 'react-native-vector-icons/AntDesign'
import { getMyStringValue, setStringValue } from "../utilies/LocalDataHandler"
import { user as userRepo, notifications as notificationsRepo } from "../repositories"

import { annoucement as annoucementRepo } from '../repositories'
import { showAlert, closeAlert } from "react-native-customisable-alert";
import { convertDateToDateTimeString } from "../utilies/DateTime"

import PressReleaseSlideItem from "./PressReleaseSlideItem";
import Icon from 'react-native-vector-icons/FontAwesome'

import { CallCustomAlert } from "../utilies";
import AppLoader from '../utilies/AppLoader';

import GridItem from './GridItem';
import NotificationItem from "./item/NotificationItem";
import { ActivityIndicator } from "react-native-paper";
import messaging from '@react-native-firebase/messaging';

function Dashboard(props) {
    //navigation
    const { navigation, route } = props
    const isFocused = useIsFocused();
    //functions of navigate to/back
    const { navigate, goBack } = navigation
    // handle Click on your avatar in the dashboard
    const handleProfilePress = () => {
        navigation.navigate('Profile');
    };
    const [showLoading, setShowLoading] = useState(false)
    const [annoucement, setAnnoucement] = useState([]);
    const [isJournalist, setIsJournalist] = useState(false)
    const [isManage, setIsManage] = useState(false)
    const [givenName, setGivenName] = useState('')
    const [imageUrl, setImageUrl] = useState('https://img.icons8.com/color/344/circled-user-male-skin-type-5.png')
    const [deviceType, setDeviceType] = useState('')

    const [tokenString, setTokenString] = useState('')
    const [userTypeID, setUserTypeID] = useState('')

    //Load thêm  thông báo
    const [isLoading, setIsLoading] = useState(false)
    const [isOpenNotifPane, setIsOpenNotifPane] = useState(false)
    //View thông báo xem tất cả hoặc chưa xem
    const [viewNotify, setViewNotify] = React.useState("all")

    const flatListRef = React.useRef()

    const [isRefresh, setIsRefresh] = useState(false)
    useEffect(() => {
        const notificationHandler = async () => {
            console.log('notificationHandler worklist');
            messaging().onNotificationOpenedApp(remoteMessage => {
                console.log("remote message:", remoteMessage);
                showAlert({
                    title: remoteMessage.notification.title,
                    message: remoteMessage.notification.body,
                    alertType: 'success',
                    btnLabel: 'OK',
                    onPress: () => {
                        if (route.name == 'Dashboard') {
                            setIsRefresh(true)
                        }
                        closeAlert()
                    }
                })
            })
            const unsubcrible = messaging().onMessage(async (remoteMessage) => {
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
                            setIsRefresh(true)
                        }
                        closeAlert()
                    }
                })
                //navigate('UITab')  
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
                        if (route.name == 'Dashboard') {
                            setIsRefresh(true)
                        }
                        closeAlert()
                    }
                })
            });
            return unsubcrible;
        }
        debugger
        if (isFocused == true) {
            notificationHandler();
        }
    }, [isFocused]);


    useEffect(() => {
        console.log(isFocused ? 'focus dashboard' : 'lost focus dashboard')
        debugger
        if (tokenString != '' && isFocused) {
            setIsRefresh(false)
            setShowLoading(true)
            annoucementRepo.getAllAnnoucement(tokenString)
                .then(responseAnnoucement => {
                    setAnnoucement(responseAnnoucement)
                })
                .then(
                    notificationsRepo.getAllNotifications(tokenString)
                        .then(responseNotification => {
                            setNotificationArray(responseNotification)
                            setShowLoading(false)
                        })
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
    }, [isFocused]);

    useEffect(() => {
        // console.warn('refresh') 
        debugger
        if (tokenString != '' && isRefresh) {
            setIsRefresh(false)
            setShowLoading(true)
            annoucementRepo.getAllAnnoucement(tokenString)
                .then(responseAnnoucement => {
                    setAnnoucement(responseAnnoucement)
                })
                .then(
                    notificationsRepo.getAllNotifications(tokenString)
                        .then(responseNotification => {
                            setNotificationArray(responseNotification)
                            setShowLoading(false)
                        })
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
    }, [isRefresh]);


    getMyStringValue("userTypeID").then((value) => {
        const data = value;
        setUserTypeID(data)
        setIsJournalist(data == 7)
        setIsManage(data == 2)
        getMyStringValue("token").then((value) => {
            const data = value;
            setTokenString(data)
        })
    })
    getMyStringValue("givenName").then((value) => {
        const data = value;
        setGivenName(data)
    })
    const [userID, setUserID] = useState('')
    getMyStringValue("userID").then((value) => {
        const data = value;
        setUserID(data)
    })
    const [userObject, setUserObject] = useState(null)
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
            setImageUrl(`${string.IMAGEURL}${userObject.avatar}`)
        }
    }, [userObject])

    const [notificationArray, setNotificationArray] = useState([])
    useEffect(() => {
        setDeviceType(Platform.OS === 'ios' ? 'IOS' : 'ANDROID')

        if (isManage) {
            setDashboardItem(manageDashboard)
        } else {
            if (isJournalist) {
                setDashboardItem(journalistDashboard)
            } else {
                setDashboardItem(instituteDashboard)
            }
        }
    }, [tokenString])


    const callOpenNoticationPane = () => {
        setIsOpenNotifPane(!isOpenNotifPane)
    }
    const callLogout = () => {
        showAlert({
            title: "Đăng xuất",
            message: "Bạn muốn đăng xuất khỏi thiết bị này?",
            alertType: 'warning',
            btnLabel: 'Đồng ý',
            leftBtnLabel: 'Hủy',
            onPress: () => {
                closeAlert()
                // show loading view
                setShowLoading(true)
                userRepo.getLogout(tokenString, deviceType).then(
                    responseUser => {
                        if (responseUser) {
                            setShowLoading(false)
                            // set token
                            setStringValue("token", "") 
                            navigation.goBack()
                        }
                    }
                ).catch(
                    errorMessage => {
                        setShowLoading(false)
                        if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
                    }
                )
            },
        });
    }

    let notificationObjList = []
    let numberOfUnreadNotif = []
    notificationArray.length > 0 && notificationArray.forEach(element => {
        //debugger
        let notificationObj = {
            notifyObject: element,
            id: element.id,
            avatar: element.sender.avatar ?
                (string.IMAGEURL + element.sender.avatar) : (string.IMAGEURL + '/noimage.png'),
            table: element.table,
            idTable: element.idTable,
            title: element?.sender?.Institute?.name,
            subTitle: element?.sender?.TypeUser.name + ' - ' + element?.sender?.givenName,
            action: 'Vừa ' + element.contentAction,
            time: convertDateToDateTimeString(element.createdAt),
            viewUsersId: element.viewUsersId
        }
        // notificationObjList.push(notificationObj)
        if (element.viewUsersId == null) {
            numberOfUnreadNotif.push(notificationObj)
        }
        //xử lý trả về view all thông báo và view chưa đọc 
        if (viewNotify === 'all' || (viewNotify === 'unread' && element.viewUsersId == null)) {
            notificationObjList.push(notificationObj)
        }
    });
    //loadmore notifications
    const [reachedEnd, setReachedEnd] = useState(false);
    const [loadmoreI, setLoadMoreI] = useState(10)
    const listData = notificationObjList.slice(0, loadmoreI)
    const loadMoreItem = () => {
        if (listData.length >= notificationObjList.length) {
            setReachedEnd(true); // Đã đến cuối danh sách
            return;
        }
        setIsLoading(true)
        setTimeout(() => {
            setLoadMoreI(loadmoreI + 10)
            setIsLoading(false)
        }, 1000);
    }

    useEffect(() => {
        if (tokenString != '') {
            setShowLoading(true)
            annoucementRepo.getAllAnnoucement(tokenString)
                .then(responseAnnoucement => {
                    setAnnoucement(responseAnnoucement)
                })
                .then(
                    notificationsRepo.getAllNotifications(tokenString)
                        .then(responseNotification => {
                            setNotificationArray(responseNotification)
                            setShowLoading(false)
                        })
                        .catch(
                            errorMessage => {
                                debugger
                                setShowLoading(false)
                                if (errorMessage != 'Not found') CallCustomAlert.showAlertWith("string.CANT_CONNECT_SERVER", "error", "OK")
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
    }, [tokenString])

    let annoucementList = []
    console.log(annoucementList)
    annoucement != null && annoucement.length > 0 && annoucement.forEach(element => {
        debugger
        let annoucementObj = {
            annocementObject: element,
            id: element.id,
            title: element.title,
            content: element.content,
            sender: element.sender?.Institute?.name,
            createdAt: convertDateToDateTimeString(element.createdAt),
            imageUrl: element.thumbnail && element.thumbnail.length > 0 ?
                string.IMAGEURL + element.thumbnail[0].file_path + '/' + element.thumbnail[0].file_name :
                'http://10.220.5.13:8090/api/v1/media/view/event.jpg'
        };
        annoucementList.push(annoucementObj);
    });


    var [dashboardItem, setDashboardItem] = useState([])
    var journalistDashboard = [
        {
            name: 'Danh sách đăng ký làm việc',
            image: isJournalist ? images.inviteWorking : images.worklist,
            badge: 2
        },
        {
            name: 'Đề nghị cung cấp thông tin',
            image: images.requireInfo,
            badge: 3
        },
        {
            name: 'Chủ động cung cấp thông tin',
            image: images.provideinfo,
            badge: 3
        },
        {
            name: 'Danh sách mời làm việc',
            image: !isJournalist ? images.inviteWorking : images.worklist,
            badge: 2
        },
        {
            name: 'Thông cáo báo chí',
            image: images.annoucement,
            badge: 2
        },
        {
            name: 'Danh sách người phát ngôn',
            image: images.agencyList,
            badge: 2
        },
        {
            name: 'Danh sách phóng viên',
            image: images.jounalistList,
            badge: 2
        },
        {
            name: 'Phản ánh báo chí',
            image: images.reflectinfo,
            badge: 2
        },
    ]

    var instituteDashboard = [
        {
            name: 'Danh sách đăng ký làm việc',
            image: isJournalist ? images.inviteWorking : images.worklist,
            badge: 2
        },
        {
            name: 'Danh sách buổi làm việc',
            image: images.present,
            badge: 2
        },
        {
            name: 'Đề nghị cung cấp thông tin',
            image: images.requireInfo,
            badge: 3
        },
        {
            name: 'Chủ động cung cấp thông tin',
            image: images.provideinfo,
            badge: 3
        },
        {
            name: 'Danh sách mời làm việc',
            image: !isJournalist ? images.inviteWorking : images.worklist,
            badge: 2
        },
        {
            name: 'Phản ánh báo chí',
            image: images.reflectinfo,
            badge: 2
        },
        {
            name: 'Thông cáo báo chí',
            image: images.annoucement,
            badge: 2
        },
        {
            name: 'Danh sách người phát ngôn',
            image: images.agencyList,
            badge: 2
        },
        {
            name: 'Danh sách cơ quan báo chí',
            image: images.pressinstitute,
            badge: 2
        },
        {
            name: 'Danh sách phóng viên',
            image: images.jounalistList,
            badge: 2
        },
        {
            name: '',
            // image: images.jounalistList,
            badge: 2
        },
        {
            name: '',
            // image: images.jounalistList,
            badge: 2
        }
    ]

    var manageDashboard = [
        {
            name: 'Danh sách đăng ký làm việc',
            image: isJournalist ? images.inviteWorking : images.worklist,
            badge: 2
        },
        {
            name: 'Danh sách buổi làm việc',
            image: images.present,
            badge: 2
        },
        {
            name: 'Đề nghị cung cấp thông tin',
            image: images.requireInfo,
            badge: 3
        },
        {
            name: 'Chủ động cung cấp thông tin',
            image: images.provideinfo,
            badge: 3
        },
        {
            name: 'Phản ánh báo chí',
            image: images.reflectinfo,
            badge: 2
        },
        {
            name: 'Thông cáo báo chí',
            image: images.annoucement,
            badge: 2
        },
        {
            name: 'Danh sách người phát ngôn',
            image: images.agencyList,
            badge: 2
        },
        {
            name: 'Danh sách cơ quan báo chí',
            image: images.pressinstitute,
            badge: 2
        },
        {
            name: 'Danh sách phóng viên',
            image: images.jounalistList,
            badge: 2
        },
        {
            name: '',
            badge: 2
        },
        {
            name: '',
            // image: images.jounalistList,
            badge: 2
        },
        {
            name: '',
            // image: images.jounalistList,
            badge: 2
        }
    ]

    const callGetNotifyDetail = (tableName, notifyID) => {
        if (tokenString != '') {
            setShowLoading(true)
            debugger
            if (tableName == 'detailInvite') {
                notificationsRepo.getNotificationDetailForInvite(tokenString, notifyID).then(
                    responseNotifyDetail => {
                        setIsOpenNotifPane(false)
                        if (isJournalist) {
                            let invitationJounalistObj = {
                                invitationObject: responseNotifyDetail,
                                id: responseNotifyDetail.id,
                                title: responseNotifyDetail.workInvite.titleInvite,
                                agency: responseNotifyDetail.workInvite.sender?.Institute?.name,
                                time: convertDateToDateTimeString(new Date(parseInt(responseNotifyDetail.workInvite.dateInvite))),
                                status: (responseNotifyDetail.workInvite.contentSession != null && responseNotifyDetail.workInvite.actived == true) ? "Hoàn thành" :
                                    (responseNotifyDetail.status == 0 || responseNotifyDetail.workInvite.reasonCancel != null ? "Hủy làm việc" : (responseNotifyDetail.status == 1 ? "Chờ làm việc" : "Chờ phản hồi")),
                                userTypeID: isJournalist ? 7 : 3,
                            }
                            navigate('WorkInviteEdit', {
                                WorkInviteItem: invitationJounalistObj
                            })
                        }
                        else {
                            let invitationObj = {
                                invitationObject: responseNotifyDetail,
                                id: responseNotifyDetail.id,
                                title: responseNotifyDetail.titleInvite,
                                agency: null,
                                time: convertDateToDateTimeString(new Date(parseInt(responseNotifyDetail.dateInvite))),
                                status: responseNotifyDetail.actived == false ? "Hủy làm việc" : (responseNotifyDetail.contentSession != null ? "Hoàn thành" : "Chờ làm việc"),
                                userTypeID: isJournalist ? 7 : 3,
                            }
                            navigate('WorkInviteEdit', {
                                WorkInviteItem: invitationObj
                            })
                        }
                        // hien thi thong bao ca xac nhan 
                        setShowLoading(false)
                    }
                )
                    .then(
                        notificationsRepo.getUpdateViewNotify(tokenString, notifyID).then(
                            responseSessions => {
                            })
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
            else if (tableName == 'claimBack') {
                notificationsRepo.getNotificationDetailForClaim(tokenString, notifyID).then(
                    responseNotifyDetail => {
                        debugger
                        setIsOpenNotifPane(false)
                        let requireObj = {
                            requireObject: responseNotifyDetail,
                            id: responseNotifyDetail.id,
                            title: responseNotifyDetail.title,
                            content: responseNotifyDetail.content,
                            agency: isJournalist ? responseNotifyDetail.institute.name : responseNotifyDetail.sender?.Institute?.name,
                            time: responseNotifyDetail.confirm.apointmentDate != undefined ? convertDateToDateTimeString(new Date(parseInt(responseNotifyDetail.confirm.apointmentDate))) : null,
                            status: responseNotifyDetail.status == 1 ? "Đã phản hồi" :
                                (responseNotifyDetail.status == 2 ? "Chờ phản hồi" : "Hủy yêu cầu"),
                            senderName: responseNotifyDetail.sender.givenName,
                            notifyId: !isJournalist ? responseNotifyDetail.notifyId : (responseNotifyDetail.confirm.length > 0 ? responseNotifyDetail.confirm[0].notifyId : 0),
                            notifyView: !isJournalist ? responseNotifyDetail.notifyView : (responseNotifyDetail.confirm.length > 0 ? responseNotifyDetail.confirm[0].notifyView : 0),

                            userTypeID: isJournalist ? 7 : 3,
                        }

                        navigate('RequireInfoEditScreen', {
                            requireInfoItem: requireObj
                        })
                        // hien thi thong bao ca xac nhan 
                        setShowLoading(false)
                    }
                )
                    .then(
                        notificationsRepo.getUpdateViewNotify(tokenString, notifyID).then(
                            responseSessions => {
                            })
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
            else if (tableName == 'complainDetail' || tableName == 'complain') {
                notificationsRepo.getNotificationDetailForReport(tokenString, notifyID).then(
                    responseNotifyDetail => {
                        debugger
                        setIsOpenNotifPane(false)
                        let reportObj = {
                            reportObject: responseNotifyDetail,
                            id: responseNotifyDetail.id,
                            title: responseNotifyDetail.title,
                            content: responseNotifyDetail.content,
                            agency: responseNotifyDetail.sender?.Institute?.name,
                            timeCreate: convertDateToDateTimeString(responseNotifyDetail.updatedAt),
                            status: responseNotifyDetail.feedback.length > 0 ? "Đã phản hồi" : "Chờ phản hồi",
                            senderName: responseNotifyDetail.sender.givenName,
                            notifyId: isManage ? responseNotifyDetail.notifyId : (responseNotifyDetail.feedback.length > 0 ? responseNotifyDetail.feedback[0].notifyView : 0),
                            notifyView: isManage ? responseNotifyDetail.notifyView : (responseNotifyDetail.feedback.length > 0 ? responseNotifyDetail.feedback[0].notifyView : 0),
                            userTypeID: isManage ? 2 : (isJournalist ? 7 : 3),
                        }
                        navigate('ReportInfoEditScreen', {
                            reportInfoItem: reportObj
                        })
                        // hien thi thong bao ca xac nhan 
                        setShowLoading(false)
                    }
                )
                    .then(
                        notificationsRepo.getUpdateViewNotify(tokenString, notifyID).then(
                            responseSessions => {
                            })
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
            else if (tableName == 'provide') {
                debugger
                notificationsRepo.getNotificationDetailForProvide(tokenString, notifyID).then(
                    responseNotifyDetail => {
                        setIsOpenNotifPane(false)
                        let provideJournalistObj = {
                            provideObject: responseNotifyDetail,
                            id: responseNotifyDetail.id,
                            title: responseNotifyDetail.title,
                            agency: responseNotifyDetail.sender?.Institute?.name,
                            time: convertDateToDateTimeString(new Date((responseNotifyDetail.updatedAt))),
                            timeOrigin: responseNotifyDetail.updatedAt,
                            states: (responseNotifyDetail.states === 'draft' ? "Bản nháp" : "Đã gửi"),
                            userTypeID: isManage ? 2 : (isJournalist ? 7 : 3),
                            notifyId: responseNotifyDetail.notifyId,
                            notifyView: responseNotifyDetail.notifyView
                        }

                        navigate('WorkProvideEdit', {
                            WorkProvideItem: provideJournalistObj
                        })
                        // hien thi thong bao ca xac nhan 
                        setShowLoading(false)
                    }
                )
                    .then(
                        notificationsRepo.getUpdateViewNotify(tokenString, notifyID).then(
                            responseSessions => {
                            })
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
            else {
                notificationsRepo.getNotificationDetail(tokenString, notifyID)
                    .then(
                        responseNotifyDetail => {
                            setIsOpenNotifPane(false)
                            if (tableName == 'claim') {
                                let requireObj = {
                                    requireObject: responseNotifyDetail,
                                    id: responseNotifyDetail.id,
                                    title: responseNotifyDetail.title,
                                    content: responseNotifyDetail.content,
                                    agency: isJournalist ? responseNotifyDetail.institute.name : responseNotifyDetail.sender?.Institute?.name,
                                    time: responseNotifyDetail.confirm.apointmentDate != undefined ? convertDateToDateTimeString(new Date(parseInt(responseNotifyDetail.confirm.apointmentDate))) : null,
                                    status: responseNotifyDetail.status == 1 ? "Đã phản hồi" :
                                        (responseNotifyDetail.status == 2 ? "Chờ phản hồi" : "Hủy yêu cầu"),
                                    senderName: responseNotifyDetail.sender.givenName,
                                    notifyId: !isJournalist ? responseNotifyDetail.notifyId : (responseNotifyDetail.confirm.length > 0 ? responseNotifyDetail.confirm[0].notifyId : 0),
                                    notifyView: !isJournalist ? responseNotifyDetail.notifyView : (responseNotifyDetail.confirm.length > 0 ? responseNotifyDetail.confirm[0].notifyView : 0),

                                    userTypeID: isJournalist ? 7 : 3,
                                }
                                if (!responseNotifyDetail.isDelete) {
                                    navigate('RequireInfoEditScreen', {
                                        requireInfoItem: requireObj
                                    })
                                }
                                else {
                                    CallCustomAlert.showAlertWith("Đề nghị cung cấp thông tin đã bị xóa", "error", "OK")
                                }
                            }
                            else if (tableName == 'workRegister') {
                                let workObj = {
                                    workObject: responseNotifyDetail,
                                    id: responseNotifyDetail.id,
                                    title: responseNotifyDetail.title,
                                    responseTitle: responseNotifyDetail.sessionContent.respWorkSession ? responseNotifyDetail.sessionContent.respWorkSession : responseNotifyDetail.sessionContent.workSession,
                                    content: responseNotifyDetail.content,
                                    agency: isJournalist ? responseNotifyDetail.receiveUnit.name : responseNotifyDetail.senderUsers?.Institute?.name,
                                    time: convertDateToDateTimeString(new Date(parseInt(responseNotifyDetail.sessionContent.dateSession))),
                                    status: responseNotifyDetail.statusApointment == 0 ? "Hủy đăng ký" :
                                        (responseNotifyDetail.statusWork == 2 ? (responseNotifyDetail.statusApointment == 1 ? "Chờ làm việc" :
                                            responseNotifyDetail.statusApointment == 2 ? "Chờ phê duyệt" : "Đã phản hồi") :
                                            (responseNotifyDetail.statusWork == 1 ? "Hoàn thành" : "Hủy đăng ký")),
                                    senderName: responseNotifyDetail.senderUsers.givenName,
                                    userTypeID: isJournalist ? 7 : 3,
                                    sessionId: responseNotifyDetail.sessionContent ? responseNotifyDetail.sessionContent.id : null,
                                    notifyId: responseNotifyDetail.appointment[0].notifyId != null ? responseNotifyDetail.appointment[0].notifyId : responseNotifyDetail.notifyId,
                                    notifyView: responseNotifyDetail.appointment[0].senderId == userID || responseNotifyDetail.direct == true
                                        || (!isJournalist && responseNotifyDetail.appointment[0].notifyId == null && responseNotifyDetail.notifyView) ? 0 : responseNotifyDetail.appointment[0].notifyView,
                                    direct: responseNotifyDetail.direct,
                                }

                                navigate('WorkEdit', {
                                    workItem: workObj
                                })
                            }

                            else if (tableName == 'workInvite') {
                                if (isJournalist) {
                                    let invitationJounalistObj = {
                                        invitationObject: responseNotifyDetail,
                                        id: responseNotifyDetail.id,
                                        title: responseNotifyDetail.workInvite.titleInvite,
                                        agency: responseNotifyDetail.workInvite.sender?.Institute?.name,
                                        time: convertDateToDateTimeString(new Date(parseInt(responseNotifyDetail.workInvite.dateInvite))),
                                        status: (responseNotifyDetail.workInvite.contentSession != null && responseNotifyDetail.workInvite.actived == true) ? "Hoàn thành" :
                                            (responseNotifyDetail.status == 0 || responseNotifyDetail.workInvite.reasonCancel != null ? "Hủy làm việc" : (responseNotifyDetail.status == 1 ? "Chờ làm việc" : "Chờ phản hồi")),
                                        userTypeID: isJournalist ? 7 : 3,
                                    }
                                    navigate('WorkInviteEdit', {
                                        WorkInviteItem: invitationJounalistObj
                                    })
                                }
                                else {
                                    let invitationObj = {
                                        invitationObject: responseNotifyDetail,
                                        id: responseNotifyDetail.id,
                                        title: responseNotifyDetail.titleInvite,
                                        agency: null,
                                        time: convertDateToDateTimeString(new Date(parseInt(responseNotifyDetail.dateInvite))),
                                        status: responseNotifyDetail.actived == false ? "Hủy làm việc" : (responseNotifyDetail.contentSession != null ? "Hoàn thành" : "Chờ làm việc"),
                                        userTypeID: isJournalist ? 7 : 3,
                                    }
                                    navigate('WorkInviteEdit', {
                                        WorkInviteItem: invitationObj
                                    })
                                }
                            }
                            // hien thi thong bao ca xac nhan 
                            setShowLoading(false)
                        }
                    )
                    .then(
                        notificationsRepo.getUpdateViewNotify(tokenString, notifyID).then(
                            responseSessions => {
                            })
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
    }
    // random câu mừng cuối trang
    const [greeting, setGreeting] = useState('');
    const [icon, setIcon] = useState('');
    useEffect(() => {
        const greetings = [
            { text: 'Chúc Bạn một ngày đầy phấn khởi!', icons: require("../assets/icons/heart_icon.png") },
            { text: 'Chúc Bạn một ngày thú vị và hạnh phúc!', icons: require("../assets/icons/heart1_icon.png") },
            { text: 'Chúc Bạn một ngày đầy năng lượng!', icons: require("../assets/icons/heart2_icon.png") },
            { text: 'Chúc Bạn một ngày tốt lành!', icons: require("../assets/icons/heart3_icon.png") },
            { text: 'Chúc Bạn một ngày tràn đầy niềm vui!', icons: require("../assets/icons/heart4_icon.png") },
            { text: 'Chúc Bạn một ngày tràn đầy cảm hứng!', icons: require("../assets/icons/heart5_icon.png") },
            { text: 'Chúc Bạn một ngày may mắn và thành công!', icons: require("../assets/icons/heart6_icon.png") }
        ];

        const randomIndex = Math.floor(Math.random() * greetings.length);
        const randomGreeting = greetings[randomIndex];
        setGreeting(randomGreeting.text);
        setIcon(randomGreeting.icons);
    }, []);

    return <SafeAreaView style={{
        flex: 1,
        backgroundColor: '#F5F5F5'
    }}>
        {showLoading ? <AppLoader /> : null}
        {/* Hiện ra modal thông báo notification */}
        <Modal
            transparent={true}
            visible={isOpenNotifPane}>
            <TouchableOpacity onPress={() => { setIsOpenNotifPane(false) }}
                style={{ backgroundColor: '#000000aa', flex: 1 }}>
                <View onStartShouldSetResponder={() => true}
                    style={{
                        backgroundColor: '#FFFFFF', margin: 20,
                        borderRadius: 8, paddingBottom: 10
                    }}>
                    <View style={{
                        flexDirection: 'row', marginBottom: 10,
                        justifyContent: 'space-between', margin: 10
                    }}>
                        <Text style={{
                            fontWeight: 'bold', fontSize: 18,
                            color: colors.newprimary,
                        }}>Thông báo</Text>
                        <TouchableOpacity onPress={() => { setIsOpenNotifPane(false) }}>
                            <Icon name='close' style={{ color: 'black', fontSize: 20 }} />
                        </TouchableOpacity>
                    </View>
                    {/* nút trả về view tất cả và chưa học thông báo  */}
                    <View style={{ flexDirection: 'row', marginBottom: 5, marginStart: 10 }}>
                        <TouchableOpacity onPress={() => setViewNotify("all")}
                            style={{
                                backgroundColor: viewNotify == "all" ? colors.newprimary : null,
                                padding: 6, borderRadius: 20, paddingHorizontal: 10
                            }}>
                            <Text style={{
                                color: viewNotify == "all" ? COLORS.white : COLORS.primary,
                                fontWeight: 'bold', fontSize: 12,
                            }}>Tất cả</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setViewNotify("unread")}
                            style={{
                                backgroundColor: viewNotify == "unread" ? colors.newprimary : null,
                                padding: 6, borderRadius: 20, paddingHorizontal: 10
                            }}>
                            <Text style={{
                                color: viewNotify == "unread" ? COLORS.white : COLORS.primary,
                                fontWeight: 'bold', fontSize: 12,
                            }}>Chưa đọc</Text>
                        </TouchableOpacity>
                    </View>
                    {notificationObjList.length > 0 ?
                        <FlatList
                            nestedScrollEnabled={true}
                            style={{ height: 'auto', maxHeight: 350 }}
                            ref={flatListRef}
                            data={listData}
                            renderItem={({ item }) => <NotificationItem
                                onPress={() => {
                                    debugger
                                    callGetNotifyDetail(item.table, item.id)
                                }}
                                NotificationItem={item} key={item.id} />}
                            keyExtractor={eachWork => eachWork.id}
                            ListFooterComponent={() => (
                                <>
                                    {isLoading ? (
                                        <View style={{
                                            marginTop: 10,
                                            alignSelf: 'center',
                                            flexDirection: 'row',
                                        }}>
                                            <ActivityIndicator size="small" color='#bf0826' />
                                        </View>
                                    ) : (
                                        reachedEnd && (
                                            <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 10, flexDirection: 'row' }}>
                                                <Image style={{ height: 24, width: 24, }}
                                                    resizeMode="contain"
                                                    source={require("../assets/icons/bellReadAll1.png")} />
                                                <Text style={{ fontSize: 13, fontWeight: '400' }}> Bạn đã xem hết thông báo!</Text>
                                            </View>
                                        )
                                    )}
                                </>
                            )}
                            onEndReached={loadMoreItem}
                            onEndReachedThreshold={0.1}
                        />
                        :
                        viewNotify === "unread" ?
                            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 30 }}>
                                <Image style={{ height: 100, width: 100 }}
                                    resizeMode="contain"
                                    source={require("../assets/icons/bellNotify_icon.png")} />
                                <Text style={{
                                    fontSize: 15, color: 'black',
                                    fontWeight: 'bold', marginTop: 15
                                }}>Bạn chưa có bất kì thông báo mới nào!</Text>
                                <Text style={{
                                    fontSize: 15
                                }}>Hãy quay lại sau</Text>
                            </View>
                            :
                            viewNotify === "all" && (
                                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 30 }}>
                                    <Image style={{ height: 100, width: 100 }}
                                        resizeMode="contain"
                                        source={require("../assets/icons/bellNotify_icon.png")} />
                                    <Text style={{
                                        fontSize: 15, color: 'black',
                                        fontWeight: 'bold', marginTop: 15
                                    }}>Bạn chưa có bất kì thông báo mới nào!</Text>
                                    <Text style={{
                                        fontSize: 15
                                    }}>Hãy quay lại sau</Text>
                                </View>
                            )}
                </View>
            </TouchableOpacity>
        </Modal>
        {/* View dash board */}
        <ScrollView
            showsVerticalScrollIndicator={false}
            alwaysBounceVertical={false}
        >
            <View style={{
                width: '100%',
                height: 80,
                backgroundColor: '#bf0826',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row'

            }}>
                <TouchableOpacity onPress={handleProfilePress}>
                    <ImageBackground style={{
                        height: 50, width: 50,
                    }}
                        imageStyle={{
                            borderRadius: 70, borderWidth: 1,
                            borderColor: 'white', marginStart: 15
                        }}
                        resizeMode="contain"
                        source={{ uri: imageUrl }} />
                </TouchableOpacity>
                <View style={{
                    flex: 1,
                    backgroundColor: '#bf0826',
                    marginBottom: 10, marginStart: 15
                }}>
                    <Text style={{
                        color: 'white',
                        fontSize: 12,
                        marginLeft: 10,
                    }}>Xin chào <Image style={{ height: 22, width: 22 }}
                        resizeMode="contain"
                        source={require("../assets/icons/byeHand_icon.png")} />
                    </Text>
                    <Text numberOfLines={2}
                        style={{
                            color: 'white',
                            fontSize: 12,
                            fontWeight: 'bold',
                            marginLeft: 10
                        }}>{givenName}</Text>
                </View>
                {/* Hiển số thông báo nếu không có thông báo thì ẩn số */}

                <View style={{ justifyContent: 'center', padding: 20, paddingTop: 5 }}>
                    <TouchableOpacity
                        onPress={() => callOpenNoticationPane()}>
                        {numberOfUnreadNotif.length > 0 ?
                            <Text style={{
                                borderRadius: 50, width: 17,
                                right: -18, bottom: -13,
                                height: 14, backgroundColor: 'white',
                                width: 16, color: colors.newprimary,
                                fontSize: 10, textAlign: 'center',
                                fontWeight: 'bold'
                            }}>{numberOfUnreadNotif.length}</Text>
                            :
                            <View style={{
                                borderRadius: 50, width: 17,
                                right: -18, bottom: -13,
                                height: 14, backgroundColor: colors.newprimary,
                                width: 16, color: colors.newprimary,
                            }}></View>}

                        <Image style={{ height: 36, width: 36, tintColor: 'white' }}
                            resizeMode="contain"
                            source={require("../assets/images/bellno.png")} />
                    </TouchableOpacity>
                </View>

                <View style={{ justifyContent: 'center', padding: 20 }}>
                    <TouchableOpacity
                        onPress={() => callLogout()}>
                        <AntDesign name='logout' style={{ color: 'white', fontSize: 20 }} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{
                    ...FONTS.h3,
                    color: 'black',
                    fontWeight: 'bold',
                    marginStart: 10,
                    marginTop: 10,
                }}>Tiện ích</Text>
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
                        style={{ marginTop: 10 }}
                        data={dashboardItem}
                        numColumns={4}
                        keyExtractor={item => item.name}
                        renderItem={({ item, index }) => <GridItem
                            item={item}
                            index={index}
                            onPress={() => {
                                if (item.name == 'Danh sách đăng ký làm việc') {
                                    navigate('WorkList')
                                }
                                else if (item.name == 'Danh sách mời làm việc') {
                                    navigate('WorkInviteList')
                                }
                                else if (item.name == 'Thông cáo báo chí') {
                                    navigate('PressReleaseListScreen')
                                }
                                else if (item.name == 'Danh sách người phát ngôn') {
                                    navigate('AgenciesListSreens')
                                }
                                else if (item.name == 'Danh sách phóng viên') {
                                    navigate('JounalistScreen')
                                }
                                else if (item.name == 'Danh sách buổi làm việc') {
                                    navigate('SessionListScreen')
                                }
                                else if (item.name == 'Đề nghị cung cấp thông tin') {
                                    navigate('RequireInfoListScreen')
                                }
                                else if (item.name == 'Chủ động cung cấp thông tin') {
                                    navigate('WorkProvideList')
                                }
                                else if (item.name == 'Danh sách cơ quan báo chí') {
                                    navigate('PressAgencyListScreen')
                                }
                                else if (item.name == 'Phản ánh báo chí') {
                                    navigate('ReportInfoListScreen')
                                }
                            }}
                        />}
                    />
                </ScrollView>

            </View>
            <View style={{ backgroundColor: 'white', height: 10, width: '100%' }}></View>
            <View style={{
                flex: 1.3,
                marginTop: 10,
            }}>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginHorizontal: 10,
                }}>
                    <Text style={{
                        ...FONTS.h3,
                        color: 'black',
                        fontWeight: 'bold',
                    }}>Sự kiện sắp đến <Image style={{ height: 18, width: 18 }}
                        resizeMode="contain"
                        source={require("../assets/icons/event_icon.png")} />
                    </Text>
                    <TouchableOpacity onPress={() => {
                        navigate('PressReleaseListScreen')
                    }}>
                        <Text style={{
                            fontSize: 14, color: colors.newprimary
                        }}>Xem tất cả
                            <Image style={{ height: 12, width: 12, tintColor: colors.newprimary }}
                                resizeMode="contain"
                                source={require("../assets/icons/arrowRight_icon.png")} />
                        </Text>
                    </TouchableOpacity>
                </View>
                <ScrollView
                    alwaysBounceHorizontal={false}
                    contentContainerStyle={styles.scrollViewContainer}
                >
                    <FlatList
                        nestedScrollEnabled={true}
                        data={annoucementList}
                        renderItem={({ item }) => {
                            return <PressReleaseSlideItem
                                onPress={() => {
                                    navigate('PressReleaseEditScreen', {
                                        pressReleaseItem: item
                                    })
                                }}
                                annoucement={item} key={item.id} />
                        }}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={eachWork => eachWork.id}
                    />
                </ScrollView>
            </View>
            <View style={{ alignSelf: 'center', margin: 6, fontWeight: 'bold', flexDirection: 'row' }}>
                <Text style={{ color: 'black', ...FONTS.h4 }}>
                    {greeting}
                </Text>
                <Image
                    style={{ height: 22, width: 22, marginStart: 5 }}
                    resizeMode="contain"
                    source={icon}
                />
            </View>
        </ScrollView>
    </SafeAreaView>
}
const styles = StyleSheet.create({
    scrollViewContainer: {
        flexGrow: 1,
    },
});
export default Dashboard
