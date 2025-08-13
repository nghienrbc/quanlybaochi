import {combineReducers} from 'redux'
import info from './infoLogin'
const reducers = combineReducers({
   loginInfo:info
});

export default (state, action) => reducers(state, action);
 