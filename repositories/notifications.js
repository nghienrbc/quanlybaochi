import axios from "axios"
import { images, colors, icons, fontSizes, string } from "../constants";

const getAllNotifications = async (authenString) => {
    try {
        debugger
        let headers = {
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json'
            'Authorization': 'Bearer ' + authenString
        }
        let response = await axios.get(`${string.SERVER_NAME}users/his-notify?size=99999&page=1`, {
            headers: headers,
            timeout: string.TIME_OUT
        })
        //debugger 
        if (response.status != 200) {
            throw 'failed request'
        }
        if (response.data.success) {
            if (response.data.result == null) throw 'Not found'
            if (response.data.result.data == null) throw 'Not found'
            return response.data.result.data;
        }
        //debugger   
        throw 'Not found'
    } catch (error) {
        //debugger        
        throw error
    }
}

const getNotificationDetailForInvite = async (authenString, notifyID) => {
    try {
        debugger
        let headers = {
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json'
            'Authorization': 'Bearer ' + authenString
        }
        let response = await axios.get(`${string.SERVER_NAME}user/detail-notify-invite?actionId=${notifyID}`, {
            headers: headers,
            timeout: string.TIME_OUT
        })
        //debugger 
        if (response.status != 200) {
            throw 'failed request'
        }
        if (response.data.success) {
            if (response.data.result == null) throw 'Not found'
            return response.data.result;
        }
        //debugger   
        throw 'Not found'
    } catch (error) {
        //debugger        
        throw error
    }
}

const getNotificationDetailForClaim = async (authenString, notifyID) => {
    try {
        debugger
        let headers = {
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json'
            'Authorization': 'Bearer ' + authenString
        }
        let response = await axios.get(`${string.SERVER_NAME}user/detail-notify-claim?actionId=${notifyID}`, {
            headers: headers,
            timeout: string.TIME_OUT
        })
        //debugger 
        if (response.status != 200) {
            throw 'failed request'
        }
        if (response.data.success) {
            if (response.data.result == null) throw 'Not found'
            return response.data.result;
        }
        //debugger   
        throw 'Not found'
    } catch (error) {
        //debugger        
        throw error
    }
}

const getNotificationDetailForReport = async (authenString, notifyID) => {
    try {
        debugger
        let headers = {
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json'
            'Authorization': 'Bearer ' + authenString
        }
        let response = await axios.get(`${string.SERVER_NAME}user/detail-notify-complain?actionId=${notifyID}`, {
            headers: headers,
            timeout: string.TIME_OUT
        })
        //debugger 
        if (response.status != 200) {
            throw 'failed request'
        }
        if (response.data.success) {
            if (response.data.result == null) throw 'Not found'
            return response.data.result;
        }
        //debugger   
        throw 'Not found'
    } catch (error) {
        //debugger        
        throw error
    }
}
const getNotificationDetailForProvide = async (authenString, notifyID) => {
    try {
        debugger
        let headers = {
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json'
            'Authorization': 'Bearer ' + authenString
        }
        let response = await axios.get(`${string.SERVER_NAME}user/detail-notify-provide?actionId=${notifyID}`, {
            headers: headers,
            timeout: string.TIME_OUT
        })
        //debugger 
        if (response.status != 200) {
            throw 'failed request'
        }
        if (response.data.success) {
            if (response.data.result == null) throw 'Not found'
            return response.data.result;
        }
        //debugger   
        throw 'Not found'
    } catch (error) {
        //debugger        
        throw error
    }
}


const getNotificationDetail = async (authenString, notifyID) => {
    try {
        debugger
        let headers = {
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json'
            'Authorization': 'Bearer ' + authenString
        }
        let response = await axios.get(`${string.SERVER_NAME}users/detail-notify/${notifyID}`, {
            headers: headers,
            timeout: string.TIME_OUT
        })
        //debugger 
        if (response.status != 200) {
            throw 'failed request'
        }
        if (response.data.success) {
            if (response.data.result == null) throw 'Not found'
            return response.data.result;
        }
        //debugger   
        throw 'Not found'
    } catch (error) {
        //debugger        
        throw error
    }
}

const getUpdateViewNotify = async (authenString, notifyID) => {
    try {
        debugger
        let headers = {
            'Authorization': 'Bearer ' + authenString
        }
        let response = await axios.get(`${string.SERVER_NAME}users/view-notify/${notifyID}`, {
            headers: headers,
            timeout: string.TIME_OUT
        })
        if (response.status != 200) {
            throw 'failed request'
        }
        if (response.data.success) {
            if (response.data.result == null) throw 'Not found'
            return response.data.result;
        }
        throw 'Not found'
    } catch (error) {
        throw error
    }
}

export default {
    getAllNotifications, getNotificationDetail, getUpdateViewNotify,
    getNotificationDetailForInvite, getNotificationDetailForReport,
    getNotificationDetailForProvide, getNotificationDetailForClaim
}

