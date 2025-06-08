const express = require('express');
const courseRoutes = require('./routes/courseRoutes');
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require('./routes/authRoutes');
const codeUpdateRoutes = require('./routes/CodeUpdateRoutes');
const uploadPOCRouter = require('./pocManagement');
const SearchRoutes = require("./routes/SearchRoutes");
 
require('dotenv').config();
const cors = require('cors');
const webinarRoutes = require('./routes/webinarRoutes');
const path = require('path');

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes setup
app.use('/api/courses', courseRoutes); // Removed upload.single() from here
app.use('/api/webinars', webinarRoutes);
app.use("/api/admins", adminRoutes);
app.use('/api', authRoutes);
app.use('/api/code', codeUpdateRoutes);
app.use('/api', uploadPOCRouter);
app.use('/api', SearchRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});