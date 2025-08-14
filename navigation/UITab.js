/**
yarn add react-navigation
yarn add react-native-safe-area-context
yarn add @react-navigation/bottom-tabs
yarn add @react-navigation/native
yarn add @react-navigation/native-stack
yarn add @react-navigation/drawer
yarn add react-native-gesture-handler 
 */
import * as React from 'react'
import {
    Dashboard, ProfileScreen, WorkList, StatisticSreens
} from '../screen'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import {fontSizes, colors} from '../constants'
import Icon from 'react-native-vector-icons/FontAwesome5'
// import 'react-native-gesture-handler' // Tạm comment để test build
import { View } from 'react-native'

const Tab = createBottomTabNavigator()

const screenOptions = ({route})=> ({
    headerShown: false,
    tabBarActiveTintColor: colors.newprimary,
    tabBarInactiveTintColor: colors.inactive,    
    tabBarActiveBackgroundColor: 'white',
    tabBarInactiveBackgroundColor: 'white',
    tabBarBackground: () => (
        <View style={{backgroundColor: 'white', flex: 1}}></View>
      ),
    tabBarIcon: ({focused, color, size}) => {
        
        /*
        let screenName = route.name
        let iconName = "facebook";
        if(screenName == "ProductGridView") {
            iconName = "align-center"
        } else if(screenName == "FoodList") {
            iconName = "accusoft"
        } else if(screenName == "Settings") {
            iconName = "cogs"
        }
        */
        return <Icon
            style={{
                paddingTop: 5
            }}
            name={route.name == "Statictis" ? "chart-pie" :
                (route.name == "Dashboard" ? "home" :
                    (route.name == "Profile" ? "user-circle" : ""
                    ))}
            size={23}
            color={focused ? colors.newprimary : colors.inactive}
        />
    },    
})
function UITab(props) {
    
    return <Tab.Navigator screenOptions={screenOptions}>
          
         <Tab.Screen 
            name="Dashboard" 
            component={Dashboard}
            options={{
                tabBarLabel: 'Trang chủ',
                tabBarLabelStyle: {
                    fontSize: fontSizes.h5
                }
            }}
        /> 
        
        <Tab.Screen 
            name="Statictis" 
            component={StatisticSreens}
            options={{
                tabBarLabel: 'Thống kê',
                tabBarLabelStyle: {
                    fontSize: fontSizes.h5
                }
            }}
        />  
        <Tab.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{
                tabBarLabel: 'Thông tin tài khoản',
                tabBarLabelStyle: {
                    fontSize: fontSizes.h6 
                }
            }}
        />  
    </Tab.Navigator>
}
export default UITab
//https://reactnavigation.org/docs/tab-based-navigation/