import { useEffect, useState } from "react";
import { useTaskStore } from "../../stores/taskStore";

export function Dashboard() {
  const tasks = useTaskStore((state) => state.tasks);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  });

  useEffect(() => {
    const completed = tasks.filter((t) => t.completed).length;
    setStats({
      total: tasks.length,
      completed,
      pending: tasks.length - completed,
    });
  }, [tasks]);

  const statCards = [
    {
      label: "Total Tasks",
      value: stats.total,
      color: "bg-blue-500",
      icon: "📋",
    },
    {
      label: "Completed",
      value: stats.completed,
      color: "bg-green-500",
      icon: "✓",
    },
    {
      label: "Pending",
      value: stats.pending,
      color: "bg-orange-500",
      icon: "⏳",
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div
                className={`w-14 h-14 rounded-full ${stat.color} flex items-center justify-center text-3xl`}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Recent Activity
        </h3>
        <div className="space-y-2">
          {tasks.slice(0, 5).map((task) => (
            <div key={task.id} className="list-item">
              <span
                className={`text-2xl mr-3 ${
                  task.completed ? "opacity-50" : ""
                }`}
              >
                {task.completed ? "✓" : "○"}
              </span>
              <span
                className={
                  task.completed
                    ? "line-through text-gray-500"
                    : "text-gray-900"
                }
              >
                {task.title}
              </span>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-gray-500 text-center py-4">No tasks yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
