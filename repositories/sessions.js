import axios from "axios"
import { images, colors, icons, fontSizes, string } from "../constants";

/////////// lấy tất cả các work content chưa hoàn thành của đơn vị 
const getSessionsByInstituteIDAndSessionID = async (authenString, selectedInstituteID, sessionID, statusApointment, statusWork) => {
    try {
        debugger
        let headers = {
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json'
            'Authorization': 'Bearer ' + authenString
        }
        const apiString = `${string.SERVER_NAME}user/list-session?page=1&size=999999&instituteId=${selectedInstituteID}` + (sessionID != 0 ? `&sessionID=${sessionID}` : ``)
            + (statusWork != null ? `&statusWork=${statusWork}` : ``) + (statusApointment != null ? `&statusApointment=${statusApointment}` : ``)
        //console.warn(apiString)
        let response = await axios.get(apiString, {
            headers: headers,
            timeout: string.TIME_OUT
        })
        if (response.status != 200) {
            throw 'failed request'
        }
        if (response.data.success) {
            if (response.data.result.code == "DATA_NOT_FOUND") throw 'Not found'
            return response.data.result;
        }
        throw 'Not found'
    } catch (error) {
        throw error
    }
}


const getSessionsByInstituteIDAndSessionIDForManager = async (authenString, statusApointment) => {
    try {
        debugger
        let headers = {
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json'
            'Authorization': 'Bearer ' + authenString
        }
        const apiString = `${string.SERVER_NAME}system/list-session-work?page=1&size=99999&`+ (statusApointment != null ? `statusApointment=${statusApointment}` : ``)
        //console.warn(apiString)
        let response = await axios.get(apiString, {
            headers: headers,
            timeout: string.TIME_OUT
        })
        if (response.status != 200) {
            throw 'failed request'
        }
        if (response.data.success) {
            if (response.data.result.code == "DATA_NOT_FOUND") throw 'Not found'
            return response.data.result.data;
        }
        throw 'Not found'
    } catch (error) {
        throw error
    }
}

const getAllRegisterBySessionID = async (authenString, sessionID) => {
    try {
        //debugger 
        let headers = {
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json'
            'Authorization': 'Bearer ' + authenString
        }
        let response = await axios.get(`${string.SERVER_NAME}user/data-session-work?sessionId=${sessionID}`, {
            headers: headers,
            timeout: string.TIME_OUT
        })
        if (response.status != 200) {
            throw 'failed request'
        }
        if (response.data.success) {
            return response.data.register.length;
        }
        throw 'Not found'
    } catch (error) {
        throw error
    }
}

const updateSessionBySessionID = async (authenString, sessionID, dateSession, reasonCancel, statusSession) => {
    try {
        debugger
        let formData = new FormData();
        formData.append('id', sessionID);
        dateSession && formData.append('dateSession', dateSession);
        if (reasonCancel != null && reasonCancel != '') formData.append('reasonCancel', reasonCancel);
        formData.append('statusSession', statusSession);


        let headers = {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer ' + authenString
        }
        let response = await axios.patch(`${string.SERVER_NAME}user/update-session`, formData, {
            headers: headers,
            timeout: string.TIME_OUT
        })
        //debugger 
        if (response.status != 200) {
            throw 'failed request'
        }
        if (response.data.success) return response.data.success;
        throw 'Not found'
    } catch (error) {
        //debugger
        throw error
    }
}

const CompleteSessionBySessionID = async (authenString, sessionID, result, problems, files, statusWork) => {
    try {
        debugger
        let formData = new FormData();
        // Loop through the array of file paths and append each file to the FormData object
        if (files != null){
            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                let filename = file.split('/').pop();
                let match = /\.(\w+)$/.exec(filename);
                let type = match ? `Text/${match[1]}` : `Text`;
                if (filename != '' && filename != null) {
                    formData.append('files', { uri: file, name: filename, type });
                }
            }
        }        

        formData.append('workContentId', sessionID);
        formData.append('result', result);
        formData.append('problems', problems);
        formData.append('statusWork', statusWork);


        let headers = {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer ' + authenString
        }
        let response = await axios.post(`${string.SERVER_NAME}user/add-workContent`, formData, {
            headers: headers,
            timeout: string.TIME_OUT
        })
        //debugger 
        if (response.status != 200) {
            throw 'failed request'
        }
        if (response.data.success) return response.data.success;
        throw 'Not found'
    } catch (error) {
        //debugger
        throw error
    }
}

const postUpdatePublicReport = async (authenString, sessionId) => {
    try {
        debugger
        let formData = new FormData();
        formData.append('sessionId', sessionId);
        let headers = { 
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer ' + authenString
        }
        let response = await axios.patch(`${string.SERVER_NAME}admin/update-public-session`, formData, {
            headers: headers,
            timeout: string.TIME_OUT
        })
        if (response.status != 200) {
            throw 'failed request'
        }
        if (response.data.success) { 
            if (response?.data?.result?.data == null) throw 'Not found'
            return response.data.result.data;
        }
        throw 'Not found'
    } catch (error) {
        //debugger        
        throw error
    }
}

export default {
    getSessionsByInstituteIDAndSessionID,
    getSessionsByInstituteIDAndSessionIDForManager,
    getAllRegisterBySessionID,
    updateSessionBySessionID, CompleteSessionBySessionID,
    postUpdatePublicReport
}

