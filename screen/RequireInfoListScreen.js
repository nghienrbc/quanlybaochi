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
  PermissionsAndroid,
  Alert
} from 'react-native'
import { colors, string, COLORS, SIZES } from "../constants";
import Icon from 'react-native-vector-icons/FontAwesome'
import Icon1 from 'react-native-vector-icons/MaterialIcons'
import DatePicker from 'react-native-date-picker'
import RequireInfoItem from "./RequireInfoItem";
import { requireinfo as requireinfoRepo } from '../repositories'
import { getMyStringValue } from "../utilies/LocalDataHandler"
import { convertDateToDateTimeString, convertDateTimeToDateString,convertDateToDateTimeStringForExcelFile } from "../utilies/DateTime";

import { CallCustomAlert } from "../utilies";
import AppLoader from '../utilies/AppLoader';
import { ActivityIndicator } from "react-native-paper";
import { showAlert, closeAlert } from "react-native-customisable-alert";
import messaging from '@react-native-firebase/messaging';
import SearchInput from '../Component/SearchInput';
import DropdownMultiSelect from '../Component/DropdownMultiSelect';
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';

function RequireInfoListScreen(props) {
  //navigation
  const { navigation, route } = props
  //functions of navigate to/back
  const { navigate, goBack } = navigation
  const [showLoading, setShowLoading] = useState(false)

  const isFocused = useIsFocused();
  const flatListRef = React.useRef()
  const [isJournalist, setIsJournalist] = useState(false)
  const [isManage, setIsManage] = useState(false)
  const [requires, setRequires] = useState([]);
  const [requiresManage, setRequiresManage] = useState([]);

  const [isRefresh, setIsRefresh] = useState(false)
  //Load thêm
  const [isLoading, setIsLoading] = useState(false)

  const [fromDate, setFromDate] = useState(null)
  const [toDate, setToDate] = useState(null)
  const [openToDate, setOpenToDate] = useState(false)
  const [openFromDate, setOpenFromDate] = useState(false)
  const [fromDateString, setFromDateString] = useState('')
  const [toDateString, setToDateString] = useState('')

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
    const notificationHandler = async () => {

      messaging().onNotificationOpenedApp(remoteMessage => {
        // console.log("remote message:", remoteMessage);
        showAlert({
          title: remoteMessage.notification.title,
          message: remoteMessage.notification.body,
          alertType: 'success',
          btnLabel: 'OK',
          onPress: () => {
            if (route.name == 'RequireInfoListScreen') {
              setIsRefresh(true)
            }
            closeAlert()
          }
        })
      })
      const unsubcrible = messaging().onMessage(async (remoteMessage) => {
        // console.log('FOREGROUND: ', remoteMessage);
        showAlert({
          title: remoteMessage.notification.title,
          message: remoteMessage.notification.body,
          alertType: 'success',
          btnLabel: 'OK',
          onPress: () => {
            // console.log('route.name: ', route.name);
            if (route.name == 'RequireInfoListScreen') {
              setIsRefresh(true)
            }
            closeAlert()
          }
        })
        //navigate('UITab')  
      });
      // Register background handler
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        // console.log('Message handled in the background!', remoteMessage);
        showAlert({
          title: remoteMessage.notification.title,
          message: remoteMessage.notification.body,
          alertType: 'success',
          btnLabel: 'OK',
          onPress: () => {
            if (route.name == 'RequireInfoListScreen') {
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
  }, []);

  useEffect(() => {
    //console.warn('focus')
    debugger
    if (tokenString != '' && (isFocused || isRefresh)) {
      setIsRefresh(false)
      setShowLoading(true)
      if (isManage) {
        setShowLoading(false)
        return
      }
      else {
        requireinfoRepo.getAllRequireInfo(tokenString)
          .then(response => {
            setRequires(response)
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
              if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
            }
          )
      }
    }
  }, [isFocused, isRefresh]);

  useEffect(() => {
    navigation.setOptions(
      {
        headerShown: true,
        headerTitle: 'Danh sách đề nghị cung cấp thông tin',
        headerTitleStyle: { fontSize: 20, fontWeight: 'bold' },
        headerTitleAlign: '',
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
      const filteredData = filteredRequireInfo();
      if (isJournalist) {
        excelData = [
          ['STT', 'Đơn vị tiếp nhận', 'Tiêu đề', 'Thời gian', 'Trạng thái'],
          ...filteredData.map(element => [
            index++,
            element.agency,
            element.title,
            element.timeCreate,
            element.status
          ])
        ];
      }
      else if (isManage) {
        excelData = [
          ['STT', 'Người đề nghị', 'Đơn vị đề nghị', 'Đơn vị tiếp nhận', 'Tiêu đề', 'Thời gian', 'Trạng thái'],
          ...filteredData.map(element => [
            index++,
            element.senderName,
            element.agency,
            element.agencyReceive,
            element.title,
            element.timeCreate,
            element.status
          ])
        ];
      }
      else {
        excelData = [
          ['STT', 'Người đề nghị', 'Đơn vị đề nghị', 'Tiêu đề', 'Thời gian', 'Trạng thái'],
          ...filteredData.map(element => [
            index++,
            element.senderName,
            element.agency,
            element.title,
            element.timeCreate,
            element.status
          ])
        ];
      }
      let wb = XLSX.utils.book_new();
      let ws = XLSX.utils.aoa_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, 'Danh sách đề nghi cung cấp');
      const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });

      // Save the Excel file
      const currentDate = new Date();
      const formattedDate = convertDateToDateTimeStringForExcelFile(currentDate)
      const fileName = `Danhsachdenghicungcap_${formattedDate}.xlsx`;
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

  // call function to get data
  useEffect(() => {
    // debugger
    if (tokenString != '') {
      var curentDate = new Date()
      setToDate(new Date(curentDate.setMonth(curentDate.getMonth() + 12)))
      setFromDate(new Date(curentDate.setMonth(curentDate.getMonth() - 24)))
    }
  }, [tokenString])

  let requireArrayManage = []

  requiresManage.forEach(element => {
    let requireManageObj = {
      requireObject: element,
      id: element.id,
      title: element.title,
      content: element.content,
      agency: isJournalist ? element?.institute?.name : element.sender?.Institute?.name,
      agencyReceive: element.institute?.name,
      time: element.confirm.apointmentDate != undefined ? convertDateToDateTimeString(new Date(parseInt(element.confirm.apointmentDate))) : null,
      timeCreate: convertDateToDateTimeString(element.createdAt),
      status: element.status == 1 ? "Đã phản hồi" :
        (element.status == 2 ? "Chờ phản hồi" : "Hủy đề nghị"),
      senderName: element.sender.givenName,
      notifyId: !isJournalist ? element.notifyId : (element.confirm.length > 0 ? element.confirm[0].notifyId : 0),
      notifyView: !isJournalist ? element.notifyView : (element.confirm.length > 0 ? element.confirm[0].notifyView : 0),
      userTypeID: isManage ? 2 : (isJournalist ? 7 : 3),
    }
    requireArrayManage.push(requireManageObj)
  });

  let requireArray = []

  requires.forEach(element => {
    let requireObj = {
      requireObject: element,
      id: element.id,
      title: element.title,
      content: element.content,
      agency: isJournalist ? element.institute?.name : element.sender?.Institute?.name,
      agencyReceive: element.institute?.name,
      time: element.confirm.apointmentDate != undefined ? convertDateToDateTimeString(new Date(parseInt(element.confirm.apointmentDate))) : null,
      timeCreate: convertDateToDateTimeString(element.createdAt),
      timeOrigin:element.createdAt,
      status: element.status == 1 ? "Đã phản hồi" :
        (element.status == 2 ? "Chờ phản hồi" : "Hủy đề nghị"),
      senderName: element.sender.givenName,
      notifyId: !isJournalist ? element.notifyId : (element.confirm.length > 0 ? element.confirm[0].notifyId : 0),
      notifyView: !isJournalist ? element.notifyView : (element.confirm.length > 0 ? element.confirm[0].notifyView : 0),
      userTypeID: isManage ? 2 : (isJournalist ? 7 : 3),
    }
    requireArray.push(requireObj)
  });

  useEffect(() => {
    if (toDate != null && fromDate != null) {
      setToDateString(convertDateTimeToDateString(toDate));
      setFromDateString(convertDateTimeToDateString(fromDate));
      onGetWorkData()
    }

  }, [toDate, fromDate])

  const onGetWorkData = () => {
    debugger
    if (!toDate || !fromDate || toDate <= fromDate) {
      CallCustomAlert.showAlertWith("Chọn thời gian chưa phù hợp", "error", "OK")
      return
    }
    setShowLoading(true)
    if (isManage) {
      requireinfoRepo.getAllRequireInfoManage(tokenString, new Date(fromDate).getTime(), new Date(toDate).getTime())
        .then(response => {
          debugger
          setRequiresManage(response)// Update setRequireManage with filtered data
          setShowLoading(false)
        })
        .catch(
          errorMessage => {
            setShowLoading(false)
            CallCustomAlert.showAlertWith(errorMessage == 'Not found' ? string.NOT_FOUND : string.CANT_CONNECT_SERVER, "error", "OK")
          }
        )
    }
    else {
      requireinfoRepo.getAllRequireInfo(tokenString)
        .then(response => {
          debugger
          setRequires(response)// Update setRequire with filtered data
          setShowLoading(false)
        })
        .catch(
          errorMessage => {
            setShowLoading(false)
            CallCustomAlert.showAlertWith(errorMessage == 'Not found' ? string.NOT_FOUND : string.CANT_CONNECT_SERVER, "error", "OK")
          }
        )
    }
  }
  // mở ra modal
  const [isOpenSort, setIsOpenSort] = useState(false)
  const callOpenSort = () => {
    setIsOpenSort(!isOpenSort)
  }
  const [searchText, setSearchText] = useState('')
  //chon trang thai
  const [selectedStatus, setSelectedStatus] = useState("all");

  //Lọc theo đơn vị
  let agencies;
  if (isManage) {
    agencies = requireArrayManage.map((requireInfo) => requireInfo.agency);
  } else {
    agencies = requireArray.map((requireInfo) => requireInfo.agency);
  }
  const uniqueAgencies = [...new Set(agencies)];
  const [selectedAgencies, setSelectedAgencies] = useState([]);
  const onSelectedAgenciesChange = (selectedItems) => {
    setSelectedAgencies(selectedItems);
  };

  //Lọc theo đơn vị
  let agenciesReceive;
  if (isManage) {
    agenciesReceive = requireArrayManage.map((requireInfo) => requireInfo.agencyReceive);
  }
  const uniqueAgenciesReceive = [...new Set(agenciesReceive)];
  const [selectedAgenciesReceive, setSelectedAgenciesReceive] = useState([]);
  const onSelectedAgenciesChangeReceive = (selectedItems) => {
    setSelectedAgenciesReceive(selectedItems);
  };

  //Lọc theo tên người gởi đăng ký
  let senderNames;
  if (isManage) {
    senderNames = requireArrayManage.map((requireInfo) => requireInfo.senderName);
  } else {
    senderNames = requireArray.map((requireInfo) => requireInfo.senderName);
  }
  const uniqueSenderNames = [...new Set(senderNames)];
  const [selectedSenderNames, setSelectedSenderNames] = useState([]);
  const onSelectedSenderNamesChange = (selectedItems) => {
    setSelectedSenderNames(selectedItems);
  };

  /* Gõ không dấu vẫn tìm kiếm được */
  const removeAccents = (text) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const filteredRequireInfo = () => {
    let filteredList = isManage ? requireArrayManage : requireArray;

    if (selectedStatus !== "all") {
      filteredList = filteredList.filter(
        (requireInfo) => removeAccents(requireInfo.status.toLowerCase()) === removeAccents(selectedStatus.toLowerCase())
      );
    }
    if (searchText !== "") {
      const searchTextWithoutAccents = removeAccents(searchText.toLowerCase());
      filteredList = filteredList.filter((requireInfo) => {
        const includesText = (text) => removeAccents(text.toLowerCase()).includes(searchTextWithoutAccents);
        if (isManage) {
          return includesText(requireInfo.title) ||
            includesText(requireInfo.agency) ||
            includesText(requireInfo.agencyReceive) ||
            includesText(requireInfo.senderName);
        } else if (isJournalist) {
          return includesText(requireInfo.title) ||
            includesText(requireInfo.agency);
        } else {
          return includesText(requireInfo.agency) ||
            includesText(requireInfo.title) ||
            includesText(requireInfo.senderName);
        }
      });
    }
    if (selectedAgencies.length > 0) {
      filteredList = filteredList.filter(
        (requireInfo) => selectedAgencies.includes(requireInfo.agency)
      );
    }
    if (selectedAgenciesReceive.length > 0) {
      filteredList = filteredList.filter(
        (requireInfo) => selectedAgenciesReceive.includes(requireInfo.agencyReceive)
      );
    }
    if (selectedSenderNames.length > 0) {
      filteredList = filteredList.filter(
        (requireInfo) => selectedSenderNames.includes(requireInfo.senderName)
      );
    }
    if (!isManage) {
      filteredList = filteredList.filter(
        (requireInfo) => {
          const registrationTime = requireInfo.timeOrigin;
          const fromTime = fromDate.getTime();
          const toTime = toDate.getTime();
          const withinDateRange = new Date(registrationTime) >= new Date(fromTime) && new Date(registrationTime) <= new Date(toTime);
          return withinDateRange;
        }
      );
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
  const listData = filteredRequireInfo().slice(0, loadmoreI)
  const loadMoreItem = () => {
    if (listData.length >= filteredRequireInfo().length) {
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
    ? 'Lọc theo đơn vị đề nghị'
    : 'Lọc theo đơn vị đề nghị';
  ///////////////////// LAYOUT RENDER ///////////////////////////////////
  return <View style={{ flex: 1, backgroundColor: COLORS.background, padding: 15 }}>
    {showLoading ? <AppLoader /> : null}
    <View style={{ flex: 1 }}>
      <View style={{
        marginBottom: 10,
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
                          ? 'Lọc theo đơn vị đề nghị'
                          : 'Lọc theo đơn vị đề nghị',
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
              {/* Lọc theo người đăng ký*/}
            {isJournalist ? null : (
              <View>
                <DropdownMultiSelect
                  items={[
                    {
                      name: 'Lọc theo người đề nghị',
                      id: 'senderNames',
                      children: uniqueSenderNames.map((name) => ({ name, id: name })),
                    },
                  ]}
                  IconRenderer={Icon1}
                  onSelectedItemsChange={onSelectedSenderNamesChange}
                  selectedItems={selectedSenderNames}
                  selectText="Lọc theo người đề nghị"
                  searchText={searchText}
                />
              </View>)}
              {isManage && (
              <View>
                <DropdownMultiSelect
                  items={[
                    {
                      name: 'Lọc theo đơn vị tiếp nhận',
                      id: 'agenciesSend',
                      children: uniqueAgenciesReceive.map((agencyReceive) => ({ name: agencyReceive, id: agencyReceive })),
                    },
                  ]}
                  IconRenderer={Icon1}
                  onSelectedItemsChange={onSelectedAgenciesChangeReceive}
                  selectedItems={selectedAgenciesReceive}
                  selectText='Lọc theo đơn vị tiếp nhận'
                  searchText={searchText}
                />
              </View>)}
              {/* Bộ lọc theo trạng thái */}
              <View style={{ marginStart: 15, marginTop: 10 }}>
                <Text style={{ fontWeight: 'bold', color: '#414141', fontSize: 14 }}>Phân loại theo trạng thái</Text>
                <TouchableOpacity onPress={() => handleStatusFilter('all')} style={{ flexDirection: 'row', marginTop: 5 }}>
                  <Text style={[styles.buttonStatus, activeStatus === 'all' && styles.activeButton]}>Tất cả</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleStatusFilter('Chờ phản hồi')} style={{ flexDirection: 'row', marginTop: 4 }}>
                  <Text style={[styles.buttonStatus, activeStatus === 'Chờ phản hồi' && styles.activeWaitConfirm]}>Chờ phản hồi</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleStatusFilter('Đã phản hồi')} style={{ flexDirection: 'row', marginTop: 4 }}>
                  <Text style={[styles.buttonStatus, activeStatus === 'Đã phản hồi' && styles.activeWorkDone]}>Đã phản hồi</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleStatusFilter('Hủy đề nghị')} style={{ flexDirection: 'row', marginTop: 4 }}>
                  <Text style={[styles.buttonStatus, activeStatus === 'Hủy đề nghị' && styles.activeCancel]}>Hủy đề nghị</Text>
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
      </View>
      {filteredRequireInfo().length > 0 ?
        <FlatList
          style={{ flex: 1, marginBottom: 10 }}
          nestedScrollEnabled={true}
          ref={flatListRef}
          data={listData}
          renderItem={({ item }) => <RequireInfoItem
            onPress={() => {
              navigate('RequireInfoEditScreen', {
                requireInfoItem: item
              })
            }}
            requireInfo={item} key={item.id} />}
          keyExtractor={eachRequireInfo => eachRequireInfo.id}
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
      {isJournalist ? <TouchableOpacity style={[styles.touchOpacity, { right: -6, bottom: -2 }]}
        onPress={() => {
          navigate('RequireInfoScreen')
        }}>
        <Text style={{ fontSize: 26, color: 'white', paddingHorizontal: 10 }}>+</Text>
      </TouchableOpacity> : null}
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
export default RequireInfoListScreen

