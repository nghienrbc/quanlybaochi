// axiosConfig.js
import axios from 'axios';
import { string } from "../constants";   

// axios.defaults.httpsAgent = {
//   rejectUnauthorized: false,
// };

const instance = axios.create({
  baseURL: string.SERVER_NAME, // Thay thế URL bằng URL của bạn
  timeout: 5000,
  validateStatus: function (status) {
    // Trả về true để bỏ qua SSL kiểm tra cho tất cả các status code
    return true;
  },
  // httpsAgent: {
  //   rejectUnauthorized: false, // Tắt kiểm tra SSL
  // },
});

export default instance;
