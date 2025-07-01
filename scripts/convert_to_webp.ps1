param(
    [string]$InputFolder = "..\assets\post\images",
    [string]$OutputFolder = "..\assets\post\images"
)

Write-Host "[*] Starting WebP conversion process..." -ForegroundColor Green

if (-Not (Test-Path -Path $InputFolder)) {
    Write-Error "Input directory does not exist: $InputFolder"
    exit 1
}

if (-Not (Test-Path -Path $OutputFolder)) {
    Write-Host "[*] Creating output directory: $OutputFolder" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $OutputFolder -Force
}

$imageFiles = Get-ChildItem -Path $InputFolder -File -Include @("*.png", "*.gif", "*.jpeg", "*.jpg", "*.bmp", "*.tiff", "*.ico", "*.cur", "*.apng", "*.avif", "*.heif", "*.heic") -Recurse

$convertSvg = Read-Host "Convert SVG files? (Y/N)"
if ($convertSvg.ToUpper() -eq "Y") {
    $svgFiles = Get-ChildItem -Path $InputFolder -File -Include @("*.svg") -Recurse
    $imageFiles += $svgFiles
    Write-Host "[+] Including SVG files for conversion" -ForegroundColor Cyan
}

if ($imageFiles.Count -eq 0) {
    Write-Warning "No image files found in $InputFolder"
    exit 0
}

Write-Host "[+] Found $($imageFiles.Count) image files to convert" -ForegroundColor Cyan

Write-Host "[*] Checking for WebP tools..." -ForegroundColor Yellow
try {
    $cwebpVersion = & cwebp -version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "cwebp not found"
    }
    Write-Host "[+] WebP tools detected and ready" -ForegroundColor Green
}
catch {
    Write-Host "[-] WebP tools not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install WebP tools first:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://developers.google.com/speed/webp/download" -ForegroundColor Cyan
    Write-Host "2. Or install via package manager:" -ForegroundColor Cyan
    Write-Host "   - Windows: winget install Google.WebP" -ForegroundColor Gray
    Write-Host "   - Chocolatey: choco install webp" -ForegroundColor Gray
    Write-Host "   - Scoop: scoop install webp" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "[*] Converting images to WebP format..." -ForegroundColor Yellow

$convertedCount = 0
$failedCount = 0
$processedCount = 0

foreach ($imageFile in $imageFiles) {
    $processedCount++
    $percentage = [math]::Round(($processedCount / $imageFiles.Count) * 100, 1)
    Write-Progress -Activity "Converting images to WebP" -Status "Converting $($imageFile.Name) ($processedCount/$($imageFiles.Count))" -PercentComplete $percentage

    $outputFile = Join-Path -Path $OutputFolder -ChildPath ($imageFile.BaseName + ".webp")
    try {
        & cwebp $imageFile.FullName -o $outputFile
        if ($LASTEXITCODE -eq 0) {
            $convertedCount++
            Write-Host "  [+] Converted: $($imageFile.Name)" -ForegroundColor Green
        } else {
            $failedCount++
            Write-Host "  [-] Failed: $($imageFile.Name)" -ForegroundColor Red
        }
    }
    catch {
        $failedCount++
        Write-Host "  [-] Failed: $($imageFile.Name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Progress -Activity "Converting images to WebP" -Completed

Write-Host ""
Write-Host "[+] Conversion completed! $convertedCount converted, $failedCount failed" -ForegroundColor Green

$deleteOriginal = Read-Host "Delete original images? (Y/N)"
if ($deleteOriginal.ToUpper() -eq "Y") {
    Write-Host "[*] Deleting original images..." -ForegroundColor Yellow

    $deletedCount = 0
    $processedDeletes = 0

    foreach ($imageFile in $imageFiles) {
        $processedDeletes++
        $percentage = [math]::Round(($processedDeletes / $imageFiles.Count) * 100, 1)
        Write-Progress -Activity "Deleting original images" -Status "Deleting $($imageFile.Name) ($processedDeletes/$($imageFiles.Count))" -PercentComplete $percentage

        try {
            Remove-Item -Path $imageFile.FullName -Force
            $deletedCount++
            Write-Host "  [+] Deleted: $($imageFile.Name)" -ForegroundColor Green
        }
        catch {
            Write-Host "  [-] Failed to delete: $($imageFile.Name) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    Write-Progress -Activity "Deleting original images" -Completed
    Write-Host "[+] Deleted $deletedCount original images" -ForegroundColor Green
} else {
    Write-Host "[*] Original images preserved" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[*] Script execution completed!" -ForegroundColor Cyan
