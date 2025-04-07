import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import * as z from "zod";
import { insertPatternSchema } from "@shared/schema";
import path from "path";
import fs from "fs";

// Set up multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Solo se permiten archivos JPG o PNG'));
    }
    cb(null, true);
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', (req, res, next) => {
    // Only allow GET requests to access files
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
    next();
  }, (req: Request, res: Response, next) => {
    const filePath = path.join(uploadsDir, path.basename(req.path));
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).json({ message: 'File not found' });
      }
      next();
    });
  }, (req, res, next) => {
    // Simple security check to prevent directory traversal
    const requestPath = path.normalize(req.path).replace(/^(\.\.(\/|\\|$))+/, '');
    const filePath = path.join(uploadsDir, requestPath);
    if (!filePath.startsWith(uploadsDir)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  }, (req, res) => {
    const filePath = path.join(uploadsDir, path.basename(req.path));
    res.sendFile(filePath);
  });

  // API route to upload image
  app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No se ha subido ninguna imagen' });
      }

      const imagePath = await storage.saveUploadedImage(
        req.file.buffer,
        req.file.originalname
      );

      return res.status(200).json({ 
        message: 'Imagen subida correctamente',
        imagePath 
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Error al subir la imagen' });
    }
  });

  // API route to save pattern
  app.post('/api/patterns', async (req, res) => {
    try {
      const patternData = insertPatternSchema.parse(req.body);
      const savedPattern = await storage.savePattern(patternData);
      
      return res.status(201).json(savedPattern);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Error al guardar el patrón' });
    }
  });

  // API route to get a pattern by ID
  app.get('/api/patterns/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID de patrón inválido' });
      }

      const pattern = await storage.getPattern(id);
      if (!pattern) {
        return res.status(404).json({ message: 'Patrón no encontrado' });
      }

      return res.status(200).json(pattern);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Error al obtener el patrón' });
    }
  });

  // API route to get patterns by user ID
  app.get('/api/users/:userId/patterns', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'ID de usuario inválido' });
      }

      const patterns = await storage.getPatternsByUserId(userId);
      return res.status(200).json(patterns);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Error al obtener los patrones' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
