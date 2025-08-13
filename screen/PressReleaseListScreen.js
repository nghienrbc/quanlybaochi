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
  Modal
} from 'react-native'
import { colors, string, COLORS,SIZES } from "../constants";
import Icon from 'react-native-vector-icons/FontAwesome'
import PressReleaseItem from "./PressReleaseItem";
import { annoucement as annoucementRepo } from '../repositories'
import { getMyStringValue } from "../utilies/LocalDataHandler"
import { convertDateToDateTimeString, convertDateTimeToDateString } from "../utilies/DateTime";
import { CallCustomAlert } from "../utilies";
import AppLoader from '../utilies/AppLoader';
import { ActivityIndicator} from "react-native-paper";
import SearchInput from '../Component/SearchInput';
import DatePicker from "react-native-date-picker";
function PressReleaseListScreen(props) {
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
  const [annoucement, setAnnoucement] = useState([]);
  ///////////////// ASYGN STORAGE ///////////////////////
  const [tokenString, setTokenString] = useState('')
  const [userID, setUserID] = useState('')
  const [userTypeID, setUserTypeID] = useState('')

  const [fromDate, setFromDate] = useState(null)
  const [toDate, setToDate] = useState(null)
  const [openToDate, setOpenToDate] = useState(false)
  const [openFromDate, setOpenFromDate] = useState(false)
  const [fromDateString, setFromDateString] = useState('')
  const [toDateString, setToDateString] = useState('')

  getMyStringValue("token").then((value) => {
    const data = value;
    setTokenString(data)
  })
  getMyStringValue("userTypeID").then((value) => {
    const data = value;
    setUserTypeID(data)
    setIsJournalist(data == 7)
  })
  getMyStringValue("userID").then((value) => {
    const data = value;
    setUserID(data)
  })


  useEffect(() => {
    //console.warn('focus') 
    //debugger
    if (tokenString != '' && isFocused) {
      setShowLoading(true)
      annoucementRepo.getAllAnnoucement(tokenString)
        .then(responseAnnoucement => {
          setAnnoucement(responseAnnoucement)
          setShowLoading(false)
        })
        .catch(
          errorMessage => {
            setShowLoading(false)
            if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
          }
        )
    }
  }, [isFocused]);

  useEffect(() => {
    navigation.setOptions(
      {
        headerShown: true,
        headerTitle: 'Danh sách thông cáo báo chí',
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
      annoucementRepo.getAllAnnoucement(tokenString)
        .then(responseAnnoucement => {
          setAnnoucement(responseAnnoucement)
          setShowLoading(false)
        })
        .catch(
          errorMessage => {
            setShowLoading(false)
            if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
          }
        )
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

  let annoucementList = []
  annoucement != null && annoucement.length > 0 && annoucement.forEach(element => {
    let annoucementObj = {
      annocementObject: element,
      id: element.id,
      title: element.title,
      content: element.content,
      agency: element.sender?.Institute?.name,
      senderName: element.sender?.givenName || '',
      time: convertDateToDateTimeString(element.createdAt),
      timeOrigin: element.createdAt,
      imageUrl: element.thumbnail ?
        string.IMAGEURL + element.thumbnail[0].file_path + '/' + element.thumbnail[0].file_name : 'http://10.220.5.13:8090/api/v1/media/view/event.jpg'
    }
    annoucementList.push(annoucementObj)
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
    annoucementRepo.getAllAnnoucement(tokenString)
        .then(responseAnnoucement => {
          setAnnoucement(responseAnnoucement)
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
  };
  const [searchText, setSearchText] = useState('')
 
  const removeAccents = (text) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };
  
  const filteredAnnoucementList = () => {
    let filteredList = annoucementList.filter((eachAnnoucementList) => {
      const searchTextWithoutAccents = removeAccents(searchText.toLowerCase()) ;
      const includesText = (text) => text ? removeAccents(text.toLowerCase()).includes(searchTextWithoutAccents) : false;
      
      const agencyIncludesText = includesText(eachAnnoucementList.agency);
      const titleIncludesText = includesText(eachAnnoucementList.title);
      const senderNameIncludesText = includesText(eachAnnoucementList.senderName);
      
      return agencyIncludesText || titleIncludesText || senderNameIncludesText;
    });
    
    if (!isManage) {
      filteredList = filteredList.filter(
        (sessionLists) => {
          const registrationTime = sessionLists.timeOrigin;
          const fromTime = fromDate.getTime();
          const toTime = toDate.getTime();
          const withinDateRange = new Date(registrationTime) >= new Date(fromTime) && new Date(registrationTime) <= new Date(toTime);
          return withinDateRange;
        }
      );
    }
    return filteredList;
  };
  
  // loadmore item trong flatlist
  const [loadmoreI, setLoadMoreI] = useState(5)
  const listData = filteredAnnoucementList().slice(0, loadmoreI)
  const loadMoreItem = () => {
    if (listData.length >= filteredAnnoucementList().length) {
      return;
    }
    setIsLoading(true)
    setTimeout(() => {
      setLoadMoreI(loadmoreI + 5)
      setIsLoading(false)
    }, 1000);
  }
    // mở ra modal
    const [isOpenSort, setIsOpenSort] = useState(false)
    const callOpenSort = () => {
      setIsOpenSort(!isOpenSort)
    }
  return <SafeAreaView style={{ flex: 1, padding: 10, backgroundColor: COLORS.background, paddingBottom: -10 }}>
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
    <View style={{
      flex: 1,
      borderRadius: 10,
      paddingBottom: 10,
    }}>
      {filteredAnnoucementList().length > 0 ?
        <FlatList
          nestedScrollEnabled={true}
          style={{ flex: 1, marginBottom: 10 }}
          data={listData}
          renderItem={({ item }) => <PressReleaseItem
            onPress={() => {
              navigate('PressReleaseEditScreen', {
                pressReleaseItem: item,
              })
            }}
            annoucement={item} key={item.id} />}
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

      {/* {!isJournalist ? !searchText &&
        <TouchableOpacity style={[styles.touchOpacity, { right: -6, bottom: 8 }]}
          onPress={() => {
            //alert(`work item: ${item.title}`)
            navigate('PressReleaseScreen', {
              pressReleaseItem: {}, isCreateNew: true
            })
          }}>
          <Text style={{ fontSize: 26, color: 'white', paddingHorizontal: 10, }}>+</Text>
        </TouchableOpacity> : null} */}
    </View>
  </SafeAreaView>
};

const styles = StyleSheet.create({
  touchOpacity: {
    position: 'absolute',
    backgroundColor: colors.newprimary,
    opacity: 0.9,
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 5,
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
export default PressReleaseListScreen

