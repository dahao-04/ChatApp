import axiosR from 'axios';

// Thêm giá trị dự phòng để tránh lỗi 'undefined' trong Dev Mode
// Sử dụng địa chỉ Backend Dev Server (3000) nếu biến môi trường bị thiếu
const apiUrl = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000';

const axios = axiosR.create({
  // Nối chuỗi /api ở đây nếu bạn đã cấu hình backend với tiền tố /api
  baseURL: apiUrl, 
  withCredentials: true,
});

// === KHÔI PHỤC REQUEST INTERCEPTOR ĐỂ LẤY TOKEN ===
axios.interceptors.request.use(
  (config) => {
    // 1. Lấy token từ localStorage
    const token = localStorage.getItem('auth-token');
    
    // 2. Nếu token tồn tại, thêm vào header
    if (token) {
      config.headers['auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
// ===================================================

axios.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config;
    const resp = error.response;

    // Nếu không có response hoặc đã retry thì reject
    if (!resp || resp.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const code = resp.data.code;

    // Nếu token hết hạn => thử refresh
    if (code === 'TOKEN_EXPIRED') {
      original._retry = true;
      try {
        // GỌI REFRESH TOKEN SỬ DỤNG AXIOS ĐÃ CÓ CẤU HÌNH BASEURL
        const r = await axios.post('/auth/refresh'); 
        
        const newToken = r.data.token;
        localStorage.setItem('auth-token', newToken);

        original.headers['auth-token'] = newToken;
        return axios(original);
      } catch (e) {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(e);
      }
    }
    
    // Nếu không có token hoặc token không hợp lệ
    if ((code === 'NO_TOKEN' || code === 'INVALID_TOKEN') && window.location.pathname !== '/login') {
        window.location.href = '/login';
        return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axios;