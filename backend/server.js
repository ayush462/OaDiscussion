require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");

require("./config/passport");
const connectDB = require("./config/db");

const app = express();

// Connect MongoDB
connectDB();

// CORS (Vite frontend)
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Middlewares
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use("/auth", require("./routes/auth.routes"));


app.listen(5000, () => {
  console.log(" Server running on http://localhost:5000");
});
