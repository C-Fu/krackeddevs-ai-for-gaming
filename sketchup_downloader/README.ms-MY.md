# Pengekstrak & Pemuat Turun Pautan CDN Model 3D SketchUp

Alat ringan tanpa sebarang kebergantungan luar untuk mengekstrak pautan muat turun CDN terus bagi model 3D (**GLB**, **USDZ**, **KMZ**, **SKP**) daripada Trimble SketchUp 3D Warehouse dan SketchUp Web Viewer.

Berfungsi secara terus pada **macOS**, **Linux**, dan **Windows**.

---

## Isi Kandungan

- [Mengapa Alat Ini Wujud](#mengapa-alat-ini-wujud)
- [Panduan Permulaan Pantas (Tanpa Perlu Muat Turun Skrip)](#panduan-permulaan-pantas-tanpa-perlu-muat-turun-skrip)
- [Bagaimana Ia Berfungsi](#bagaimana-ia-berfungsi)
- [Format Pautan (URL) yang Disokong](#format-pautan-url-yang-disokong)
- [Format Model 3D yang Tersedia](#format-model-3d-yang-tersedia)
- [Pemasangan & Penggunaan Tempatan](#pemasangan--penggunaan-tempatan)
  - [macOS & Linux (`.sh`)](#macos--linux-sh)
  - [Windows PowerShell (`.ps1`)](#windows-powershell-ps1)
  - [Fail Kelompok Windows (`.bat`)](#fail-kelompok-windows-bat)
- [Keperluan Sistem & Kebergantungan](#keperluan-sistem--kebergantungan)

---

## Mengapa Alat Ini Wujud

Memuat turun fail asal `.skp` terus dari laman web SketchUp 3D Warehouse memerlukan log masuk akaun Trimble dan sesi pengesahan (authentication).

Walau bagaimanapun, pelayar rasmi **SketchUp Web 3D Viewer** (`app.sketchup.com/viewer/3dw`) secara automatik menukar model kepada format standard industri **GLB** (glTF 2.0 Binary) dan **USDZ**, lalu menyediakannya secara awam (public) melalui rangkaian penghantaran kandungan (CDN) Trimble (`download-warehouse.sketchup.com/warehouse/v1.0/content/public/...`).

Alat ini membuat pertanyaan terus kepada API entiti Trimble 3D Warehouse, mengesan semua format binari yang tersedia, dan memberikan pautan CDN langsung tanpa memerlukan log masuk atau akaun Trimble. Ini membolehkan anda mengimport model terus ke dalam **Blender**, **Unreal Engine**, **Unity**, **Godot**, **Three.js**, atau **Apple AR Quick Look** dengan mudah.

---

## Panduan Permulaan Pantas (Tanpa Perlu Muat Turun Skrip)

Anda tidak perlu mengklon repositori atau menyimpan fail skrip terlebih dahulu. Anda boleh menjalankannya terus melalui terminal:

### macOS / Linux (menggunakan `curl | bash`)

```bash
# Mod interaktif (anda akan diminta memasukkan URL):
curl -sSL https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.sh | bash

# Menghantar URL terus sebagai hujah (argument):
curl -sSL https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.sh | bash -s -- "https://app.sketchup.com/viewer/3dw?WarehouseModelId=16965783-d6e1-4abf-b2d6-ef87f1b25747"

# Muat turun fail awam (GLB & USDZ) secara automatik:
curl -sSL https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.sh | bash -s -- --download "https://3dwarehouse.sketchup.com/model/16965783-d6e1-4abf-b2d6-ef87f1b25747/Ombak-KLCC"
```

### Windows (PowerShell)

```powershell
# Mod interaktif (meminta input URL):
irm https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.ps1 | iex

# Menghantar URL secara terus:
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.ps1))) "https://app.sketchup.com/viewer/3dw?WarehouseModelId=16965783-d6e1-4abf-b2d6-ef87f1b25747"

# Muat turun fail awam secara automatik:
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.ps1))) "https://3dwarehouse.sketchup.com/model/16965783-d6e1-4abf-b2d6-ef87f1b25747/Ombak-KLCC" -Download
```

---

## Bagaimana Ia Berfungsi

```
[ Input URL Pengguna ]
        │
        ▼ (Padanan Regex [0-9a-f]{8}-[0-9a-f]{4}-...)
[ Model UUID 36-aksara ] (contoh: 16965783-d6e1-4abf-b2d6-ef87f1b25747)
        │
        ▼ Permintaan GET bersama pengepala User-Agent
[ REST API Entiti Trimble ]
  https://3dwarehouse.sketchup.com/warehouse/v1.0/entities/<UUID>
        │
        ▼ Menganalisis objek JSON "binaries"
  ├── glb       ──> Pautan CDN Awam (Muat turun tanpa log masuk)
  ├── usdz      ──> Pautan CDN Awam (Muat turun tanpa log masuk)
  ├── kmz       ──> Pautan CDN Terhad (Perlu log masuk Trimble)
  └── source_skp ──> Pautan CDN Terhad (Perlu log masuk Trimble)
```

1. **Pengekstrakan UUID**: Mengesan UUID heksadesimal 36-aksara daripada mana-mana struktur pautan yang disokong.
2. **Pengambilan Metadata**: Menghantar pertanyaan ke API `warehouse/v1.0/entities/<UUID>` menggunakan pengepala pelayar web standard untuk mendapatkan butiran model dan senarai fail binari.
3. **Penapisan Format**: Menganalisis pemetaan `binaries` bagi format model 3D (`glb`, `usdz`, `kmz`, `skp`).
4. **Pengelasan Akses**:
   * Pautan yang mengandungi `/content/public/` ditandakan sebagai **CDN Awam Terus** (boleh dimuat turun dengan bebas).
   * Pautan yang mengandungi `/content/restricted/` ditandakan sebagai **Terhad** (memerlukan sesi log masuk Trimble).

---

## Format Pautan (URL) yang Disokong

Semua format berikut diterima dan diproses dengan tepat:

| Jenis URL | Contoh URL |
| :--- | :--- |
| **URL Pelayar SketchUp (Viewer)** | `https://app.sketchup.com/viewer/3dw?WarehouseModelId=16965783-d6e1-4abf-b2d6-ef87f1b25747` |
| **Halaman 3D Warehouse bersama Slug** | `https://3dwarehouse.sketchup.com/model/16965783-d6e1-4abf-b2d6-ef87f1b25747/Ombak-KLCC` |
| **Halaman 3D Warehouse (ID sahaja)** | `https://3dwarehouse.sketchup.com/model/16965783-d6e1-4abf-b2d6-ef87f1b25747` |
| **Model UUID Sahaja** | `16965783-d6e1-4abf-b2d6-ef87f1b25747` |

---

## Format Model 3D yang Tersedia

| Format | Jenis Akses | Keterangan & Keserasian |
| :--- | :--- | :--- |
| **GLB** (`.glb`) | **Awam (Public)** | **glTF 2.0 Binary**. Format 3D standard industri yang mengandungi geometri mesh, material, dan tekstur tertanam. Boleh dibuka terus dalam Blender, Unreal Engine, Unity, Godot, Three.js, dan Windows 3D Viewer. |
| **USDZ** (`.usdz`) | **Awam (Public)** | **Universal Scene Description (Arkib zip tanpa mampatan)**. Mengandungi fail `model.usdc` dan aset tekstur. Serasi dengan Apple AR Quick Look, Pratonton macOS, iOS, dan visionOS. |
| **KMZ** (`.kmz`) | Terhad | Pakej Google Earth / Collada. |
| **SKP** (`.skp`) | Terhad | Fail dokumen asli SketchUp. Memerlukan pengesahan log masuk Trimble. |

---

## Pemasangan & Penggunaan Tempatan

### macOS & Linux (`.sh`)

Pastikan kebenaran pelaksanaan diberikan:
```bash
chmod +x ./get_sketchup_model.sh
```

**Mod interaktif:**
```bash
./get_sketchup_model.sh
```

**Menggunakan hujah CLI:**
```bash
./get_sketchup_model.sh "https://app.sketchup.com/viewer/3dw?WarehouseModelId=16965783-d6e1-4abf-b2d6-ef87f1b25747"
```

**Muat turun fail awam secara automatik:**
```bash
./get_sketchup_model.sh --download "https://3dwarehouse.sketchup.com/model/16965783-d6e1-4abf-b2d6-ef87f1b25747/Ombak-KLCC"
```

---

### Windows PowerShell (`.ps1`)

**Mod interaktif:**
```powershell
.\get_sketchup_model.ps1
```

**Menggunakan hujah CLI:**
```powershell
.\get_sketchup_model.ps1 "https://app.sketchup.com/viewer/3dw?WarehouseModelId=16965783-d6e1-4abf-b2d6-ef87f1b25747"
```

**Muat turun fail awam secara automatik:**
```powershell
.\get_sketchup_model.ps1 -Url "https://3dwarehouse.sketchup.com/model/16965783-d6e1-4abf-b2d6-ef87f1b25747/Ombak-KLCC" -Download
```

---

### Fail Kelompok Windows (`.bat`)

Anda hanya perlu **dwi-klik** pada `get_sketchup_model.bat` di dalam Windows File Explorer, atau jalankannya melalui Command Prompt (`cmd.exe`):

```cmd
get_sketchup_model.bat "https://app.sketchup.com/viewer/3dw?WarehouseModelId=16965783-d6e1-4abf-b2d6-ef87f1b25747"
```

---

## Contoh Output

```text
[+] Fetching model metadata for ID: 16965783-d6e1-4abf-b2d6-ef87f1b25747...
----------------------------------------------------------
Model Title : Ombak KLCC
Model ID    : 16965783-d6e1-4abf-b2d6-ef87f1b25747
----------------------------------------------------------

Available Formats & Direct CDN Links:

  [GLB] 1. Ombak KLCC.glb (2.04 MB) [Direct Public CDN]
    Link: https://download-warehouse.sketchup.com/warehouse/v1.0/content/public/c95d3743-1e58-457f-89a7-5d4c4f74139d

  [USDZ] 1. Ombak KLCC.usdz (2.02 MB) [Direct Public CDN]
    Link: https://download-warehouse.sketchup.com/warehouse/v1.0/content/public/96def906-111e-4592-b940-0f14d0ad55b2

  [KMZ] 1. Ombak KLCC.kmz (0.27 MB) [Restricted - Requires Login]
    Link: https://download-warehouse.sketchup.com/warehouse/v1.0/content/restricted/aebae534-4fee-47a5-a0c7-b56ef391c798

  [SKP] 1. Ombak KLCC.skp (2.97 MB) [Restricted - Requires Login]
    Link: https://download-warehouse.sketchup.com/warehouse/v1.0/content/restricted/f7f339e3-6722-4b3c-b598-ba93b34230cf
```

---

## Keperluan Sistem & Kebergantungan

- **macOS / Linux**:
  - `curl` (tersedia secara terbina dalam macOS dan hampir semua distro Linux)
  - `bash` (3.2+ pada macOS, 4.0+ pada Linux)
  - `python3` (tersedia terbina dalam macOS dan Linux) atau `jq` untuk memformat data JSON
- **Windows**:
  - PowerShell 5.1 (terbina dalam Windows 10 & 11) atau PowerShell 7+
  - Tiada modul atau pakej luaran tambahan diperlukan
