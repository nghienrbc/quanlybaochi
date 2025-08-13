/**
 * @format
 */
import {
    WorkList,
    SplashScreen,
    Dashboard,
    LoginScreen,
    ProfileScreen,
    WorkRegistration,
    InviteWorkScreen,
    WorkInvite,
    WorkInviteList,
    AgenciesListSreens,
    JounalistScreen,
    SessionListScreen
} from './screen'; 

import {AppRegistry} from 'react-native';

import {name as appName} from './app.json';
import App from './navigation/App'

//AppRegistry.registerComponent(appName, () => ProfileScreen);
AppRegistry.registerComponent(appName, () => () => <App/>);
