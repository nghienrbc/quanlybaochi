import axios from "axios"  
import { images, colors, icons, fontSizes, string } from "../constants";

const getAllAgenciesListByProvinceID = async (authenString) => {
    try {  
        debugger 
        let headers = {
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json'
            'Authorization': 'Bearer '+authenString
          }
        let response = await axios.get(`${string.SERVER_NAME}user/data-spokesman?proviceId=1&page=1&size=999999`, {
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


export default{
    getAllAgenciesListByProvinceID     
}
 