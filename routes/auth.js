import express from 'express';
import { register, verifyEmail, login } from '../controllers/authController.js';
import upload from '../config/multer.js';

const router = express.Router();

router.post('/register', upload.single('profileImage'), register);

router.get('/verify/:code', verifyEmail);

router.post('/login', login);

export default router;