import axios from "axios";

const api = axios.create({
  baseURL: "https://daianapopa.pythonanywhere.com/api",
});

export default api;