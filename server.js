const express = require("express");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const { default: mongoose } = require("mongoose");
const multer = require("multer");
const path = require("path");
const foodRouter = require("./routes/Food.route");
const { logger } = require("./middlewares/logEvents");
const errorHandler = require("./middlewares/errorHandler");
require("dotenv").config();
const verifyJWT = require("./middlewares/verifyJWT");

const app = express();
const PORT = process.env.PORT || 2025;

// Logging middleware
app.use(logger);

// Cross-Origin Resource Sharing (CORS) setup
app.use(cors(corsOptions));

// built-in middleware for JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Mongoose setup
const uri = process.env.MONGO_URI;
mongoose.connect(uri).catch((err) => {
  console.error("MongoDB connection error:", err);
});
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB connection established");
});

// Middleware to check API key
// function checkApiKey(req, res, next) {
//   const apiKey = req.header("x-api-key");
//   if (apiKey && apiKey === process.env.API_KEY) {
//     next();
//   } else {
//     res.status(401).json({ error: "Unauthorized" });
//   }
// }

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.IMAGE_LOCATION);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const filePath = path.join(process.env.IMAGE_LOCATION, req.file.filename);
  res.status(200).json({ message: "File uploaded successfully", filePath });
});

app.use("/image", express.static(process.env.IMAGE_LOCATION));

// Routes
app.use("/register", require("./routes/register"));
app.use("/auth", require("./routes/auth"));
app.use(verifyJWT);
app.use("/food" , foodRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
