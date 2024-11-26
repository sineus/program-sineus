#!/bin/bash

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <PROGRAM_ID> <NEW_BINARY_PATH>"
    exit 1
fi

PROGRAM_ID=$1
NEW_BINARY_PATH=$2
BUFFER_SIZE=10240  # 10KB buffer

# Get current program size
CURRENT_SIZE=$(solana program show "$PROGRAM_ID" | grep "Program Data Length" | awk '{print $4}')

# Get new binary size
NEW_SIZE=$(ls -l "$NEW_BINARY_PATH" | awk '{print $5}')

# Calculate difference and round up to 8-byte boundary
DIFF=$((NEW_SIZE - CURRENT_SIZE))
ROUNDED_DIFF=$(((DIFF + 7) & ~7))

# Add buffer
TOTAL_BYTES=$((ROUNDED_DIFF + BUFFER_SIZE))

if [ $TOTAL_BYTES -le 0 ]; then
    echo "No extension needed. New binary is smaller than current program."
    exit 0
fi

echo "Current size: $CURRENT_SIZE bytes"
echo "New size: $NEW_SIZE bytes"
echo "Extending by: $TOTAL_BYTES bytes"

# Execute extend command
solana program extend "$PROGRAM_ID" $TOTAL_BYTES -u d -k ~/.config/solana/id.json