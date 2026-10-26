# Panduan Peserta Bengkel Praktikal & Pek Prom AI
## *Membina "King Myvi: Highway Legends" bersama Antigravity, OpenCode & Blender*
**[English](WORKSHOP_HANDOUT_AND_PROMPTS.md) | [Bahasa Melayu](WORKSHOP_HANDOUT_AND_PROMPTS.ms-MY.md)**  
*Siri Permainan Bengkel: [King Myvi (Utama)](../README.ms-MY.md) | [Makcik Canteen](../MAKCIK_CANTEEN/README.ms-MY.md) | [Neon Kart 3D](../neon_kart_3d/README.ms-MY.md) | [Pemuat Turun 3D Warehouse](../sketchup_downloader/README.ms-MY.md) | [Templat Reka Bentuk](../TEMPLATE_DESIGN_DOCUMENT/README.ms-MY.md)*

---

> [!NOTE]
> **Selamat Datang ke Makmal Bengkel!**  
> Dalam sesi praktikal 3 jam ini, anda tidak akan menulis kod JavaScript atau shader 3D secara manual. Anda bertindak sebagai **Pengarah Kreatif & Penerbit Utama**, menggunakan ejen AI (**Antigravity** atau **OpenCode**) untuk mereka bentuk seni bina, mengekod, menguji, dan menala permainan 3D penuh yang berjalan di atas Babylon.js.

---

## 🌟 Petua Emas Prom Permainan: Skoping Perundingan (Consultative Scoping)
> [!IMPORTANT]
> **Petua Utama (#1 Pro-Tip) dari Sesi Langsung:**  
> Jangan sekali-kali meminta LLM menjana Dokumen Reka Bentuk Permainan (GDD) secara sekali gus (single-shot) tanpa sekatan skop. Prom buta sebegini hampir selalu menghasilkan skop melampau, mekanik generik, dan janji ciri yang mustahil disiapkan dalam tempoh terhad.
>
> Sebaliknya, cetuskan **Temu Duga Diagnostik Perundingan** dengan menyertakan frasa kunci ini:
> ```text
> "Saya ingin mereka bentuk permainan tentang [konsep]. Sebelum mencipta dokumen reka bentuk permainan, ajukan soalan-soalan relevan kepada saya untuk menetapkan skop audiens sasaran, gelung teras, USP, kekangan platform, dan gaya seni."
> ```
> Lihat transkrip dialog Copilot sebenar yang menunjukkan teknik ini:
> - 🍛 [Skoping GDD Makcik Canteen: Haze Fighter di Microsoft Copilot](https://copilot.microsoft.com/conversations/join/NppskzM778rkVNxfjVi5D)
> - 📄 [Penjanaan Suite Templat Reka Bentuk Permainan di Microsoft Copilot](https://copilot.microsoft.com/conversations/join/a8PJA1mSSRu5JoSRYExV7)

---

---

## 1. Persediaan Pantas & Pengesahan Persekitaran (00:00 - 00:15)

### Langkah 1: Buka Terminal Anda & Sahkan Alatan
Buka terminal anda (PowerShell di Windows, Terminal di macOS) dan jalankan:
```bash
node -v      # Seharusnya v18+ atau v20+
npm -v       # Seharusnya v9+ atau v10+
git --version
```

### Langkah 2: Lancarkan Ejen AI Anda
* **Jika menggunakan Antigravity:** Buka folder ruang kerja projek dalam Antigravity (`File -> Open Folder -> KD_AI_FOR_GAMING`).
* **Jika menggunakan OpenCode:** Dalam terminal anda, navigasi ke folder tersebut dan jalankan `opencode .`.

### Langkah 3: Jalankan Pelayan Pembangunan
```bash
npm install
npm run dev
```
Buka pelayar web anda di `http://localhost:5173`. Anda akan melihat permainan berjalan dengan sokongan Hot Module Reloading (HMR) serta-merta.

---

## 2. Prom Fasa 1: Seni Bina Permainan & Gelung Teras (00:15 - 00:45)

### Prom 1.1: Menetapkan Skop Permainan & Seni Bina
*Salin dan tampal ini ke dalam sembang Antigravity / OpenCode:*
```text
Saya sedang membina permainan web 3D arked dalam Babylon.js bernama "King Myvi: Highway Legends".
Premis teras permainan ini adalah memandu dari Titik A (Plaza Tol Jalan Duta) ke Titik B (R&R Ayer Keroh) merentasi laluan lebuh raya sepanjang 5,000m.
Permainan ini mempunyai 2 Cadangan Nilai Unik (USP):
1. Pancaran Lampu Tinggi (Spacebar): Memancarkan lampu tinggi memaksa trafik perlahan di lorong kanan memberi isyarat dan bertukar ke lorong tengah.
2. Mengelak Lubang Jalan & Tanjakan SmartTAG: Lubang jalan mengurangkan kelajuan; lorong SmartTAG melancarkan kereta dalam lompatan tanjakan nitro berhalaju tinggi.

Sila semak ruang kerja dan pastikan kita mempunyai seni bina modular yang kemas:
- src/main.js (Enjin Babylon, Gelung Pemaparan, Mesin Keadaan)
- src/myvi.js (Fizik Kenderaan Arked, Olengan Badan, Kawalan)
- src/traffic.js (Penjanaan Trafik AI & Mesin Keadaan Memberi Laluan)
- src/highway.js (Lebuhraya PLUS Modular & Gantri Papan Tanda)
- src/obstacles.js (Lubang Jalan & Tanjakan SmartTAG)
- src/ui.js (HUD Arked: Meter Kelajuan, Baki Jarak, Status Lampu Tinggi)
- src/audio.js (Kesan Bunyi Sintesis Web Audio)

Bina atau sahkan persediaan babak asas dengan jalan asfalt, kamera kejar, dan pencahayaan matahari senja.
```

---

## 3. Prom Fasa 2: Blender MCP & Saluran Paip Aset 3D (00:45 - 01:30)

### Memahami Jambatan Blender MCP
* Jika pengajar anda menjalankan **Blender MCP secara langsung**: Ejen menghantar panggilan pelaksanaan Python terus melalui Model Context Protocol ke Blender, mengubah suai mesh dan menjana model `.glb` secara automatik.
* Jika anda berada dalam **Mod Hibrid / Sandaran**: Projek ini mengandungi penjana geometri prosedural yang membina Myvi poli rendah, pokok kelapa sawit, dan gantri tol terus dalam Babylon.js, serta menukar model `.glb` secara automatik apabila fail ditemui dalam `/public/assets/models/`.

### Prom 2.1: Mengarahkan Blender melalui MCP / Menjana Aset 3D
```text
Kita perlu menjana model badan kereta Perodua Myvi Malaysia poli rendah bergaya.
Keperluan spesifikasi:
1. Perkadaran hatchback kompak (Panjang: 3.8m, Lebar: 1.7m, Tinggi: 1.5m).
2. Cat badan putih bersih (#F5F5F5) dengan kemasan berkilat.
3. Cermin gelap (#1A1A1A).
4. Empat roda aloi gelap di setiap sudut.
5. Spoiler bumbung belakang yang sporty dan tersendiri.
6. Dua lampu hadapan kembar yang berfungsi sebagai titik asal kon lampu sorot.
7. Eksport model yang dihasilkan sebagai binary glTF (.glb) ke dalam public/assets/models/myvi.glb.
```

### Prom 2.2: Pengekstrakan Imej-ke-Spesifikasi Pelbagai Mod & Pembetulan Model Langsung
*(Seperti yang ditunjukkan semasa peningkatan langsung di bengkel kepada Myvi Merah Lava Generasi ke-3)*:

1. **Prom Pengekstrakan Spesifikasi Multimodal** (Muat naik paparan 3D belakang-kiri & hadapan-kiri ke Copilot/Gemini):
   ```text
   "Ini adalah imej rujukan teknikal Perodua Myvi. Sila berikan pecahan teknikal yang 
   distrukturkan khusus untuk pemodelan poligon 3D: perkadaran keseluruhan, kecuraman pintu but, 
   orientasi kluster lampu belakang (mendatar membalut sisi), reka bentuk spoiler bumbung dua tingkat, 
   sisipan bumbung terapung tiang C, dan isipadu utama bagi penjanaan mesh prosedur."
   ```
2. **Prom Pembetulan Langsung Ejen Blender MCP** (Kepada ejen pengekodan dengan sambungan Blender aktif):
   ```text
   "Model kereta ini tidak tepat dan tidak seperti di dunia sebenar. Ubah model kereta kepada rujukan visual 
   dan spesifikasi ini. Tukar lampu belakang menegak kepada kluster mendatar dua bahagian membalut sisi, 
   tambah spoiler dua tingkat bersirip hitam, sisipan hitam bumbung terapung tiang C, dan roda aloi turbin 15 inci. 
   Eksport terus ke public/assets/models/myvi.glb."
   ```
*(Untuk perincian teknikal penuh dan kod Python prosedur, rujuk [`docs/BLENDER_3D_PIPELINE.ms-MY.md`](BLENDER_3D_PIPELINE.ms-MY.md)).*

### Jalan Pintas Prototip: Memperoleh Model 3D Percuma dari 3D Warehouse (`sketchup_downloader/`)
Tiada perisian Blender atau ingin mendapatkan mercu tanda tempatan dan seni bina Malaysia yang terperinci (KLCC, plaza tol PLUS, gerai mamak, perabot kantin)? Alih-alih membina model dari awal, muat turun model **`.glb` sedia guna terus daripada Trimble SketchUp 3D Warehouse** tanpa perlu mendaftar akaun atau log masuk:

**Windows (PowerShell):**
```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.ps1))) "https://3dwarehouse.sketchup.com/model/16965783-d6e1-4abf-b2d6-ef87f1b25747/Ombak-KLCC" -Download
```

**macOS / Linux (Bash):**
```bash
curl -sSL https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.sh | bash -s -- --download "https://3dwarehouse.sketchup.com/model/16965783-d6e1-4abf-b2d6-ef87f1b25747/Ombak-KLCC"
```

Simpan fail `.glb` yang dimuat turun ke dalam `public/assets/models/` dan arahkan ejen AI anda untuk memuatkannya ke dalam babak Babylon.js! *(Lihat [`sketchup_downloader/README.ms-MY.md`](../sketchup_downloader/README.ms-MY.md) untuk perincian utiliti penukaran dan muat turun kelompok).*

---

## 4. Prom Fasa 3: Pemasangan Permainan & 2 USP (01:30 - 02:45)

### Prom 3.1: Membina Pengawal Kenderaan Arked
```text
Dalam src/myvi.js, laksanakan pengawal arked kenderaan pemain:
1. Input: W/Atas (Pecutan), S/Bawah (Brek/Undur), A/D atau Kiri/Kanan (Stereng).
2. Pecutan: Lengkung bukan linear mencapai 110 km/j dalam 3 saat, kelajuan maksimum 180 km/j.
3. Stereng: Kelajuan lateral lancar dengan olengan badan visual (condong sehingga 8 darjah ke arah pusingan).
4. Penjajaran semula automatik: Melepaskan kekunci stereng meluncurkan kereta kembali ke penjajaran hadapan dengan lancar.
5. Pasang kamera kejar di belakang dan sedikit di atas kereta yang menginterpolasi (lerp) dengan regangan medan pandangan (FOV) berasaskan kelajuan.
```

### Prom 3.2: Melaksanakan USP 1 — Pancaran Lampu Tinggi & Trafik AI
```text
Laksanakan sistem Pancaran Lampu Tinggi dan Trafik AI:
1. Kenderaan Pemain:
   - Apabila pengguna menekan atau menahan Spacebar, aktifkan kon lampu sorot hadapan berkembar sejauh 42 meter dengan pencahayaan putih/sian terang.
   - Cetuskan gegaran mikro kamera dan bunyi loceng kerdipan berfrekuensi tinggi.
2. Kenderaan Trafik AI:
   - Jana trafik poli rendah (lori kanvas, sedan, van) di hadapan pemain bergerak pada kelajuan 80-95 km/j di lorong rawak.
   - Apabila pemain memancarkan lampu tinggi di belakang kenderaan di lorong kanan (dalam jarak 35m), kenderaan AI mesti:
     a) Menyalakan lampu isyarat kiri yang berkelip.
     b) Menunggu 0.28 saat (tangguhan reaksi panik).
     c) Menginterpolasi kedudukan lateralnya ke lorong tengah bersebelahan dalam masa 0.7 saat.
     d) Memberi pemain ganjaran skor +250 "Fast Lane Cleared!".
3. Pelanggaran:
   - Jika pemain melanggar trafik tanpa laluan, cetuskan fizik lantunan bampar, turunkan kelajuan ke 35 km/j, dan keluarkan kepulan asap.
```

### Prom 3.3: Melaksanakan USP 2 — Lubang Jalan & Tanjakan SmartTAG
```text
Dalam src/obstacles.js, jana halangan jalan raya dinamik di sepanjang lebuh raya PLUS:
1. Lubang Jalan:
   - Taburkan kawah asfalt gelap di lorong 1 dan 2 setiap 60-90 meter.
   - Apabila pemain melanggar lubang jalan: kurangkan kelajuan sebanyak 45%, cetuskan gegaran kamera, dan tambah ayunan stereng tidak stabil selama 1.2s.
2. Tanjakan SmartTAG Penuh Lorong & Gantri Sebenar:
   - Bina tanjakan condong 3D penuh seluas 4.2m (meliputi keseluruhan lorong) dengan anak panah chevron bercahaya hijau zamrud.
   - Di puncak tanjakan (z = +7.5), letakkan gantri SmartTAG penuh seperti di dunia sebenar: tiang berbelang merah-putih, papan tanda SmartTAG kuning dengan fon condong tebal, papan tanda merah "🚗 SAHAJA", kotak anak panah hijau `⬇`, tanda had ketinggian "2.1m", dan palang tol yang terangkat secara dinamik.
   - Apabila pemain melaluinya: cetuskan lonjakan halaju +60 km/j (sehingga 240 km/j), aktifkan lompatan tanjakan graviti rendah merentasi trafik di hadapan, dan mainkan bunyi deruan nitro supersonik.
```

### Prom 3.4: HUD, Web Audio Prosedural & Gelung Tamat Permainan
```text
Lengkapkan persembahan permainan:
1. Lapisan HUD:
   - Meter Kelajuan Digital memaparkan km/j masa nyata dengan peralihan warna (Sian -> Jingga -> Merah Neon melebihi 150 km/j).
   - Meter kiraan undur "Baki Jarak ke Ayer Keroh" (bermula dari 5,000m hingga 0m).
   - Penunjuk status Lampu Tinggi ("READY [SPACE]" / "FLASHING!").
   - Pemasa kiraan undur 90 saat.
2. Enjin Audio (Web Audio API):
   - Sintesiskan RPM enjin yang picnya berubah mengikut kelajuan.
   - Sintesiskan decitan tayar semasa pusingan tajam.
   - Sintesiskan hon kereta tradisi Malaysia ("pon-pon!") apabila menekan kekunci 'H'.
3. Menang & Kalah:
   - Melepasi Titik B sebelum masa tamat: Paparkan modal kemenangan "HIGHWAY KING".
   - Pemasa mencecah 0: Paparkan skrin kekalahan "LATE FOR DINNER" dengan butang Cuba Semula.
```

---

## 5. Fasa 4: Penyebaran Web 1-Klik (02:45 - 03:00)

### Pelancaran ke GitHub Pages
1. Bina bundle pengeluaran:
   ```bash
   npm run build
   ```
2. Rakam dan tolak kod ke repositori GitHub anda:
   ```bash
   git add .
   git commit -m "feat: lengkapkan demo King Myvi Highway Legends"
   git push origin main
   ```
3. Di dalam repositori GitHub anda:
   * Pergi ke **Settings -> Pages**.
   * Di bawah **Build and deployment -> Source**, pilih **GitHub Actions**.
   * Permainan anda kini disiarkan secara langsung di `https://<nama-pengguna>.github.io/<nama-repo>/`!

### Pelancaran ke Vercel (Alternatif Terpantas)
1. Jalankan:
   ```bash
   npx vercel
   ```
2. Tekan Enter untuk 3 soalan. Dalam 20 saat, anda menerima URL pengeluaran HTTPS yang boleh dikongsikan kepada seluruh dewan!

---

## 6. Penyelesaian Masalah & Soalan Lazim

| Gejala | Punca | Penyelesaian |
| :--- | :--- | :--- |
| **Skrin hitam dalam pelayar** | Konteks WebGL gagal atau kamera tiada sasaran | Buka konsol pelayar (`F12`). Pastikan kamera Babylon disambungkan ke kanvas dan sasaran `lockedTarget` ditetapkan. |
| **Kereta jatuh tembus jalan** | Satah perlanggaran atau had Y hilang | Pastikan kedudukan Y kereta dihadkan pada paras jalan (`this.position.y = 0.45`). |
| **Audio tidak berbunyi** | Dasar automain (autoplay) pelayar | Pelayar memerlukan interaksi pengguna (klik/butang) sebelum konteks Web Audio bermula. Skrin Mula permainan telah mengendalikannya secara automatik melalui butang mula. |
| **Kamera menghadap depan kereta bukannya jalan** | Ofset putaran kamera salah | Dalam Babylon.js FollowCamera, tetapkan `rotationOffset = 180` (bukan 0) untuk meletakkan kamera di belakang kereta menghadap ke hadapan lebuh raya. |
