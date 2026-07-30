import api from "./api";

export async function getSchemes() {
  const res = await api.get("/api/schemes");
  return res.data;
}

export async function getBranches() {
  const res = await api.get("/api/branches");
  return res.data;
}

export async function getSemesters(scheme, branch) {
  const res = await api.get(`/api/semesters/${scheme}/${branch}`);
  return res.data;
}
export async function getSubjects(
  scheme,
  branch,
  semester
) {
  const res = await api.get(
    `/api/subjects/${scheme}/${branch}/${semester}`
  );

  return res.data;
}
