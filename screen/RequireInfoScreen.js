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

import {COLORS, FONTS, SIZES, colors} from '../constants'

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/MaterialIcons'
import Icon1 from 'react-native-vector-icons/FontAwesome'
import DatePicker from 'react-native-date-picker'

import {requireinfo as requireinfoRepo, institute as instituteRepo } from "../repositories"
import { getMyStringValue } from "../utilies/LocalDataHandler"
import { showAlert, closeAlert } from "react-native-customisable-alert";
import DropdownSingleSelect from '../Component/DropdownSingleSelect';

import { CallCustomAlert } from "../utilies";
import AppLoader from '../utilies/AppLoader';
 
function RequireInfoScreen(props) {
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
        headerTitle: 'Đề nghị cung cấp thông tin',
        headerTitleStyle: { fontSize: 20, fontWeight: 'bold' },
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: colors.newprimary
        },
        headerTintColor: 'white'
      })
  }, [])

  //////////////////////// XỮ LÝ CAL API ///////////////////////////////////
  const callPostRequireInfo = () => {
    debugger
    if (tokenString != '') {
      if (selectedInstituteID == 0) {
        CallCustomAlert.showAlertWith("Chưa chọn đơn vị đề nghị cung cấp thông tin", 'error', 'OK')
        return
      }
      if (title == '' || content == '') {
        CallCustomAlert.showAlertWith("Chưa nhập tiêu đề hoặc nội dung", 'error', 'OK')             
        return
      }
      if (files.length > 5) {
        CallCustomAlert.showAlertWith("Chỉ có thể gởi tối đa là 5 files", 'error', 'OK');
        return
      }
      setShowLoading(true)
      requireinfoRepo.postCreateRequireInfo(tokenString, selectedInstituteID, title, content, files)
        .then(
          responseWork => {
            setResponse(responseWork)
            setShowLoading(false)
            showAlert({
              title: 'Thông báo',
              message: "Đăng ký đề nghị cung cấp thông tin thành công",
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
            CallCustomAlert.showAlertWith("Yêu cầu không thành công", errorMessage == 'Not found' ? string.NOT_FOUND : string.CANT_CONNECT_SERVER, "error", "OK")
          }
        )
    }
  }

  /////////////////// USE EFFECT ///////////////////////////
 
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
    //console.warn(value) 
    setSelectedInstituteID(parseInt(selectedItems[0]))  
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
  
  const [files, setFileUris] = useState([]);
  const [results, setResults] = React.useState(null)
  // xử lý gắn và hiện nhiều files
  useEffect(() => {
    if (results == null) return
    const newFileUris = results.map((result) => result.fileCopyUri); 
    setFileUris((prevUri) => prevUri.concat(newFileUris.filter((item) => {
      let result = true
      prevUri.filter((prevUriItem) => {if (prevUriItem.split('/').pop() == item.split('/').pop()) result = false; })     
      return result
    }))) 
  }, [results])

  const handleError = (err) => {
    if (DocumentPicker.isCancel(err)) {
      console.warn('cancelled')
    } else if (isInProgress(err)) {
      console.warn('multiple pickers were opened, only the last will be considered')
    } else {
      throw err
    }
  }

  //Xóa từng file 
  const deleteFile = (fileUri) => {
    setFileUris((prevFiles) => prevFiles.filter((uri) => uri !== fileUri));
  };

  ///////////////////// LAYOUT RENDER ///////////////////////////////////
  return (
    <SafeAreaView style={styles.saveAreaViewContainer}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      {showLoading ? <AppLoader /> : null}
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
        <View style={styles.viewContainDropdown}>
        <View style={{
            width: '100%',
            backgroundColor: COLORS.white,
            borderWidth: 1,
            borderRadius: SIZES.radius,
            borderColor: COLORS.gray,
          }}>
            <DropdownSingleSelect
              items={instituteData}
              IconRenderer={Icon}
              displayKey="name"
              selectText="Chọn đơn vị đề nghị cung cấp thông tin"
              onSelectedItemsChange={onChangeInstitute}
              selectedItems={[selectedInstituteID]}
              filterItems={(filter, items) => {
                return items.filter((item) =>
                  item.name.toLowerCase().includes(filter.toLowerCase())
                );
              }}
            />
          </View>
 
          <View>
            <Text style={[styles.titleSmallHeader, {marginTop:10}]}>
              Tiêu đề đề nghị cung cấp thông tin
            </Text>
            <TextInput
              style={[styles.input, { height: 100 }]}
              onChangeText={(value) => setTitle(value)}
              value={title}
              multiline={true}
              placeholder="Nhập tiêu đề"
              placeholderTextColor={'#20202088'}
            />
          </View>

          <Text style={styles.titleSmallHeader}>
            Nội dung đề nghị cung cấp thông tin
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
           <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.titleSmallHeader}>
              File đính kèm
            </Text>
          </View>
          <View style={{
            flexDirection: 'row',
            borderRadius: SIZES.radius,
            borderColor: COLORS.gray,
            borderWidth: 1,
            padding: 10,
            marginBottom: 10,
            marginTop: 5,
            backgroundColor: 'white'
          }}>
            <View style={{ flex: 1 }}>
              <TouchableOpacity style={{
                flexDirection: 'row',
                backgroundColor: '#0373F3',
                width: 100,
                borderRadius: 10,
                alignSelf: 'flex-end',
                justifyContent: 'center',
                paddingVertical: 10,
                paddingHorizontal: 10,
                marginBottom: 5
              }}
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
                    enableChooseFile && setResults(pickerResults);
                  } catch (e) {
                    handleError(e)
                  }
                }}>
                <FontAwesome name='file-text' style={{ color: 'white', fontSize: 18, marginRight: 5 }} />
                <Text style={{ fontSize: 13, color: 'white' }}>
                  Chọn File
                </Text>
              </TouchableOpacity >
              <ScrollView
                horizontal={true}
                alwaysBounceHorizontal={false}
                contentContainerStyle={{
                  width: '100%',
                  height: "auto", padding: 10, paddingTop: 16, maxHeight: 300, borderRadius: 15,
                }}>
                <FlatList
                  nestedScrollEnabled={true}
                  data={files}
                  keyExtractor={(fileUri) => fileUri}
                  renderItem={({ item: fileUri }) => (
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      padding: 8,
                      margin: 4,
                      marginTop: 5,
                      borderRadius: 8,
                      backgroundColor: COLORS.white,
                      ...styles.shadow,
                    }}>
                      <Text style={{ fontSize: 15, color: '#000', width: '90%', }}>
                        {fileUri.split('/').pop()}
                      </Text>
                      <TouchableOpacity onPress={() => deleteFile(fileUri)}>
                        <Icon1 name='close' size={20} color={colors.newprimary} />
                      </TouchableOpacity>
                    </View>
                  )}
                />
              </ScrollView>
            </View>
          </View>
        </View> 

        <TouchableOpacity onPress={() => {
                  showAlert({
                      title: "Thông báo",
                      message: "Bạn muốn gửi đề nghị cung cấp thông tin này ?",
                      alertType: 'warning',
                      btnLabel: 'Đồng ý',
                      leftBtnLabel: 'Hủy',
                      onPress: () => {
                          closeAlert()
                          callPostRequireInfo();
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
            Gửi đề nghị
          </Text>
        </TouchableOpacity>
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
    backgroundColor:COLORS.background,
    padding: 20
  },
  input: {
    height: 200,
    width: '100%',
    borderColor:COLORS.gray,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    fontSize: 16,
    marginVertical: 10,
    textAlignVertical: 'top',
    color: 'black',
    backgroundColor:'white'
  },
});
export default RequireInfoScreen