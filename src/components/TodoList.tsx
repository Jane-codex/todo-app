 import React, { useState, useEffect } from "react";
 import  { ProjectService } from "../ProjectService";
 import type { Project, Task } from "../project";
 import ReminderService from "../ReminderService";
 import Analytics from "./Analytics";
 import CalendarView from "./CalendarView";
 import  TodoForm from "./TodoForm"; 
 import { Trash2, Edit2 } from "lucide-react";
 import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
 import type {  DropResult } from "@hello-pangea/dnd";
  import { List, CalendarDays, LayoutGrid, BarChart2 } from "lucide-react";
  import { Play, Pause } from "lucide-react";
 

  const TodoList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false); // ✅ handles modal visibility
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "kanban" | "analytics" | "calendar">("list");

   // == const allTasks = projects.flatMap((project) => project.tasks || []); ===//


  useEffect(() => {
    const storedProjects = ProjectService.getProjects();
    setProjects(storedProjects);
  }, []);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);


  // ✅ Add new project
  const handleAddProject = () => {
    if (!newProjectName.trim()) return;
    const newProject = ProjectService.addProject(newProjectName);
    setProjects([...projects, newProject]);
    setNewProjectName("");
  };


  // ✅ Delete project
  const handleDeleteProject = (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this project?");
    if (!confirmDelete) return;

    const updatedProjects = projects.filter((p) => p.id !== id);
    setProjects(updatedProjects);
    ProjectService.saveProjects(updatedProjects);

    if (selectedProjectId === id) {
      setSelectedProjectId(null);
    }
  };
   
  const handleAddTask = (projectId: string, task: Task) => {
  const updatedProjects = projects.map((p) => {
    if (p.id !== projectId) return p;

    const taskExists = p.tasks.some((t) => t.id === task.id);
    const updatedTasks = taskExists
      ? p.tasks.map((t) => (t.id === task.id ? task : t)) // update
      : [...p.tasks, task]; // add new

    return { ...p, tasks: updatedTasks };
  });

  setProjects(updatedProjects);
  ProjectService.saveProjects(updatedProjects);
  setShowForm(false);
  setEditingTask(null); // clear editing state
};

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().includes("MAC");
    const cmdPressed = isMac ? e.metaKey : e.ctrlKey;

    if (cmdPressed && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (selectedProjectId) {
        handleOpenNewTaskForm(); // ✅ This resets editingTask and opens form
      }
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [selectedProjectId]);
  

const handleDragEnd = (result: DropResult) => {
  if (!result.destination || !selectedProject) return;

  const { source: _source, destination, draggableId } = result;

  // Find the task being moved
  const movedTask = selectedProject.tasks.find(task => task.id === draggableId);
  if (!movedTask) return;

  // Update task status
  const newStatus = destination.droppableId as Task['status'];
  const updatedTask = { 
    ...movedTask,
    status: newStatus,
    completed: newStatus === "done",
  };

  // Remove the task from old position
  const tasksExcludingMoved = selectedProject.tasks.filter(task => task.id !== draggableId);

  // Insert task at the new position within the same status column
  const tasksInNewStatus = tasksExcludingMoved.filter(task => task.status === newStatus);
  const tasksNotInNewStatus = tasksExcludingMoved.filter(task => task.status !== newStatus);

  tasksInNewStatus.splice(destination.index, 0, updatedTask);

  const newTasks = [...tasksNotInNewStatus, ...tasksInNewStatus];

  // Update projects
  const updatedProjects = projects.map(p =>
    p.id === selectedProject.id ? { ...p, tasks: newTasks } : p
  );

  setProjects(updatedProjects);
  ProjectService.saveProjects(updatedProjects);
};

const handleDeleteTask = (taskId: string) => {
  if (!selectedProject) return;

  const updatedTasks = selectedProject.tasks.filter((task) => task.id !== taskId);
  const updatedProjects = projects.map((p) =>
    p.id === selectedProject.id ? { ...p, tasks: updatedTasks } : p
  );

  setProjects(updatedProjects);
  ProjectService.saveProjects(updatedProjects);
};

  const handleEditTask = (taskId: string) => {
  const project = projects.find(p => p.id === selectedProjectId);
  const taskToEdit = project?.tasks.find(t => t.id === taskId);
  if (taskToEdit) {
    setEditingTask(taskToEdit);
    setShowForm(true);
  }
};

// New task handler 
 const handleOpenNewTaskForm = () => {
  setEditingTask(null);
  setShowForm(true);
 }

  const updateTask = (updatedTask: Task) => {
 if (!selectedProject) return; // ✅ early return if undefined


  const updatedTasks = selectedProject.tasks.map((task) =>
    task.id === updatedTask.id ? updatedTask : task
  );

  const updatedProjects = projects.map((p) =>
    p.id === selectedProject.id ? { ...p, tasks: updatedTasks } : p
  );

  setProjects(updatedProjects);
  ProjectService.saveProjects(updatedProjects);
  setShowForm(false);
};
 

const handleListDragEnd = (result: DropResult) => {
  const { source, destination } = result;
  if (!destination || !selectedProject) return;

  // Copy tasks and move the dragged task
  const tasksCopy = Array.from(selectedProject.tasks);
  const [movedTask] = tasksCopy.splice(source.index, 1);
  tasksCopy.splice(destination.index, 0, movedTask);

  // Update the project with new task order
  const updatedProjects = projects.map((p) =>
    p.id === selectedProject.id ? { ...p, tasks: tasksCopy } : p
  );

  setProjects(updatedProjects);
  ProjectService.saveProjects(updatedProjects);
};

  const toggleTimeTracking = (taskId: string) => {
  const updatedProjects = projects.map((p) => {
    if (p.id !== selectedProjectId) return p;

    const updatedTasks = p.tasks.map((t) => {
      if (t.id !== taskId) return t;

      // toggle tracking
      return {
        ...t,
        isTracking: !t.isTracking,
      };
    });

    return { ...p, tasks: updatedTasks };
  });

  setProjects(updatedProjects);
  ProjectService.saveProjects(updatedProjects);
};

useEffect(() => {
  const interval = setInterval(() => {
    setProjects((prevProjects) =>
      prevProjects.map((p) => {
        if (p.id !== selectedProjectId) return p;
        const updatedTasks = p.tasks.map((t) => {
          if (!t.isTracking) return t;
          return { ...t, timeTracked: (t.timeTracked || 0) + 1 };
        });
        return { ...p, tasks: updatedTasks };
      })
    );
  }, 1000);

  return () => clearInterval(interval);
}, [selectedProjectId]);


const formatTime = (seconds: number = 0) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}; 

// Inside your component
useEffect(() => {
  if (!projects) return;

  ReminderService.start(projects);

  return () => {
    ReminderService.stop();
  };
}, [projects]);
    
    return (
     <div className="todo-list-container">
        <aside className="sidebar">
        <h2 className="sidebar-title">Projects</h2>

        <div className="add-project">
          <input
            type="text"
            placeholder="Add new project..."
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
          <button onClick={handleAddProject}>Add Project</button>
        </div>

        {/* Divider line between input/button and list */}
        <hr className="divider" />

        <ul className="project-list">
          {projects.map((project) => (
            <li
              key={project.id}
              className={`project-item ${
                selectedProjectId === project.id ? "selected" : ""
              }`}
            >
              <span onClick={() => setSelectedProjectId(project.id)} className="project-name">
                {project.name}
              </span>
              <Trash2
                size={18}
                className="delete-icon"
                onClick={() => handleDeleteProject(project.id)}
              />
            </li>
          ))}
        </ul>

        {selectedProjectId && (
          <button className="new-task-btn" onClick={handleOpenNewTaskForm}>
            + New Task
          </button>
        
        )}
    </aside>
   
     {/* Main Content */}
  <main className="main-content">
  {selectedProject ? (
    <div>
      {/* View Toggle Buttons */}
      <div className="view-toggle flex items-center gap-2 mb-4">
        <button
          onClick={() => setViewMode("list")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            viewMode === "list"
              ? "bg-cyan-500 text-white shadow-lg scale-105"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
          }`}
        >
          <List size={16} />
          <span>List</span>
        </button>

        <button
          onClick={() => setViewMode("kanban")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            viewMode === "kanban"
              ? "bg-cyan-500 text-white shadow-lg scale-105"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
          }`}
        >
          <LayoutGrid size={16} />
          <span>Kanban</span>
        </button>

        <button
          onClick={() => setViewMode("analytics")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            viewMode === "analytics"
              ? "bg-cyan-500 text-white shadow-lg scale-105"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
          }`}
        >
          <BarChart2 size={16} />
          <span>Analytics</span>
        </button>

        <button onClick={() =>
          setViewMode("calendar")}>
            <CalendarDays size={16} />
            <span>Calendar</span>
        </button>
      </div>

    <h2 className="project-title">{selectedProject?.name}</h2>
{selectedProject.tasks.length === 0 ? (
  <p className="no-tasks">
    No tasks yet. Press <b>(CMD/CTRL + K)</b> or click + New Task.
  </p>

// Inside your render
) : viewMode === "list" ? (
  <div className="list-view-container">
        <DragDropContext onDragEnd={handleListDragEnd}>
  <Droppable droppableId="tasks-list">
    {(provided) => (
      <div
        className="task-cards-container"
        {...provided.droppableProps}
        ref={provided.innerRef}
      >
        {selectedProject?.tasks.map((task, index) => (
          <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
            {(provided, snapshot) => (
             
             <div
  ref={provided.innerRef}
  {...provided.draggableProps}
  className={`task-card-item ${snapshot.isDragging ? "dragging" : ""}`}
>
  {/* Drag handle */}
 <div {...provided.dragHandleProps} className="drag-handle" title="Drag to reorder">
    ☰
  </div>

<div className="time-tracking-wrapper">
  <p className="time-box">
    {formatTime(task.timeTracked)}
  </p>
  <button
    onClick={() => toggleTimeTracking(task.id)}
    className={`time-tracking-btn ${task.isTracking ? "running" : "paused"}`}
    title={task.isTracking ? "Pause Timer" : "Start Timer"}
  >
    {task.isTracking ? <Pause size={16} /> : <Play size={16} />}
  </button>
</div>

  {/* Task info */}
  <div className="task-info"> 

    <h3>{task.title}</h3>

       {/* 🔖 Reminder Label */}
{(() => {
  if (!task.dueDate) return null;

  // ⚡ Use Lagos time
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" })
  );

  // ⚡ Parse due date exactly like ReminderService
  let dueDate: Date;

  if (/^\d{4}-\d{2}-\d{2}$/.test(task.dueDate)) {
    // Plain date → treat as Lagos end of day
    const [year, month, day] = task.dueDate.split("-").map(Number);
    dueDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));
  } else {
    dueDate = new Date(task.dueDate);
  }

  const minutesLeft = Math.floor((dueDate.getTime() - now.getTime()) / 60000);

  if (minutesLeft <= 30 && minutesLeft > 0)
    return <span className="due-soon">⏳ Due Soon</span>;

  if (minutesLeft < 0)
    return <span className="overdue">⚠️ Overdue</span>;

  return null;
})()}
    
    <p>{task.description}</p>

    <p className="due-date">📅 Due: {task.dueDate}</p>

  {/* Dependencies warning */}
     {(task.dependencies?.length ?? 0) > 0 && (() => {
  const incompleteDeps = (task.dependencies ?? []).filter(depId => {
    const depTask = selectedProject.tasks.find(t => t.id === depId);
    return depTask && !depTask.completed;
  });

  if (incompleteDeps.length > 0) {
    return (
      <p className="dependency-warning dependency-warning-glow">
        🟡 Waiting on {incompleteDeps.length} dependenc
        {incompleteDeps.length > 1 ? "ies" : "y"}
      </p>
    );
  } else {
    return (
      <p className=" dependency-met dependency-met-glow">
        ✅ All dependencies met
      </p>
    );
  }
})()}
         
  </div>

  {/* Bottom: Action buttons */}
  <div className="task-actions">
    <Edit2
      size={18}
      className="edit-icon"
      onClick={(e) => {
        e.stopPropagation();
        handleEditTask(task.id);
      }}
    />
  <Trash2
      size={18}
      className="delete-btn"
      onClick={(e) => {
        e.stopPropagation();
        handleDeleteTask(task.id);
      }}
    />
  </div>
</div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
</DragDropContext>
  </div>

   
) : viewMode === "kanban" ? (
  // Kanban code here...
  <DragDropContext onDragEnd={handleDragEnd}>
    <div className="kanban-board">
      {["todo", "inprogress", "done"].map((status) => (
      <Droppable key={status} droppableId={status}>
          {(provided) => (
            <div
              className="kanban-column"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <h3 className="kanban-column-title">
                {status === "todo"
                  ? "📝To Do"
                  : status === "inprogress"
                  ? "⚙️In Progress"
                  : "✅Done"
                  }
              </h3>

              {selectedProject.tasks
                .filter((task) => task.status === status)
                .map((task, index) => (
                  
                <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`kanban-task ${
                          snapshot.isDragging ? "dragging" : ""
                        }`}
                      >
                        <div className="task-left">
                          <div className={`task-check ${task.completed ? "done" : ""}`}>
                            {task.completed && "✔"}
                          </div>
                          <div className="task-info">
                            <h4>{task.title}</h4>
                          <p className="due-date">📅 Due: {task.dueDate}</p>
                          
                  {(task.dependencies?.length ?? 0) > 0 && (() => {
          const incompleteDeps = (task.dependencies ?? []).filter(depId => {
            const depTask = selectedProject.tasks.find(t => t.id === depId);
            return depTask && !depTask.completed;
          });

          if (incompleteDeps.length > 0) {
            return (
              <p className="dependency-warning dependency-warning-glow">
                🟡 Waiting on {incompleteDeps.length} dependenc
                {incompleteDeps.length > 1 ? "ies" : "y"}
              </p>
            );
          } else {
            return (
              <p className="dependency-met dependency-met-glow">
                ✅ All dependencies met
              </p>
            );
          }
        })()}
                       </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ))}
    </div>
  </DragDropContext>

) : viewMode === "analytics" ? (
  <div className="analytics-container">
    <Analytics project={selectedProject} />
  </div>
 
) : viewMode === "calendar" ? (
<div className="calendar-container">
    <CalendarView
      tasks={projects.flatMap((p) => p.tasks)} // gets all tasks from all projects
      onDateSelect={(date) => {
        const filtered = projects
          .flatMap((p) => p.tasks)
          .filter(
            (task) =>
              task.dueDate &&
              new Date(task.dueDate).toDateString() === date.toDateString()
          );
        console.log("Tasks on this date:", filtered);
      }}
    />
  </div>
) : null}
 </div>
  ) : (
    <p className="no-project">Select or create a project</p>
  )}
</main>

{showForm && selectedProjectId && (
  <div className="task-card-overlay">
    <div className="task-card">
       <TodoForm
  projectId={selectedProjectId}
  project={selectedProject}
  onAddTask={(task) => handleAddTask(selectedProjectId, task)}
  onUpdateTask={updateTask} // &lt;-- here
  onClose={() => setShowForm(false)}
  editingTask={editingTask}
/>
    </div>
  </div>
)}
  
</div>
);
};
export default TodoList;
 
 