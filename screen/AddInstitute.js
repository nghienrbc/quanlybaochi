import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from 'react-native'
import DocumentPicker, {
  DirectoryPickerResponse,
  DocumentPickerResponse,
  isInProgress,
  types,
} from 'react-native-document-picker'

import { COLORS, FONTS, SIZES , colors} from '../constants'
import Icon1 from 'react-native-vector-icons/MaterialIcons'
import { work as workRepo, institute as instituteRepo} from "../repositories"
import { getMyStringValue} from "../utilies/LocalDataHandler"
import { showAlert, closeAlert } from "react-native-customisable-alert";

import { CallCustomAlert } from "../utilies";
import AppLoader from '../utilies/AppLoader';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';

function AddInstitute(props) {
  //navigation
  const { navigation, route } = props
  //functions of navigate to/back
  const { navigate, goBack } = navigation
  const [showLoading, setShowLoading] = useState(false)

  const [pressName, setPressName] = useState('');
  const [pressAddress, setPressAddress] = useState('');
  const [pressDesciption, setPressDesciption] = useState('');  
  const [response, setResponse] = useState(null)   
  const [selectedInstituteID, setSelectedInstituteID] = useState(0)  
  const [selectedChildProvinceID, setSelectedChildProvinceID] = useState(0)  

  const [institute, setInstitute] = useState([])   
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
        headerTitle: 'Tạo mới đơn vị báo chí',
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
      if (pressName== '') {
        CallCustomAlert.showAlertWith("Chưa điền tên đơn vị", 'error', 'OK')              
        return
      }
      if (selectedInstituteID == 0 || selectedChildProvinceID == 0) {
        CallCustomAlert.showAlertWith("Chưa chọn cấp của đơn vị", 'error', 'OK')
        return
      }
      if (pressAddress == '') {
        CallCustomAlert.showAlertWith("Chưa điền địa chỉ của đơn vị", 'error', 'OK')
        return
      }
      if (pressDesciption == '') {
        CallCustomAlert.showAlertWith("Chưa điền mô tả của đơn vị", 'error', 'OK')
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
    if (tokenString != '') {
      setShowLoading(true)
      instituteRepo.getProvince(tokenString)
        .then(
          responseInstitute => {
            setInstitute(responseInstitute)
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
    }
  }, [tokenString])


  
  const [tempArray, setTempArray] = useState([])

  //////////////////// DROPDOWN LIST CHANGE ITEM /////////////////
  // KHI CHỌN MỘT ĐƠN VỊ TRONG DANH SÁCH
  const childChooseProvinceData = []
  const onChangeProvince = (selectedItems) => {
    //console.warn(selectedItems[0])  
    debugger
    childChooseProvinceData.length = 0;
    setSelectedInstituteID(parseInt(selectedItems[0]))  
    setTempArray(childProvinceData) 
  }; 

  tempArray.length > 0 && tempArray.forEach(element => { 
    if(element.parentId == selectedInstituteID){
          childChooseProvinceData.push(element)
        } 
  })

  const onChangeChildProvince = (selectedItems) => { 
    setSelectedChildProvinceID(parseInt(selectedItems[0]))  
  };
 
  //////////////////// XỮ LÝ DỮ LIỆU TỪ API VÀO CÁC ARRAY /////////////
  const provinceData = []
  const childProvinceData = []

  if (institute.length > 0) {
    institute.forEach(element => { 
      element.children && element.children.forEach(childElement1 => {
        provinceData.push({
          "item": childElement1.name,
          "label": childElement1.name,
          "value": childElement1.id,
          "id": childElement1.id,
          'name': childElement1.name,
          'parentId': childElement1.parentId,
          'hierarchyLevel': childElement1.hierarchyLevel
        })
        childElement1.children && childElement1.children.forEach(childElement2 => {
          childProvinceData.push({
            "item": childElement2.name,
            "label": childElement2.name,
            "value": childElement2.id,
            "id": childElement2.id,
            'name': childElement2.name,
            'parentId': childElement2.parentId,
            'hierarchyLevel': childElement2.hierarchyLevel
          })
        })
      })
    })
  } 

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
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={false}
        nestedScrollEnabled={true}
        contentContainerStyle={styles.scrollViewContainer}>
        <View style={[styles.viewContainDropdown, {}]}>
          <Text style={styles.titleSmallHeader}>
            Tên đơn vị báo chí
          </Text>
          <TextInput
            style={[styles.input]}
            onChangeText={(value) => setPressName(value)}
            value={pressName}
            multiline={true}
            placeholder="Nhập tên đơn vị báo chí"
            placeholderTextColor={'#20202088'}
          />

          {/* // danh sách các phóng viên tham gia vào session sẽ liệt kê ra ở đây, dùng flat list */}

          <View style={{
            width: '100%',
            backgroundColor: COLORS.white,
            borderWidth: 1,
            borderRadius: SIZES.radius,
            borderColor: COLORS.gray,
            marginBottom: 10
          }}>
            <SectionedMultiSelect
              items={provinceData}
              IconRenderer={Icon1}
              uniqueKey="id"
              multiline={true}
              displayKey="name"
              selectText="Chọn cấp thành phố/ huyện/ thị xã"
              single={true}
              hideSearch={false}
              onSelectedItemsChange={onChangeProvince}
              selectedItems={[selectedInstituteID]}
              selectedText="Đã chọn"
              searchPlaceholderText="Tìm kiếm"
              confirmText="Xác nhận chọn"
              selectLabelNumberOfLines={2}
              showCancelButton={true}
              modalWithTouchable={true}
              styles={{
                cancelButton: {
                  backgroundColor: colors.cancel, 
                },
                button: {
                  backgroundColor: '#3479C8',// màu confirm button
                  padding: 10,
                },
              }}
              filterItems={(filter, items) => {
                return items.filter((item) =>
                  item.name.toLowerCase().includes(filter.toLowerCase())
                );
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
            /> 
          </View>

          <View style={{
            width: '100%',
            backgroundColor: COLORS.white,
            borderWidth: 1,
            borderRadius: SIZES.radius,
            borderColor: COLORS.gray,
            marginBottom: 10
          }}>
            <SectionedMultiSelect
              items={childChooseProvinceData}
              IconRenderer={Icon1}
              uniqueKey="id"
              multiline={true}
              disabled={selectedInstituteID == 0}
              displayKey="name"
              selectText="Chọn cấp phường/ xã/ thị trấn"
              single={true}
              hideSearch={false}
              onSelectedItemsChange={onChangeChildProvince}
              selectedItems={[selectedChildProvinceID]}
              selectedText="Đã chọn"
              searchPlaceholderText="Tìm kiếm"
              confirmText="Xác nhận chọn"
              selectLabelNumberOfLines={2}
              showCancelButton={true}
              modalWithTouchable={true}
              styles={{
                cancelButton: {
                  backgroundColor: colors.cancel, 
                },
                button: {
                  backgroundColor: '#3479C8',// màu confirm button
                  padding: 10,
                },
              }}
              filterItems={(filter, items) => {
                return items.filter((item) =>
                  item.name.toLowerCase().includes(filter.toLowerCase())
                );
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
            />

          </View>
          <Text style={styles.titleSmallHeader}>
            Địa chỉ*
          </Text>
          <TextInput
            style={[styles.input]}
            onChangeText={(value) => setPressAddress(value)}
            value={pressAddress}
            multiline={true}
            placeholder="Nhập địa chỉ*"
            placeholderTextColor={'#20202088'}
          />

          <Text style={styles.titleSmallHeader}>
            Mô tả đơn vị*
          </Text>
          <TextInput
            style={[styles.input, {}]}
            onChangeText={(value) => setPressDesciption(value)}
            value={pressDesciption}
            multiline={true}
            placeholder="Nhập mô tả đơn vị*"
            placeholderTextColor={'#20202088'}
          />
        </View>
      </ScrollView>
      <TouchableOpacity onPress={() => {
                  showAlert({
                      title: "Thông báo",
                      message: "Bạn muốn tạo mới đơn vị báo chí này ?",
                      alertType: 'warning',
                      btnLabel: 'Đồng ý',
                      leftBtnLabel: 'Hủy',
                      onPress: () => {
                          closeAlert()
                          callPostWorkRegistration();
                      }
                  });
              }}
      style={{
        backgroundColor: colors.newprimary,
        borderRadius: 10,
        alignContent: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        margin: 20,
        marginTop: 0,
        flexDirection: 'row'
      }}>
        <Text style={{ fontSize: 20, color: 'white' }}>
          Tạo mới
        </Text>
      </TouchableOpacity>
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
  headerTitle: { 
    color: '#000',
    fontWeight: 'bold', 
    fontSize: 16
  },
  saveAreaViewContainer: {
    flex: 1,
  },
  scrollViewContainer: {
    backgroundColor: COLORS.background
  },
  viewContainDropdown: {
    backgroundColor: COLORS.background,
    padding: 20
  },
  input: {
    height: 'auto',
    width: '100%',
    maxHeight:200,
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
export default AddInstitute