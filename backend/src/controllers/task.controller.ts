import { Request, Response } from "express";
import { PrismaClient, TaskStatus, TaskPriority } from "@prisma/client";

const prisma = new PrismaClient();

// helper: check overdue
const isTaskOverdue = (dueDate: Date | null, status: TaskStatus) => {
  if (!dueDate) return false;
  if (status === "COMPLETED") return false;
  return new Date(dueDate) < new Date();
};

/**
 * POST /api/tasks
 */
export const createTask = async (req: any, res: Response) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority ?? TaskPriority.MEDIUM,
        status: TaskStatus.OPEN,
        dueDate: dueDate ? new Date(dueDate) : null,
        createdById: userId,
        assignedToId: userId,
      },
    });

    res.status(201).json({
      ...task,
      isOverdue: isTaskOverdue(task.dueDate, task.status),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Task creation failed" });
  }
};

/**
 * GET /api/tasks/my
 */
export const getMyTasks = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const tasks = await prisma.task.findMany({
      where: {
        OR: [{ assignedToId: userId }, { createdById: userId }],
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = tasks.map((task) => ({
      ...task,
      isOverdue: isTaskOverdue(task.dueDate, task.status),
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

/**
 * PUT /api/tasks/:id
 */
export const updateTask = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, priority, dueDate } = req.body;

    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    res.json({
      ...task,
      isOverdue: isTaskOverdue(task.dueDate, task.status),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Task update failed" });
  }
};

/**
 * PATCH /api/tasks/:id/status
 */
export const updateTaskStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await prisma.task.update({
      where: { id },
      data: { status },
    });

    res.json({
      ...task,
      isOverdue: isTaskOverdue(task.dueDate, task.status),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Status update failed" });
  }
};

/**
 * DELETE /api/tasks/:id
 */
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.task.delete({ where: { id } });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Task deletion failed" });
  }
};