#!/usr/bin/env bash
# ==============================================================================
# GLB to glTF Unpacker & Converter (macOS / Linux)
#
# Unpacks a self-contained binary GLB container into readable glTF JSON
# and external binary buffer (.bin). Also supports generating a single
# self-contained embedded glTF file with base64 Data URI.
#
# Pure Shell / POSIX implementation:
#   NO Python required.
#   NO Node.js / npm required.
#   Uses standard Unix coreutils (od, tail, head, sed, base64, awk).
#   Optional jq enhancement if installed.
#
# Usage:
#   ./glb2gltf.sh <model.glb>
#   ./glb2gltf.sh -o ./output_folder <model.glb>
#   ./glb2gltf.sh --embedded <model.glb>
#
# Quickstart (Run directly without saving script beforehand):
#   curl -sSL https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/glb2gltf.sh | bash -s -- model.glb
# ==============================================================================

set -e

EMBEDDED=0
OUTPUT_DIR=""
INPUT_FILE=""

# Parse arguments
while [ $# -gt 0 ]; do
    case "$1" in
        -e|--embedded)
            EMBEDDED=1
            shift
            ;;
        -o|--output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        *)
            INPUT_FILE="$1"
            shift
            ;;
    esac
done

# If no input file passed, prompt interactively
if [ -z "$INPUT_FILE" ]; then
    # Look for a single .glb in current directory
    GLB_FILES=( *.glb )
    if [ -f "${GLB_FILES[0]}" ] && [ ${#GLB_FILES[@]} -eq 1 ]; then
        INPUT_FILE="${GLB_FILES[0]}"
        echo -e "\033[1;36mFound local GLB:\033[0m $INPUT_FILE"
    else
        echo "=========================================================="
        echo "           GLB to glTF Unpacker / Converter               "
        echo "=========================================================="
        printf "Enter path to .glb file: "
        if [ -t 0 ]; then
            read -r INPUT_FILE
        elif [ -e /dev/tty ]; then
            read -r INPUT_FILE < /dev/tty
        else
            echo "Error: No input file provided."
            exit 1
        fi
    fi
fi

# Trim quotes and whitespace
INPUT_FILE=$(echo "$INPUT_FILE" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e "s/^['\"]//" -e "s/['\"]$//")

if [ ! -f "$INPUT_FILE" ]; then
    echo -e "\033[1;31m[ERROR] File not found: '$INPUT_FILE'\033[0m"
    exit 1
fi

BASE_NAME=$(basename "$INPUT_FILE" | sed 's/\.[^.]*$//')
DIR_NAME=$(dirname "$INPUT_FILE")

if [ -z "$OUTPUT_DIR" ]; then
    if [ "$EMBEDDED" -eq 1 ]; then
        OUTPUT_DIR="$DIR_NAME"
    else
        OUTPUT_DIR="$DIR_NAME/${BASE_NAME}_gltf"
    fi
fi

mkdir -p "$OUTPUT_DIR"

echo ""
echo -e "\033[1;32m[+] Processing '$INPUT_FILE' (Pure Shell / POSIX)...\033[0m"

# Validate 12-byte header (Magic: "glTF" -> 0x46546c67)
MAGIC=$(head -c 4 "$INPUT_FILE" || true)
if [ "$MAGIC" != "glTF" ]; then
    echo -e "\033[1;31m[ERROR] '$INPUT_FILE' is not a valid GLB container (Magic: '$MAGIC').\033[0m"
    exit 1
fi

# Read Chunk 0 (JSON) length from byte offset 12 (4 bytes little-endian unsigned integer)
JSON_LEN=$(od -j 12 -N 4 -An -t u4 "$INPUT_FILE" | tr -d ' \t\r\n')

if [ -z "$JSON_LEN" ] || [ "$JSON_LEN" -le 0 ]; then
    echo -e "\033[1;31m[ERROR] Invalid JSON chunk length in GLB.\033[0m"
    exit 1
fi

# Extract JSON chunk (starts at byte offset 20)
RAW_GLTF="$OUTPUT_DIR/${BASE_NAME}.raw.gltf"
tail -c +21 "$INPUT_FILE" | head -c "$JSON_LEN" > "$RAW_GLTF"

# Read Chunk 1 (BIN) header
BIN_HDR_OFFSET=$((20 + JSON_LEN))
BIN_DATA_START=$((BIN_HDR_OFFSET + 9))

# Check if BIN chunk exists (file size check)
FILE_SIZE=$(wc -c < "$INPUT_FILE" | tr -d ' ')
BIN_LEN=0
if [ "$FILE_SIZE" -gt "$BIN_HDR_OFFSET" ]; then
    BIN_LEN=$(od -j "$BIN_HDR_OFFSET" -N 4 -An -t u4 "$INPUT_FILE" | tr -d ' \t\r\n' || echo "0")
fi

OUT_GLTF_PATH="$OUTPUT_DIR/${BASE_NAME}.gltf"

if [ "$EMBEDDED" -eq 1 ]; then
    echo -e "\033[1;32m[+] Encoding binary buffer as base64 Data URI...\033[0m"
    if [ "$BIN_LEN" -gt 0 ]; then
        B64_TMP="$OUTPUT_DIR/.b64_tmp"
        tail -c +"$BIN_DATA_START" "$INPUT_FILE" | head -c "$BIN_LEN" | base64 | tr -d '\r\n' > "$B64_TMP"
        
        if command -v jq >/dev/null 2>&1; then
            jq --rawfile b64 "$B64_TMP" '.buffers[0].uri = ("data:application/octet-stream;base64," + $b64)' "$RAW_GLTF" > "$OUT_GLTF_PATH"
        else
            awk 'BEGIN { getline b64 < "'"$B64_TMP"'" }
                 { gsub(/"buffers"[[:space:]]*:[[:space:]]*\[[[:space:]]*\{/, "\"buffers\":[{\"uri\":\"data:application/octet-stream;base64," b64 "\","); print }' "$RAW_GLTF" > "$OUT_GLTF_PATH"
        fi
        rm -f "$B64_TMP"
    else
        cp "$RAW_GLTF" "$OUT_GLTF_PATH"
    fi
    rm -f "$RAW_GLTF"

    SZ_MB=$(du -m "$OUT_GLTF_PATH" 2>/dev/null | cut -f1 || echo "?")
    echo ""
    echo -e "\033[1;36m[+] Successfully converted to Embedded glTF!\033[0m"
    echo -e "    File: $OUT_GLTF_PATH (~${SZ_MB} MB)\n"
    exit 0
fi

# Separate Mode: unpack .bin and point .gltf to it
BIN_FILENAME="${BASE_NAME}.bin"
OUT_BIN_PATH="$OUTPUT_DIR/$BIN_FILENAME"

if [ "$BIN_LEN" -gt 0 ]; then
    echo -e "\033[1;32m[+] Extracting binary buffer -> $BIN_FILENAME...\033[0m"
    tail -c +"$BIN_DATA_START" "$INPUT_FILE" | head -c "$BIN_LEN" > "$OUT_BIN_PATH"
fi

# Update glTF JSON buffer URI
echo -e "\033[1;32m[+] Linking glTF JSON to external buffer...\033[0m"
if command -v jq >/dev/null 2>&1; then
    jq --arg uri "$BIN_FILENAME" '.buffers[0].uri = $uri' "$RAW_GLTF" > "$OUT_GLTF_PATH"
else
    # Sed fallback for systems without jq
    sed -E 's/"buffers"[[:space:]]*:[[:space:]]*\[[[:space:]]*\{/"buffers":[{"uri":"'"$BIN_FILENAME"'",/g' "$RAW_GLTF" > "$OUT_GLTF_PATH"
fi
rm -f "$RAW_GLTF"

# Extract texture images if jq is installed
EXTRACTED_IMG=0
if command -v jq >/dev/null 2>&1 && [ "$BIN_LEN" -gt 0 ]; then
    IMG_INFO=$(jq -r '
        if .images and .bufferViews then
            .images[] | select(.bufferView != null) |
            "\(.bufferView)\t\(if .mimeType then .mimeType else "image/jpeg" end)\t\(if .name then .name else "" end)"
        else empty end
    ' "$OUT_GLTF_PATH" 2>/dev/null || true)

    if [ -n "$IMG_INFO" ]; then
        echo -e "\033[1;32m[+] Unpacking embedded textures (via jq)...\033[0m"
        IMG_INDEX=0
        while IFS=$'\t' read -r BV_IDX MIME IMG_NAME; do
            if [ -n "$BV_IDX" ]; then
                BV_DATA=$(jq -r ".bufferViews[$BV_IDX] | \"\(.byteOffset // 0)\t\(.byteLength)\"" "$OUT_GLTF_PATH")
                OFFSET=$(echo "$BV_DATA" | cut -f1)
                LENGTH=$(echo "$BV_DATA" | cut -f2)

                EXT=".jpg"
                case "$MIME" in
                    *png*) EXT=".png" ;;
                    *webp*) EXT=".webp" ;;
                esac

                SAFE_NAME="$IMG_NAME"
                [ -z "$SAFE_NAME" ] && SAFE_NAME="texture_$IMG_INDEX"
                SAFE_NAME=$(echo "$SAFE_NAME" | sed 's/[^a-zA-Z0-9._-]/_/g')
                IMG_FILE="${SAFE_NAME}${EXT}"

                # Slice image from the .bin buffer
                tail -c +$((OFFSET + 1)) "$OUT_BIN_PATH" | head -c "$LENGTH" > "$OUTPUT_DIR/$IMG_FILE"

                # Update glTF image definition
                jq --arg idx "$IMG_INDEX" --arg uri "$IMG_FILE" '
                    .images[($idx | tonumber)].uri = $uri |
                    del(.images[($idx | tonumber)].bufferView) |
                    del(.images[($idx | tonumber)].mimeType)
                ' "$OUT_GLTF_PATH" > "$OUT_GLTF_PATH.tmp" && mv "$OUT_GLTF_PATH.tmp" "$OUT_GLTF_PATH"

                IMG_INDEX=$((IMG_INDEX + 1))
                EXTRACTED_IMG=$((EXTRACTED_IMG + 1))
            fi
        done <<< "$IMG_INFO"
    fi
fi

GLTF_SIZE=$(du -k "$OUT_GLTF_PATH" 2>/dev/null | cut -f1 || echo "?")
BIN_SIZE=$(du -m "$OUT_BIN_PATH" 2>/dev/null | cut -f1 || echo "?")

echo ""
echo -e "\033[1;36m[+] Conversion Complete! Files unpacked to:\033[0m"
echo -e "    Directory: $OUTPUT_DIR"
echo -e "    - ${BASE_NAME}.gltf (${GLTF_SIZE} KB)"
[ "$BIN_LEN" -gt 0 ] && echo -e "    - $BIN_FILENAME (~${BIN_SIZE} MB)"
[ "$EXTRACTED_IMG" -gt 0 ] && echo -e "    - $EXTRACTED_IMG extracted texture images"
echo ""
