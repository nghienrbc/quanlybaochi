import axios from "axios" 
import { string } from "../constants";


///////////////////// FOR MANAGER ////////////////////////////////
// thống kê tổng thể đăng ký làm việc
const getRegistrationStatictisManage = async (authenString, fromRegisterDate,  toRegisterDate, vanglai) => {
    try {  
        debugger 
        let headers = {
            'Authorization': 'Bearer '+authenString
          }
          const apiString = `${string.SERVER_NAME}admin/count-work-register?fromRegisterDate=${fromRegisterDate}&toRegisterDate=${toRegisterDate}`.concat(vanglai != 2 
            ? `&vanglai=${vanglai}` : ``)
        let response = await axios.get(apiString, {
            headers: headers,
            timeout:string.TIME_OUT
          }) 
        if(response.status != 200){
            throw 'failed request'
        }
        if(response.data.success){   
            if(response.data.result == null) throw 'Not found' 
            return response.data.result;
        }    
        throw 'Not found'
    } catch (error) { 
        throw error
    }
} 

// thống kê tổng thể yêu cầu thông tin
const getStatictisRequireManage = async (authenString, fromRegisterDate,  toRegisterDate) => {
    try {  
        debugger 
        let headers = {
            'Authorization': 'Bearer '+authenString 
          }
          const apiString = `${string.SERVER_NAME}admin/count-work-claim?fromRegisterDate=${fromRegisterDate}&toRegisterDate=${toRegisterDate}`
        let response = await axios.get(apiString, {
            headers: headers,
            timeout:string.TIME_OUT
          }) 
        if(response.status != 200){
            throw 'failed request'
        }
        if(response.data.success){   
            if(response.data.result == null) throw 'Not found' 
            return response.data.result;
        }    
        throw 'Not found'
    } catch (error) { 
        throw error
    }
}  

// thống kê đăng ký làm việc theo quận huyện
const getRegistrationStatictisByProvinceFromManage = async (authenString, fromRegisterDate,  toRegisterDate, vanglai) => {
    try {  
        debugger 
        let headers = {
            'Authorization': 'Bearer '+authenString
          } 
          const apiString = `${string.SERVER_NAME}admin/report-register-cqbc?fromRegisterDate=${fromRegisterDate}&toRegisterDate=${toRegisterDate}`.concat(vanglai != 2 
          ? `&vanglai=${vanglai}` : ``)
        let response = await axios.get(apiString, {
            headers: headers,
            timeout:string.TIME_OUT
          }) 
        if(response.status != 200){
            throw 'failed request'
        }
        if(response.data.success){   
            if(response.data.result == null) throw 'Not found' 
            return response.data.result;
        }    
        throw 'Not found'
    } catch (error) { 
        throw error
    }
}

// thống kê yêu cầu thông tin theo quận huyện
const getRequireStatictisByProvinceFromManage = async (authenString, fromRegisterDate,  toRegisterDate) => {
    try {  
        debugger 
        let headers = {
            'Authorization': 'Bearer '+authenString
          } 
          const apiString = `${string.SERVER_NAME}admin/report-claim-all?fromRegisterDate=${fromRegisterDate}&toRegisterDate=${toRegisterDate}`
          
        let response = await axios.get(apiString, {
            headers: headers,
            timeout:string.TIME_OUT
          }) 
        if(response.status != 200){
            throw 'failed request'
        }
        if(response.data.success){   
            if(response.data.result == null) throw 'Not found' 
            return response.data.result;
        }    
        throw 'Not found'
    } catch (error) { 
        throw error
    }
}

///////////////////// FOR INSTITUTE ////////////////////////////////
// thống kê đăng ký làm việc tổng thể
const getStatictisInstituteFromInstitute = async (authenString, fromRegisterDate,  toRegisterDate) => {
    try {  
        debugger 
        let headers = {
            'Authorization': 'Bearer '+authenString
          }
          const apiString = `${string.SERVER_NAME}report/cqnn-register-status?fromRegisterDate=${fromRegisterDate}&toRegisterDate=${toRegisterDate}`
        let response = await axios.get(apiString, {
            headers: headers,
            timeout:string.TIME_OUT
          }) 
        if(response.status != 200){
            throw 'failed request'
        }
        if(response.data.success){   
            if(response.data.result == null) throw 'Not found' 
            return response.data.result;
        }    
        throw 'Not found'
    } catch (error) { 
        throw error
    }
} 

// thống kê đăng ký làm việc theo cơ quan báo chí
const getStatictisPressAgencyFromInstitute = async (authenString, fromRegisterDate,  toRegisterDate) => {
    try {  
        debugger 
        let headers = {
            'Authorization': 'Bearer '+authenString
          }
          const apiString = `${string.SERVER_NAME}report/cqnn-register-cqbc?fromRegisterDate=${fromRegisterDate}&toRegisterDate=${toRegisterDate}`
        let response = await axios.get(apiString, {
            headers: headers,
            timeout:string.TIME_OUT
          }) 
        if(response.status != 200){
            throw 'failed request'
        }
        if(response.data.success){   
            if(response.data.result == null) throw 'Not found' 
            return response.data.result;
        }    
        throw 'Not found'
    } catch (error) { 
        throw error
    }   
} 

// thống kê đăng ký làm việc theo phóng viên
const getStatictisJounalistFromInstitute = async (authenString, fromRegisterDate,  toRegisterDate) => {
    try {  
        debugger 
        let headers = {
            'Authorization': 'Bearer '+authenString
          }
          const apiString = `${string.SERVER_NAME}report/cqnn-register-pv?fromRegisterDate=${fromRegisterDate}&toRegisterDate=${toRegisterDate}`
        let response = await axios.get(apiString, {
            headers: headers,
            timeout:string.TIME_OUT
          }) 
        if(response.status != 200){
            throw 'failed request'
        }
        if(response.data.success){   
            if(response.data.result == null) throw 'Not found' 
            return response.data.result;
        }    
        throw 'Not found'
    } catch (error) { 
        throw error
    }
} 

// thống kê tổng thể yêu cầu cung cấp thông tin của cơ quan nhà nước
const getStatictisRequireFromInstitute = async (authenString, fromRegisterDate,  toRegisterDate) => {
    try {  
        debugger 
        let headers = {
            'Authorization': 'Bearer '+authenString
          } 
          const apiString = `${string.SERVER_NAME}report/report-claim?fromRegisterDate=${fromRegisterDate}&toRegisterDate=${toRegisterDate}`
          //console.warn(apiString)
        let response = await axios.get(apiString, {
            headers: headers,
            timeout:string.TIME_OUT
          }) 
        if(response.status != 200){
            throw 'failed request'
        }
        if(response.data.success){   
            if(response.data.result == null) throw 'Not found' 
            return response.data.result;
        }    
        throw 'Not found'
    } catch (error) { 
        throw error
    }
}  

// thống kê yêu cầu cung cấp thông tin theo từng cơ quan báo chí (Từ cơ quan nhà nước)
const getStatictisPressAgencyRequireFromInstitute = async (authenString, fromRegisterDate,  toRegisterDate) => {
    try {  
        debugger 
        let headers = {
            'Authorization': 'Bearer '+authenString
          } 
          const apiString = `${string.SERVER_NAME}report/report-claim-dv?fromRegisterDate=${fromRegisterDate}&toRegisterDate=${toRegisterDate}`
          //console.warn(apiString)
        let response = await axios.get(apiString, {
            headers: headers,
            timeout:string.TIME_OUT
          }) 
        if(response.status != 200){
            throw 'failed request'
        }
        if(response.data.success){   
            if(response.data.result == null) throw 'Not found' 
            return response.data.result;
        }    
        throw 'Not found'
    } catch (error) { 
        throw error
    }
}  

// thống kê yêu cầu cung cấp thông tin theo từng phóng viên (Từ cơ quan nhà nước)
const getStatictisJournalistRequireFromInstitute = async (authenString, fromRegisterDate,  toRegisterDate) => {
    try {  
        debugger 
        let headers = {
            'Authorization': 'Bearer '+authenString
          } 
          const apiString = `${string.SERVER_NAME}report/report-claim-pv?fromRegisterDate=${fromRegisterDate}&toRegisterDate=${toRegisterDate}`
          //console.warn(apiString)
        let response = await axios.get(apiString, {
            headers: headers,
            timeout:string.TIME_OUT
          }) 
        if(response.status != 200){
            throw 'failed request'
        }
        if(response.data.success){   
            if(response.data.result == null) throw 'Not found' 
            return response.data.result;
        }    
        throw 'Not found'
    } catch (error) { 
        throw error
    }
}  
/////////////////////////////////////// FOR STRANGE REGISTER FROM INSTITUTE ////////////////////////////////
// thống kê đăng ký vãng lai theo đơn vị báo chí vãng lại
const getStatictisStrangeRegisterFromInstitute = async (authenString, fromRegisterDate,  toRegisterDate) => {
    try {  
        debugger 
        let headers = {
            'Authorization': 'Bearer '+authenString
          } 
          const apiString = `${string.SERVER_NAME}report/cqnn-guest?fromRegisterDate=${fromRegisterDate}&toRegisterDate=${toRegisterDate}&type=1`
          //console.warn(apiString)
        let response = await axios.get(apiString, {
            headers: headers,
            timeout:string.TIME_OUT
          }) 
        if(response.status != 200){
            throw 'failed request'
        }
        if(response.data.success){   
            if(response.data.result == null) throw 'Not found' 
            return response.data.result;
        }    
        throw 'Not found'
    } catch (error) { 
        throw error
    }   
} 

// thống kê đăng ký vãng lai theo phóng viên vãng lại
const getStatictisStrangeRegisterFromJournalist = async (authenString, fromRegisterDate,  toRegisterDate) => {
    try {  
        debugger 
        let headers = {
            'Authorization': 'Bearer '+authenString
          } 
          const apiString = `${string.SERVER_NAME}report/cqnn-guest?fromRegisterDate=${fromRegisterDate}&toRegisterDate=${toRegisterDate}&type=0`
          //console.warn(apiString)
        let response = await axios.get(apiString, {
            headers: headers,
            timeout:string.TIME_OUT
          }) 
        if(response.status != 200){
            throw 'failed request'
        }
        if(response.data.success){   
            if(response.data.result == null) throw 'Not found' 
            return response.data.result;
        }    
        throw 'Not found'
    } catch (error) { 
        throw error
    }   
} 

////////////////////////////// FOR JOURNALIST ////////////////////////////////
/////////// thông kê đăng ký làm việc tổng thể của phóng viên
const getStatictisWorkRegisterFromJournalist = async (authenString, fromRegisterDate,  toRegisterDate) => {
    try {  
        debugger 
        let headers = {
            'Authorization': 'Bearer '+authenString
          } 
          const apiString = `${string.SERVER_NAME}report/register-work-users?fromRegisterDate=${fromRegisterDate}&toRegisterDate=${toRegisterDate}`
          //console.warn(apiString)
        let response = await axios.get(apiString, {
            headers: headers,
            timeout:string.TIME_OUT
          }) 
        if(response.status != 200){
            throw 'failed request'
        }
        if(response.data.success){   
            if(response.data.result == null) throw 'Not found' 
            return response.data.result;
        }    
        throw 'Not found'
    } catch (error) { 
        throw error
    }
} 
// thống kê đăng ký làm việc với các đơn vị nhà nước của phóng viên
const getStatictisWorkRegisterWithInstituteFromJournalist = async (authenString, fromRegisterDate,  toRegisterDate) => {
    try {  
        debugger 
        let headers = {
            'Authorization': 'Bearer '+authenString
          } 
          const apiString = `${string.SERVER_NAME}report/users-register-cqnn?fromRegisterDate=${fromRegisterDate}&toRegisterDate=${toRegisterDate}`
          //console.warn(apiString)
        let response = await axios.get(apiString, {
            headers: headers,
            timeout:string.TIME_OUT
          }) 
        if(response.status != 200){
            throw 'failed request'
        }
        if(response.data.success){   
            if(response.data.result == null) throw 'Not found' 
            return response.data.result;
        }    
        throw 'Not found'
    } catch (error) { 
        throw error
    }
} 

// thống kê tổng thể yêu cầu cung cấp thông tin của phóng viên
const getStatictisRequireFromJournalist = async (authenString, fromRegisterDate,  toRegisterDate) => {
    try {  
        debugger 
        let headers = {
            'Authorization': 'Bearer '+authenString
          } 
          const apiString = `${string.SERVER_NAME}report/claim-users?fromRegisterDate=${fromRegisterDate}&toRegisterDate=${toRegisterDate}`
          //console.warn(apiString)
        let response = await axios.get(apiString, {
            headers: headers,
            timeout:string.TIME_OUT
          }) 
        if(response.status != 200){
            throw 'failed request'
        }
        if(response.data.success){   
            if(response.data.result == null) throw 'Not found' 
            return response.data.result;
        }    
        throw 'Not found'
    } catch (error) { 
        throw error
    }   
} 
// thống kê yêu cầu cung cấp thông tin đến từng cơ quan nhà nước của phóng viên
const getStatictisRequireWithInstituteFromJournalist = async (authenString, fromRegisterDate,  toRegisterDate) => {
    try {  
        debugger 
        let headers = {
            'Authorization': 'Bearer '+authenString
          } 
          const apiString = `${string.SERVER_NAME}report/claim-detail-users?fromRegisterDate=${fromRegisterDate}&toRegisterDate=${toRegisterDate}`
          //console.warn(apiString)
        let response = await axios.get(apiString, {
            headers: headers,
            timeout:string.TIME_OUT
          }) 
        if(response.status != 200){
            throw 'failed request'
        }
        if(response.data.success){   
            if(response.data.result.data == null) throw 'Not found' 
            return response.data.result.data;
        }    
        throw 'Not found'
    } catch (error) { 
        throw error
    }   
} 


export default{
    getRegistrationStatictisManage,getStatictisRequireManage,
    getRegistrationStatictisByProvinceFromManage, getRequireStatictisByProvinceFromManage,
    getStatictisInstituteFromInstitute, getStatictisPressAgencyFromInstitute, getStatictisJounalistFromInstitute,
    getStatictisRequireFromInstitute, getStatictisPressAgencyRequireFromInstitute, getStatictisJournalistRequireFromInstitute, 
    getStatictisWorkRegisterFromJournalist, getStatictisWorkRegisterWithInstituteFromJournalist, getStatictisRequireFromJournalist, getStatictisRequireWithInstituteFromJournalist,
    getStatictisStrangeRegisterFromInstitute, getStatictisStrangeRegisterFromJournalist
}

