// src/services/ProjectService.ts
import type { Project, Task, Subtask } from "./project";


const STORAGE_KEY = "todo-app";

export const ProjectService = {
  getProjects(): Project[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveProjects(projects: Project[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  },

  addProject(name: string) {
    const projects = this.getProjects();
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      tasks: [],
    };
    projects.push(newProject);
    this.saveProjects(projects);
    return newProject;
  },

     // === Delete a project ===
  deleteProject(projectId: string) {
    const projects = this.getProjects().filter(p => p.id !== projectId);
    this.saveProjects(projects);
  },

        // === Add a new task to a project ===
    addTask(projectId: string, task: Task) {
      const projects = this.getProjects();
      const project = projects.find(p => p.id === projectId);
      if (!project) return;
      project.tasks.push(task);
      this.saveProjects(projects);
    },

    // === Update a new task to a project
    updateTask(projectId: string, updatedTask: Task) {
      const projects = this.getProjects();
      const project = projects.find(p => p.id === projectId);
      if (!project) return;

      project.tasks = project.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
      this.saveProjects(projects);
    

     // Reset reminder if dueDate changed
  if (updatedTask.dueDate) {
    const reminders = JSON.parse(localStorage.getItem("reminders") || "{}");
    reminders[updatedTask.id] = null; // clear last reminder
    localStorage.setItem("reminders", JSON.stringify(reminders));
  }
},


        // === Delete a task ===
  deleteTask(projectId: string, taskId: string) {
    const projects = this.getProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    project.tasks = project.tasks.filter(t => t.id !== taskId);
    this.saveProjects(projects);
  },

     // === Add a subtask to a task ===
  addSubtask(projectId: string, taskId: string, subtask: Subtask): void {
    const projects = this.getProjects();
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const task = project.tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (!task.subtasks) task.subtasks = [];
    task.subtasks.push(subtask);

    this.saveProjects(projects);
  },

   // === Update a subtask ===
  updateSubtask(projectId: string, taskId: string, updatedSubtask: Subtask) {
    const projects = this.getProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const task = project.tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;

    task.subtasks = task.subtasks.map(st => st.id === updatedSubtask.id ? updatedSubtask : st);
    this.saveProjects(projects);
  },

  // === Delete a subtask ===
  deleteSubtask(projectId: string, taskId: string, subtaskId: string) {
    const projects = this.getProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const task = project.tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;

    task.subtasks = task.subtasks.filter(st => st.id !== subtaskId);
    this.saveProjects(projects);
  }

};



