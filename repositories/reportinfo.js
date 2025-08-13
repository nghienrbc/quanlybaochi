import axios from "axios"
import { images, colors, icons, fontSizes, string } from "../constants";
import { isCancel } from "react-native-document-picker";

const getAllReportInfo = async (authenString, fromWorkDate, toWorkDate) => {
    try {
        debugger
        let headers = {
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json'
            'Authorization': 'Bearer ' + authenString
        }
        let response = await axios.get(`${string.SERVER_NAME}complain/data-complain?page=1&size=999999&fromDate=${fromWorkDate}&toDate=${toWorkDate}`, {
            headers: headers,
            timeout: string.TIME_OUT
        })
        if (response.status != 200) {
            throw 'failed request'
        }
        if (response.data.success) {
            if (response.data.result == null) throw 'Not found'
            if (response.data.result.data == null) throw 'Not found'
            return response.data.result.data;
        }
        throw 'Not found'
    } catch (error) {
        //debugger        
        throw error
    }
}

const postCreateOrUpdateReportInfo = async (tokenString, id, title, content, files) => {
    try {
        debugger
        let formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let filename = file.split('/').pop();
            let match = /\.(\w+)$/.exec(filename);
            let type = match ? `Text/${match[1]}` : `Text`;
            if (filename != '' && filename != null) {
                formData.append('files', { uri: file, name: filename, type });
            }
        }

        if (id) formData.append('id', id);
        formData.append('title', title);
        formData.append('content', content);
        formData.append('toInstitute', 73);
        let headers = {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer ' + tokenString
        }

        let response = await axios.post(`${string.SERVER_NAME}complain/send-complain`, formData, {
            headers: headers,
            timeout: string.TIME_OUT
        })
        // debugger 
        if (response.status != 200) {
            throw 'failed request'
        }
        if (response.data.success) return response.data.success;
        // debugger   
        throw 'Not found'
    } catch (error) {
        // debugger
        throw error
    }
}

const postConfirmOrUpdateReportInfo = async (tokenString, feedbackId, complainId, content, files) => {
    try {
        // debugger
        let formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let filename = file.split('/').pop();
            let match = /\.(\w+)$/.exec(filename);
            let type = match ? `Text/${match[1]}` : `Text`;
            if (filename != '' && filename != null) {
                formData.append('files', { uri: file, name: filename, type });
            }
        }

        feedbackId && formData.append('id', feedbackId);
        complainId && formData.append('complainId', complainId);
        formData.append('content', content);

        let headers = {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer ' + tokenString
        }
        let response = await axios.post(`${string.SERVER_NAME}system/confirm-complain`, formData, {
            headers: headers,
            timeout: string.TIME_OUT
        })
        // debugger
        if (response.status != 200) {
            throw 'failed request'
        }
        if (response.data.success) return response.data.success;
        throw 'Not found'
    } catch (error) {
        // debugger
        throw error
    }
}

const postDeleteReportInfo = async (authenString, isManage, id) => {
    try { 
        debugger
        let headers = { 
            'Accept': 'application/json',
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': 'Bearer ' + authenString
        }

        let routePartString = isManage ? 'system' : 'complain'
        // let apiString = `${string.SERVER_NAME}${routePartString}/delete-complain/${id}`
        let response = await axios.post(`${string.SERVER_NAME}${routePartString}/delete-complain/${id}`, {
            headers: headers,
            timeout: string.TIME_OUT
        }); 
        if (response.status != 200) {
            throw 'failed request'
        } 
        if (response.data.success) return response.data.success;
        throw 'Not found'
    } catch (error) { 
        throw error
    }
};


const postUpdatePublicReport = async (authenString, complainId) => {
    try {
        debugger
        let formData = new FormData();
        formData.append('complainId', complainId);
        let headers = {
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json'
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer ' + authenString
        }
        let response = await axios.post(`${string.SERVER_NAME}admin/update-public-complain`, formData, {
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
    getAllReportInfo,
    postCreateOrUpdateReportInfo,
    postConfirmOrUpdateReportInfo,
    postDeleteReportInfo,
    postUpdatePublicReport
}

