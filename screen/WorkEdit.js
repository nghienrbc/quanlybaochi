import React, { useState, useEffect } from "react";
import {
  Text, 
  View, 
  Image, 
  TouchableOpacity,
  ScrollView, 
  SafeAreaView, 
  FlatList,
  StatusBar, 
  StyleSheet, 
  PermissionsAndroid
} from 'react-native'

import DocumentPicker, {
  DirectoryPickerResponse,
  DocumentPickerResponse,
  isInProgress,
  types, type
} from 'react-native-document-picker'

import { COLORS, FONTS, SIZES, colors, string } from '../constants'
import Icon from 'react-native-vector-icons/FontAwesome'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon1 from 'react-native-vector-icons/MaterialIcons'
import DatePicker from 'react-native-date-picker'

import { work as workRepo, sessions as sessionsRepo, notifications as notificationsRepo } from "../repositories"
import { convertDateTimeToDateString, convertDateTimeToTimeString, convertDateToDateTimeString } from "../utilies/DateTime"
import {getMyStringValue } from "../utilies/LocalDataHandler"
import BottomPopup from '../Component/BottomPopup'

import { showAlert, closeAlert } from "react-native-customisable-alert";
import DropdownSingleSelect from '../Component/DropdownSingleSelect';
import { CallCustomAlert } from "../utilies";
import AppLoader from '../utilies/AppLoader';

import RNFetchBlob from "rn-fetch-blob";
import RegisterItem from "./RegisterItem";

import CustomScrollView from '../Component/CustomScrollView';
function WorkEdit(props) {
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

  const [requestDate, setRequestDate] = useState()
  const [responseDate, setResponseDate] = useState()
  const [reqDateString, setReqDateString] = useState('')
  const [reqTimeString, setReqTimeString] = useState('')
  const [resDateString, setResDateString] = useState('')
  const [resTimeString, setResTimeString] = useState('')


  const [instituteID, setInstituteID] = useState(0); // lưu id CQNN

  const [sessions, setSessions] = useState([]); // MẢNG LƯU DANH SÁCH CÁC SESSION
  const [registers, setRegisters] = useState([]) // MẢNG LƯU DANH SÁCH CÁC REGISTER


  // CÁC GIÁ TRỊ SẼ GỬI LÊN POST API APOITMENT WORK  
  const [tokenString, setTokenString] = useState('')
  const [sessionTime, setSessionTime] = useState();
  const [resContentString, setResContentString] = useState('')
  const [reqContentString, setReqContentString] = useState('')
  const [isChangeContent, setIsChangeContent] = useState('')
  const [respWorkSession, setRespWorkSession] = useState('');

  const [isWorkInExistSession, setIsWorkInExistSession] = useState(false); // kiểm tra đăng ký làm việc có thuộc vào 1 session khác hay không
  const [sessionChooseByInstitute, setSessionChooseByInstitute] = useState(0);
  const [isAddJounalistToWrongSession, setIsAddJounalistToWrongSession] = useState(false);

  const [sessionDate, setSessionDate] = useState()
  const [sessionDateString, setSessionDateString] = useState('')
  const [sessionTimeString, setSessionTimeString] = useState('')
  const [workContentString, setWorkContentString] = useState('')
  const [workProblemString, setWorkProblemString] = useState('')

  var filePath = ''
  var fileName = ''

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
    setIsManage(data == 2)
    setIsJournalist(data == 7)
  })
  getMyStringValue("userID").then((value) => {
    const data = value;
    setUserID(data)
  })

  ////////////////// GET VALUE FROM NAVIGATION ////////////
  let workEditItem = route.params.workItem
  var { workObject, id, agency, title, time, content, status, sessionId, notifyId, notifyView } = workEditItem

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
    if (workObject.requestday != null && workObject.requestday != "") {
      setRequestDate(new Date(parseInt(workObject.requestday)))
    }
    if (workObject.responseday != null && workObject.responseday != "") {
      setResponseDate(new Date(parseInt(workObject.responseday)))
    }

    if (status == "Chờ làm việc") {
      if (workObject.workingday !== null && workObject.workingday !== "") {
        setRequestDate(new Date(parseInt(workObject.workingday)))
        setResponseDate(new Date(parseInt(workObject.workingday)))
      }
    }
    setReqContentString(workObject.requestContent != null ? workObject.requestContent : '')
    setResContentString(workObject.responseContent != null ? workObject.responseContent : '')
    setRequestFileName(workObject.requestDocument != null ? workObject.requestDocument : workObject.docmentsRegsiter)
    setResponseFileName(workObject.responseDocument != null ? workObject.responseDocument : [])
    // lấy tên session
    setRespWorkSession(workObject.sessionContent.respWorkSession != null ? workObject.sessionContent.respWorkSession : workObject.title)
    setInstituteID(workObject.receiveUnit.id)
    setSessionTime(workObject.sessionContent.dateSession)
    setSessionFileName(workObject.workContent.documents != null ? workObject.workContent.documents : [])
    setWorkContentString(workObject.workContent.result != "null" ? workObject.workContent.result : '')
    setWorkProblemString(workObject.workContent.problems != "null" ? workObject.workContent.problems : '')
  }, [])

  useEffect(() => {
    if (tokenString != '') {
      // lấy danh sách các session của 1 CQNN, để CQNN có thể add đăng ký này vào 1 session khác
      setShowLoading(true)
      // debugger
      sessionsRepo.getSessionsByInstituteIDAndSessionID(tokenString, instituteID, 0, 1, 2).then(
        responseSessions => {
          setSessions(responseSessions)
          let registerSession = responseSessions.find(data => data.id == sessionId) // tìm session trùng với sessionid đang làm việc
          if (registerSession && registerSession.register.length > 1) { // nếu session đó có từ 1 register trở lên
            // ở đây nếu chỉ có 1 register thì đó ko phải là register của người mới đăng ký, vì mới
            // đăng ký thì session của register đó chưa vào danh sách hiển thị vì trang thái chưa phải là chờ làm việc 
            setIsWorkInExistSession(true)   // session đó đang làm việc chung
            setRegisters(registerSession.register) // lấy danh sách register của session đang làm việc
          }
          if (registerSession && registerSession.register.length == 1) { // nếu session đó có từ 1 register
            // nếu register đó là của người khác user đăng nhập thì chứng tỏ là đang chọn làm việc chung
            if (registerSession.register[0].senderId != workObject.senderUsers.id) {
              setIsWorkInExistSession(true)   // session đó đang làm việc chung
              setRegisters(registerSession.register) // lấy danh sách register của session đang làm việc
            }
          }
          setShowLoading(false)
        })
        .then(
          notifyView == null && notificationsRepo.getUpdateViewNotify(tokenString, notifyId).then(
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
        )
        .catch(
          errorMessage => {
            setShowLoading(false)
            debugger
            if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
          }
        )
    }
  }, [tokenString])

  /////////////////// xữ lý danh sách register để hiển thị lên flatlist //////////////////
  let registersData = []
  registers.length > 0 && registers.forEach(element => {
    //debugger
    let registerObj = {
      "id": element.id || 0,
      "senderId": element.senderId || 0,
      "senderUserName": element.senderUsers?.givenName || "",
      "agency": element.senderUsers?.Institute?.name || "",
    }
    registersData.push(registerObj)
  })

  ///////////////////// LẤY DANH SÁCH SESSION LƯU VÀO MẢNG sessionsData /////////////////// 
  const sessionsData = []
  sessions.length > 0 && sessions.forEach(element => {
    if (element.register.find(data => data.senderId == workObject.senderUsers?.id) == null) {
      //debugger
      let sessionObj = {
        "id": element.id,
        "label": element.respWorkSession ? element.respWorkSession || "" : element.workSession || "",
        "value": element.id,
        "workSession": element.respWorkSession ? element.respWorkSession || "" : element.workSession || "",
        "dateSession": element.dateSession || "0",
        "statusSession": element.statusSession || 0,
        "register": element.register
      }
      sessionsData.push(sessionObj)
    }
  })

  /////////////////// XỮ LÝ KHI CQNN CHỌN SESSIOn CÓ SẴN TRONG DROPDOWN /////////////////////////// 
  // KHI CHỌN 1 SESSION CÓ SẴN
  const onChangeSession = (selectedItems) => {
    //console.warn(selectedItems[0])  
    setSessionChooseByInstitute(selectedItems[0])   // lưu id session CQNN chọn vào biến
    setIsAddJounalistToWrongSession(false)
    registersData.length = 0;
    setRegisters([])
    setResDateString('');
    setResTimeString('');
    if (selectedItems[0] == 0) {
      setRespWorkSession('')
      return
    }
    // nếu chọn 1 session có sẵn thì phải gán title và ngày làm việc của session có sẵn với đăng ký này 
    let selectSession = sessionsData.find(data => data.id === selectedItems[0]);
    if (selectSession != null) {
      //console.warn(selectSession.dateSession)

      // kiểm tra nếu buổi đó phóng viên đã join vào thì đưa ra thông báo      
      if (selectSession.register.find(data => data.senderId == workObject.senderUsers.id)) {
        CallCustomAlert.showAlertWith("Phóng viên đã tham gia vao buổi làm việc này", 'error', 'OK')
        setIsAddJounalistToWrongSession(true)
        return
      }
      // đã lấy được session
      setDate(new Date(parseInt(selectSession.dateSession)))
      setIsChangeDate(true)
      setSessionTime(selectSession.dateSession)
      selectSession.register != null && setRegisters(selectSession.register)
      setRespWorkSession(selectSession.respWorkSession ? selectSession.respWorkSession : selectSession.workSession)
    };
  }

  /////////////////// USE EFFECT ///////////////////////////
  useEffect(() => {
    //debugger
    if (requestDate != null) {
      setReqDateString(convertDateTimeToDateString(requestDate));
      setReqTimeString(convertDateTimeToTimeString(requestDate));
    }
  }, [requestDate])

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
      if (isJournalist) {
        setReqDateString(convertDateTimeToDateString(date));
        setReqTimeString(convertDateTimeToTimeString(date));
      }
      if (!isJournalist) {
        setResDateString(convertDateTimeToDateString(date));
        setResTimeString(convertDateTimeToTimeString(date));
      }
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
    //console.warn(popupRef.state.reasonString)
    //setReasonString(popupRef.state.reasonString || "")
    if (popupRef.state.reasonString != '') {
      popupRef.closePopup()
      // post data to api 
      callPostWorkApoiment(HandleType.Cancel)
    }
    else {
      // thông báo chưa nhập lý do hủy
      CallCustomAlert.showAlertWith("Chưa nhập lý do hủy đăng ký", 'error', 'OK')
    }
  }
  const onClosePopupWhenCancel = () => {
    //console.warn(popupRef.state.reasonString)
    popupRef.closePopup()
  }

  ////////////////// CLICK VÀO NÚT HẸN LẠI ////////////////////
  const onChangeTime = () => {
    if ((isJournalist && reqDateString == '') || (!isJournalist && resDateString == '')) {
      CallCustomAlert.showAlertWith("Chưa chọn thời gian làm việc", 'error', 'OK')
      return
    } else {
      // show confirm popup, neu dong y hen lai thi call API  
      let timeToShow = isJournalist == true ? reqDateString : resDateString
      timeToShow += ' '
      timeToShow += isJournalist == true ? reqTimeString : resTimeString
      //console.warn(sessionId)
      showAlert({
        title: "Hẹn làm việc",
        message: "Thời gian làm việc: " + timeToShow,
        alertType: 'warning',
        btnLabel: 'Đồng ý',
        leftBtnLabel: 'Hủy',
        onPress: () => {
          closeAlert()
          callPostWorkApoiment(isJournalist ? HandleType.ChangeTime : HandleType.HadResponsed)
        },
      });
    }
  }
  // đồng ý cuộc hẹn từ phóng viên
  const onConfirmWorking = () => {
    debugger
    let timeToShow = isJournalist == true ? resDateString : reqDateString
    timeToShow += ' '
    timeToShow += isJournalist == true ? resTimeString : reqTimeString
    if (isWorkInExistSession) {
      timeToShow = reqDateString + ' ' + reqTimeString
    }
    else if (sessionChooseByInstitute != 0) {
      timeToShow = resDateString + ' ' + resTimeString
    }
    // kiểm tra phóng viên này đã join vào buổi làm việc này hay chưa
    let selectSession = sessionsData.find(data => data.id === sessionId);
    if (selectSession != null) {
      if (selectSession.register.find(data => data.senderId == workObject.senderUsers.id)) {
        CallCustomAlert.showAlertWith("Phóng viên đã tham gia vao buổi làm việc này", 'error', 'OK')
        return
      }
    }
    showAlert({
      title: "Xác nhận lịch làm việc",
      message: "Thời gian làm việc: " + timeToShow,
      alertType: 'warning',
      btnLabel: 'Đồng ý',
      leftBtnLabel: 'Hủy',
      onPress: () => {
        closeAlert()
        callPostWorkApoiment(HandleType.Confirm)
      },
    });
  }

  /////////////////////// CALL API ///////////////////////////
  const callPostWorkApoiment = (handleType) => {
    if (tokenString != '') {
      debugger
      setShowLoading(true)
      let timestamp;// = new Date(isChangeDate ? date : (isJournalist ? requestDate : responseDate)).getTime()
      if (handleType == 1) { // nếu đồng ý làm việc theo hẹn
        if (isJournalist) {
          setRequestDate(responseDate) // nếu là phòng viên thì set ngày yêu cầu thành ngày phản hồi
        } else {
          setResponseDate(requestDate) // nếu CQNN thì set ngày phản hồi thành ngày yêu cầu
        }
        timestamp = new Date(isJournalist ? responseDate : requestDate).getTime()
        if (sessionChooseByInstitute != 0) { // nếu CQNN add đk vào một session khác
          sessionId = sessionChooseByInstitute
          timestamp = new Date(date).getTime()
        }
      }
      if (handleType == 2 || handleType == 3) { // nếu hẹn lại
        timestamp = new Date(date).getTime()

        if (sessionChooseByInstitute != 0) { // nếu CQNN add đk vào một session khác
          sessionId = sessionChooseByInstitute
          timestamp = new Date(date).getTime()
        }
        // Call API cập nhật thời gian của session, API đó sẽ gửi thông báo tới 
        // các register về thời gian thay đổi của session
      }
      // nếu đã join vào 1 session khác
      if (isWorkInExistSession || sessionChooseByInstitute != 0) {
        timestamp = sessionTime
      }
      workRepo.postWorkApoiment(tokenString, workObject.appointment[0].id,
        timestamp, title === respWorkSession ? null : respWorkSession, isJournalist ? reqContentString : resContentString,
        popupRef.state.reasonString, handleType,
        (isChangeResFile || isChangeReqFile) ? (isJournalist ? requestFileUri : responseFileUri) : null, sessionId)
        .then(
          responseWork => {
            setResponse(responseWork)
            // hien thi thong bao ca xac nhan
            debugger
            setShowLoading(false)
            showAlert({
              title: "Thông báo",
              message: handleType == 0 ? "Đã hủy đăng ký làm việc" :
                (handleType == 1 ? "Đã xác nhận đăng ký làm việc" : "Đã cập nhật thông tin"),
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
            //if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
          }
        )
    }
  }

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
    // debugger
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

  //////////////// CHOOSE FILE FROM DEVICE ////////////////////

  const [requestFileName, setRequestFileName] = useState([]); // lưu file từ api
  const [responseFileName, setResponseFileName] = useState([]); // lưu file từ api
  const [sessionFileName, setSessionFileName] = useState([]); // lưu file từ api

  const [isChangeReqFile, setIsChangeReqFile] = useState(false)
  const [isChangeResFile, setIsChangeResFile] = useState(false)

  const [requestFileUri, setRequestFileUri] = useState([]); // lưu file uri chọn từ device
  const [responseFileUri, setResponseFileUri] = useState([]); // lưu file uri chọn từ device


  const [requestFileResult, setRequestFileResult] = React.useState(null) // lưu file chọn từ device
  const [responseFileResult, setResponseFileResult] = React.useState(null) // lưu file chọn từ device

  ///// REQUEST FILE //////
  useEffect(() => {
    if (requestFileResult == null) return;
    const newFileUris = requestFileResult.map((result) => result.fileCopyUri);
    setRequestFileUri((prevUri) => prevUri.concat(newFileUris.filter((item) => {
      let result = true
      prevUri.filter((prevUriItem) => {if (prevUriItem.split('/').pop() == item.split('/').pop()) result = false; })     
      return result
    })))
  }, [requestFileResult]);

  const deleteRequestFile = (fileUri) => {
    setRequestFileUri((prevFiles) => prevFiles.filter((uri) => uri !== fileUri));
  };

  ///// RESPONSE FILE //////
  useEffect(() => {
    if (responseFileResult == null) return;
    const newFileUris = responseFileResult.map((result) => result.fileCopyUri); 
    setResponseFileUri((prevUri) => prevUri.concat(newFileUris.filter((item) => {
      let result = true
      prevUri.filter((prevUriItem) => {if (prevUriItem.split('/').pop() == item.split('/').pop()) result = false; })     
      return result
    }))) 
  }, [responseFileResult]);

  const deleteResponseFile = (fileUri) => {
    setResponseFileUri((prevFiles) => prevFiles.filter((uri) => uri !== fileUri));
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
        title="Đồng ý Hủy đăng ký này"
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
          <Text style={[styles.contentInfo, { color: 'white', fontWeight: 'bold', marginTop: -7 }]}>
            {/* {isWorkInExistSession ? workObject.sessionContent.uCancelSession.givenName : workObject.appointment[0].sender.givenName} */}
            {workObject.appointment[0].sender.givenName}
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.titleInfo}>
              Lý do:
              <Text style={[styles.titleInfo, { color: 'white' }]}>
                {workObject.statusApointment == 0 ? workObject.appointment[0].reason : workObject.sessionContent.reasonCancel}
                {/* {workObject.appointment[0].reason} */}
              </Text>
            </Text>
          </View>
        </View> : null}
        {/* Hiển thị danh sách công việc đã có ở đây */}
        {/* nếu trạng thái của đăng ký là chờ phê duyệt, kiểm tra session id của đk đó có bao nhiêu phóng viên trong đó rồi */}
        <View style={styles.viewHeader}>
          <Text style={styles.titleHeader}>
            {workObject.direct == true ? 'Chi tiết đăng ký trực tiếp' : 'Chi tiết đăng ký'}
          </Text>
        </View>
        <View style={styles.viewContainAllInfo}>
          {!isJournalist ? <View style={{ marginBottom: 3, paddingBottom: 3 }}>
            <Text style={styles.titleInfo}>
              Người đăng ký:
              <Text style={styles.contentInfo}> {workObject.senderUsers?.givenName}</Text>
            </Text>
          </View> : null}
          {!isJournalist ? <View style={{ marginBottom: 3, paddingBottom: 3 }}>
            <Text style={styles.titleInfo}>
              Đơn vị đăng ký:
              <Text style={styles.contentInfo}> {workObject.senderUsers?.Institute?.name}</Text>
            </Text>
          </View> : null}
          {isJournalist ? <View style={{ marginBottom: 3, paddingBottom: 3 }}>
            <Text style={styles.titleInfo}  >
              Tỉnh:
              <Text style={styles.contentInfo}> Quảng Bình</Text>
            </Text>
          </View> : null}
          {isJournalist ? <View style={{ marginBottom: 3, paddingBottom: 3 }}>
            <Text style={styles.titleInfo}>
              Đơn vị:
              <Text style={styles.contentInfo}> {agency}</Text>
            </Text>
          </View> : null}

          <Text style={styles.titleInfo}>
            Tiêu đề đăng ký:
          </Text>
          <CustomScrollView
            style={[styles.input, {backgroundColor:COLORS.background }]}
            value={title}
            placeholder=""
            editable={false}
        />
          {/* // hiển thị danh sách những người tham gia cùng session */}
          {isWorkInExistSession ? <Text style={styles.titleInfo}>
            Danh sách người tham dự
          </Text> : null}
          {isWorkInExistSession ?
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
                renderItem={({ item }) => <RegisterItem
                register={item} key={item.id} />}
                keyExtractor={eachRegister => eachRegister.id}
              />
            </ScrollView> : null
          }

          <Text style={styles.titleInfo}>
            Nội dung:
          </Text>
          <CustomScrollView
            style={[
              styles.input,
              (status === 'Hoàn thành' || status === 'Hủy đăng ký' || status === 'Chờ phê duyệt' || status === 'Đã phản hồi' || status === 'Chờ làm việc' ) ? { backgroundColor:COLORS.background } : null,
              { backgroundColor: (isJournalist && (status === 'Chờ phê duyệt' || status === 'Chờ làm việc'|| status === 'Đã phản hồi')) ? 'white' : null },
            ]}
            value={reqContentString}
            placeholder="Nội dung"
            editable={isJournalist && !isWorkInExistSession && status != "Hoàn thành" && status != "Hủy đăng ký" ? true : false}
            onChangeText={(value) => {
              setReqContentString(value)
              setIsChangeContent(true)
            }}
        />
          {/* /////////////////////// HIỂN THỊ FILE CỦA PHẦN ĐĂNG KÝ ////////////////////////// */}
          {(requestFileName?.length > 0 || requestFileUri?.length > 0) && (
          <Text style={styles.titleInfo}>
            File Đính kèm:
          </Text>)}
          {/* nếu là user cơ quan nhà nước */}
          {!isJournalist ? <ScrollView
            horizontal={true}
            alwaysBounceHorizontal={false}
            contentContainerStyle={{
              width: '100%',height: "auto", 
              padding: 10, paddingTop: 16, 
              maxHeight: 300, borderRadius: 15,
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
          </ScrollView> : null}

          {/* // nếu là user Phóng viên thì hiển thị tên file(nếu có) và nút chọn file */}
          {(!isWorkInExistSession && isJournalist && status != 'Hủy đăng ký' && (requestFileName?.length > 0 || requestFileUri?.length > 0)) ?
            <View style={{
              flexDirection: 'row', borderRadius: 10, backgroundColor: 'white', borderColor: COLORS.gray, borderWidth: 1,
              padding: 10, marginBottom: 10, marginTop: 5
            }}>
              <View style={{ flex: 1 }}>
                {/* // button chọn file  */}
              {status != 'Hoàn thành' ?
                <TouchableOpacity style={{
                  backgroundColor: '#0373F3', width: 100, borderRadius: 10,
                  alignSelf: 'flex-end', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 10, flexDirection: 'row',
                  marginBottom: 5,
                }}
                  disabled={status == 'Hoàn thành' || status == 'Hủy đăng ký'}
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
                </TouchableOpacity>: null}
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
                          <TouchableOpacity onPress={() => deleteRequestFile(fileUri)}>
                            <Icon name='close' size={20} color={colors.newprimary} />
                          </TouchableOpacity>
                        </View>
                      )}
                    />
                  }
                </ScrollView>
              </View>
            </View> : null}
          {/* ////// PHONG VIEN - CHỌN NGÀY LÀM VIỆC //////// */}
          <View style={{ flexDirection: 'row', alignContent: 'center', alignItems: 'center' }}>
            <Text style={styles.titleInfo}>
              {isWorkInExistSession ? 'Ngày làm việc:' : 'Ngày đề xuất:'}
            </Text>
            {(!isJournalist || status == 'Hủy đăng ký') ? <Text style={styles.contentInfo}>
              {convertDateTimeToDateString(requestDate) + " " + convertDateTimeToTimeString(requestDate)}
            </Text> : null}
          </View>

          {(isJournalist && status != 'Hủy đăng ký') ? <View style={{ flexDirection: 'row', borderColor: COLORS.gray, borderRadius: SIZES.radius, borderWidth: 1, padding: 10, backgroundColor: 'white' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, color: '#000' }}>
                Ngày: {reqDateString}
              </Text>
              <Text style={{ fontSize: 16, color: '#000' }}>
                Vào lúc: {reqTimeString}
              </Text>
            </View>

            {/* // nếu PV đã join vào 1 session có săn thì không hẹn lại */}
            {!isWorkInExistSession && status != 'Hoàn thành'  ? <View style={{ justifyContent: 'center', }}>
              <TouchableOpacity style={{
                backgroundColor: '#0373F3',
                borderRadius: 10,
                alignContent: 'center',
                justifyContent: 'center',
                paddingVertical: 10,
                paddingHorizontal: 10,
                flexDirection: 'row'
              }}
                onPress={() => setOpen(true)} 
                disabled={status == 'Hủy đăng ký' || status == 'Hoàn thành'}>
                <Ionicons name='calendar' style={{ color: 'white', fontSize: 20, marginRight: 10 }} />
                <Text style={{ fontSize: 14, color: 'white' }}>
                  Hẹn lại
                </Text>
              </TouchableOpacity>
            </View> : null}
          </View> : null}

        </View>
        {/* ////////////////// PHẦN CƠ QUAN NHÀ NƯỚC /////////////////// */}
        {workObject.direct == false ? <View style={styles.viewHeader}>
          <Text style={styles.titleHeader}>
            Chi tiết phản hồi
          </Text>
        </View> : null}

        {workObject.direct == false ? <View style={styles.viewContainAllInfo}>

          {/* ///////////// hiển thị dropdown danh sách các buổi làm việc nếu sessionID chỉ có 1 register ///////// */}
          {!isWorkInExistSession && !isJournalist && !isManage && status != 'Hủy đăng ký' && workObject.direct == false && status != 'Hoàn thành'  ? 
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
                  selectedItems={[sessionChooseByInstitute]}
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
                onPress={() => {
                  onChangeSession([0])
                }}>
                <Icon name='remove' style={{ color: 'black', fontSize: 30 }} />
              </TouchableOpacity >
            </View> : null}

          {sessionChooseByInstitute != 0 ? <Text style={styles.titleSmallHeader}>
            Danh sách người tham dự
          </Text> : null}
          {sessionChooseByInstitute != 0 ?
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
                renderItem={({ item }) => <RegisterItem
                  onPress={() => {
                    //console.warn(`register item: ${item.id}`)
                  }}
                  register={item} key={item.id} />}
                keyExtractor={eachRegister => eachRegister.id}
              />
            </ScrollView> : null
          }

          {/* tiêu đề buổi làm việc của CQNN được sử dụng làm tên session */}
          <View style={{ flexDirection: 'row', alignContent: 'center', alignItems: 'center' }}>
            <Text style={styles.titleInfo}>
              Tiêu đề buổi làm việc:
            </Text>
          </View>
          <CustomScrollView
            style={[
              styles.input,
              {
                backgroundColor: (isJournalist || isManage || isWorkInExistSession || sessionChooseByInstitute != 0) ? COLORS.background : (status === 'Hoàn thành' || status === 'Hủy đăng ký') ?  COLORS.background : 'white',
              },
            ]}
            value={respWorkSession}
            placeholder="Tiêu đề buổi làm việc"
            editable={!isJournalist && !isWorkInExistSession && sessionChooseByInstitute == 0 && status != 'Hủy đăng ký' && status != 'Hoàn thành' && !isManage}
            onChangeText={(value) => {
              setRespWorkSession(value)
            }}
        />
          <View style={{ flexDirection: 'row', alignContent: 'center', alignItems: 'center' }}>
            <Text style={styles.titleInfo}>
              Nội dung phản hồi:
            </Text>
          </View>
          <CustomScrollView
            style={[
              styles.input,
              {
                backgroundColor: (isJournalist || isManage) ? COLORS.background : (status === 'Hoàn thành' || status === 'Hủy đăng ký') ?  COLORS.background : 'white',
              },
            ]}
            value={resContentString}
            placeholder="Nội dung phản hồi"
            editable={!isJournalist && status != 'Hủy đăng ký' && status != 'Hoàn thành'&&!isManage}
            onChangeText={(value) => {
              setResContentString(value)
              setIsChangeContent(true)
            }}
        />
          {/* /////////////////////// HIỂN THỊ FILE CỦA PHẦN PHẢN HỒI ////////////////////////// */}

          {/*///////// HIỂN THỊ TÊN FILE VÀ NUT DOWNLOAD NẾU LÀ USER PHÓNG VIÊN ///////////*/}
          {responseFileName?.length > 0 && (
          <Text style={styles.titleInfo}>
            File Đính kèm:
          </Text>)}
          {isJournalist ? <ScrollView
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
          </ScrollView> : null}

          {/*//////////// hiển thị chọn file nếu user là cơ quan nhà nước  && (responseFileName.length > 0 || responseFileUri.length > 0) ///////////*/}
          {(!isWorkInExistSession && !isJournalist && status !== 'Hủy đăng ký') ? (
          <View style={{
            flexDirection: 'row', borderRadius: 10, 
            backgroundColor: 'white', borderColor: COLORS.gray, borderWidth: 1,
            padding: 10, marginBottom: 10, marginTop: 5
          }}>
            <View style={{ flex: 1 }}>
              {/* // button chọn file  */}
              {!isManage && (
                <TouchableOpacity style={{
                  backgroundColor: '#0373F3', width: 100, borderRadius: 10,
                  alignSelf: 'flex-end', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 10, flexDirection: 'row',
                  marginBottom: 5,
                }}
                  // disabled={status !== 'Chờ làm việc'}
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
                        <TouchableOpacity onPress={() => deleteResponseFile(fileUri)}>
                          <Icon name='close' size={20} color={colors.newprimary} />
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                }
              </ScrollView>
            </View>
          </View>
        ) : null}

          {/* /////////////// thời gian phản hồi ///////////////////// //!isJournalist &&*/}
          {/* // nếu làm việc trong 1 session đã có */}
          {isWorkInExistSession ?
            <View style={{ flexDirection: 'row', alignContent: 'center', alignItems: 'center' }}>
              <Text style={styles.titleInfo}>
                Thời gian phản hồi:
              </Text>
              <Text style={styles.contentInfo}>
                {convertDateToDateTimeString(new Date(parseInt(workObject.sessionContent.dateSession)))}
              </Text>
            </View> : null}
          {/* // nếu là một đăng ký làm việc riêng */}
          {!isWorkInExistSession ? <View>
            <View style={{ flexDirection: 'row', alignContent: 'center', alignItems: 'center' }}>
              <Text style={styles.titleInfo}>
                Thời gian phản hồi:
              </Text>
              {(isJournalist || status == 'Hủy đăng ký') ? <Text style={styles.contentInfo}>
                {resDateString + " " + resTimeString}
              </Text> : null}
            </View>
            {(status != 'Hủy đăng ký' && !isJournalist) ?
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

                {sessionChooseByInstitute == 0 && !isManage && status !== 'Hoàn thành'? <View style={{ justifyContent: 'center', }}>
                  <TouchableOpacity style={{
                    backgroundColor: '#0373F3',
                    borderRadius: 10,
                    alignContent: 'center',
                    justifyContent: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 10,
                    flexDirection: 'row'
                  }}
                    disabled={status == 'Hủy đăng ký' || status == 'Hoàn thành'}
                    onPress={() => setOpen(true)}>
                    <Ionicons name='calendar' style={{ color: 'white', fontSize: 20, marginRight: 10 }} />
                    <Text style={{ fontSize: 14, color: 'white' }}>
                      Hẹn lại
                    </Text>
                  </TouchableOpacity >
                </View> : null}
              </View> : null}
          </View> : null}
        </View> : null}

        {/* ////////////////// NỘI DUNG BUỔI LÀM VIỆC /////////////////// */}
        {status == 'Hoàn thành' ? <View style={styles.viewHeader}>
          <Text style={styles.titleHeader}>
            Nội dung buổi làm việc
          </Text>
        </View> : null}
        {status == 'Hoàn thành' ? <View style={styles.viewContainAllInfo}>
          <Text style={styles.titleInfo}>
            Nội dung:
          </Text>
          <CustomScrollView
            style={[
              styles.input,
              (status === 'Hoàn thành') ? { backgroundColor: COLORS.background } : null,
            ]}
            value={workContentString}
            placeholder="Nội dung buổi làm việc"
            editable={false}
        />
          <Text style={styles.titleInfo}>
            Các vướng mắc:
          </Text>
          <CustomScrollView
            style={[
              styles.input,
              (status === 'Hoàn thành') ? { backgroundColor: COLORS.background } : null,
            ]}
            value={workProblemString}
            placeholder="Không có vướng mắc"
            editable={false}
        />
          {/* /////////////////////// HIỂN THỊ FILE CỦA PHẦN NỘI DUNG LÀM VIỆC ////////////////////////// */}
          {sessionFileName?.length > 0 && (
          <Text style={styles.titleInfo}>
            File Đính kèm:
          </Text>)}
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
                    <Icon name='download' size={20} color={colors.newprimary} />
                  </TouchableOpacity>
                </View>
              )}
            />
          </ScrollView>
        </View> : null}
      </ScrollView>

      {/* CÁC BUTTON HỦY, HẸN LẠI, XÁC NHẬN  */}
      {!isManage && status !== 'Hoàn thành' && status !== 'Hủy đăng ký' && !isAddJounalistToWrongSession && (
      <View style={{
        flexDirection: 'row', justifyContent: 'center',
        paddingHorizontal: 5, backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 10,
      }}>
        <TouchableOpacity style={[styles.touchOpacity, { backgroundColor: colors.cancel, flex: 1 }]}
          onPress={onShowPopup}
        >
          <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>
            Hủy
          </Text>
        </TouchableOpacity>

        {(status === 'Chờ phê duyệt' && !isJournalist) || (status === 'Đã phản hồi' && isJournalist) ? (
          <TouchableOpacity style={[styles.touchOpacity, { backgroundColor: colors.workDone, flex: 1 }]}
            onPress={() => onConfirmWorking()}
          >
            <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>
              Xác nhận
            </Text>
          </TouchableOpacity>
        ) : null}

        {(isChangeContent || isChangeResFile || isChangeReqFile || isChangeDate) && !isWorkInExistSession && sessionChooseByInstitute === 0 ? (
          <TouchableOpacity style={[styles.touchOpacity, { backgroundColor: colors.waitConfirm, flex: 1 }]}
            onPress={() => onChangeTime()}
          >
            <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>
              Hẹn lại
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    )}
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
export default WorkEdit