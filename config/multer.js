import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinaryConfig.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uploads',  
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
     transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
});

const upload = multer({ storage });

export default upload;