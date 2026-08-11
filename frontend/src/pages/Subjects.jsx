import { useEffect, useState } from "react";
import { getSchemes, getBranches, getSemesters, getSubjects } from "../services/syllabus";
import { BookOpen, FileText, ExternalLink } from "lucide-react";

export default function Subjects() {
  const [scheme, setScheme] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
  const [subjects, setSubjects] = useState([]);

  const [schemes, setSchemes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [s, b] = await Promise.all([getSchemes(), getBranches()]);
        setSchemes(Array.isArray(s) ? s : []);
        setBranches(Array.isArray(b) ? b : []);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function loadSemesters() {
      if (!scheme || !branch) {
        setSemesters([]);
        setSemester("");
        return;
      }
      try {
        const data = await getSemesters(scheme, branch);
        setSemesters(Array.isArray(data) ? data : []);
        setSemester("");
      } catch (err) {
        console.error(err);
      }
    }
    loadSemesters();
  }, [scheme, branch]);

  useEffect(() => {
    async function loadSubjects() {
      if (!scheme || !branch || !semester) {
        setSubjects([]);
        return;
      }
      setLoading(true);
      try {
        const data = await getSubjects(scheme, branch, semester);
        setSubjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSubjects();
  }, [scheme, branch, semester]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">📚 Subjects</h1>
      <p className="text-gray-500 mb-6">Browse VTU syllabus by scheme, branch and semester</p>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <select
          value={scheme}
          onChange={(e) => setScheme(e.target.value)}
          className="border rounded-xl p-3 bg-white"
        >
          <option value="">Select Scheme</option>
          {schemes.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <select
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="border rounded-xl p-3 bg-white"
        >
          <option value="">Select Branch</option>
          {branches.map((item) => (
            <option key={item.code} value={item.code}>{item.name}</option>
          ))}
        </select>

        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          className="border rounded-xl p-3 bg-white"
        >
          <option value="">Select Semester</option>
          {semesters.map((sem) => (
            <option key={sem} value={sem}>Semester {sem}</option>
          ))}
        </select>

        <div className="flex items-center justify-center bg-blue-50 rounded-xl border border-blue-200 text-blue-700 font-semibold">
          {loading ? "Loading..." : `${subjects.length} subjects`}
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="bg-white rounded-3xl shadow p-16 text-center">
          <BookOpen className="mx-auto text-gray-300" size={64} />
          <h2 className="text-2xl font-bold mt-4 text-gray-400">
            Select Scheme, Branch and Semester
          </h2>
          <p className="text-gray-400 mt-2">
            Subjects will appear here
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow hover:shadow-xl transition">
              <div className="flex items-start justify-between">
                <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-mono font-bold text-sm">
                  {subject.code || subject.course_code || subject.name}
                </div>
                <FileText size={20} className="text-gray-300" />
              </div>

              <h3 className="font-bold text-lg mt-4">{subject.name}</h3>

              {subject.documents && subject.documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  {subject.documents.map((doc, i) => (
                    <a
                      key={i}
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-blue-600 text-sm hover:underline"
                    >
                      <ExternalLink size={14} />
                      {doc.title || doc.filename}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
