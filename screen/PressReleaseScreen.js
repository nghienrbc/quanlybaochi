import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Image,
  ImageBackground,
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

import { actions, RichEditor, RichToolbar } from "react-native-pell-rich-editor";
import { images, colors, COLORS, FONTS, SIZES, string } from "../constants";
import Icon1 from 'react-native-vector-icons/MaterialIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import CheckBox from '@react-native-community/checkbox';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';

import { annoucement as annoucementRepo, institute as instituteRepo } from "../repositories"
import { getMyStringValue } from "../utilies/LocalDataHandler"
import { showAlert, closeAlert } from "react-native-customisable-alert";

import ImagePicker from 'react-native-image-crop-picker';

import ChoosePhotoPopup from "../Component/ChoosePhotoPopup";

import { CallCustomAlert } from "../utilies";
import AppLoader from '../utilies/AppLoader';
import PressAgencyItem from "./item/PressAgencyItem";


function PressReleaseScreen(props) {
  //navigation
  const { navigation, route } = props
  //functions of navigate to/back
  const { navigate, goBack } = navigation
  const [showLoading, setShowLoading] = useState(false)

  const [selected, setSelected] = useState("");
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [response, setResponse] = useState(null)
  // const [date, setDate] = useState(new Date())
  // const [open, setOpen] = useState(false)
  // const [dateString, setDateString] = useState('')
  // const [timeString, setTimeString] = useState('')
  const [pressInstitute, setPressInstitute] = useState([])
  const [selectedInstituteID, setSelectedInstituteID] = useState(0)
  const [timeStamp, setTimeStamp] = useState('')
  const [isChangeDate, setIsChangeDate] = useState(false)

  const [selectedInstitute, setSelectedInstitute] = useState(0)

  const [fileUri, setFileUri] = useState([]);
  const [imageUri, setImageUri] = useState('');
  const [image, setImage] = useState(images.noAvatar)
  const [imageUrl, setImageUrl] = useState('')
  const [requestFileName, setRequestFileName] = useState('');
  const [isChangeImage, setIsChangeImage] = useState(false)

  const [isJournalist, setIsJournalist] = useState(false)
  const [pressAgencySelects, setPressAgencySelects] = useState([])
  const [isSelected, setIsSelected] = useState(false);

  const flatListRef = React.useRef()

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
    setIsJournalist(data == 7)
  })
  getMyStringValue("userID").then((value) => {
    const data = value;
    setUserID(data)
  })
  ////////////////// GET VALUE FROM NAVIGATION ////////////

  const isCreateNew = route.params.isCreateNew
  let pressReleaseItem = route.params.pressReleaseItem
  //if(isCreateNew == false) {
  var { annocementObject } = route.params.pressReleaseItem
  //}   
  //  console.log(annoucementObject) 
  //const { workObject, id, agency, title, time, content, status } = workEditItem
  ///////////////// NAVIGATION OPTION ////////////////////
  useEffect(() => {
    navigation.setOptions(
      {
        headerShown: true,
        headerTitle: isCreateNew ? 'Tạo thông cáo báo chí' : 'Chi tiết thông cáo',
        headerTitleStyle: { fontSize: 20, fontWeight: 'bold' },
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: colors.newprimary
        },
        headerTintColor: 'white'
      })
    setIsSelected(true)

  }, [])

  ////////////////////// BOTTOM POPUP /////////////////////
  let popupRef = React.createRef()
  const onShowPopup = () => {
    debugger
    popupRef.showPopup()
  }
  const onClosePopupWhenTouchOutside = () => {
    popupRef.closePopup()
  }
  const onClosePopupOpenCamera = () => {
    // choose Photo From camera
    takePhotoFromCamera()
    popupRef.closePopup()
  }
  const onClosePopupOpenLibrary = () => {
    //console.warn(popupRef.state.reasonString)
    choosePhotoFromLibrary()
    popupRef.closePopup()
  }

  ///////////////////// get picture from device ////////////////
  const takePhotoFromCamera = () => {
    ImagePicker.openCamera({
      compressImageMaxWidth: 300,
      compressImageMaxHeight: 300,
      cropping: true,
      compressImageQuality: 0.7
    }).then(image => {
      console.log(image.path);
      setImageUrl(image.path);
      setIsChangeImage(true)
    });
  }

  const choosePhotoFromLibrary = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      compressImageQuality: 0.7
    }).then(image => {
      console.log(image.path);
      debugger
      setImageUrl(image.path);
      setIsChangeImage(true)
    });
  }
  //////////////////////// call api /////////////////////////////
  const callPostAnnoucement = () => {
    if (tokenString != '') {
      if (selectedItems.length == 0 && isSelected == false) {
        // chuwa chojn teen down vi
        CallCustomAlert.showAlertWith("Chưa chọn đơn vị gửi thông cáo", 'error', 'OK')
        return
      }
      if (title == '' || content == '') {
        // de nghi nhap ten tieu de// de nghi nhap ten tieu de
        CallCustomAlert.showAlertWith("Chưa nhập tiêu đề hoặc nội dung thông cáo", 'error', 'OK')
        return
      }
      if (title.length <= 20) {
        CallCustomAlert.showAlertWith("Tiêu đề thông cáo phải dài hơn 20 ký tự", 'error', 'OK')
        return
      }
      if (content.length <= 30) {
        CallCustomAlert.showAlertWith("Nội dung thông cáo phải dài hơn 30 ký tự", 'error', 'OK')
        return
      }
      if (files.length > 5) {
        CallCustomAlert.showAlertWith("Chỉ có thể gởi lại tối đa là 5 files", 'error', 'OK')
      }
      debugger

      setShowLoading(true)
      annoucementRepo.postAnnoucement(tokenString, isSelected, selectedItems, title, richText, imageUrl, files)
        .then(
          responseWork => {
            debugger
            setResponse(responseWork)
            setShowLoading(false)
            showAlert({
              title: 'Thông báo',
              message: "Đã hoàn thành gửi thông cáo báo chí",
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
            setShowLoading(false)
            if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
          }
        )
    }
  }


  useEffect(() => {
    if (tokenString != '') {
      setShowLoading(true)
      instituteRepo.getAllPressInstitute(tokenString)
        .then(
          responseInstitute => {
            setPressInstitute(responseInstitute)
            setShowLoading(false)
          }
        )
        .catch(
          errorMessage => {
            setShowLoading(false)
            if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
          }
        )
    }
  }, [tokenString])

  const pressInstituteData = []
  if (pressInstitute.length > 0) {
    pressInstitute.forEach(element => {
      pressInstituteData.push({
        "item": element.name,
        "label": element.name,
        "value": element.id,
        "id": element.id,
        'name': element.name,
        'hierarchyLevel': element.hierarchyLevel,
        'address': element.address,
        'avatar': element.avatar
      })
    })
  }

  /////////////////// xữ lý danh sách register để hiển thị lên flatlist //////////////////
  let pressAgencySelectedData = []
  isSelected == false && pressAgencySelects.length > 0 && pressAgencySelects.forEach(element => {
    //debugger
    let pressAgencyObj = {
      "id": element.id || 0,
      "name": element.institute != null ? element.institute.name : "",
      "avatar": element.institute != null ? element.institute.avatar ? (string.IMAGEURL + element.institute.avatar) : ('https://img.icons8.com/color/344/circled-user-male-skin-type-5.png') : "",
      "address": element.institute != null ? element.institute.address : "",
    }
    pressAgencySelectedData.push(pressAgencyObj)
  })


  // drop down tree chon phong vien
  const [selectedItems, setSelectedItems] = useState([])
  const onSelectedItemsChange = (selectedItems) => {
    setSelectedItems(selectedItems)
  };

  const [files, setFileUris] = useState([]);
  const [results, setResults] = React.useState(null)
  // sử lý gắn và hiện nhiều files
  useEffect(() => {
    if (results == null) return
    const newFileUris = results.map((result) => result.fileCopyUri);
    setFileUris((prevUri) => prevUri.concat(newFileUris.filter((item) => {
      let result = true
      prevUri.filter((prevUriItem) => { if (prevUriItem.split('/').pop() == item.split('/').pop()) result = false; })
      return result
    })))
  }, [results])

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

  //Xóa từng file 
  const deleteFile = (fileUri) => {
    setFileUris((prevFiles) => prevFiles.filter((uri) => uri !== fileUri));
  };

  const handleHead = ({ tintColor }) => <Text style={{ color: tintColor }}>H1</Text>
  const richText = React.useRef();

  return (
    <SafeAreaView style={styles.saveAreaViewContainer}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      <ChoosePhotoPopup
        ref={(target) => popupRef = target}
        title="TẢI ẢNH LÊN"
        onTouchOutside={onClosePopupWhenTouchOutside}
        onTouchCameraButton={onClosePopupOpenCamera}
        onTouchLibraryButton={onClosePopupOpenLibrary}
      />
      {showLoading ? <AppLoader /> : null}
      <ScrollView
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={false}
        contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.viewContainDropdown}>
          <View style={{ flexDirection: 'row', alignContent: 'center', alignItems: 'center' }}>
            <Text style={styles.titleSmallHeader}>
              Gửi thông cáo đến tất cả cơ quan báo chí:
            </Text>
            <CheckBox
              value={isSelected}
              onValueChange={setIsSelected}
              style={{ alignSelf: 'center' }}
            />
          </View>

          {isSelected == false ? <View style={{
            width: '100%',
            backgroundColor: COLORS.white,
            borderWidth: 1, paddingBottom: 5,
            borderRadius: SIZES.radius, borderColor: COLORS.gray,
            paddingHorizontal: 10, marginVertical: 10
          }}>
            <SectionedMultiSelect
              items={pressInstituteData}
              IconRenderer={Icon1}
              uniqueKey="id"
              subKey="children"
              selectText="Chọn đơn vị nhận thông cáo"
              hideSearch={false}
              onSelectedItemsChange={onSelectedItemsChange}
              selectedItems={selectedItems}
              selectedText="Đã chọn"
              searchPlaceholderText="Tìm kiếm"
              confirmText="Xác nhận chọn"
              selectLabelNumberOfLines={2}
              showCancelButton={true}
              styles={{
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
            />
          </View> : null}

          <Text style={styles.titleSmallHeader}>
            Tiêu đề thông cáo
          </Text>

          <TextInput
            style={[styles.input, { maxHeight:200 }]}
            onChangeText={(value) => setTitle(value)}
            value={title}
            multiline={true}
            placeholder="Nhập tiêu đề"
            placeholderTextColor={'#20202088'}
            editable={true}
          />
          <Text style={styles.titleSmallHeader}>
            Nội dung thông cáo
          </Text>
          <TextInput
            style={[styles.input, { maxHeight:300 }]}
            onChangeText={(value) => setContent(value)}
            value={content}
            multiline={true}
            placeholder="Nhập nội dung"
            underlineColorAndroid='transparent'
            placeholderTextColor={'#20202088'}
            editable={true}
          />

          <RichEditor
            ref={richText}
            onChange={descriptionText => {
              console.log("descriptionText:", descriptionText);
            }}
          />
          <RichToolbar
            editor={richText} 
            initialContentHTML={'Hello <b>World</b> <p>this is a new paragraph</p> <p>this is another new paragraph</p>'}
  
            actions={[actions.setBold, actions.setItalic, actions.setUnderline, actions.heading1, actions.insertImage,actions.insertBulletsList, actions.fontSize]}
            iconMap={{ [actions.heading1]: handleHead }}
          />

          {/* ////////////////////// hiển thị ảnh thum nail hoặc chọn ảnh thum nail ////////// */}
          {imageUrl ? <Text style={styles.titleSmallHeader}>
            {'Ảnh nền thông cáo'}
          </Text> : null}
          <View style={{
            flexDirection: 'row', borderRadius: 10,
            borderWidth: 1, padding: 10,
            marginBottom: 10, marginTop: 5,
            backgroundColor: 'white', borderColor: COLORS.gray
          }}>
            <View style={{ flex: 1 }}>
              {imageUrl ? <View
                style={{
                  height: 80,
                  width: 80,
                  borderRadius: 2,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <ImageBackground
                  source={{ uri: imageUrl }}
                  style={{ height: 80, width: 80 }}
                  imageStyle={{ borderRadius: 2 }}>
                </ImageBackground>
              </View> : null}
            </View>

            <View style={{ justifyContent: 'center' }}>
              <TouchableOpacity style={{
                backgroundColor: '#0373F3',
                borderRadius: 10,
                alignContent: 'center',
                justifyContent: 'center',
                paddingVertical: 10,
                paddingHorizontal: 10,
                flexDirection: 'row'
              }}
                onPress={onShowPopup}>
                <Image source={require("../assets/icons/addImage_icon.png")}
                  style={{
                    width: 20,
                    height: 20,
                    tintColor: 'white',
                    marginRight: 5
                  }}
                />
                {/* <FontAwesome name='file-text' style={{ color: 'white', fontSize:20 , marginRight: 10}} />  */}
                <Text style={{ fontSize: 13, color: 'white' }}>
                  Chọn Ảnh
                </Text>
              </TouchableOpacity >
            </View>
          </View>
          {/* ////////////////////// hiển thị file hoặc chọn  ////////// */}
          <View style={{ flexDirection: 'row', alignContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <Text style={styles.titleSmallHeader}>
              File đính kèm:
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
                    debugger
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
          onPress={() => callPostAnnoucement()}
        >
          <Text style={{ fontSize: 20, color: 'white' }}>
            Gửi thông cáo
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
  saveAreaViewContainer: { flex: 1, backgroundColor: COLORS.background },
  scrollViewContainer: {
    backgroundColor: COLORS.background
  },
  titleSmallHeader: {
    ...FONTS.h3,
    fontWeight: 'bold',
    // marginHorizontal: 20,
    color: 'black'
  },
  viewContainDropdown: {
    flex: 1,
    //justifyContent: 'center',
    backgroundColor: COLORS.background,
    padding: 20
  },
  input: {
    height: 'auto',
    width: '100%',
    maxHeight: 300,
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
export default PressReleaseScreen