import axios from 'axios';

export const http = axios.create({
  // baseURL: 'http://192.168.148.98:3000/api',
  // baseURL: 'http://localhost:3000/api',
  baseURL: 'https://posting.backend.server.marketmajesty.net/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
export const uploadPath = 'https://posting.backend.server.marketmajesty.net/uploads/';
// export const uploadPath = 'https://192.168.148.98:3000/uploads/';
export const mapApiKey = process.env.PLACE_API_KEY;
