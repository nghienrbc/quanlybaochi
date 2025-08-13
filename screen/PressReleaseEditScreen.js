import 'react-native-get-random-values';
import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList, 
  Platform,
  StatusBar, 
  StyleSheet, 
  PermissionsAndroid
} from 'react-native'
import DocumentPicker, {
  DirectoryPickerResponse,
  DocumentPickerResponse,
  isInProgress,
  types,
} from 'react-native-document-picker'
import { screenWidth, screenHeight } from '../utilies/Device'

import RenderHtml from 'react-native-render-html';

import { images, colors, COLORS, FONTS, string } from "../constants";
import Icon from 'react-native-vector-icons/FontAwesome'

import { annoucement as annoucementRepo, institute as instituteRepo } from "../repositories"
import { getMyStringValue } from "../utilies/LocalDataHandler"
import { showAlert, closeAlert } from "react-native-customisable-alert";

import ImagePicker from 'react-native-image-crop-picker';
import RNFetchBlob from "rn-fetch-blob";

import ChoosePhotoPopup from "../Component/ChoosePhotoPopup";

import { CallCustomAlert } from "../utilies";
import AppLoader from '../utilies/AppLoader';
import PressAgencyItem from "./item/PressAgencyItem";

import CustomScrollView from '../Component/CustomScrollView';
function PressReleaseEditScreen(props) {
  //navigation
  const { navigation, route } = props
  //functions of navigate to/back
  const { navigate, goBack } = navigation
  const [showLoading, setShowLoading] = useState(false)

  const [annoucementID, setAnnoucementID] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [response, setResponse] = useState(null)
  // const [date, setDate] = useState(new Date())
  // const [open, setOpen] = useState(false)
  // const [dateString, setDateString] = useState('')
  // const [timeString, setTimeString] = useState('')
  const [pressInstitute, setPressInstitute] = useState([])
  // const [selectedInstituteID, setSelectedInstituteID] = useState(0)
  // const [timeStamp, setTimeStamp] = useState('')
  // const [isChangeDate, setIsChangeDate] = useState(false)

  // const [selectedInstitute, setSelectedInstitute] = useState(0)

  // const [imageUri, setImageUri] = useState('');
  // const [image, setImage] = useState(images.noAvatar)
  const [imageUrl, setImageUrl] = useState('')

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

  let pressReleaseItem = route.params.pressReleaseItem
  var { annocementObject } = route.params.pressReleaseItem

  var filePath = ''
  var fileName = ''

  //  console.log(annoucementObject) 
  //const { workObject, id, agency, title, time, content, status } = workEditItem
  ///////////////// NAVIGATION OPTION ////////////////////
  useEffect(() => {
    navigation.setOptions(
      {
        headerShown: true,
        headerTitle: 'Chi tiết thông cáo',
        headerTitleStyle: { fontSize: 20, fontWeight: 'bold' },
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: colors.newprimary
        },
        headerTintColor: 'white'
      })
    debugger
    setAnnoucementID(annocementObject.id)
    setTitle(annocementObject.title)
    setContent(annocementObject.content)
    annocementObject.thumbnail && setImageUrl(`${string.IMAGEURL}${annocementObject.thumbnail[0].file_path}/${annocementObject.thumbnail[0].file_name}`)
    setReleaseFileName(annocementObject.documents != null ? annocementObject.documents : [])
    setPressAgencySelects(annocementObject.sendto);
    if (annocementObject.sendto.length > 0 && annocementObject.sendto[0].publics == true) {
      setIsSelected(true)
    }
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
  const callUpdateAnnoucement = () => {
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
      if (releaseFileUri.length > 5) {
        CallCustomAlert.showAlertWith("Chỉ có thể gởi lại tối đa là 5 files", 'error', 'OK')
      }
      debugger

      setShowLoading(true)
      annoucementRepo.postUpdateAnnoucement(tokenString, annoucementID, isSelected, selectedItems, title, content,
        isChangeImage ? imageUrl : null, isChangeReleaseFile ? releaseFileUri : null)
        .then(
          responseWork => {
            setResponse(responseWork)
            setShowLoading(false)
            showAlert({
              title: 'Thông báo',
              message: "Đã cập nhật thông cáo báo chí",
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
  pressAgencySelects.length > 0 && annocementObject.sendto[0].publics != true && pressAgencySelects.forEach(element => {
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

  //////////////////// XỮ LÝ DOWNLOAD FILE ///////////////////// 
  // Function to check the platform
  // If Platform is Android then check for permissions.
  const checkPermission = async () => {
    debugger
    if (Platform.OS === 'ios') {
      downloadFile(filePath, fileName);
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message:
              'Application needs access to your storage to download File',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          // Start downloading
          downloadFile(filePath, fileName);
          console.log('Storage Permission Granted.');
        } else {
          // If permission denied then show alert
          Alert.alert('Error', 'Storage Permission Not Granted');
        }
      } catch (err) {
        // To handle permission related exception
        console.log("++++" + err);
      }
    }
  };
  const downloadFile = (filePath, fileName) => {
    // Get today's date to add the time suffix in filename
    debugger
    let date = new Date();
    // File URL which we want to download
    //let FILE_URL = string.FILEURL + invitationObject.documents[0].path + "/" + invitationObject.documents[0].file;
    let FILE_URL = string.FILEURL + filePath + "/" + fileName;
    // Function to get extention of the file url
    let file_ext = getFileExtention(FILE_URL);
    file_ext = '.' + file_ext[0];
    // config: To get response by passing the downloading related options
    // fs: Root directory path to download
    const { config, fs } = RNFetchBlob;
    let RootDir = fs.dirs.PictureDir;
    let options = {
      fileCache: true,
      addAndroidDownloads: {
        path:
          RootDir +
          '/file_' +
          Math.floor(date.getTime() + date.getSeconds() / 2) +
          file_ext,
        description: 'downloading file...',
        notification: true,
        // useDownloadManager works with Android only
        useDownloadManager: true,
      },
    };
    config(options)
      .fetch('GET', FILE_URL)
      .then(res => {
        // Alert after successful downloading
        console.log('res -> ', JSON.stringify(res));
        alert('File Downloaded Successfully.');
      });
  };
  const getFileExtention = fileUrl => {
    // To get the file extension
    return /[.]/.exec(fileUrl) ?
      /[^.]+$/.exec(fileUrl) : undefined;
  };
  /////////////// XỮ LÝ UPLOAD FILE ////////////////////////////
  const [releaseFileName, setReleaseFileName] = useState([])
  const [isChangeReleaseFile, setIsChangeReleaseFile] = useState(false)


  //////////////// CHOOSE INVITE FILE FROM DEVICE ////////////////////
  const [releaseFileUri, setReleaseFileUri] = useState([])
  const [releaseFileResult, setReleaseFileResult] = useState([])

  useEffect(() => {
    if (releaseFileResult == null) return;
    const newFileUris = releaseFileResult.map((result) => result.fileCopyUri);
    setReleaseFileUri((prevUri) => prevUri.concat(newFileUris.filter((item) => {
      let result = true
      prevUri.filter((prevUriItem) => { if (prevUriItem.split('/').pop() == item.split('/').pop()) result = false; })
      return result
    })))
  }, [releaseFileResult]);

  // const handleError = (err) => {
  //   if (DocumentPicker.isCancel(err)) {
  //     console.warn('cancelled')
  //     // User cancelled the picker, exit any dialogs or menus and move on
  //   } else if (isInProgress(err)) {
  //     console.warn('multiple pickers were opened, only the last will be considered')
  //   } else {
  //     throw err
  //   }
  // }

  // const deleteFile = (fileUri) => {
  //   setReleaseFileUri((prevFiles) => prevFiles.filter((uri) => uri !== fileUri));
  // };

  const source = {
    html: `
  <p style='text-align:center;'>
    Hello World!
  </p>`
  };

  return (
    <SafeAreaView style={styles.saveAreaViewContainer}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      <ChoosePhotoPopup
        ref={(target) => popupRef = target}
        title="CHỌN ẢNH NỀN"
        onTouchOutside={onClosePopupWhenTouchOutside}
        onTouchCameraButton={onClosePopupOpenCamera}
        onTouchLibraryButton={onClosePopupOpenLibrary}
      />
      {showLoading ? <AppLoader /> : null}
      {/* <WebView
            // originWhitelist={['*']}
            // scalesPageToFit={false}
            style={{backgroundColor:'red', flex:1}}
            source={{
              html: ` <body> <h1>My First Heading</h1> <p>My first paragraph.</p> </body>`,
            }}
          /> */}
      <ScrollView
        overScrollMode="never"
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={false}
        contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.viewContainDropdown}>
          {/* renderToHardwareTextureAndroid={true} */}
          {/* {!isJournalist ? <View style={{ flexDirection: 'row', alignContent: 'center', alignItems: 'center' }}>
            <Text style={styles.titleSmallHeader}>
              Gửi thông cáo đến tất cả cơ quan báo chí:
            </Text>
            <CheckBox
              value={isSelected}
              onValueChange={setIsSelected}
              style={{ alignSelf: 'center' }}
            />
          </View> : null}
          {isSelected == false && !isJournalist ? <View style={{
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
              //showDropDowns={true}
              //readOnlyHeadings={true}
              //single={true}
              hideSearch={false}
              onSelectedItemsChange={onSelectedItemsChange}
              selectedItems={selectedItems}
              selectedText="Đã chọn"
              searchPlaceholderText="Tìm kiếm"
              confirmText="Xác nhận chọn"
              selectLabelNumberOfLines={2}
              showCancelButton={true}
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
          </View> : null} */}

          {isJournalist ? <Text style={styles.titleSmallHeader}>
            {"Đơn vị gửi thông cáo"}
          </Text> : null}
          {!isJournalist && pressAgencySelectedData.length > 0 ? <Text style={styles.titleSmallHeader}>
            {'Đơn vị đã được gửi thông cáo'}
          </Text> : null}

          {/* // nếu là phóng viên thì hiển thị tên đơn vị gửi thông cáo */}
          {isJournalist ? <Text style={[styles.contentInfo, { marginLeft: 15, marginBottom: 10 }]}>
            {annocementObject.sender?.Institute?.name}
          </Text> : null}

          {/* // hiển thị danh sách cơ quan báo chí được gửi thông cáo ở đây */}
          {!isJournalist && pressAgencySelectedData.length > 0 ?
            <View style={{ borderRadius: 15 }}>
              <ScrollView
                alwaysBounceHorizontal={false}
                horizontal={true}
                contentContainerStyle={{
                  width: '100%',
                  height: "auto", padding: 0, maxHeight: 200, marginVertical: 10,
                  borderRadius: 15
                }}>
                <FlatList style={{}}
                  nestedScrollEnabled={true}
                  ref={flatListRef}
                  data={pressAgencySelectedData}
                  renderItem={({ item }) => <PressAgencyItem
                    onPress={() => {
                    }}
                    pressAgencyItem={item} key={item.id} />}
                  keyExtractor={eachRegister => eachRegister.id}
                />
              </ScrollView>
            </View>
            : null}

          <Text style={styles.titleSmallHeader}>
            Tiêu đề thông cáo
          </Text>
          <CustomScrollView
            style={[styles.input,{maxHeight:200,}]}
            value={title}
            placeholder="Nhập tiêu đề"
            // editable={!isJournalist ? true : false}
            editable ={false}
            onChangeText={(value) => setTitle(value)}
          />
          <Text style={styles.titleSmallHeader}>
            Nội dung thông cáo
          </Text>
          {/* <CustomScrollView
            style={[styles.input,{maxHeight:300}]}
            value={content}
            placeholder="Nhập nội dung"
            editable={!isJournalist ? true : false}
            onChangeText={(value) => setContent(value)}
          />  */}
          {/* <View style={{backgroundColor: 'white', borderRadius: 10, marginTop: 10 , padding: 10}} >  */}
          <ScrollView 
            horizontal={true}
            alwaysBounceHorizontal={false}
            contentContainerStyle={{
              width: '100%',
              height: "auto",
              maxHeight: 300,
              borderRadius: 15,
              paddingVertical: 5,
              paddingHorizontal:10,
              backgroundColor:'white',
            }}
          >
            <ScrollView
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              contentContainerStyle={{
                width: '100%',
                height: "auto",
              }}
            >
              <RenderHtml
                contentWidth={screenWidth - 50}
                style ={{}}
                source={{
                  html:content}}
              /> 
            </ScrollView>
          </ScrollView>
          {/* </View> */}

          {/* ////////////////////// hiển thị ảnh thum nail hoặc chọn ảnh thum nail ////////// */}
          {/* {imageUrl ? <Text style={styles.titleSmallHeader}>
            {!isJournalist ? 'Ảnh nền thông cáo' : 'Hình ảnh'}
          </Text> : null} */}
          <Text style={[styles.titleSmallHeader, { marginTop: 10 }]}>
            Hình ảnh
          </Text>
          <View style={{ alignSelf: 'center', borderRadius: 10, marginVertical: 10 }} >
            {imageUrl ? <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ImageBackground
                source={{ uri: imageUrl }}
                style={{
                  width: '100%',
                  aspectRatio: 1 / 0.75,
                  height: undefined,
                  resizeMode: 'stretch',
                  alignSelf: 'center',
                }}
                imageStyle={{ borderRadius: 10 }}>
              </ImageBackground>
            </View> : null}
          </View>
          {/* {!isJournalist ? <View style={{
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
            </View> */}

          {/* <View style={{ justifyContent: 'center' }}>
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
                <Text style={{ fontSize: 13, color: 'white' }}>
                  Chọn Ảnh
                </Text>
              </TouchableOpacity>
            </View> */}
          {/* </View> : null} */}
          {/* <Text style={styles.titleSmallHeader}>
            Tiêu đề thông cáo
          </Text>
          <CustomScrollView
            style={[styles.input]}
            value={title}
            placeholder="Nhập tiêu đề" 
            editable={false}
            onChangeText={(value) => setTitle(value)}
          />
          <Text style={styles.titleSmallHeader}>
            Nội dung thông cáo
          </Text> 
          <ScrollView
            horizontal={true}
            alwaysBounceHorizontal={false}
            contentContainerStyle={{
              width: '100%',
              height: "auto",
              maxHeight: 300,
              borderRadius: 15,
              paddingVertical: 5,
              paddingHorizontal: 10,
              backgroundColor: 'white',
              marginVertical: 10
            }}
          >
            <ScrollView
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              contentContainerStyle={{
                width: '100%',
                height: "auto",
              }}
            >
              <RenderHtml
                contentWidth={screenWidth - 50}
                source={{
                  html: content
                }}
              />
            </ScrollView>
          </ScrollView>  */}


          {/* ////////////////////// hiển thị file hoặc chọn  ////////// */}
          {releaseFileName.length > 0 ? <Text style={styles.titleInfo}>
            File đính kèm:
          </Text> : null}
          {/* // nếu tk là phóng viên hoặc buổi làm việc đã hoàn thành hoặc hủy thì hiển thị lên text và nút download*/}

          {/* {isJournalist ? */}
          {releaseFileName.length > 0 ? <View style={{
            flexDirection: 'row', borderRadius: 10, backgroundColor: 'white', borderColor: COLORS.gray, borderWidth: 1,
            padding: 10, marginBottom: 10, marginTop: 5
          }}>
            <ScrollView
              horizontal={true}
              alwaysBounceHorizontal={false}
              contentContainerStyle={{
                width: '100%',
                height: "auto", padding: 10, paddingTop: 16, maxHeight: 300, borderRadius: 15,
              }}>
              <FlatList
                data={releaseFileName}
                keyExtractor={(fileUri) => fileUri.file_origin}
                renderItem={({ item: fileUri }) => (
                  <View style={{
                    flexDirection: 'row', justifyContent: 'space-between', padding: 8, margin: 4, marginTop: 5,
                    borderRadius: 8, backgroundColor: COLORS.white, ...styles.shadow,
                  }}>
                    <Text style={{ fontSize: 15, color: '#000', width: '90%' }}>
                      {fileUri.file_origin}
                    </Text>
                    <TouchableOpacity onPress={() => {
                      debugger
                      filePath = fileUri.file_path
                      fileName = fileUri.file_name
                      checkPermission()
                    }}>
                      <Icon name='download' size={20} color={colors.newprimary} />
                    </TouchableOpacity>
                  </View>
                )}
              />
            </ScrollView>
          </View> : null}
          {/* : null} */}
          {/* // nếu là user CQNN thì hiển thị tên file(nếu có) và nút chọn file */}
          {/* {(!isJournalist) ?
            <View style={{
              flexDirection: 'row', borderRadius: 10, backgroundColor: 'white', borderColor: COLORS.gray, borderWidth: 1,
              padding: 10, marginBottom: 10, marginTop: 5
            }}>
              <View style={{ flex: 1 }}>
                <ScrollView
                  horizontal={true}
                  alwaysBounceHorizontal={false}
                  contentContainerStyle={{
                    width: '100%',
                    height: "auto", padding: 10, paddingTop: 16, maxHeight: 300, borderRadius: 15,
                  }}>
                  {!isChangeReleaseFile ?
                    <FlatList
                      data={releaseFileName}
                      keyExtractor={(fileUri) => fileUri.file_origin}
                      renderItem={({ item: fileUri }) => (
                        <View style={{
                          flexDirection: 'row', justifyContent: 'space-between', padding: 8, margin: 4, marginTop: 5,
                          borderRadius: 8, backgroundColor: COLORS.white, ...styles.shadow,
                        }}>
                          <Text style={{ fontSize: 15, color: '#000', width: '90%' }}>
                            {fileUri.file_origin}
                          </Text>
                          <TouchableOpacity onPress={() => {
                            debugger
                            filePath = fileUri.file_path
                            fileName = fileUri.file_name
                            checkPermission()
                          }}>
                            <Icon name='download' size={20} color={colors.newprimary} />
                          </TouchableOpacity>
                        </View>
                      )}
                    />
                    :
                    <FlatList
                      data={releaseFileUri}
                      keyExtractor={(fileUri) => fileUri}
                      renderItem={({ item: fileUri }) => (
                        <View style={{
                          flexDirection: 'row', justifyContent: 'space-between', padding: 8, margin: 4, marginTop: 5,
                          borderRadius: 8, backgroundColor: COLORS.white, ...styles.shadow,
                        }}>
                          <Text style={{ fontSize: 15, color: '#000', width: '90%' }}>
                            {fileUri.split('/').pop()}
                          </Text>
                          <TouchableOpacity onPress={() => deleteFile(fileUri)}>
                            <Icon name='close' size={20} color={colors.newprimary} />
                          </TouchableOpacity>
                        </View>
                      )}
                    />
                  }
                </ScrollView>
              </View>
            </View> : null} */}
        </View>
        {/* {!isJournalist ?
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
            onPress={() => callUpdateAnnoucement()}
          >
            <Text style={{ fontSize: 20, color: 'white' }}>
              Cập nhật thông cáo
            </Text>
          </TouchableOpacity > : null} */}
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
  contentInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#757575',
    flex: 1
  },
  titleInfo: {
    ...FONTS.h3,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: 20,
    textAlignVertical: 'center',
    marginBottom: 3,
    paddingBottom: 3,
  },
  header: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F6F6',
  },
  headerTitle: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  saveAreaViewContainer: { flex: 1, backgroundColor: COLORS.background },
  viewContainer: { flex: 1, backgroundColor: '#FFF' },
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
    borderColor: COLORS.gray,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    fontSize: 16,
    marginVertical: 10,
    // textAlignVertical: 'top',
    color: 'black',
    backgroundColor: 'white'
  },
});
export default PressReleaseEditScreen