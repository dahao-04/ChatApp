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
  origin: true,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


db();

const mainRoute = express.Router();


mainRoute.use('/user', userRoute);
mainRoute.use('/group', groupRoute);
mainRoute.use('/mess', messageRoute);
mainRoute.use('/conversation', conversationRoute);
mainRoute.use('/auth', authRoute);
mainRoute.use('/upload', uploadRoute);
mainRoute.use('/sticker', stickerRoute);

app.use('/api', mainRoute);

app.use((req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
  });
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})