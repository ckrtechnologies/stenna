import multer from 'multer';

// Use memory storage to process CSVs directly from buffer
const storage = multer.memoryStorage();

// Filter for CSV files only
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
        cb(null, true);
    } else {
        cb(new Error('Only CSV files are allowed!'), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});
