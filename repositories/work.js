import axios from "axios" 
import { images, colors, icons, fontSizes, string } from "../constants";

const getAllWorkRegistrationManage = async (authenString, fromWorkDate, toWorkDate) => {
  try {  
      // debugger 
      let headers = {
          // 'Accept': 'application/json',
          // 'Content-Type': 'application/json'
          'Authorization': 'Bearer '+authenString
        }
      let response = await axios.get(`${string.SERVER_NAME}manager/data-work-register?page=1&size=999999&fromdatework=${fromWorkDate}&todatework=${toWorkDate}`, {
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

const getAllWorkRegistration = async (authenString) => {
    try {  
        // debugger 
        let headers = { 
            'Authorization': 'Bearer '+authenString
          }
        let response = await axios.get(`${string.SERVER_NAME}user/data-work?page=1&size=999999`, {
            headers: headers,
            timeout:string.TIME_OUT
          }) 
        if(response.status != 200){
            throw 'failed request'
        }
        if(response.data.success){  
            if(response.data.result == null) throw 'Not found'
            if(response.data.result.data == null) throw 'Not found'
            return response.data.result.data;
        }      
        throw 'Not found'
    } catch (error) {       
        throw error
    }
}

const postWorkRegistration = async (tokenString, instituteId, sessionID, title, content, workingday, direct, periodic, incident, files, userdirectId) => {
    try {  
        debugger
        let formData  = new FormData();   
        // Loop through the array of file paths and append each file to the FormData object
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

        if (sessionID != 0) formData.append('sessionId', sessionID);
        formData.append('title', title);
        formData.append('content', content);
        formData.append('workingday', workingday);
        if(direct == true){
            formData.append('direct', direct);
            formData.append('userdirectId', userdirectId);
        } 
        formData.append('periodic', periodic);
        formData.append('incident', incident);

        let headers = {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer '+tokenString 
        }
 
        let response = await axios.post(`${string.SERVER_NAME}user/work-register`, formData, {
            headers: headers,
            timeout:string.TIME_OUT
          }) 
        //debugger 
        if(response.status != 200){
            throw 'failed request'
        }
        if(response.data.success && response.data.result =="CREATE_SUCCESS") return response.data.success;
        //debugger   
        throw 'Not found'
    } catch (error) {
        //debugger
        throw error
    }
}

const postWorkApoiment = async (authenString, id, otherDay, titleSession, contentApointment, reason, status, files, sessionId) => {
    try { 
        let formData  = new FormData();   
        if  (files != null){
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
         
        formData.append('id', id);
        otherDay && formData.append('otherDay', otherDay);        
        if(titleSession != null) formData.append('titleSession', titleSession);
        formData.append('contentApointment', contentApointment);
        if(reason !== null && reason !== '') formData.append('reason', reason);
        formData.append('status', status); 
        formData.append('sessionId', sessionId);
               
        //debugger
        let headers = {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer ' + authenString 
          }
        let response = await axios.post(`${string.SERVER_NAME}user/apointment-work`, formData, {
            headers: headers,
            timeout:string.TIME_OUT
          }) 
        //debugger 
        if(response.status != 200){
            throw 'failed request'
        } 
        if(response.data.success) return response.data.success;  
        throw 'Not found'
    } catch (error) {
        //debugger
        throw error
    }
}

const getAllWorkInvite = async (authenString) => {
    try {  
        // debugger 
        let headers = {
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json'
            'Authorization': 'Bearer '+authenString
          }
        let response = await axios.get(`${string.SERVER_NAME}user/data-invite?page=1&size=999999`, {
            headers: headers,
            timeout:string.TIME_OUT
          })
        // debugger 
        if(response.status != 200){
            throw 'failed request'
        }
        if(response.data.success){  
            if(response.data.result == null) throw 'Not found'
            if(response.data.result.data == null) throw 'Not found'
            return response.data.result.data;
        }   
        // debugger   
        throw 'Not found'
    } catch (error) {
        // debugger        
        throw error
    }
}

const getAllWorkInviteForJournalist = async (authenString) => {
    try {  
        //debugger 
        let headers = {
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json'
            'Authorization': 'Bearer '+authenString
          }
        let response = await axios.get(`${string.SERVER_NAME}user/data-letter-invite?page=1&size=999999`, {
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
const postWorkInvite = async (tokenString, usersId, instituteId, titleInvite, contentInvite, dateInvite, files) => {
  try { 
    let formData  = new FormData();   
  // debugger
    // Loop through the array of file paths and append each file to the FormData object
    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      let filename = file.split('/').pop();
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `Text/${match[1]}` : `Text`; 
      if (filename != '' && filename != null) {
        formData.append('files', { uri: file, name: filename, type });
      }
    }
  
    formData.append('usersId', JSON.stringify(usersId));
    instituteId && formData.append('instituteId', instituteId);     
    formData.append('titleInvite', titleInvite);
    formData.append('contentInvite', contentInvite);
    dateInvite && formData.append('dateInvite', dateInvite);     
     
    let headers = {
      'Content-Type': 'multipart/form-data',
      'Authorization': 'Bearer '+tokenString 
    }
  
    let response = await axios.post(`${string.SERVER_NAME}user/create-invite`, formData, { 
      headers: headers,
      timeout:string.TIME_OUT
    }) 
    // debugger
    if(response.status != 200){
      throw 'failed request'
    } 
  
    if(response.data.success) return response.data.success;  
    throw 'Not found'
  } catch (error) {
      // debugger
    throw error
  }
}
const postConfimInvite = async (tokenString, idDetailInvite, content, status) => {
    try {  
        let formData  = new FormData();   
        formData.append('id', JSON.stringify(idDetailInvite)); 
        content && formData.append('content', content);     
        formData.append('status', status);   
         
        let headers = {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer '+tokenString 
          }
        let response = await axios.post(`${string.SERVER_NAME}user/confirm-invite`, formData, { 
            headers: headers,
            timeout:string.TIME_OUT
          }) 
        // debugger
        if(response.status != 200){
            throw 'failed request'
        } 
        if(response.data.success) return response.data.success;  
        throw 'Not found'
    } catch (error) {
        // debugger
        throw error
    }
}
const postUpdateInvite = async (tokenString, idInvite, usersId, titleInvite, contentInvite, dateInvite, files, actived, reasonCancel) => {
    try { 
        // debugger
        let formData  = new FormData();  
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
 
        formData.append('id', JSON.stringify(idInvite));
        if(actived != 0){
            formData.append('usersId', JSON.stringify(usersId));
            //instituteId && formData.append('instituteId', instituteId);     
            formData.append('titleInvite', titleInvite);
            formData.append('contentInvite', contentInvite);
            dateInvite && formData.append('dateInvite', dateInvite);    
        }
        else{
            formData.append('actived', actived);      
            reasonCancel && formData.append('reasonCancel', reasonCancel);  
        }   
         
        let headers = {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer '+tokenString 
          }
        let response = await axios.post(`${string.SERVER_NAME}user/update-invite`, formData, { 
            headers: headers,
            timeout: string.TIME_OUT
          })  
        if(response.status != 200){
            throw 'failed request'
        } 
        if(response.data.success) return response.data.success;  
        throw 'Not found'
    } catch (error) {
        // debugger
        throw error
    }
}
const postFinishWorkInvite = async (tokenString, idInvite, contentSession, files) => {
    try { 
        let formData  = new FormData();  
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let filename = file.split('/').pop();
            let match = /\.(\w+)$/.exec(filename);
            let type = match ? `Text/${match[1]}` : `Text`; 
            if (filename != '' && filename != null) {
              formData.append('files', { uri: file, name: filename, type });
            }
          }
 
        formData.append('id', JSON.stringify(idInvite));    
        formData.append('contentSession', contentSession);    
         
        let headers = {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer '+tokenString 
          }
        let response = await axios.post(`${string.SERVER_NAME}user/finish-work-invite`, formData, { 
            headers: headers,
            timeout:string.TIME_OUT
          }) 
        // debugger 
        if(response.status != 200){
            throw 'failed request'
        } 
        if(response.data.success) return response.data.success;  
        throw 'Not found'
    } catch (error) {
        // debugger
        throw error
    }
}
const getWorkProvideForJournalist = async (authenString) => {
  try {  
    debugger 
    let headers = {
          // 'Accept': 'application/json',
          // 'Content-Type': 'application/json'
          'Authorization': 'Bearer '+authenString
        }
      let response = await axios.get(`${string.SERVER_NAME}user/data-provide?page=1&size=999999`, {
          headers: headers,
          timeout:string.TIME_OUT
        })
        debugger 
      if(response.status != 200){
          throw 'failed request'
      }
      if(response.data.success){  
          if(response.data.result == null) throw 'Not found'
          if(response.data.result.data == null) throw 'Not found'
          return response.data.result.data;
      }   
      debugger   
      throw 'Not found'
    } catch (error) {
      debugger        
      throw error
    }
}
const getWorkProvideManage = async (authenString, fromWorkDate, toWorkDate) => {
  try {  
      // debugger 
      let headers = {
          // 'Accept': 'application/json',
          // 'Content-Type': 'application/json'
          'Authorization': 'Bearer '+authenString
        }
      let response = await axios.get(`${string.SERVER_NAME}system/data-provide?page=1&size=999999&states=completed&fromDate=${fromWorkDate}&toDate=${toWorkDate}`, {
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
const getWorkProvide = async (authenString) => {
  try {  
    debugger 
    let headers = {
          // 'Accept': 'application/json',
          // 'Content-Type': 'application/json'
          'Authorization': 'Bearer '+authenString
        }
      let response = await axios.get(`${string.SERVER_NAME}provide/data-provide?page=1&size=999999`, {
          headers: headers,
          timeout:string.TIME_OUT
        })
        debugger 
      if(response.status != 200){
          throw 'failed request'
      }
      if(response.data.success){  
          if(response.data.result == null) throw 'Not found'
          if(response.data.result.data == null) throw 'Not found'
          return response.data.result.data;
      }   
      debugger   
      throw 'Not found'
    } catch (error) {
      debugger        
      throw error
    }
}
const postWorkProvide = async (tokenString, sendTo, title, content, files, states ) => {
  try { 
    let formData  = new FormData();   
  debugger
    // Loop through the array of file paths and append each file to the FormData object
    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      let filename = file.split('/').pop();
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `Text/${match[1]}` : `Text`; 
      if (filename != '' && filename != null) {
        formData.append('files', { uri: file, name: filename, type });
      }
    }
    debugger
    formData.append('sendTo', JSON.stringify(sendTo));   
    formData.append('title', title);
    formData.append('content', content);  
    formData.append('states', states);
    let headers = {
      'Content-Type': 'multipart/form-data',
      'Authorization': 'Bearer '+tokenString 
    }
    debugger
    let response = await axios.post(`${string.SERVER_NAME}provide/send-data-users`, formData, { 
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
      // debugger
    throw error
  }
}

const postWorkProvideUpdate = async (tokenString, id, sendTo, title, content, files, states) => {
  try {
    let formData = new FormData();
    debugger
    // Loop through the array of file paths and append each file to the FormData object
    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      let filename = file.split('/').pop();
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `Text/${match[1]}` : `Text`;
      if (filename != '' && filename != null) {
        formData.append('files', { uri: file, name: filename, type });
      }
    }
    debugger
    formData.append('id', id); // Add the id field here
    formData.append('sendTo', JSON.stringify(sendTo));
    formData.append('title', title);
    formData.append('content', content);
    formData.append('states', states);

    let headers = {
      'Content-Type': 'multipart/form-data',
      'Authorization': 'Bearer ' + tokenString
    }
    debugger
    let response = await axios.post(`${string.SERVER_NAME}provide/send-data-users`, formData, {
      headers: headers,
      timeout: string.TIME_OUT
    })
    debugger
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

const deleteProvideInfoAgencies = async (authenString , id) => {
  try {
      let formData = new FormData();
      formData.append('id', id);
      // debugger
      let headers = {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer ' + authenString
      }
      let response = await axios.post(`${string.SERVER_NAME}provide/delete-provide/${id}`, formData, {
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
const deleteProvideInfoJounalist = async (authenString , id) => {
  try {
      let formData = new FormData();
      formData.append('id', id);
      // debugger
      let headers = {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer ' + authenString
      }

      let response = await axios.post(`${string.SERVER_NAME}provide/delete-pv-provide/${id}`, formData, {
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
export default{
    getAllWorkRegistration,getAllWorkRegistrationManage, postWorkRegistration, 
    postWorkApoiment, postWorkInvite , getAllWorkInvite, getAllWorkInviteForJournalist,
    postConfimInvite, postUpdateInvite, postFinishWorkInvite,postWorkProvide,getWorkProvide,getWorkProvideManage,
    getWorkProvideForJournalist,deleteProvideInfoAgencies,deleteProvideInfoJounalist,postWorkProvideUpdate
  }
  
  