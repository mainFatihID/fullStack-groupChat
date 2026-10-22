import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../configs/cloudinaryConfig.ts';

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'profile_pictures',
            allowed_formats: ['jpg', 'png', 'jpeg'],
            public_id: `user_${Date.now}`
        };
    }
});

const upload = multer({ storage: storage });

export default upload;