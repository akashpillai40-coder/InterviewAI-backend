const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const helmet = require("helmet")
const rateLimit = require("express-rate-limit")

dotenv.config();

// connect to database
connectDB();

const app = express();
app.use(helmet())

const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'


const io = socketio(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});


        //------Application_Level Middleware-----
//1. CORS middleware
app.use(cors
  ({ 
    origin: CLIENT_URL,
    credentials: true
  }));
//2.Parsing
app.use(express.json());

//rate Limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    message: "Too many login attempts. Please try again after sometime."
  },
  standardHeaders: true,
  legacyHeaders: false,
});
//API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message: "Too many API requests. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// routes
app.use('/api/auth',authLimiter, require('./routes/authRoutes'));
app.use('/api/interview', apiLimiter, require('./routes/interviewRoutes'));


app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
});


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