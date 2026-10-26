# Makcik Canteen: Haze Fighter (Prototaip Babylon.js)

*[English version available here: README.md](README.md)*  
*Sebahagian daripada [Ekosistem Bengkel AI for Gaming](../README.ms-MY.md). Permainan berkaitan: [King Myvi: Highway Legends](../index.html) | [Neon Kart 3D](../neon_kart_3d/neon_kart_3d_ai_for_gaming_live_workshop_demo.html)*

> **"Lawan jerebu di kantin sekolah dengan jenaka, kipas industri, dan bom ais kering!"**  
> Sebuah bukti konsep permainan arked aksi 3D berasaskan web yang pantas, dibina menggunakan **Babylon.js** dan Web Audio API, direka secara langsung semasa bengkel AI for Gaming.

---

## 🤖 Bagaimana Permainan Ini Dikonsep Menggunakan Microsoft Copilot

Semasa sesi bengkel langsung, **Makcik Canteen** telah direka dan distrukturkan dari sifar dalam masa kurang daripada 10 minit menggunakan [Microsoft Copilot (Log Sesi Langsung)](https://copilot.microsoft.com/conversations/join/NppskzM778rkVNxfjVi5D).

### 💡 Tip Pro Utama: "Tanya Saya Soalan Berkaitan"
Teknik prom paling kritikal yang diajar dalam bengkel ini adalah **jangan sesekali meminta AI menjana keseluruhan Dokumen Reka Bentuk Permainan (GDD) dalam satu prom sekali gus**. Jika diminta secara membuta tuli, AI akan menghasilkan mekanik RPG yang terlalu luas, tidak fokus, dan mengalami "scope creep".

Sebaliknya, prom tersebut menetapkan AI ke dalam **sesi temu bual perundingan interaktif**:

> **Prom Asal yang Digunakan:**  
> *"Saya ingin mereka bentuk permainan web ringan bertajuk 'Haze Fighter' / 'Makcik Canteen' di mana seorang makcik kantin membersihkan jerebu sebelum murid-murid tiba untuk waktu rehat. Tanya saya soalan berkaitan sebelum mencipta dokumen reka bentuk permainan."*

### 📋 Kitaran Dialog 4-Langkah Copilot
1. **Sesi Soal Jawab Diagnostik Copilot:** Copilot bertindak balas dengan mengajukan 5 soalan skop yang tepat:
   - *Sasaran Khalayak:* Siapa yang bermain? (Jawapan: Pelajar sekolah menengah, pemain kasual).
   - *Cadangan Nilai Unik (USP):* Apakah kelainan yang melucukan? (Jawapan: Kipas penghembus industri + bom ais kering kriogenik).
   - *Kekangan Teknologi:* Di mana permainan akan dihoskan? (Jawapan: Web statik tanpa pangkalan data, Babylon.js, Web Audio API, prototaip satu aras).
   - *Persekitaran & Tema:* Di mana lokasinya? (Jawapan: Kantin sekolah menengah Malaysia dengan gerai makanan, sepanduk, dan Milo Dinosaur).
   - *Syarat Kemenangan/Kekalahan:* Bagaimana sesi tamat? (Jawapan: Unduran masa 60 saat sehingga loceng rehat; bersihkan semua kelompok jerebu untuk menang).
2. **Penjanaan Spesifikasi Modular:** Dengan kekangan yang jelas, Copilot menjana set dokumen markdown modular yang tersusun:
   - [Dokumen Reka Bentuk Permainan (GDD)](GAME_DESIGN_DOCUMENT.md)
   - [Dokumen Reka Bentuk Teknikal](TECHNICAL_DESIGN_DOCUMENT.md)
   - [Mekanik Permainan](GAME_MECHANICS.md)
   - [Spesifikasi Fizik Permainan](GAME_PHYSICS.md)
   - [Timbunan Teknologi](GAME_TECH_STACK.md)
   - [Reka Bentuk UI / UX](GAME_UI_UX.md)
   - [Aset & Audio Permainan](GAME_ASSETS.md)
   - [Pelan Ujian & QA](GAME_TESTING.md)
   - [Kebolehcapaian Permainan](GAME_ACCESSIBILITY.md)
3. **Sintesis Kod Berasaskan Ejen (Antigravity & OpenCode):** Fail spesifikasi `.md` ini kemudiannya disalurkan terus kepada ejen pengaturcaraan, yang menjana keseluruhan kod permainan 3D di dalam folder `js/` tanpa pengekodan manual oleh pembangun.

---

## 📚 Set Dokumen Reka Bentuk & Spesifikasi

| Dokumen | Penerangan | Status |
| :--- | :--- | :--- |
| **[Game Design Document (GDD)](GAME_DESIGN_DOCUMENT.md)** | Premis teras, persona sasaran, kitaran permainan, dan pelan ciri Babylon.js. | ✅ Spesifikasi Aktif |
| **[Technical Design Document](TECHNICAL_DESIGN_DOCUMENT.md)** | Senibina enjin, sempadan modul, dan keperluan masa nyata. | ✅ Spesifikasi Aktif |
| **[Game Mechanics](GAME_MECHANICS.md)** | Hembusan kipas, lontaran bom ais kering, kuasa tambahan, dan peraturan menang/kalah. | ✅ Spesifikasi Aktif |
| **[Spesifikasi Fizik](GAME_PHYSICS.md)** | Pemalar kinematik, sudut kon angin, trajektori balistik, dan radius gelombang letupan. | ✅ Spesifikasi Aktif |
| **[Timbunan Teknologi](GAME_TECH_STACK.md)** | Saliran Babylon.js WebGL/WebGPU, penjana audio Web Audio, dan hos statik. | ✅ Spesifikasi Aktif |
| **[Reka Bentuk UI / UX](GAME_UI_UX.md)** | Meter pencemaran udara (API/IPU) masa nyata, pemasa 60s, dan kawalan sentuh mudah alih. | ✅ Spesifikasi Aktif |
| **[Aset & Audio Permainan](GAME_ASSETS.md)** | Model geometri 3D prosedur, tekstur zarah, kesan bunyi Web Audio, dan suara Makcik. | ✅ Spesifikasi Aktif |
| **[Pelan Ujian & QA](GAME_TESTING.md)** | Matriks ujian fungsi, semakan sempadan, dan penanda aras prestasi pelayar. | ✅ Spesifikasi Aktif |
| **[Kebolehcapaian Permainan](GAME_ACCESSIBILITY.md)** | Kesetaraan papan kekunci/tetikus/sentuhan, HUD kontras tinggi, dan suis audio. | ✅ Spesifikasi Aktif |

---

## 🕹️ Kawalan Permainan

| Kawalan | Tindakan | Perincian |
| :--- | :--- | :--- |
| **W, A, S, D** / **Kekunci Anak Panah** | **Gerakkan Makcik** | Berlari merentasi kantin dengan animasi jalan terkedek-kedek kartun |
| **Sasaran Tetikus** | **Arahkan Kipas & Sasaran** | Makcik dan bulatan sasaran menghadap kursor tetikus dengan lancar |
| **Bar Ruang (Spacebar)** / **Klik Kanan** | **Aktifkan Kipas (Hembus)** | Kon angin laju berterusan yang menolak dan meleraikan kelompok jerebu |
| **Klik Kiri** / **Kekunci E** | **Lontar Bom Ais Kering** | Projektil arka balistik dengan letupan gelombang sejuk beku menyeluruh |
| **Kekunci M** / **Butang Senyap** | **Suis Audio** | Buka atau senyapkan kesan bunyi prosedur Web Audio & suara Makcik |
| **Kayu Riang Maya & Butang Sentuh** | **Sokongan Skrin Sentuh** | Sokongan penuh telefon pintar dan tablet melalui kayu riang maya |

---

## 🚀 Cara Menjalankan Permainan

### Kaedah 1: Pelancar Dwiklik (Windows)
Dwiklik fail `start_game.bat`. Ia akan melancarkan pelayan Python tempatan dan membuka pelayar lalai anda secara automatik di `http://localhost:8080/index.html`.

### Kaedah 2: Baris Perintah Python
```bash
python server.py
```
Buka [http://localhost:8080/index.html](http://localhost:8080/index.html) dalam pelayar web anda.

### Kaedah 3: Buka Pelayar Secara Terus
Anda juga boleh membuka fail `index.html` secara terus dalam Google Chrome, Microsoft Edge, atau Mozilla Firefox.
