import React, { useEffect, useState } from 'react';
import {
    Text,
    View,
    Image,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import {colors, string, COLORS } from "../constants";
import AgenciesListRep from '../repositories/agencieslist';
import AgenciesItem from './AgenciesItem';
import { getMyStringValue} from "../utilies/LocalDataHandler"

import { CallCustomAlert } from "../utilies";
import AppLoader from '../utilies/AppLoader';
import SearchInput from '../Component/SearchInput';
function AgenciesListSreens(props) {
    //navigation
    const { navigation, route } = props
    //functions of navigate to/back
    const { navigate, goBack } = navigation
    const [showLoading, setShowLoading] = useState(false)
    
    const [agencieslists, setAgencieslists] = useState([])
    //Load thêm
    const [isLoading, setIsLoading] = useState(false)
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
                headerTitle: 'Danh sách người phát ngôn',//status,
                headerTitleStyle: { fontSize: 20, fontWeight: 'bold' },
                headerTitleAlign: 'center',
                headerStyle: {
                    backgroundColor: colors.newprimary
                },
                headerTintColor: 'white'
            })

    }, [])

    const agencieslistObjArray = []
    // call function to get data
    useEffect(() => {
        //debugger
        if (tokenString == '') return
        setShowLoading(true)
        AgenciesListRep.getAllAgenciesListByProvinceID(tokenString, 4)
            .then(responseAgenciesList => {
                setAgencieslists(responseAgenciesList)
                setShowLoading(false)
            }).catch(
                errorMessage => {
                    setShowLoading(false)
                    if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
                }
            )
    }, [tokenString])

    agencieslists.forEach(element => {
        // đổ dữ liệu vào
        debugger
        let agencieslistObj = {
            id: element.id,
            nameAgencies: element?.Institute?.name || '',
            name: element?.givenName || '',
            office: element.TypeUser?.name || '',
            Email: element?.email ,
            imageUrl: element.avatar ?
                (string.IMAGEURL + element.avatar) : ('https://img.icons8.com/color/344/circled-user-male-skin-type-5.png'),
            // City: element.city,
            address: element?.Institute?.address,
            Phone: element?.phone,
            Email: element?.email,
        }
        agencieslistObjArray.push(agencieslistObj)
    });

    const [searchText, setSearchText] = useState('')
    const removeAccents = (text) => {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      };
    const filteredAgenciesLists = () => {
        let filteredList = agencieslistObjArray.filter((eachAgenciesList) => {
          const searchTextWithoutAccents = removeAccents(searchText.toLowerCase());
          const includesText = (text) => removeAccents(text.toLowerCase()).includes(searchTextWithoutAccents);
          
          const nameAgenciesIncludesText = includesText(eachAgenciesList.nameAgencies);
          const nameIncludesText = includesText(eachAgenciesList.name);
          const officeIncludesText = includesText(eachAgenciesList.office);
          const addressIncludesText = includesText(eachAgenciesList.address || '');
          const EmailIncludesText = includesText(eachAgenciesList.Email || '');
          const PhoneIncludesText = includesText(eachAgenciesList.Phone || '');
          
            return (
                nameAgenciesIncludesText ||
                nameIncludesText ||
                officeIncludesText ||
                addressIncludesText ||
                EmailIncludesText ||
                PhoneIncludesText
              );
        });
        return filteredList;
    };
    const [loadmoreI, setLoadMoreI] = useState(10)
    const listData = filteredAgenciesLists().slice(0,loadmoreI)
    const loadMoreItem = () => {
        if (listData.length >= filteredAgenciesLists().length) {
            return;
          }
        setIsLoading(true)
        setTimeout(()=>{
           setLoadMoreI(loadmoreI+10)
           setIsLoading(false)
           }, 1000);
       }
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
        <SafeAreaView style={{
            flex: 1,
            backgroundColor: COLORS.background
        }}>{showLoading ? <AppLoader /> : null}
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
            <View style={{
                flex: 1,
                backgroundColor: COLORS.background,
                borderRadius: 10,
                paddingBottom: 10,
            }}>
                {filteredAgenciesLists().length > 0 ? <FlatList
                    data={listData}
                    renderItem={({ item }) => {
                        return <AgenciesItem agenciesList={item} />
                    }}
                    keyExtractor={eachAgenciesList => eachAgenciesList.id}
                    ref={(ref) => {
                        listViewRef = ref;
                    }}
                    onScroll={handleScroll}
                    ListFooterComponent={() => (
                        isLoading ?
                            <View style = {{
                                alignSelf:'center',
                                flexDirection:'row',
                            }}>
                                <ActivityIndicator size="large" color ={colors.newprimary} />
                            </View> : null
                    )}
                    onEndReached ={loadMoreItem}
                    onEndReachedThreshold = {0.1}
                />
                    : <View style={{
                        // flex:1,
                        marginTop: 50,
                        // backgroundColor:'red', 
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
                        position : 'absolute',
                        width:28,
                        height:28,
                        alignItems:'center',
                        justifyContent:'center',
                        borderRadius:50,
                        backgroundColor:'white',
                        borderWidth:1,
                        borderColor:COLORS.gray
                    },{right:7, bottom:25}]}
                    onPress={TopButtonHandler}
                    >
                        <Image style={{height:11,width:11,tintColor:'#0373F3'}}
                            resizeMode = "contain"
                            source={require("../assets/icons/uptoline_icon.png")} />
                    </TouchableOpacity>
                    )}
            </View>
        </SafeAreaView>
    );
};

export default AgenciesListSreens;