import { create } from "zustand";
import { persist } from "zustand/middleware";
import { saveTasksToIndexedDB, loadTasksFromIndexedDB } from "../services/db";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

interface TaskState {
  tasks: Task[];
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  loadTasks: () => Promise<void>;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      addTask: (title) => {
        const newTask: Task = {
          id: Date.now().toString(),
          title,
          completed: false,
          createdAt: new Date().toISOString(),
        };
        const tasks = [...get().tasks, newTask];
        set({ tasks });
        saveTasksToIndexedDB(tasks);
      },
      toggleTask: (id) => {
        const tasks = get().tasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        );
        set({ tasks });
        saveTasksToIndexedDB(tasks);
      },
      deleteTask: (id) => {
        const tasks = get().tasks.filter((task) => task.id !== id);
        set({ tasks });
        saveTasksToIndexedDB(tasks);
      },
      loadTasks: async () => {
        const tasks = await loadTasksFromIndexedDB();
        if (tasks.length > 0) {
          set({ tasks });
        }
      },
    }),
    {
      name: "task-storage",
    }
  )
);
