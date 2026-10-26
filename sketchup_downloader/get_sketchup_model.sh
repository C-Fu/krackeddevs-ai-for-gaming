#!/usr/bin/env bash
# ==============================================================================
# SketchUp 3D Warehouse CDN Link Extractor (macOS / Linux)
#
# Extracts direct CDN download links for 3D models (GLB, USDZ, KMZ)
# from SketchUp 3D Warehouse or SketchUp Viewer URLs.
#
# Usage:
#   ./get_sketchup_model.sh
#   ./get_sketchup_model.sh "<URL_OR_ID>"
#   ./get_sketchup_model.sh --download "<URL_OR_ID>"
#
# Quickstart (One-liner without saving script):
#   curl -sSL https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.sh | bash -s -- "<URL>"
# ==============================================================================

set -e

AUTO_DOWNLOAD=0
INPUT_URL=""

# Parse arguments
while [ $# -gt 0 ]; do
    case "$1" in
        -d|--download)
            AUTO_DOWNLOAD=1
            shift
            ;;
        *)
            INPUT_URL="$1"
            shift
            ;;
    esac
done

# If no URL provided as argument, prompt user interactively
if [ -z "$INPUT_URL" ]; then
    echo "=========================================================="
    echo "       SketchUp 3D Model CDN Link Extractor               "
    echo "=========================================================="
    printf "Enter SketchUp URL or Model ID: "
    if [ -t 0 ]; then
        read -r INPUT_URL
    elif [ -e /dev/tty ]; then
        read -r INPUT_URL < /dev/tty
    else
        echo ""
        echo "Error: No URL provided and cannot read from terminal."
        exit 1
    fi
fi

# Trim whitespace
INPUT_URL=$(echo "$INPUT_URL" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')

# Extract 36-character UUID
MODEL_ID=$(printf '%s' "$INPUT_URL" | grep -oEi '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -n 1 | tr '[:upper:]' '[:lower:]' || true)

if [ -z "$MODEL_ID" ]; then
    echo ""
    echo -e "\033[1;31m[ERROR] Could not extract a valid 36-character UUID from input:\033[0m '$INPUT_URL'"
    echo "Expected a 3D Warehouse URL or Model UUID (e.g., 16965783-d6e1-4abf-b2d6-ef87f1b25747)"
    exit 1
fi

echo ""
echo -e "\033[1;32m[+] Fetching model metadata for ID: $MODEL_ID...\033[0m"

API_URL="https://3dwarehouse.sketchup.com/warehouse/v1.0/entities/$MODEL_ID"
USER_AGENT="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

# Fetch API JSON response
JSON_DATA=$(curl -sSL -H "User-Agent: $USER_AGENT" -H "Accept: application/json" "$API_URL" || true)

if [ -z "$JSON_DATA" ] || ! echo "$JSON_DATA" | grep -q '"id"'; then
    echo -e "\033[1;31m[ERROR] Failed to fetch valid metadata from 3D Warehouse API.\033[0m"
    echo "URL attempted: $API_URL"
    exit 1
fi

# Parser script using Python3 (standard on macOS & Linux) or fallback to jq
PARSE_SCRIPT='
import sys, json

try:
    raw = sys.stdin.read()
    data = json.loads(raw)
except Exception as e:
    sys.exit("Failed to parse JSON: " + str(e))

title = data.get("title", "Unknown Title")
model_id = data.get("id", "")

print("----------------------------------------------------------")
print("Model Title : \033[1;33m" + str(title) + "\033[0m")
print("Model ID    : \033[0;37m" + str(model_id) + "\033[0m")
print("----------------------------------------------------------")
print("\n\033[1;36mAvailable Formats & Direct CDN Links:\033[0m\n")

target_exts = {"glb", "usdz", "kmz", "skp"}
binaries = data.get("binaries", {})

items = []
for k, b in binaries.items():
    ext = (b.get("ext") or "").lower()
    if ext in target_exts:
        cu = b.get("contentUrl") or ""
        fn = b.get("originalFileName") or (str(title) + "." + ext)
        size = b.get("fileSize") or 0
        size_mb = round(size / (1024 * 1024), 2)
        is_public = "/content/public/" in cu
        items.append({
            "key": k,
            "ext": ext.upper(),
            "fileName": fn,
            "sizeMB": size_mb,
            "url": cu,
            "isPublic": is_public
        })

priority = {"GLB": 1, "USDZ": 2, "KMZ": 3, "SKP": 4}
items.sort(key=lambda x: priority.get(x["ext"], 99))

public_links = []
for it in items:
    if it["isPublic"]:
        status = "\033[1;32m[Direct Public CDN]\033[0m"
        public_links.append((it["fileName"], it["url"]))
    else:
        status = "\033[0;33m[Restricted - Requires Login]\033[0m"
    
    print("  \033[1m[" + it["ext"] + "]\033[0m " + str(it["fileName"]) + " (" + str(it["sizeMB"]) + " MB) " + status)
    print("    Link: " + str(it["url"]) + "\n")

# Save public links to temporary file for bash downloader if needed
try:
    with open("/tmp/sketchup_public_downloads.txt", "w") as f:
        for fn, u in public_links:
            f.write(str(fn) + "\t" + str(u) + "\n")
except Exception:
    pass
'

if command -v python3 >/dev/null 2>&1; then
    printf '%s' "$JSON_DATA" | python3 -c "$PARSE_SCRIPT"
elif command -v jq >/dev/null 2>&1; then
    echo "----------------------------------------------------------"
    echo "Model Title : $(echo "$JSON_DATA" | jq -r .title)"
    echo "Model ID    : $MODEL_ID"
    echo "----------------------------------------------------------"
    echo ""
    echo "Available Formats & Direct CDN Links:"
    echo "$JSON_DATA" | jq -r '
        .binaries[] | select(.ext == "glb" or .ext == "usdz" or .ext == "kmz" or .ext == "skp") |
        "  [\(.ext | ascii_upcase)] \(.originalFileName) (\((.fileSize / 1048576 * 100 | round) / 100) MB) [\(if .contentUrl | contains("public") then "Direct Public CDN" else "Restricted" end)]\n    Link: \(.contentUrl)\n"
    '
    echo "$JSON_DATA" | jq -r '
        .binaries[] | select((.ext == "glb" or .ext == "usdz") and (.contentUrl | contains("public"))) |
        "\(.originalFileName)\t\(.contentUrl)"
    ' > /tmp/sketchup_public_downloads.txt 2>/dev/null || true
else
    echo "Please install python3 or jq to format the output."
    exit 1
fi

TMP_FILE="/tmp/sketchup_public_downloads.txt"

if [ -f "$TMP_FILE" ] && [ -s "$TMP_FILE" ]; then
    SHOULD_DL=0
    if [ "$AUTO_DOWNLOAD" -eq 1 ]; then
        SHOULD_DL=1
    elif [ -t 0 ]; then
        printf "Would you like to download the public files (GLB / USDZ) now? (y/n): "
        read -r CONFIRM
        if [ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ]; then
            SHOULD_DL=1
        fi
    elif [ -e /dev/tty ]; then
        printf "Would you like to download the public files (GLB / USDZ) now? (y/n): "
        read -r CONFIRM < /dev/tty || true
        if [ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ]; then
            SHOULD_DL=1
        fi
    fi

    if [ "$SHOULD_DL" -eq 1 ]; then
        echo ""
        while IFS=$'\t' read -r FILENAME FILEURL; do
            if [ -n "$FILEURL" ]; then
                SAFE_FILENAME=$(echo "$FILENAME" | sed 's/[^a-zA-Z0-9._-]/_/g')
                echo -e "\033[1;32m[+] Downloading $SAFE_FILENAME...\033[0m"
                curl -SL -H "User-Agent: $USER_AGENT" "$FILEURL" -o "$SAFE_FILENAME"
                echo "    Saved: $SAFE_FILENAME"
            fi
        done < "$TMP_FILE"
        echo ""
        echo -e "\033[1;36m[+] All downloads completed!\033[0m"
    fi
    rm -f "$TMP_FILE"
fi
