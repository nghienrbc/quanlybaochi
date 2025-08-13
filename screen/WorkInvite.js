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

import { COLORS, FONTS, SIZES, string, colors } from '../constants'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker'

import { work as workRepo, journalist as journalistRepo } from "../repositories"
import { convertDateTimeToDateString, convertDateTimeToTimeString } from "../utilies/DateTime"
import { getMyStringValue } from "../utilies/LocalDataHandler"

import { showAlert, closeAlert } from "react-native-customisable-alert";
import Icon1 from 'react-native-vector-icons/FontAwesome'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { CallCustomAlert } from "../utilies";
import AppLoader from '../utilies/AppLoader';
import DropdownMultiSelect from '../Component/DropdownMultiSelect';
function WorkInvite(props) {

  const { navigation, route } = props
  //functions of navigate to/back
  const { navigate, goBack } = navigation
  const [showLoading, setShowLoading] = useState(false)

  const [titleInvite, setTitle] = useState('');
  const [contentInvite, setContent] = useState('');
  const [response, setResponse] = useState(null)
  const [dateInvite, setDateInvite] = useState(new Date())
  const [open, setOpen] = useState(false)
  const [dateString, setDateString] = useState('')
  const [timeString, setTimeString] = useState('')
  const [jounalists, setJounalists] = useState([])

  const [timeStamp, setTimeStamp] = useState('')
  const [isChangeDate, setIsChangeDate] = useState(false)

  const [isJournalist, setIsJournalist] = useState(false)
  const [searchText, setSearchText] = useState('');

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

  const handleSearchTextChange = (text) => {
    setSearchText(text);
  };

  useEffect(() => {
    navigation.setOptions(
      {
        headerShown: true,
        headerTitle: 'Mời làm việc',
        headerTitleStyle: { fontSize: 20, fontWeight: 'bold' },
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: colors.newprimary
        },
        headerTintColor: 'white'
      })
  }, [])

  const showAlertWith = (title, message, alertType, btnLabel) => {
    showAlert({
      title: title,
      message: message,
      alertType: alertType,
      btnLabel: btnLabel,
    })
  }

  const callPostWorkInvite = () => {
    if (tokenString != '') {
      if (selectedItems.length == 0) {
        showAlertWith("Thông báo", "Chưa chọn phóng viên mời làm việc", 'error', 'OK')
        return
      }
      if (titleInvite == '' || contentInvite == '') {
        showAlertWith("Thông báo", "Chưa nhập tiêu đề hoặc nội dung", 'error', 'OK')
        return
      }
      if (files.length > 5) {
        showAlertWith("Thông báo", "Chỉ có thể gởi tối đa là 5 files", 'error', 'OK');
        return
      }
      if (dateString == '') {
        showAlertWith("Thông báo", "Chưa chọn ngày làm việc", 'error', 'OK')
        return
      }
      // debugger
      setShowLoading(true)
      workRepo.postWorkInvite(tokenString, selectedItems, null, titleInvite, contentInvite, timeStamp, files)
        .then(
          responseWork => {
            setResponse(responseWork)
            setShowLoading(false)
            showAlert({
              title: 'Thông báo',
              message: "Mời làm việc thành công",
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
            if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
          }
        )
    }
  }

  useEffect(() => {
    if (!isChangeDate) return
    setDateString(convertDateTimeToDateString(dateInvite));
    setTimeString(convertDateTimeToTimeString(dateInvite));
  }, [isChangeDate])
  // lấy ra data phóng viên

  useEffect(() => {
    if (tokenString != '') {
      setShowLoading(true)
      journalistRepo.getAllJournalist(tokenString, 7)
        .then(responseJounalist => {
          setJounalists(responseJounalist)
          setShowLoading(false)
        }).catch(
          errorMessage => {
            setShowLoading(false)
            if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
          }
        )
    }
  }, [tokenString])

  const jounalistObjArray = []

  jounalists.forEach(element => {
    if (element.Institute) {
      const { name: instituteName, id: instituteId } = element.Institute;
      const { givenName: childName, id: childId } = element;
      const existingJournalist = jounalistObjArray.find(journalist => journalist.id === instituteId);

      if (existingJournalist) {
        existingJournalist.children.push({ name: childName, id: childId });
      }
      else {
        const journalist = {
          name: instituteName,
          id: instituteId,
          children: [{ name: childName, id: childId }]
        };
        jounalistObjArray.push(journalist);
      }
    }
  });

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

  // drop down tree chon phong vien
  const [selectedItems, setSelectedItems] = useState([])
  const onSelectedItemsChange = (selectedItems) => {
    setSelectedItems(selectedItems)
  };
  //chon tất cả
  const handleSelectAll = () => {
    const allItems = jounalistObjArray.flatMap((section) => section.children);
    const allItemIds = allItems.map((item) => item.id);
    setSelectedItems(allItemIds);
  };
  // hủy tất cả
  const handleRemoveAll = () => {
    setSelectedItems([]);
  };
  //Tìm kiếm theo cụm theo cha và con
  const filterItems = (searchText, items, _selectedItems) => {
    const filteredItems = items.filter((item) => {
      const itemName = item.name.toLowerCase();
      const searchTerm = searchText.toLowerCase();
      const hasItemMatch = itemName.includes(searchTerm);
      const hasChildMatch =
        item.children &&
        item.children.some(
          (child) => child.name.toLowerCase().indexOf(searchTerm) !== -1
        );
      return hasItemMatch || hasChildMatch;
    });
    return filteredItems;
  };

  return (
    <SafeAreaView style={styles.saveAreaViewContainer}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      {showLoading ? <AppLoader /> : null}
      <DatePicker
        title="Chọn ngày và giờ"
        confirmText="Chọn"
        cancelText="Hủy"
        modal
        open={open}
        date={dateInvite}
        onConfirm={(date) => {
          debugger
          setOpen(false)
          setDateInvite(date)
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
        contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.viewContainDropdown}>
          <ScrollView>
            <View style={{
              width: '100%',
              backgroundColor: COLORS.white,
              borderWidth: 1, paddingBottom: 5,
              borderRadius: SIZES.radius, borderColor: COLORS.gray,
              paddingHorizontal: 10
            }}>
              <DropdownMultiSelect
                items={jounalistObjArray}
                IconRenderer={Icon}
                selectText="Chọn phóng viên mời làm việc"
                onSelectedItemsChange={onSelectedItemsChange}
                selectedItems={selectedItems}
                searchText={searchText}
                onSearchTextChange={handleSearchTextChange}
                filterItems={filterItems}
                styles={{
                  chipContainer: { //Container chính của chíp
                    backgroundColor: '#F3F3F3',
                    borderRadius: 20,
                    margin: 5,
                    padding: 5,
                  },
                  chipIcon: {
                    color: colors.newprimary,// màu dấu x khi render ra chip
                  },
                  chipText: {
                    color: 'black',// màu name user khi render ra chip
                  },
                  selectedSubItemText: {
                    color: colors.workDone,// màu cho mỗi mục con đã chọn.
                  },
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
              {/* button select and remove all */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity
                  onPress={handleSelectAll}
                  style={{
                    flexDirection: 'row',
                    height: 35,
                    backgroundColor: colors.workDone,
                    borderRadius: 10,
                    alignContent: 'center',
                    justifyContent: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                  }}>
                  <View style={{ flexDirection: 'row' }}>
                    <Image style={{ height: 16, width: 16 }}
                      resizeMode="cover"
                      source={require("../assets/icons/checkmark_icon.png")} />
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}> Chọn tất cả</Text>
                  </View>
                </TouchableOpacity>
                {selectedItems.length > 0 ?
                  <TouchableOpacity onPress={() => {
                    showAlert({
                      title: "Thông báo",
                      message: "Bạn muốn hủy tất cả những phóng viên đã chọn?",
                      alertType: 'warning',
                      btnLabel: 'Đồng ý',
                      leftBtnLabel: 'Hủy',
                      onPress: () => {
                        closeAlert()
                        handleRemoveAll();
                      }
                    });
                  }}
                    style={{
                      flexDirection: 'row',
                      height: 35,
                      backgroundColor: colors.cancel,
                      borderRadius: 10,
                      alignContent: 'center',
                      justifyContent: 'center',
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                    }}>
                    <View style={{ flexDirection: 'row' }}>
                      <Image style={{ height: 16, width: 16 }}
                        resizeMode="cover"
                        source={require("../assets/icons/remove_icon.png")} />
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}> Hủy chọn</Text>
                    </View>
                  </TouchableOpacity> : null}
              </View>
            </View>
          </ScrollView>
          <View>
            <Text style={[styles.titleSmallHeader, { marginTop: 10 }]}>
              Tiêu đề mời làm việc
            </Text>
            <TextInput
              blurOnSubmit={true}
              style={[styles.input]}
              onChangeText={(value) => setTitle(value)}
              value={titleInvite}
              multiline={true}
              placeholder="Nhập tiêu đề"
              placeholderTextColor={'#BEC1D2'}
            />
            <Text style={styles.titleSmallHeader}>
              Nội dung mời làm việc
            </Text>
          </View>
          <TextInput
            style={[styles.input, { flex: 1, height: 'auto' }]}
            onChangeText={(value) => setContent(value)}
            value={contentInvite}
            multiline={true}
            placeholder="Nhập nội dung"
            underlineColorAndroid='transparent'
            placeholderTextColor={'#BEC1D2'}
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
                      if (element.size > 5242880) {
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
                  width: '100%', height: "auto",
                  padding: 10, paddingTop: 16,
                  maxHeight: 300, borderRadius: 15,
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
          <Text style={styles.titleSmallHeader}>
            Ngày làm việc
          </Text>
          <View style={{
            flexDirection: 'row',
            borderColor: COLORS.gray,
            borderRadius: SIZES.radius,
            borderWidth: 1,
            padding: 10,
            marginTop: 5,
            backgroundColor: 'white'
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, color: '#000' }}>
                Ngày: {dateString}
              </Text>
              <Text style={{ fontSize: 16, color: '#000' }}>
                Vào lúc: {timeString}
              </Text>
            </View>

            <View style={{ justifyContent: 'center', }}>
              <TouchableOpacity style={{
                backgroundColor: '#0373F3',
                width: 100,
                borderRadius: 10,
                alignContent: 'center',
                justifyContent: 'center',
                paddingVertical: 10,
                paddingHorizontal: 20,
                flexDirection: 'row'
              }}
                onPress={() => setOpen(true)}>
                <Ionicons name='calendar' style={{ color: 'white', fontSize: 18, marginRight: 5 }} />
                <Text style={{ fontSize: 13, color: 'white' }}>
                  Hẹn ngày
                </Text>
              </TouchableOpacity >
            </View>
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity onPress={() => {
        showAlert({
          title: "Thông báo",
          message: "Bạn muốn gửi đăng ký mời làm việc này ?",
          alertType: 'warning',
          btnLabel: 'Đồng ý',
          leftBtnLabel: 'Hủy',
          onPress: () => {
            closeAlert()
            callPostWorkInvite();
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
          Mời làm việc
        </Text>
      </TouchableOpacity >
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
  titleSmallHeader: {
    ...FONTS.h3,
    fontWeight: 'bold',
    color: 'black'
  },
  viewContainDropdown: {
    backgroundColor: COLORS.background,
    padding: 20
  },
  input: {
    height: 'auto',
    maxHeight: 150,
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
export default WorkInvite