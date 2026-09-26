<#
.SYNOPSIS
Convert square, fully opaque blog covers to WebP and delete PNG sources after validation.
.EXAMPLE
./scripts/compress_covers.ps1
.EXAMPLE
./scripts/compress_covers.ps1 -InputPath './assets/post/covers/2026-09-05-交易模型.png'
#>
[CmdletBinding(DefaultParameterSetName = 'Folder')]
param(
    [Parameter(ParameterSetName = 'Folder')]
    [string]$InputFolder = (Join-Path $PSScriptRoot '../assets/post/covers'),
    [Parameter(Mandatory, ParameterSetName = 'Files')]
    [string[]]$InputPath,
    [string]$OutputFolder = (Join-Path $PSScriptRoot '../assets/post/covers'),
    [ValidateRange(0, 100)]
    [int]$Quality = 90
)

$ErrorActionPreference = 'Stop'
$encoder = (Get-Command cwebp -ErrorAction Stop).Source
$inspector = (Get-Command webpmux -ErrorAction Stop).Source
$extensions = @('.png', '.jpg', '.jpeg', '.tif', '.tiff', '.bmp')

if ($PSCmdlet.ParameterSetName -eq 'Files') {
    $files = @($InputPath | ForEach-Object {
        $item = Get-Item -LiteralPath $_
        if ($item.PSIsContainer -or $item.Extension.ToLowerInvariant() -notin $extensions) {
            throw "Unsupported cover source: $_"
        }
        $item
    })
} else {
    if (-not (Test-Path -LiteralPath $InputFolder -PathType Container)) {
        throw "Input directory does not exist: $InputFolder"
    }
    # Only current covers; never recurse into archived drafts.
    $files = @(Get-ChildItem -LiteralPath $InputFolder -File |
        Where-Object { $_.Extension.ToLowerInvariant() -in $extensions })
}

$duplicates = @($files | Group-Object BaseName | Where-Object Count -gt 1)
if ($duplicates.Count) { throw "Multiple source files share a cover name: $($duplicates.Name -join ', ')" }
if (-not $files.Count) { Write-Output 'No cover sources to convert.'; return }
New-Item -ItemType Directory -Path $OutputFolder -Force | Out-Null
$destinationRoot = (Get-Item -LiteralPath $OutputFolder).FullName
$failed = 0
$converted = 0
$deletedPng = 0
$sourceBytes = 0L
$outputBytes = 0L

foreach ($file in $files) {
    $destination = Join-Path $destinationRoot ($file.BaseName + '.webp')
    $temporary = Join-Path $destinationRoot ('.cover-' + [guid]::NewGuid().ToString('N') + '.webp')
    try {
        # Match the existing compressor's cwebp workflow, preserving detailed brushwork.
        # Keep alpha during encoding so transparency can be detected, not silently hidden.
        & $encoder -quiet -mt -m 6 -q $Quality $file.FullName -o $temporary
        if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $temporary)) {
            throw "cwebp failed: $($file.Name)"
        }
        $info = (& $inspector -info $temporary 2>&1 | Out-String)
        if ($LASTEXITCODE -ne 0) { throw "Cannot inspect encoded cover: $($file.Name)" }
        if ($info -notmatch 'Canvas size:\s*(\d+)\s*x\s*(\d+)') {
            throw "Cannot read cover dimensions: $($file.Name)"
        }
        if ([int]$Matches[1] -ne [int]$Matches[2]) {
            throw "Cover must be square: $($file.Name)"
        }
        if ($info -match '(?i)transparency|\balpha\b|animation') {
            throw "Cover must be opaque and still; repair its background before conversion: $($file.Name)"
        }
        # A validated temporary output replaces the current WebP; failures preserve it.
        Move-Item -LiteralPath $temporary -Destination $destination -Force
        $bytes = (Get-Item -LiteralPath $destination).Length
        $sourceBytes += $file.Length
        # Delete only the exact PNG source after its validated output is safely in place.
        if ($file.Extension -ieq '.png') {
            Remove-Item -LiteralPath $file.FullName -Force
            $deletedPng++
        }
        $outputBytes += $bytes
        $converted++
        Write-Output ("{0} -> {1} ({2:N0} KB)" -f $file.Name, [IO.Path]::GetFileName($destination), ($bytes / 1KB))
    } catch {
        $failed++
        Write-Warning $_.Exception.Message
    } finally {
        if (Test-Path -LiteralPath $temporary) { Remove-Item -LiteralPath $temporary -Force }
    }
}

Write-Output ("Converted {0}; failed {1}; {2:N1} MB -> {3:N1} MB; deleted {4} validated PNG sources." -f $converted, $failed, ($sourceBytes / 1MB), ($outputBytes / 1MB), $deletedPng)
if ($failed) { throw "$failed cover(s) failed validation or conversion." }
