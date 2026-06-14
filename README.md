# FokusAja 🍅📝

**FokusAja** adalah aplikasi produktivitas berbasis web yang menggabungkan metode *Pomodoro Timer* dengan berbagai alat bantu seperti *To-Do List*, *Kalkulator*, dan *Scratchpad*. Dirancang untuk membantu Anda tetap fokus dan mengelola waktu dengan lebih efisien dalam satu tampilan terpadu.

## ✨ Fitur Utama

- **Pomodoro Timer Canggih**:
  - **Sistem Antrian (Queue)**: Tambahkan beberapa sesi fokus sekaligus ke dalam antrian.
  - **Sesi Kustom**: Atur nama dan durasi sesi sesuai kebutuhan Anda.
  - **Mode Mini (Floating Widget)**: Ubah timer menjadi widget kecil yang dapat digeser (*draggable*) agar tetap terlihat saat Anda membuka jendela lain.
  - **Alarm & Modal Notifikasi**: Notifikasi visual dan suara (Web Audio API) yang persisten saat waktu habis.
- **Peralatan Produktivitas (Toolbox)**:
  - **To-Do List**: Kelola daftar tugas dengan fitur tambah, centang, dan hapus. Data tersimpan otomatis di `localStorage`.
  - **Kalkulator**: Kalkulator sederhana terintegrasi untuk perhitungan cepat tanpa meninggalkan aplikasi.
  - **Scratchpad (Catatan Cepat)**: Area teks untuk mencatat ide atau pikiran mendadak agar tidak mengganggu fokus.
- **Desain Modern & Responsif**: Menggunakan Tailwind CSS dengan font Inter, mendukung mode Desktop dan Mobile.

## 🚀 Teknologi yang Digunakan

- **HTML5 & CSS3**: Struktur semantik dan styling kustom.
- **Tailwind CSS**: Framework CSS utility-first untuk desain responsif.
- **Vanilla JavaScript**: Logika aplikasi murni tanpa dependensi eksternal berat.
- **Web Audio API**: Digunakan untuk menghasilkan suara alarm yang jernih secara programatis.
- **localStorage API**: Menyimpan data tugas, catatan, dan preferensi pengguna secara lokal.

## 🛠️ Cara Penggunaan

1. **Clone atau Download**: Unduh repositori ini.
2. **Jalankan**: Buka file `src/index.html` langsung di browser favorit Anda.
3. **Mulai Fokus**:
    - Pilih preset waktu atau buat sesi kustom.
    - Tambahkan ke antrian jika Anda memiliki beberapa tugas.
    - Gunakan **Mode Mini** jika ingin timer tetap melayang di atas jendela lain.
    - Manfaatkan **Toolbox** di sebelah kanan untuk membantu pekerjaan Anda.

## 📂 Struktur Folder

```text
FokusAja/
├── src/
│   ├── index.html    # Struktur UI dan layout
│   └── script.js     # Logika Timer, To-Do List, dan Peralatan
└── README.md         # Dokumentasi proyek
```

## 📝 Lisensi

Proyek ini dibuat untuk tujuan pembelajaran dan penggunaan pribadi. Silakan gunakan dan modifikasi sesuai kebutuhan Anda!

---
Dibuat dengan ❤️ untuk produktivitas yang lebih baik.
