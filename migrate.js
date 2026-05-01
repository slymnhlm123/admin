const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function migrateData() {
  console.log('Veri aktarımı başlıyor...');

  // 1. Önce yurtları al/oluştur
  const yurtIsimleri = [
    { id: 'yamanevler', isim: 'Yamanevler Enderun Bilişim', sehir: 'İstanbul' },
    { id: 'ferhatlar', isim: 'Ferhatlar Enderun', sehir: 'İstanbul' },
    { id: 'elvankaracan', isim: 'Elvan Karacan Enderun', sehir: 'İstanbul' },
    { id: 'kartalkulliye', isim: 'Kartal Külliye Enderun Bilişim', sehir: 'İstanbul' },
    { id: 'osmangazi', isim: 'Osmangazi Enderun', sehir: 'Bursa' }
  ];

  const yurtMap = {}; // dorm string to yurt UUID mapping

  for (const y of yurtIsimleri) {
    let { data: existing } = await supabase.from('yurtlar').select('*').eq('isim', y.isim).maybeSingle();
    
    if (!existing) {
      console.log(`Yurt oluşturuluyor: ${y.isim}`);
      const { data: newYurt } = await supabase.from('yurtlar').insert([{ isim: y.isim, sehir: y.sehir }]).select().single();
      existing = newYurt;
    }
    
    if (existing) {
      yurtMap[y.id] = existing.id;
    }
  }

  console.log('Yurt eşleştirmeleri tamamlandı.');

  // 2. Mevcut yetkilileri aktar
  // Etüt Hocaları -> teachers
  const { data: teachers } = await supabase.from('teachers').select('*');
  if (teachers) {
    for (const t of teachers) {
      if (!t.dorm || !yurtMap[t.dorm]) continue;
      
      const { data: alreadyExists } = await supabase.from('yetkililer')
        .select('id').eq('ad_soyad', t.name).eq('unvan', 'Etüt Hocası').maybeSingle();
        
      if (!alreadyExists) {
        console.log(`Aktarılıyor (Etüt Hocası): ${t.name}`);
        await supabase.from('yetkililer').insert({
          yurt_id: yurtMap[t.dorm],
          ad_soyad: t.name,
          unvan: 'Etüt Hocası'
        });
      }
    }
  }

  // Mesul Hocalar -> managers
  const { data: managers } = await supabase.from('managers').select('*');
  if (managers) {
    for (const m of managers) {
      if (!m.dorm || !yurtMap[m.dorm]) continue;
      
      const { data: alreadyExists } = await supabase.from('yetkililer')
        .select('id').eq('ad_soyad', m.name).eq('unvan', 'Mesul Hoca').maybeSingle();
        
      if (!alreadyExists) {
        console.log(`Aktarılıyor (Mesul Hoca): ${m.name}`);
        await supabase.from('yetkililer').insert({
          yurt_id: yurtMap[m.dorm],
          ad_soyad: m.name,
          unvan: 'Mesul Hoca'
        });
      }
    }
  }

  // Aşçılar -> chefs (Aşçılar varsayılan olarak bir yurda atanmıyor, ilk yurda veya hepsine eklenebilir)
  // Şimdilik en büyük yurt olan Yamanevler'e atayalım
  const defaultYurtId = yurtMap['yamanevler'];
  const { data: chefs } = await supabase.from('chefs').select('*');
  if (chefs && defaultYurtId) {
    for (const c of chefs) {
      const { data: alreadyExists } = await supabase.from('yetkililer')
        .select('id').eq('ad_soyad', c.name).eq('unvan', 'Aşçı').maybeSingle();
        
      if (!alreadyExists) {
        console.log(`Aktarılıyor (Aşçı): ${c.name}`);
        await supabase.from('yetkililer').insert({
          yurt_id: defaultYurtId,
          ad_soyad: c.name,
          unvan: 'Aşçı'
        });
      }
    }
  }

  console.log('Tüm veriler başarıyla Yurt Paneline aktarıldı!');
}

migrateData().catch(console.error);
