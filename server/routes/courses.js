const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { 
  getCourses, 
  createCourse, 
  getCourse, 
  updateCourse, 
  deleteCourse,
  getModules,
  createModule,
  updateModule,
  deleteModule,
  getSections,
  createSection,
  updateSection,
  deleteSection
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

// Setup multer storage for PDF/document uploads
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `doc-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx|ppt|pptx|txt|png|jpg|jpeg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only document files (PDF, DOC, DOCX, etc.) are allowed!'));
  }
});

router.use(protect);

// File upload endpoint for course documents
router.post('/upload', authorize('admin', 'super_admin'), upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const fileUrl = `http://192.168.1.107:5000/uploads/${req.file.filename}`;
    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: { fileUrl }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.route('/')
  .get(getCourses)
  .post(authorize('admin', 'super_admin'), createCourse);

router.route('/:id')
  .get(getCourse)
  .put(authorize('admin', 'super_admin'), updateCourse)
  .delete(authorize('admin', 'super_admin'), deleteCourse);

// Course Modules sub-routes
router.route('/:courseId/modules')
  .get(getModules)
  .post(authorize('admin', 'super_admin'), createModule);

router.route('/:courseId/modules/:id')
  .put(authorize('admin', 'super_admin'), updateModule)
  .delete(authorize('admin', 'super_admin'), deleteModule);

// Course Sections sub-routes
router.route('/:courseId/sections')
  .get(getSections)
  .post(authorize('admin', 'super_admin'), createSection);

router.route('/:courseId/sections/:id')
  .put(authorize('admin', 'super_admin'), updateSection)
  .delete(authorize('admin', 'super_admin'), deleteSection);

module.exports = router;
