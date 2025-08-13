import axios from "axios"  
import { images, colors, icons, fontSizes, string } from "../constants";

const getAllJournalist = async (authenString, userType) => {
    try {  
        debugger 
        let headers = {
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json'
            'Authorization': 'Bearer '+authenString
          }
        let response = await axios.get(`${string.SERVER_NAME}user/data-journalist?proviceId=10&typeUsersId=${userType}&page=1&size=999999`, {
            headers: headers,
            timeout:string.TIME_OUT
          })
        //debugger 
        if(response.status != 200){
            throw 'failed request'
        }
        if(response.data.success){  
            if(response.data.result == null) throw 'Not found'
            if(response.data.result.data == null) throw 'Not found'
            return response.data.result.data;
        }   
        //debugger   
        throw 'Not found'
    } catch (error) {
        //debugger
        throw error
    }
}

const getAllJournalistWithInfo = async (authenString, userType, count, size) => {
    try {  
        debugger 
        let headers = {
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json'
            'Authorization': 'Bearer '+authenString
          }
        let response = await axios.get(`${string.SERVER_NAME}user/data-journalist?proviceId=10&typeUsersId=${userType}&page=${count}&size=${size}`, {
            headers: headers,
            timeout:string.TIME_OUT
          })
        //debugger 
        if(response.status != 200){
            throw 'failed request'
        }
        if(response.data.success){  
            return response.data.result.data;
        }   
        //debugger   
        throw 'Not found'
    } catch (error) {
        //debugger
        throw error
    }
}
const getAllJournalistByProvinceID = async (authenString, userType) => {
    try {  
        debugger 
        let headers = {
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json'
            'Authorization': 'Bearer '+authenString
          }
        let response = await axios.get(`${string.SERVER_NAME}user/data-journalist?proviceId=10&typeUsersId=${userType}&page=1&size=999999`, {
            headers: headers,
            timeout:string.TIME_OUT
          })
        //debugger 
        if(response.status != 200){
            throw 'failed request'
        }
        if(response.data.success){  
            return response.data.result.data;
        }   
        //debugger   
        throw 'Not found'
    } catch (error) {
        //debugger
        throw error
    }
} 

const getAllStrangeJournalist = async (authenString, userType) => {
    try {  
        debugger 
        let headers = {
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json'
            'Authorization': 'Bearer '+authenString
          }
        let response = await axios.get(`${string.SERVER_NAME}user/search-users?vanglai=1`, {
            headers: headers,
            timeout:string.TIME_OUT
          })
        //debugger 
        if(response.status != 200){
            throw 'failed request'
        }
        if(response.data.success){  
            return response.data.result.data;
        }   
        //debugger   
        throw 'Not found'
    } catch (error) {
        //debugger
        throw error
    }
}


const postAddStrangeJournalist = async (tokenString, files, name, instituteId, address, email, phone, journalistCard, pressCard,cccd) => {
    try { 
        let formData  = new FormData();   

        let filename = files.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`; 
        if(filename != '' && filename != null) formData.append('files', { uri: files, name: filename, type });

        filename = pressCard.split('/').pop();
        match = /\.(\w+)$/.exec(filename);
        type = match ? `image/${match[1]}` : `image`; 
        if(filename != '' && filename != null)  formData.append('pressCard', { uri: pressCard, name: filename, type });

        
        name && formData.append('name', name);     
        instituteId && formData.append('instituteId', instituteId);  
        address && formData.append('address', address);
        email && formData.append('email', email);
        phone && formData.append('phone', phone);  
        journalistCard && formData.append('journalistCard', journalistCard); 
        cccd && formData.append('cccd', cccd);  
        debugger
        let headers = {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer '+tokenString 
          }
        let response = await axios.post(`${string.SERVER_NAME}user/create-journalist`, formData, { 
            headers: headers,
            timeout:string.TIME_OUT
          }) 
         
        if(response.status != 200){
            throw 'failed request'
        } 
        if(response.data.success) return response.data.success;  
        throw 'Not found'
    } catch (error) {
        debugger
        throw error
    }
}

export default{
    getAllJournalist, getAllJournalistWithInfo, getAllJournalistByProvinceID, getAllStrangeJournalist, postAddStrangeJournalist
}
 
 