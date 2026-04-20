import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { File } from "megajs";
import * as XLSX from "xlsx";
import mammoth from "mammoth";

const PORT = 3000;

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Mega.nz Folder Connection endpoint
  app.post("/api/mega/connect", async (req, res) => {
    const { link } = req.body;
    if (!link) {
      return res.status(400).json({ error: "Mega linki gereklidir." });
    }
    
    try {
      const folder = File.fromURL(link);
      await folder.loadAttributes();
      
      const files: any[] = [];
      
      const collectFiles = (node: any) => {
          if (node.directory) {
              if (node.children) {
                  node.children.forEach(collectFiles);
              }
          } else {
              const name = node.name || '';
              const lowerName = name.toLowerCase();
              if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls') || lowerName.endsWith('.docx')) {
                  files.push({
                      id: node.id || Math.random().toString(),
                      name: name,
                      size: formatBytes(node.size),
                      type: lowerName.includes('.xls') ? 'excel' : 'word',
                      date: node.timestamp ? new Date(node.timestamp * 1000).toISOString().split('T')[0] : 'Bilinmiyor'
                  });
              }
          }
      };

      if (folder.directory && folder.children) {
          folder.children.forEach(collectFiles);
      } else {
          // Might be a single file link instead of a folder, supported as well
          collectFiles(folder);
      }

      res.json({ success: true, files });
    } catch (error: any) {
      console.error("Mega connection error:", error);
      res.status(500).json({ error: "Bağlantı hatası: Geçersiz link veya klasör bulunamadı." });
    }
  });

  // HTML Extraction for Printing endpoint
  app.post("/api/mega/print", async (req, res) => {
    const { link, fileName } = req.body;

    try {
      const folder = File.fromURL(link);
      await folder.loadAttributes();
      
      let targetNode: any = null;
      
      const findNode = (node: any) => {
          if (node.directory && node.children) {
              node.children.forEach(findNode);
          } else if (node.name === fileName) {
              targetNode = node;
          }
      };

      if (folder.directory && folder.children) {
          folder.children.forEach(findNode);
      } else if (folder.name === fileName) {
          targetNode = folder;
      }

      if (!targetNode) {
          return res.status(404).json({ error: "Dosya Mega klasöründe bulunamadı." });
      }

      // Buffer download from Mega
      const rawData = await targetNode.downloadBuffer();
      const buffer = Buffer.isBuffer(rawData) ? rawData : Buffer.from(rawData);
      let html = '';

      const lowerName = fileName.toLowerCase();
      if (lowerName.endsWith('.docx')) {
          // Parse Word document to HTML
          const result = await mammoth.convertToHtml({ buffer });
          html = `<div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto;">${result.value}</div>`;
      } else if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
          // Parse Excel spreadsheet to HTML
          const workbook = XLSX.read(buffer, { type: 'buffer' });
          for (const sheetName of workbook.SheetNames) {
              const sheet = workbook.Sheets[sheetName];
              html += `<div style="font-family: Arial, sans-serif; page-break-after: always;">`;
              html += `<h2 style="margin-top: 24px; margin-bottom: 16px; font-size: 20px;">${sheetName}</h2>`;
              
              let tableHtml = XLSX.utils.sheet_to_html(sheet);
              // Cleanly style the generated raw table for print purposes
              tableHtml = tableHtml.replace(/<table/g, '<table style="min-width: 100%; border-collapse: collapse; margin-bottom: 30px;" border="1" cellpadding="8"')
                                   .replace(/<th/g, '<th style="background-color: #f3f4f6; text-align: left;"')
                                   .replace(/<td/g, '<td style="border: 1px solid #d1d5db;"');
              
              html += tableHtml;
              html += `</div>`;
          }
      }

      res.json({ success: true, html });

    } catch (error: any) {
      console.error("Mega payload extraction error:", error);
      res.status(500).json({ error: "Dosya çözümlenirken hata oluştu." });
    }
  });

  // Development Vite Middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
