// main.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./db/connect');

const app = express();
const PORT = process.env.PORT || 3001;
const databaseRoutes = require('./routes/database'); // Ensure the path is correct

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS middleware
app.use(cors());

app.use('/api', databaseRoutes);

const start = async () => {
    try {
        await connectDB(process.env.MONGODB_URL);
        console.log("Connected to DB");
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start the server', error);
    }
};

start();
