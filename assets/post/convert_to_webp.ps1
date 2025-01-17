$inputFolder = ".\images\"
$outputFolder = ".\images\"

if (-Not (Test-Path -Path $outputFolder)) {
    New-Item -ItemType Directory -Path $outputFolder
}

$imageFiles = Get-ChildItem -Path $inputFolder -File -Include @("*.png", "*.gif", "*.jpeg", "*.jpg", "*.bmp", "*.tiff", "*.ico", "*.cur", "*.apng", "*.avif", "*.heif", "*.heic") -Recurse

$convertSvg = Read-Host "Do you want to convert SVG files? (Y/N)"
if ($convertSvg -eq "Y" -or $convertSvg -eq "y") {
    $svgFiles = Get-ChildItem -Path $inputFolder -File -Include @("*.svg") -Recurse
    $imageFiles += $svgFiles
}

if ($imageFiles.Count -eq 0) {
    Write-Output "No image files found in the input folder."
} else {
    foreach ($imageFile in $imageFiles) {
        $outputFile = Join-Path -Path $outputFolder -ChildPath ($imageFile.BaseName + ".webp")
        & cwebp $imageFile.FullName -o $outputFile
    }
    Write-Output "Conversion completed!"
}

$deleteOriginal = Read-Host "Do you want to delete the original images? (Y/N)"
if ($deleteOriginal -eq "Y" -or $deleteOriginal -eq "y") {
    foreach ($imageFile in $imageFiles) {
        Remove-Item -Path $imageFile.FullName
    }
    Write-Output "Original images deleted!"
} else {
    Write-Output "Original images not deleted."
}
