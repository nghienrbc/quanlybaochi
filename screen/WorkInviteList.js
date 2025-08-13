import React, { useState, useEffect } from "react";
import { useIsFocused } from '@react-navigation/native';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal
} from 'react-native'
import { COLORS, colors, SIZES, string } from '../constants'
import Icon from 'react-native-vector-icons/FontAwesome'
import WorkInviteItem from "./WorkInviteItem";
import { work as workRepo } from '../repositories'
import { getMyStringValue } from "../utilies/LocalDataHandler"
import { convertDateToDateTimeString,convertDateTimeToDateString } from "../utilies/DateTime";

import { CallCustomAlert } from "../utilies";
import AppLoader from '../utilies/AppLoader';
import DatePicker from "react-native-date-picker";
import { showAlert, closeAlert } from "react-native-customisable-alert";
import messaging from '@react-native-firebase/messaging';
import SearchInput from '../Component/SearchInput';
import { ActivityIndicator } from "react-native-paper";
function WorkInviteList(props) {
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
  const [agency, setAgency] = useState([])

  const [invitation, setInvitation] = useState([]);
  const [invitationJournalist, setInvitationJournalist] = useState([]);
  ///////////////// ASYGN STORAGE ///////////////////////
  const [tokenString, setTokenString] = useState('')
  const [userID, setUserID] = useState('')
  const [userTypeID, setUserTypeID] = useState('')

  const [isRefresh, setIsRefresh] = useState(false)

  const [fromDate, setFromDate] = useState(null)
  const [toDate, setToDate] = useState(null)
  const [openToDate, setOpenToDate] = useState(false)
  const [openFromDate, setOpenFromDate] = useState(false)
  const [fromDateString, setFromDateString] = useState('')
  const [toDateString, setToDateString] = useState('')

  useEffect(() => {
    const notificationHandler = async () => {
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log("remote message:", remoteMessage);
        showAlert({
          title: remoteMessage.notification.title,
          message: remoteMessage.notification.body,
          alertType: 'success',
          btnLabel: 'OK',
          onPress: () => {
            if (route.name == 'WorkInviteList') {
              setIsRefresh(true)
            }
            closeAlert()
          }
        })
      })
      const unsubcrible = messaging().onMessage(async (remoteMessage) => {
        debugger
        console.log('FOREGROUND: ', remoteMessage); 
        showAlert({
          title: remoteMessage.notification.title,
          message: remoteMessage.notification.body,
          alertType: 'success',
          btnLabel: 'OK',
          onPress: () => {
            debugger
            console.log('route.name: ', route.name);
            if (route.name == 'WorkInviteList') {
              setIsRefresh(true)
            }
            closeAlert()
          }
        })
      });
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Message handled in the background!', remoteMessage);
        showAlert({
          title: remoteMessage.notification.title,
          message: remoteMessage.notification.body,
          alertType: 'success',
          btnLabel: 'OK',
          onPress: () => {
            if (route.name == 'WorkInviteList') {
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

  useEffect(() => {
    // debugger
    if (tokenString != '' && (isFocused || isRefresh)) {
      setIsRefresh(false)
      setShowLoading(true)
      if (isJournalist) {
        workRepo.getAllWorkInviteForJournalist(tokenString)
          .then(responseInvitation => {
            setInvitationJournalist(responseInvitation)
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
      } else {
        workRepo.getAllWorkInvite(tokenString)
          .then(responseInvitation => {
            setInvitation(responseInvitation)
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
  ////////////////// NAVIGATION OPTION ////////////////////
  useEffect(() => {
    // debugger
    navigation.setOptions(
      {
        headerShown: true,
        headerTitle: 'Danh sách mời làm việc',
        headerTitleStyle: { fontSize: 20, fontWeight: 'bold' },
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: colors.newprimary
        },
        headerTintColor: 'white'
      })
  }, [])

  // call function to get data
  useEffect(() => {
    if (tokenString != '') {
      setShowLoading(true)
      // kiểm tra nếu user là phóng viên thì gọi API khác mà user là CQNN thì gọi API khác
      if (isJournalist) {
        workRepo.getAllWorkInviteForJournalist(tokenString)
          .then(responseInvitation => {
            setInvitationJournalist(responseInvitation)
            setShowLoading(false)
          })
          .catch(
            errorMessage => {
              setShowLoading(false)
              if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
            }
          )
      } else {
        workRepo.getAllWorkInvite(tokenString)
          .then(responseInvitation => {
            setInvitation(responseInvitation)
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
    // debugger
    if (tokenString != '') {
      var curentDate = new Date()
      setToDate(new Date(curentDate.setMonth(curentDate.getMonth() + 12)))
      setFromDate(new Date(curentDate.setMonth(curentDate.getMonth() - 24)))
    }
  }, [tokenString])

  let invitationData = []
  console.log(invitationData)
  invitation.forEach(element => {
    let invitationObj = {
      invitationObject: element,
      id: element.id,
      title: element.titleInvite,
      agency: null,
      time: convertDateToDateTimeString(new Date(parseInt(element.dateInvite))),
      timeOrigin:element.dateInvite,
      status: element.actived == false ? "Hủy làm việc" : (element.contentSession != null ? "Hoàn thành" : "Chờ làm việc"),
      userTypeID: isJournalist ? 7 : 3,

    }
    invitationData.push(invitationObj)
  });

  let invitationJournalistData = []
  invitationJournalist.forEach(element => {
    //debugger
    let invitationJounalistObj = {
      invitationObject: element,
      id: element.id,
      title: element.workInvite.titleInvite,
      agency: element.workInvite.sender?.Institute?.name,
      time: convertDateToDateTimeString(new Date(parseInt(element.workInvite.dateInvite))),
      timeOrigin:element.workInvite.dateInvite,
      status: (element.workInvite.contentSession != null && element.workInvite.actived == true) ? "Hoàn thành" :
        (element.status == 0 || element.workInvite.reasonCancel != null ? "Hủy làm việc" : (element.status == 1 ? "Chờ làm việc" : "Chờ phản hồi")),
      userTypeID: isJournalist ? 7 : 3,
    }
    invitationJournalistData.push(invitationJounalistObj)
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

    if (isJournalist) {
      workRepo.getAllWorkInviteForJournalist(tokenString)
        .then(responseWork => {
          // debugger
          setInvitationJournalist(responseWork); // Update workManage with filtered data
          setShowLoading(false);
        })
        .catch(errorMessage => {
          setShowLoading(false);
          CallCustomAlert.showAlertWith(
            errorMessage == 'Not found' ? string.NOT_FOUND : string.CANT_CONNECT_SERVER,
            "error",
            "OK"
          );
        });
    } else {
      workRepo.getAllWorkInvite(tokenString)
        .then(responseWork => {
          setInvitation(responseWork);
          setShowLoading(false);
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
  const [isOpenSort, setIsOpenSort] = useState(false)
  const callOpenSort = () => {
    setIsOpenSort(!isOpenSort)
  }
  //chon trang thai
  const [selectedStatus, setSelectedStatus] = useState("all");
  //tim kiem
  const [searchText, setSearchText] = useState('')

  /* Gõ không dấu vẫn tìm kiếm được */
  const removeAccents = (text) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };
  const filteredInviteLists = () => {
    let filteredInvitations = isJournalist ? invitationJournalistData : invitationData;
    if (selectedStatus !== "all") {
      filteredInvitations = filteredInvitations.filter(
        (invitation) => invitation.status.toLowerCase() === selectedStatus.toLowerCase()
      );
    }
    if (!isManage) {
      filteredInvitations = filteredInvitations.filter(
        (invitation) => {
          const registrationTime = invitation.timeOrigin;
          const fromTime = fromDate.getTime();
          const toTime = toDate.getTime();
          const withinDateRange = parseInt(registrationTime) >= parseInt(fromTime) && parseInt(registrationTime) <= parseInt(toTime);
          return withinDateRange;
        }
      );
    }
    if (searchText !== "") {
      const searchTextWithoutAccents = removeAccents(searchText.toLowerCase());
      filteredInvitations = filteredInvitations.filter((invitation) => {
      const includesText = (text) => removeAccents(text.toLowerCase()).includes(searchTextWithoutAccents);
        if (isJournalist) {
          return includesText(invitation.title) ||
                 includesText(invitation.agency);
        } else {
          return includesText(invitation.title);
        }
      });
    }
    return filteredInvitations;
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    setActiveStatus(status);
  };
  //khi ấn vào trạng thái nào thì hiện màu của trạng thái
  const [activeStatus, setActiveStatus] = useState('all');
  const [loadmoreI, setLoadMoreI] = useState(5)
  const listData = filteredInviteLists().slice(0, loadmoreI)
  const loadMoreItem = () => {
    if (listData.length >= filteredInviteLists().length) {
      return;
    }
    setIsLoading(true)
    setTimeout(() => {
      setLoadMoreI(loadmoreI + 5)
      setIsLoading(false)
    }, 1000);
  }

  return <View style={{ flex: 1, backgroundColor: COLORS.background, padding: 15 }}>
    {showLoading ? <AppLoader /> : null}
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
        <TouchableOpacity onPress={() => callOpenSort()}
          style={{ flexDirection: 'row' }}>
          <Image style={{ height: 22, width: 22, tintColor: colors.newprimary, marginStart: 5 }}
            resizeMode="cover"
            source={require("../assets/icons/sort_icon.png")} />
          <Text style={{ fontSize: 13, color: colors.newprimary, fontWeight: 'bold' }}>Bộ lọc</Text>
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
              {userTypeID == 7 &&
                <TouchableOpacity onPress={() => handleStatusFilter('Chờ phản hồi')} style={{ flexDirection: 'row', marginTop: 4 }}>
                  <Text style={[styles.buttonStatus, activeStatus === 'Chờ phản hồi' && styles.activeWaitConfirm]}>Chờ phản hồi</Text>
                </TouchableOpacity>}
              <TouchableOpacity onPress={() => handleStatusFilter('Chờ làm việc')} style={{ flexDirection: 'row', marginTop: 4 }}>
                <Text style={[styles.buttonStatus, activeStatus === 'Chờ làm việc' && styles.activeWaitWorking]}>Chờ làm việc</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleStatusFilter('Hủy làm việc')} style={{ flexDirection: 'row', marginTop: 4 }}>
                <Text style={[styles.buttonStatus, activeStatus === 'Hủy làm việc' && styles.activeCancel]}>Hủy làm việc</Text>
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

    <View style={{ flex: 1 }}>
      {filteredInviteLists().length > 0 ?
        <FlatList
          nestedScrollEnabled={true}
          ref={flatListRef}
          data={listData}
          renderItem={({ item }) => <WorkInviteItem
            onPress={() => {
              navigate('WorkInviteEdit', {
                WorkInviteItem: item
              })
            }}
            invitation={item} key={item.id} />}
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
      {!isJournalist ? !searchText &&
        <TouchableOpacity style={[styles.touchOpacity, { right: -6, bottom: -4 }]}
          onPress={() => {
            navigate('WorkInvite')
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
export default WorkInviteList

