# 📋 Set Templat Dokumen Reka Bentuk Permainan & Spesifikasi AI

*[English version available here: README.md](README.md)*  
*Sebahagian daripada [Ekosistem Bengkel AI for Gaming](../README.ms-MY.md). Sesi Copilot Interaktif: [Sesi Set Reka Bentuk Microsoft Copilot](https://copilot.microsoft.com/conversations/join/a8PJA1mSSRu5JoSRYExV7)*

Folder ini mengandungi set **Templat Dokumen Reka Bentuk Permainan (GDD) dan Dokumen Reka Bentuk Teknikal (TDD) Bersedia-AI** yang modular dan terbukti berkesan untuk prototaip pantas bersama ejen pengaturcaraan ([Google Antigravity](https://antigravity.google/), [OpenCode](https://opencode.ai/), dan [Blender MCP](https://github.com/ahujasid/mcp-for-blender)).

---

## 🌟 Tip Pro #1: "Tanya Saya Soalan Berkaitan"

Apabila mencetuskan idea atau mereka bentuk permainan baharu bersama LLM (Microsoft Copilot, Gemini, ChatGPT, Claude), **jangan sesekali meminta AI menjana keseluruhan Dokumen Reka Bentuk Permainan dalam satu prom sekali gus**.

### Mengapa Prom Satu Kali Gagal
Apabila diberikan prom seperti `"Tuliskan Dokumen Reka Bentuk Permainan untuk permainan perlumbaan 3D"`, LLM tidak mempunyai sebarang batas kekangan. AI akan membayangkan permainan RPG multipemain dunia terbuka yang terlampau besar dengan sistem cuaca prosedur, ekonomi kompleks, dan pokok talaan kenderaan—mengakibatkan **scope creep** yang membebankan pembangun pemula dan mengelirukan ejen pengaturcaraan AI.

### Corak Prom Perundingan Interaktif
Sebaliknya, tetapkan AI ke dalam **sesi temu bual perundingan reka bentuk** sebelum sebarang dokumen dijana:

```text
"Saya ingin mereka bentuk permainan web 3D ringan mengenai [MASUKKAN KONSEP UTAMA]. 
Sebelum mencipta dokumen reka bentuk permainan, bertindak sebagai Ketua Pereka Permainan 
berpengalaman dan TANYA SAYA SOALAN BERKAITAN untuk mengecilkan skop sasaran pemain, 
kitaran teras, cadangan nilai unik (USP), kekangan platform, dan gaya seni."
```

### Kitaran Dialog Terbukti (Seperti dalam Bengkel Langsung)
1. **Soal Jawab Diagnostik AI:** AI menemu bual anda dengan 4–6 soalan berfokus:
   - Siapa persona sasaran yang khusus? (cth., Pelajar sekolah bermain semasa waktu rehat).
   - Apakah 1–2 Cadangan Nilai Unik (USP)? (cth., Pancaran lampu tinggi atau bom ais kering).
   - Apakah platform teknikal dan bajet prestasi? (cth., WebGL/WebGPU dalam pelayar, 60 FPS pada telefon, tanpa pangkalan data).
   - Berapa lamakah durasi satu sesi dan syarat menang/kalah? (cth., Unduran masa 60 saat).
2. **Penguncian Kekangan Tepat:** Anda menjawab setiap soalan dengan 1–2 poin ringkas.
3. **Penjanaan Dokumen Modular:** Dengan sempadan yang ketat, AI menjana dokumen spesifikasi markdown modular yang jelas dengan pemalar fizik dan mesin keadaan yang tepat.
4. **Pelaksanaan Kod Ejen:** Anda membekalkan fail markdown kepada ejen pengaturcaraan ([Google Antigravity](https://antigravity.google/) atau [OpenCode](https://opencode.ai/)), yang membina prototaip berfungsi tanpa halusinasi ciri.

*Rujuk log perbualan langsung: [Sesi Dokumen Reka Bentuk Copilot](https://copilot.microsoft.com/conversations/join/a8PJA1mSSRu5JoSRYExV7)*

---

## 📂 Struktur Set Templat

### 🛠️ Templat Asas Boleh Guna Semula
| Templat | Tujuan |
| :--- | :--- |
| **[`TEMPLATE_GAME_DESIGN_DOCUMENT.md`](TEMPLATE_GAME_DESIGN_DOCUMENT.md)** | Dokumen konsep induk: premis, persona, kitaran teras, USP, arah seni, dan syarat menang. |
| **[`TEMPLATE_TECHNICAL_DESIGN_DOCUMENT.md`](TEMPLATE_TECHNICAL_DESIGN_DOCUMENT.md)** | Senibina teknikal: pilihan enjin, pecahan modul, sistem entiti, dan aliran data. |
| **[`TEMPLATE_GAME_MECHANICS.md`](TEMPLATE_GAME_MECHANICS.md)** | Input pemain terperinci, mesin keadaan tindakan, alat/pertempuran, kuasa tambahan, dan formula markah. |
| **[`TEMPLATE_GAME_PHYSICS.md`](TEMPLATE_GAME_PHYSICS.md)** | Pemalar fizik berangka: pecutan, brek, geseran, trajektori projektil, dan lapisan pelanggaran. |
| **[`TEMPLATE_GAME_TECH_STACK.md`](TEMPLATE_GAME_TECH_STACK.md)** | Enjin web 3D (Babylon.js / Three.js), API sintesis audio prosedur, saliran aset, dan hos statik. |
| **[`TEMPLATE_GAME_UI_UX.md`](TEMPLATE_GAME_UI_UX.md)** | Rangka wayar HUD, kawalan sentuh responsif, token warna, dan maklum balas visual. |
| **[`TEMPLATE_GAME_ASSETS.md`](TEMPLATE_GAME_ASSETS.md)** | Bajet poligon mesh 3D, peraturan penjanaan prosedur Blender MCP, dan SFX Web Audio. |
| **[`TEMPLATE_GAME_TESTING.md`](TEMPLATE_GAME_TESTING.md)** | Matriks pengesahan QA, kes pinggir sempadan fizik, dan penanda aras kadar bingkai pelayar. |
| **[`TEMPLATE_GAME_ACCESSIBILITY.md`](TEMPLATE_GAME_ACCESSIBILITY.md)** | Kesetaraan sentuh telefon, kontras tinggi, suis audio, dan kesederhanaan kognitif. |

---

## 🎮 Kajian Kes Contoh Bengkel (Contoh Sebenar)

| Contoh Permainan | Genre & Enjin | Sorotan & USP | Dokumen Rujukan |
| :--- | :--- | :--- | :--- |
| **King Myvi: Highway Legends** | Perlumbaan Lebuhraya 3D (Babylon.js 7) | Senjata Pancaran Lampu Tinggi, lompatan tanjakan SmartTAG, model 3D Myvi Gen 3 asli via Blender MCP | [`EXAMPLE_1_HIGHWAY_LEGENDS_MYVI.md`](EXAMPLE_1_HIGHWAY_LEGENDS_MYVI.md) |
| **Makcik Canteen: Haze Fighter** | Aksi Arked 3D (Babylon.js 7) | Kipas penghembus industri, bom ais kering kriogenik, jerebu dinamik, pemasa rehat 60s | [`EXAMPLE_2_MAKCIK_CANTEEN_HAZE_FIGHTER.md`](EXAMPLE_2_MAKCIK_CANTEEN_HAZE_FIGHTER.md) |
| **Neon Kart 3D** | Perlumbaan Kart 3D (Three.js + Vite) | Percikan drift mini-turbo, kotak item terapung, kancil lawan AI | [`EXAMPLE_3_NEON_KART_3D.md`](EXAMPLE_3_NEON_KART_3D.md) |
