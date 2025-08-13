import React, { useState, useEffect } from "react";
import { useIsFocused } from '@react-navigation/native';
import {
    View,
    SafeAreaView,
    FlatList,
    Platform
} from 'react-native'

import { images, colors } from "../constants";
import { getMyStringValue } from "../utilies/LocalDataHandler"

import AppLoader from '../utilies/AppLoader';

import GridItemStatis from './GridItemStatis';
function StatisticSreens(props) {

    //navigation
    const { navigation, route } = props
    const isFocused = useIsFocused();
    //functions of navigate to/back
    const { navigate, goBack } = navigation
    const [showLoading, setShowLoading] = useState(false)
    const [isJournalist, setIsJournalist] = useState(false)
    const [isManage, setIsManage] = useState(false)

    const [deviceType, setDeviceType] = useState('')

    const [tokenString, setTokenString] = useState('')
    const [userTypeID, setUserTypeID] = useState('')

    getMyStringValue("userTypeID").then((value) => {
        const data = value;
        setUserTypeID(data)
        setIsJournalist(data == 7)
        setIsManage(data == 2)
        getMyStringValue("token").then((value) => {
            const data = value;
            setTokenString(data)
        })
    })

    useEffect(() => {
        setDeviceType(Platform.OS === 'ios' ? 'IOS' : 'ANDROID')
    
        if (isManage) {
            setDashboardItem(manageDashboard)
        } else {
            if (isJournalist) {
                setDashboardItem(journalistDashboard)
            } else {
                setDashboardItem(instituteDashboard)
            }
        }
    }, [tokenString])

    useEffect(() => {
        debugger
        navigation.setOptions(
            {
                headerShown: true,
                headerTitle: 'Danh sách thống kê',
                headerTitleStyle: { fontSize: 20, fontWeight: 'bold' },
                headerTitleAlign: 'center',
                headerStyle: {
                    backgroundColor: colors.newprimary
                },
                headerTintColor: 'white'
            })
    }, [])

    var [dashboardItem, setDashboardItem] = useState([])
    var manageDashboard = [
        {
            id: 1,
            name: 'Đăng ký làm việc',
            image: images.worklist,
            badge: 2
        },
        {
            id: 2,
            name: 'Yêu cầu cung cấp thông tin',
            image: images.inviteWorking,
            badge: 2
        },
    ]
    var journalistDashboard = [
        {
            id: 1,
            name: 'Đăng ký làm việc',
            image: images.worklist,
            badge: 2
        },
        {
            id: 2,
            name: 'Yêu cầu cung cấp thông tin',
            image: images.inviteWorking,
            badge: 2
        }, 
    ]

    var instituteDashboard = [
        {
            id: 1,
            name: 'Đăng ký làm việc',
            image: images.worklist,
            badge: 2
        },
        {
            id: 2,
            name: 'Yêu cầu cung cấp thông tin',
            image: images.inviteWorking,
            badge: 2
        },
        {
            id: 3,
            name: 'Đăng ký làm việc ngoài hệ thống',
            image: images.agencyList,
            badge: 2
        },
        {
            id: 4,
            name: '',
            image: null,
            badge: 2
        },
    ]

    return <SafeAreaView style={{
        flex: 1,
        backgroundColor: '#F5F5F5'
    }}>
        {showLoading ? <AppLoader /> : null}
        <View style={{ flex: 1 }}>
            <FlatList
                style={{ marginTop: 10 }}
                data={dashboardItem}
                numColumns={2}
                keyExtractor={item => item.name}
                renderItem={({ item, index }) => <GridItemStatis
                    item={item}
                    index={index}
                    length={dashboardItem.length}
                    onPress={() => {
                        if(isJournalist){
                            if(item.id == 1) navigate('StatictisRegisterJournalistScreen')
                            else if(item.id == 2) navigate('StatictisRequireJournalistScreen')
                        } else if (isManage) {
                            if(item.id == 1) navigate('StatictisRegisterManageScreen')
                            else if(item.id == 2) navigate('StatictisRequireManageScreen')
                        }
                        else{
                            if(item.id == 1) navigate('StatictisRegisterInstituteScreen')
                            else if(item.id == 2) navigate('StatictisRequireInstituteScreen')
                            else if(item.id == 3) navigate('StatictisStrangeRegisterScreen')
                        } 
                    }}
                />}
            />
        </View>
    </SafeAreaView>
}
export default StatisticSreens
