import axiosR from 'axios';

// Tạo một instance riêng
const axios = axiosR.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true
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

    if (!resp || resp.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const code = resp.data.code;
    if (code === 'TOKEN_EXPIRED') {
      original._retry = true;
      try {
        const r = await axios.post('/auth/refresh');
        const newToken = r.data.token;
        localStorage.setItem('auth-token', newToken);

        original.headers['auth-token'] = newToken;

        return axios(original);
      } catch (e) {
        window.location.href = '/';
        return Promise.reject(e);
      }
    }

    if (code === 'NO_TOKEN' || code === 'INVALID_TOKEN') {
      window.location.href = '/login';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axios;
