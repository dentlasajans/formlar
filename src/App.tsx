/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface FileItem {
  name: string;
  handle: string;
}

export default function App() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/files')
      .then(res => res.json())
      .then(data => {
        setFiles(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch files:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      <aside className="w-60 bg-slate-950 text-slate-400 flex flex-col h-full">
        <div className="p-6 mb-4">
          <div className="flex items-center gap-2 font-bold text-white text-xl">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-xs">⚡</div>
            StaticEngine
          </div>
          <p className="text-xs mt-1 text-slate-500">v2.4.0 • GH-IO Ready</p>
        </div>
        <nav className="flex-1">
          <div className="py-3 px-5 flex items-center gap-3 rounded-lg mx-3 cursor-pointer bg-slate-900 text-white font-medium my-1">
            <span className="text-lg">⊞</span> Dashboard
          </div>
          <div className="py-3 px-5 flex items-center gap-3 rounded-lg mx-3 cursor-pointer hover:bg-slate-900 hover:text-white transition-colors my-1">
            <span className="text-lg">◈</span> Repositories
          </div>
          <div className="py-3 px-5 flex items-center gap-3 rounded-lg mx-3 cursor-pointer hover:bg-slate-900 hover:text-white transition-colors my-1">
            <span className="text-lg">⚗️</span> Performance
          </div>
          <div className="py-3 px-5 flex items-center gap-3 rounded-lg mx-3 cursor-pointer hover:bg-slate-900 hover:text-white transition-colors my-1">
            <span className="text-lg">⚙</span> Settings
          </div>
        </nav>
        <div className="p-6 mt-auto">
          <div className="bg-slate-900 p-4 rounded-xl text-xs">
            <p className="text-slate-400 mb-2 uppercase tracking-wider font-semibold">Usage Limits</p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mb-1">
              <div className="bg-indigo-400 h-1.5 rounded-full w-1/3"></div>
            </div>
            <p className="text-slate-300">32% of build quota used</p>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold">Project Overview</h1>
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="text-slate-500">Status:</span>
            <span className="flex items-center gap-2 text-emerald-600">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Live on gh-pages
            </span>
            <button className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">New Project</button>
          </div>
        </header>
        <div className="p-8 grid grid-cols-3 gap-6 h-full content-start">
          <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold">MEGA.nz Files</h2>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase bg-slate-100 text-slate-600">
                {loading ? 'Loading...' : `${files.length} files found`}
              </span>
            </div>
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.handle} className="flex items-center justify-between border-b border-slate-50 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">📄</div>
                    <div>
                      <p className="text-sm font-bold">{file.name}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => alert(`Print request for: ${file.name}`)}
                    className="px-4 py-2 text-xs font-bold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50"
                  >
                    Print
                  </button>
                </div>
              ))}
              {!loading && files.length === 0 && <p className="text-slate-500 text-sm">No Word or Excel files found.</p>}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Lighthouse Score</h3>
            <div className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-emerald-500 font-bold text-emerald-600 text-xl mb-4">99</div>
            <p className="text-sm font-bold">Excellent Performance</p>
            <p className="text-xs text-slate-400 mt-2">Your static build is optimized for fast TTFB.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
