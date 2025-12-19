"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTaskStatus = exports.updateTask = exports.getMyTasks = exports.createTask = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// helper: check overdue
const isTaskOverdue = (dueDate, status) => {
    if (!dueDate)
        return false;
    if (status === "COMPLETED")
        return false;
    return new Date(dueDate) < new Date();
};
/**
 * POST /api/tasks
 */
const createTask = async (req, res) => {
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
                priority: priority ?? client_1.TaskPriority.MEDIUM,
                status: client_1.TaskStatus.OPEN,
                dueDate: dueDate ? new Date(dueDate) : null,
                createdById: userId,
                assignedToId: userId,
            },
        });
        res.status(201).json({
            ...task,
            isOverdue: isTaskOverdue(task.dueDate, task.status),
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Task creation failed" });
    }
};
exports.createTask = createTask;
/**
 * GET /api/tasks/my
 */
const getMyTasks = async (req, res) => {
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch tasks" });
    }
};
exports.getMyTasks = getMyTasks;
/**
 * PUT /api/tasks/:id
 */
const updateTask = async (req, res) => {
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Task update failed" });
    }
};
exports.updateTask = updateTask;
/**
 * PATCH /api/tasks/:id/status
 */
const updateTaskStatus = async (req, res) => {
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Status update failed" });
    }
};
exports.updateTaskStatus = updateTaskStatus;
/**
 * DELETE /api/tasks/:id
 */
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.task.delete({ where: { id } });
        res.json({ message: "Task deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Task deletion failed" });
    }
};
exports.deleteTask = deleteTask;
