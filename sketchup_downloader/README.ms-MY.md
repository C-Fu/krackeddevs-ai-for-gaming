# Pengekstrak Pautan CDN Model 3D SketchUp & Penukar GLB ke glTF

Kit alat ringan tanpa sebarang kebergantungan luar untuk:
1. **Mengekstrak pautan muat turun CDN terus** bagi model 3D (**GLB**, **USDZ**, **KMZ**, **SKP**) daripada Trimble SketchUp 3D Warehouse dan pelayar SketchUp Web Viewer tanpa memerlukan akaun Trimble.
2. **Menukar/membuka fail GLB kepada format glTF** (`.gltf` + `.bin` + tekstur berasingan, atau fail tunggal tertanam `.gltf`) menggunakan **Shell / PowerShell tulen** dengan **tiada Python atau Node.js/npm diperlukan**.

Berfungsi secara terus pada **macOS**, **Linux**, dan **Windows**.

---

## Isi Kandungan

- [Gambaran Keseluruhan Alat](#gambaran-keseluruhan-alat)
- [Alat 1: Pemuat Turun Model SketchUp](#alat-1-pemuat-turun-model-sketchup)
  - [Mengapa Alat Ini Wujud](#mengapa-alat-ini-wujud)
  - [Panduan Permulaan Pantas (Tanpa Perlu Muat Turun Skrip)](#panduan-permulaan-pantas-tanpa-perlu-muat-turun-skrip)
  - [Format Pautan (URL) yang Disokong](#format-pautan-url-yang-disokong)
  - [Format Model 3D yang Tersedia](#format-model-3d-yang-tersedia)
  - [Penggunaan Tempatan](#penggunaan-tempatan)
- [Alat 2: Penukar GLB ke glTF (`glb2gltf`)](#alat-2-penukar-glb-ke-gltf-glb2gltf)
  - [Mengapa Menukar GLB kepada glTF?](#mengapa-menukar-glb-kepada-gltf)
  - [Seni Bina Tanpa Kebergantungan (Tiada Python, Tiada npm)](#seni-bina-tanpa-kebergantungan-tiada-python-tiada-npm)
  - [Permulaan Pantas (Melalui Curl / PowerShell)](#permulaan-pantas-melalui-curl--powershell)
  - [Penggunaan Tempatan](#penggunaan-tempatan-1)
- [Keperluan Sistem & Kebergantungan](#keperluan-sistem--kebergantungan)

---

## Gambaran Keseluruhan Alat

| Skrip | Platform | Keterangan | Kebergantungan Luar |
| :--- | :--- | :--- | :--- |
| **`get_sketchup_model.sh`** | macOS / Linux | Mengekstrak pautan CDN 3D Warehouse & memuat turun GLB/USDZ | `curl`, `bash` |
| **`get_sketchup_model.ps1`** | Windows / PS 7+ | Pengekstrak & pemuat turun pautan berasaskan PowerShell | .NET Terbina dalam |
| **`get_sketchup_model.bat`** | Windows | Pembungkus kelompok (batch) yang boleh didwi-klik | Terbina dalam |
| **`glb2gltf.sh`** | macOS / Linux | Membuka GLB &rarr; glTF + bin + tekstur (atau tertanam) | **Shell Tulen** (`od`, `tail`, `head`, `sed`, `base64`) |
| **`glb2gltf.ps1`** | Windows / PS 7+ | Membuka GLB &rarr; glTF + bin + tekstur (atau tertanam) | **PowerShell Tulen** (.NET `BinaryReader` terbina dalam) |
| **`glb2gltf.bat`** | Windows | Penukar tarik-dan-lepas (drag-and-drop) untuk fail `.glb` | Terbina dalam |

---

## Alat 1: Pemuat Turun Model SketchUp

### Mengapa Alat Ini Wujud

Memuat turun fail asal `.skp` terus dari laman web SketchUp 3D Warehouse memerlukan log masuk akaun Trimble dan sesi pengesahan (authentication).

Walau bagaimanapun, pelayar rasmi **SketchUp Web 3D Viewer** (`app.sketchup.com/viewer/3dw`) secara automatik menukar model kepada format standard industri **GLB** (glTF 2.0 Binary) dan **USDZ**, lalu menyediakannya secara awam (public) melalui rangkaian penghantaran kandungan (CDN) Trimble (`download-warehouse.sketchup.com/warehouse/v1.0/content/public/...`).

Alat ini membuat pertanyaan terus kepada API entiti Trimble 3D Warehouse, mengesan semua format binari yang tersedia, dan memberikan pautan CDN langsung tanpa memerlukan log masuk atau akaun Trimble. Ini membolehkan anda mengimport model terus ke dalam **Blender**, **Unreal Engine**, **Unity**, **Godot**, **Three.js**, atau **Apple AR Quick Look** dengan mudah.

### Panduan Permulaan Pantas (Tanpa Perlu Muat Turun Skrip)

Anda tidak perlu mengklon repositori atau menyimpan fail skrip terlebih dahulu:

#### macOS / Linux (menggunakan `curl | bash`)

```bash
# Mod interaktif (anda akan diminta memasukkan URL):
curl -sSL https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.sh | bash

# Menghantar URL terus sebagai hujah (argument):
curl -sSL https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.sh | bash -s -- "https://app.sketchup.com/viewer/3dw?WarehouseModelId=16965783-d6e1-4abf-b2d6-ef87f1b25747"

# Muat turun fail awam (GLB & USDZ) secara automatik:
curl -sSL https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.sh | bash -s -- --download "https://3dwarehouse.sketchup.com/model/16965783-d6e1-4abf-b2d6-ef87f1b25747/Ombak-KLCC"
```

#### Windows (PowerShell)

```powershell
# Mod interaktif (meminta input URL):
irm https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.ps1 | iex

# Menghantar URL secara terus:
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.ps1))) "https://app.sketchup.com/viewer/3dw?WarehouseModelId=16965783-d6e1-4abf-b2d6-ef87f1b25747"

# Muat turun fail awam secara automatik:
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.ps1))) "https://3dwarehouse.sketchup.com/model/16965783-d6e1-4abf-b2d6-ef87f1b25747/Ombak-KLCC" -Download
```

### Format Pautan (URL) yang Disokong

| Jenis URL | Contoh URL |
| :--- | :--- |
| **URL Pelayar SketchUp (Viewer)** | `https://app.sketchup.com/viewer/3dw?WarehouseModelId=16965783-d6e1-4abf-b2d6-ef87f1b25747` |
| **Halaman 3D Warehouse bersama Slug** | `https://3dwarehouse.sketchup.com/model/16965783-d6e1-4abf-b2d6-ef87f1b25747/Ombak-KLCC` |
| **Halaman 3D Warehouse (ID sahaja)** | `https://3dwarehouse.sketchup.com/model/16965783-d6e1-4abf-b2d6-ef87f1b25747` |
| **Model UUID Sahaja** | `16965783-d6e1-4abf-b2d6-ef87f1b25747` |

### Format Model 3D yang Tersedia

| Format | Jenis Akses | Keterangan & Keserasian |
| :--- | :--- | :--- |
| **GLB** (`.glb`) | **Awam (Public)** | **glTF 2.0 Binary**. Format 3D standard industri yang mengandungi geometri mesh, material, dan tekstur tertanam. Boleh dibuka terus dalam Blender, Unreal Engine, Unity, Godot, Three.js, dan Windows 3D Viewer. |
| **USDZ** (`.usdz`) | **Awam (Public)** | **Universal Scene Description (Arkib zip tanpa mampatan)**. Mengandungi fail `model.usdc` dan aset tekstur. Serasi dengan Apple AR Quick Look, Pratonton macOS, iOS, dan visionOS. |
| **KMZ** (`.kmz`) | Terhad | Pakej Google Earth / Collada. |
| **SKP** (`.skp`) | Terhad | Fail dokumen asli SketchUp. Memerlukan pengesahan log masuk Trimble. |

### Penggunaan Tempatan

```bash
# macOS & Linux
chmod +x ./get_sketchup_model.sh
./get_sketchup_model.sh "https://app.sketchup.com/viewer/3dw?WarehouseModelId=16965783-d6e1-4abf-b2d6-ef87f1b25747"

# Windows PowerShell
.\get_sketchup_model.ps1 "https://app.sketchup.com/viewer/3dw?WarehouseModelId=16965783-d6e1-4abf-b2d6-ef87f1b25747"

# Fail Kelompok Windows / Dwi-klik
get_sketchup_model.bat
```

---

## Alat 2: Penukar GLB ke glTF (`glb2gltf`)

### Mengapa Menukar GLB kepada glTF?

Sebuah fail `.glb` hanyalah format glTF yang dibungkus ke dalam sampul binari tunggal. Walaupun GLB memudahkan perkongsian, menukar kepada `.gltf` memberikan pelbagai kelebihan:
* **JSON yang Boleh Dibaca Manusia**: Sunting hierarki nod, kedudukan kamera, material PBR, dan pengaturcaraan shader secara terus menggunakan mana-mana penyunting teks.
* **Aset Tekstur Berasingan**: Mengekstrak imej ke dalam fail `.jpg`/`.png` standard untuk disunting dalam Photoshop, GIMP, atau Figma.
* **Kawalan Versi (Git)**: Membolehkan semakan Git diff pada graf pemandangan dan bukannya menganggap fail model sebagai fail binari yang legap.

### Seni Bina Tanpa Kebergantungan (Tiada Python, Tiada npm)

Kedua-dua `glb2gltf.sh` dan `glb2gltf.ps1` dibina untuk berfungsi **tanpa sebarang runtime pengaturcaraan luar**:
* **`glb2gltf.sh` (macOS / Linux)**: Menggunakan utiliti POSIX Unix standard (`od` untuk membaca bait integer little-endian, `tail` dan `head` untuk memotong penimbal binari, `sed` untuk menyambung penimbal, dan `base64` untuk mod tertanam). Jika `jq` dipasang, ia turut mengekstrak setiap fail imej tekstur secara automatik.
* **`glb2gltf.ps1` (Windows)**: Menggunakan `.NET System.IO.BinaryReader` terbina dalam PowerShell untuk membuka sampul binari, menulis `.bin`, mengekstrak tekstur, dan memformat JSON `.gltf`.

### Permulaan Pantas (Melalui Curl / PowerShell)

#### macOS / Linux
```bash
# Tukar model tempatan kepada glTF berasingan (.gltf + .bin + tekstur):
curl -sSL https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/glb2gltf.sh | bash -s -- "model.glb"

# Tukar kepada fail glTF tunggal tertanam (data URI base64):
curl -sSL https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/glb2gltf.sh | bash -s -- --embedded "model.glb"
```

#### Windows (PowerShell)
```powershell
# Tukar kepada glTF berasingan:
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/glb2gltf.ps1))) "model.glb"

# Tukar kepada glTF tertanam:
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/glb2gltf.ps1))) "model.glb" -Embedded
```

### Penggunaan Tempatan

```bash
# macOS & Linux
chmod +x ./glb2gltf.sh
./glb2gltf.sh "1. Ombak KLCC.glb"
./glb2gltf.sh -o ./folder_output "1. Ombak KLCC.glb"
./glb2gltf.sh --embedded "1. Ombak KLCC.glb"

# Windows PowerShell
.\glb2gltf.ps1 "1. Ombak KLCC.glb"
.\glb2gltf.ps1 -InputPath "1. Ombak KLCC.glb" -OutputDir "unpacked_model"
.\glb2gltf.ps1 -InputPath "1. Ombak KLCC.glb" -Embedded

# Windows Batch / Tarik-dan-Lepas
# Cuma tarik dan lepas mana-mana fail .glb ke atas fail glb2gltf.bat!
```

---

## Keperluan Sistem & Kebergantungan

- **macOS / Linux**:
  - `bash` (3.2+ pada macOS, 4.0+ pada Linux)
  - `curl` (untuk memuat turun pautan dan permulaan pantas paip)
  - Utiliti Unix standard (`od`, `tail`, `head`, `sed`, `base64`)
  - *Pilihan:* `jq` (untuk pengekstrakan fail imej tekstur automatik dalam `glb2gltf.sh`)
  - **Tiada Python atau Node.js / npm diperlukan!**
- **Windows**:
  - PowerShell 5.1 (terbina dalam Windows 10 & 11) atau PowerShell 7+
  - **Tiada modul luaran, Python, atau npm diperlukan!**
