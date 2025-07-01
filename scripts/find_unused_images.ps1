param(
    [string]$PostsPath = "..\_posts",
    [string]$ImagesPath = "..\assets\post\images"
)

Write-Host "[*] Scanning posts and images directories..." -ForegroundColor Green

if (-Not (Test-Path -Path $PostsPath)) {
    Write-Error "Posts directory does not exist: $PostsPath"
    exit 1
}

if (-Not (Test-Path -Path $ImagesPath)) {
    Write-Error "Images directory does not exist: $ImagesPath"
    exit 1
}

$imageFiles = Get-ChildItem -Path $ImagesPath -File -Include @("*.png", "*.gif", "*.jpeg", "*.jpg", "*.bmp", "*.tiff", "*.ico", "*.cur", "*.apng", "*.avif", "*.heif", "*.heic", "*.webp", "*.svg") -Recurse

if ($imageFiles.Count -eq 0) {
    Write-Warning "No image files found in $ImagesPath"
    exit 0
}

Write-Host "[+] Found $($imageFiles.Count) image files" -ForegroundColor Cyan

$markdownFiles = Get-ChildItem -Path $PostsPath -File -Filter "*.md" -Recurse

if ($markdownFiles.Count -eq 0) {
    Write-Warning "No Markdown files found in $PostsPath"
    exit 0
}

Write-Host "[+] Found $($markdownFiles.Count) Markdown files" -ForegroundColor Cyan

$referencedImages = @{}

Write-Host "[*] Scanning Markdown files for image references..." -ForegroundColor Yellow

$processedFiles = 0
foreach ($markdownFile in $markdownFiles) {
    $processedFiles++
    $percentage = [math]::Round(($processedFiles / $markdownFiles.Count) * 100, 1)
    Write-Progress -Activity "Scanning Markdown files" -Status "Processing $($markdownFile.Name) ($processedFiles/$($markdownFiles.Count))" -PercentComplete $percentage

    $content = Get-Content -Path $markdownFile.FullName -Raw -Encoding UTF8

    $patterns = @(
        '!\[[^\]]*\]\(/assets/post/images/([^)]+)\)',
        '!\[[^\]]*\]\(assets/post/images/([^)]+)\)',
        '<img[^>]+src=[\"'']/assets/post/images/([^\"'']+)[\"''][^>]*>',
        '<img[^>]+src=[\"'']assets/post/images/([^\"'']+)[\"''][^>]*>',
        '\{\%\s*image_caption\s+/assets/post/images/([^\s\|]+)',
        '\{\%\s*image_caption\s+assets/post/images/([^\s\|]+)',
        '/assets/post/images/([^\s\)]+)',
        'assets/post/images/([^\s\)]+)'
    )

    foreach ($pattern in $patterns) {
        $matches = [regex]::Matches($content, $pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        foreach ($match in $matches) {
            $imageName = $match.Groups[1].Value
            $imageName = $imageName -split '[?#]' | Select-Object -First 1
            $imageName = $imageName.Trim('"', "'")
            $referencedImages[$imageName] = $true
        }
    }
}

Write-Progress -Activity "Scanning Markdown files" -Completed
Write-Host "[+] Found $($referencedImages.Count) referenced images" -ForegroundColor Cyan

Write-Host "[*] Checking for missing referenced images..." -ForegroundColor Yellow
$missingImages = @()
$checkedImages = 0
foreach ($referencedImage in $referencedImages.Keys) {
    $checkedImages++
    $percentage = [math]::Round(($checkedImages / $referencedImages.Count) * 100, 1)
    Write-Progress -Activity "Checking referenced images" -Status "Checking $referencedImage ($checkedImages/$($referencedImages.Count))" -PercentComplete $percentage

    $imagePath = Join-Path -Path $ImagesPath -ChildPath $referencedImage
    if (-not (Test-Path -Path $imagePath)) {
        $missingImages += $referencedImage
    }
}

Write-Progress -Activity "Checking referenced images" -Completed

if ($missingImages.Count -gt 0) {
    Write-Host ""
    Write-Host "[!] WARNING: Found $($missingImages.Count) referenced images that don't exist:" -ForegroundColor Red
    foreach ($missingImage in $missingImages) {
        Write-Host "  [-] $missingImage" -ForegroundColor Red
    }
    Write-Host ""
}

$unusedImages = @()

foreach ($imageFile in $imageFiles) {
    $imageName = $imageFile.Name
    if (-not $referencedImages.ContainsKey($imageName)) {
        $unusedImages += $imageFile
    }
}

if ($unusedImages.Count -eq 0) {
    Write-Host "[+] Great! All images are in use, no unused images found." -ForegroundColor Green
} else {
    Write-Host "[!] Found $($unusedImages.Count) unused images:" -ForegroundColor Red
    Write-Host ""

    $totalSize = 0
    foreach ($unusedImage in $unusedImages) {
        $fileSize = [math]::Round($unusedImage.Length / 1KB, 2)
        $totalSize += $fileSize
        Write-Host "  [-] $($unusedImage.Name) ($fileSize KB)" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "[*] Total unused space: $([math]::Round($totalSize, 2)) KB" -ForegroundColor Magenta
    Write-Host ""

    $deleteChoice = Read-Host "Delete unused images? (Y/N)"
    $deleteChoice = $deleteChoice.ToUpper()

    if ($deleteChoice -eq "Y") {
        Write-Host "[*] Deleting unused images..." -ForegroundColor Yellow

        $deletedCount = 0
        $deletedSize = 0
        $processedDeletes = 0

        foreach ($unusedImage in $unusedImages) {
            $processedDeletes++
            $percentage = [math]::Round(($processedDeletes / $unusedImages.Count) * 100, 1)
            Write-Progress -Activity "Deleting unused images" -Status "Deleting $($unusedImage.Name) ($processedDeletes/$($unusedImages.Count))" -PercentComplete $percentage

            try {
                $fileSize = $unusedImage.Length
                Remove-Item -Path $unusedImage.FullName -Force
                $deletedCount++
                $deletedSize += $fileSize
                Write-Host "  [+] Deleted: $($unusedImage.Name)" -ForegroundColor Green
            }
            catch {
                Write-Host "  [-] Failed to delete: $($unusedImage.Name) - $($_.Exception.Message)" -ForegroundColor Red
            }
        }

        Write-Progress -Activity "Deleting unused images" -Completed

        Write-Host ""
        Write-Host "[+] Deletion completed! Deleted $deletedCount files, saved $([math]::Round($deletedSize / 1KB, 2)) KB" -ForegroundColor Green
    } else {
        Write-Host "[*] No files were deleted." -ForegroundColor Yellow
    }
}

$showReferencedChoice = Read-Host "Show all referenced images list? (Y/N)"
if ($showReferencedChoice.ToUpper() -eq "Y") {
    Write-Host ""
    Write-Host "[*] Referenced images ($($referencedImages.Count) files):" -ForegroundColor Green
    $sortedReferencedImages = $referencedImages.Keys | Sort-Object
    foreach ($referencedImage in $sortedReferencedImages) {
        $imagePath = Join-Path -Path $ImagesPath -ChildPath $referencedImage
        if (Test-Path -Path $imagePath) {
            Write-Host "  [+] $referencedImage" -ForegroundColor Green
        } else {
            Write-Host "  [-] $referencedImage (NOT FOUND!)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "[*] Script execution completed!" -ForegroundColor Cyan
