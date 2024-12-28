import axios from 'axios';

const BASE_URL = 'http://localhost:4000/';

const getToken = () => localStorage.getItem('token');

const apiClient = axios.create({
  baseURL: BASE_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const fetchDataFromApi = async (url) => {
  const { data } = await apiClient.get(url);
  return data;
};

export const postData = async (url, formData) => {
  const { data } = await apiClient.post(url, formData);
  return data;
};
export const editData = async (url, updateData) => {
  const { data } = await apiClient.put(url, updateData);
  return data;
};
export const deleteData = async (url) => {
  const { data } = await apiClient.delete(url);
  return data;
};
