# SketchUp 3D Model CDN Link Extractor & Downloader

A lightweight, zero-dependency tool to extract direct CDN download links for 3D models (**GLB**, **USDZ**, **KMZ**, **SKP**) from Trimble SketchUp 3D Warehouse and the SketchUp Web Viewer.

Works out of the box on **macOS**, **Linux**, and **Windows**.

---

## Table of Contents

- [Why This Exists](#why-this-exists)
- [Quickstart (No Pre-Download Needed)](#quickstart-no-pre-download-needed)
- [How It Works](#how-it-works)
- [Supported URL Formats](#supported-url-formats)
- [Available 3D Formats](#available-3d-formats)
- [Local Installation & Usage](#local-installation--usage)
  - [macOS & Linux (`.sh`)](#macos--linux-sh)
  - [Windows PowerShell (`.ps1`)](#windows-powershell-ps1)
  - [Windows Batch (`.bat`)](#windows-batch-bat)
- [Prerequisites & Dependencies](#prerequisites--dependencies)

---

## Why This Exists

Downloading raw `.skp` models directly from SketchUp 3D Warehouse requires a Trimble account login and session authentication.

However, the official **SketchUp Web 3D Viewer** (`app.sketchup.com/viewer/3dw`) converts models into industry-standard **GLB** (glTF 2.0 Binary) and **USDZ** formats and serves them publicly from Trimble's content delivery network (`download-warehouse.sketchup.com/warehouse/v1.0/content/public/...`).

This tool queries the underlying Trimble 3D Warehouse entities API, discovers all available binary formats, and provides direct, unauthenticated CDN links—allowing you to import models directly into **Blender**, **Unreal Engine**, **Unity**, **Godot**, **Three.js**, or **Apple AR Quick Look** without an account.

---

## Quickstart (No Pre-Download Needed)

You do not need to clone the repository or save any script beforehand. You can run it directly in your terminal:

### macOS / Linux (via `curl | bash`)

```bash
# Interactive mode (will prompt you to paste the URL):
curl -sSL https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.sh | bash

# Pass the URL directly as an argument:
curl -sSL https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.sh | bash -s -- "https://app.sketchup.com/viewer/3dw?WarehouseModelId=16965783-d6e1-4abf-b2d6-ef87f1b25747"

# Automatically download public files (GLB & USDZ) directly:
curl -sSL https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.sh | bash -s -- --download "https://3dwarehouse.sketchup.com/model/16965783-d6e1-4abf-b2d6-ef87f1b25747/Ombak-KLCC"
```

### Windows (PowerShell)

```powershell
# Interactive mode (prompts for URL):
irm https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.ps1 | iex

# Pass URL directly:
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.ps1))) "https://app.sketchup.com/viewer/3dw?WarehouseModelId=16965783-d6e1-4abf-b2d6-ef87f1b25747"

# Automatically download public files:
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.ps1))) "https://3dwarehouse.sketchup.com/model/16965783-d6e1-4abf-b2d6-ef87f1b25747/Ombak-KLCC" -Download
```

---

## How It Works

```
[ User Input URL ]
        │
        ▼ (Regex Match [0-9a-f]{8}-[0-9a-f]{4}-...)
[ 36-character Model UUID ] (e.g. 16965783-d6e1-4abf-b2d6-ef87f1b25747)
        │
        ▼ GET Request with User-Agent header
[ Trimble Entities REST API ]
  https://3dwarehouse.sketchup.com/warehouse/v1.0/entities/<UUID>
        │
        ▼ Parses JSON "binaries" object
  ├── glb       ──> Public CDN Link (Unauthenticated download)
  ├── usdz      ──> Public CDN Link (Unauthenticated download)
  ├── kmz       ──> Restricted CDN Link (Trimble auth required)
  └── source_skp ──> Restricted CDN Link (Trimble auth required)
```

1. **UUID Extraction**: Detects the 36-character hexadecimal UUID from any supported URL structure.
2. **Metadata Fetch**: Queries Trimble's `warehouse/v1.0/entities/<UUID>` API with standard browser headers to retrieve model details and binary asset pointers.
3. **Format Filter**: Analyzes the `binaries` map for 3D model formats (`glb`, `usdz`, `kmz`, `skp`).
4. **Access Classification**:
   * URLs containing `/content/public/` are flagged as **Direct Public CDN** (freely downloadable).
   * URLs containing `/content/restricted/` are flagged as **Restricted** (requires a logged-in Trimble session).

---

## Supported URL Formats

All of the following formats are accepted interchangeably:

| URL Type | Example URL |
| :--- | :--- |
| **SketchUp Viewer URL** | `https://app.sketchup.com/viewer/3dw?WarehouseModelId=16965783-d6e1-4abf-b2d6-ef87f1b25747` |
| **3D Warehouse Page with Slug** | `https://3dwarehouse.sketchup.com/model/16965783-d6e1-4abf-b2d6-ef87f1b25747/Ombak-KLCC` |
| **3D Warehouse Page (ID only)** | `https://3dwarehouse.sketchup.com/model/16965783-d6e1-4abf-b2d6-ef87f1b25747` |
| **Bare Model UUID** | `16965783-d6e1-4abf-b2d6-ef87f1b25747` |

---

## Available 3D Formats

| Format | Access Type | Description & Compatibility |
| :--- | :--- | :--- |
| **GLB** (`.glb`) | **Public** | **glTF 2.0 Binary**. Industry-standard 3D format containing embedded mesh geometry, materials, and textures. Directly opens in Blender, Unreal Engine, Unity, Godot, Three.js, and Windows 3D Viewer. |
| **USDZ** (`.usdz`) | **Public** | **Universal Scene Description (Zero-compression zip)**. Contains `model.usdc` and unpacked textures. Compatible with Apple AR Quick Look, macOS Preview, iOS, and visionOS. |
| **KMZ** (`.kmz`) | Restricted | Google Earth / Collada package. |
| **SKP** (`.skp`) | Restricted | Native SketchUp document file. Requires Trimble account authentication. |

---

## Local Installation & Usage

### macOS & Linux (`.sh`)

Ensure executable permissions:
```bash
chmod +x ./get_sketchup_model.sh
```

**Interactive mode:**
```bash
./get_sketchup_model.sh
```

**CLI argument:**
```bash
./get_sketchup_model.sh "https://app.sketchup.com/viewer/3dw?WarehouseModelId=16965783-d6e1-4abf-b2d6-ef87f1b25747"
```

**Auto-download public files:**
```bash
./get_sketchup_model.sh --download "https://3dwarehouse.sketchup.com/model/16965783-d6e1-4abf-b2d6-ef87f1b25747/Ombak-KLCC"
```

---

### Windows PowerShell (`.ps1`)

**Interactive mode:**
```powershell
.\get_sketchup_model.ps1
```

**CLI argument:**
```powershell
.\get_sketchup_model.ps1 "https://app.sketchup.com/viewer/3dw?WarehouseModelId=16965783-d6e1-4abf-b2d6-ef87f1b25747"
```

**Auto-download public files:**
```powershell
.\get_sketchup_model.ps1 -Url "https://3dwarehouse.sketchup.com/model/16965783-d6e1-4abf-b2d6-ef87f1b25747/Ombak-KLCC" -Download
```

---

### Windows Batch (`.bat`)

You can simply **double-click** `get_sketchup_model.bat` in Windows File Explorer, or run it from Command Prompt (`cmd.exe`):

```cmd
get_sketchup_model.bat "https://app.sketchup.com/viewer/3dw?WarehouseModelId=16965783-d6e1-4abf-b2d6-ef87f1b25747"
```

---

## Example Output

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

## Prerequisites & Dependencies

- **macOS / Linux**:
  - `curl` (built into macOS and almost all Linux distributions)
  - `bash` (3.2+ on macOS, 4.0+ on Linux)
  - `python3` (built into macOS and Linux) or `jq` for formatting JSON
- **Windows**:
  - PowerShell 5.1 (built into Windows 10 & 11) or PowerShell 7+
  - No external modules or packages required
