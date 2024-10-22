const express_ = require('express');
const fs = require('fs');
const sharp = require('sharp');
const apps = express_();

const multer = require("multer");
const path = require("path");

// storage engine 

// Create the upload directory if it doesn't exist
const uploadDir = './upload/images';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage engine
const storage = multer.memoryStorage(); // Store file in memory temporarily

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // Limit to 1MB
});

apps.use('/profile', express_.static(uploadDir));
apps.post('/upload', upload.single('profile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: 0, message: 'No file uploaded' });
    }

    const filename = `${req.file.fieldname}_${Date.now()}.webp`; // Save as WEBP
    const outputPath = path.join(uploadDir, filename);

    try {
        // Convert the uploaded image to WEBP with 60% quality
        await sharp(req.file.buffer)
            .webp({ quality: 60 }) // Compress to 60% quality
            .toFile(outputPath);

        res.json({
            success: 1,
            profile_url: `http://localhost:4000/profile/${filename}`,
        });
    } catch (err) {
        console.error('Error processing image:', err);
        res.status(500).json({ success: 0, message: 'Image processing failed' });
    }

});

// Error handler for multer
function errHandler(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: 0, message: err.message });
    }
    next(err);
}
apps.use(errHandler);

// Start the server
apps.listen(4000, () => {
    console.log('Server up and running on port 4000');
});
