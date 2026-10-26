# SketchUp 3D Model CDN Link Extractor & GLB to glTF Converter

<div align="center">

**[English](README.md) | [Bahasa Melayu](README.ms-MY.md)**

</div>

A lightweight, zero-dependency toolkit to:
1. **Extract direct CDN download links** for 3D models (**GLB**, **USDZ**, **KMZ**, **SKP**) from Trimble SketchUp 3D Warehouse and SketchUp Web Viewer without needing a Trimble account.
2. **Convert/unpack GLB files into glTF** (`.gltf` + `.bin` + separate textures, or self-contained embedded `.gltf`) using **pure Shell / PowerShell** with **no Python or Node.js/npm required**.

Works out of the box on **macOS**, **Linux**, and **Windows**.

---

## Table of Contents

- [Tools Overview](#tools-overview)
- [Tool 1: SketchUp Model Downloader](#tool-1-sketchup-model-downloader)
  - [Why This Exists](#why-this-exists)
  - [Quickstart (No Pre-Download Needed)](#quickstart-no-pre-download-needed)
  - [Supported URL Formats](#supported-url-formats)
  - [Available 3D Formats](#available-3d-formats)
  - [Local Usage](#local-usage)
- [Tool 2: GLB to glTF Converter (`glb2gltf`)](#tool-2-glb-to-gltf-converter-glb2gltf)
  - [Why Convert GLB to glTF?](#why-convert-glb-to-gltf)
  - [Zero-Dependency Architecture (No Python, No npm)](#zero-dependency-architecture-no-python-no-npm)
  - [Quickstart (Run via Curl / PowerShell)](#quickstart-run-via-curl--powershell)
  - [Local Usage](#local-usage-1)
- [Prerequisites & Dependencies](#prerequisites--dependencies)

---

## Tools Overview

| Script | Platform | Description | External Dependencies |
| :--- | :--- | :--- | :--- |
| **`get_sketchup_model.sh`** | macOS / Linux | Extracts 3D Warehouse CDN links & downloads GLB/USDZ | `curl`, `bash` |
| **`get_sketchup_model.ps1`** | Windows / PS 7+ | PowerShell link extractor & downloader | Built-in .NET |
| **`get_sketchup_model.bat`** | Windows | Double-clickable batch wrapper | Built-in |
| **`glb2gltf.sh`** | macOS / Linux | Unpacks GLB &rarr; glTF + bin + textures (or embedded) | **Pure Shell** (`od`, `tail`, `head`, `sed`, `base64`) |
| **`glb2gltf.ps1`** | Windows / PS 7+ | Unpacks GLB &rarr; glTF + bin + textures (or embedded) | **Pure PowerShell** (Built-in .NET `BinaryReader`) |
| **`glb2gltf.bat`** | Windows | Drag-and-drop batch converter for `.glb` files | Built-in |

---

## Tool 1: SketchUp Model Downloader

### Why This Exists

Downloading raw `.skp` models directly from SketchUp 3D Warehouse requires a Trimble account login and session authentication.

However, the official **SketchUp Web 3D Viewer** (`app.sketchup.com/viewer/3dw`) converts models into industry-standard **GLB** (glTF 2.0 Binary) and **USDZ** formats and serves them publicly from Trimble's content delivery network (`download-warehouse.sketchup.com/warehouse/v1.0/content/public/...`).

This tool queries the underlying Trimble 3D Warehouse entities API, discovers all available binary formats, and provides direct, unauthenticated CDN links—allowing you to import models directly into **Blender**, **Unreal Engine**, **Unity**, **Godot**, **Three.js**, or **Apple AR Quick Look** without an account.

### Quickstart (No Pre-Download Needed)

You do not need to clone the repository or save any script beforehand. You can run it directly in your terminal:

#### macOS / Linux (via `curl | bash`)

```bash
# Interactive mode (will prompt you to paste the URL):
curl -sSL https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.sh | bash

# Pass the URL directly as an argument:
curl -sSL https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.sh | bash -s -- "https://app.sketchup.com/viewer/3dw?WarehouseModelId=16965783-d6e1-4abf-b2d6-ef87f1b25747"

# Automatically download public files (GLB & USDZ) directly:
curl -sSL https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.sh | bash -s -- --download "https://3dwarehouse.sketchup.com/model/16965783-d6e1-4abf-b2d6-ef87f1b25747/Ombak-KLCC"
```

#### Windows (PowerShell)

```powershell
# Interactive mode (prompts for URL):
irm https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.ps1 | iex

# Pass URL directly:
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.ps1))) "https://app.sketchup.com/viewer/3dw?WarehouseModelId=16965783-d6e1-4abf-b2d6-ef87f1b25747"

# Automatically download public files:
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.ps1))) "https://3dwarehouse.sketchup.com/model/16965783-d6e1-4abf-b2d6-ef87f1b25747/Ombak-KLCC" -Download
```

### Supported URL Formats

All of the following formats are accepted interchangeably:

| URL Type | Example URL |
| :--- | :--- |
| **SketchUp Viewer URL** | `https://app.sketchup.com/viewer/3dw?WarehouseModelId=16965783-d6e1-4abf-b2d6-ef87f1b25747` |
| **3D Warehouse Page with Slug** | `https://3dwarehouse.sketchup.com/model/16965783-d6e1-4abf-b2d6-ef87f1b25747/Ombak-KLCC` |
| **3D Warehouse Page (ID only)** | `https://3dwarehouse.sketchup.com/model/16965783-d6e1-4abf-b2d6-ef87f1b25747` |
| **Bare Model UUID** | `16965783-d6e1-4abf-b2d6-ef87f1b25747` |

### Available 3D Formats

| Format | Access Type | Description & Compatibility |
| :--- | :--- | :--- |
| **GLB** (`.glb`) | **Public** | **glTF 2.0 Binary**. Industry-standard 3D format containing embedded mesh geometry, materials, and textures. Directly opens in Blender, Unreal Engine, Unity, Godot, Three.js, and Windows 3D Viewer. |
| **USDZ** (`.usdz`) | **Public** | **Universal Scene Description (Zero-compression zip)**. Contains `model.usdc` and unpacked textures. Compatible with Apple AR Quick Look, macOS Preview, iOS, and visionOS. |
| **KMZ** (`.kmz`) | Restricted | Google Earth / Collada package. |
| **SKP** (`.skp`) | Restricted | Native SketchUp document file. Requires Trimble account authentication. |

### Local Usage

```bash
# macOS & Linux
chmod +x ./get_sketchup_model.sh
./get_sketchup_model.sh "https://app.sketchup.com/viewer/3dw?WarehouseModelId=16965783-d6e1-4abf-b2d6-ef87f1b25747"

# Windows PowerShell
.\get_sketchup_model.ps1 "https://app.sketchup.com/viewer/3dw?WarehouseModelId=16965783-d6e1-4abf-b2d6-ef87f1b25747"

# Windows Command Prompt / Double-click
get_sketchup_model.bat
```

---

## Tool 2: GLB to glTF Converter (`glb2gltf`)

### Why Convert GLB to glTF?

A `.glb` file is essentially glTF packed into a single binary envelope. While GLB is convenient for distribution, converting to `.gltf` provides significant advantages:
* **Human-Readable JSON**: Directly edit node hierarchies, camera positions, PBR materials, and shader settings in any text editor.
* **Separated Texture Assets**: Unpacks images into standard `.jpg`/`.png` files for easy editing in Photoshop, GIMP, or Figma.
* **Version Control (Git)**: Allows Git diffs and code review on scene graphs instead of treating models as opaque binary blobs.

### Zero-Dependency Architecture (No Python, No npm)

Both `glb2gltf.sh` and `glb2gltf.ps1` are written to run with **zero external programming runtimes**:
* **`glb2gltf.sh` (macOS / Linux)**: Uses pure POSIX Unix utilities (`od` for little-endian integer byte reads, `tail` and `head` for binary buffer slicing, `sed` for buffer linking, and `base64` for embedded mode). If `jq` is installed, it also extracts individual texture image files automatically.
* **`glb2gltf.ps1` (Windows)**: Uses PowerShell's built-in .NET `System.IO.BinaryReader` to unpack the binary container, write `.bin`, extract textures, and format `.gltf` JSON.

### Quickstart (Run via Curl / PowerShell)

#### macOS / Linux
```bash
# Convert a local model to separate glTF (.gltf + .bin + textures):
curl -sSL https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/glb2gltf.sh | bash -s -- "model.glb"

# Convert to single self-contained embedded glTF (base64 data URI):
curl -sSL https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/glb2gltf.sh | bash -s -- --embedded "model.glb"
```

#### Windows (PowerShell)
```powershell
# Convert to separate glTF:
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/glb2gltf.ps1))) "model.glb"

# Convert to embedded glTF:
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/glb2gltf.ps1))) "model.glb" -Embedded
```

### Local Usage

```bash
# macOS & Linux
chmod +x ./glb2gltf.sh
./glb2gltf.sh "1. Ombak KLCC.glb"
./glb2gltf.sh -o ./custom_output_folder "1. Ombak KLCC.glb"
./glb2gltf.sh --embedded "1. Ombak KLCC.glb"

# Windows PowerShell
.\glb2gltf.ps1 "1. Ombak KLCC.glb"
.\glb2gltf.ps1 -InputPath "1. Ombak KLCC.glb" -OutputDir "unpacked_model"
.\glb2gltf.ps1 -InputPath "1. Ombak KLCC.glb" -Embedded

# Windows Batch / Drag-and-Drop
# Simply drag and drop any .glb file onto glb2gltf.bat!
```

---

## Prerequisites & Dependencies

- **macOS / Linux**:
  - `bash` (3.2+ on macOS, 4.0+ on Linux)
  - `curl` (for URL downloading and pipe quickstart)
  - Standard Unix coreutils (`od`, `tail`, `head`, `sed`, `base64`)
  - *Optional:* `jq` (for automatic individual texture image extraction in `glb2gltf.sh`)
  - **No Python or Node.js / npm required!**
- **Windows**:
  - PowerShell 5.1 (built into Windows 10 & 11) or PowerShell 7+
  - **No external modules, Python, or npm required!**
