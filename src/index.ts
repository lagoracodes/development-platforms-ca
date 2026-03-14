import express, { Request, Response } from "express";
import { pool } from "./database";

const app = express();
const PORT = process.env.PORT || 3000;

// testing the database connection
app.get("/test-db", async (req: Request, res: Response) => {
  try {
    await pool.query("SELECT 1");
    res.send("Connected to database");
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).send("Failed to connect to database");
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));