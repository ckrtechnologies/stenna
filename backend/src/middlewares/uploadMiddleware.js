import multer from 'multer';

// Store files in memory to upload to Supabase
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export default upload;
