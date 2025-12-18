import { useState } from "react";
import api from "../api/axios";

type Props = {
  onTaskCreated: () => void;
};

const CreateTask = ({ onTaskCreated }: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/tasks", {
        title,
        description,
        priority,
      });

      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      onTaskCreated();
    } catch (err) {
      alert("Task creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submitHandler} style={{ marginBottom: "20px" }}>
      <h3>Create Task</h3>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <br />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <br />

      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option value="LOW">LOW</option>
        <option value="MEDIUM">MEDIUM</option>
        <option value="HIGH">HIGH</option>
      </select>

      <br />

      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Task"}
      </button>
    </form>
  );
};

export default CreateTask;