

type Task = () => Promise<void> | void;
type ScheduledTask = {
  id: string;
  task: Task;
  timer?: Timer;
};

 class TaskScheduler {
  private tasks: Map<string, ScheduledTask>;

  constructor() {
    this.tasks = new Map();
  }

  // Run task immediately
  async executeNow(task: Task): Promise<void> {
    try {
      await task();
    } catch (error) {
      console.error('Task execution failed:', error);
    }
  }

  // Schedule task with delay
  scheduleOnce(task: Task, delayMs: number): string {
    const id = crypto.randomUUID();
    const timer = setTimeout(async () => {
      await this.executeNow(task);
      this.tasks.delete(id);
    }, delayMs);

    this.tasks.set(id, { id, task, timer });
    return id;
  }

  // Schedule recurring task
  scheduleRecurring(task: Task, intervalMs: number): string {
    const id = crypto.randomUUID();
    const timer = setInterval(async () => {
      await this.executeNow(task);
    }, intervalMs);

    this.tasks.set(id, { id, task, timer });
    return id;
  }

  // Cancel scheduled task
  cancel(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (task?.timer) {
      clearTimeout(task.timer);
      this.tasks.delete(taskId);
      return true;
    }
    return false;
  }

  // Cancel all tasks
  cancelAll(): void {
    for (const [id] of this.tasks) {
      this.cancel(id);
    }
  }
}



declare module "bun" {
  interface Env {
    DB_PATH: string;
    VITE_BACKEND: string;
  }
}