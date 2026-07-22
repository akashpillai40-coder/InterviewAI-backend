const http = require("http");
const socketio = require("socket.io");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const app = require("./app");

dotenv.config();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Socket.io
const io = socketio(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io available in controllers
app.set("io", io);

// Socket Events
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join_interview", (interviewId) => {
    socket.join(interviewId);
    console.log(`Socket joined room: ${interviewId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();