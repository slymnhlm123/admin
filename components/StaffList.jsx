'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { UNVAN_STYLE } from './StaffPanel';

export default function StaffList({ personeller, onSil }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <ul className="divide-y divide-gray-50">
        <AnimatePresence>
          {personeller.map((p) => {
            const style = UNVAN_STYLE[p.unvan] || UNVAN_STYLE['Etüt Hocası'];
            
            return (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50/50 transition-colors gap-3 sm:gap-0"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${style.bg} ${style.text}`}>
                    {p.ad_soyad.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{p.ad_soyad}</h4>
                    <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                      Kullanıcı Adı: {p.username}
                      {p.unvan === 'Etüt Hocası' && p.class && ` • Sınıf: ${p.class}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 ml-12 sm:ml-0">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${style.chip}`}>
                    {p.unvan}
                  </span>
                  <button
                    onClick={() => onSil(p.id, p.unvan)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                    title="Sil"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
