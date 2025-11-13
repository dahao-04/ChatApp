import axiosR from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const axios = axiosR.create({
  baseURL: `${apiUrl}:3000`,
  withCredentials: true,
});

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers['auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
