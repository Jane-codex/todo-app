import React, { useEffect, useState} from "react";
import type { Project } from "../project";
import { Clock, ListChecks, CheckCircle, TrendingUp }from "lucide-react";


interface AnalyticsProps {
  project: Project;
}

const Analytics: React.FC<AnalyticsProps> = ({ project }) => {
  const [liveTime, setLiveTime] = useState(0);
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((t) => t.completed).length;
  const inProgressTasks = project.tasks.filter((t) => t.status === "inprogress").length;
  const todoTasks = project.tasks.filter((t) => t.status === "todo").length;

   
  // Real total tracked time (in seconds)
  const totalTimeTracked = project.tasks.reduce(
    (acc, t) => acc + (t.timeTracked || 0),
    0
  );

  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Helper to format time as 09:30:05
  const formatTime = (seconds: number = 0) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };
   


// Update every second if any task is tracking
  useEffect(() => {
    setLiveTime(totalTimeTracked); // initialize
    const hasActiveTask = project.tasks.some((t) => t.isTracking);

    if (hasActiveTask) {
      const interval = setInterval(() => {
        setLiveTime((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [project.tasks, totalTimeTracked]);
  

  return (

    <div
      style={{
        padding: "2rem",
        background: "#0d0d0d", 
        color: "#e0e0e0",
        minHeight: "100vh",
      }}
    >
     {/* 
 */}
      {/* Top Stats */}
      <div
        style={{
           display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <StatCard
  icon={<ListChecks size={24} color="#00ffff" />}
  title="Total Tasks"
  value={totalTasks.toString()}
/>
<StatCard
  icon={<CheckCircle size={24} color="#22c55e" />}
  title="Tasks Completed"
  value={completedTasks.toString()}
/>

<StatCard
        icon={<Clock size={24} color="#3b82f6" />}
        title="Total Time Tracked"
        value={formatTime(liveTime)}
    />
     
</div>
     

      {/* Progress Bars */}
         <h2
        style={{
          fontSize: "1.8rem",
          marginBottom: "2rem",
          fontWeight: 600,
          color: "#00ffff",
          textAlign: "center",
        }}
      >
        Task Status Breakdown
      </h2>
      <div
        style={{
          maxWidth: "600px",
          margin: "2rem auto",
          background: "#121212",
          borderRadius: "12px",
          padding: "1.5rem",
          boxShadow: "0 0 20px rgba(0, 255, 255, 0.1)",
        }}
      >
        <ProgressRow label="To Do" color="#ffcc00" value={todoTasks} />
        <ProgressRow label="In Progress" color="#00bfff" value={inProgressTasks} />
        <ProgressRow label="Completed" color="#22c55e" value={completedTasks} />
      </div>

      {/* Completion Summary */}

    <div style={{ textAlign: "center", marginTop: "3rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
  {/* Icon at the top */}
  <TrendingUp size={32} color="#ffcc00" />

  {/* Text under the icon */}
  <h3 style={{ fontSize: "1.2rem", color: "#b0b0b0", margin: 0 }}>
    Overall Completion
  </h3>

  {/* Percentage under the text */}
  <p
    style={{
      fontSize: "2rem",
      fontWeight: 700,
      color: completionRate === 100 ? "#22c55e" : "#00ffff",
      margin: 0,
    }}
  >
    {completionRate}%
  </p>
</div>
      
    </div>
  );
};

// --- Subcomponents ---
const StatCard = ({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) => (
  <div
    style={{
      background: "#121212", 
      borderRadius: "10px",
      boxShadow: "0 0 15px rgba(0, 255, 255, 0.05)",
      padding: "1.5rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      transition: "transform 0.2s ease", 
    }}
  >
   <div style={{ marginBottom: "0.5rem" }}>{icon}</div>
     <h4 style={{ fontSize: "1rem", color: "#b0b0b0", marginBottom: "0.25rem" }}>{title}</h4>
    <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff" }}>{value}</p>
     </div>
);

const ProgressRow = ({
  label,
  color,
  value,
}: {
  label: string;
  color: string;
  value: number;
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setProgress(Math.min(value * 10, 100)), 200);
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <div style={{ marginBottom: "1.2rem" }}>
       <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          fontSize: "0.9rem",
          color: "#b0b0b0",
          width: "100%",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontWeight: 500,
            whiteSpace: "normal",
            overflow: "visible",
            textOverflow: "ellipsis",
            flex: "1",
            minWidth: "80px",
          }}
        >
          {label}
        </span>

        <span
          style={{
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {value}
        </span>
      </div>

      {/* Animated Progress Bar */}
      <div
        style={{
          background: "#1e1e1e",
          height: "8px",
          borderRadius: "5px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            background: color,
            height: "100%",
            transition: "width 0.8s ease-in-out",
          }}
        />
      </div>
    </div>
  );
};



export default Analytics;