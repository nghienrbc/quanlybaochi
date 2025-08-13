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
  Dimensions,
  StyleSheet,
  Alert,
  Modal
} from 'react-native'
import DocumentPicker, {
  DirectoryPickerResponse,
  DocumentPickerResponse,
  isInProgress,
  types,
} from 'react-native-document-picker'

import { COLORS, FONTS, SIZES, string, colors } from '../constants'
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { work as workRepo, journalist as journalistRepo } from "../repositories"
import { getMyStringValue } from "../utilies/LocalDataHandler"
import { showAlert, closeAlert } from "react-native-customisable-alert";
import Icon1 from 'react-native-vector-icons/FontAwesome'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { CallCustomAlert } from "../utilies";
import AppLoader from '../utilies/AppLoader';
import DropdownMultiSelect from '../Component/DropdownMultiSelect';
function WorkProvide(props) {

  const { navigation, route } = props
  //functions of navigate to/back
  const { navigate, goBack } = navigation
  const [showLoading, setShowLoading] = useState(false)

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [states, setStates] = useState('');
  const [response, setResponse] = useState(null)
  const [jounalists, setJounalists] = useState([])
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
        headerTitle: 'Chủ động cung cấp thông tin',
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

  const callPostWork = (states) => {
    if (tokenString != '') {
      if (tokenString === '' && tags === '') {
        showAlertWith("Thông báo", "Chưa chọn phóng viên và nhập email", 'error', 'OK')
        return
      }
      if (title == '' || content == '') {
        // de nghi nhap ten tieu de// de nghi nhap ten tieu de
        showAlertWith("Thông báo", "Chưa nhập tiêu đề hoặc nội dung", 'error', 'OK')
        return
      }
      if (files.length > 5) {
        showAlertWith("Thông báo", "Chỉ có thể gởi tối đa là 5 files", 'error', 'OK');
        return
      }
      // debugger
      setShowLoading(true)
      const successMessage = states === 'draft' ? "Lưu bản nháp cung cấp thông tin thành công" : "Cung cấp thông tin thành công";
      workRepo.postWorkProvide(tokenString, sendTo, title, content, files, states)
        .then(
          responseWork => {
            setResponse(responseWork)
            setShowLoading(false)
            showAlert({
              title: 'Thông báo',
              message: successMessage,
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
  // debugger
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
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };
  const addTag = () => {
    if (inputValue.trim() !== '') {
      const newTags = inputValue
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const invalidTags = newTags.filter((tag) => !validateEmail(tag));

      if (invalidTags.length === 0) {
        setTags([...tags, ...newTags]);
        setInputValue('');
      } else {
        const invalidEmails = invalidTags.join(', ');
        Alert.alert(
          'Thông báo',
          `Các địa chỉ email sau không hợp lệ: ${invalidEmails}`
        );
      }
    } else {
      Alert.alert(
        'Thông báo',
        'Vui lòng nhập địa chỉ email bạn muốn thêm vào ô'
      );
    }
  };
  // const addTag = () => {
  //   if (inputValue.trim() !== '') {
  //     if (validateEmail(inputValue)) {
  //       setTags([...tags, inputValue.trim()]);
  //       setInputValue('');
  //     } else {
  //      Alert.alert(
  //       'Email không hợp lệ',
  //       'Vui lòng nhập đúng định dạng email, Ví dụ: user123@gmail.com.',
  //     );
  //     }
  //   }
  // };
  // const addTag = () => {
  //   if (inputValue.trim() !== '') {
  //     setTags([...tags, inputValue.trim()]);
  //     setInputValue('');
  //   }
  // };
  const removeTag = (tagIndex) => {
    const newTags = tags.filter((_, index) => index !== tagIndex);
    setTags(newTags);
  };
  const clearAllTags = () => {
    setTags([]);
  };
  // mở ra modal dấu ? giải đáp thắc mắc 
  const [isOpenAnswers, setIsOpenAnswers] = useState(false)
  const callOpenAnswers = () => {
    setIsOpenAnswers(!isOpenAnswers)
  }
  // Lấy mảng sendTo từ selectedItems
  const sendToFromSelected = selectedItems.map(userId => {
    // Tìm người dùng có userId tương ứng trong danh sách jounalists
    const journalist = jounalists.find(journalist => journalist.id === userId);

    // Nếu tìm thấy người dùng, trả về đối tượng với userId và email
    if (journalist) {
      return { usersId: userId, email: journalist.email };
    }
    // else {
    //   return { usersId: userId, email: '' }; // Nếu không tìm thấy, gán email rỗng hoặc giá trị mặc định khác nếu cần
    // }
  });

  // Lấy mảng sendTo từ extractedEmails
  const sendToFromEmails = tags.map(email => ({ usersId: 0, email }));

  // Kết hợp mảng sendTo từ cả selectedItems và extractedEmails
  const sendTo = [...sendToFromSelected, ...sendToFromEmails];
  console.log(sendTo);
  return (
    <SafeAreaView style={styles.saveAreaViewContainer}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      {showLoading ? <AppLoader /> : null}
      <ScrollView
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={false}
        contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.viewContainDropdown}>
          <ScrollView>
            <View style={{
              width: '100%', backgroundColor: 'red',
              backgroundColor: COLORS.white,
              borderWidth: 1, paddingBottom: 5,
              borderRadius: SIZES.radius, borderColor: COLORS.gray,
              paddingHorizontal: 10
            }}>
              <DropdownMultiSelect
                items={jounalistObjArray}
                IconRenderer={Icon}
                selectText="Chọn phóng viên cần cung cấp thông tin"
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
          <View style={{
            width: '100%', backgroundColor: 'red',
            backgroundColor: COLORS.white,
            borderWidth: 1, paddingBottom: 5,
            borderRadius: SIZES.radius, borderColor: COLORS.gray,
            paddingHorizontal: 10, marginTop: 15
          }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {tags.map((tag, index) => (
                <View key={index}
                  style={{
                    flexDirection: 'row',
                    marginTop: 10,
                    marginStart: 10,
                    padding: 5,
                    borderWidth: 1,
                    borderColor: COLORS.background,
                    ...styles.shadow,
                    borderRadius: 20,
                    backgroundColor: 'white',
                  }}>
                  <Text numberOfLines={1}>{tag} </Text>
                  <TouchableOpacity onPress={() => removeTag(index)}>
                    <Icon name="close" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View>
              <View style={{ flexDirection: 'row' }}>
                <TextInput
                  style={[styles.input, {}]}
                  placeholder={`Nhập email và nhấn nút 'Thêm' để xác nhận`}
                  value={inputValue}
                  onChangeText={setInputValue}
                  onSubmitEditing={addTag}
                  placeholderTextColor={'#BEC1D2'}
                />
                <View>
                  <TouchableOpacity onPress={() => callOpenAnswers()}>
                    <Image
                      style={{ height: 18, width: 18, marginLeft: -22, marginTop: 12 }}
                      resizeMode="contain"
                      source={require("../assets/icons/exclamationMark_icon.png")}
                    />
                  </TouchableOpacity>
                  {/* dấu ? giải đáp thắc mắc */}
                  <Modal
                    transparent={true}
                    visible={isOpenAnswers}
                  >
                    <TouchableOpacity onPress={() => { setIsOpenAnswers(false) }}
                      style={{
                        flex: 1,
                        backgroundColor: '#000000aa',
                        // justifyContent: 'center',
                        // alignItems: 'center',
                      }}>
                      {/* <View style={styles.TriangleShapeCSS} /> */}
                      <View onStartShouldSetResponder={() => true}
                        style={{
                          marginLeft: 50,
                          marginRight: 50,
                          marginTop: 250,
                          borderRadius: 8,
                          paddingBottom: 10,
                          backgroundColor: COLORS.white
                        }}
                      >
                        {/* Modal content */}
                        <View style={{ marginStart: 10, marginTop: 10, padding: 5 }}>
                          <Text style={{ fontSize: 13, color: COLORS.darkgray }}>
                            Nhập email và nhấn nút "Thêm" để xác nhận,
                            Có thể nhập nhiều email cùng 1 lúc và phân cách chúng bởi dấu
                            <Text style={{ fontSize: 13, color: colors.newprimary }}> ' , '</Text>
                          </Text>
                          <Text style={{ fontSize: 13, color: COLORS.darkgray }}>(Ví du : user1@gmail.com,user2@gmail.com,...).</Text>
                          <Text style={{ color: colors.newprimary, fontSize: 12, }}>
                            Lưu ý : Nhập đúng email, nếu không sẽ không nhận được thông tin.
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Modal>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={addTag}
                  style={{
                    flexDirection: 'row',
                    height: 35,
                    width: 75,
                    backgroundColor: colors.workDone,
                    borderRadius: 10,
                    alignContent: 'center',
                    justifyContent: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                  }}
                >
                  <View style={{ flexDirection: 'row' }}>
                    <Image style={{ height: 16, width: 16 }}
                      resizeMode="cover"
                      source={require("../assets/icons/checkmark_icon.png")} />
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}> Thêm</Text>
                  </View>
                </TouchableOpacity>
                {tags.length > 0 ?
                  <TouchableOpacity onPress={() => {
                    showAlert({
                      title: "Thông báo",
                      message: "Bạn muốn hủy tất cả những email đã chọn?",
                      alertType: 'warning',
                      btnLabel: 'Đồng ý',
                      leftBtnLabel: 'Hủy',
                      onPress: () => {
                        closeAlert()
                        clearAllTags();
                      }
                    });
                  }}
                    style={{
                      flexDirection: 'row',
                      height: 35,
                      width: 100,
                      backgroundColor: colors.cancel,
                      borderRadius: 10,
                      alignContent: 'center',
                      justifyContent: 'center',
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                    }}
                  >
                    <View style={{ flexDirection: 'row' }}>
                      <Image style={{ height: 16, width: 16 }}
                        resizeMode="cover"
                        source={require("../assets/icons/remove_icon.png")} />
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}> Hủy chọn</Text>
                    </View>
                  </TouchableOpacity> : null}
              </View>
            </View>
          </View>
          <View>
            <Text style={[styles.titleSmallHeader, { marginTop: 10 }]}>
              Tiêu đề
            </Text>
            <TextInput
              blurOnSubmit={true}
              style={[styles.input]}
              onChangeText={(value) => setTitle(value)}
              value={title}
              multiline={true}
              placeholder="Nhập tiêu đề"
              placeholderTextColor={'#BEC1D2'}
            />
            <Text style={styles.titleSmallHeader}>
              Nội dung
            </Text>
          </View>
          <TextInput
            style={[styles.input, { flex: 1, height: 'auto' }]}
            onChangeText={(value) => setContent(value)}
            value={content}
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
        </View>
      </ScrollView>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={() => {
          showAlert({
            title: "Thông báo",
            message: "Bạn muốn lưu bản nháp này ?",
            alertType: 'warning',
            btnLabel: 'Đồng ý',
            leftBtnLabel: 'Hủy',
            onPress: () => {
              closeAlert()
              callPostWork('draft');
            }
          });
        }}
          style={{
            backgroundColor: COLORS.darkgray,
            borderRadius: 10,
            alignContent: 'center',
            justifyContent: 'center',
            paddingVertical: 10,
            paddingHorizontal: 10,
            marginBottom: 10,
            marginHorizontal: 10,
            marginTop: 0,
            flexDirection: 'row',
            flex: 1
          }}>
          <Text style={{ fontSize: 18, color: 'white' }}>
            Lưu nháp
          </Text>
        </TouchableOpacity >
        <TouchableOpacity onPress={() => {
          showAlert({
            title: "Thông báo",
            message: "Bạn muốn gởi thông tin này ?",
            alertType: 'warning',
            btnLabel: 'Đồng ý',
            leftBtnLabel: 'Hủy',
            onPress: () => {
              closeAlert()
              callPostWork('completed');
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
            marginBottom: 10,
            marginHorizontal: 10,
            marginTop: 0,
            flexDirection: 'row',
            flex: 1
          }}>
          <Text style={{ fontSize: 18, color: 'white' }}>
            Gởi thông tin
          </Text>
        </TouchableOpacity >
      </View>
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
export default WorkProvide