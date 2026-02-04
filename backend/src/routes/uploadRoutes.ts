import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Upload single image
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'safepath',
      resource_type: 'auto',
    });

    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message,
    });
  }
});

export default router;
