import axios from "axios"
import { images, colors, icons, fontSizes, string } from "../constants";

const getAllAnnoucement = async (authenString) => {
    try {
        let headers = {
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json'
            'Authorization': 'Bearer ' + authenString
        }
        debugger
        let response = await axios.get(`${string.SERVER_NAME}user/data-announcements?provinceId=1&page=1&size=999999`, {
            headers: headers,
            timeout: string.TIME_OUT
        })
        if (response.status != 200) {
            throw 'failed request'
        }
        if (response.data.success) {
            //if(response.data.result == null) throw 'Not found'
            //if(response.data.result.data == null) throw 'Not found'
            if (response.data.result.data !== null) {
                let annoucement = response.data.result.data;
                return annoucement
            }
            //return response.data.result.code
        }
        throw 'Not found'
    } catch (error) {
        //debugger
        throw error
    }
}


const postAnnoucement = async (authenString, isSelected, selectedInstituteID, title, content, thumbnail, files) => {
    try { 
        debugger
        let formData = new FormData();
        if (thumbnail != '') {
            let filename = thumbnail.split('/').pop();
            let match = /\.(\w+)$/.exec(filename);
            let type = match ? `image/${match[1]}` : `image`;
            if (filename != '' && filename != null) formData.append('thumbnail', { uri: thumbnail, name: filename, type });
        }

        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let filename = file.split('/').pop();
            let match = /\.(\w+)$/.exec(filename);
            let type = match ? `Text/${match[1]}` : `Text`;
            if (filename != '' && filename != null) {
                formData.append('files', { uri: file, name: filename, type });
            }
        } 

        formData.append('provinceId', 1);
        if (isSelected == false) formData.append('instituteId', JSON.stringify(selectedInstituteID));
        formData.append('title', title);
        formData.append('content', content);
 
        let headers = {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer ' + authenString
        }
        let response = await axios.post(`${string.SERVER_NAME}user/create-announcements`, formData, {
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


const postUpdateAnnoucement = async (authenString, Id, isSelected, instituteId, title, content, thumbnail, files) => {
    try { 
        debugger
        let formData = new FormData();
        if (thumbnail != null) {
            let filename = thumbnail.split('/').pop();
            let match = /\.(\w+)$/.exec(filename);
            let type = match ? `image/${match[1]}` : `image`;
            if (filename != '' && filename != null) formData.append('thumbnail', { uri: thumbnail, name: filename, type });
        }

        if (files != null) {
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

        formData.append('provinceId', 1);
        formData.append('id', Id);
        if (isSelected == false) formData.append('instituteId', JSON.stringify(instituteId));
        formData.append('title', title);
        formData.append('content', content);

        let headers = {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer ' + authenString
        }
        let response = await axios.post(`${string.SERVER_NAME}user/update-announcements`, formData, {
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

export default {
    getAllAnnoucement, postAnnoucement, postUpdateAnnoucement
}

