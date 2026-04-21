/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { motion } from "motion/react";
import { Printer, FileText } from "lucide-react";

export default function App() {
  const files = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    name: `Form_Belgesi_${i + 1}.pdf`,
  }));

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-6xl flex flex-col max-h-[90vh] bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-2xl"
      >
        <header className="mb-6 border-b border-white/10 pb-6 text-center shrink-0">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-r from-neutral-100 to-neutral-400">
            Uluırmak Mesleki ve Teknik Anadolu Lisesi
          </h1>
          <h2 className="text-xl md:text-2xl font-medium text-neutral-300">
            Uygulama Oteli
          </h2>
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/5 text-sm font-medium text-neutral-300 mt-4 tracking-wide uppercase">
            Formlar
          </div>
        </header>

        <div className="overflow-y-auto pr-3 flex-1 pb-2">
          {/* Gelecekte Mega linkinden çekilecek olan verilerin listesi: https://mega.nz/folder/0jkwjIoY#MwodxmSsZkevB9D5vn93qA */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 lg:p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all duration-300 border border-white/5 hover:border-white/20 group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-white/5 rounded-xl group-hover:scale-110 transition-transform duration-300 border border-white/5 shrink-0">
                    <FileText size={18} className="text-neutral-300" />
                  </div>
                  <span className="font-medium text-sm lg:text-base text-neutral-200 truncate">
                    {file.name}
                  </span>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800/50 hover:bg-neutral-700/80 border border-white/10 rounded-lg text-xs lg:text-sm text-neutral-200 transition-colors shrink-0"
                >
                  <Printer size={14} /> Yazdır
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
