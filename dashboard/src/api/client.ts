import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5050/api" : "/api");

export const api = axios.create({ baseURL });
