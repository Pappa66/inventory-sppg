import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sppg_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function formatErr(e) {
  const d = e?.response?.data?.detail;
  if (!d) return e?.message || "Terjadi kesalahan";
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((x) => x?.msg || JSON.stringify(x)).join(", ");
  return String(d);
}
