const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

dotenv.config();

// 1️⃣ Connect to MongoDB
connectDB();

// 2️⃣ Load all models (VERY IMPORTANT)
require("./models"); // 👈 create this folder/file

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

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/assignments", require("./routes/assignmentRoutes"));
app.use("/api/submissions", require("./routes/submissionRoutes"));
app.use("/api/quizzes", require("./routes/quizRoutes"));
app.use("/api/forum", require("./routes/forumRoutes"));

app.get("/", (req, res) => {
  res.send("SimplyLearn API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
