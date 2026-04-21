import React, { useState, useRef } from 'react';
import { Plus, Trash2, Printer } from 'lucide-react';

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
  const [slips, setSlips] = useState<MealSlip[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  const addSlip = (type: MealSlip['type']) => {
    setSlips([...slips, { id: crypto.randomUUID(), type, date: new Date().toISOString().split('T')[0], price: '', quantity: 1 }]);
  };

  const removeSlip = (id: string) => {
    setSlips(slips.filter(s => s.id !== id));
  };

  const updateSlip = (id: string, field: keyof MealSlip, value: any) => {
    setSlips(slips.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handlePrint = () => {
    window.print();
  };

  const getPrintPages = () => {
    const printList: MealSlip[] = [];
    slips.forEach(slip => {
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

  return (
    <div className="min-h-screen mesh-gradient p-8 font-sans text-slate-200">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex flex-col items-center gap-4 glass p-6 rounded-2xl shadow-sm">
          <img src={LOGO_URL} alt="Logo" className="w-48 h-48 object-contain" />
        </header>

        <main className="space-y-6">
          {(['Kahvaltı', 'Öğle Yemeği', 'Akşam Yemeği'] as const).map(type => (
            <section key={type} className="glass-card p-6 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl capitalize font-medium text-white">{type}</h2>
                <div className="flex gap-2">
                  <button onClick={() => addSlip(type)} className="text-slate-400 hover:text-white"><Plus /></button>
                  <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-1 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition print:hidden text-xs">
                    <Printer size={14} />
                    <span>Yazdır</span>
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {slips.filter(s => s.type === type).map(slip => (
                  <div key={slip.id} className="grid grid-cols-3 gap-4 items-center p-4 bg-white/5 rounded-xl">
                    <input type="date" value={slip.date} onChange={(e) => updateSlip(slip.id, 'date', e.target.value)} className="input-field" />
                    <input type="text" placeholder="Fiyat" value={slip.price} onChange={(e) => updateSlip(slip.id, 'price', e.target.value)} className="input-field" />
                    <div className="flex gap-2 items-center">
                      <input type="number" min="1" value={slip.quantity} onChange={(e) => updateSlip(slip.id, 'quantity', parseInt(e.target.value))} className="input-field" />
                      <button onClick={() => removeSlip(slip.id)} className="text-red-400 hover:text-red-600"><Trash2 /></button>
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
                  <img src={SLIP_LOGO_URL} alt="Logo" className="h-14 object-contain mt-2" />
                  <div className="text-center flex-1 flex flex-col justify-center">
                    <p className="text-xl font-bold text-stone-900">{slip.type}</p>
                    <p className="text-lg font-semibold text-stone-800">{formatPrice(slip.price)}</p>
                  </div>
                  <div className="w-full text-right mt-2">
                    <p className="text-sm font-medium text-stone-600">{formatDate(slip.date)}</p>
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
