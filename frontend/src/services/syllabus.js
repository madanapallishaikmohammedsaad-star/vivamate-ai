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

export async function getSubjects(scheme, branch, semester) {
  const res = await api.get(
    `/api/subjects/${scheme}/${branch}/${semester}`
  );
  return res.data;
}

export async function getSubjectDetail(subjectId) {
  const res = await api.get(`/api/subjects/detail/${subjectId}`);
  return res.data;
}

export async function getModules(subjectId) {
  const res = await api.get(`/api/modules/${subjectId}`);
  return res.data;
}

export async function searchSubjects(query, scheme) {
  const params = new URLSearchParams({ query });
  if (scheme) params.append("scheme", scheme);
  const res = await api.get(`/api/subjects/search?${params}`);
  return res.data;
}

export async function getSubjectContext(subjectId) {
  const res = await api.get(`/api/subject-context/${subjectId}`);
  return res.data;
}
