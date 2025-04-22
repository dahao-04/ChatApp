const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const app = express();
const userRoute = require('./routes/userRoute');
const groupRoute = require('./routes/groupRoute');
const messageRoute = require('./routes/messageRoute');
const authRoute = require('./routes/authRoute');
const conversationRoute = require('./routes/conversationRoute');

app.use(cors());
app.use(express.json());

db();

app.use('/user', userRoute);
app.use('/group', groupRoute);
app.use('/mess', messageRoute);
app.use('/conversation', conversationRoute);
app.use('/auth', authRoute);

app.listen(3000, () => {
    console.log("Server is running on port http://localhost:3000");
})