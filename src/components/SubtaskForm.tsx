import React, { useState } from "react";
import type { Subtask } from "../project";

interface SubtaskFormProps {
  subtasks: Subtask[];
  setSubtasks: React.Dispatch<React.SetStateAction<Subtask[]>>
  onClose: () => void;
}

const SubtaskForm: React.FC<SubtaskFormProps> = ({
  subtasks,
  setSubtasks,
  onClose,
}) => {
  const [subtaskTitle, setSubtaskTitle] = useState("");

  const handleAddSubtask = () => {
    if (!subtaskTitle.trim()) return;
    const newSubtask: Subtask = {
      id: crypto.randomUUID(),
      title: subtaskTitle.trim(),
      completed: false,
    };
    setSubtasks((prev) => [...prev, newSubtask]);
    setSubtaskTitle("");
  };

  const toggleComplete = (id: string) => {
    setSubtasks((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, completed: !s.completed } : s
      )
    );
  };

  const deleteSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-[#181818] rounded-2xl p-6 w-full max-w-sm shadow-xl border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-4 text-center">
          Manage Subtasks
        </h2>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={subtaskTitle}
            onChange={(e) => setSubtaskTitle(e.target.value)}
            placeholder="Enter subtask..."
            className="flex-1 p-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={handleAddSubtask}
            className="px-3 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
          >
            Add
          </button>
        </div>

        <ul className="space-y-2 max-h-48 overflow-y-auto">
          {subtasks.length === 0 && (
            <p className="text-gray-400 text-sm text-center">No subtasks added yet.</p>
          )}

          {subtasks.map((s) => (
            <li
              key={s.id}
              className="flex justify-between items-center bg-gray-900 p-2 rounded-lg border border-gray-800"
            >
              <span
                onClick={() => toggleComplete(s.id)}
                className={`flex-1 cursor-pointer ${
                  s.completed ? "line-through text-gray-500" : "text-white"
                }`}
              >
                {s.title}
              </span>
              <button
                onClick={() => deleteSubtask(s.id)}
                className="text-red-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubtaskForm;