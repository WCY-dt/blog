#!/bin/bash

inputFolder="./images/"
outputFolder="./images/"

if [ ! -d "$outputFolder" ]; then
    mkdir -p "$outputFolder"
fi

imageFiles=$(find "$inputFolder" -type f \( -iname "*.png" -o -iname "*.gif" -o -iname "*.jpeg" -o -iname "*.jpg" -o -iname "*.svg" -o -iname "*.bmp" -o -iname "*.tiff" -o -iname "*.ico" -o -iname "*.cur" -o -iname "*.apng" -o -iname "*.avif" -o -iname "*.heif" -o -iname "*.heic" \))
# echo "$imageFiles"

if [ -z "$imageFiles" ]; then
    echo "No image files found in the input folder."
else
    for imageFile in $imageFiles; do
        outputFile="$outputFolder$(basename "$imageFile" | cut -d. -f1).webp"
        # echo "Converting $imageFile to $outputFile"
        cwebp "$imageFile" -o "$outputFile"
    done
    echo "Conversion completed!"
fi

read -p "Do you want to delete the original images? (Y/N) " deleteOriginal
if [[ "$deleteOriginal" == "Y" || "$deleteOriginal" == "y" ]]; then
    for imageFile in $imageFiles; do
        rm "$imageFile"
    done
    echo "Original images deleted!"
else
    echo "Original images not deleted."
fi