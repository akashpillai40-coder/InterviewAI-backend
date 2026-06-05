const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/interview', require('./routes/interviewRoutes'));

// test route
app.get('/', (req, res) => {
  res.json({ message: 'InterviewAI API running' });
});

// socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_interview', (interviewId) => {
    socket.join(interviewId);
    console.log(`Socket joined room: ${interviewId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// export io to use in controllers
app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});