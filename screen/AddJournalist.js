import React, { useState, useEffect } from "react";
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
} from 'react-native'
import DocumentPicker, {
  DirectoryPickerResponse,
  DocumentPickerResponse,
  isInProgress,
  types,
} from 'react-native-document-picker'

import { COLORS, FONTS, SIZES, colors } from '../constants'
import Icon from 'react-native-vector-icons/FontAwesome'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon1 from 'react-native-vector-icons/MaterialIcons'
import DatePicker from 'react-native-date-picker'

import { work as workRepo, institute as instituteRepo, sessions as sessionsRepo } from "../repositories"
import { convertDateTimeToDateString, convertDateTimeToTimeString } from "../utilies/DateTime"
import { getMyStringValue } from "../utilies/LocalDataHandler"
import { showAlert, closeAlert } from "react-native-customisable-alert";

import { CallCustomAlert } from "../utilies";
import AppLoader from '../utilies/AppLoader';
import RegisterItem from "./RegisterItem";
import DropdownSingleSelect from '../Component/DropdownSingleSelect';

function AddJournalist(props) {
  //navigation
  const { navigation, route } = props
  //functions of navigate to/back
  const { navigate, goBack } = navigation
  const [showLoading, setShowLoading] = useState(false)

  const [title, setTitle] = useState('');
  const [sessionID, setSessionID] = useState(0);
  const [content, setContent] = useState('');
  const [response, setResponse] = useState(null)
  const [date, setDate] = useState(new Date())
  const [open, setOpen] = useState(false)
  const [dateString, setDateString] = useState('')
  const [timeString, setTimeString] = useState('')
  const [selectedInstituteID, setSelectedInstituteID] = useState(0)
  const [timeStamp, setTimeStamp] = useState('')
  const [isChangeDate, setIsChangeDate] = useState(false)
  const [fileUri, setFileUri] = useState('');
  // const [tokenString, setTokenString] = useStateWithCallback('', tokenString => { 
  //  })  

  const [institute, setInstitute] = useState([])
  const [sessions, setSessions] = useState([])
  const [registers, setRegisters] = useState([])
  const flatListRef = React.useRef()

  ///////////////// ASYGN STORAGE ///////////////////////
  const [tokenString, setTokenString] = useState('')
  const [userID, setUserID] = useState('')
  const [userTypeID, setUserTypeID] = useState('')
  getMyStringValue("token").then((value) => {
    const data = value;
    setTokenString(data)
  })
  getMyStringValue("userTypeID").then((value) => {
    const data = value;
    setUserTypeID(data)
  })
  getMyStringValue("userID").then((value) => {
    const data = value;
    setUserID(data)
  })

  ////////////////// NAVIGATION OPTION ////////////////////
  useEffect(() => {
    navigation.setOptions(
      {
        headerShown: true,
        headerTitle: 'Đăng ký làm việc',
        headerTitleStyle: { fontSize: 20, fontWeight: 'bold' },
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: colors.newprimary
        },
        headerTintColor: 'white'
      })
  }, [])

  //////////////////////// XỮ LÝ CAL API ///////////////////////////////////
  const callPostWorkRegistration = () => {
    if (tokenString != '') {
      if (selectedInstituteID == 0) {
        // chuwa chojn teen down vi
        CallCustomAlert.showAlertWith("Chưa chọn đơn vị đăng ký làm việc", 'error', 'OK')
        return
      }
      if (title == '' || content == '') {
        // de nghi nhap ten tieu de// de nghi nhap ten tieu de
        CallCustomAlert.showAlertWith("Chưa nhập tiêu đề hoặc nội dung", 'error', 'OK')
        // onPress: () => closeAlert()                  
        return
      }
      if (dateString == '') {
        CallCustomAlert.showAlertWith("Chưa chọn ngày làm việc", 'error', 'OK')
        return
      }

      if (registersData.find(data => data.senderId == userID)) { // kiểm tra đã join vào session này chưa
        CallCustomAlert.showAlertWith("Đã tham gia vao buổi làm việc này", 'error', 'OK')
        return
      }

      setShowLoading(true)
      debugger
      workRepo.postWorkRegistration(tokenString, selectedInstituteID, sessionID, title, content, timeStamp, false, false, false, fileUri)
        .then(
          responseWork => {
            setResponse(responseWork)
            setShowLoading(false)
            showAlert({
              title: 'Thông báo',
              message: "Đăng ký làm việc thành công",
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
            CallCustomAlert.showAlertWith("Đăng ký không thành công", errorMessage == 'Not found' ? string.NOT_FOUND : string.CANT_CONNECT_SERVER, "error", "OK")
          }
        )
    }
  }

  /////////////////// USE EFFECT ///////////////////////////
  useEffect(() => {
    if (!isChangeDate) return
    setDateString(convertDateTimeToDateString(date));
    setTimeString(convertDateTimeToTimeString(date));
    setIsChangeDate(false)
  }, [isChangeDate])

  useEffect(() => {
    if (tokenString != '') {
      setShowLoading(true)
      instituteRepo.getAllInstitute(tokenString)
        .then(
          responseInstitute => {
            setInstitute(responseInstitute)
            setShowLoading(false)
          }
        )
        .then(
          workRepo.getAllWorkRegistration(tokenString)
            .then(responseWork => {
              setWork(responseWork)
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
            debugger
            setShowLoading(false)
            if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
          }
        )
    }
  }, [tokenString])

  //////////////////// DROPDOWN LIST CHANGE ITEM /////////////////
  // KHI CHỌN MỘT ĐƠN VỊ TRONG DANH SÁCH
  const onChangeInstitute = (selectedItems) => {
    //console.warn(selectedItems[0]) 
    setSelectedInstituteID(parseInt(selectedItems[0]))
    onChangeSession([0])
    setSessions([])

    setShowLoading(true)
    debugger
    sessionsRepo.getSessionsByInstituteIDAndSessionID(tokenString, selectedItems[0], 0, 1, 2).then(
      responseSessions => {
        debugger
        setSessions(responseSessions)
        setShowLoading(false)
      }
    )
      .catch(
        errorMessage => {
          debugger
          setShowLoading(false)
          if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
        }
      )
  };

  // KHI CHỌN 1 SESSION CÓ SẴN
  const onChangeSession = (selectedItems) => {
    //console.warn(selectedItems[0])  
    setSessionID(selectedItems[0])
    registersData.length = 0;
    setRegisters([])

    setDateString('');
    setTimeString('');

    setTitle('')
    if (selectedItems[0] == 0) return
    debugger
    // nếu chọn 1 session có sẵn thì phải gán title và ngày làm việc của session có sẵn với đăng ký này
    let selectSession = sessionsData.find(data => data.id === selectedItems[0]);
    if (selectSession != null) {
      //console.warn(selectSession.dateSession)
      // đã lấy được session
      setDate(new Date(parseInt(selectSession.dateSession)))
      setTimeStamp(selectSession.dateSession)
      setIsChangeDate(true)
      setRegisters(selectSession.register)
      // set các giá trị để gửi API đăng ký
      setTitle(selectSession.workSession)
    }
  };

  //////////////////// XỮ LÝ DỮ LIỆU TỪ API VÀO CÁC ARRAY /////////////
  const instituteData = []

  if (institute.length > 0) {
    institute.forEach(element => {
      instituteData.push({
        "item": element.name,
        "label": element.name,
        "value": element.id,
        "id": element.id,
        'name': element.name,
        'parentId': element.parentId,
        'hierarchyLevel': element.hierarchyLevel,
        'address': element.address,
        'maED': element.maED
      })
      element.children && element.children.forEach(childElement1 => {
        instituteData.push({
          "item": childElement1.name,
          "label": childElement1.name,
          "value": childElement1.id,
          "id": childElement1.id,
          'name': childElement1.name,
          'parentId': childElement1.parentId,
          'hierarchyLevel': childElement1.hierarchyLevel,
          'address': childElement1.address,
          'maED': childElement1.maED
        })
        childElement1.children && childElement1.children.forEach(childElement2 => {
          instituteData.push({
            "item": childElement2.name + ' - ' + childElement1.name,
            "label": childElement2.name + ' - ' + childElement1.name,
            "value": childElement2.id,
            "id": childElement2.id,
            'name': childElement2.name + ' - ' + childElement1.name,
            'parentId': childElement2.parentId,
            'hierarchyLevel': childElement2.hierarchyLevel,
            'address': childElement2.address,
            'maED': childElement2.maED
          })
          childElement2.children && childElement2.children.forEach(childElement3 => {
            instituteData.push({
              "item": childElement3.name,
              "label": childElement3.name,
              "value": childElement3.id,
              "id": childElement3.id,
              'name': childElement3.name,
              'parentId': childElement3.parentId,
              'hierarchyLevel': childElement3.hierarchyLevel,
              'address': childElement3.address,
              'maED': childElement3.maED
            })
          })
        })
      })
    })
  }

  const [work, setWork] = useState([]);
  const sessionsData = []
  sessions.length > 0 && sessions.forEach(element => {
    // kiểm tra nếu session đó phóng viên đã join vào thì không đưa vào danh sách nữa
    if (element.register.find(data => data.senderId == userID) == null) {
      // tiếp tục kiểm tra xem phóng viên đã từng đăng ký vào session này chưa(đk nhưng chưa được duyệt)
      // chưa duyệt thì chưa có trong reggister của session, do đó session đó vẫn hiển thị lên
      // nếu dk đã duyệt nhưng bị hủy thì có thể join vào lại
      if (work.find(data => data.sessionContent.id == element.id && data.statusApointment != 0) == null) {
        let sessionObj = {
          "id": element.id,
          "label": element.respWorkSession ? element.respWorkSession : element.workSession,
          "value": element.id,
          "workSession": element.respWorkSession ? element.respWorkSession : element.workSession,
          "dateSession": element.dateSession,
          "statusSession": element.statusSession,
          "register": element.register
        }
        sessionsData.push(sessionObj)
      }
    }
  })

  // Lấy danh sách người tham dự đưa vào mãng registerData để hiển thị lên flatlist
  let registersData = []
  registers.length > 0 && registers.forEach(element => {
    debugger
    let registerObj = {
      "id": element.id,
      "senderId": element.senderId,
      "senderUserName": element.senderUsers.givenName,
      "agency": element.senderUsers?.Institute?.name,
    }
    registersData.push(registerObj)
  })

  //////////////// CHOOSE FILE FROM DEVICE ////////////////////
  const [result, setResult] = React.useState(null)
  useEffect(() => {
    if (result == null) return
    //console.warn(JSON.stringify(result[0].fileCopyUri, null, 2))
    if (JSON.stringify(result[0].fileCopyUri, null, 2) != '') {
      setFileUri(result[0].fileCopyUri)
    }
  }, [result])

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
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      {showLoading ? <AppLoader /> : null}
      {/* <View style={styles.viewContainer}>
      </View> */}
      <DatePicker
        title="Chọn ngày và giờ"
        modal
        open={open}
        date={date}
        onConfirm={(date) => {
          debugger
          setOpen(false)
          setDate(date)
          setTimeStamp(new Date(date).getTime())
          setIsChangeDate(true)
        }}
        onCancel={() => {
          setOpen(false)
        }}
        mode="datetime"
        theme="auto"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={false}
        nestedScrollEnabled={true}
        contentContainerStyle={styles.scrollViewContainer}>

        <View style={[styles.viewContainDropdown, {}]}>
          <View style={{
            width: '100%',
            backgroundColor: COLORS.white,
            borderWidth: 1,
            borderRadius: SIZES.radius,
            borderColor: COLORS.gray,
            marginBottom: 10
          }}>
             <DropdownSingleSelect
              items={instituteData}
              IconRenderer={Icon1}
              displayKey="name"
              selectText="Chọn đơn vị đăng kí làm việc"
              onSelectedItemsChange={onChangeInstitute}
              selectedItems={[selectedInstituteID]}
              filterItems={(filter, items) => {
                return items.filter((item) =>
                  item.name.toLowerCase().includes(filter.toLowerCase())
                );
              }}
            />
          </View>

          {selectedInstituteID != 0 && sessionsData.length > 0 ?
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
                  selectedItems={[sessionID]}
                  filterItems={(filter, items) => {
                    return items.filter((item) =>
                      item.label.toLowerCase().includes(filter.toLowerCase())
                    );
                  }}
                />
              </View>
              <TouchableOpacity style={{
                alignContent: 'center',
                justifyContent: 'center',
                marginLeft: 10
              }}
                disabled={sessionID == 0}
                onPress={() => {
                  onChangeSession([0])
                }}>
                <Icon name='remove' style={{ color: 'black', fontSize: 30 }} />
              </TouchableOpacity >
            </View> : null}

          {sessionID == 0 ? <View>
            <Text style={styles.titleSmallHeader}>
              Tiêu đề
            </Text>
            <TextInput
              style={[styles.input, { height: 100 }]}
              onChangeText={(value) => setTitle(value)}
              value={title}
              multiline={true}
              placeholder="Nhập tiêu đề"
              placeholderTextColor={'#20202088'}
            />
          </View> : null}
          {/* // danh sách các phóng viên tham gia vào session sẽ liệt kê ra ở đây, dùng flat list */}
          {sessionID != 0 ? <Text style={[styles.titleSmallHeader, { marginVertical: 10 }]}>
            Danh sách người tham dự
          </Text> : null}
          {sessionID != 0 ?
            <ScrollView
              horizontal={true}
              alwaysBounceHorizontal={false}
              contentContainerStyle={styles.scrollViewContainer}
            >
              <FlatList
                nestedScrollEnabled={true}
                style={{ marginTop: 10 }}
                ref={flatListRef}
                data={registersData}
                renderItem={({ item }) => <RegisterItem
                  onPress={() => {
                    //console.warn(`register item: ${item.id}`)
                    //navigate('WorkEdit', {
                    //workItem:item
                    //})
                  }}
                  register={item} key={item.id} />}
                keyExtractor={eachRegister => eachRegister.id}
              />
            </ScrollView> : null
          }


          <Text style={styles.titleSmallHeader}>
            Nội dung
          </Text>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            onChangeText={(value) => setContent(value)}
            value={content}
            multiline={true}
            placeholder="Nhập nội dung"
            underlineColorAndroid='transparent'
            placeholderTextColor={'#20202088'}
          />
          <Text style={styles.titleSmallHeader}>
            File đính kèm
          </Text>

          <View style={{ flexDirection: 'row', backgroundColor: 'white', borderColor: COLORS.gray, borderRadius: SIZES.radius, borderWidth: 1, padding: 10, marginBottom: 10, marginTop: 5 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, color: '#000' }}>
                File: {fileUri.split('/').pop()}
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
                flexDirection: 'row'
              }}
                onPress={async () => {
                  try {
                    const pickerResult = await DocumentPicker.pickSingle({
                      presentationStyle: 'fullScreen',
                      copyTo: 'cachesDirectory',
                    })
                    setResult([pickerResult])
                  } catch (e) {
                    handleError(e)
                  }
                }}>
                <FontAwesome name='file-text' style={{ color: 'white', fontSize: 18, marginRight: 5 }} />
                <Text style={{ fontSize: 13, color: 'white' }}>
                  Chọn File
                </Text>
              </TouchableOpacity >
            </View>
          </View>
          <Text style={styles.titleSmallHeader}>
            {sessionID == 0 ? 'Ngày đề xuất' : 'Ngày làm việc'}
          </Text>
          <View style={{ flexDirection: 'row', backgroundColor: 'white', borderColor: COLORS.gray, borderRadius: SIZES.radius, borderWidth: 1, padding: 10, marginTop: 5 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, color: '#000' }}>
                Ngày: {dateString}
              </Text>
              <Text style={{ fontSize: 16, color: '#000' }}>
                Vào lúc: {timeString}
              </Text>
            </View>
            {sessionID == 0 ?
              <View style={{ justifyContent: 'center', }}>
                <TouchableOpacity style={{
                  backgroundColor: '#0373F3',
                  borderRadius: 10,
                  alignContent: 'center',
                  justifyContent: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 10,
                  flexDirection: 'row'
                }}
                  onPress={() => setOpen(true)}>
                  <Ionicons name='calendar' style={{ color: 'white', fontSize: 18, marginRight: 5 }} />
                  <Text style={{ fontSize: 13, color: 'white' }}>
                    Hẹn ngày
                  </Text>
                </TouchableOpacity >
              </View> : null}
          </View>
        </View>


        <TouchableOpacity style={{
          backgroundColor: colors.newprimary,
          borderRadius: 10,
          alignContent: 'center',
          justifyContent: 'center',
          paddingVertical: 10,
          paddingHorizontal: 10,
          margin: 20,
          marginTop: 0,
          flexDirection: 'row'
        }}
          onPress={() => callPostWorkRegistration()}
        >
          <Text style={{ fontSize: 20, color: 'white' }}>
            Gửi đăng ký
          </Text>
        </TouchableOpacity >


      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  viewContainer: { flex: 1, backgroundColor: '#FFF' },
  scrollViewContainer: {
    flexGrow: 1,
    backgroundColor: '#FFF'
  },
  titleSmallHeader: {
    ...FONTS.h3,
    fontWeight: 'bold',
    color: 'black'
  },
  viewContainDropdown: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20
  },
  input: {
    height: 200,
    width: '100%',
    borderColor: COLORS.gray,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    fontSize: 16,
    marginVertical: 10,
    textAlignVertical: 'top',
    color: 'black',
    backgroundColor: 'white'
  },
});
export default AddJournalist