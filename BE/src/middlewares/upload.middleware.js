const multer  = require('multer');
const stream  = require('stream');
const cloudinary = require('../config/cloudinary');

// Chỉ nhận video và audio, giới hạn 200MB
const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['video/', 'audio/'];
    if (allowed.some((type) => file.mimetype.startsWith(type))) {
      cb(null, true);
    } else {
      cb(new Error('Only video and audio files are allowed'), false);
    }
  },
});

/**
 * Upload buffer lên Cloudinary
 * @param {Buffer} buffer
 * @param {object} options - cloudinary upload_stream options
 * @returns {Promise<object>} cloudinary result
 */
const uploadToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });

    const readable = new stream.PassThrough();
    readable.end(buffer);
    readable.pipe(uploadStream);
  });

/**
 * Middleware: parse 1 file field "media" + upload lên Cloudinary
 * Gắn req.mediaUrl và req.mediaType sau khi upload xong
 */
const uploadMedia = [
  multerUpload.single('media'),
  async (req, res, next) => {
    if (!req.file) return next(); // không có file → bỏ qua

    try {
      const isVideo    = req.file.mimetype.startsWith('video/');
      const resourceType = isVideo ? 'video' : 'raw'; // Cloudinary dùng 'raw' cho audio
      const folder     = isVideo
        ? 'ai-mock-interview/videos'
        : 'ai-mock-interview/audio';

      const result = await uploadToCloudinary(req.file.buffer, {
        folder,
        resource_type: resourceType,
      });

      req.mediaUrl  = result.secure_url;
      req.mediaType = isVideo ? 'video' : 'audio';
      next();
    } catch (err) {
      next(err);
    }
  },
];

module.exports = { uploadMedia };
