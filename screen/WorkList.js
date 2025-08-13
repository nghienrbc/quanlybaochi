import React, { useState, useEffect } from "react";
import { useIsFocused } from '@react-navigation/native';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
  Modal,
  PermissionsAndroid,Alert,
} from 'react-native'
import { colors, string, COLORS, SIZES } from "../constants";
import Icon from 'react-native-vector-icons/FontAwesome'
import DatePicker from 'react-native-date-picker'
import WorkItem from "./WorkItem";
import { work as workRepo } from '../repositories'
import { getMyStringValue } from "../utilies/LocalDataHandler"
import { convertDateToDateTimeString, convertDateTimeToDateString, convertDateToDateTimeStringForExcelFile } from "../utilies/DateTime";
import Icon1 from 'react-native-vector-icons/MaterialIcons'
import { CallCustomAlert } from "../utilies";
import AppLoader from '../utilies/AppLoader';
import { ActivityIndicator } from "react-native-paper";
import { showAlert, closeAlert } from "react-native-customisable-alert";
import messaging from '@react-native-firebase/messaging';
import SearchInput from '../Component/SearchInput';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import DropdownMultiSelect from '../Component/DropdownMultiSelect';
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';

function WorkList(props) {
  //navigation
  const { navigation, route } = props
  //functions of navigate to/back
  const { navigate, goBack } = navigation
  const [showLoading, setShowLoading] = useState(false)

  const isFocused = useIsFocused();
  const flatListRef = React.useRef()
  const [isJournalist, setIsJournalist] = useState(false)
  const [isManage, setIsManage] = useState(false)
  //Load thêm
  const [isLoading, setIsLoading] = useState(false)

  const [fromDate, setFromDate] = useState(null)
  const [toDate, setToDate] = useState(null)
  const [openToDate, setOpenToDate] = useState(false)
  const [openFromDate, setOpenFromDate] = useState(false)
  const [fromDateString, setFromDateString] = useState('')
  const [toDateString, setToDateString] = useState('')
  const [isFirstShowChart, setIsFirstShowChart] = useState(true)

  ///////////////// ASYGN STORAGE ///////////////////////
  const [tokenString, setTokenString] = useState('')
  const [userID, setUserID] = useState('')
  const [userTypeID, setUserTypeID] = useState('')

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

  getMyStringValue("userID").then((value) => {
    const data = value;
    setUserID(data)
  })

  useEffect(() => {
    navigation.setOptions(
      {
        headerShown: true,
        headerTitle: 'Danh sách đăng ký làm việc',
        headerTitleStyle: { fontSize: 20, fontWeight: 'bold' },
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: colors.newprimary
        },
        headerTintColor: 'white'
      })
  }, [])

  const exportDataToExcel = async () => {
    try {
      let excelData;
      let index = 1
      // Get the filtered list and store it in a separate variable
      const filteredData = filteredWorks();
      if (isJournalist) {
        excelData = [
          ['STT', 'Tiêu đề', 'Đơn vị đăng ký', 'Buổi làm việc', 'Thời gian', 'Trạng thái'],
          ...filteredData.map(element => [
            index++,
            element.title,
            element.agency,
            element.responseTitle,
            element.time,
            element.status
          ])
        ];
      }
      else if (isManage) {
        excelData = [
          ['STT', 'Tên phóng viên', 'Đơn vị tiếp nhận', 'Đơn vị đăng ký', 'Tiêu đề', 'Thời gian', 'Trạng thái'],
          ...filteredData.map(element => [
            index++,
            element.senderName,
            element.agency,
            element.agencySend,
            element.title,
            element.time,
            element.status
          ])
        ];
      }
      else {
        excelData = [
          ['STT', 'Người đăng ký', 'Đơn vị tiếp nhận', 'Tiêu đề', 'Buổi làm việc', 'Thời gian', 'Trạng thái'],
          ...filteredData.map(element => [
            index++,
            element.senderName,
            element.agency,
            element.title,
            element.responseTitle,
            element.time,
            element.status
          ])
        ];
      }
      let wb = XLSX.utils.book_new();
      let ws = XLSX.utils.aoa_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, 'Danh sách đăng ký làm việc');
      const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });

      // Save the Excel file
      const currentDate = new Date();
      const formattedDate = convertDateToDateTimeStringForExcelFile(currentDate)
      const fileName = `Danhsachdangkylamviec_${formattedDate}.xlsx`;
      // console.warn(fileName)
      const filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
      await RNFS.writeFile(filePath, wbout, 'ascii');

      Alert.alert(
        'Thông báo',
        'File exported: ' + filePath
        );
    } catch (error) {
      Alert.alert(
        'Thông báo',
        'Error exporting Excel', error
        );
    }
  };

  const handleExportPress = async () => {
    try {
      let isPermitedExternalStorage = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      if (!isPermitedExternalStorage) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission needed',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'Ok',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          exportDataToExcel(); // Use await here to ensure export is completed
          console.log('Permission granted');
        } else {
          console.log('Permission denied');
        }
      } else {
        exportDataToExcel(); // Use await here to ensure export is completed
      }
    } catch (e) {
      console.log('Error while checking permissions:', e);
    }
  };

  const [isRefresh, setIsRefresh] = useState(false)
  useEffect(() => {
    const notificationHandler = async () => {
      console.log('notificationHandler worklist');
      messaging().onNotificationOpenedApp(remoteMessage => {
        // Alert.alert(remoteMessage.notification.title);
        console.log("remote message:", remoteMessage);
        showAlert({
          title: remoteMessage.notification.title,
          message: remoteMessage.notification.body,
          alertType: 'success',
          btnLabel: 'OK',
          onPress: () => {
            if (route.name == 'WorkList') {
              setIsRefresh(true)
            }
            closeAlert()
          }
        })
      })
      const unsubcrible = messaging().onMessage(async (remoteMessage) => {
        console.log('FOREGROUND: ', remoteMessage);
        if (route.name == 'WorkList') {
          showAlert({
            title: remoteMessage.notification.title,
            message: remoteMessage.notification.body,
            alertType: 'success',
            btnLabel: 'OK',
            onPress: () => {
              // debugger
              // console.log('route.name: ', route.name);
              if (route.name == 'WorkList') {
                setIsRefresh(true)
              }
              closeAlert()
            }
          })
        }
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
            if (route.name == 'WorkList') {
              setIsRefresh(true)
            }
            closeAlert()
          }
        })
      });
      return unsubcrible;
    }
    if (isFocused == true) {
      notificationHandler();
    }
  }, [isFocused]);

  useEffect(() => {
    if (tokenString != '' && (isFocused || isRefresh)) {
      setIsRefresh(false)
      setShowLoading(true)
      if (isManage) {
        setShowLoading(false)
        return
      }
      else {
        workRepo.getAllWorkRegistration(tokenString)
          .then(responseWork => {
            setWork(responseWork)
            setShowLoading(false)
            // scroll flat list to the  
            if ((flatListRef !== null) && (flatListRef.current !== null)) {
              if (flatListRef.current.props.data.length > 1)
                flatListRef.current.scrollToOffset({ animated: true, offset: 0 })
            }
          })
          .catch(
            errorMessage => {
              setShowLoading(false)
              if (errorMessage == 'Not found') {
                setWork([])
              }
              else {
                CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK");
              }
            }
          )
      }
    }
  }, [isFocused, isRefresh]);

  const [workManage, setWorkManage] = useState([]);
  const [work, setWork] = useState([]);

  // call function to get data
  useEffect(() => {
    // debugger
    if (tokenString != '') {
      var curentDate = new Date()
      setToDate(new Date(curentDate.setMonth(curentDate.getMonth() + 12)))
      setFromDate(new Date(curentDate.setMonth(curentDate.getMonth() - 24)))
    }
  }, [tokenString])

  let worksManage = []
  workManage.forEach(element => {
    let workManageObj = {
      workObject: element,
      id: element.id,
      title: element.title,
      responseTitle: element.sessionContent.respWorkSession ? element.sessionContent.respWorkSession : element.sessionContent.workSession,
      content: element.content,
      agency: element.receiveUnit.name,
      agencySend: element.senderUsers?.Institute?.name,
      time: convertDateToDateTimeString(new Date(parseInt(element.sessionContent.dateSession))),
      status: element.statusApointment == 0 ? "Hủy đăng ký" :
        (element.statusWork == 2 ? (element.statusApointment == 1 ? "Chờ làm việc" :
          element.statusApointment == 2 ? "Chờ phê duyệt" : (element.direct == true ? "Chờ làm việc" : "Đã phản hồi")) :
          (element.statusWork == 1 ? "Hoàn thành" : "Hủy đăng ký")),
      senderName: element?.senderUsers?.givenName,
      userTypeID: isManage ? 2 : (isJournalist ? 7 : 3),
      sessionId: element.sessionContent ? element.sessionContent.id : null,
      notifyId: element.appointment[0].notifyId != null ? element.appointment[0].notifyId : element.notifyId,
      notifyView: null,
      direct: element.direct,
    }
    worksManage.push(workManageObj)
  });

  let works = []
  work.forEach(element => {
    let workObj = {
      workObject: element,
      id: element.id,
      title: element.title,
      responseTitle: element.sessionContent.respWorkSession ? element.sessionContent.respWorkSession : element.sessionContent.workSession || '',
      content: element.content,
      agency: isJournalist ? element.receiveUnit?.name : element.senderUsers?.Institute?.name || '',
      agencySend: element.createSession?.Institute?.name|| '',
      timeOrigin: element.sessionContent.dateSession,
      time: convertDateToDateTimeString(new Date(parseInt(element.sessionContent.dateSession))),
      status: element.statusApointment == 0 ? "Hủy đăng ký" :
        (element.statusWork == 2 ? (element.statusApointment == 1 ? "Chờ làm việc" :
          element.statusApointment == 2 ? "Chờ phê duyệt" : (element.direct == true ? "Chờ làm việc" : "Đã phản hồi")) :
          (element.statusWork == 1 ? "Hoàn thành" : "Hủy đăng ký")),
      senderName: element.senderUsers?.givenName,
      userTypeID: isManage ? 2 : (isJournalist ? 7 : 3),
      sessionId: element.sessionContent ? element.sessionContent.id : null,
      notifyId: element.appointment[0].notifyId != null ? element.appointment[0].notifyId : element.notifyId,
      notifyView: element.appointment[0].senderId == userID || element.direct == true
        || (!isJournalist && element.appointment[0].notifyId == null && element.notifyView) ? 0 : element.appointment[0].notifyView,
      direct: element.direct,
    }
    works.push(workObj)
  });

  useEffect(() => {
    if (toDate != null && fromDate != null) {
      setToDateString(convertDateTimeToDateString(toDate));
      setFromDateString(convertDateTimeToDateString(fromDate));
      onGetWorkData()
    }
  }, [toDate, fromDate])

  const onGetWorkData = () => {
    // debugger
    if (!toDate || !fromDate || toDate <= fromDate) {
      CallCustomAlert.showAlertWith("Chọn thời gian chưa phù hợp", "error", "OK");
      return;
    }
    setShowLoading(true);
    if (isManage) {
      workRepo.getAllWorkRegistrationManage(tokenString, new Date(fromDate).getTime(), new Date(toDate).getTime())
        .then(responseWork => {
          // debugger
          setWorkManage(responseWork);
          setShowLoading(false);
        })
        .catch(errorMessage => {
          setShowLoading(false);
          if (errorMessage == 'Not found') {
            setWorkManage([])
          } else {
            CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK");
          }
        });
    } else {
      workRepo.getAllWorkRegistration(tokenString)
        .then(responseWork => {
          // console.warn('second call')
          setWork(responseWork);
          setShowLoading(false);
        })
        .catch(errorMessage => {
          setShowLoading(false);
          if (errorMessage == 'Not found') {
            setWork([])
          } else {
            CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK");
          }
        });
    }
  };
  // mở ra modal
  const [isOpenSort, setIsOpenSort] = useState(false)
  const callOpenSort = () => {
    setIsOpenSort(!isOpenSort)
  }
  const [searchText, setSearchText] = useState('')
  //chon trang thai
  const [selectedStatus, setSelectedStatus] = useState("all");

  //Lọc theo tên người gởi đăng ký
  let senderNames;
  if (isManage) {
    senderNames = worksManage.map((registration) => registration.senderName);
  } else {
    senderNames = works.map((registration) => registration.senderName);
  }
  const uniqueSenderNames = [...new Set(senderNames)];
  const [selectedSenderNames, setSelectedSenderNames] = useState([]);
  const onSelectedSenderNamesChange = (selectedItems) => {
    setSelectedSenderNames(selectedItems);
  };

  //Lọc theo đơn vị
  let agenciesSend;
  if (isManage) {
    agenciesSend = worksManage.map((registration) => registration.agencySend);
  }
  const uniqueAgenciesSend = [...new Set(agenciesSend)];
  const [selectedAgenciesSend, setSelectedAgenciesSend] = useState([]);
  const onSelectedAgenciesChangeSend = (selectedItems) => {
    setSelectedAgenciesSend(selectedItems);
  };

  //Lọc theo đơn vị
  let agencies;
  if (isManage) {
    agencies = worksManage.map((registration) => registration.agency);
  } else {
    agencies = works.map((registration) => registration.agency);
  }
  const uniqueAgencies = [...new Set(agencies)];
  const [selectedAgencies, setSelectedAgencies] = useState([]);
  const onSelectedAgenciesChange = (selectedItems) => {
    setSelectedAgencies(selectedItems);
  };

  /* Gõ không dấu vẫn tìm kiếm được */
  const removeAccents = (text) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };
  const filteredWorks = () => {
    let filteredList = isManage ? worksManage : works;

    if (selectedStatus !== "all") {
      filteredList = filteredList.filter(
        (registration) => registration.status.toLowerCase() === selectedStatus.toLowerCase()
      );
    }
    if (selectedSenderNames.length > 0) {
      filteredList = filteredList.filter(
        (registration) => selectedSenderNames.includes(registration.senderName)
      );
    }
    if (selectedAgencies.length > 0) {
      filteredList = filteredList.filter(
        (registration) => selectedAgencies.includes(registration.agency)
      );
    }
    if (selectedAgenciesSend.length > 0) {
      filteredList = filteredList.filter(
        (registration) => selectedAgenciesSend.includes(registration.agencySend)
      );
    }
    if (!isManage) {
      filteredList = filteredList.filter(
        (registration) => {
          const registrationTime = registration.timeOrigin;
          const fromTime = fromDate.getTime();
          const toTime = toDate.getTime();
          const withinDateRange = parseInt(registrationTime) >= parseInt(fromTime) && parseInt(registrationTime) <= parseInt(toTime);
          console.log("withinDateRange:", withinDateRange);
          return withinDateRange;
        }
      );
    }
    if (searchText !== "") {
      const searchTextWithoutAccents = removeAccents(searchText.toLowerCase());
      filteredList = filteredList.filter((registration) => {
        const includesText = (text) => removeAccents(text.toLowerCase()).includes(searchTextWithoutAccents);
        // Tùy chỉnh các điều kiện tìm kiếm dựa trên role
        if (isManage) {
          return includesText(registration?.title || '') ||
            includesText(registration?.agency || '') ||
            includesText(registration?.agencySend || '') ||
            includesText(registration?.senderName || '');
        } else if (isJournalist) {
          return includesText(registration?.title || '') ||
            includesText(registration?.responseTitle || '') ||
            includesText(registration?.agency || '');
        } else {
          return includesText(registration?.agency || '') ||
            includesText(registration?.title) ||
            includesText(registration?.senderName || '');
        }
      });
    }
    return filteredList;
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    setActiveStatus(status);
  };

  //khi ấn vào trạng thái nào thì hiện màu của trạng thái
  const [activeStatus, setActiveStatus] = useState('all');
  // loadmore item trong flatlist
  const [loadmoreI, setLoadMoreI] = useState(5)
  const listData = filteredWorks().slice(0, loadmoreI)
  const loadMoreItem = () => {
    if (listData.length >= filteredWorks().length) {
      return;
    }
    setIsLoading(true)
    setTimeout(() => {
      setLoadMoreI(loadmoreI + 5)
      setIsLoading(false)
    }, 1000);
  }

  const selectText = isJournalist
    ? 'Lọc theo đơn vị đăng ký'
    : isManage
      ? 'Lọc theo đơn vị tiếp nhận'
      : 'Lọc theo đơn vị đăng ký';
  ///////////////////// LAYOUT RENDER ///////////////////////////////////
  return <View style={{ flex: 1, backgroundColor: COLORS.background, padding: 15 }}>
    {showLoading ? <AppLoader /> : null}
    <View style={{ flex: 1 }}>
      <View style={{
        marginBottom: 7,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <SearchInput
          placeholder="Tìm kiếm"
          placeholderTextColor="rgba(131, 138, 138, 1)"
          onChangeText={(text) => {
            setSearchText(text)
          }}
          value={searchText}
        />
        <View style={{ alignItems: 'center', margin: 3 }}>
          <TouchableOpacity onPress={() => callOpenSort()}
            style={{ flexDirection: 'row' }}>
            <View>
              <Image style={{ height: 22, width: 22, tintColor: colors.newprimary, marginStart: 5 }}
                resizeMode="cover"
                source={require("../assets/icons/sort_icon.png")} />
              <Text style={{ fontSize: 11, color: colors.newprimary, fontWeight: 'bold' }}>Bộ lọc</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: 'center', margin: 3 }}>
          <TouchableOpacity onPress={() => handleExportPress()}
            style={{ flexDirection: 'row' }}>
            <View>
              <Image style={{ height: 22, width: 22, tintColor: colors.newprimary, marginStart: 8 }}
                resizeMode="cover"
                source={require("../assets/icons/export_icon.png")} />
              <Text style={{ fontSize: 11, color: colors.newprimary, fontWeight: 'bold' }}>Xuất file</Text>
            </View>
          </TouchableOpacity>
        </View>

      </View>
      {/* Bộ lọc */}
      <Modal
        transparent={true}
        visible={isOpenSort}
      >
        <TouchableOpacity onPress={() => { setIsOpenSort(false) }}
          style={{
            backgroundColor: '#000000aa',
            flex: 1
          }}>
          <ScrollView style={{
              height: '100%',
              marginTop: 80,
              paddingBottom: 10,
              borderTopLeftRadius:15,
              borderTopRightRadius:15,
              backgroundColor: COLORS.white
            }}>
          <View onStartShouldSetResponder={() => true}
            style={{
              height: '100%',
            }}>
            {/* Lọc theo đơn vị */}
            <View>
              <DropdownMultiSelect
                items={[
                  {
                    name: isJournalist
                      ? 'Lọc theo đơn vị đăng ký'
                      : isManage
                        ? 'Lọc theo đơn vị tiếp nhận'
                        : 'Lọc theo đơn vị đăng ký',
                    id: 'agencies',
                    children: uniqueAgencies.map((agency) => ({ name: agency, id: agency })),
                  },
                ]}
                IconRenderer={Icon1}
                onSelectedItemsChange={onSelectedAgenciesChange}
                selectedItems={selectedAgencies}
                selectText={selectText}
                searchText={searchText}
              />
            </View>
            {isManage && (
              <View>
                <DropdownMultiSelect
                  items={[
                    {
                      name: 'Lọc theo đơn vị đăng ký',
                      id: 'agenciesSend',
                      children: uniqueAgenciesSend.map((agencySend) => ({ name: agencySend, id: agencySend })),
                    },
                  ]}
                  IconRenderer={Icon1}
                  onSelectedItemsChange={onSelectedAgenciesChangeSend}
                  selectedItems={selectedAgenciesSend}
                  selectText='Lọc theo đơn vị đăng ký'
                  searchText={searchText}
                />
              </View>)}
            {/* Lọc theo người đăng ký*/}
            {isJournalist ? null : (
              <View>
                {/* <SectionedMultiSelect
                  items={[
                    {
                      name: 'Lọc theo người đăng ký',
                      id: 'senderNames',
                      children: uniqueSenderNames.map((name) => ({ name, id: name })),
                    },
                  ]}
                  IconRenderer={Icon1}
                  uniqueKey="id"
                  subKey="children"
                  readOnlyHeadings={true}
                  selectText="Lọc theo người đăng ký"
                  showDropDowns={true}
                  onSelectedItemsChange={onSelectedSenderNamesChange}
                  selectedItems={selectedSenderNames}
                  searchPlaceholderText="Tìm kiếm"
                  confirmText="Xác nhận chọn"
                  selectedText="Đã chọn"
                  showCancelButton={true}
                  searchText={searchText}
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
                /> */}
                <DropdownMultiSelect
                 items={[
                  {
                    name: 'Lọc theo người đăng ký',
                    id: 'senderNames',
                    children: uniqueSenderNames.map((name) => ({ name, id: name })),
                  },
                ]}
                IconRenderer={Icon1}
                onSelectedItemsChange={onSelectedSenderNamesChange}
                selectedItems={selectedSenderNames}
                selectText="Lọc theo người đăng ký"
                searchText={searchText}
                />
              </View>)}
            {/* Phân loại trạng thái */}
            <View style={{ marginStart: 15, marginTop: 10 }}>
              <Text style={{ fontWeight: 'bold', color: '#414141', fontSize: 14 }}>Phân loại theo trạng thái</Text>
              <TouchableOpacity onPress={() => handleStatusFilter('all')} style={[styles.touchOpacityStatus, { marginTop: 5 }]}>
                <Text style={[styles.buttonStatus, activeStatus === 'all' && styles.activeButton]}>Tất cả</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleStatusFilter('Hoàn thành')} style={styles.touchOpacityStatus}>
                <Text style={[styles.buttonStatus, activeStatus === 'Hoàn thành' && styles.activeWorkDone]}>Hoàn thành</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleStatusFilter('Chờ phê duyệt')} style={styles.touchOpacityStatus}>
                <Text style={[styles.buttonStatus, activeStatus === 'Chờ phê duyệt' && styles.activeWaitConfirm]}>Chờ phê duyệt</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleStatusFilter('Đã phản hồi')} style={styles.touchOpacityStatus}>
                <Text style={[styles.buttonStatus, activeStatus === 'Đã phản hồi' && styles.activeHadResponsed]}>Đã phản hồi</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleStatusFilter('Chờ làm việc')} style={styles.touchOpacityStatus}>
                <Text style={[styles.buttonStatus, activeStatus === 'Chờ làm việc' && styles.activeWaitWorking]}>Chờ làm việc</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleStatusFilter('Hủy đăng ký')} style={styles.touchOpacityStatus}>
                <Text style={[styles.buttonStatus, activeStatus === 'Hủy đăng ký' && styles.activeCancel]}>Hủy đăng ký</Text>
              </TouchableOpacity>
            </View>
            {/* Phân loại thời gian */}
            <View style={{ marginStart: 15, marginTop: 10 }}>
              <Text style={{ fontWeight: 'bold', color: '#414141', fontSize: 14 }}>
                Phân loại theo thời gian
              </Text>
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: SIZES.radius,
                  ...styles.shadow,
                  marginTop: 10,
                }}
              >
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                      style={styles.ChooseDate}
                      onPress={() => {
                        setOpenFromDate(true);
                      }}
                    >
                      <Text style={{ fontSize: 12, color: 'white', fontWeight: 'bold' }}>
                        <Icon name='calendar' style={{ color: 'white', fontSize: 14 }} /> Từ ngày:
                      </Text>
                    </TouchableOpacity>
                    <Text style={{ fontSizes: 13, fontWeight: 'bold', color: '#000', marginTop: 7 }}>
                      {fromDateString}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                      style={[styles.ChooseDate, { marginRight: 5 }]}
                      onPress={() => {
                        setOpenToDate(true);
                      }}
                    >
                      <Text style={{ fontSize: 12, color: 'white', fontWeight: 'bold' }}>
                        <Icon name='calendar' style={{ color: 'white', fontSize: 14 }} /> Đến ngày:
                      </Text>
                    </TouchableOpacity>
                    <Text style={{ fontSizes: 13, fontWeight: 'bold', color: '#000', marginTop: 7 }}>
                      {toDateString}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          </ScrollView>
        </TouchableOpacity>
      </Modal>

      {fromDate && <DatePicker
        title="Chọn từ ngày"
        confirmText="Chọn"
        cancelText="Hủy"
        modal
        open={openFromDate}
        date={fromDate}
        onConfirm={(date) => {
          setOpenFromDate(false)
          setFromDate(date)
        }}
        onCancel={() => {
          setOpenFromDate(false)
        }}
        mode="date"
        theme="auto"
      />}
      {toDate && <DatePicker
        title="Chọn đến ngày"
        confirmText="Chọn"
        cancelText="Hủy"
        modal
        open={openToDate}
        date={toDate}
        onConfirm={(date) => {
          setOpenToDate(false)
          setToDate(date)
        }}
        onCancel={() => {
          setOpenToDate(false)
        }}
        mode="date"
        theme="auto"
      />}

      {filteredWorks().length > 0 ?
        <FlatList
          style={{ flex: 1, marginBottom: 10 }}
          nestedScrollEnabled={true}
          data={listData}
          ref={flatListRef}
          renderItem={({ item }) => <WorkItem
            onPress={() => {
              navigate('WorkEdit', {
                workItem: item
              })
            }}
            work={item} key={item.id} />}
          keyExtractor={eachWork => eachWork.id}
          ListFooterComponent={() => (
            isLoading ?
              <View style={{
                alignSelf: 'center',
                flexDirection: 'row',
              }}>
                <ActivityIndicator size="small" color={colors.newprimary} />
              </View> : null
          )}
          onEndReached={loadMoreItem}
          onEndReachedThreshold={0.1}
        />
        : <View style={{
          marginTop: 50,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Image style={{ height: 120, width: 120 }}
            resizeMode="cover"
            source={require("../assets/images/nothingFound.png")} />
          <Text style={{
            color: 'black',
            fontWeight: 'bold',
            fontSize: 18
          }}>Không tìm thấy kết quả phù hợp
          </Text>
          <Text style={{
            color: '#858181',
            fontSize: 18
          }}>Bạn thử tìm từ khóa khác nhé.
          </Text>
        </View>}
      {/* Nút thêm mới đăng ký làm việc */}
      {!isManage &&
        <TouchableOpacity style={[styles.touchOpacity, { right: -6, bottom: -2 }]}
          onPress={() => {
            if (isJournalist) navigate('WorkRegistration')
            else navigate('WorkRegisterForJounalist')
          }}>
          <Text style={{ fontSize: 26, color: 'white', paddingHorizontal: 10 }}>+</Text>
        </TouchableOpacity>}
    </View>
  </View>
};

const styles = StyleSheet.create({
  touchOpacity: {
    position: 'absolute',
    backgroundColor: colors.newprimary,
    opacity: 0.9,
    borderRadius: 50,
    alignContent: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    margin: 5
  },
  touchOpacityStatus: {
    flexDirection: 'row',
    marginTop: 4,
    width: 120,
  },
  buttonStatus: {
    fontSize: 12,
    color: '#414141',
  },
  activeButton: {
    backgroundColor: colors.newprimary,
    paddingHorizontal: 7,
    paddingVertical: 5,
    color: 'white',
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeWorkDone: {
    backgroundColor: colors.workDone,
    paddingHorizontal: 7,
    paddingVertical: 5,
    color: 'white',
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeWaitWorking: {
    backgroundColor: colors.waitWorking,
    paddingHorizontal: 7,
    paddingVertical: 5,
    color: 'white',
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeHadResponsed: {
    backgroundColor: colors.hadResponsed,
    paddingHorizontal: 7,
    paddingVertical: 5,
    color: 'white',
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeWaitConfirm: {
    backgroundColor: colors.waitConfirm,
    paddingHorizontal: 7,
    paddingVertical: 5,
    color: 'white',
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeCancel: {
    backgroundColor: colors.cancel,
    paddingHorizontal: 7,
    paddingVertical: 5,
    color: 'white',
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 'bold',
  },
  ChooseDate: {
    backgroundColor: colors.newprimary,
    paddingHorizontal: 7,
    paddingVertical: 7,
    color: 'white',
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 10,
  }
});
export default WorkList
