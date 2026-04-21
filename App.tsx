import React, { useState, useRef } from 'react';
import { Plus, Trash2, Printer, CheckCircle2, LogOut } from 'lucide-react';

const LOGO_URL = 'https://res.cloudinary.com/dejx0brol/image/upload/v1776755327/Ads%C4%B1z_tasar%C4%B1m_awydxr.png';
const SLIP_LOGO_URL = 'https://res.cloudinary.com/dejx0brol/image/upload/v1776753226/Ads%C4%B1z_tasar%C4%B1m_rgmaqg.png';

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
};

const formatPrice = (priceStr: string) => {
  if (!priceStr) return '00,00₺';
  const num = parseFloat(priceStr.toString().replace(',', '.'));
  if (isNaN(num)) return `${priceStr}₺`;
  return num.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '₺';
};

type MealSlip = {
  id: string;
  type: 'Kahvaltı' | 'Öğle Yemeği' | 'Akşam Yemeği';
  date: string;
  price: string;
  quantity: number;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [logoutSuccess, setLogoutSuccess] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [slips, setSlips] = useState<MealSlip[]>([]);
  const [printType, setPrintType] = useState<MealSlip['type'] | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'akademi' && password === 'akademi68') {
      setLoginSuccess(true);
      setLoginError('');
      setTimeout(() => {
        setIsAuthenticated(true);
      }, 1500);
    } else {
      setLoginError('Hatalı kullanıcı adı veya şifre.');
    }
  };

  const handleLogout = () => {
    setLogoutSuccess(true);
    setTimeout(() => {
      setIsAuthenticated(false);
      setLogoutSuccess(false);
      setLoginSuccess(false);
      setUsername('');
      setPassword('');
    }, 1500);
  };

  const addSlip = (type: MealSlip['type']) => {
    setSlips([...slips, { id: crypto.randomUUID(), type, date: new Date().toISOString().split('T')[0], price: '', quantity: 1 }]);
  };

  const removeSlip = (id: string) => {
    setSlips(slips.filter(s => s.id !== id));
  };

  const updateSlip = (id: string, field: keyof MealSlip, value: any) => {
    setSlips(slips.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handlePrint = (type: MealSlip['type']) => {
    setPrintType(type);
    setTimeout(() => {
      window.print();
    }, 100); // Allow React to re-render the printable section before opening system dialog
  };

  const getPrintPages = () => {
    const printList: MealSlip[] = [];
    const filteredSlips = printType ? slips.filter(s => s.type === printType) : slips;
    
    filteredSlips.forEach(slip => {
      for (let i = 0; i < slip.quantity; i++) {
        printList.push(slip);
      }
    });

    const pages = [];
    for (let i = 0; i < printList.length; i += 10) {
      pages.push(printList.slice(i, i + 10));
    }
    return pages;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen mesh-gradient font-sans flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="glass p-10 rounded-3xl flex flex-col gap-5 w-full max-w-sm shadow-xl items-center border border-white/10 relative overflow-hidden">
          {loginSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4 animate-out fade-out duration-1000 delay-500">
              <CheckCircle2 className="text-emerald-400 w-20 h-20" strokeWidth={1.5} />
              <p className="text-emerald-400 text-2xl font-medium text-center">Giriş Başarılı!</p>
              <p className="text-white/60 text-sm text-center">Sisteme yönlendiriliyorsunuz...</p>
            </div>
          ) : (
            <>
              <img src={LOGO_URL} alt="Logo" className="w-40 h-40 object-contain mb-4" />
              <h1 className="text-2xl font-medium text-white mb-2">Sisteme Giriş</h1>
              <input
                type="text"
                placeholder="Kullanıcı Adı"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field w-full h-12 px-4 shadow-inner"
                required
              />
              <input
                type="password"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full h-12 px-4 shadow-inner"
                required
              />
              {loginError && <p className="text-red-400 text-sm font-medium w-full text-center">{loginError}</p>}
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition-all mt-4 tracking-wide shadow-lg hover:shadow-emerald-900/50">
                Giriş Yap
              </button>
            </>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-gradient p-4 sm:p-8 font-sans text-slate-200 relative">
      {logoutSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center glass backdrop-blur-md">
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="text-emerald-400 w-20 h-20" strokeWidth={1.5} />
            <p className="text-white text-3xl font-medium tracking-wide">Çıkış Başarılı!</p>
          </div>
        </div>
      )}

      <button 
        onClick={handleLogout} 
        className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-500/20 text-red-100 hover:bg-red-500/40 rounded-xl transition-all print:hidden z-10"
      >
        <LogOut size={16} />
        <span className="font-medium text-sm hidden sm:inline">Çıkış Yap</span>
      </button>

      <div className="max-w-4xl mx-auto pt-12 sm:pt-0">
        <header className="mb-8 flex flex-col items-center gap-4 glass p-6 rounded-2xl shadow-sm">
          <img src={LOGO_URL} alt="Logo" className="w-48 h-48 object-contain" />
        </header>

        <main className="space-y-6">
          {(['Kahvaltı', 'Öğle Yemeği', 'Akşam Yemeği'] as const).map(type => (
            <section key={type} className="glass-card p-4 sm:p-6 rounded-2xl shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h2 className="text-xl capitalize font-medium text-white">{type}</h2>
                <div className="flex gap-2 self-end sm:self-auto">
                  <button onClick={() => addSlip(type)} className="text-slate-400 hover:text-white p-2 sm:p-0"><Plus /></button>
                  <button onClick={() => handlePrint(type)} className="flex items-center gap-2 px-4 py-2 sm:py-1 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition print:hidden text-xs">
                    <Printer size={14} />
                    <span>Yazdır</span>
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {slips.filter(s => s.type === type).map(slip => (
                  <div key={slip.id} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center p-4 bg-white/5 rounded-xl">
                    <input type="date" value={slip.date} onChange={(e) => updateSlip(slip.id, 'date', e.target.value)} className="input-field w-full" />
                    <input type="text" placeholder="Fiyat" value={slip.price} onChange={(e) => updateSlip(slip.id, 'price', e.target.value)} className="input-field w-full" />
                    <div className="flex gap-2 items-center justify-between sm:justify-start">
                      <input type="number" min="1" value={slip.quantity} onChange={(e) => updateSlip(slip.id, 'quantity', parseInt(e.target.value))} className="input-field w-24 sm:w-auto" />
                      <button onClick={() => removeSlip(slip.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>

      {/* Printable Area */}
      <div ref={printRef} className="hidden print:block absolute inset-0 bg-white">
        {getPrintPages().map((page, pageIndex) => (
          <div key={pageIndex} className="h-screen p-8 box-border" style={{ pageBreakAfter: 'always' }}>
            <div className="grid grid-cols-2 grid-rows-5 gap-4 h-full">
              {page.map((slip, index) => (
                <div key={index} className="border-2 border-stone-800 p-4 rounded-xl flex flex-col justify-between items-center h-full bg-white relative">
                  <img src={SLIP_LOGO_URL} alt="Logo" className="h-20 object-contain mt-2" />
                  <div className="text-center flex-1 flex flex-col justify-center">
                    <p className="text-xl font-bold text-stone-900">{slip.type}</p>
                    <p className="text-base font-semibold text-stone-800">{formatPrice(slip.price)}</p>
                  </div>
                  <div className="w-full text-right mt-2">
                    <p className="text-xs font-medium text-stone-600">{formatDate(slip.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
