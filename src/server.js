const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

const line = require('@line/bot-sdk');
const { handleWebhook } = require('./controllers/line');
const lineRoutes = require('./routes/line');
// const { startReminderJob } = require('./utils/reminder');

// Route files
const auth = require('./routes/auth');
const coworkingSpaces = require('./routes/coworkingSpaces');
const reservations = require('./routes/reservations');

// Load env vars
dotenv.config({ path: './src/config/config.env' });

// Connect to Database
connectDB();

const app = express();
app.set('query parser', 'extended');

// Create Line Webhook endpoint
app.post(
    '/api/v1/line/webhook',
    line.middleware({ channelSecret: process.env.LINE_CHANNEL_SECRET }),
    handleWebhook,
);

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/coworking-spaces', coworkingSpaces);
app.use('/api/v1/reservations', reservations);
app.use('/api/v1/line', lineRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(
    PORT,
    console.log(
        'Server running in ',
        process.env.NODE_ENV,
        ' mode on port ',
        PORT,
    ),
);

// startReminderJob();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, _promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
