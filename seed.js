const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log('Seeding data...');

  const yurtlar = [
    { isim: 'Yamanevler Enderun Bilişim', sehir: 'İstanbul' },
    { isim: 'Ferhatlar Enderun', sehir: 'İstanbul' },
    { isim: 'Elvan Karacan Enderun', sehir: 'İstanbul' },
    { isim: 'Kartal Külliye Enderun Bilişim', sehir: 'İstanbul' },
    { isim: 'Osmangazi Enderun', sehir: 'Bursa' }
  ];

  for (const yurt of yurtlar) {
    // Check if exists
    const { data: existing } = await supabase.from('yurtlar').select('*').eq('isim', yurt.isim).single();
    if (!existing) {
      console.log(`Ekle: ${yurt.isim}`);
      await supabase.from('yurtlar').insert([yurt]);
    }
  }

  console.log('Seed tamamlandı.');
}

seed().catch(console.error);
