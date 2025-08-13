import axios from "axios" 
import { images, colors, icons, fontSizes, string } from "../constants";

const getAllInstitute = async (authenString) => {
    try {  
        debugger
        let headers = {
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json'
            'Authorization': 'Bearer '+authenString
          }
          debugger
        let response = await axios.get(`${string.SERVER_NAME}user/infomation`,{
            headers: headers,
            timeout:string.TIME_OUT
          })  
        if(response.status != 200){
            throw 'failed request'
        }
        if(response.data.success){
            if(response.data.result == null) throw 'Not found'
            if(response.data.result.institute == null) throw 'Not found'
            let institute = response.data.result.institute;
            return institute                 
        }   
        throw 'Not found'
    } catch (error) {
        //debugger
        throw error
    }
} 

const getProvince = async (authenString) => {
    try {  
        debugger
        let headers = {
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json'
            'Authorization': 'Bearer '+authenString
          }
          debugger
        let response = await axios.get(`${string.SERVER_NAME}user/infomation`,{
            headers: headers,
            timeout:string.TIME_OUT
          })  
        if(response.status != 200){
            throw 'failed request'
        }
        if(response.data.success){
            if(response.data.result == null) throw 'Not found'
            if(response.data.result.institute == null) throw 'Not found'
            let institute = response.data.result.province;
            return institute                 
        }   
        throw 'Not found'
    } catch (error) {
        //debugger
        throw error
    }
} 

const getAllPressInstitute = async (authenString) => {
    try {  
        debugger
        let headers = {
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json'
            'Authorization': 'Bearer '+authenString
          }
          debugger
        let response = await axios.get(`${string.SERVER_NAME}user/infomation`,{
            headers: headers,
            timeout:string.TIME_OUT
          })  
        if(response.status != 200){
            throw 'failed request'
        }
        if(response.data.success){
            if(response.data.result == null) throw 'Not found'
            if(response.data.result.journaInstitute == null) throw 'Not found'
            let journaInstitute = response.data.result.journaInstitute;
            return journaInstitute                 
        }   
        throw 'Not found'
    } catch (error) {
        //debugger
        throw error
    }
} 

const getAllPressInstitutePublic = async (authenString) => {
    try {  
        debugger
        let headers = {
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json'
            'Authorization': 'Bearer '+authenString
          }
          debugger
        let response = await axios.get(`${string.SERVER_NAME}public/pvbc-list?province=&size=10000`,{
            headers: headers,
            timeout:string.TIME_OUT
          })  
        if(response.status != 200){
            throw 'failed request'
        }
        if(response.data.success){
            if(response.data.result == null) throw 'Not found'
            if(response.data.result.data == null) throw 'Not found'
            let journaInstitute = response.data.result.data;
            return journaInstitute                 
        }   
        throw 'Not found'
    } catch (error) {
        //debugger
        throw error
    }
} 

const postAddStrangePressInstitute = async (tokenString, nameInstitute, description, typeInstituteId, provinceId, address) => {
    try { 
        let formData  = new FormData();   
        
        nameInstitute && formData.append('nameInstitute', nameInstitute);     
        description && formData.append('description', description);  
        typeInstituteId && formData.append('typeInstituteId', typeInstituteId);
        provinceId && formData.append('provinceId', provinceId);
        address && formData.append('address', address);     
         
        let headers = {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer '+tokenString 
          }
        let response = await axios.post(`${string.SERVER_NAME}user/journalist-institute`, formData, { 
            headers: headers,
            timeout:string.TIME_OUT
          }) 
        debugger 
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

const getAllStrangePressInstitute = async (authenString) => {
    try {  
        debugger
        let headers = {
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json'
            'Authorization': 'Bearer '+authenString
          }
          debugger
        let response = await axios.get(`${string.SERVER_NAME}user/search-institute`,{
            headers: headers,
            timeout:string.TIME_OUT
          })  
        if(response.status != 200){
            throw 'failed request'
        }
        if(response.data.success){
            if(response.data.result == null) throw 'Not found'
            if(response.data.result.data == null) throw 'Not found' 
            return response.data.result.data                 
        }   
        throw 'Not found'
    } catch (error) {
        //debugger
        throw error
    }
} 

export default{
    getAllInstitute, getAllPressInstitute, getProvince, postAddStrangePressInstitute, getAllStrangePressInstitute, getAllPressInstitutePublic
}

