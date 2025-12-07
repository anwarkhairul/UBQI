import { GoogleGenAI } from "@google/genai";

// Mengambil API Key dari Environment Variable Vite
// Di Vercel, pastikan Anda menambahkan Environment Variable bernama: VITE_GEMINI_API_KEY
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("Gemini API Key belum disetting. Fitur AI mungkin tidak berjalan.");
}

// Fallback key kosong agar tidak error saat init
const ai = new GoogleGenAI({ apiKey: apiKey || 'DUMMY_KEY' });

const SYSTEM_INSTRUCTION = `
Anda adalah Asisten Virtual Cerdas untuk Koperasi "UB Qurrotul ‘Ibaad".
Tugas anda adalah membantu Anggota dan Admin dengan informasi seputar koperasi.

Informasi Penting Koperasi:
1. Simpanan Wajib: Harus dibayar paling lambat tanggal 10 setiap bulan. Jika telat, tidak dihitung dalam SHU Jasa Modal bulan tersebut.
2. SHU (Sisa Hasil Usaha):
   - Jasa Modal (30%): Dibagikan berdasarkan proporsi simpanan.
   - Jasa Transaksi (20%): Dibagikan berdasarkan proporsi belanja/transaksi.
   - Cadangan Modal (25%), Jasa Pengurus (15%), Pendidikan (5%), Infaq (5%).
3. Unit Usaha: "UB. Store" menyediakan kebutuhan pokok dan barang lainnya.
4. Transaksi: Pembelian dan simpanan bisa dilakukan via aplikasi dan dikonfirmasi via WhatsApp Admin.

Gaya Komunikasi:
- Ramah, sopan, dan profesional.
- Gunakan Bahasa Indonesia yang baik.
- Jawaban harus singkat dan padat (maksimal 3-4 kalimat kecuali diminta detail).
`;

let chatSession: any = null;

export const getChatSession = () => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  }
  return chatSession;
};

export const sendMessageToGemini = async (message: string) => {
  if (!apiKey) return "Maaf, API Key AI belum dikonfigurasi oleh Admin di server.";
  
  try {
    const session = getChatSession();
    const response = await session.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Maaf, saya sedang mengalami gangguan koneksi. Mohon coba lagi nanti.";
  }
};
