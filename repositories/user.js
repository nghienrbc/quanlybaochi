import axios from "axios"
import { string } from "../constants";
// import axios from "./axiosconfig";

axios.defaults.httpsAgent = {
  rejectUnauthorized: false,
};

const getLogout = async (tokenString, deviceType) => {
  try {
    debugger
    let headers = {
      // 'Accept': 'application/json',
      // 'Content-Type': 'application/json'
      'Authorization': 'Bearer ' + tokenString
    }
    //debugger
    let response = await axios.get(`${string.SERVER_NAME}user/logout?deviceType=${deviceType}`, {
      headers: headers,
      timeout: string.TIME_OUT
    })
    if (response.status != 200) {
      throw 'failed request'
    }
    if (response.data.success) {
      return response.data.success
    }
    throw 'Not found'
  } catch (error) {
    //debugger
    throw error
  }
}

const postFogotPassword = async (emailString) => {
  try {
    debugger
    let data = {
      email: emailString, 
    }
    // let headers = {
    //   // 'Accept': 'application/json',
    //   // 'Content-Type': 'application/json'
    //   'Authorization': 'Bearer ' + tokenString
    // }
    //debugger 
    let response = await axios.post(`${string.SERVER_NAME}users/fogot-password`, data, {
      // headers: headers,
      timeout: string.TIME_OUT
    })
    if (response.status != 200) {
      throw 'failed request'
    }
    if (response.data) {
      return response.data
    }
    throw 'Not found'
  } catch (error) {
    //debugger
    throw error
  }
}
const postVerifyCode = async (emailString, codeActive, passwordString) => {
  try {
    debugger
    let data = {
      email: emailString, 
      codeActive: codeActive,
      password: passwordString
    }
    // let headers = { 
    //   'Authorization': 'Bearer ' + tokenString
    // }
    //debugger 
    let response = await axios.post(`${string.SERVER_NAME}user/verify-code`, data, { 
      timeout: string.TIME_OUT
    })
    if (response.status != 200) {
      throw 'failed request'
    }
    if (response.data.success) {
      return response.data.success
    }
    throw 'Not found'
  } catch (error) {
    //debugger
    throw error
  }
}


const postLogin = async (email, password, deviceToken, deviceType) => { 

  try {
    debugger
    // axios.defaults.httpsAgent = {
    //   rejectUnauthorized: false,
    // };

    let data = {
      email: email,
      password: password,
      deviceToken: deviceToken,
      deviceType: deviceType
    }

    let headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      //  httpsAgent: { rejectUnauthorized: false }
    }
    console.log(headers.httpsAgent)
    let response = await axios.post(`${string.SERVER_NAME}user/login`, data, {
      headers: headers
    })
    // debugger 
    if (response.status != 200) {
      throw 'failed request'
    }
    if (response?.data?.success) {
      if (response?.data?.result?.code == 'WRONG_PASSWORD_ERROR') throw 'Wrong password'
      if (response?.data?.result?.code == 'USER_NOT_FOUND') throw 'Not found'
      return response.data.result.token;
    }
    // debugger   
    throw 'Not found'
  } catch (error) {
    debugger
    throw error
  }
}



const postUserDetail = async (tokenString, localUri, givenName, address, birthday, phone, seniority, journalistCard, pressCard) => {
  try {
    debugger
    let formData = new FormData();

    if (localUri != null && localUri != '' && localUri != 'https://mobile-quanlybaochi.quangbinh.gov.vn/api/v1/media/view/undefined/undefined') {
      let filename = localUri.split('/').pop();
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : `image`;
      if (filename != '' && filename != null) formData.append('files', { uri: localUri, name: filename, type });
    }

    if (pressCard != null && pressCard != '') {
      let filename = pressCard.split('/').pop();
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : `image`;
      if (filename != '' && filename != null) formData.append('pressCard', { uri: pressCard, name: filename, type });
    }

    formData.append('givenName', givenName);
    formData.append('address', address);
    formData.append('birthday', birthday);
    formData.append('phone', phone);
    formData.append('seniority', seniority);
    journalistCard != null && formData.append('journalistCard', journalistCard);
    let headers = {
      'Content-Type': 'multipart/form-data',
      'Authorization': 'Bearer ' + tokenString
    }
    debugger
    let response = await axios.post(`${string.SERVER_NAME}user/update-profile`, formData, {
      headers: headers,
      timeout: string.TIME_OUT
    })
    if (response.status != 200) {
      throw 'failed request'
    }
    if (response.data.success) {
      return response.data.success;
    }
    //debugger   
    throw 'Not found'
  } catch (error) {
    //debugger
    throw error
  }
}

const getUserDetail = async (tokenString) => {
  try {
    //debugger
    let headers = {
      // 'Accept': 'application/json',
      // 'Content-Type': 'application/json'
      'Authorization': 'Bearer ' + tokenString
    }
    //debugger
    let response = await axios.get(`${string.SERVER_NAME}user/init-info`, {
      headers: headers,
      timeout: string.TIME_OUT
    })
    if (response.status != 200) {
      throw 'failed request'
    }
    if (response.data.success) {
      if (response.data.result == null) throw 'Not found'
      let profile = response.data.result;
      return profile
    }
    throw 'Not found'
  } catch (error) {
    //debugger
    throw error
  }
}

const changePassword = async (tokenString, password, newpassword) => {
  try {
    // debugger
    const data = {
      password: password,
      newpassword: newpassword
    };
    let headers = {
      'Authorization': 'Bearer ' + tokenString
    };
    let response = await axios.post(`${string.SERVER_NAME}user/change-pass`, data, {
      headers: headers,
      timeout: string.TIME_OUT
    });
    if (response.status !== 200) {
      throw 'failed request';
    }
    if (response.data.success && response.data?.result?.token) {
      return response.data.result.token;
    }
    if (response.data.result.code) {
      throw "WRONG_PASSWORD_ERROR";
    }
    throw 'Not found';
  } catch (error) {
    throw error;
  }
};

export default {
  getUserDetail,
  postLogin,
  postUserDetail,
  getLogout,
  changePassword,
  postFogotPassword,
  postVerifyCode
}