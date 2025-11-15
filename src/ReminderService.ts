import { toast } from "react-hot-toast";

class ReminderService {
  private dueSoonInterval: any = null;
  private overdueInterval: any = null;

  private lastDueSoon: Record<string, number> = {};
  private lastOverdue: Record<string, number> = {};

  // Play sound
  private playSound() {
    const audio = new Audio("/ding.wav");
    audio.volume = 1.0;
    audio.play().catch(() => {});
  }

  // Current Lagos time
  private getLagosTime() {
    return new Date(
      new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" })
    );
  }

  // Parse due date safely
  private parseDueDate(dueDateStr: string) {
    // If plain date string
    if (/^\d{4}-\d{2}-\d{2}$/.test(dueDateStr)) {
      const [year, month, day] = dueDateStr.split("-").map(Number);
      // Create as Lagos end of day
      return new Date(Date.UTC(year, month - 1, day, 23, 59, 59));
    }
    return new Date(dueDateStr);
  }

  start(projects: any[]) {
    this.stop(); // avoid duplicates

    // Run immediately
    this.checkDueSoon(projects);
    this.checkOverdue(projects);

    // Repeat
    this.dueSoonInterval = setInterval(() => this.checkDueSoon(projects), 5 * 60 * 1000);
    this.overdueInterval = setInterval(() => this.checkOverdue(projects), 60 * 60 * 1000);
  }

  stop() {
    if (this.dueSoonInterval) clearInterval(this.dueSoonInterval);
    if (this.overdueInterval) clearInterval(this.overdueInterval);
  }

  private checkDueSoon(projects: any[]) {
    const now = this.getLagosTime();

    projects.forEach((project) => {
      project.tasks.forEach((task: any) => {
        if (!task.dueDate || task.completed) return;

        const dueDate = this.parseDueDate(task.dueDate);
        const diffMinutes = Math.floor((dueDate.getTime() - now.getTime()) / 60000);

        if (diffMinutes <= 0) return; // already overdue, skip

        const last = this.lastDueSoon[task.id] || 0;
        const minutesSinceLast = (now.getTime() - last) / 60000;

        // Fire due soon if within 30 minutes of due
        if (diffMinutes <= 30 && minutesSinceLast >= 5) {
          toast(`⏰ "${task.title}" is due in ${diffMinutes} minutes!`, {
            icon: "⏳",
            style: { background: "#facc15", color: "#000" },
          });
          this.playSound();
          this.lastDueSoon[task.id] = now.getTime();
        }
      });
    });
  }

  private checkOverdue(projects: any[]) {
    const now = this.getLagosTime();

    projects.forEach((project) => {
      project.tasks.forEach((task: any) => {
        if (!task.dueDate || task.completed) return;

        const dueDate = this.parseDueDate(task.dueDate);
        const diffMinutes = Math.floor((dueDate.getTime() - now.getTime()) / 60000);

        if (diffMinutes > 0) return; // not overdue yet

        const last = this.lastOverdue[task.id] || 0;
        const minutesSinceLast = (now.getTime() - last) / 60000;

        // Only notify once per hour
        if (minutesSinceLast >= 60) {
          toast.error(`⚠️ "${task.title}" is overdue!`, { icon: "🚨" });
          this.playSound();
          this.lastOverdue[task.id] = now.getTime();
        }
      });
    });
  }
}

export default new ReminderService();