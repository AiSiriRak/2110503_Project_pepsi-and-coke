const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

// === Route files ===
// const auth = require("./routes/auth");
// const coworkingspaces = require("./routes/coworkingspaces");
// const reservations = require("./routes/reservations");

// === Load env vars ===
dotenv.config({ path: "./config/config.env" });

// === Connect to Database ===
connectDB();

const app = express();
app.set("query parser", "extended");

// === Body parser ===
app.use(express.json());

// === Cookie parser ===
app.use(cookieParser());

// === Mount routers ===
// app.use("/api/v1/auth", auth);
// app.use("/api/v1/coworkingspaces", coworkingspaces);
// app.use("/api/v1/reservations", reservations);

const PORT = process.env.PORT || 5000;
app.listen(
  PORT,
  console.log(
    "Server running in ",
    process.env.NODE_ENV,
    " mode on port ",
    PORT,
  ),
);

// === Handle unhandled promise rejections ===
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // === Close server & exit process ===
  ServerApiVersion.close(() => process.exit(1));
});
