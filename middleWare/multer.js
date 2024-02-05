const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, './uploads');
  },
  filename(req, file, callback) {
    callback(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileExtension: (req, file, callback) => {
    const extname = path.extname(file.originalname);
    if (extname === '.jpg' || extname === '.jpeg') {
      callback(null, true);
    }
    callback(null, false);
  },
});

const multerError = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      res.status(400).json({ success: false, message: err.message });
    } else {
      next();
    }
  });
};

module.exports = { upload, multerError };
