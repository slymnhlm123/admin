'use client';

import { motion } from 'framer-motion';
import { Building2, MapPin, Users, Trash2, ChevronRight } from 'lucide-react';

export default function DormCard({ yurt, onSelect, onDelete }) {
  const personelSayisi = yurt.personelSayisi ?? 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer group"
      onClick={onSelect}
    >
      {/* Renk çizgisi */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />

      <div className="p-5">
        {/* Üst: İkon + Sil */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Building2 size={20} className="text-indigo-600" />
          </div>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="p-2 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* İsim */}
        <h3 className="font-bold text-gray-900 text-[15px] leading-snug mb-1 line-clamp-2">
          {yurt.isim}
        </h3>

        {/* Şehir */}
        <p className="flex items-center gap-1 text-xs text-gray-400 font-medium mb-4">
          <MapPin size={11} />
          {yurt.sehir}
        </p>

        {/* Alt: Badge + Ok */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
            personelSayisi > 0
              ? 'bg-indigo-50 text-indigo-700'
              : 'bg-gray-100 text-gray-400'
          }`}>
            <Users size={11} />
            {personelSayisi} yetkili
          </span>
          <ChevronRight
            size={16}
            className="text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all"
          />
        </div>
      </div>
    </motion.div>
  );
}
