const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const axios = require('axios'); // To download images from URLs

const app = express();
app.use(express.json()); // Parse JSON requests

// Create the upload directory if it doesn't exist
const uploadDir = './upload/images';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Download image from a given URL
const downloadImage = async (url) => {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary');
};

// Get the file size in bytes
const getFileSize = (filePath) => {
    const stats = fs.statSync(filePath);
    return stats.size;
};

// Handle JSON input to download and compress image
app.post('/upload', async (req, res) => {
    const { url_gambar, persentase_kompresi } = req.body;

    if (!url_gambar || typeof persentase_kompresi !== 'number') {
        return res.status(400).json({
            status: 400,
            message: 'Invalid input. Provide both "url_gambar" and "persentase_kompresi".',
        });
    }

    if (persentase_kompresi < 1 || persentase_kompresi > 100) {
        return res.status(400).json({
            status: 400,
            message: 'Compression percentage must be between 1 and 100.',
        });
    }

    const filename = `image_${Date.now()}.webp`; // Save as WEBP
    const outputPath = path.join(uploadDir, filename);

    try {
        // Download the image from the provided URL
        const imageBuffer = await downloadImage(url_gambar);

        // Compress and save the image as WEBP
        await sharp(imageBuffer)
            .webp({ quality: persentase_kompresi }) // Use the specified compression
            .toFile(outputPath);

        // Get the size of the compressed image
        const ukuran_webp = getFileSize(outputPath);

        res.json({
            status: 200,
            message: 'Image successfully processed.',
            url_webp: `http://localhost:4000/profile/${filename}`,
            ukuran_webp: ukuran_webp, // Size in bytes
        });
    } catch (err) {
        console.error('Error processing image:', err);
        res.status(500).json({
            status: 500,
            message: 'Image processing failed. Please check the URL and try again.',
        });
    }
});

// Serve static files from the upload directory
app.use('/profile', express.static(uploadDir));

// Error handler for multer
function errHandler(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ status: 400, message: err.message });
    }
    next(err);
}
app.use(errHandler);

// Start the server
app.listen(4000, () => {
    console.log('Server up and running on port 4000');
});
