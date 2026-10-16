const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Route files
const auth = require('./routes/auth');
const coworkingSpaces = require('./routes/coworkingSpaces');

// Load env vars
dotenv.config({ path: './src/config/config.env' });

// Connect to Database
connectDB();

const app = express();
app.set('query parser', 'extended');

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

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, _promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
