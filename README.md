# SIG-HIV Jombang

**Sistem Informasi Geografis — Peta Sebaran Kasus HIV Kabupaten Jombang**

Aplikasi web SIG untuk memvisualisasikan persebaran kasus HIV per kecamatan di Kabupaten Jombang, Jawa Timur. Dibangun sebagai prototipe tugas kuliah dengan metode RUP (Rational Unified Process).

## Fitur

- **Peta Interaktif** — Peta sebaran kasus HIV per kecamatan menggunakan Leaflet.js dengan `circleMarker` yang ukuran dan warnanya merepresentasikan tingkat prevalensi (Tinggi/Sedang/Rendah). Dapat difilter per tahun (2023–2025).
- **Data Kasus** — Tabel rekapitulasi kasus dan prevalensi yang dapat diurutkan (klik header kolom) dan dicari.
- **Edukasi** — FAQ seputar HIV/AIDS untuk mengurangi miskonsepsi dan stigma di masyarakat.
- **Navigasi Tab** — 5 halaman (Beranda, Peta Sebaran, Data Kasus, Edukasi, Tentang) tanpa reload halaman.

## Struktur File

```
SIG-HIV-Jombang.html   — Struktur utama halaman (HTML)
css/style.css           — Seluruh gaya visual (dipisah dari HTML)
js/script.js            — Seluruh logika JavaScript (dipisah dari HTML)
README.md               — Dokumentasi proyek
```

## Teknologi

- Leaflet.js 1.9.4 — library peta interaktif
- HTML5, CSS3, Vanilla JavaScript
- OpenStreetMap — tile layer peta

## Sumber Data

- Total kasus HIV/AIDS baru per tahun: Dinas Kesehatan Kabupaten Jombang (via Radar Jombang, Kabar Jombang, Tribun Jatim)
- Jumlah penduduk: BPS 2024
- **Data per kecamatan bersifat ilustratif** — lihat disclaimer di halaman Tentang

## Cara Menjalankan

Buka `SIG-HIV-Jombang.html` di browser (koneksi internet diperlukan untuk Leaflet dan OpenStreetMap).
