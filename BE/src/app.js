require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { generalLimiter } = require('./config/rateLimit');

const healthRouter   = require('./routes/health.route');
const authRouter     = require('./routes/auth.route');
const adminRouter    = require('./routes/admin.route');
const questionRouter   = require('./routes/question.route');
const aiRouter         = require('./routes/ai.route');
const interviewRouter  = require('./routes/interview.route');
const feedbackRouter   = require('./routes/feedback.route');
const userRouter       = require('./routes/user.route');
const socialRouter     = require('./routes/social.route');
const chatRouter       = require('./routes/chat.route');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(generalLimiter);

// Routes
app.use('/api/health',    healthRouter);
app.use('/api/auth',     authRouter);
app.use('/api/admin',    adminRouter);
app.use('/api/questions',  questionRouter);
app.use('/api/ai',         aiRouter);
app.use('/api/interviews', interviewRouter);
app.use('/api/feedback',   feedbackRouter);
app.use('/api/users',      userRouter);
app.use('/api/social',     socialRouter);
app.use('/api/chat',       chatRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
