const mongoose = require("mongoose");
const { config } = require("dotenv");
const http = require("http");
const { IO } = require("./io"); // Assuming io.js is in the same directory
config({ path: "./.env.local" });

const app = require("./app"); // Importing app from app.js

const DB = process.env.DB_URL;
console.log(DB);
mongoose.connect(DB, {}).then(() => console.log("DB connection successful!"));

const httpServer = http.createServer(app); //created the http server
const io = IO(httpServer); // initalized socketIo server

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
