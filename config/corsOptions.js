const whitelist = [
  "http://localhost:3000",
  "https://www.yoursite.com",
  "http://127.0.0.1:2025",
  "http://localhost:2025",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200, // For legacy browser support
};

module.exports = corsOptions;
