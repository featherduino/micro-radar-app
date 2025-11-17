import axios from "axios";

export const api = axios.create({
  baseURL: "https://micro-radar-app.vercel.app"

});
