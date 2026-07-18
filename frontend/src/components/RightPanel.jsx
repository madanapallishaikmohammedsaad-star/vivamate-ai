export default function RightPanel() {
  return (
    <div className="space-y-6">

      <div className="bg-white rounded-3xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">
          VTU Updates
        </h2>

        <div className="space-y-4">

          <div className="border-l-4 border-blue-600 pl-3">
            <h3 className="font-semibold">
              Semester Timetable Released
            </h3>

            <p className="text-gray-500 text-sm">
              Check the latest examination schedule.
            </p>
          </div>

          <div className="border-l-4 border-purple-600 pl-3">
            <h3 className="font-semibold">
              Revaluation Results Published
            </h3>

            <p className="text-gray-500 text-sm">
              View updated marks online.
            </p>
          </div>

        </div>
      </div>

      <div className="bg-white rounded-3xl shadow p-6">

        <h2 className="text-xl font-bold mb-4">
          AI Recommendations
        </h2>

        <ul className="space-y-3">

          <li>📘 Revise Graph Theory</li>

          <li>🤖 Practice Java Viva</li>

          <li>📝 Solve DBMS Previous Papers</li>

          <li>🎯 Target 8.5 CGPA this semester</li>

        </ul>

      </div>

    </div>
  );
}
