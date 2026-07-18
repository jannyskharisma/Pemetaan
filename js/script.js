/* =====================================================
   js/script.js — SIG-HIV Jombang
   Semua logika interaktif: navigasi, peta, tabel, data
   ===================================================== */

/* ---------------- Dataset Kecamatan ---------------- */
/* Data 21 kecamatan di Kabupaten Jombang:
   - lat/lng: koordinat untuk marker peta
   - penduduk: jumlah penduduk estimasi
   - k2023/k2024/k2025: jumlah kasus HIV per tahun
*/
const KECAMATAN_DATA = [
  { nama: "Jombang",            lat: -7.5464, lng: 112.2325, penduduk: 155000, k2023: 32, k2024: 47, k2025: 44 },
  { nama: "Diwek",               lat: -7.5967, lng: 112.2419, penduduk: 105000, k2023: 21, k2024: 30, k2025: 28 },
  { nama: "Mojowarno",           lat: -7.5794, lng: 112.3486, penduduk: 82000,  k2023: 19, k2024: 27, k2025: 24 },
  { nama: "Ngoro",               lat: -7.5386, lng: 112.3444, penduduk: 78000,  k2023: 17, k2024: 25, k2025: 22 },
  { nama: "Peterongan",          lat: -7.5325, lng: 112.2578, penduduk: 60000,  k2023: 14, k2024: 19, k2025: 17 },
  { nama: "Mojoagung",           lat: -7.5411, lng: 112.3739, penduduk: 75000,  k2023: 11, k2024: 18, k2025: 16 },
  { nama: "Jogoroto",            lat: -7.5589, lng: 112.2833, penduduk: 58000,  k2023: 10, k2024: 17, k2025: 15 },
  { nama: "Sumobito",            lat: -7.5308, lng: 112.3128, penduduk: 65000,  k2023: 10, k2024: 14, k2025: 14 },
  { nama: "Gudo",                lat: -7.5825, lng: 112.2481, penduduk: 55000,  k2023: 9,  k2024: 13, k2025: 11 },
  { nama: "Perak",               lat: -7.4736, lng: 112.2419, penduduk: 50000,  k2023: 8,  k2024: 12, k2025: 10 },
  { nama: "Tembelang",           lat: -7.4964, lng: 112.2275, penduduk: 52000,  k2023: 8,  k2024: 11, k2025: 10 },
  { nama: "Bandarkedungmulyo",   lat: -7.4894, lng: 112.1794, penduduk: 48000,  k2023: 7,  k2024: 10, k2025: 9  },
  { nama: "Kesamben",            lat: -7.4494, lng: 112.2894, penduduk: 58000,  k2023: 8,  k2024: 11, k2025: 10 },
  { nama: "Bareng",              lat: -7.6467, lng: 112.3092, penduduk: 55000,  k2023: 7,  k2024: 10, k2025: 9  },
  { nama: "Ploso",               lat: -7.4419, lng: 112.2669, penduduk: 45000,  k2023: 6,  k2024: 9,  k2025: 8  },
  { nama: "Megaluh",             lat: -7.5178, lng: 112.1972, penduduk: 40000,  k2023: 6,  k2024: 8,  k2025: 7  },
  { nama: "Kabuh",               lat: -7.3892, lng: 112.3122, penduduk: 42000,  k2023: 5,  k2024: 8,  k2025: 7  },
  { nama: "Plandaan",            lat: -7.3486, lng: 112.2989, penduduk: 38000,  k2023: 4,  k2024: 6,  k2025: 6  },
  { nama: "Kudu",                lat: -7.4064, lng: 112.3239, penduduk: 35000,  k2023: 4,  k2024: 6,  k2025: 5  },
  { nama: "Wonosalam",           lat: -7.7069, lng: 112.3517, penduduk: 32000,  k2023: 3,  k2024: 5,  k2025: 4  },
  { nama: "Ngusikan",            lat: -7.4444, lng: 112.1789, penduduk: 25000,  k2023: 3,  k2024: 4,  k2025: 4  },
];

/* Hitung prevalensi per 1.000 penduduk untuk setiap kecamatan per tahun */
KECAMATAN_DATA.forEach(d => {
  d.p2023 = +(d.k2023 / d.penduduk * 1000).toFixed(3);
  d.p2024 = +(d.k2024 / d.penduduk * 1000).toFixed(3);
  d.p2025 = +(d.k2025 / d.penduduk * 1000).toFixed(3);
});

/* ---------------- Navigasi Tab ---------------- */
/* goTo(id) — menampilkan view berdasarkan ID dan menyembunyikan lainnya */
function goTo(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + id).classList.add('active');
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('active', b.dataset.view === id));
  if (id === 'peta' && map) { setTimeout(() => map.invalidateSize(), 50); }
}

/* Event listener navigasi — klik tombol di topbar */
document.getElementById('nav').addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON') goTo(e.target.dataset.view);
});

/* ---------------- Peta Leaflet (Choropleth) ---------------- */
let map, geoLayer, legendControl;

/* catInfo(prev) — mengembalikan label, kelas CSS, dan warna berdasarkan nilai prevalensi */
function catInfo(prev) {
  if (prev >= 0.25) return { label: "Tinggi", cls: "high", color: "#A1402F" };
  if (prev >= 0.18) return { label: "Sedang", cls: "mid", color: "#B9902E" };
  return { label: "Rendah", cls: "low", color: "#1F7A72" };
}

/* cariData(nama) — mencari data kecamatan berdasarkan nama (dipakai untuk mencocokkan dengan GeoJSON) */
function cariData(nama) {
  return KECAMATAN_DATA.find(d => d.nama === nama);
}

/* initMap() — inisialisasi peta Leaflet di <div id="map"> */
function initMap() {
  map = L.map('map').setView([-7.545, 112.28], 10.3);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors', maxZoom: 16
  }).addTo(map);
  drawYear('2025');
  addLegend();
}

/* styleFeature(feature, year) — menentukan warna fill poligon kecamatan berdasarkan prevalensi tahun terpilih */
function styleFeature(feature, year) {
  const d = cariData(feature.properties.nama);
  const info = d ? catInfo(d['p' + year]) : { color: '#CCCCCC' };
  return {
    fillColor: info.color,
    weight: 1.5,
    color: '#FFFFFF',
    fillOpacity: 0.75,
  };
}

/* drawYear(year) — gambar layer choropleth kecamatan untuk tahun tertentu */
function drawYear(year) {
  if (geoLayer) map.removeLayer(geoLayer);

  geoLayer = L.geoJSON(KECAMATAN_GEOJSON, {
    style: feature => styleFeature(feature, year),
    onEachFeature: (feature, layer) => {
      const d = cariData(feature.properties.nama);
      if (!d) return;
      const kKey = 'k' + year, pKey = 'p' + year;
      const info = catInfo(d[pKey]);
      layer.bindPopup(`<b>${d.nama}</b><br>Tahun ${year}<br>Kasus: ${d[kKey]}<br>Penduduk: ${d.penduduk.toLocaleString('id-ID')}<br>Prevalensi: ${d[pKey]}/1.000<br>Kategori: ${info.label}`);
      layer.on({
        mouseover: e => e.target.setStyle({ weight: 3, color: '#155A54', fillOpacity: 0.9 }),
        mouseout: e => geoLayer.resetStyle(e.target),
        click: () => updateSidePanel(d, year),
      });
    },
  }).addTo(map);

  updateSidePanel(null, year);
}

/* addLegend() — menambahkan kotak legenda kategori prevalensi ke peta */
function addLegend() {
  legendControl = L.control({ position: 'bottomright' });
  legendControl.onAdd = function () {
    const div = L.DomUtil.create('div', 'legend-box');
    div.innerHTML = `
      <div style="font-weight:600;margin-bottom:6px;">Kategori Prevalensi</div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
        <span style="width:12px;height:12px;background:#A1402F;display:inline-block;border-radius:2px;"></span> Tinggi (&ge;0,25/1.000)
      </div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
        <span style="width:12px;height:12px;background:#B9902E;display:inline-block;border-radius:2px;"></span> Sedang (0,18&ndash;0,25/1.000)
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="width:12px;height:12px;background:#1F7A72;display:inline-block;border-radius:2px;"></span> Rendah (&lt;0,18/1.000)
      </div>`;
    return div;
  };
  legendControl.addTo(map);
}

/* updateSidePanel(d, year) — perbarui panel samping peta dengan ringkasan/peringkat */
function updateSidePanel(d, year) {
  document.getElementById('spYear').textContent = year;
  const kKey = 'k' + year;
  if (d) {
    document.getElementById('spName').textContent = 'Kecamatan ' + d.nama;
    document.getElementById('spTotal').textContent = d[kKey];
  } else {
    document.getElementById('spName').textContent = 'Kabupaten Jombang';
    const total = KECAMATAN_DATA.reduce((s, x) => s + x[kKey], 0);
    document.getElementById('spTotal').textContent = total;
  }
  /* Sortir 5 kecamatan dengan kasus tertinggi */
  const top5 = [...KECAMATAN_DATA].sort((a, b) => b[kKey] - a[kKey]).slice(0, 5);
  document.getElementById('spRank').innerHTML = top5.map((x, i) => {
    const info = catInfo(x['p' + year]);
    return `<div class="rank-item"><span>${i + 1}. ${x.nama}</span><span class="pill ${info.cls}">${x[kKey]} kasus</span></div>`;
  }).join('');
}

/* Event listener toggle tahun pada peta */
document.getElementById('yearToggle').addEventListener('click', e => {
  if (e.target.tagName !== 'BUTTON') return;
  document.querySelectorAll('#yearToggle button').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  drawYear(e.target.dataset.year);
});

/* ---------------- Tabel Data ---------------- */
let sortKey = '__kasus', sortDir = -1;

/* renderTable() — render tabel berdasarkan filter tahun, pencarian, dan pengurutan */
function renderTable() {
  const yearField = document.getElementById('tableYear').value; // "k2023", "k2024", atau "k2025"
  const year = yearField.slice(1);
  const q = document.getElementById('searchBox').value.trim().toLowerCase();
  let rows = KECAMATAN_DATA.map(d => ({
    nama: d.nama,
    penduduk: d.penduduk,
    __kasus: d[yearField],
    __prev: d['p' + year],
    __cat: catInfo(d['p' + year]).label,
    catCls: catInfo(d['p' + year]).cls
  }));
  if (q) rows = rows.filter(r => r.nama.toLowerCase().includes(q));
  rows.sort((a, b) => a[sortKey] > b[sortKey] ? sortDir : (a[sortKey] < b[sortKey] ? -sortDir : 0));
  document.getElementById('tableBody').innerHTML = rows.map(r => `
    <tr>
      <td>${r.nama}</td>
      <td>${r.penduduk.toLocaleString('id-ID')}</td>
      <td>${r.__kasus}</td>
      <td>${r.__prev}</td>
      <td><span class="pill ${r.catCls}">${r.__cat}</span></td>
    </tr>`).join('');
}

/* Klik header tabel — urutkan berdasarkan kolom */
document.querySelectorAll('th[data-key]').forEach(th => {
  th.addEventListener('click', () => {
    const key = th.dataset.key;
    sortDir = (sortKey === key) ? -sortDir : -1;
    sortKey = key;
    renderTable();
  });
});

/* Filter tabel — pencarian dan pemilihan tahun */
document.getElementById('searchBox').addEventListener('input', renderTable);
document.getElementById('tableYear').addEventListener('change', renderTable);

/* ---------------- Inisialisasi ---------------- */
initMap();
renderTable();
