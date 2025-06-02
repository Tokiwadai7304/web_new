require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const authRouter = require('./routers/authRouter');
const ratingRouter = require('./routers/rateRouter');
const commentRouter = require('./routers/commentRouter'); 
const movieRouter = require('./routers/movieRouter');

const app = express();

app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Connect to MongoDB local
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('✅ Connected to MongoDB');
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
});

app.use('/api/auth', authRouter);
app.use('/api/ratings', ratingRouter); // <-- THAY ĐỔI DÒNG NÀY
app.use('/api/comments', commentRouter); // <-- THAY ĐỔI DÒNG NÀY
app.use('/api/movies', movieRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

app.listen(process.env.PORT, () => {
    console.log(`🚀 Server is running on port ${process.env.PORT}`);
});