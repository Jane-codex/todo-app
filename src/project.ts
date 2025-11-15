export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dependencies?: string[];
  completed: boolean;
  dueDate: string;
  status: "todo" | "inprogress" | "done";
  subtasks?: Subtask[];
  isTracking?: boolean;
  timeTracked?: number;

}

export interface Project {
  id: string;
  name: string;
  tasks: Task[];
}