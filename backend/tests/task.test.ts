import request from "supertest";
import app from "../src/app"; // make sure app.ts exports express app
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let token: string;

beforeAll(async () => {
  // Login to get token
  const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: "pooja@test.com",
      password: "123456",
    });

  token = res.body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

/* ===============================
   1️⃣ CREATE TASK TEST
================================ */
describe("Task Creation", () => {
  it("should create a task successfully", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Task",
        description: "Task created from test",
        priority: "MEDIUM",
        dueDate: "2025-01-01",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.title).toBe("Test Task");
  });
});

/* ===============================
   2️⃣ UPDATE STATUS TEST
================================ */
describe("Task Status Update", () => {
  it("should update task status to COMPLETED", async () => {
    // Create task first
    const taskRes = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Status Update Task",
        description: "Status test",
        priority: "LOW",
      });

    const taskId = taskRes.body.id;

    const res = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "COMPLETED",
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("COMPLETED");
  });
});

/* ===============================
   3️⃣ OVERDUE LOGIC TEST
================================ */
describe("Overdue Task Logic", () => {
  it("should mark task as overdue if dueDate is in past", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Overdue Task",
        description: "Past due task",
        priority: "HIGH",
        dueDate: "2020-01-01",
      });

    expect(res.status).toBe(201);
    expect(res.body.isOverdue).toBe(true);
  });
});