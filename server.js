const dotenv = require("dotenv");
// Set up environment variables configuration
var nodeEnvironment = process.env.NODE_ENV || "development";
dotenv.config({ path: `./${nodeEnvironment}.env` });

const app = require("./app");

const PORT = process.env.PORT || 4000;

process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception: ", err.message);
  console.log("Closing server now...");
  process.exit(1);
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err);
  console.log("Closing server now...");
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully");
  server.close(() => {
    console.log("Closed out remaining connections");
    process.exit(0);
  });
});
