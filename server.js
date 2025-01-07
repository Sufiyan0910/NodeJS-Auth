require("dotenv").config();
const express = require("express");
const connectToDB = require("./database/db");
const authRoutes = require("./routes/auth-routes");
const homeRoutes = require("./routes/home-routes");
const adminRoutes = require("./routes/admin-routes");
const uploadImageRoutes = require("./routes/image-routes");

connectToDB();

const app = express();
const port = process.env.port || 3000;

// Middleware
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/image", uploadImageRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// const PORT = process.env.PORT || 3000;

// const server = app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// server.on('error', (err) => {
//   if (err.code === 'EADDRINUSE') {
//     console.error(`Port ${PORT} is already in use. Please use a different port.`);
//   } else {
//     console.error('Server error:', err);
//   }
// });
