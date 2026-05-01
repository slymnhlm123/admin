'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import InlineForm from '@/components/InlineForm';
import StaffList from '@/components/StaffList';

const UNVANLAR = ['Tümü', 'Etüt Hocası', 'Aşçı', 'Mesul Hoca'];

const getDormCode = (isim) => {
  if (isim.toLowerCase().includes('yamanevler')) return 'yamanevler';
  if (isim.toLowerCase().includes('ferhatlar')) return 'ferhatlar';
  if (isim.toLowerCase().includes('elvan')) return 'elvankaracan';
  if (isim.toLowerCase().includes('kartal')) return 'kartalkulliye';
  if (isim.toLowerCase().includes('osmangazi')) return 'osmangazi';
  return isim.toLowerCase().replace(/[^a-z0-9]/g, '');
};

const generateUsername = (name) => {
  return name.trim(); // Olduğu gibi kullan, sadece kenar boşluklarını temizle
};

export default function StaffPanel({ yurt, onPersonelDegisti }) {
  const [personeller, setPersoneller] = useState([]);
  const [filtre, setFiltre] = useState('Tümü');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPersoneller();
  }, [yurt.id]);

  const fetchPersoneller = async () => {
    setLoading(true);
    const dormCode = getDormCode(yurt.isim);
    
    try {
      const [tRes, cRes, mRes] = await Promise.all([
        supabase.from('teachers').select('*').eq('dorm', dormCode),
        supabase.from('chefs').select('*'),
        supabase.from('managers').select('*').eq('dorm', dormCode)
      ]);

      const teachers = (tRes.data || []).map(t => ({ ...t, unvan: 'Etüt Hocası', ad_soyad: t.name }));
      const chefs = (cRes.data || []).map(c => ({ ...c, unvan: 'Aşçı', ad_soyad: c.name }));
      const managers = (mRes.data || []).map(m => ({ ...m, unvan: 'Mesul Hoca', ad_soyad: m.name }));

      const data = [...teachers, ...chefs, ...managers];
      setPersoneller(data);
      onPersonelDegisti(data.length);
    } catch (err) {
      console.error('Fetch error:', err);
    }
    setLoading(false);
  };

  const handleEkle = async (yeniKisi) => {
    const dormCode = getDormCode(yurt.isim);
    const tempId = `temp-${Date.now()}`;
    const generatedUsername = generateUsername(yeniKisi.ad_soyad);
    
    let table = '';
    let insertData = {
      name: yeniKisi.ad_soyad,
      username: generatedUsername,
      password: yeniKisi.password
    };

    if (yeniKisi.unvan === 'Etüt Hocası') {
      table = 'teachers';
      insertData.dorm = dormCode;
      insertData.class = yeniKisi.sinif;
    } else if (yeniKisi.unvan === 'Mesul Hoca') {
      table = 'managers';
      insertData.dorm = dormCode;
    } else if (yeniKisi.unvan === 'Aşçı') {
      table = 'chefs';
    }

    // Optimistic update
    const tempKisi = { id: tempId, unvan: yeniKisi.unvan, ad_soyad: yeniKisi.ad_soyad, ...insertData };
    setPersoneller(prev => [...prev, tempKisi]);
    onPersonelDegisti(personeller.length + 1);

    const { data, error } = await supabase
      .from(table)
      .insert([insertData])
      .select()
      .single();

    if (!error && data) {
      setPersoneller(prev => prev.map(p => p.id === tempId ? { ...data, unvan: yeniKisi.unvan, ad_soyad: data.name } : p));
    } else {
      console.error(error);
      alert('Eklenirken hata oluştu: ' + (error?.message || 'Bilinmeyen hata (Muhtemelen kullanıcı adı zaten var)'));
      setPersoneller(prev => prev.filter(p => p.id !== tempId));
      onPersonelDegisti(personeller.length);
    }
  };

  const handleSil = async (kisiId, unvan) => {
    let table = '';
    if (unvan === 'Etüt Hocası') table = 'teachers';
    else if (unvan === 'Mesul Hoca') table = 'managers';
    else if (unvan === 'Aşçı') table = 'chefs';

    const eskiListe = personeller;
    const yeniListe = personeller.filter(p => p.id !== kisiId);
    setPersoneller(yeniListe);
    onPersonelDegisti(yeniListe.length);

    const { error } = await supabase.from(table).delete().eq('id', kisiId);

    if (error) {
      alert('Silinemedi: ' + error.message);
      setPersoneller(eskiListe);
      onPersonelDegisti(eskiListe.length);
    }
  };

  const filtreliPersoneller = filtre === 'Tümü'
    ? personeller
    : personeller.filter(p => p.unvan === filtre);

  return (
    <div className="space-y-6">
      {/* İstatistik kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {['Etüt Hocası', 'Aşçı', 'Mesul Hoca'].map(unvan => {
          const sayi = personeller.filter(p => p.unvan === unvan).length;
          const style = UNVAN_STYLE[unvan] || UNVAN_STYLE['Etüt Hocası'];
          return (
            <div key={unvan} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                <span className="text-xs font-semibold text-gray-400">{unvan}</span>
              </div>
              <p className={`text-2xl font-black ${style.text}`}>{sayi}</p>
            </div>
          );
        })}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users size={12} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-400">Toplam</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{personeller.length}</p>
        </div>
      </div>

      {/* Inline Ekleme Formu */}
      <InlineForm onEkle={handleEkle} />

      {/* Filtre Tabs */}
      <div className="flex gap-2 flex-wrap">
        {UNVANLAR.map(u => (
          <button
            key={u}
            onClick={() => setFiltre(u)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
              filtre === u
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {u}
            {u !== 'Tümü' && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                filtre === u ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {personeller.filter(p => p.unvan === u).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Personel Listesi */}
      {loading ? (
        <div className="flex justify-center py-16 text-indigo-500">
          <Loader2 size={32} className="animate-spin" />
        </div>
      ) : filtreliPersoneller.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <UserPlus size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="font-semibold text-gray-400 text-sm">Henüz personel eklenmedi</p>
          <p className="text-xs text-gray-300 mt-1">Yukarıdaki formu kullanarak ekleyebilirsiniz.</p>
        </div>
      ) : (
        <StaffList personeller={filtreliPersoneller} onSil={handleSil} />
      )}
    </div>
  );
}

export const UNVAN_STYLE = {
  'Etüt Hocası': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', chip: 'bg-blue-100 text-blue-700' },
  'Aşçı':        { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', chip: 'bg-orange-100 text-orange-700' },
  'Mesul Hoca':  { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500', chip: 'bg-violet-100 text-violet-700' },
};
