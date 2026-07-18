import api from "./api";

export async function getDashboard() {
  const res = await api.get("/dashboard");
  return res.data;
}
