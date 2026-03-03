
import axios from 'axios';

const api = axios.create({
  // Ensure this matches your backend URL
  baseURL: 'http://localhost:5000/api', 
});

export default api;
