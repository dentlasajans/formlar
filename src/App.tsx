import React, { useState, useEffect } from 'react';
import { Cloud, FileSpreadsheet, FileText, Printer, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from './lib/utils';

type FileItem = {
  id: string;
  name: string;
  type: 'word' | 'excel';
  size: string;
  date: string;
};

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
        const res = await fetch('/api/mega/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ link: linkToConnect })
        });
        
        const data = await res.json();
        if (res.ok) {
          setIsConnected(true);
          setFiles(data.files);
        } else {
          alert(data.error || "Bağlantı başarısız");
          setIsConnected(false);
        }
      } catch (err) {
        console.error(err);
        alert("Bir hata oluştu. Linkin doğru olduğundan emin olun.");
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

  const handlePrint = async (id: string, name: string) => {
    setPrintingId(id);
    
    try {
      const res = await fetch('/api/mega/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link: megaLink, fileName: name })
      });

      const data = await res.json();
      
      if (res.ok) {
        setHtmlContent(data.html);
        
        // DOM update olması için biraz süre tanıyıp yazdır menüsünü açıyoruz
        setTimeout(() => {
            window.print();
            setPrintingId(null);
        }, 800);
      } else {
        alert(data.error || "Dosya alınamadı");
        setPrintingId(null);
      }
    } catch (err) {
      console.error(err);
      alert("Yazdırma işleminde hata oluştu");
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
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500">Bu klasörde Excel (.xlsx) veya Word (.docx) dosyası bulunamadı.</p>
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
                          onClick={() => handlePrint(file.id, file.name)}
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
