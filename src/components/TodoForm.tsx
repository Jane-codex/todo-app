import React, { useState, useEffect } from "react";
import type { Project, Task } from "../project";


interface TodoFormProps {
   project?: Project;
  projectId: string;
  onAddTask: (task: Task) => void;
   onUpdateTask?: (updatedTask: Task) => void;
  onClose: () => void;
  editingTask?: Task | null;
}

  const TodoForm: React.FC<TodoFormProps> = ({
    project,
  onAddTask,
   onUpdateTask,
  onClose,
  editingTask = null,
 
}) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dependencies, setDependencies] = useState("");

  // If editing, pre-fill the form
  useEffect(() => {
    if (editingTask) {
      setTaskTitle(editingTask.title);
      setDescription(editingTask.description);
      setDueDate(editingTask.dueDate);
      setDependencies((editingTask.dependencies || []).join(", "));
      
    } else {
      setTaskTitle("");
      setDescription("");
      setDueDate("");
      setDependencies("");
    }
  }, [editingTask]);

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!taskTitle.trim()) return;

 
  // Map dependencies from title to ID
  const dependencyIds = dependencies
    ? dependencies.split(",").map((depTitle) => {
        const depTask = project?.tasks.find(
          (t) => t.title.toLowerCase().trim() === depTitle.toLowerCase().trim()
        );
        return depTask ? depTask.id : null;
      }).filter(Boolean) as string[]
    : [];
 

  const taskData: Task = {
    id: editingTask ? editingTask.id : crypto.randomUUID(),
    title: taskTitle,
    description,
    dueDate,
    status: editingTask ? editingTask.status : "todo",
    dependencies: dependencyIds,
    completed: editingTask ? editingTask.completed : false,
    subtasks: editingTask ? editingTask.subtasks : [],
  };

  if (editingTask) {
    onUpdateTask?.(taskData); // ✅ call update if editing
  } else {
    onAddTask(taskData); // ✅ call add if new
  }

  // Reset form
  setTaskTitle("");
  setDescription("");
  setDueDate("");
  setDependencies("");
  onClose();
};

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-gray rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-800">
        <h2 className="text-2xl font-semibold text-white mb-4 text-center">
          Create New Task
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Task Title"
            className="p-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-cyan-400"
            required
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task Description"
            className="p-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-cyan-400 resize-none"
            rows={4}
            required
          />

          <div>
            <label className="text-sm text-gray-400">Due Date</label>
          <input
              type="date"
              value={dueDate ? new Date(dueDate).toISOString().split("T") [0] : ""}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 p-3 w-full rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <input
            type="text"
            value={dependencies}
            onChange={(e) => setDependencies(e.target.value)}
            placeholder="Dependencies (comma-separated Task IDs)"
            className="p-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-cyan-400"
          />

          <div className="flex justify-end gap-3 mt-4 form-buttons">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
            >
              Cancel
          </button>
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default TodoForm;



















 