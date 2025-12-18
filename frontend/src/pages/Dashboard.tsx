import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";

/* ================= TYPES ================= */
type Task = {
  id: string;
  title: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string;
  isOverdue: boolean;
  createdAt: string;
};

let socket: Socket | null = null;

/* ================= COMPONENT ================= */
const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // filters
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "OPEN" | "IN_PROGRESS" | "COMPLETED"
  >("ALL");
  const [priorityFilter, setPriorityFilter] = useState<
    "ALL" | "LOW" | "MEDIUM" | "HIGH"
  >("ALL");
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<
    "NEWEST" | "OLDEST" | "DUE_SOON" | "DUE_LATE"
  >("NEWEST");

  const { logout } = useAuth();
  const navigate = useNavigate();

  /* ================= AUTH ================= */
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /* ================= FETCH ================= */
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tasks/my");
      setTasks(res.data);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= SOCKET ================= */
  useEffect(() => {
    fetchTasks();

    socket = io("http://localhost:5000");

    socket.on("task:created", (task: Task) => {
      setTasks((prev) =>
        prev.some((t) => t.id === task.id) ? prev : [task, ...prev]
      );
    });

    socket.on("task:updated", (task: Task) => {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    });

    socket.on("task:deleted", ({ id }: { id: string }) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    });

    return () => {
      socket?.disconnect();
    };
  }, []);

  /* ================= CRUD ================= */
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setDueDate("");
    setEditingTaskId(null);
  };

  const createTask = async () => {
    if (!title.trim()) return alert("Title required");
    await api.post("/tasks", {
      title,
      description,
      priority,
      dueDate: dueDate || null,
    });
    resetForm();
  };

  const updateTask = async () => {
    if (!editingTaskId) return;

    const task = tasks.find((t) => t.id === editingTaskId);
    if (task?.status === "COMPLETED") {
      alert("Completed task cannot be edited");
      return;
    }

    await api.put(`/tasks/${editingTaskId}`, {
      title,
      description,
      priority,
      dueDate: dueDate || null,
    });
    resetForm();
  };

  const updateStatus = async (id: string, status: Task["status"]) => {
    await api.patch(`/tasks/${id}/status`, { status });
  };

  const deleteTask = async (id: string) => {
    if (!confirm("Delete task?")) return;
    await api.delete(`/tasks/${id}`);
  };

  /* ================= STATS ================= */
  const total = tasks.length;
  const open = tasks.filter((t) => t.status === "OPEN").length;
  const progress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const overdue = tasks.filter((t) => t.isOverdue).length;

  /* ================= DUE BADGE ================= */
  const getDueBadge = (due?: string) => {
    if (!due) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(due);
    d.setHours(0, 0, 0, 0);
    const diff =
      (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

    if (diff < 0) return { label: "OVERDUE", color: "bg-red-100 text-red-600" };
    if (diff === 0) return { label: "TODAY", color: "bg-orange-100 text-orange-600" };
    if (diff === 1) return { label: "TOMORROW", color: "bg-yellow-100 text-yellow-600" };
    return {
      label: `IN ${Math.ceil(diff)} DAYS`,
      color: "bg-green-100 text-green-600",
    };
  };

  /* ================= FILTER + SORT ================= */
  const filteredTasks = tasks
    .filter((t) =>
      statusFilter === "ALL" ? true : t.status === statusFilter
    )
    .filter((t) =>
      priorityFilter === "ALL" ? true : t.priority === priorityFilter
    )
    .filter((t) => (showOverdueOnly ? t.isOverdue : true))
    .sort((a, b) => {
      if (sortOrder === "NEWEST")
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortOrder === "OLDEST")
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

      const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;

      return sortOrder === "DUE_SOON" ? aDue - bDue : bDue - aDue;
    });

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-6">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto flex justify-between mb-6">
        <h1 className="text-4xl font-bold">Task Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* STATS */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          ["Total", total],
          ["Open", open],
          ["In Progress", progress],
          ["Completed", completed],
          ["Overdue", overdue],
        ].map(([label, value]) => (
          <div key={label} className="bg-white p-4 rounded shadow text-center">
            <p className="text-gray-500">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="max-w-6xl mx-auto bg-white p-4 rounded shadow flex flex-wrap gap-3 mb-6">
        <select onChange={(e) => setStatusFilter(e.target.value as any)}>
          <option value="ALL">All Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <select onChange={(e) => setPriorityFilter(e.target.value as any)}>
          <option value="ALL">All Priority</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        <select onChange={(e) => setSortOrder(e.target.value as any)}>
          <option value="NEWEST">Newest</option>
          <option value="OLDEST">Oldest</option>
          <option value="DUE_SOON">Due Soon</option>
          <option value="DUE_LATE">Due Late</option>
        </select>

        <button
          onClick={() => setShowOverdueOnly((p) => !p)}
          className={`px-4 py-2 rounded ${
            showOverdueOnly ? "bg-red-500 text-white" : "border"
          }`}
        >
          Overdue Only
        </button>
      </div>

      {/* FORM */}
      <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl mb-3">
          {editingTaskId ? "Edit Task" : "Create Task"}
        </h2>

        <input
          className="w-full border p-2 mb-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full border p-2 mb-2"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="date"
          className="w-full border p-2 mb-2"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <select
          className="w-full border p-2 mb-3"
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value as Task["priority"])
          }
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>

        <button
          onClick={editingTaskId ? updateTask : createTask}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          {editingTaskId ? "Update Task" : "Create Task"}
        </button>
      </div>

      {/* TASK LIST */}
      <div className="max-w-6xl mx-auto space-y-4">
        {loading && <p>Loading...</p>}

        <AnimatePresence>
          {filteredTasks.map((task) => {
            const badge = getDueBadge(task.dueDate);
            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-4 rounded shadow border-l-4 ${
                  task.isOverdue ? "bg-red-50 border-red-500" : "bg-white"
                }`}
              >
                <h3 className="font-bold flex items-center gap-2">
                  {task.title}
                  {badge && (
                    <span
                      className={`px-2 py-1 text-xs rounded ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  )}
                </h3>

                <p className="text-gray-600">{task.description}</p>

                <div className="flex gap-3 mt-3">
                  <select
                    value={task.status}
                    disabled={task.status === "COMPLETED"}
                    onChange={(e) =>
                      updateStatus(
                        task.id,
                        e.target.value as Task["status"]
                      )
                    }
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>

                  <button
                    disabled={task.status === "COMPLETED"}
                    onClick={() => {
                      setEditingTaskId(task.id);
                      setTitle(task.title);
                      setDescription(task.description);
                      setPriority(task.priority);
                      setDueDate(
                        task.dueDate
                          ? task.dueDate.split("T")[0]
                          : ""
                      );
                    }}
                    className="text-blue-600 disabled:opacity-40"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {!loading && filteredTasks.length === 0 && (
          <p className="text-center text-gray-500">No tasks found</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;