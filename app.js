const express = require('express');
const app = express();
const multer = require("multer");
const path = require("path");
const fs = require('fs');
const sharp = require('sharp');


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

app.use('/profile', express.static(uploadDir));
app.post('/upload', upload.single('profile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: 0, message: 'No file uploaded' });
    }

    /*

    const filename = `${req.file.fieldname}_${Date.now()}${path.extname(req.file.originalname)}`;
    const outputPath = path.join(uploadDir, filename);

    try {
        // Compress and save the image using sharp
        await sharp(req.file.buffer)
            .resize(800) // Resize width to 800px (maintains aspect ratio)
            .jpeg({ quality: 80 }) // Compress to 80% quality
            .toFile(outputPath);

        res.json({
            success: 1,
            profile_url: `http://localhost:4000/profile/${filename}`,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: 0, message: 'Image processing failed' });
    }
    */

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
app.use(errHandler);

// Start the server
app.listen(4000, () => {
    console.log('Server up and running on port 4000');
});
