import { useState } from "react";
import { useTaskStore } from "../../stores/taskStore";

export function TasksPage() {
  const { tasks, addTask, toggleTask, deleteTask } = useTaskStore();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim());
      setNewTaskTitle("");
    }
  };

  const filteredTasks = showCompleted
    ? tasks
    : tasks.filter((t) => !t.completed);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className="btn-outline text-sm"
        >
          {showCompleted ? "Hide" : "Show"} Completed
        </button>
      </div>

      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="card">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task..."
            className="input flex-1"
          />
          <button type="submit" className="btn-primary">
            Add
          </button>
        </div>
      </form>

      {/* Tasks List */}
      <div className="card">
        {filteredTasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {showCompleted ? "No tasks yet" : "No pending tasks"}
          </p>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 py-3">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`min-w-touch min-h-touch flex items-center justify-center rounded-lg border-2 transition-all ${
                    task.completed
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-gray-300 hover:border-green-500"
                  }`}
                >
                  {task.completed && <span className="text-xl">✓</span>}
                </button>

                <div className="flex-1">
                  <p
                    className={`text-base ${
                      task.completed
                        ? "line-through text-gray-500"
                        : "text-gray-900"
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="min-w-touch min-h-touch flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <span className="text-xl">🗑</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
