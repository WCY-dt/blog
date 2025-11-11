# Define input and output folder parameters with default values
param(
    [string]$InputFolder = "..\assets\post\images",
    [string]$OutputFolder = "..\assets\post\images"
)

# Clear the screen before starting the script
Clear-Host
Write-Host "[*] Starting image processing (optimization and conversion)..." -ForegroundColor Green

# Check if the input folder exists, exit if not
if (-Not (Test-Path -Path $InputFolder)) {
    Write-Error "Input directory does not exist: $InputFolder"
    exit 1
}

# Create the output folder if it does not exist
if (-Not (Test-Path -Path $OutputFolder)) {
    Write-Host "[*] Creating output directory: $OutputFolder" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $OutputFolder -Force
}

# Get all image files in the input folder with specific extensions
$imageFiles = Get-ChildItem -Path $InputFolder -File -Include @("*.png", "*.gif", "*.jpeg", "*.jpg", "*.bmp", "*.tiff", "*.ico", "*.cur", "*.apng", "*.avif", "*.heif", "*.heic") -Recurse

# Ask the user if SVG files should be included in the conversion, with a default value of "Y"
$convertSvg = Read-Host "Include SVG files for optimization? (Y/N, default: Y)"
if ([string]::IsNullOrWhiteSpace($convertSvg)) {
    $convertSvg = "Y"
}
if ($convertSvg.ToUpper() -eq "Y") {
    # Include SVG files in the list of files to convert
    $svgFiles = Get-ChildItem -Path $InputFolder -File -Include @("*.svg") -Recurse
    $imageFiles += $svgFiles
    Write-Host "[+] Including SVG files for optimization" -ForegroundColor Cyan
}

# Exit if no image files are found
if ($imageFiles.Count -eq 0) {
    Write-Warning "No image files found in $InputFolder"
    exit 0
}

# Notify the user about the number of files found
Write-Host "[+] Found $($imageFiles.Count) image files to process" -ForegroundColor Cyan

# Clear the screen before checking for WebP tools
Clear-Host
Write-Host "[*] Checking for WebP tools..." -ForegroundColor Yellow
try {
    # Check if the WebP tools are installed and accessible
    & cwebp -version 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "cwebp not found"
    }
    Write-Host "[+] WebP tools detected and ready" -ForegroundColor Green
}
catch {
    # Provide instructions to install WebP tools if not found
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

# Check for SVGO if SVG conversion is enabled
if ($convertSvg.ToUpper() -eq "Y") {
    Write-Host "[*] Checking for SVGO (SVG optimizer)..." -ForegroundColor Yellow
    try {
        # Check if SVGO is installed and accessible
        $svgoVersion = & svgo --version 2>$null
        if ($LASTEXITCODE -ne 0) {
            throw "svgo not found"
        }
        Write-Host "[+] SVGO detected and ready" -ForegroundColor Green
    }
    catch {
        # Provide instructions to install SVGO if not found
        Write-Host "[-] SVGO not found!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install SVGO for SVG optimization:" -ForegroundColor Yellow
        Write-Host "npm install -g svgo" -ForegroundColor Cyan
        Write-Host ""
        exit 1
    }
}

# Clear the screen before starting the conversion process
Clear-Host
Write-Host "[*] Processing images (optimizing SVG, converting others to WebP)..." -ForegroundColor Yellow

# Initialize counters for tracking conversion results
$convertedCount = 0
$failedCount = 0
$processedCount = 0

# Loop through each image file and convert it to WebP format
foreach ($imageFile in $imageFiles) {
    $processedCount++
    $percentage = [math]::Round(($processedCount / $imageFiles.Count) * 100, 2)
    Clear-Host
    Write-Progress -Activity "Processing images" -Status "Processing $($imageFile.Name) ($processedCount/$($imageFiles.Count))" -PercentComplete $percentage

    if ($imageFile.Extension -eq ".svg") {
        # Optimize SVG files only (do not convert to WebP)
        try {
            & svgo $imageFile.FullName -o $imageFile.FullName
            $convertedCount++
        }
        catch {
            $failedCount++
            Write-Host "  [-] Failed to optimize: $($imageFile.Name) - $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        # Convert non-SVG images to WebP format
        $outputFile = Join-Path -Path $OutputFolder -ChildPath ($imageFile.BaseName + ".webp")
        try {
            & cwebp $imageFile.FullName -o $outputFile
            if ($LASTEXITCODE -eq 0) {
                $convertedCount++
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
}

# Complete the progress bar for processing
Write-Progress -Activity "Processing images" -Completed

# Notify the user about the conversion results
Write-Host ""
Write-Host "[+] Processing completed! $convertedCount processed, $failedCount failed" -ForegroundColor Green

# Clear the screen before asking about deleting original images
Clear-Host
# Ask the user if original images should be deleted, with a default value of "Y"
$deleteOriginal = Read-Host "Delete original images? (Y/N, default: Y)"
if ([string]::IsNullOrWhiteSpace($deleteOriginal)) {
    $deleteOriginal = "Y"
}
if ($deleteOriginal.ToUpper() -eq "Y") {
    Write-Host "[*] Deleting original images..." -ForegroundColor Yellow

    # Initialize counters for tracking deletion results
    $deletedCount = 0
    $processedDeletes = 0

    # Loop through each image file and delete it (skip SVG files as they are only optimized, not converted)
    foreach ($imageFile in $imageFiles) {
        if ($imageFile.Extension -ne ".svg") {
            $processedDeletes++
            $percentage = [math]::Round(($processedDeletes / ($imageFiles.Count - ($imageFiles | Where-Object { $_.Extension -eq ".svg" }).Count)) * 100, 2)
            Clear-Host
            Write-Progress -Activity "Deleting original images" -Status "Deleting $($imageFile.Name) ($processedDeletes/$($imageFiles.Count - ($imageFiles | Where-Object { $_.Extension -eq ".svg" }).Count))" -PercentComplete $percentage

            try {
                # Delete the original image file
                Remove-Item -Path $imageFile.FullName -Force
                $deletedCount++
            }
            catch {
                # Failed deletions are not counted, just logged silently
                Write-Host "  [-] Failed to delete: $($imageFile.Name) - $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }

    # Complete the progress bar for deletion
    Write-Progress -Activity "Deleting original images" -Completed
    Write-Host "[+] Deleted $deletedCount original images" -ForegroundColor Green
} else {
    # Notify the user that original images are preserved
    Write-Host "[*] Original images preserved" -ForegroundColor Yellow
}

# Clear the screen before notifying script completion
Clear-Host
Write-Host "[*] Script execution completed!" -ForegroundColor Cyan
