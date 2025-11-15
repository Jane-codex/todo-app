import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface CalendarViewProps {
  tasks: {
    id: string;
    title: string;
    dueDate: string;
    status: "todo" | "inprogress" | "done";
  }[];
  onDateSelect: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onDateSelect }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

   const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPosition({ x: e.clientX + 10, y: e.clientY + 10 });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect(date);
  };

const dayTasks = tasks.filter((task) => {
  if (!task.dueDate) return false;

  // Split the YYYY-MM-DD string and create a local date
  const [year, month, day] = task.dueDate.split("-").map(Number);
  const taskDate = new Date(year, month - 1, day); // local date

  return taskDate.toDateString() === selectedDate?.toDateString();
});

return (
    <div className="calendar-container" onMouseMove={handleMouseMove}>
      <div className="calendar-box">
        <Calendar
          onClickDay={handleDateClick}
          value={selectedDate}
          className="calendar-view"
         tileContent={({ date, view }) => {
  if (view !== "month") return null;

  const dayTasks = tasks.filter((task) => {
    if (!task.dueDate) return false;
    const [year, month, day] = task.dueDate.split("-").map(Number);
    const taskDate = new Date(year, month - 1, day);
    return taskDate.toDateString() === date.toDateString();
  });

            const todoCount = dayTasks.filter((t) => t.status === "todo").length;
            const inProgressCount = dayTasks.filter(
              (t) => t.status === "inprogress"
            ).length;
            const doneCount = dayTasks.filter((t) => t.status === "done").length;

            return (
              <div
                className="dot-container"
                onMouseEnter={() => setHoveredDate(date)}
                onMouseLeave={() => setHoveredDate(null)}
              >
                {todoCount > 0 && <span className="task-dot todo-dot" />}
                {inProgressCount > 0 && (
                  <span className="task-dot inprogress-dot" />
                )}
                {doneCount > 0 && <span className="task-dot done-dot" />}

                {/* Tooltip */}
                {hoveredDate?.toDateString() === date.toDateString() && (
                  <div
                    className="floating-tooltip summary-tooltip"
                    style={{
                      left: tooltipPosition.x,
                      top: tooltipPosition.y,
                    }}
                  >
                    {dayTasks.length > 0 ? (
                      <>
                        {todoCount > 0 && (
                          <span className="tooltip-count todo-text">
                            📝 {todoCount} To-Do
                          </span>
                        )}
                        {inProgressCount > 0 && (
                          <span className="tooltip-count inprogress-text">
                            ⚙️ {inProgressCount} In Progress
                          </span>
                        )}
                        {doneCount > 0 && (
                          <span className="tooltip-count done-text">
                            ✅ {doneCount} Done
                          </span>
                        )}
                    </>
                    ) : (
                      <span className="tooltip-empty">No tasks due on this date</span>
                    )}
                  </div>
                )}
              </div>
            );
          }}
        />
      </div>

       <div className="calendar-tasks">
  <h3 className="calendar-heading">
    {selectedDate
      ? `Tasks on ${selectedDate.toDateString()}`
      : "Select a date to view tasks"}
  </h3>

  {selectedDate ? (
    dayTasks.length > 0 ? (
      <ul className="task-list">
        {dayTasks.map((task) => (
          <li key={task.id} className={`task-item ${task.status}`}>
            <span className="task-title">{task.title}</span>
            <span className={`status ${task.status}`}>
              {task.status === "todo"
                ? "📝 To Do"
                : task.status === "inprogress"
                ? "⚙️ In Progress"
                : "✅ Done"}
            </span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="no-tasks">No tasks due on this date.</p>
    )
  ) : (
    <p className="no-tasks">Select a date to view tasks.</p>
  )}
</div>
</div>

    
  );
};

export default CalendarView;













  

 

 