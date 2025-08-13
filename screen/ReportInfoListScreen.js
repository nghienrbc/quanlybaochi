import React, { useState, useEffect } from "react";
import { useIsFocused } from '@react-navigation/native';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  PermissionsAndroid,
  FlatList,
  StyleSheet,
  Modal,
  Alert
} from 'react-native'
import { colors, string, COLORS, SIZES } from "../constants";
import Icon from 'react-native-vector-icons/FontAwesome'
import DatePicker from 'react-native-date-picker'
import ReportInfoItem from "./ReportInfoItem";
import { reportinfo as reportinfoRepo } from '../repositories'
import { getMyStringValue } from "../utilies/LocalDataHandler"
import { convertDateToDateTimeString, convertDateTimeToDateString, convertDateToDateTimeStringForExcelFile } from "../utilies/DateTime";

import { CallCustomAlert } from "../utilies";
import AppLoader from '../utilies/AppLoader';
import { ActivityIndicator } from "react-native-paper";
import { showAlert, closeAlert } from "react-native-customisable-alert";
import messaging from '@react-native-firebase/messaging';
import SearchInput from '../Component/SearchInput';

import XLSX from 'xlsx';
import RNFS from 'react-native-fs';

function ReportInfoListScreen(props) {
  //navigation
  const { navigation, route } = props
  //functions of navigate to/back
  const { navigate, goBack } = navigation
  const [showLoading, setShowLoading] = useState(false)

  const isFocused = useIsFocused();
  const flatListRef = React.useRef()
  const [isJournalist, setIsJournalist] = useState(false)
  const [isSpokeman, setIsSpokeman] = useState(false)
  const [isManage, setIsManage] = useState(false)
  const [reports, setReports] = useState([]);

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
    setIsSpokeman(data == 3)
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
        headerTitle: 'Danh sách phản ánh báo chí',
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
      debugger
      let index = 1
      // Get the filtered list and store it in a separate variable
      const filteredData = filteredReportInfo();

      excelData = [
        ['STT', 'Người phản ánh', 'Đơn vị người gửi', 'Tiêu đề', 'Ngày phản ánh', 'Trạng thái'],
        ...filteredData.map(element => [
          index++,
          element.senderName,
          element.agency,
          element.title,
          element.timeCreate,
          element.status
        ])
      ];
      let wb = XLSX.utils.book_new();
      let ws = XLSX.utils.aoa_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, 'Danh sách phản ánh báo chí');
      const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });
      // Save the Excel file
      const currentDate = new Date();
      const formattedDate = convertDateToDateTimeStringForExcelFile(currentDate)
      const fileName = `Danhsachphananh_${formattedDate}.xlsx`;
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
      debugger
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
      console.log('notificationHandler ReportInfoListScreen');
      messaging().onNotificationOpenedApp(remoteMessage => {
        // Alert.alert(remoteMessage.notification.title);
        console.log("remote message:", remoteMessage);
        showAlert({
          title: remoteMessage.notification.title,
          message: remoteMessage.notification.body,
          alertType: 'success',
          btnLabel: 'OK',
          onPress: () => {
            if (route.name == 'ReportInfoListScreen') {
              setIsRefresh(true)
            }
            closeAlert()
          }
        })
      })
      const unsubcrible = messaging().onMessage(async (remoteMessage) => {
        debugger
        console.log('FOREGROUND: ', remoteMessage);
        //Alert.alert("Notification in foreground"); 
        showAlert({
          title: remoteMessage.notification.title,
          message: remoteMessage.notification.body,
          alertType: 'success',
          btnLabel: 'OK',
          onPress: () => {
            debugger
            console.log('route.name: ', route.name);
            if (route.name == 'ReportInfoListScreen') {
              setIsRefresh(true)
            }
            closeAlert()
          }
        })
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
            if (route.name == 'ReportInfoListScreen') {
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
      reportinfoRepo.getAllReportInfo(tokenString, new Date(fromDate).getTime(), new Date(toDate).getTime())
        .then(response => {
          setReports(response)
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
  }, [isFocused, isRefresh]);

  // call function to get data
  useEffect(() => {
    if (tokenString != '') {
      var curentDate = new Date()
      setToDate(new Date(curentDate.setMonth(curentDate.getMonth() + 12)))
      setFromDate(new Date(curentDate.setMonth(curentDate.getMonth() - 24)))
    }
  }, [tokenString])

  let reqportArray = []

  reports.forEach(element => {
    let reportObj = {
      reportObject: element,
      id: element.id,
      title: element.title,
      content: element.content,
      agency: element.sender?.Institute?.name,
      timeCreate: convertDateToDateTimeString(element.updatedAt),
      status: element.feedback.length > 0 ? "Đã phản hồi" : "Chờ phản hồi",
      senderName: element.sender.givenName,
      publicPage: element.publicPage,
      notifyId: isManage ? element.notifyId : (element.feedback.length > 0 ? element.feedback[0].notifyId : 0),
      notifyView: isManage ? element.notifyView : (element.feedback.length > 0 ? element.feedback[0].notifyView : 0),
      userTypeID: isManage ? 2 : (isJournalist ? 7 : 3),
    }
    reqportArray.push(reportObj)
  });

  useEffect(() => {
    debugger
    if (toDate != null && fromDate != null) {
      setToDateString(convertDateTimeToDateString(toDate));
      setFromDateString(convertDateTimeToDateString(fromDate));
      onGetReportData()
    }
  }, [toDate, fromDate])

  const onGetReportData = () => {
    debugger
    if (!toDate || !fromDate || toDate <= fromDate) {
      CallCustomAlert.showAlertWith("Chọn thời gian chưa phù hợp", "error", "OK")
      return
    }
    setShowLoading(true)
    reportinfoRepo.getAllReportInfo(tokenString, new Date(fromDate).getTime(), new Date(toDate).getTime())
      .then(response => {
        debugger
        setReports(response)
        setShowLoading(false)
      })
      .catch(
        errorMessage => {
          setShowLoading(false)
          if (errorMessage == 'Not found') {
            setReports([])
          }
          else CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
        }
      )
  }

  // mở ra modal
  const [isOpenSort, setIsOpenSort] = useState(false)
  const callOpenSort = () => {
    setIsOpenSort(!isOpenSort)
  }
  const [searchText, setSearchText] = useState('')
  //chon trang thai
  const [selectedStatus, setSelectedStatus] = useState("all");
  /* Gõ không dấu vẫn tìm kiếm được */
  const removeAccents = (text) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const filteredReportInfo = () => {
    let filteredList = reqportArray;

    if (selectedStatus !== "all") {
      filteredList = filteredList.filter(
        (reportInfo) => removeAccents(reportInfo.status.toLowerCase()) === removeAccents(selectedStatus.toLowerCase())
      );
    }

    if (searchText !== "") {
      debugger
      const searchTextWithoutAccents = removeAccents(searchText.toLowerCase());
      filteredList = filteredList.filter((reportInfo) => {
        const includesText = (text) => removeAccents(text.toLowerCase()).includes(searchTextWithoutAccents);

        if (isManage) {
          return includesText(reportInfo.title) ||
            includesText(reportInfo.agency) ||
            includesText(reportInfo.senderName)
        } else {
          return includesText(reportInfo.title) ||
            includesText(reportInfo.senderName) ||
            includesText(reportInfo.agency)
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
  const listData = filteredReportInfo().slice(0, loadmoreI)
  const loadMoreItem = () => {
    if (listData.length >= filteredReportInfo().length) {
      return;
    }
    setIsLoading(true)
    setTimeout(() => {
      setLoadMoreI(loadmoreI + 5)
      setIsLoading(false)
    }, 1000);
  }
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
        <View>
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
            {/* tam giác dưới bộ lọc */}
            <View
              style={styles.TriangleShapeCSS} />
            <View onStartShouldSetResponder={() => true}
              style={{
                marginLeft: 120,
                marginRight: 50,
                marginTop: 115,
                borderRadius: 8,
                paddingBottom: 10,
                backgroundColor: COLORS.white
              }}>
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
                    {/* // nếu PV đã join vào 1 session có săn thì không hẹn lại */}
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
                    {/* // nếu PV đã join vào 1 session có săn thì không hẹn lại */}
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
      {filteredReportInfo().length > 0 ?
        <FlatList
          style={{ flex: 1, marginBottom: 10 }}
          nestedScrollEnabled={true}
          ref={flatListRef}
          data={listData}
          renderItem={({ item }) => <ReportInfoItem
            onPress={() => {
              //alert(`work item: ${item.title}`)
              navigate('ReportInfoEditScreen', {
                reportInfoItem: item
              })
            }}
            reportInfo={item} key={item.id} />}
          keyExtractor={eachReortInfo => eachReortInfo.id}
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
      {!isManage ? <TouchableOpacity style={[styles.touchOpacity, { right: -6, bottom: -2 }]}
        onPress={() => {
          navigate('ReportInfoScreen')
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
  TriangleShapeCSS: {
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 15,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
    position: 'absolute',
    alignSelf: 'flex-end',
    top: 105,
    right: 65
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
export default ReportInfoListScreen

