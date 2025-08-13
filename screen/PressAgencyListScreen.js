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
import { colors, string, COLORS } from "../constants";
import { institute as instituteRepo } from "../repositories"
import PressAgencyFullItem from "./item/PressAgencyFullItem";
import { getMyStringValue,} from "../utilies/LocalDataHandler"

import { CallCustomAlert } from "../utilies";
import AppLoader from '../utilies/AppLoader';
import SearchInput from '../Component/SearchInput';
function PressAgencyListScreen(props) {
    //navigation
    const { navigation, route } = props
    //functions of navigate to/back
    const { navigate, goBack } = navigation
    const [showLoading, setShowLoading] = useState(false)
    const [pressAgencylists, setPressAgencylists] = useState([])
    //Load thêm
    const [isLoading, setIsLoading] = useState(false)
    // Trở về trang đầu,cuối trang 
    let listViewRef;
    ///////////////// ASYGN STORAGE ///////////////////////
    const [tokenString, setTokenString] = useState('')
    const [userID, setUserID] = useState('')
    const [userTypeID, setUserTypeID] = useState('')
    const [isJournalist, setIsJournalist] = useState(false)
    const [isManage, setIsManage] = useState(false)
    getMyStringValue("token").then((value) => {
        const data = value;
        setTokenString(data)
    })
    getMyStringValue("userTypeID").then((value) => {
        const data = value;
        setUserTypeID(data)
        setIsJournalist(data == 7)
        setIsManage(data == 2)
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
                headerTitle: 'Danh sách cơ quan báo chí',//status,
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
        debugger
        if (tokenString == '') return
        setShowLoading(true)
        instituteRepo.getAllPressInstitutePublic(tokenString)
            .then(responseAgenciesList => {
                setPressAgencylists(responseAgenciesList)
                setShowLoading(false)
            }).catch(
                errorMessage => {
                    setShowLoading(false)
                    if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
                }
            )
    }, [tokenString])


    const pressAgencylistObjArray = []
    pressAgencylists.forEach(element => {
        // đổ dữ liệu vào
        let pressAgencyObj = {
            id: element.id,
            hierarchyLevel: element.hierarchyLevel,
            name: element.name,
            avatar: element.avatar ?
                (string.IMAGEURL + element.avatar) : null,
            description: element.description,
            address: element.address,
            email: element.emailIns ? element.emailIns : '',
            phone: element.phoneIns ? element.phoneIns : '',
        }
        pressAgencylistObjArray.push(pressAgencyObj)
    });

    const [searchText, setSearchText] = useState('')

    const removeAccents = (text) => {
            return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        };

    const filteredPressAgencylists = () => {
        let filteredList = pressAgencylistObjArray.filter((eachPressAgencyList) => {
          const searchTextWithoutAccents = removeAccents(searchText.toLowerCase());
          const includesText = (text) => removeAccents(text.toLowerCase()).includes(searchTextWithoutAccents);
          
            const nameIncludesText = includesText(eachPressAgencyList.name);
            const addressIncludesText = includesText(eachPressAgencyList.address || '');
            const phoneIncludesText = includesText(eachPressAgencyList.phone ||'');
            const emailIncludesText = includesText(eachPressAgencyList.email ||'');

            return (
                nameIncludesText ||
                addressIncludesText ||
                phoneIncludesText ||
                emailIncludesText
              );
        });
        return filteredList;
  };
    // loadmore item trong flatlist
    const [loadmoreI, setLoadMoreI] = useState(5)
    const listData = filteredPressAgencylists().slice(0,loadmoreI)
    const loadMoreItem = () => {
        if (listData.length >= filteredPressAgencylists().length) {
            return;
          }
        setIsLoading(true)
        setTimeout(()=>{
           setLoadMoreI(loadmoreI+5)
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
        <SafeAreaView style={{
            flex: 1,
        }}>{
                showLoading ? <AppLoader /> : null}
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
                borderRadius: 10,
                paddingBottom: 10,
            }}>
                {filteredPressAgencylists().length > 0 ? <FlatList
                    nestedScrollEnabled={true}
                    data={listData}
                    renderItem={({ item }) => {
                        //debugger
                        return <PressAgencyFullItem pressAgencyItem={item} />
                    }}
                    keyExtractor={eachAgenciesList => eachAgenciesList.id}
                    ref={(ref) => {
                        listViewRef = ref;
                    }}
                    onScroll={handleScroll}
                    ListFooterComponent={() => (
                        isLoading ?
                            <View style = {{
                                // marginTop: 10,
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
                        position : 'absolute',
                        width:28,
                        height:28,
                        alignItems:'center',
                        justifyContent:'center',
                        borderRadius:50,
                        backgroundColor:'white',
                        borderWidth:1,
                        borderColor:COLORS.gray
                    },{right:7, bottom:80}]}
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
export default PressAgencyListScreen;