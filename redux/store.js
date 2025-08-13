import {createStore, applyMiddleware} from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import thunk from 'redux-thunk'
import reducers from './reducers'

const middleware = [thunk];
export const store = createStore(
    reducers
)

