# make_icon.ps1
# Converts build/icon.png into a multi-size build/icon.ico using System.Drawing
# This bypasses the WebAssembly icon-tool.js that crashes with memory errors.

Add-Type -AssemblyName System.Drawing

$srcPng = Join-Path $PSScriptRoot "build\icon.png"
$outIco = Join-Path $PSScriptRoot "build\icon.ico"

if (-not (Test-Path $srcPng)) {
    Write-Error "Source PNG not found: $srcPng"
    exit 1
}

# Sizes to embed in the ICO (standard Windows icon sizes)
$sizes = @(16, 24, 32, 48, 64, 128, 256)

$srcImg = [System.Drawing.Image]::FromFile($srcPng)

# Build a MemoryStream containing a valid ICO file
$ms = New-Object System.IO.MemoryStream

# ICO header: reserved(2) + type=1(2) + count(2)
$count = $sizes.Count
$ms.Write([byte[]](0,0, 1,0, [byte]$count,0), 0, 6)

# Collect individual PNG blobs
$blobs = @()
foreach ($sz in $sizes) {
    $bm = New-Object System.Drawing.Bitmap($sz, $sz)
    $g  = [System.Drawing.Graphics]::FromImage($bm)
    $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.DrawImage($srcImg, 0, 0, $sz, $sz)
    $g.Dispose()

    $blobMs = New-Object System.IO.MemoryStream
    $bm.Save($blobMs, [System.Drawing.Imaging.ImageFormat]::Png)
    $bm.Dispose()
    $blobs += ,$blobMs.ToArray()
    $blobMs.Dispose()
}

# ICONDIRENTRY offset starts after header(6) + entries(16*count)
$offset = 6 + 16 * $count
foreach ($i in 0..($count-1)) {
    $sz   = $sizes[$i]
    $blob = $blobs[$i]
    $w    = if ($sz -ge 256) { 0 } else { [byte]$sz }
    $h    = if ($sz -ge 256) { 0 } else { [byte]$sz }
    # width(1) height(1) colorCount(1) reserved(1) planes(2) bitCount(2) bytesInRes(4) imageOffset(4)
    $entry = [byte[]]($w, $h, 0, 0, 1,0, 32,0)
    $sizeBytes = [System.BitConverter]::GetBytes([int]$blob.Length)
    $offsetBytes = [System.BitConverter]::GetBytes([int]$offset)
    $ms.Write($entry, 0, 8)
    $ms.Write($sizeBytes, 0, 4)
    $ms.Write($offsetBytes, 0, 4)
    $offset += $blob.Length
}

# Write image data
foreach ($blob in $blobs) {
    $ms.Write($blob, 0, $blob.Length)
}

$srcImg.Dispose()

[System.IO.File]::WriteAllBytes($outIco, $ms.ToArray())
$ms.Dispose()

Write-Host "ICO created: $outIco ($([Math]::Round((Get-Item $outIco).Length/1KB,1)) KB, $count sizes)"
