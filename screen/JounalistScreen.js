import React, { Component, useEffect, useState } from 'react';
import {
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    Image,
} from 'react-native';
import { COLORS, colors, string } from "../constants";
import JounalistRep from '../repositories/journalist';
import JounalistScreenItem from './JounalistScreenItem';
import { getMyStringValue } from "../utilies/LocalDataHandler"

import { CallCustomAlert } from "../utilies";
import AppLoader from '../utilies/AppLoader';
import { ActivityIndicator } from 'react-native-paper';
import SearchInput from '../Component/SearchInput';
function JounalistScreen(props) {
    //navigation
    const { navigation, route } = props
    //functions of navigate to/back
    const { navigate, goBack } = navigation
    const [showLoading, setShowLoading] = useState(false)
    // tải lại  trang
    const [refreshControl, setRefreshControl] = useState(false)
    //Load thêm
    const [isLoading, setIsLoading] = useState(false)

    const [jounalists, setJounalists] = useState([]);
    // Trở về trang đầu,cuối trang 
    let listViewRef;

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
        debugger
        navigation.setOptions(
            {
                headerShown: true,
                headerTitle: 'Danh sách phóng viên',//status,
                headerTitleStyle: { fontSize: 20, fontWeight: 'bold' },
                headerTitleAlign: 'center',
                headerStyle: {
                    backgroundColor: colors.newprimary
                },
                headerTintColor: 'white'
            })
    }, [])

    const jounalistObjArray = []
    // call function to get data
    useEffect(() => {
        //debugger
        if (tokenString == '') return
        setShowLoading(true)
        JounalistRep.getAllJournalistByProvinceID(tokenString, 7)
            .then(responseJounalist => {
                setJounalists(responseJounalist)
                setShowLoading(false)
            }).catch(
                errorMessage => {
                    setShowLoading(false)
                    if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
                }
            )

    }, [tokenString])

    //console.log(jounalists)
    jounalists.forEach(element => {
        // đổ dữ liệu vào
        debugger
        let jounalistObj = {
            id: element.id,
            name: element.givenName,
            Email: element.email,
            imageUrl: element.avatar ?
                (string.IMAGEURL + element.avatar) : ('https://img.icons8.com/color/344/circled-user-male-skin-type-5.png'),
            office: element.TypeUser?.name,
            workPlace: element?.Institute?.name,
            City: element?.Institute?.address,
            Phone: element.phone,
        }
        if (element?.Institute?.name) jounalistObjArray.push(jounalistObj)
    });

    const [searchText, setSearchText] = useState('')

    const removeAccents = (text) => {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    const filteredJounalists = () => {
        let filteredList = jounalistObjArray.filter((eachJounalist) => {
            const searchTextWithoutAccents = removeAccents(searchText.toLowerCase());
            const includesText = (text) => removeAccents(text.toLowerCase()).includes(searchTextWithoutAccents);

            const nameIncludesText = includesText(eachJounalist.name);
            const officeIncludesText = includesText(eachJounalist.office);
            const workPlaceIncludesText = includesText(eachJounalist.workPlace);
            const CityIncludesText = includesText(eachJounalist.City);
            const PhoneIncludesText = includesText(eachJounalist.Phone || '');
            const EmailIncludesText = includesText(eachJounalist.Email || '');

            return (
                nameIncludesText ||
                officeIncludesText ||
                workPlaceIncludesText ||
                CityIncludesText ||
                PhoneIncludesText ||
                EmailIncludesText
            );
        });
        return filteredList;
    };
    // loadmore item trong flatlist
    const [loadmoreI, setLoadMoreI] = useState(5)
    const listData = filteredJounalists().slice(0, loadmoreI)
    const loadMoreItem = () => {
        if (listData.length >= filteredJounalists().length) {
            return;
        }
        setIsLoading(true)
        setTimeout(() => {
            setLoadMoreI(loadmoreI + 5)
            setIsLoading(false)
        }, 1000);
    }

    // lên đầu trang
    const TopButtonHandler = () => {
        listViewRef.scrollToOffset({ offset: 0, animated: true });
    }
    // ẩn hiện nút lên đầu trang
    const [showButtons, setShowButtons] = useState(false);
    const handleScroll = (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setShowButtons(offsetY > 400);
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            {showLoading ? <AppLoader /> : null}
            <View style={{
                marginHorizontal: 10,
                marginVertical: 10,
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
            </View>
            {filteredJounalists().length > 0 ?
                <FlatList style={{ flex: 1, marginBottom: 10 }}
                    data={listData}
                    renderItem={({ item }) => {
                        //debugger
                        return <JounalistScreenItem jounalist={item} />
                    }}
                    keyExtractor={eachJounalist => eachJounalist.id}
                    ref={(ref) => {
                        listViewRef = ref;
                    }}
                    onScroll={handleScroll}
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
                :
                <View style={{
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
            {!searchText && showButtons && (
                <TouchableOpacity style={[{
                    position: 'absolute',
                    width: 28,
                    height: 28,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 50,
                    backgroundColor: 'white',
                    borderWidth: 1,
                    borderColor: COLORS.gray
                }, { right: 7, bottom: 25 }]}
                    onPress={TopButtonHandler}
                >
                    <Image style={{ height: 11, width: 11, tintColor: '#0373F3' }}
                        resizeMode="contain"
                        source={require("../assets/icons/uptoline_icon.png")} />
                </TouchableOpacity>
            )}

        </SafeAreaView>
    )
}

export default JounalistScreen;