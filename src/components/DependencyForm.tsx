import React, { useState } from "react";
import type { Project, Task } from "../project";

interface Props {
  project: Project;
  task: Task;
  onAdd: (depId: string) => void;
}

const DependencyForm: React.FC<Props> = ({ project, task, onAdd }) => {
  const [selectedDep, setSelectedDep] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDep) return;
    onAdd(selectedDep);
    setSelectedDep("");
  };

  return (
    <form onSubmit={handleAdd}>
      <select value={selectedDep} onChange={(e) => setSelectedDep(e.target.value)}>
        <option value="">Add dependency</option>
        {project.tasks
          .filter((t) => t.id !== task.id)
          .map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
      </select>
      <button type="submit">Add</button>
    </form>
  );
};

export default DependencyForm;