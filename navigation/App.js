
import React, { Component, useState } from 'react'
import {
    SafeAreaView,
    Text,
    View,
    Image,
    TouchableOpacity,
    ImageBackground,
    FlatList,
} from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { StackRouter } from 'react-navigation'
import {
    SplashScreen, Dashboard, WorkList,
    LoginScreen, WorkRegistration, WorkEdit,
    ProfileScreen, WorkInvite, WorkInviteList, WorkInviteEdit, AgenciesListSreens,
    JounalistScreen, StatisticSreens, PressReleaseScreen, PressReleaseListScreen,
    SessionListScreen, SessionScreen, RequireInfoEditScreen, RequireInfoListScreen, RequireInfoScreen,
    PressAgencyListScreen, AddInstitute, AddJournalist, WorkRegisterForJounalist, PressReleaseEditScreen,
    StatictisRegisterInstituteScreen, StatictisRegisterJournalistScreen, StatictisRequireInstituteScreen,
    StatictisStrangeRegisterScreen, StatictisRequireJournalistScreen, StatictisRegisterManageScreen, StatictisRequireManageScreen,
    WorkProvide, WorkProvideList, WorkProvideEdit, ReportInfoListScreen, ReportInfoScreen, ReportInfoEditScreen
} from '../screen'

import { Provider } from 'react-redux'
import { store } from '../redux/store'

import {
    createDrawerNavigator,
    DrawerContentScrollView,
    DrawerItemList,
    DrawerItem,
} from '@react-navigation/drawer'

const Stack = createNativeStackNavigator()
import UITab from './UITab'
function App(props) {
    return (
        // <Provider store={store}>
        <NavigationContainer>
            <Stack.Navigator initialRouteName='SplashScreen' screenOptions={{
                headerShown: true
            }}>
                <Stack.Screen name={"SplashScreen"} component={SplashScreen}
                    options={{
                        headerShown: false
                    }}
                />

                <Stack.Screen name={"WorkList"} component={WorkList}
                />
                <Stack.Screen name={"WorkInvite"} component={WorkInvite} />
                <Stack.Screen name={"WorkInviteList"} component={WorkInviteList} />
                <Stack.Screen name={"LoginScreen"} component={LoginScreen}
                    options={{
                        headerShown: false
                    }}
                />
                <Stack.Screen name={"Dashboard"} component={Dashboard}
                    options={{
                        headerShown: false
                    }} />
                <Stack.Screen name={"WorkRegistration"} component={WorkRegistration} />
                <Stack.Screen name={"PressReleaseScreen"} component={PressReleaseScreen} />
                <Stack.Screen name={"PressReleaseEditScreen"} component={PressReleaseEditScreen} />
                <Stack.Screen name={"PressReleaseListScreen"} component={PressReleaseListScreen} />
                <Stack.Screen name={"WorkEdit"} component={WorkEdit} />
                <Stack.Screen name={"WorkInviteEdit"} component={WorkInviteEdit} />
                <Stack.Screen name={"ProfileScreen"} component={ProfileScreen} />
                <Stack.Screen name={"StatisticSreens"} component={StatisticSreens} />
                <Stack.Screen name={"StatictisRegisterManageScreen"} component={StatictisRegisterManageScreen} />
                <Stack.Screen name={"StatictisRegisterInstituteScreen"} component={StatictisRegisterInstituteScreen} />
                <Stack.Screen name={"StatictisRegisterJournalistScreen"} component={StatictisRegisterJournalistScreen} />
                <Stack.Screen name={"StatictisRequireManageScreen"} component={StatictisRequireManageScreen} />
                <Stack.Screen name={"StatictisRequireJournalistScreen"} component={StatictisRequireJournalistScreen} />
                <Stack.Screen name={"StatictisRequireInstituteScreen"} component={StatictisRequireInstituteScreen} />
                <Stack.Screen name={"StatictisStrangeRegisterScreen"} component={StatictisStrangeRegisterScreen} />
                <Stack.Screen name={"AgenciesListSreens"} component={AgenciesListSreens} />
                <Stack.Screen name={"JounalistScreen"} component={JounalistScreen} />
                <Stack.Screen name={"SessionListScreen"} component={SessionListScreen} />
                <Stack.Screen name={"SessionScreen"} component={SessionScreen} />
                <Stack.Screen name={"RequireInfoEditScreen"} component={RequireInfoEditScreen} />
                <Stack.Screen name={"RequireInfoListScreen"} component={RequireInfoListScreen} />
                <Stack.Screen name={"RequireInfoScreen"} component={RequireInfoScreen} />
                <Stack.Screen name={"ReportInfoEditScreen"} component={ReportInfoEditScreen} />
                <Stack.Screen name={"ReportInfoListScreen"} component={ReportInfoListScreen} />
                <Stack.Screen name={"ReportInfoScreen"} component={ReportInfoScreen} />
                <Stack.Screen name={"PressAgencyListScreen"} component={PressAgencyListScreen} />
                <Stack.Screen name={"AddInstitute"} component={AddInstitute} />
                <Stack.Screen name={"AddJournalist"} component={AddJournalist} />
                <Stack.Screen name={"WorkRegisterForJounalist"} component={WorkRegisterForJounalist} />
                <Stack.Screen name={"WorkProvide"} component={WorkProvide} />
                <Stack.Screen name={"WorkProvideList"} component={WorkProvideList} />
                <Stack.Screen name={"WorkProvideEdit"} component={WorkProvideEdit} />
                <Stack.Screen name={"UITab"} component={UITab}
                    options={{
                        headerShown: false
                    }} />
            </Stack.Navigator>
        </NavigationContainer>
        // </Provider>

    )
}
export default App