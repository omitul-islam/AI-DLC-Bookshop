import { Router, Request, Response } from 'express';
import multer from 'multer';
import { uploadBookCover } from '../utils/supabase';
import { bookService } from '../services/book.service';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, GIF, and SVG images are allowed'));
    }
  },
});

// POST /api/v1/books/:id/cover - Upload book cover image
router.post('/books/:id/cover', (req: Request, res: Response, next) => {
  upload.single('cover')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!process.env.S3_ENDPOINT) {
      return res.status(501).json({
        error: 'S3 not configured',
        hint: 'Set S3_ENDPOINT, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY in .env to enable cover uploads.',
      });
    }

    uploadBookCover(req.params.id, req.file)
      .then((coverUrl) => bookService.updateBook(req.params.id, { coverUrl }))
      .then((updated) => res.json({ coverUrl: updated.coverUrl, book: updated }))
      .catch((error: any) => {
        if (error.message?.includes('Supabase')) {
          return res.status(502).json({ error: error.message });
        }
        if (error.message === 'Book not found') {
          return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
      });
  });
});

export default router;
