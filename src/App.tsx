import React, { useState, useEffect } from 'react';
import { Cloud, FileSpreadsheet, FileText, Printer, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from './lib/utils';
import { File } from 'megajs';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

type FileItem = {
  id: string;
  name: string;
  type: 'word' | 'excel';
  size: string;
  date: string;
  _node?: any;
};

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [megaLink, setMegaLink] = useState('https://mega.nz/folder/0jkwjIoY#MwodxmSsZkevB9D5vn93qA');
  const [isConnecting, setIsConnecting] = useState(true);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [printingId, setPrintingId] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');

  const performConnection = async (linkToConnect: string) => {
      setIsConnecting(true);
      setFiles([]);
      
      try {
        const folder = File.fromURL(linkToConnect);
        await folder.loadAttributes();
        
        const newFiles: FileItem[] = [];
        
        const collectFiles = (node: any) => {
            if (node.directory) {
                if (node.children) {
                    node.children.forEach(collectFiles);
                }
            } else {
                const name = node.name || '';
                const lowerName = name.toLowerCase();
                if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls') || lowerName.endsWith('.docx')) {
                    newFiles.push({
                        id: node.id || Math.random().toString(),
                        name: name,
                        size: formatBytes(node.size),
                        type: lowerName.includes('.xls') ? 'excel' : 'word',
                        date: node.timestamp ? new Date(node.timestamp * 1000).toISOString().split('T')[0] : 'Bilinmiyor',
                        _node: node
                    });
                }
            }
        };

        if (folder.directory && folder.children) {
            folder.children.forEach(collectFiles);
        } else {
            collectFiles(folder);
        }

        setFiles(newFiles);
        setIsConnected(true);
      } catch (err) {
        console.error("Mega bağlantı hatası:", err);
        alert("Bağlantı başarısız. Lütfen geçerli bir Link girdiğinizden emin olun.");
        setIsConnected(false);
      } finally {
        setIsConnecting(false);
      }
  };

  // Auto connect when component mounts
  useEffect(() => {
     performConnection(megaLink);
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    performConnection(megaLink);
  };

  const handlePrint = async (file: FileItem) => {
    setPrintingId(file.id);
    
    try {
      if (!file._node) throw new Error("Dosya verisi bulunamadı");
      
      // Megadan dosyayı ArrayBuffer objesi olarak indir (Tarayıcı ortamı)
      const bufferData = await file._node.downloadBuffer();
      const dataArray = new Uint8Array(bufferData);
      
      let html = '';
      const lowerName = file.name.toLowerCase();

      if (lowerName.endsWith('.docx')) {
          // Promise based Mammoth execution
          const arrayBuffer = dataArray.buffer.slice(dataArray.byteOffset, dataArray.byteOffset + dataArray.byteLength);
          const result = await mammoth.convertToHtml({ arrayBuffer });
          html = `<div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto;">${result.value}</div>`;
      } else if (lowerName.endsWith('.xls') || lowerName.endsWith('.xlsx')) {
          const workbook = XLSX.read(dataArray, { type: 'array' });
          for (const sheetName of workbook.SheetNames) {
              const sheet = workbook.Sheets[sheetName];
              
              // Her sayfayı başlığıyla yazdırmak
              html += `<div style="font-family: Arial, sans-serif; page-break-after: always; max-width: 100vw; overflow-x: auto;">`;
              html += `<h2 style="margin-top: 24px; margin-bottom: 16px; font-size: 20px;">${sheetName}</h2>`;
              
              let tableHtml = XLSX.utils.sheet_to_html(sheet);
              tableHtml = tableHtml.replace(/<table/g, '<table style="min-width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px;" border="1" cellpadding="6"')
                                   .replace(/<th/g, '<th style="background-color: #f3f4f6; text-align: left;"')
                                   .replace(/<td/g, '<td style="border: 1px solid #d1d5db;"');
              
              html += tableHtml;
              html += `</div>`;
          }
      }
      
      setHtmlContent(html);
      
      // DOM update olması için biraz süre tanıyıp yazdır menüsünü açıyoruz
      setTimeout(() => {
          window.print();
          setPrintingId(null);
      }, 1000);
      
    } catch (err) {
      console.error("Yazdırma hatası:", err);
      alert("Dosya içeriği okunurken bir hata oluştu.");
      setPrintingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header - Print Esnasında Gizlenir */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 print:hidden">
        <div className="flex items-center gap-2 text-indigo-600">
          <Cloud className="w-6 h-6" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900">MegaPrint</h1>
        </div>
        <div className="text-sm font-medium">
          {isConnected ? (
            <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
              <CheckCircle className="w-4 h-4" />
              Mega.nz'ye Bağlı
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
              <AlertCircle className="w-4 h-4" />
              Bağlantı Bekleniyor
            </span>
          )}
        </div>
      </header>

      {/* Main App Görüntüsü - Print Esnasında Gizlenir */}
      <main className="max-w-5xl mx-auto px-6 py-8 print:hidden">
        {!isConnected ? (
          <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Cloud className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Mega.nz Klasör Bağlantısı</h2>
            <p className="text-slate-500 mb-8 text-sm">
              Yazdırmak istediğiniz Excel ve Word dosyalarınızın bulunduğu Mega.nz paylaşımlı klasör bağlantısını (Linkini) buraya yapıştırın.
            </p>
            
            <form onSubmit={handleConnect} className="space-y-4">
              <input
                type="url"
                required
                placeholder="Örn: https://mega.nz/folder/xxxx#yyyy"
                value={megaLink}
                onChange={(e) => setMegaLink(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              />
              <button
                type="submit"
                disabled={isConnecting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-sm"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Bağlanıyor...
                  </>
                ) : (
                  'Klasörü Bağla'
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Dosyalarınız</h2>
                <p className="text-slate-500 text-sm mt-1">Bağlantınızdaki Word ve Excel dosyaları algılandı.</p>
              </div>
              <button 
                onClick={() => {
                    setIsConnected(false);
                    setMegaLink('');
                    setFiles([]);
                }}
                className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
              >
                Farklı Klasör Bağla
              </button>
            </div>

            {files.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 transition-all">
                {isConnecting ? (
                  <div className="flex flex-col items-center justify-center gap-3">
                     <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                     <p className="text-slate-500">Dosyalar kontrol ediliyor...</p>
                  </div>
                ) : (
                  <p className="text-slate-500">Bu klasörde Excel (.xlsx) veya Word (.docx) dosyası bulunamadı.</p>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <ul className="divide-y divide-slate-100">
                  {files.map((file) => (
                    <li key={file.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4 text-left">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                          file.type === 'excel' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                        )}>
                          {file.type === 'excel' ? <FileSpreadsheet className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 mb-0.5 line-clamp-1">{file.name}</p>
                          <p className="text-xs text-slate-500">{file.size} • {file.date}</p>
                        </div>
                      </div>
                      <div>
                        <button
                          onClick={() => handlePrint(file)}
                          disabled={printingId !== null}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm shrink-0",
                            printingId === file.id 
                              ? "bg-slate-100 text-slate-500 cursor-wait" 
                              : "bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
                          )}
                        >
                          {printingId === file.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Hazırlanıyor...
                            </>
                          ) : (
                            <>
                              <Printer className="w-4 h-4" />
                              Yazdır
                            </>
                          )}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* Gizli Yazdırma Alanı - Sadece Print Esnasında Görünür */}
      <div 
         id="print-area" 
         className="hidden print:block text-black bg-white w-full print:p-8" 
      >
         <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </div>
  );
}
