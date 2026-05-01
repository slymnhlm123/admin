'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Plus, X, MapPin, ChevronLeft, LockKeyhole } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import DormCard from '@/components/DormCard';
import StaffPanel from '@/components/StaffPanel';

const getDormCode = (isim) => {
  if (isim.toLowerCase().includes('yamanevler')) return 'yamanevler';
  if (isim.toLowerCase().includes('ferhatlar')) return 'ferhatlar';
  if (isim.toLowerCase().includes('elvan')) return 'elvankaracan';
  if (isim.toLowerCase().includes('kartal')) return 'kartalkulliye';
  if (isim.toLowerCase().includes('osmangazi')) return 'osmangazi';
  return isim.toLowerCase().replace(/[^a-z0-9]/g, '');
};

export default function Home() {
  const [yurtlar, setYurtlar] = useState([]);
  const [seciliYurt, setSeciliYurt] = useState(null);
  const [yeniYurtForm, setYeniYurtForm] = useState(false);
  const [yeniYurt, setYeniYurt] = useState({ isim: '', sehir: 'İstanbul' });
  const [loading, setLoading] = useState(true);

  // Login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (localStorage.getItem('admin_logged_in') === 'true') {
      setIsLoggedIn(true);
    }
    fetchYurtlar();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admindozla' && password === 'dozla123') {
      setIsLoggedIn(true);
      localStorage.setItem('admin_logged_in', 'true');
    } else {
      alert('Hatalı kullanıcı adı veya şifre');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('admin_logged_in');
  };

  const fetchYurtlar = async () => {
    setLoading(true);
    try {
      const { data: yurtData, error: yurtErr } = await supabase.from('yurtlar').select('*').order('isim');
      
      const [tRes, mRes, cRes] = await Promise.all([
        supabase.from('teachers').select('id, dorm'),
        supabase.from('managers').select('id, dorm'),
        supabase.from('chefs').select('id')
      ]);

      if (!yurtErr && yurtData) {
        const processedYurtlar = yurtData.map(yurt => {
          const dormCode = getDormCode(yurt.isim);
          const tCount = (tRes.data || []).filter(t => t.dorm === dormCode).length;
          const mCount = (mRes.data || []).filter(m => m.dorm === dormCode).length;
          // Aşçılar şimdilik sadece Yamanevler kartında sayılsın veya genel bir mantık kurulabilir
          const cCount = dormCode === 'yamanevler' ? (cRes.data || []).length : 0;
          
          return {
            ...yurt,
            personelSayisi: tCount + mCount + cCount
          };
        });
        setYurtlar(processedYurtlar);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
    setLoading(false);
  };

  const handleYurtEkle = async (e) => {
    e.preventDefault();
    if (!yeniYurt.isim.trim()) return;

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const tempYurt = { id: tempId, ...yeniYurt, personelSayisi: 0 };
    setYurtlar(prev => [...prev, tempYurt]);
    setYeniYurtForm(false);
    setYeniYurt({ isim: '', sehir: 'İstanbul' });

    const { data, error } = await supabase
      .from('yurtlar')
      .insert([{ isim: yeniYurt.isim, sehir: yeniYurt.sehir }])
      .select()
      .single();

    if (error) {
      console.error('Yurt eklenirken hata:', error);
      alert(`Hata: ${error.message}`);
      setYurtlar(prev => prev.filter(y => y.id !== tempId));
      return;
    }

    if (data) {
      setYurtlar(prev => prev.map(y => y.id === tempId ? { ...data, personelSayisi: 0 } : y));
    }
  };

  const handleYurtSil = async (yurtId) => {
    // Optimistic update
    setYurtlar(prev => prev.filter(y => y.id !== yurtId));
    if (seciliYurt?.id === yurtId) setSeciliYurt(null);
    await supabase.from('yurtlar').delete().eq('id', yurtId);
  };

  const handlePersonelSayisiGuncelle = (yurtId, yeniSayi) => {
    setYurtlar(prev =>
      prev.map(y =>
        y.id === yurtId
          ? { ...y, personelSayisi: yeniSayi }
          : y
      )
    );
  };

  const mainContent = (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {seciliYurt && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setSeciliYurt(null)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors mr-1"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </motion.button>
            )}
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <Building2 size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                {seciliYurt ? seciliYurt.isim : 'Yurt Personel Paneli'}
              </h1>
              {seciliYurt && (
                <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                  <MapPin size={10} /> {seciliYurt.sehir}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!seciliYurt && (
              <button
                onClick={() => setYeniYurtForm(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Plus size={16} />
                Yurt Ekle
              </button>
            )}
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-red-600 bg-red-50 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Yeni Yurt Modal */}
        <AnimatePresence>
          {yeniYurtForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setYeniYurtForm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-gray-900">Yeni Yurt Ekle</h3>
                  <button
                    onClick={() => setYeniYurtForm(false)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"
                  >
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={handleYurtEkle} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Yurt Adı</label>
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="Örn: Yamanevler Enderun Bilişim"
                      value={yeniYurt.isim}
                      onChange={e => setYeniYurt(p => ({ ...p, isim: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Şehir</label>
                    <input
                      type="text"
                      placeholder="İstanbul"
                      value={yeniYurt.sehir}
                      onChange={e => setYeniYurt(p => ({ ...p, sehir: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors text-sm mt-2"
                  >
                    Yurt Oluştur
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ana İçerik */}
        <AnimatePresence mode="wait">
          {!seciliYurt ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse h-36" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {yurtlar.map(yurt => (
                    <DormCard
                      key={yurt.id}
                      yurt={yurt}
                      onSelect={() => setSeciliYurt(yurt)}
                      onDelete={() => handleYurtSil(yurt.id)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={`panel-${seciliYurt.id}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <StaffPanel
                yurt={seciliYurt}
                onPersonelDegisti={(sayi) => handlePersonelSayisiGuncelle(seciliYurt.id, sayi)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm border border-gray-100"
        >
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-6">
            <LockKeyhole size={32} />
          </div>
          <h2 className="text-2xl font-black text-center text-gray-900 mb-2">Admin Girişi</h2>
          <p className="text-center text-gray-500 text-sm mb-8 font-medium">Lütfen yönetici bilgilerinizi girin</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1.5 block">Kullanıcı Adı</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1.5 block">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-bold rounded-xl py-3.5 mt-2 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 transition-all active:scale-95"
            >
              Giriş Yap
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return mainContent;
}
