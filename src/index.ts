import "dotenv/config";
import express, { Request, Response } from "express";
import { pool } from "./database";
import authRoutes from "./routes/auth";
import usersRoutes from "./routes/users";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// connect the route modules
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
