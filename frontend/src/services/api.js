import axios from "axios";

const api = axios.create({
  baseURL: "http://daianapopa.pythonanywhere.com/api",
});

export default api;