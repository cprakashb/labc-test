//working code without malware check is in /labc-backend/controllers/posts.js
// To demonstrate my skills and practical understanding of the assignment, I’ve built a mock demo site.
// https://labc-test.vercel.app/
// https://github.com/cprakashb/labc-test/tree/main

const express = require('express');
const multer = require('multer');
const path = require('path');

// Multer for file uploads
const storage = multer.memoryStorage(); // Keep in memory for virus scan
const upload = multer({ storage: storage });

const router = express.Router();

router.post('/api/posts', upload.single('file'), async (req, res) => {
  try {
    const { title, body, hashtags } = req.body;
    const file = req.file;

    // Step 1: Validate required fields
    if (!title || !body || !hashtags || !file) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Step 2: Check file type (MIME)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(415).json({ error: 'Only PDF, JPG, and PNG files are allowed' });
    }

    // Reference: https://github.com/kylefarris/clamscan
    // Step 3: Stub for malware scanning 
    // Save temporarily and scan
    const { filename, tempFilePath } = saveFileToDisk(file);
    await scanUploadedFile(tempFilePath);

    // Step 4: Move to final location
    const finalDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(finalDir)) fs.mkdirSync(finalDir, { recursive: true });
    const finalFilePath = path.join(finalDir, filename);
    fs.renameSync(tempFilePath, finalFilePath);


    // Step 5: Save post to database
    const newPost = {
      id: generateId(),
      title,
      body,
      hashtags: hashtags.split(',').map(h => h.trim()),
      fileName: filename,
      createdAt: new Date()
    };

    // Step 6: Return success
    res.status(201).json({
      message: 'Post created successfully',
      post: newPost
    });
  } catch (err) {
    console.error('Error in /api/posts:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Reference : https://github.com/kylefarris/clamscan
export const scanUploadedFile = async (filePath) => {
  try {
    const clamscan = await new NodeClam().init({
      removeInfected: false,
      quarantineInfected: false,
      scanLog: null,
      debugMode: false,
      fileList: null,
      scanRecursively: true,
      clamscan: {
        path: '/usr/bin/clamscan',
        db: null,
      },
    });

    const { isInfected, viruses } = await clamscan.isInfected(filePath);

    if (isInfected) {
      logger.error(`File infected: ${filePath} | Viruses: ${viruses}`);
      throw new Error(`Uploaded file "${path.basename(filePath)}" is infected with ${viruses}`);
    }

    logger.info(`File scan passed: ${filePath}`);
  } catch (err) {
    logger.error(`Malware scan failed for file ${filePath}: ${err.message}`);
    throw err;
  }
};
module.exports = router;
