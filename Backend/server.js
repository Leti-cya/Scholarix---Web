require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./route/authRoute");
const scholarshipRoutes = require("./route/scholarshipRoute");
const applicationRoutes = require("./route/applicationRoute");
const notificationRoutes = require("./route/notificationRoute");
const documentRoutes = require("./route/documentRoute");
const savedScholarshipRoutes = require("./route/savedScholarshipRoute");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Scholarix API Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/scholarships", scholarshipRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/saved-scholarships", savedScholarshipRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});