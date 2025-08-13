import axios from "axios"
import { images, colors, icons, fontSizes, string } from "../constants";

const getAllRequireInfoManage = async (authenString,fromWorkDate, toWorkDate) => {
    try {
        // debugger
        let headers = {
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json'
            'Authorization': 'Bearer ' + authenString
        }
        let response = await axios.get(`${string.SERVER_NAME}manager/data-work-claim?page=1&size=999999&fromdatework=${fromWorkDate}&todatework=${toWorkDate}`, {
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
const getAllRequireInfo = async (authenString) => {
    try {
        // debugger
        let headers = {
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json'
            'Authorization': 'Bearer ' + authenString
        }
        let response = await axios.get(`${string.SERVER_NAME}user/data-claim?page=1&size=999999`, {
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

const postCreateRequireInfo = async (tokenString, instituteId, title, content, files) => {
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

        formData.append('instituteId', instituteId);

        formData.append('title', title);
        formData.append('content', content);
        let headers = {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer ' + tokenString
        }

        let response = await axios.post(`${string.SERVER_NAME}user/create-claim`, formData, {
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

const patchUpdateRequireInfo = async (authenString, id, instituteId, title, content, files) => {
    try {
        let formData = new FormData();

        let filename = files.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;
        if (filename != '' && filename != null) formData.append('files', { uri: files, name: filename, type });

        formData.append('id', id);
        formData.append('instituteId', instituteId);
        if (title != null) formData.append('title', title);
        formData.append('content', content);

        //debugger
        let headers = {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer ' + authenString
        }
        let response = await axios.patch(`${string.SERVER_NAME}user/update-claim`, formData, {
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

const postConfirmRequireInfo = async (tokenString, claimId, content, apointment, apointmentDate, status, files) => {
    try {
        // debugger
        let formData = new FormData();
        if (status != 0) { // nếu không hủy yêu cầu
            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                let filename = file.split('/').pop();
                let match = /\.(\w+)$/.exec(filename);
                let type = match ? `Text/${match[1]}` : `Text`; 
                if (filename != '' && filename != null) {
                  formData.append('files', { uri: file, name: filename, type });
                }
              }
            
            if (apointment == true) {
                formData.append('apointment', apointment);
                formData.append('apointmentDate', apointmentDate);
            }
        }

        claimId && formData.append('claimId', claimId);
        formData.append('content', content);
        formData.append('status', status);

        let headers = {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer ' + tokenString
        }
        let response = await axios.post(`${string.SERVER_NAME}user/confirm-claimback`, formData, {
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

const patchUpdateConfirmRequireInfo = async (authenString, claimConfimId, content, apointment, apointmentDate, files) => {
    try {
        let formData = new FormData();

        let filename = files.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;
        if (filename != '' && filename != null) formData.append('files', { uri: files, name: filename, type });

        formData.append('claimConfimId', claimConfimId);
        formData.append('content', content);
        if (apointment == true) {
            formData.append('apointment', apointment);
            formData.append('apointmentDate', apointmentDate);
        }

        //debugger
        let headers = {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer ' + authenString
        }
        let response = await axios.patch(`${string.SERVER_NAME}user/update-claimback`, formData, {
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
const deleteRequireInfoJournalist = async (authenString , id) => {
    try {
        let formData = new FormData();
        formData.append('id', id);
        // debugger
        let headers = {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer ' + authenString
        }

        let response = await axios.post(`${string.SERVER_NAME}user/delete-claim`, formData, {
            headers: headers,
            timeout: string.TIME_OUT
        });
        // debugger
        if (response.status != 200) {
            throw 'failed request'
        }
        // debugger
        if (response.data.success) return response.data.success;
        throw 'Not found'
    } catch (error) {
        //debugger
        throw error
    }
};

export default {
    getAllRequireInfoManage,getAllRequireInfo, postCreateRequireInfo, patchUpdateRequireInfo, postConfirmRequireInfo, patchUpdateConfirmRequireInfo,deleteRequireInfoJournalist 
}

