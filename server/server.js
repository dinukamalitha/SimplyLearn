const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");

dotenv.config();

// 1️⃣ Connect to MongoDB
connectDB();

// 2️⃣ Load all models (VERY IMPORTANT)
require("./models");

// 3️⃣ Force-create collections
const createCollections = async () => {
  try {
    const models = Object.values(mongoose.models);

    for (const model of models) {
      await model.createCollection();
      console.log(`${model.modelName} collection ready`);
    }
  } catch (err) {
    console.error("Collection creation error:", err.message);
  }
};

createCollections();

const app = express();

app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:5173', // Update this if your frontend runs on a different port
  credentials: true
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", require("./modules/auth/authRoutes"));
app.use("/api/courses", require("./modules/courses/courseRoutes"));
app.use("/api/assignments", require("./modules/assignments/assignmentRoutes"));
app.use("/api/submissions", require("./modules/assignments/submissionRoutes"));
app.use("/api/quizzes", require("./modules/quizzes/quizRoutes"));
app.use("/api/forum", require("./modules/engagement/forumRoutes"));
app.use("/api/dashboard", require("./modules/engagement/dashboardRoutes"));
app.use("/api/enrollments", require("./modules/engagement/enrollmentRoutes"));

app.get("/", (req, res) => {
  res.send("SimplyLearn API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
