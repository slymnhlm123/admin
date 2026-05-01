'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

export default function InlineForm({ onEkle }) {
  const [formData, setFormData] = useState({
    ad_soyad: '',
    password: '',
    unvan: 'Etüt Hocası',
    sinif: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.ad_soyad.trim() || !formData.password.trim()) return;
    if (formData.unvan === 'Etüt Hocası' && !formData.sinif.trim()) return;
    
    onEkle(formData);
    setFormData({ ad_soyad: '', password: '', unvan: 'Etüt Hocası', sinif: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-wrap gap-2">
      <input
        type="text"
        required
        placeholder="Ad Soyad"
        value={formData.ad_soyad}
        onChange={e => setFormData(p => ({ ...p, ad_soyad: e.target.value }))}
        className="flex-1 min-w-[200px] border-none bg-gray-50 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100"
      />

      <input
        type="password"
        required
        placeholder="Şifre"
        value={formData.password}
        onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
        className="flex-1 min-w-[120px] border-none bg-gray-50 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100"
      />

      <select
        value={formData.unvan}
        onChange={e => setFormData(p => ({ ...p, unvan: e.target.value }))}
        className="border-none bg-gray-50 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-600 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 appearance-none cursor-pointer"
      >
        <option value="Etüt Hocası">Etüt Hocası</option>
        <option value="Aşçı">Aşçı</option>
        <option value="Mesul Hoca">Mesul Hoca</option>
      </select>

      {formData.unvan === 'Etüt Hocası' && (
        <input
          type="text"
          required
          placeholder="Sınıf (Örn: 9En-1)"
          value={formData.sinif}
          onChange={e => setFormData(p => ({ ...p, sinif: e.target.value }))}
          className="flex-1 min-w-[120px] border-none bg-gray-50 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100"
        />
      )}

      <button
        type="submit"
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl flex items-center justify-center transition-colors shadow-sm"
      >
        <Plus size={18} className="mr-1" /> Ekle
      </button>
    </form>
  );
}
