import { useEffect, useState } from "react";
import {
  getSchemes,
  getBranches,
  getSemesters,
  getSubjects,
} from "../services/syllabus";

export default function SyllabusSelector({
  scheme,
  setScheme,
  branch,
  setBranch,
  semester,
  setSemester,
  subject,
  setSubject,
}) {
  const [schemes, setSchemes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);

 

  // Load Schemes & Branches
  useEffect(() => {
    async function load() {
      try {
        const schemes = await getSchemes();
        const branches = await getBranches();

        setSchemes(schemes);
        setBranches(branches);
      } catch (err) {
        console.error(err);
      }
    }

    load();
  }, []);

  // Load Semesters
  useEffect(() => {
    async function loadSemesters() {
      if (!scheme || !branch) {
        setSemesters([]);
        setSemester("");
        return;
      }

      try {
        const data = await getSemesters(scheme, branch);
        setSemesters(data);
        setSemester("");
        setSubjects([]);
        setSubject("");
      } catch (err) {
        console.error(err);
      }
    }

    loadSemesters();
  }, [scheme, branch]);

  // Load Subjects
  useEffect(() => {
    async function loadSubjects() {
      if (!scheme || !branch || !semester) {
        setSubjects([]);
        setSubject("");
        return;
      }

      try {
        const data = await getSubjects(
          scheme,
          branch,
          semester
        );

        setSubjects(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadSubjects();
  }, [scheme, branch, semester]);

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">

      {/* Scheme */}
      <select
        value={scheme}
        onChange={(e) => setScheme(e.target.value)}
        className="border rounded-xl p-3"
      >
        <option value="">Select Scheme</option>

        {schemes.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      {/* Branch */}
      <select
        value={branch}
        onChange={(e) => setBranch(e.target.value)}
        className="border rounded-xl p-3"
      >
        <option value="">Select Branch</option>

        {branches.map((item) => (
          <option key={item.code} value={item.code}>
            {item.name}
          </option>
        ))}
      </select>

      {/* Semester */}
      <select
        value={semester}
        onChange={(e) => setSemester(e.target.value)}
        className="border rounded-xl p-3"
      >
        <option value="">Select Semester</option>

        {semesters.map((sem) => (
          <option key={sem} value={sem}>
            Semester {sem}
          </option>
        ))}
      </select>

      {/* Subject */}
      <select
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="border rounded-xl p-3"
      >
        <option value="">Select Subject</option>

        {subjects.map((item) => (
          <option key={item.code} value={item.name}>
            {item.name}
          </option>
        ))}
      </select>

    </div>
  );
}
