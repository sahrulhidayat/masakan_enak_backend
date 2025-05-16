const express = require("express");
const cors = require("cors");
const { default: mongoose } = require("mongoose");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 2025;

app.use(cors());
app.use(express.json());

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
function checkApiKey(req, res, next) {
  const apiKey = req.header("x-api-key");
  if (apiKey && apiKey === process.env.API_KEY) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
}

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

app.post("/upload", checkApiKey, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const filePath = path.join(process.env.IMAGE_LOCATION, req.file.filename);
  res.status(200).json({ message: "File uploaded successfully", filePath });
});

app.use("/image", express.static(process.env.IMAGE_LOCATION));

const foodRouter = require("./routes/Food.route");

app.use("/food", checkApiKey, foodRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
