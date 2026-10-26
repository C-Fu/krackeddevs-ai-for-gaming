# 🚗 Perodua Myvi Generasi ke-3 (Merah Lava / Rujukan HUM3D) – Saliran Blender MCP

*[English version available here: BLENDER_3D_PIPELINE.md](BLENDER_3D_PIPELINE.md)*

Dokumen ini memperincikan saliran pemodelan 3D prosedur yang digunakan untuk membina **Perodua Myvi Generasi ke-3 (Merah Lava)** yang bertepatan sepenuhnya dengan **rujukan 3D Hum3D** (`media_1793013754379_8974d7c7.png` & `media_1793013766937_0b5e9563.png`) terus di dalam aplikasi Blender yang dibuka melalui sambungan soket `BlenderMCPServer` (`127.0.0.1:9876`), diikuti dengan eksport automatik glTF binari (`.glb`) dan integrasi ke dalam enjin Babylon.js.

---

## 📐 Pecahan Ciri Visual Rujukan Hum3D

### 1. Bahagian Belakang & Lampu Melintang
* **Lampu Belakang:** **Lampu belakang dua bahagian mendatar melengkung** (bahagian luar membalut bucu fender belakang, bahagian dalam terbentang ke pintu but). Sempadan jalur LED merah dengan bahagian tengah jernih untuk lampu undur dan isyarat.
* **Cermin Belakang & Pintu But:** Cermin belakang condong aerodinamik (~cerun 55° dari mendatar).
* **Spoiler Bumbung Dua Tingkat:** Sayap atas sewarna badan dengan sirip sisi hitam aerodinamik yang mengapit cermin belakang dan Lampu Brek Ketiga Atas (HMSL) merah bersepadu.
* **Bumbung:** Antena sirip jerung di bahagian tengah bumbung.
* **Lencana & Nombor Plat:**
  * Lencana bujur Perodua krom dengan lekuk pemegang di bawahnya.
  * Lencana tulisan `"Myvi"` krom di sebelah kiri lencana utama.
  * Ruang nombor plat lekuk dengan plat pendaftaran `"HUM3D"` (beserta jalur biru gaya EU/MY di sebelah kiri).
* **Bampar Belakang:** Bampar berlekuk sporty dengan saluran peresap hitam di bucu bawah serta pemantul cahaya merah mendatar.

### 2. Profil Sisi & Bumbung Terapung
* **Garisan Pinggang:** Garisan watak menaik dari fender hadapan merentasi pemegang pintu hingga ke bucu lampu belakang.
* **Tiang C:** Sisipan aerodinamik hitam berkilat di antara tingkap suku belakang dan cermin pintu but, menghasilkan reka bentuk bumbung terapung (floating roof).
* **Roda:** Roda aloi turbin berarah dwi-tona 15 inci (10 jejari berselang-seli perak mesin dan arang gelap).
