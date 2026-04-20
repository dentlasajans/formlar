import express from 'express';
import { File } from 'megajs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // MEGA folder setup
  const folderURL = process.env.MEGA_FOLDER_URL || '';

  const getFiles = async () => {
    if (!folderURL) return [];
    try {
      const folder = File.fromURL(folderURL);
      await folder.loadAttributes();
      
      // Filter children
      const files: any[] = [];
      folder.children?.forEach((file: any) => {
        if (!file.name) return;
        const ext = path.extname(file.name).toLowerCase();
        if (['.xlsx', '.xls', '.docx', '.doc'].includes(ext)) {
          files.push({
            name: file.name,
            handle: file.handle
          });
        }
      });
      return files;
    } catch (error) {
      console.error('MEGA API error:', error);
      return [];
    }
  };

  // API route
  app.get('/api/files', async (req, res) => {
    const files = await getFiles();
    res.json(files);
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
