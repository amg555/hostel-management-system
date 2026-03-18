// src/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'misc';
    
    if (file.fieldname === 'photo') folder = 'photos';
    else if (file.fieldname === 'document') folder = 'documents';
    else if (file.fieldname === 'attachment') folder = 'attachments';
    
    const dir = path.join(uploadDir, folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    photo: /jpeg|jpg|png|gif/,
    document: /pdf|doc|docx|xls|xlsx/,
    attachment: /jpeg|jpg|png|gif|pdf|doc|docx/
  };
  
  const extname = allowedTypes[file.fieldname] || allowedTypes.attachment;
  const isValid = extname.test(path.extname(file.originalname).toLowerCase());
  
  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload;