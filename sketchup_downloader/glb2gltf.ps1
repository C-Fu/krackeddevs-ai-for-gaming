<#
.SYNOPSIS
    Converts 3D models from GLB (glTF Binary) to glTF format (.gltf + .bin + textures, or embedded).

.DESCRIPTION
    Unpacks a self-contained GLB container into readable glTF JSON, raw binary buffer (.bin),
    and separate texture images (.jpg, .png, .webp). Also supports producing a single self-contained
    embedded glTF file with base64 data URIs. Zero external dependencies required.

.PARAMETER InputPath
    Path to the input .glb file. If omitted, prompts interactively.

.PARAMETER OutputDir
    Destination folder for unpacked files. Defaults to "<ModelName>_gltf".

.PARAMETER Embedded
    Produce a single self-contained .gltf file with embedded base64 data instead of separate files.

.EXAMPLE
    .\glb2gltf.ps1 "1. Ombak KLCC.glb"
    .\glb2gltf.ps1 -InputPath "model.glb" -OutputDir "unpacked_model"
    .\glb2gltf.ps1 -InputPath "model.glb" -Embedded
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0, Mandatory = $false)]
    [string]$InputPath,

    [Parameter(Position = 1, Mandatory = $false)]
    [string]$OutputDir,

    [Parameter(Mandatory = $false)]
    [switch]$Embedded,

    [Parameter(Mandatory = $false)]
    [switch]$KeepPackedTextures
)

# Prompt for InputPath if not provided
if ([string]::IsNullOrWhiteSpace($InputPath)) {
    # Check if any .glb files exist in current directory
    $localGlbs = Get-ChildItem -Filter "*.glb" -File
    if ($localGlbs.Count -eq 1) {
        $InputPath = $localGlbs[0].FullName
        Write-Host "Found local GLB: $($localGlbs[0].Name)" -ForegroundColor Cyan
    } else {
        Write-Host "==========================================================" -ForegroundColor Cyan
        Write-Host "           GLB to glTF Unpacker / Converter               " -ForegroundColor Cyan
        Write-Host "==========================================================" -ForegroundColor Cyan
        $InputPath = Read-Host "Enter path to .glb file"
    }
}

$InputPath = $InputPath.Trim().Trim('"').Trim("'")

if (-not (Test-Path -Path $InputPath -PathType Leaf)) {
    Write-Host "`n[ERROR] File not found: '$InputPath'" -ForegroundColor Red
    exit 1
}

$resolvedFile = Get-Item -Path $InputPath
$baseName = [System.IO.Path]::GetFileNameWithoutExtension($resolvedFile.Name)

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
    if ($Embedded) {
        $OutputDir = $resolvedFile.DirectoryName
    } else {
        $OutputDir = Join-Path $resolvedFile.DirectoryName "${baseName}_gltf"
    }
}

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

Write-Host "`n[+] Reading GLB: $($resolvedFile.Name) ($([math]::Round($resolvedFile.Length / 1MB, 2)) MB)..." -ForegroundColor Green

# Read binary stream
$fs = [System.IO.File]::OpenRead($resolvedFile.FullName)
$reader = New-Object System.IO.BinaryReader($fs)

try {
    # 12-byte GLB Header
    $magicBytes = $reader.ReadBytes(4)
    $magic = [System.Text.Encoding]::ASCII.GetString($magicBytes)
    if ($magic -ne "glTF") {
        Write-Host "[ERROR] '$($resolvedFile.Name)' is not a valid GLB container (Magic: '$magic')" -ForegroundColor Red
        exit 1
    }

    $version = $reader.ReadUInt32()
    $totalLength = $reader.ReadUInt32()

    # Chunk 0: JSON
    $chunk0Len = $reader.ReadUInt32()
    $chunk0Type = [System.Text.Encoding]::ASCII.GetString($reader.ReadBytes(4))
    if ($chunk0Type -ne "JSON") {
        Write-Host "[ERROR] First chunk is not JSON (Type: '$chunk0Type')" -ForegroundColor Red
        exit 1
    }
    $jsonBytes = $reader.ReadBytes($chunk0Len)
    $jsonText = [System.Text.Encoding]::UTF8.GetString($jsonBytes)

    # Chunk 1: BIN
    $binBytes = $null
    if ($fs.Position -lt $totalLength) {
        $chunk1Len = $reader.ReadUInt32()
        $chunk1Type = [System.Text.Encoding]::ASCII.GetString($reader.ReadBytes(4))
        $binBytes = $reader.ReadBytes($chunk1Len)
    }
} finally {
    $reader.Close()
    $fs.Close()
}

$gltf = $jsonText | ConvertFrom-Json

if ($Embedded) {
    # Embedded Mode: encode BIN into Base64 Data URI
    Write-Host "[+] Packing buffer as Base64 Data URI..." -ForegroundColor Green
    if ($binBytes -and $gltf.buffers -and $gltf.buffers.Count -gt 0) {
        $b64 = [Convert]::ToBase64String($binBytes)
        $gltf.buffers[0].uri = "data:application/octet-stream;base64,$b64"
    }

    $outGltfPath = Join-Path $OutputDir "${baseName}.gltf"
    $formattedJson = $gltf | ConvertTo-Json -Depth 100
    [System.IO.File]::WriteAllText($outGltfPath, $formattedJson, [System.Text.Encoding]::UTF8)

    Write-Host "`n[+] Successfully converted to Embedded glTF!" -ForegroundColor Cyan
    Write-Host "    File: $outGltfPath ($([math]::Round((Get-Item $outGltfPath).Length / 1MB, 2)) MB)`n"
    exit 0
}

# Separate Mode: unpack .bin, separate textures, and .gltf
Write-Host "[+] Unpacking to separate glTF (.gltf + .bin + textures)..." -ForegroundColor Green

$extractedImages = 0
if (-not $KeepPackedTextures -and $gltf.images -and $binBytes) {
    $bufferViews = $gltf.bufferViews
    for ($i = 0; $i -lt $gltf.images.Count; $i++) {
        $img = $gltf.images[$i]
        if ($img.PSObject.Properties['bufferView']) {
            $bvIdx = $img.bufferView
            $bv = $bufferViews[$bvIdx]
            $offset = if ($bv.PSObject.Properties['byteOffset']) { $bv.byteOffset } else { 0 }
            $len = $bv.byteLength

            $imgData = New-Object byte[] $len
            [Array]::Copy($binBytes, $offset, $imgData, 0, $len)

            $ext = ".jpg"
            if ($img.PSObject.Properties['mimeType']) {
                if ($img.mimeType -like "*png*") { $ext = ".png" }
                elseif ($img.mimeType -like "*webp*") { $ext = ".webp" }
            }

            $imgName = if ($img.PSObject.Properties['name'] -and $img.name) { $img.name } else { "texture_$i" }
            # Clean safe filename
            $safeImgName = ($imgName -replace '[\\/:*?"<>|]', '_') + $ext
            $imgPath = Join-Path $OutputDir $safeImgName
            [System.IO.File]::WriteAllBytes($imgPath, $imgData)

            # Update glTF image definition
            $img | Add-Member -NotePropertyName "uri" -NotePropertyValue $safeImgName -Force
            $img.PSObject.Properties.Remove('bufferView')
            if ($img.PSObject.Properties['mimeType']) {
                $img.PSObject.Properties.Remove('mimeType')
            }
            $extractedImages++
        }
    }
}

# Save binary buffer
$binFileName = "${baseName}.bin"
$binFilePath = Join-Path $OutputDir $binFileName
if ($binBytes) {
    [System.IO.File]::WriteAllBytes($binFilePath, $binBytes)
    if ($gltf.buffers -and $gltf.buffers.Count -gt 0) {
        $gltf.buffers[0] | Add-Member -NotePropertyName "uri" -NotePropertyValue $binFileName -Force
    }
}

# Save glTF JSON
$gltfPath = Join-Path $OutputDir "${baseName}.gltf"
$formattedJson = $gltf | ConvertTo-Json -Depth 100
[System.IO.File]::WriteAllText($gltfPath, $formattedJson, [System.Text.Encoding]::UTF8)

Write-Host "`n[+] Conversion Complete! Files unpacked to:" -ForegroundColor Cyan
Write-Host "    Directory: $OutputDir" -ForegroundColor White
Write-Host "    - ${baseName}.gltf ($([math]::Round((Get-Item $gltfPath).Length / 1KB, 1)) KB)" -ForegroundColor Green
Write-Host "    - $binFileName ($([math]::Round((Get-Item $binFilePath).Length / 1MB, 2)) MB)" -ForegroundColor Green
if ($extractedImages -gt 0) {
    Write-Host "    - $extractedImages extracted texture images" -ForegroundColor Green
}
Write-Host ""
