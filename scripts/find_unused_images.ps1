# Define parameters for the paths to posts and images directories
param(
    [string]$PostsPath = "..\_posts",
    [string]$ImagesPath = "..\assets\post\images"
)

# Notify the user that the script has started
Write-Host "[*] Scanning posts and images directories..." -ForegroundColor Green

# Check if the posts directory exists, exit if not
if (-Not (Test-Path -Path $PostsPath)) {
    Write-Error "Posts directory does not exist: $PostsPath"
    exit 1
}

# Check if the images directory exists, exit if not
if (-Not (Test-Path -Path $ImagesPath)) {
    Write-Error "Images directory does not exist: $ImagesPath"
    exit 1
}

# Get all image files in the images directory with specific extensions
$imageFiles = Get-ChildItem -Path $ImagesPath -File -Include @("*.png", "*.gif", "*.jpeg", "*.jpg", "*.bmp", "*.tiff", "*.ico", "*.cur", "*.apng", "*.avif", "*.heif", "*.heic", "*.webp", "*.svg") -Recurse

# Exit if no image files are found
if ($imageFiles.Count -eq 0) {
    Write-Warning "No image files found in $ImagesPath"
    exit 0
}

# Notify the user about the number of image files found
Write-Host "[+] Found $($imageFiles.Count) image files" -ForegroundColor Cyan

# Get all Markdown files in the posts directory
$markdownFiles = Get-ChildItem -Path $PostsPath -File -Filter "*.md" -Recurse

# Exit if no Markdown files are found
if ($markdownFiles.Count -eq 0) {
    Write-Warning "No Markdown files found in $PostsPath"
    exit 0
}

# Notify the user about the number of Markdown files found
Write-Host "[+] Found $($markdownFiles.Count) Markdown files" -ForegroundColor Cyan

# Initialize a hashtable to store referenced images
$referencedImages = @{}

# Notify the user that the script is scanning Markdown files for image references
Write-Host "[*] Scanning Markdown files for image references..." -ForegroundColor Yellow

# Loop through each Markdown file and extract image references
$processedFiles = 0
foreach ($markdownFile in $markdownFiles) {
    $processedFiles++
    $percentage = [math]::Round(($processedFiles / $markdownFiles.Count) * 100, 1)
    Write-Progress -Activity "Scanning Markdown files" -Status "Processing $($markdownFile.Name) ($processedFiles/$($markdownFiles.Count))" -PercentComplete $percentage

    # Read the content of the Markdown file
    $content = Get-Content -Path $markdownFile.FullName -Raw -Encoding UTF8

    # Define patterns to match image references in Markdown and HTML
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

    # Extract image references using the patterns
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

# Complete the progress bar for scanning Markdown files
Write-Progress -Activity "Scanning Markdown files" -Completed

# Notify the user about the number of referenced images found
Write-Host "[+] Found $($referencedImages.Count) referenced images" -ForegroundColor Cyan

# Notify the user that the script is checking for missing referenced images
Write-Host "[*] Checking for missing referenced images..." -ForegroundColor Yellow
$missingImages = @()
$checkedImages = 0

# Loop through each referenced image and check if it exists in the images directory
foreach ($referencedImage in $referencedImages.Keys) {
    $checkedImages++
    $percentage = [math]::Round(($checkedImages / $referencedImages.Count) * 100, 1)
    Write-Progress -Activity "Checking referenced images" -Status "Checking $referencedImage ($checkedImages/$($referencedImages.Count))" -PercentComplete $percentage

    $imagePath = Join-Path -Path $ImagesPath -ChildPath $referencedImage
    if (-not (Test-Path -Path $imagePath)) {
        $missingImages += $referencedImage
    }
}

# Complete the progress bar for checking referenced images
Write-Progress -Activity "Checking referenced images" -Completed

# Notify the user about missing referenced images, if any
if ($missingImages.Count -gt 0) {
    Write-Host ""
    Write-Host "[!] WARNING: Found $($missingImages.Count) referenced images that don't exist:" -ForegroundColor Red
    foreach ($missingImage in $missingImages) {
        Write-Host "  [-] $missingImage" -ForegroundColor Red
    }
    Write-Host ""
}

# Initialize a list to store unused images
$unusedImages = @()

# Loop through each image file and check if it is unused
foreach ($imageFile in $imageFiles) {
    $imageName = $imageFile.Name
    if (-not $referencedImages.ContainsKey($imageName)) {
        $unusedImages += $imageFile
    }
}

# Notify the user about unused images, if any
if ($unusedImages.Count -eq 0) {
    Write-Host "[+] Great! All images are in use, no unused images found." -ForegroundColor Green
} else {
    Write-Host "[!] Found $($unusedImages.Count) unused images:" -ForegroundColor Red
    Write-Host ""

    # Calculate the total size of unused images
    $totalSize = 0
    foreach ($unusedImage in $unusedImages) {
        $fileSize = [math]::Round($unusedImage.Length / 1KB, 2)
        $totalSize += $fileSize
        Write-Host "  [-] $($unusedImage.Name) ($fileSize KB)" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "[*] Total unused space: $([math]::Round($totalSize, 2)) KB" -ForegroundColor Magenta
    Write-Host ""

    # Ask the user if unused images should be deleted, with a default value of "N"
    $deleteChoice = Read-Host "Delete unused images? (Y/N, default: N)"
    if ([string]::IsNullOrWhiteSpace($deleteChoice)) {
        $deleteChoice = "N"
    }
    $deleteChoice = $deleteChoice.ToUpper()

    if ($deleteChoice -eq "Y") {
        Write-Host "[*] Deleting unused images..." -ForegroundColor Yellow

        # Initialize counters for tracking deletion results
        $deletedCount = 0
        $deletedSize = 0
        $processedDeletes = 0

        # Loop through each unused image and delete it
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

        # Complete the progress bar for deletion
        Write-Progress -Activity "Deleting unused images" -Completed

        # Notify the user about the deletion results
        Write-Host ""
        Write-Host "[+] Deletion completed! Deleted $deletedCount files, saved $([math]::Round($deletedSize / 1KB, 2)) KB" -ForegroundColor Green
    } else {
        Write-Host "[*] No files were deleted." -ForegroundColor Yellow
    }
}

# Ask the user if the list of referenced images should be displayed, with a default value of "N"
$showReferencedChoice = Read-Host "Show all referenced images list? (Y/N, default: N)"
if ([string]::IsNullOrWhiteSpace($showReferencedChoice)) {
    $showReferencedChoice = "N"
}
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

# Notify the user that the script execution is complete
Write-Host ""
Write-Host "[*] Script execution completed!" -ForegroundColor Cyan
