import { createClient } from '@supabase/supabase-js';

// --- KONFIGURASI SUPABASE ---
// URL Project Baru (wbhfjsbxsbhkhppuytcn)
const SUPABASE_URL = 'https://wbhfjsbxsbhkhppuytcn.supabase.co';

// Key Project Baru (Anon Key) = 'sb_publishable_zIHNMWCLMQbbVFthU3K_cA_AMK-4y-p';
const SUPABASE_KEY: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiaGZqc2J4c2Joa2hwcHV5dGNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MzYzMjAsImV4cCI6MjA4MDMxMjMyMH0.w4QwTjvxHOtIL9dLcPZiAR7vS487F2KV00ZQkDDb-j0'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const isSupabaseConfigured = () => {
    return SUPABASE_URL && SUPABASE_KEY && SUPABASE_KEY !== '';
};

/**
 * --- PANDUAN PEMBUATAN TABEL DAN SECURITY (SQL) ---
 * Salin dan jalankan perintah SQL ini di "SQL Editor" pada Dashboard Supabase Anda.
 * 
 * CATATAN PENTING: 
 * Kebijakan (Policies) di bawah ini mengasumsikan Anda menggunakan Supabase Auth.
 * 'auth.uid()' merujuk pada ID pengguna yang sedang login via Supabase.
 * Karena aplikasi demo ini menggunakan sistem login manual (tabel members), 
 * RLS mungkin perlu disesuaikan atau dimatikan sementara jika Autentikasi belum terintegrasi penuh.
 
 -- 1. Enable Row Level Security (RLS) untuk semua tabel
 ALTER TABLE members ENABLE ROW LEVEL SECURITY;
 ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
 ALTER TABLE products ENABLE ROW LEVEL SECURITY;
 ALTER TABLE news ENABLE ROW LEVEL SECURITY;
 ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
 ALTER TABLE journal ENABLE ROW LEVEL SECURITY;
 ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

 -- 2. Kebijakan Akses (Policies)
 
 -- TABEL MEMBERS
 -- Admin bisa melihat semua data anggota
 CREATE POLICY "Admins view all" ON members FOR SELECT USING ((SELECT role FROM members WHERE id = auth.uid()::text) = 'ADMIN');
 -- User hanya bisa melihat data diri sendiri
 CREATE POLICY "Users view own" ON members FOR SELECT USING (auth.uid()::text = id);
 -- User bisa update data diri sendiri
 CREATE POLICY "Users update own" ON members FOR UPDATE USING (auth.uid()::text = id);

 -- TABEL TRANSACTIONS
 -- Admin bisa melihat & mengelola semua transaksi
 CREATE POLICY "Admins manage all trx" ON transactions FOR ALL USING ((SELECT role FROM members WHERE id = auth.uid()::text) = 'ADMIN');
 -- User hanya bisa melihat transaksi milik sendiri
 CREATE POLICY "Users view own trx" ON transactions FOR SELECT USING (auth.uid()::text = member_id);
 -- User bisa membuat transaksi (Insert) untuk diri sendiri
 CREATE POLICY "Users insert own trx" ON transactions FOR INSERT WITH CHECK (auth.uid()::text = member_id);

 -- TABEL PRODUCTS (Unit Usaha)
 -- Semua orang (termasuk public) bisa melihat produk
 CREATE POLICY "Public view products" ON products FOR SELECT USING (true);
 -- Hanya Admin yang bisa menambah/mengedit produk
 CREATE POLICY "Admins manage products" ON products FOR ALL USING ((SELECT role FROM members WHERE id = auth.uid()::text) = 'ADMIN');

 -- TABEL NEWS & SETTINGS
 -- Semua orang bisa membaca berita & pengaturan
 CREATE POLICY "Public view news" ON news FOR SELECT USING (true);
 CREATE POLICY "Public view settings" ON app_settings FOR SELECT USING (true);
 -- Hanya Admin yang bisa menulis
 CREATE POLICY "Admins manage news" ON news FOR ALL USING ((SELECT role FROM members WHERE id = auth.uid()::text) = 'ADMIN');
 CREATE POLICY "Admins manage settings" ON app_settings FOR ALL USING ((SELECT role FROM members WHERE id = auth.uid()::text) = 'ADMIN');

 -- TABEL JOURNAL
 -- Hanya Admin yang bisa mengakses data keuangan
 CREATE POLICY "Admins manage journal" ON journal FOR ALL USING ((SELECT role FROM members WHERE id = auth.uid()::text) = 'ADMIN');

 */
