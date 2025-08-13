import React, { useState, useEffect } from "react";
import { useIsFocused } from '@react-navigation/native';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StyleSheet,
  Modal,
  Alert,
  PermissionsAndroid
} from 'react-native'
import { colors, string, COLORS, SIZES } from "../constants";
import Icon from 'react-native-vector-icons/FontAwesome'
import SessionItem from "./SessionItem";
import { sessions as sessionsRepo } from "../repositories"
import { getMyStringValue } from "../utilies/LocalDataHandler"
import { convertDateToDateTimeString, convertDateTimeToDateString, convertDateToDateTimeStringForExcelFile} from "../utilies/DateTime";
import DatePicker from "react-native-date-picker";
import { CallCustomAlert } from "../utilies";
import AppLoader from '../utilies/AppLoader';
import { ActivityIndicator } from "react-native-paper";
import SearchInput from '../Component/SearchInput';
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
function SessionListScreen(props) {
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
  ///////////////// ASYGN STORAGE ///////////////////////
  const [tokenString, setTokenString] = useState('')
  const [userID, setUserID] = useState('')
  const [userTypeID, setUserTypeID] = useState('')
  const [instituteID, setInstituteID] = useState('')

  const [fromDate, setFromDate] = useState(null)
  const [toDate, setToDate] = useState(null)
  const [openToDate, setOpenToDate] = useState(false)
  const [openFromDate, setOpenFromDate] = useState(false)
  const [fromDateString, setFromDateString] = useState('')
  const [toDateString, setToDateString] = useState('')
  
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
  getMyStringValue("instituteID").then((value) => {
    const data = value;
    setInstituteID(data)
    getMyStringValue("token").then((value) => {
      const data = value;
      setTokenString(data)
    })
  })

  useEffect(() => {
    //console.warn('focus')
    if (tokenString != '' && isFocused) {
      onGetWorkData()
      if ((flatListRef !== null) && (flatListRef.current !== null) && (sessions.length > 0 || sessionsManager.length > 0)) {
        if (flatListRef.current.props.data.length > 1)
          flatListRef.current.scrollToOffset({ animated: true, offset: 0 })
      }
    }
  }, [isFocused]);

  useEffect(() => {
    navigation.setOptions(
      {
        headerShown: true,
        headerTitle: 'Danh sách buổi làm việc',
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
      debugger
      let index = 1
      // Get the filtered list and store it in a separate variable
      const filteredData = filteredSessionLists();
      if (isManage) {  
        excelData = [
          ['STT', 'Đơn vị tiếp nhận', 'Người tạo', 'Số người tham gia', 'Buổi làm việc', 'Trạng thái', 'Thời gian'],
          ...filteredData.map(element => [
            index++,
            element.register?.[0].receiveUnit?.name,
            element.register?.[0].senderUsers?.givenName,
            element.register?.length,
            element.workSession,
            element.status,
            element.time,
          ])
        ];
      }
      else {
        excelData = [
          ['STT', 'Buổi làm việc', 'Số người tham gia', 'Trạng thái', 'Thời gian'],
          ...filteredData.map(element => [
            index++,
            element.workSession,
            element.register?.length,
            element.status,
            element.time,
          ])
        ];
      }
      let wb = XLSX.utils.book_new();
      let ws = XLSX.utils.aoa_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, 'Danh sách buổi làm việc');
      const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });
      // Save the Excel file
      const currentDate = new Date();
      const formattedDate = convertDateToDateTimeStringForExcelFile(currentDate)
      const fileName = `Danhsachbuoilamviec_${formattedDate}.xlsx`;
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
  const [sessionsManager, setSessionsManager] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    // debugger
    if (tokenString != '') {
      var curentDate = new Date()
      setToDate(new Date(curentDate.setMonth(curentDate.getMonth() + 12)))
      setFromDate(new Date(curentDate.setMonth(curentDate.getMonth() - 24)))
    }
  }, [tokenString])

  let SessionData = []

  sessions.length && sessions.forEach(element => {
    let sessionObj = {
      sessionObject: element,
      sessionId: element.id,
      workSession: element.workSession,
      respWorkSession: element.respWorkSession,
      register: element.register,
      time: convertDateToDateTimeString(new Date(parseInt(element.dateSession))),
      timeOrigin: element.dateSession,
      status: element.statusSession == 2 ? "Chờ làm việc" : (element.statusSession == 1 ? "Hoàn thành" : "Hủy đăng ký"),
      isManager: isManage,
      publicPage: false,
    }
    SessionData.push(sessionObj)
  });

  let SessionDataManager = []

  sessionsManager.length && sessionsManager.forEach(element => {
    debugger
    let sessionObj = {
      sessionObject: element,
      sessionId: element.id,
      workSession: element.workSession,
      respWorkSession: element.respWorkSession,
      register: element.register,
      time: convertDateToDateTimeString(new Date(parseInt(element.dateSession))),
      timeOrigin: element.dateSession,
      status: element.statusSession == 2 ? "Chờ làm việc" : (element.statusSession == 1 ? "Hoàn thành" : "Hủy đăng ký"),
      isManager: isManage,
      publicPage: element.publicPage,
    }
    SessionDataManager.push(sessionObj)
  });

  useEffect(() => {
    if (toDate != null && fromDate != null) {
      setToDateString(convertDateTimeToDateString(toDate));
      setFromDateString(convertDateTimeToDateString(fromDate));
      onGetWorkData()
    }
  }, [toDate, fromDate])

  const onGetWorkData = () => {
    if (!toDate || !fromDate || toDate <= fromDate) {
      setSessions([])
      setSessionsManager([])
      return;
    }
    setShowLoading(true);
    if (isManage) { // nếu là manager thì call api system/list-session-work
      sessionsRepo.getSessionsByInstituteIDAndSessionIDForManager(tokenString, 1)
        .then(responseSession => {
          setSessionsManager(responseSession)
          debugger
          setShowLoading(false)
        })
        .catch(errorMessage => {
          setShowLoading(false);
          CallCustomAlert.showAlertWith(
            errorMessage == 'Not found' ? string.NOT_FOUND : string.CANT_CONNECT_SERVER,
            "error",
            "OK"
          );
        });
    }
    else {
      sessionsRepo.getSessionsByInstituteIDAndSessionID(tokenString, instituteID, 0, 1, null)
        .then(responseSession => {
          setSessions(responseSession)
          debugger
          setShowLoading(false)
        })
        .catch(errorMessage => {
          setShowLoading(false);
          CallCustomAlert.showAlertWith(
            errorMessage == 'Not found' ? string.NOT_FOUND : string.CANT_CONNECT_SERVER,
            "error",
            "OK"
          );
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

  const removeAccents = (text) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const filteredSessionLists = () => {
    let filteredList = isManage ? SessionDataManager : SessionData;

    if (selectedStatus !== "all") {
      filteredList = filteredList.filter(
        (sessionLists) => sessionLists.status.toLowerCase() === selectedStatus.toLowerCase()
      );
    }
    filteredList = filteredList.filter(
      (sessionLists) => {
        const registrationTime = sessionLists.timeOrigin;
        const fromTime = fromDate.getTime();
        const toTime = toDate.getTime();
        const withinDateRange = parseInt(registrationTime) >= parseInt(fromTime) && parseInt(registrationTime) <= parseInt(toTime);
        console.log("withinDateRange:", withinDateRange);
        return withinDateRange;
      }
    );
    if (searchText !== "") {
      const searchTextWithoutAccents = removeAccents(searchText.toLowerCase());
      filteredList = filteredList.filter((sessionLists) => {
        const includesText = (text) => removeAccents(text.toLowerCase()).includes(searchTextWithoutAccents);
        if (isManage) {
          return includesText(sessionLists.workSession|| '') ||
            includesText(sessionLists.register?.[0].receiveUnit?.name|| '');
        }
          return includesText(sessionLists.workSession|| '');
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
  const listData = filteredSessionLists().slice(0, loadmoreI)
  const loadMoreItem = () => {
    if (listData.length >= filteredSessionLists().length) {
      return;
    }
    setIsLoading(true)
    setTimeout(() => {
      setLoadMoreI(loadmoreI + 5)
      setIsLoading(false)
    }, 1000);
  }
  ///////////////////// LAYOUT RENDER ///////////////////////////////////
  return <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background, padding: 15 }}>
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
            {/* tam giác dưới bộ lọc */}
            <View style={styles.TriangleShapeCSS} />
            <View onStartShouldSetResponder={() => true}
              style={{
                marginLeft: 160,
                marginRight: 10,
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
                <TouchableOpacity onPress={() => handleStatusFilter('Hoàn thành')} style={{ flexDirection: 'row', marginTop: 4 }}>
                  <Text style={[styles.buttonStatus, activeStatus === 'Hoàn thành' && styles.activeWorkDone]}>Hoàn thành</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleStatusFilter('Chờ làm việc')} style={{ flexDirection: 'row', marginTop: 4 }}>
                  <Text style={[styles.buttonStatus, activeStatus === 'Chờ làm việc' && styles.activeWaitWorking]}>Chờ làm việc</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleStatusFilter('Hủy đăng ký')} style={{ flexDirection: 'row', marginTop: 4 }}>
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
      {filteredSessionLists().length > 0 ?
        <FlatList
          nestedScrollEnabled={true}
          data={listData}
          ref={flatListRef}
          renderItem={({ item }) => <SessionItem
            onPress={() => {
              navigate('SessionScreen', {
                sessionItem: item
              })
            }}
            session={item} key={item.id} />}
          keyExtractor={eachwork => eachwork.id}
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
    </View>
  </SafeAreaView>
};

const styles = StyleSheet.create({
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
    right: 20
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
export default SessionListScreen

