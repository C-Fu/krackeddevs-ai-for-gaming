# 🚗 Model 3D Perodua Myvi Klasik – Saliran Blender MCP

*[English version available here: BLENDER_3D_PIPELINE.md](BLENDER_3D_PIPELINE.md)*

Dokumen ini memperincikan saliran pemodelan 3D prosedur yang digunakan untuk membina model ikonik **Perodua Myvi Klasik (Spesifikasi Sudut Belakang-Kiri)** terus di dalam aplikasi Blender yang dibuka melalui sambungan soket `BlenderMCPServer` (`127.0.0.1:9876`), diikuti dengan eksport automatik glTF binari (`.glb`) dan integrasi ke dalam enjin Babylon.js.

---

## 📐 Pematuhan Terhadap Pecahan Teknikal

### 1. Bentuk Badan Keseluruhan
* **Jenis:** Konfigurasi kompak hatchback 5 pintu.
* **Kadar Perkadaran:** Unjuran belakang yang pendek (short rear overhang), ketinggian kabin yang tinggi berbanding lebar bagi memaksimumkan ruang dalaman (tall cabin height).
* **Bahasa Permukaan:** Panel berterusan licin dengan alur garisan pinggang (beltline crease) yang halus; gerbang roda sedikit mengembang (flared wheel arches).
* **Garis Bumbung:** Melengkung lembut, memuncak di atas tempat duduk hadapan dan menirus lembut ke pintu but belakang.

### 2. Bahagian Belakang & Kaca
* **Pintu But (Tailgate):** Rata dan hampir menegak (~sudut 82°) dengan cermin belakang bersepadu.
* **Cermin Belakang:** Lebar, sedikit trapezoid dengan sempadan pengedap hitam.
* **Pengelap Cermin Belakang (Rear Wiper):** Satu pengelap cermin hitam dengan bilah mendatar dipasang di **bahagian tengah bawah** cermin belakang.
* **Spoiler:** Spoiler bibir halus dipasang pada bumbung (subtle roof lip spoiler) yang terunjur sedikit melepasi cermin belakang, lengkap dengan Lampu Brek Ketiga Atas (HMSL).
* **Lencana & Nombor Plat:**
  * Bahagian tengah: Lencana tulisan `"MYVI"` krom.
  * Lencana Perodua perak di atas pemegang but.
  * Ruang nombor plat lekuk segi empat tepat dengan plat pendaftaran (`"HUM3D"`).

### 3. Lampu Belakang Menegak Bersudut
* **Bentuk & Kedudukan:** Gugusan bersudut yang berorientasikan menegak membalut bucu belakang, bermula dari garis bampar sehingga ke paras garis bumbung di sepanjang tiang C.
* **Segmen Warna:** Perumah polikarbonat merah di bahagian atas dan bawah, mengapit segmen jernih/putih di tengah yang menempatkan lampu isyarat ambar dan lampu undur.

### 4. Profil Sisi & Tiang C Tebal
* **Tiang C (C-Pillar):** **Tebal, dicat dengan warna badan**, menyokong struktur pintu but belakang.
* **Pintu Belakang:** Pintu berengsel konvensional dengan garisan cantuman pintu yang jelas; tingkap menirus ke atas ke arah tiang belakang.
* **Gerbang Roda:** Kontur bulat dengan sedikit pelebaran di atas roda aloi kompak.

### 5. Bampar Belakang Bawah
* **Bampar:** Licin, sewarna badan dengan alur bayang mendatar.
* **Paip Ekzos:** Tersembunyi sepenuhnya di bawah bampar.
* **Pemantul Cahaya:** Jalur pemantul merah segi empat tepat kecil di kedua-dua bucu bawah bampar.
