const multer = require("multer");
const path = require("path");

// Set storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the folder to save the files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Add a unique timestamp to the filename
  }
});

// File filter (optional) - restricts file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Only .jpg, .jpeg, and .png images are allowed'), false); // Reject the file
  }
};

// Initialize multer with storage and file filter
const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;