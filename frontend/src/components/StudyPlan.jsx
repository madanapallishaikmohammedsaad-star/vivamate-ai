const tasks = [
  {
    title: "DBMS Unit 2",
    progress: 100,
    done: true,
  },
  {
    title: "AI Lab Program",
    progress: 100,
    done: true,
  },
  {
    title: "Network Security",
    progress: 30,
    done: false,
  },
  {
    title: "Java Viva Practice",
    progress: 0,
    done: false,
  },
];

export default function StudyPlan() {
  return (
    <section className="bg-white rounded-3xl shadow p-8">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">
          Today's Study Plan
        </h2>

        <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold">
          2 / 4 Done
        </span>
      </div>

      <div className="space-y-5">
        {tasks.map((task, index) => (
          <div key={index}>
            <div className="flex items-center gap-3 mb-2">
              <input
                type="checkbox"
                checked={task.done}
                readOnly
                className="w-5 h-5"
              />

              <span
                className={`font-medium ${
                  task.done
                    ? "line-through text-gray-400"
                    : ""
                }`}
              >
                {task.title}
              </span>
            </div>

            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${task.progress}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
