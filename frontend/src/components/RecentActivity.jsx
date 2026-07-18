import { CheckCircle, Mic, Bookmark } from "lucide-react";

const activities = [
  {
    title: "Generated DBMS Answer",
    time: "2 hours ago",
    icon: CheckCircle,
    color: "bg-green-500",
  },
  {
    title: "Practiced Java Viva",
    time: "5 hours ago",
    icon: Mic,
    color: "bg-purple-500",
  },
  {
    title: "Bookmarked AI Notes",
    time: "Yesterday",
    icon: Bookmark,
    color: "bg-blue-500",
  },
];

export default function RecentActivity() {
  return (
    <section className="bg-white rounded-3xl shadow p-8">
      <h2 className="text-2xl font-bold mb-8">
        Recent Activity
      </h2>

      <div className="space-y-8">
        {activities.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="flex items-start gap-4"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${item.color}`}
              >
                <Icon size={22} />
              </div>

              <div>
                <h3 className="font-semibold text-lg">
                  {item.title}
                </h3>

                <p className="text-gray-500">
                  {item.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
