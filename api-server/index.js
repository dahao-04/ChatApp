const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./config/db');
const cookieParser = require('cookie-parser');
const app = express();
const AppError = require('./utils/AppError');
const errorHandler = require('./middleware/errorHandler');
const userRoute = require('./routes/userRoute');
const groupRoute = require('./routes/groupRoute');
const messageRoute = require('./routes/messageRoute');
const authRoute = require('./routes/authRoute');
const conversationRoute = require('./routes/conversationRoute');
const uploadRoute = require('./routes/uploadImgRoute');
const stickerRoute = require('./routes/stickerRoute');
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'https://chat-brevdeisw-haodas-projects.vercel.app',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


db();

app.use('/user', userRoute);
app.use('/group', groupRoute);
app.use('/mess', messageRoute);
app.use('/conversation', conversationRoute);
app.use('/auth', authRoute);
app.use('/upload', uploadRoute);
app.use('/sticker', stickerRoute);

app.use((req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
  });
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})