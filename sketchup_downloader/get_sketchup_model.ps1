<#
.SYNOPSIS
    Extracts direct CDN download links for 3D models (GLB, USDZ, KMZ) from SketchUp 3D Warehouse.

.DESCRIPTION
    Accepts SketchUp 3D Warehouse URLs (viewer or model page) or a model UUID,
    queries the 3D Warehouse entities API, and outputs direct CDN download links.
    Also offers an option to immediately download the available files.

.PARAMETER Url
    The SketchUp 3D Warehouse URL or UUID.

.PARAMETER Download
    Automatically download public models without prompting.

.EXAMPLE
    .\get_sketchup_model.ps1 "https://app.sketchup.com/viewer/3dw?WarehouseModelId=16965783-d6e1-4abf-b2d6-ef87f1b25747"
    .\get_sketchup_model.ps1 "https://3dwarehouse.sketchup.com/model/16965783-d6e1-4abf-b2d6-ef87f1b25747/Ombak-KLCC"
    .\get_sketchup_model.ps1
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0, Mandatory = $false)]
    [string]$Url,

    [Parameter(Mandatory = $false)]
    [switch]$Download
)

# Prompt for URL if not provided
if ([string]::IsNullOrWhiteSpace($Url)) {
    try {
        if ([Console]::IsInputRedirected) {
            Write-Host "[ERROR] No URL provided and input is redirected." -ForegroundColor Red
            exit 1
        }
    } catch {}
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "       SketchUp 3D Model CDN Link Extractor              " -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor Cyan
    $Url = Read-Host "Enter SketchUp URL or Model ID"
}

# Trim whitespace and quotes
$Url = $Url.Trim().Trim('"').Trim("'")

# Extract 36-character UUID
$uuidPattern = '([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})'
if ($Url -match $uuidPattern) {
    $modelId = $Matches[1].ToLower()
} else {
    Write-Host "`n[ERROR] Could not extract a valid Model UUID from input: '$Url'" -ForegroundColor Red
    Write-Host "Expected a 3D Warehouse URL or UUID format (e.g., 16965783-d6e1-4abf-b2d6-ef87f1b25747)" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n[+] Fetching model metadata for ID: $modelId..." -ForegroundColor Green

$apiUrl = "https://3dwarehouse.sketchup.com/warehouse/v1.0/entities/$modelId"
$headers = @{
    "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    "Accept"     = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Headers $headers -Method Get
} catch {
    Write-Host "`n[ERROR] Failed to query 3D Warehouse API: $_" -ForegroundColor Red
    exit 1
}

$title = $response.title
Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "Model Title : " -NoNewline; Write-Host $title -ForegroundColor Yellow
Write-Host "Model ID    : " -NoNewline; Write-Host $modelId -ForegroundColor Gray
Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray

$targetExts = @('glb', 'usdz', 'kmz', 'skp')
$downloads = @()

if ($response.binaries) {
    foreach ($prop in $response.binaries.PSObject.Properties) {
        $bin = $prop.Value
        $ext = "$($bin.ext)".ToLower()
        if ($ext -in $targetExts) {
            $isPublic = "$($bin.contentUrl)" -like "*public*"
            $sizeMb = if ($bin.fileSize) { [math]::Round($bin.fileSize / 1MB, 2) } else { 0 }
            
            $downloads += [PSCustomObject]@{
                Key         = $prop.Name
                Extension   = $ext.ToUpper()
                FileName    = $bin.originalFileName
                FileSizeMB  = $sizeMb
                ContentUrl  = $bin.contentUrl
                IsPublic    = $isPublic
            }
        }
    }
}

if ($downloads.Count -eq 0) {
    Write-Host "`n[!] No GLB, USDZ, or KMZ binaries found for this model." -ForegroundColor Yellow
    exit 0
}

Write-Host "`nAvailable Formats & Direct CDN Links:`n" -ForegroundColor Cyan

# Sort so GLB, USDZ, KMZ show up first
$priority = @{ 'GLB' = 1; 'USDZ' = 2; 'KMZ' = 3; 'SKP' = 4 }
$sortedDownloads = $downloads | Sort-Object { if ($priority.ContainsKey($_.Extension)) { $priority[$_.Extension] } else { 99 } }

foreach ($item in $sortedDownloads) {
    $statusColor = if ($item.IsPublic) { "Green" } else { "DarkYellow" }
    $statusText  = if ($item.IsPublic) { "[Direct Public CDN]" } else { "[Restricted - Requires Login]" }
    
    Write-Host ("  [{0}] {1} ({2} MB) {3}" -f $item.Extension, $item.FileName, $item.FileSizeMB, $statusText) -ForegroundColor $statusColor
    Write-Host "    Link: $($item.ContentUrl)" -ForegroundColor White
    Write-Host ""
}

# Filter for downloadable public items
$publicItems = $sortedDownloads | Where-Object { $_.IsPublic -and $_.ContentUrl }

if ($publicItems.Count -gt 0) {
    $shouldDownload = $false
    if ($Download) {
        $shouldDownload = $true
    } else {
        $isRedirected = $false
        try { $isRedirected = [Console]::IsInputRedirected } catch {}
        if (-not $isRedirected) {
            $prompt = Read-Host "Would you like to download the public files (GLB / USDZ) now? (y/n)"
            if (-not [string]::IsNullOrWhiteSpace($prompt) -and $prompt.Trim().ToLower() -eq 'y') {
                $shouldDownload = $true
            }
        }
    }

    if ($shouldDownload) {
        foreach ($pub in $publicItems) {
            $saveName = $pub.FileName
            if ([string]::IsNullOrWhiteSpace($saveName)) {
                $saveName = "$($title).$($pub.Extension.ToLower())"
            }
            # Remove illegal filename characters
            $cleanName = ($saveName -replace '[\\/:*?"<>|]', '_')
            Write-Host "`n[+] Downloading $cleanName..." -ForegroundColor Green
            try {
                Invoke-WebRequest -Uri $pub.ContentUrl -OutFile $cleanName -Headers $headers
                Write-Host "    Saved: $cleanName ($([math]::Round((Get-Item $cleanName).Length / 1MB, 2)) MB)" -ForegroundColor Green
            } catch {
                Write-Host "    [ERROR] Download failed: $_" -ForegroundColor Red
            }
        }
        Write-Host "`n[+] All downloads completed!" -ForegroundColor Cyan
    }
}
