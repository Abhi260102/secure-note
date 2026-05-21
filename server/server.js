const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const notesRoutes = require('./routes/notes.routes');
const { errorHandler } = require('./middleware/error.middleware');


dotenv.config();


connectDB();

const app = express();


app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);


const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));


app.use(express.json({ limit: '10kb' })); 


app.use(mongoSanitize());


if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}


app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});


app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);


app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API Route not found' });
});


app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});


process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  
  server.close(() => process.exit(1));
});
