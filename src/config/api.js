import { env } from './env.ts';
const API_BASE_URL = env.API_BASE_URL;
export const apiConfig = { baseURL: API_BASE_URL, timeout: 10000, headers: { 'Content-Type': 'application/json' } };
export default API_BASE_URL;
